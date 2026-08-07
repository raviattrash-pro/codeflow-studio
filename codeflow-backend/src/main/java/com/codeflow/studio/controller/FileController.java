package com.codeflow.studio.controller;

import com.codeflow.studio.model.Project;
import com.codeflow.studio.model.ProjectFileSnippet;
import com.codeflow.studio.repository.ProjectFileSnippetRepository;
import com.codeflow.studio.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.nio.file.Files;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/v1/projects")
@CrossOrigin(origins = "*")
public class FileController {
    private final ProjectRepository projectRepository;
    private final ProjectFileSnippetRepository projectFileSnippetRepository;
    private final String ephemeralDirBase;

    @Autowired
    public FileController(ProjectRepository projectRepository, 
                          ProjectFileSnippetRepository projectFileSnippetRepository,
                          @Value("${codeflow.ephemeral-dir:${user.home}/.codeflow/scratch}") String ephemeralDirBase) {
        this.projectRepository = projectRepository;
        this.projectFileSnippetRepository = projectFileSnippetRepository;
        this.ephemeralDirBase = ephemeralDirBase;
    }

    @GetMapping("/{projectId}/file")
    public ResponseEntity<Map<String, String>> getFileContent(@PathVariable String projectId, @RequestParam("filePath") String filePath) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        // First try to fetch the snippet from the database
        ProjectFileSnippet snippet = projectFileSnippetRepository.findByProjectIdAndFilePath(projectId, filePath);
        if (snippet != null) {
            return ResponseEntity.ok(Map.of(
                "filePath", filePath,
                "language", snippet.getLanguage() != null ? snippet.getLanguage() : detectLanguage(filePath),
                "content", snippet.getContent() != null ? snippet.getContent() : ""
            ));
        }

        File workspaceDir = new File(ephemeralDirBase, projectId);
        File targetFile = new File(workspaceDir, filePath);
        if (!targetFile.exists() || !targetFile.isFile() || filePath.contains("..")) {
            return ResponseEntity.ok(Map.of("filePath", filePath, "language", detectLanguage(filePath), "content", "// File snippet unavailable or repository cleaned up post-analysis.\n// Path: " + filePath));
        }
        try {
            String content = Files.readString(targetFile.toPath());
            return ResponseEntity.ok(Map.of("filePath", filePath, "language", detectLanguage(filePath), "content", content));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    private String detectLanguage(String filePath) {
        if (filePath.endsWith(".java")) return "java";
        if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) return "typescript";
        if (filePath.endsWith(".jsx") || filePath.endsWith(".js")) return "javascript";
        if (filePath.endsWith(".xml")) return "xml";
        if (filePath.endsWith(".yml") || filePath.endsWith(".yaml")) return "yaml";
        if (filePath.endsWith(".json")) return "json";
        return "plaintext";
    }
}
