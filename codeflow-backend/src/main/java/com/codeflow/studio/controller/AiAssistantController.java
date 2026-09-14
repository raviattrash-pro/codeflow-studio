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
@CrossOrigin(origins = "*")
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
        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        try {
            String aiResponseText = aiService.generateAiResponse(projectId, prompt, "ARCHITECTURE");
            if (aiResponseText.startsWith("AI provider not configured")) {
                return ResponseEntity.ok(aiService.buildFallbackResponse(prompt, projectId));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("prompt", prompt);
            response.put("projectName", project.getName());
            response.put("title", "Architecture Analysis");
            response.put("explanation", aiResponseText);
            response.put("keyComponents", java.util.List.of("AI Generated Analysis"));
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

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        try {
            String aiResponseText = aiService.generateAiResponse(projectId, prompt, "CODE_REVIEW");
            if (aiResponseText.startsWith("AI provider not configured")) {
                return ResponseEntity.ok(aiService.buildFallbackResponse(prompt, projectId));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("title", "Code Review");
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

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        try {
            String aiResponseText = aiService.generateAiResponse(projectId, prompt, "INTERVIEW");
            if (aiResponseText.startsWith("AI provider not configured")) {
                return ResponseEntity.ok(aiService.buildFallbackResponse(prompt, projectId));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("title", "Interview Questions");
            response.put("explanation", aiResponseText);
            response.put("keyComponents", java.util.List.of(nodeName));
            response.put("recommendation", "Practice these questions.");
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

        Project project = projectRepository.findById(projectId).orElse(null);
        if (project == null) return ResponseEntity.notFound().build();

        try {
            String aiResponseText = aiService.generateAiResponse(projectId, prompt, "SQL_OPTIMIZE");
            if (aiResponseText.startsWith("AI provider not configured")) {
                return ResponseEntity.ok(aiService.buildFallbackResponse(prompt, projectId));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("title", "SQL Optimization");
            response.put("explanation", aiResponseText);
            response.put("keyComponents", java.util.List.of("SQL Query"));
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
