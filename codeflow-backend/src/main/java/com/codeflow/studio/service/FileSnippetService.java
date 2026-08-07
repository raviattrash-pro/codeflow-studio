package com.codeflow.studio.service;

import com.codeflow.studio.model.ProjectFileSnippet;
import com.codeflow.studio.repository.ProjectFileSnippetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

@Service
public class FileSnippetService {
    private static final Logger log = LoggerFactory.getLogger(FileSnippetService.class);
    
    private final ProjectFileSnippetRepository snippetRepository;

    @Autowired
    public FileSnippetService(ProjectFileSnippetRepository snippetRepository) {
        this.snippetRepository = snippetRepository;
    }

    public void storeFileSnippets(File workspaceDir, String projectId) {
        try (Stream<Path> paths = Files.walk(Paths.get(workspaceDir.toURI()))) {
            paths.filter(Files::isRegularFile)
                 .filter(this::isAllowedFile)
                 .filter(this::isNotIgnoredDir)
                 .forEach(path -> {
                     try {
                         String content = Files.readString(path);
                         String relativePath = workspaceDir.toPath().relativize(path).toString().replace("\\", "/");
                         
                         ProjectFileSnippet snippet = new ProjectFileSnippet();
                         snippet.setProjectId(projectId);
                         snippet.setFilePath(relativePath);
                         snippet.setLanguage(detectLanguage(relativePath));
                         snippet.setContent(content);
                         snippet.setLineCount(content.split("\r\n|\r|\n").length);
                         
                         snippetRepository.save(snippet);
                     } catch (IOException e) {
                         log.error("Failed to read file for snippet: {}", path, e);
                     }
                 });
        } catch (IOException e) {
            log.error("Failed to walk workspace directory: {}", workspaceDir, e);
        }
    }

    private boolean isAllowedFile(Path path) {
        String fileName = path.getFileName().toString().toLowerCase();
        return fileName.endsWith(".java") ||
               fileName.endsWith(".tsx") ||
               fileName.endsWith(".ts") ||
               fileName.endsWith(".jsx") ||
               fileName.endsWith(".js") ||
               fileName.endsWith(".xml") ||
               fileName.endsWith(".yml") ||
               fileName.endsWith(".yaml") ||
               fileName.endsWith(".json");
    }
    
    private boolean isNotIgnoredDir(Path path) {
        String pathStr = path.toString().replace("\\", "/");
        return !pathStr.contains("/node_modules/") &&
               !pathStr.contains("/.git/") &&
               !pathStr.contains("/target/") &&
               !pathStr.contains("/build/");
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
