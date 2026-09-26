package com.codeflow.studio.controller;

import com.codeflow.studio.model.Project;
import com.codeflow.studio.repository.ProjectRepository;
import com.codeflow.studio.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AiAssistantController {

    private final ProjectRepository projectRepository;
    private final AiService aiService;

    @Autowired
    public AiAssistantController(ProjectRepository projectRepository, AiService aiService) {
        this.projectRepository = projectRepository;
        this.aiService = aiService;
    }

    @PostMapping("/api/v1/projects/{projectId}/ai/explain")
    public ResponseEntity<Map<String, Object>> explainProjectOrNode(
            @PathVariable String projectId,
            @RequestBody Map<String, String> requestBody) {

        String prompt = requestBody.getOrDefault("prompt", "Explain Architecture");
        String analysisType = requestBody.getOrDefault("analysisType", "ARCHITECTURE");
        String customProvider = requestBody.get("provider");
        String customApiKey = requestBody.get("apiKey");
        String customModel = requestBody.get("model");
        String customOllamaUrl = requestBody.get("ollamaUrl");

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        try {
            String aiResponseText = aiService.generateAiResponse(
                projectId, prompt, analysisType, customProvider, customApiKey, customModel, customOllamaUrl
            );
            if (aiResponseText.startsWith("AI provider not configured") || "free".equalsIgnoreCase(customProvider) || (customApiKey == null && "none".equalsIgnoreCase(customProvider))) {
                return ResponseEntity.ok(aiService.buildFallbackResponse(prompt, projectId));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("prompt", prompt);
            response.put("projectName", project.getName());
            response.put("title", "Architecture Analysis (" + (customModel != null ? customModel : "AI Engine") + ")");
            response.put("explanation", aiResponseText);
            response.put("keyComponents", java.util.List.of("Live AI Architecture Synthesis"));
            response.put("recommendation", "Review the AI explanation above.");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(aiService.buildFallbackResponse(prompt, projectId));
        }
    }

    @PostMapping("/api/v1/projects/{projectId}/ai/code-review")
    public ResponseEntity<Map<String, Object>> codeReview(
            @PathVariable String projectId,
            @RequestBody Map<String, String> requestBody) {

        String filePath = requestBody.getOrDefault("filePath", "");
        String prompt = "Review code for file: " + filePath;
        String customProvider = requestBody.get("provider");
        String customApiKey = requestBody.get("apiKey");
        String customModel = requestBody.get("model");
        String customOllamaUrl = requestBody.get("ollamaUrl");

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        try {
            String aiResponseText = aiService.generateAiResponse(
                projectId, prompt, "CODE_REVIEW", customProvider, customApiKey, customModel, customOllamaUrl
            );
            if (aiResponseText.startsWith("AI provider not configured")) {
                return ResponseEntity.ok(aiService.buildFallbackResponse(prompt, projectId));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("title", "Code Review: " + filePath);
            response.put("explanation", aiResponseText);
            response.put("keyComponents", java.util.List.of(filePath));
            response.put("recommendation", "Consider the suggested improvements.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(aiService.buildFallbackResponse(prompt, projectId));
        }
    }

    @PostMapping("/api/v1/projects/{projectId}/ai/interview-questions")
    public ResponseEntity<Map<String, Object>> interviewQuestions(
            @PathVariable String projectId,
            @RequestBody Map<String, String> requestBody) {

        String nodeType = requestBody.getOrDefault("nodeType", "");
        String nodeName = requestBody.getOrDefault("nodeName", "");
        String prompt = "Generate interview questions for " + nodeType + " " + nodeName;
        String customProvider = requestBody.get("provider");
        String customApiKey = requestBody.get("apiKey");
        String customModel = requestBody.get("model");
        String customOllamaUrl = requestBody.get("ollamaUrl");

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        try {
            String aiResponseText = aiService.generateAiResponse(
                projectId, prompt, "INTERVIEW", customProvider, customApiKey, customModel, customOllamaUrl
            );
            if (aiResponseText.startsWith("AI provider not configured")) {
                return ResponseEntity.ok(aiService.buildFallbackResponse(prompt, projectId));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("title", "Interview Questions for " + nodeName);
            response.put("explanation", aiResponseText);
            response.put("keyComponents", java.util.List.of(nodeName));
            response.put("recommendation", "Practice explaining the internal working and lifecycle of this component.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(aiService.buildFallbackResponse(prompt, projectId));
        }
    }

    @PostMapping("/api/v1/projects/{projectId}/ai/sql-optimize")
    public ResponseEntity<Map<String, Object>> sqlOptimize(
            @PathVariable String projectId,
            @RequestBody Map<String, String> requestBody) {

        String query = requestBody.getOrDefault("query", "");
        String duration = requestBody.getOrDefault("duration", "");
        String prompt = "Optimize SQL query: " + query + " which took " + duration;
        String customProvider = requestBody.get("provider");
        String customApiKey = requestBody.get("apiKey");
        String customModel = requestBody.get("model");
        String customOllamaUrl = requestBody.get("ollamaUrl");

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        try {
            String aiResponseText = aiService.generateAiResponse(
                projectId, prompt, "SQL_OPTIMIZE", customProvider, customApiKey, customModel, customOllamaUrl
            );
            if (aiResponseText.startsWith("AI provider not configured")) {
                return ResponseEntity.ok(aiService.buildFallbackResponse(prompt, projectId));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("title", "SQL Optimization Report");
            response.put("explanation", aiResponseText);
            response.put("keyComponents", java.util.List.of("Captured Query (" + duration + ")"));
            response.put("recommendation", "Apply the suggested indexes or query rewrites.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.ok(aiService.buildFallbackResponse(prompt, projectId));
        }
    }

    @GetMapping("/api/v1/ai/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(aiService.getProviderStatus());
    }
}
