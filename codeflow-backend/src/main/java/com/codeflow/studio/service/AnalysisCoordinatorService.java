package com.codeflow.studio.service;

import com.codeflow.studio.model.Project;
import com.codeflow.studio.repository.ProjectRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.io.File;
import java.io.InputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AnalysisCoordinatorService {
    private static final Logger log = LoggerFactory.getLogger(AnalysisCoordinatorService.class);
    private final IngestionService ingestionService;
    private final MavenParserService mavenParserService;
    private final JavaParserService javaParserService;
    private final ReactParserService reactParserService;
    private final RelationshipResolverService relationshipResolverService;
    private final ProjectRepository projectRepository;
    private final FileSnippetService fileSnippetService;

    @Autowired
    public AnalysisCoordinatorService(IngestionService ingestionService, 
                                      MavenParserService mavenParserService, 
                                      JavaParserService javaParserService, 
                                      ReactParserService reactParserService, 
                                      RelationshipResolverService relationshipResolverService, 
                                      ProjectRepository projectRepository,
                                      FileSnippetService fileSnippetService) {
        this.ingestionService = ingestionService;
        this.mavenParserService = mavenParserService;
        this.javaParserService = javaParserService;
        this.reactParserService = reactParserService;
        this.relationshipResolverService = relationshipResolverService;
        this.projectRepository = projectRepository;
        this.fileSnippetService = fileSnippetService;
    }

    @Async
    public void processGithubProjectAsync(String projectId, String githubUrl) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return;
        File workspaceDir = null;
        try {
            updateStatus(project, "CLONING", 15);
            workspaceDir = ingestionService.cloneGithubRepository(githubUrl, projectId);
            runAnalysisPipeline(project, workspaceDir);
        } catch (Exception e) {
            log.error("Analysis pipeline failed for project {}", projectId, e);
            project.setStatus("FAILED");
            project.setErrorMessage("Analysis failed: " + e.getMessage());
            projectRepository.save(project);
        } finally {
            if (workspaceDir != null) { ingestionService.cleanupWorkspace(workspaceDir); }
        }
    }

    @Async
    public void processZipProjectAsync(String projectId, InputStream zipStream) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return;
        File workspaceDir = null;
        try {
            updateStatus(project, "PROCESSING", 15);
            workspaceDir = ingestionService.extractZipArchive(zipStream, projectId);
            runAnalysisPipeline(project, workspaceDir);
        } catch (Exception e) {
            log.error("ZIP analysis pipeline failed for project {}", projectId, e);
            project.setStatus("FAILED");
            project.setErrorMessage("ZIP extraction/analysis failed: " + e.getMessage());
            projectRepository.save(project);
        } finally {
            if (workspaceDir != null) { ingestionService.cleanupWorkspace(workspaceDir); }
        }
    }

    private void runAnalysisPipeline(Project project, File workspaceDir) {
        updateStatus(project, "PARSING_POM", 30);
        mavenParserService.parseProjectDependencies(workspaceDir, project);
        updateStatus(project, "PARSING_JAVA", 55);
        javaParserService.parseJavaSourceFiles(workspaceDir, project);
        updateStatus(project, "PARSING_REACT", 75);
        reactParserService.parseReactSourceFiles(workspaceDir, project);
        updateStatus(project, "RESOLVING_RELATIONSHIPS", 90);
        relationshipResolverService.resolveRelationships(project.getId());
        
        updateStatus(project, "STORING_FILE_SNIPPETS", 95);
        fileSnippetService.storeFileSnippets(workspaceDir, project.getId());
        
        updateStatus(project, "COMPLETED", 100);
    }

    private void updateStatus(Project project, String status, int progress) {
        project.setStatus(status);
        project.setProgressPercentage(progress);
        projectRepository.save(project);
    }
}
