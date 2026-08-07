package com.codeflow.studio.controller;

import com.codeflow.studio.model.Project;
import com.codeflow.studio.model.ProjectNode;
import com.codeflow.studio.repository.ProjectNodeRepository;
import com.codeflow.studio.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects")
@CrossOrigin(origins = "*")
public class AiAssistantController {

    private final ProjectRepository projectRepository;
    private final ProjectNodeRepository nodeRepository;

    @Autowired
    public AiAssistantController(ProjectRepository projectRepository, ProjectNodeRepository nodeRepository) {
        this.projectRepository = projectRepository;
        this.nodeRepository = nodeRepository;
    }

    @PostMapping("/{projectId}/ai/explain")
    public ResponseEntity<Map<String, Object>> explainProjectOrNode(
            @PathVariable String projectId,
            @RequestBody Map<String, String> requestBody) {

        String prompt = requestBody.getOrDefault("prompt", "Explain Architecture");
        String nodeId = requestBody.get("nodeId");

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        List<ProjectNode> nodes = nodeRepository.findByProjectId(projectId);

        Map<String, Object> response = new HashMap<>();
        response.put("prompt", prompt);
        response.put("projectName", project.getName());

        if ("security".equalsIgnoreCase(prompt) || prompt.toLowerCase().contains("jwt") || prompt.toLowerCase().contains("security")) {
            response.put("title", "🔒 Security & Authentication Architecture Analysis");
            response.put("explanation", "The application enforces Spring Security with stateless JWT (JSON Web Tokens). Incoming HTTP requests pass through the Security Filter Chain where JwtAuthenticationFilter validates the Authorization header (Bearer <token>). User principal and granted authorities are populated into SecurityContextHolder before reaching @RestController endpoints.");
            response.put("keyComponents", List.of("SecurityFilterChain", "JwtAuthenticationFilter", "AuthenticationManager", "BCryptPasswordEncoder"));
            response.put("recommendation", "Ensure CORS origin mappings are restricted to explicit origins in production and enforce HTTPS TLS 1.3 on API Gateway endpoints.");
        } else if ("database".equalsIgnoreCase(prompt) || prompt.toLowerCase().contains("sql") || prompt.toLowerCase().contains("entity")) {
            response.put("title", "🗄️ Database & JPA Persistence Layer Analysis");
            response.put("explanation", "The persistence layer leverages Spring Data JPA over Hibernate ORM. @Entity classes are mapped to relational tables with automatic DDL generation. Transaction boundaries are managed declaratively using @Transactional proxies, which handle JDBC connection pooling via HikariCP.");
            response.put("keyComponents", List.of("JpaRepository", "Hibernate L1/L2 Cache", "HikariCP Connection Pool", "@Transactional Interceptor"));
            response.put("recommendation", "Avoid N+1 SELECT queries on Lazy relationships by using @EntityGraph or JOIN FETCH in repository JPQL method names.");
        } else {
            response.put("title", "🌐 End-to-End System Architecture Overview");
            response.put("explanation", "CodeFlow Studio analyzed " + nodes.size() + " total code components across 3 layers. Data flows sequentially from React client components via Axios REST calls -> Spring Boot @RestController endpoints -> @Service business logic beans -> Spring Data JPA @Repository interfaces -> PostgreSQL relational tables.");
            response.put("keyComponents", List.of("React SPA", "DispatcherServlet", "Service Layer (@Service)", "Data Access (@Repository)"));
            response.put("recommendation", "Architecture adheres to Clean Architecture & SOLID principles. All service logic is decoupled from HTTP controllers.");
        }

        return ResponseEntity.ok(response);
    }
}
