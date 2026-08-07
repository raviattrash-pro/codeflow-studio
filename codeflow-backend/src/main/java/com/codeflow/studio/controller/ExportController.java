package com.codeflow.studio.controller;

import com.codeflow.studio.model.Project;
import com.codeflow.studio.model.ProjectNode;
import com.codeflow.studio.repository.ProjectNodeRepository;
import com.codeflow.studio.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@CrossOrigin(origins = "*")
public class ExportController {

    private final ProjectRepository projectRepository;
    private final ProjectNodeRepository nodeRepository;

    @Autowired
    public ExportController(ProjectRepository projectRepository, ProjectNodeRepository nodeRepository) {
        this.projectRepository = projectRepository;
        this.nodeRepository = nodeRepository;
    }

    @GetMapping("/{projectId}/export/markdown")
    public ResponseEntity<String> exportMarkdownReport(@PathVariable String projectId) {
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        List<ProjectNode> nodes = nodeRepository.findByProjectId(projectId);

        StringBuilder sb = new StringBuilder();
        sb.append("# ").append(project.getName()).append(" — Architecture & Design Specification\n");
        sb.append("Generated automatically by **CodeFlow Studio v2.0** on ").append(java.time.LocalDate.now()).append("\n\n");

        sb.append("## 🛠️ Technology Stack Summary\n");
        sb.append("- **Backend**: ").append(project.getBackendFramework() != null ? project.getBackendFramework() : "Spring Boot 3").append("\n");
        sb.append("- **Frontend**: ").append(project.getFrontendFramework() != null ? project.getFrontendFramework() : "React + TypeScript").append("\n");
        sb.append("- **Database**: ").append(project.getDatabaseType() != null ? project.getDatabaseType() : "PostgreSQL").append("\n");
        sb.append("- **Total Components Analyzed**: ").append(nodes.size()).append("\n\n");

        sb.append("## ⚡ Controller & Endpoint Catalog\n");
        for (ProjectNode n : nodes) {
            if ("SPRING_CONTROLLER".equalsIgnoreCase(n.getNodeType())) {
                sb.append("### ").append(n.getLabel()).append("\n");
                sb.append("- **Endpoint Path**: `").append(n.getHttpMethod() != null ? n.getHttpMethod() : "POST").append(" ").append(n.getEndpointPath() != null ? n.getEndpointPath() : "/api/v1").append("`\n");
                sb.append("- **File Location**: `").append(n.getFilePath() != null ? n.getFilePath() : "N/A").append("`\n\n");
            }
        }

        sb.append("## 🛠️ Service Business Logic Layer\n");
        for (ProjectNode n : nodes) {
            if ("SPRING_SERVICE".equalsIgnoreCase(n.getNodeType())) {
                sb.append("- **").append(n.getLabel()).append("**: Encapsulates `@Transactional` domain rules and orchestrates repository persistence.\n");
            }
        }
        sb.append("\n");

        sb.append("## 🗄️ Database Repository & Entity Mapping\n");
        for (ProjectNode n : nodes) {
            if ("SPRING_REPOSITORY".equalsIgnoreCase(n.getNodeType()) || "DB_TABLE".equalsIgnoreCase(n.getNodeType())) {
                sb.append("- **").append(n.getLabel()).append("**: Target Entity `").append(n.getTargetEntity() != null ? n.getTargetEntity() : "Entity").append("`\n");
            }
        }

        String markdownContent = sb.toString();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + project.getName() + "-ARCHITECTURE.md\"")
                .contentType(MediaType.TEXT_MARKDOWN)
                .body(markdownContent);
    }
}
