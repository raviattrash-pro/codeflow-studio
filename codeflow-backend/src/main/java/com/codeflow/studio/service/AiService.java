package com.codeflow.studio.service;

import com.codeflow.studio.config.AiConfigProperties;
import com.codeflow.studio.model.ProjectDependency;
import com.codeflow.studio.model.ProjectEdge;
import com.codeflow.studio.model.ProjectNode;
import com.codeflow.studio.model.SqlQueryLog;
import com.codeflow.studio.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiService {

    private final AiConfigProperties aiConfig;
    private final ProjectRepository projectRepository;
    private final ProjectNodeRepository nodeRepository;
    private final ProjectEdgeRepository edgeRepository;
    private final ProjectDependencyRepository dependencyRepository;
    private final SqlQueryLogRepository sqlQueryLogRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public AiService(AiConfigProperties aiConfig,
                     ProjectRepository projectRepository,
                     ProjectNodeRepository nodeRepository,
                     ProjectEdgeRepository edgeRepository,
                     ProjectDependencyRepository dependencyRepository,
                     SqlQueryLogRepository sqlQueryLogRepository,
                     ObjectMapper objectMapper) {
        this.aiConfig = aiConfig;
        this.projectRepository = projectRepository;
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
        this.dependencyRepository = dependencyRepository;
        this.sqlQueryLogRepository = sqlQueryLogRepository;
        this.webClient = WebClient.builder().build();
        this.objectMapper = objectMapper;
    }

    public String buildCodebaseContext(String projectId) {
        StringBuilder sb = new StringBuilder();

        List<ProjectNode> nodes = nodeRepository.findByProjectId(projectId);
        sb.append("Nodes:\n");
        for (ProjectNode node : nodes) {
            sb.append("- ").append(node.getLabel()).append(" (")
              .append(node.getNodeType()).append(") in layer ")
              .append(node.getLayer()).append(". Annotations: ")
              .append(node.getAnnotationsCsv()).append("\n");
        }

        List<ProjectDependency> dependencies = dependencyRepository.findByProjectId(projectId);
        sb.append("\nDependencies:\n");
        for (ProjectDependency dep : dependencies) {
            sb.append("- ").append(dep.getArtifactId()).append(" (")
              .append(dep.getScope()).append(")\n");
        }

        List<ProjectEdge> edges = edgeRepository.findByProjectId(projectId);
        sb.append("\nEdges:\n");
        for (ProjectEdge edge : edges) {
            sb.append("- ").append(edge.getSourceId()).append(" -> ")
              .append(edge.getTargetId()).append(" (")
              .append(edge.getRelationType()).append(")\n");
        }

        List<SqlQueryLog> logs = sqlQueryLogRepository.findByProjectId(projectId);
        sb.append("\nSQL Logs:\n");
        for (SqlQueryLog log : logs) {
            sb.append("- ").append(log.getQueryString()).append(" (")
              .append(log.getExecutionTimeMs()).append("ms)\n");
        }

        String context = sb.toString();
        if (context.length() > aiConfig.getMaxContextTokens()) {
            return context.substring(0, aiConfig.getMaxContextTokens()) + "... (truncated)";
        }
        return context;
    }

    public String generateAiResponse(String projectId, String userPrompt, String analysisType) {
        return generateAiResponse(projectId, userPrompt, analysisType, null, null, null, null);
    }

    public String generateAiResponse(String projectId, String userPrompt, String analysisType,
                                     String customProvider, String customApiKey, String customModel, String customOllamaUrl) {
        String activeProvider = (customProvider != null && !customProvider.trim().isEmpty()) 
            ? customProvider : aiConfig.getProvider();
        String activeApiKey = (customApiKey != null && !customApiKey.trim().isEmpty()) 
            ? customApiKey : aiConfig.getApiKey();
        String activeModel = (customModel != null && !customModel.trim().isEmpty()) 
            ? customModel : aiConfig.getModel();
        String activeOllamaUrl = (customOllamaUrl != null && !customOllamaUrl.trim().isEmpty()) 
            ? customOllamaUrl : aiConfig.getOllamaUrl();

        if ("none".equalsIgnoreCase(activeProvider) || "free".equalsIgnoreCase(activeProvider)) {
            return fallbackResponseString(userPrompt, projectId);
        }

        String codebaseContext = buildCodebaseContext(projectId);
        String systemPrompt = String.format(
            "You are an expert Spring Boot + React 19 architecture analyst for CodeFlow Studio.\n" +
            "Analysis Type: %s\n\n" +
            "Project Codebase Context:\n%s\n\n" +
            "Provide a detailed, technical analysis. Include specific file names, class names, and annotation references from the codebase context above. Structure your response with clear sections.",
            analysisType, codebaseContext
        );

        try {
            switch (activeProvider.toLowerCase()) {
                case "gemini":
                    return callGemini(systemPrompt, userPrompt, activeApiKey, activeModel);
                case "openai":
                    return callOpenAi(systemPrompt, userPrompt, activeApiKey, activeModel);
                case "ollama":
                    return callOllama(systemPrompt, userPrompt, activeOllamaUrl, activeModel);
                default:
                    return fallbackResponseString(userPrompt, projectId);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return fallbackResponseString(userPrompt, projectId);
        }
    }

    private String callGemini(String systemPrompt, String userPrompt, String apiKey, String model) throws JsonProcessingException {
        String effectiveModel = (model != null && !model.isEmpty()) ? model : "gemini-2.0-flash";
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + effectiveModel + ":generateContent?key=" + apiKey;
        String fullPrompt = systemPrompt + "\n\nUser Request: " + userPrompt;
        
        Map<String, Object> body = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", fullPrompt)
                ))
            ),
            "generationConfig", Map.of(
                "temperature", aiConfig.getTemperature()
            )
        );

        String response = webClient.post()
            .uri(url)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(String.class)
            .block();

        try {
            Map<String, Object> resMap = objectMapper.readValue(response, Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) resMap.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            return response;
        }
    }

    private String callOpenAi(String systemPrompt, String userPrompt, String apiKey, String model) throws JsonProcessingException {
        String effectiveModel = (model != null && !model.isEmpty()) ? model : "gpt-4o-mini";
        String url = "https://api.openai.com/v1/chat/completions";
        
        Map<String, Object> body = Map.of(
            "model", effectiveModel,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            ),
            "temperature", aiConfig.getTemperature()
        );

        String response = webClient.post()
            .uri(url)
            .header("Authorization", "Bearer " + apiKey)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(String.class)
            .block();

        try {
            Map<String, Object> resMap = objectMapper.readValue(response, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) resMap.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            return response;
        }
    }

    private String callOllama(String systemPrompt, String userPrompt, String ollamaUrl, String model) throws JsonProcessingException {
        String effectiveUrl = (ollamaUrl != null && !ollamaUrl.isEmpty()) ? ollamaUrl : "http://localhost:11434";
        String effectiveModel = (model != null && !model.isEmpty()) ? model : "codellama";
        String url = effectiveUrl + "/api/generate";
        String fullPrompt = systemPrompt + "\n\nUser Request: " + userPrompt;
        
        Map<String, Object> body = Map.of(
            "model", effectiveModel,
            "prompt", fullPrompt,
            "stream", false
        );

        String response = webClient.post()
            .uri(url)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(String.class)
            .block();

        try {
            Map<String, Object> resMap = objectMapper.readValue(response, Map.class);
            return (String) resMap.get("response");
        } catch (Exception e) {
            return response;
        }
    }

    private String fallbackResponseString(String prompt, String projectId) {
        List<ProjectNode> nodes = nodeRepository.findByProjectId(projectId);
        return "AI provider not configured or running in free built-in mode. The project contains " + nodes.size() + " parsed components.";
    }

    public Map<String, Object> getProviderStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("provider", aiConfig.getProvider());
        status.put("model", aiConfig.getModel());
        status.put("connected", !"none".equalsIgnoreCase(aiConfig.getProvider()));
        return status;
    }
    
    public Map<String, Object> buildFallbackResponse(String prompt, String projectId) {
        List<ProjectNode> nodes = nodeRepository.findByProjectId(projectId);
        Map<String, Object> response = new HashMap<>();
        response.put("prompt", prompt);
        
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
            response.put("title", "🌐 End-to-End System Architecture Overview (Demo Mode)");
            response.put("explanation", "AI provider not configured. The project contains " + nodes.size() + " parsed components. Data flows sequentially from React client components via Axios REST calls -> Spring Boot @RestController endpoints -> @Service business logic beans -> Spring Data JPA @Repository interfaces -> PostgreSQL relational tables.");
            response.put("keyComponents", List.of("React SPA", "DispatcherServlet", "Service Layer (@Service)", "Data Access (@Repository)"));
            response.put("recommendation", "Architecture adheres to Clean Architecture & SOLID principles. All service logic is decoupled from HTTP controllers.");
        }
        return response;
    }
}
