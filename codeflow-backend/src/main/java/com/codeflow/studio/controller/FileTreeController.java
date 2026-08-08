package com.codeflow.studio.controller;

import com.codeflow.studio.model.ProjectFileSnippet;
import com.codeflow.studio.repository.ProjectFileSnippetRepository;
import com.fasterxml.jackson.annotation.JsonInclude;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class FileTreeController {

    private static final Logger logger = LoggerFactory.getLogger(FileTreeController.class);

    private final ProjectFileSnippetRepository repository;

    @Autowired
    public FileTreeController(ProjectFileSnippetRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/api/v1/projects/{projectId}/file-tree")
    public FileTreeResponse getFileTree(@PathVariable("projectId") String projectId) {
        logger.info("Fetching file tree for project: {}", projectId);
        List<ProjectFileSnippet> snippets = repository.findByProjectId(projectId);

        FileTreeResponse root = new FileTreeResponse();
        root.setName("project-root");
        root.setType("folder");
        root.setChildren(new ArrayList<>());
        
        FileTreeStats stats = new FileTreeStats();
        root.setStats(stats);

        int totalFiles = 0;
        int totalFolders = 0;

        for (ProjectFileSnippet snippet : snippets) {
            String path = snippet.getFilePath();
            if (path == null || path.isEmpty()) {
                continue;
            }

            // Normalize path separators
            path = path.replace("\\", "/");
            String[] parts = path.split("/");

            FileTreeResponse currentNode = root;

            for (int i = 0; i < parts.length; i++) {
                String part = parts[i];
                if (part.isEmpty()) continue;

                boolean isLast = (i == parts.length - 1);
                
                FileTreeResponse existingChild = findChild(currentNode, part);
                
                if (existingChild == null) {
                    FileTreeResponse newChild = new FileTreeResponse();
                    newChild.setName(part);
                    
                    if (isLast) {
                        newChild.setType("file");
                        newChild.setLanguage(detectLanguage(part));
                        newChild.setLineCount(snippet.getLineCount());
                        totalFiles++;
                    } else {
                        newChild.setType("folder");
                        newChild.setChildren(new ArrayList<>());
                        totalFolders++;
                    }
                    
                    if (currentNode.getChildren() == null) {
                        currentNode.setChildren(new ArrayList<>());
                    }
                    currentNode.getChildren().add(newChild);
                    currentNode = newChild;
                } else {
                    currentNode = existingChild;
                }
            }
        }

        stats.setTotalFiles(totalFiles);
        stats.setTotalFolders(totalFolders);

        sortTree(root);

        return root;
    }

    private FileTreeResponse findChild(FileTreeResponse node, String name) {
        if (node.getChildren() == null) {
            return null;
        }
        for (FileTreeResponse child : node.getChildren()) {
            if (child.getName().equals(name)) {
                return child;
            }
        }
        return null;
    }

    private void sortTree(FileTreeResponse node) {
        if (node.getChildren() != null && !node.getChildren().isEmpty()) {
            node.getChildren().sort((a, b) -> {
                if ("folder".equals(a.getType()) && "file".equals(b.getType())) {
                    return -1;
                } else if ("file".equals(a.getType()) && "folder".equals(b.getType())) {
                    return 1;
                } else {
                    return a.getName().compareToIgnoreCase(b.getName());
                }
            });
            for (FileTreeResponse child : node.getChildren()) {
                sortTree(child);
            }
        }
    }

    private String detectLanguage(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot == -1 || lastDot == filename.length() - 1) {
            return "plaintext";
        }
        String ext = filename.substring(lastDot + 1).toLowerCase();
        switch (ext) {
            case "java": return "java";
            case "xml": return "xml";
            case "js": return "javascript";
            case "ts": return "typescript";
            case "json": return "json";
            case "html": return "html";
            case "css": return "css";
            case "md": return "markdown";
            case "py": return "python";
            case "sql": return "sql";
            case "sh": return "shell";
            case "yml":
            case "yaml": return "yaml";
            default: return ext;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FileTreeResponse {
        private String name;
        private String type;
        private List<FileTreeResponse> children;
        private String language;
        private Integer lineCount;
        private FileTreeStats stats;

        public FileTreeResponse() {
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public List<FileTreeResponse> getChildren() {
            return children;
        }

        public void setChildren(List<FileTreeResponse> children) {
            this.children = children;
        }

        public String getLanguage() {
            return language;
        }

        public void setLanguage(String language) {
            this.language = language;
        }

        public Integer getLineCount() {
            return lineCount;
        }

        public void setLineCount(Integer lineCount) {
            this.lineCount = lineCount;
        }

        public FileTreeStats getStats() {
            return stats;
        }

        public void setStats(FileTreeStats stats) {
            this.stats = stats;
        }
    }

    public static class FileTreeStats {
        private int totalFolders;
        private int totalFiles;

        public FileTreeStats() {
        }

        public int getTotalFolders() {
            return totalFolders;
        }

        public void setTotalFolders(int totalFolders) {
            this.totalFolders = totalFolders;
        }

        public int getTotalFiles() {
            return totalFiles;
        }

        public void setTotalFiles(int totalFiles) {
            this.totalFiles = totalFiles;
        }
    }
}
