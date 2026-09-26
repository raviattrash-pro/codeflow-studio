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
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/projects")
public class FileController {

    private static final Logger log = LoggerFactory.getLogger(FileController.class);
    private static final Pattern SAFE_PROJECT_ID = Pattern.compile("^[a-zA-Z0-9_-]+$");

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
    public ResponseEntity<Map<String, String>> getFileContent(
            @PathVariable String projectId, 
            @RequestParam("filePath") String filePath) {

        // Validate projectId against path traversal attempts
        if (projectId == null || !SAFE_PROJECT_ID.matcher(projectId).matches()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid project identifier"));
        }

        if (filePath == null || filePath.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File path is required"));
        }

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        // 1. Try to fetch snippet from the database first
        ProjectFileSnippet snippet = projectFileSnippetRepository.findByProjectIdAndFilePath(projectId, filePath);
        if (snippet != null) {
            return ResponseEntity.ok(Map.of(
                "filePath", filePath,
                "language", snippet.getLanguage() != null ? snippet.getLanguage() : detectLanguage(filePath),
                "content", snippet.getContent() != null ? snippet.getContent() : ""
            ));
        }

        // 2. Fall back to disk with strict canonical path boundary validation
        try {
            File workspaceDir = new File(ephemeralDirBase, projectId);
            File targetFile = new File(workspaceDir, filePath);

            String canonicalWorkspace = workspaceDir.getCanonicalPath();
            String canonicalTarget = targetFile.getCanonicalPath();

            // Strict defense against CWE-22 Path Traversal
            if (!canonicalTarget.startsWith(canonicalWorkspace + File.separator)) {
                log.warn("Path traversal attempt detected. Project: {}, Path: {}", projectId, filePath);
                return ResponseEntity.badRequest().body(Map.of("error", "Access denied: Path traversal detected"));
            }

            if (!targetFile.exists() || !targetFile.isFile()) {
                return ResponseEntity.ok(Map.of(
                    "filePath", filePath, 
                    "language", detectLanguage(filePath), 
                    "content", "// File snippet unavailable or repository cleaned up post-analysis.\n// Path: " + filePath
                ));
            }

            String content = Files.readString(targetFile.toPath());
            return ResponseEntity.ok(Map.of(
                "filePath", filePath, 
                "language", detectLanguage(filePath), 
                "content", content
            ));
        } catch (Exception e) {
            log.error("Error reading file content for project {}: {}", projectId, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to read file"));
        }
    }

    private String detectLanguage(String filePath) {
        if (filePath == null) return "plaintext";
        String lower = filePath.toLowerCase();
        if (lower.endsWith(".java")) return "java";
        if (lower.endsWith(".tsx") || lower.endsWith(".ts")) return "typescript";
        if (lower.endsWith(".jsx") || lower.endsWith(".js")) return "javascript";
        if (lower.endsWith(".xml")) return "xml";
        if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";
        if (lower.endsWith(".json")) return "json";
        if (lower.endsWith(".sql")) return "sql";
        return "plaintext";
    }
}
