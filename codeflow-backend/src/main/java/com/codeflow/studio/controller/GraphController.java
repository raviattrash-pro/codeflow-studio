package com.codeflow.studio.controller;

import com.codeflow.studio.dto.GraphResponseDto;
import com.codeflow.studio.dto.NodeDetailDto;
import com.codeflow.studio.model.ProjectEdge;
import com.codeflow.studio.model.ProjectNode;
import com.codeflow.studio.repository.ProjectEdgeRepository;
import com.codeflow.studio.repository.ProjectNodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequestMapping("/api/v1/projects")
@CrossOrigin(origins = "*")
public class GraphController {

    private final ProjectNodeRepository nodeRepository;
    private final ProjectEdgeRepository edgeRepository;

    @Autowired
    public GraphController(
            ProjectNodeRepository nodeRepository,
            ProjectEdgeRepository edgeRepository) {
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
    }

    @GetMapping("/{projectId}/graph")
    public ResponseEntity<GraphResponseDto> getFlowGraph(@PathVariable String projectId) {
        List<ProjectNode> nodes = nodeRepository.findByProjectId(projectId);
        List<ProjectEdge> edges = edgeRepository.findByProjectId(projectId);

        List<GraphResponseDto.ReactFlowNode> reactNodes = new ArrayList<>();
        List<GraphResponseDto.ReactFlowEdge> reactEdges = new ArrayList<>();

        Map<String, Double> layerYMap = Map.of(
                "FRONTEND", 50.0,
                "BACKEND", 250.0,
                "DATABASE", 450.0,
                "DEPENDENCY", 650.0
        );

        Map<String, Integer> layerXCount = new HashMap<>();

        for (ProjectNode n : nodes) {
            String layer = n.getLayer() != null ? n.getLayer() : "BACKEND";
            int count = layerXCount.getOrDefault(layer, 0);
            layerXCount.put(layer, count + 1);

            double xPos = 100 + (count * 280);
            double yPos = layerYMap.getOrDefault(layer, 200.0);

            Map<String, Object> dataMap = new HashMap<>();
            dataMap.put("label", n.getLabel());
            dataMap.put("layer", n.getLayer());
            dataMap.put("nodeType", n.getNodeType());
            dataMap.put("filePath", n.getFilePath());
            dataMap.put("httpMethod", n.getHttpMethod());
            dataMap.put("endpointPath", n.getEndpointPath());
            dataMap.put("annotations", n.getAnnotationsCsv());
            dataMap.put("methodName", n.getMethodName());
            dataMap.put("targetEntity", n.getTargetEntity());

            String flowType = convertType(n.getNodeType());

            reactNodes.add(GraphResponseDto.ReactFlowNode.builder()
                    .id(n.getId())
                    .type(flowType)
                    .data(dataMap)
                    .position(new GraphResponseDto.Position(xPos, yPos))
                    .build());
        }

        for (ProjectEdge e : edges) {
            reactEdges.add(GraphResponseDto.ReactFlowEdge.builder()
                    .id(e.getId())
                    .source(e.getSourceNodeId())
                    .target(e.getTargetNodeId())
                    .label(e.getEdgeLabel())
                    .animated(true)
                    .type("smoothstep")
                    .build());
        }

        return ResponseEntity.ok(GraphResponseDto.builder()
                .nodes(reactNodes)
                .edges(reactEdges)
                .build());
    }

    @GetMapping("/{projectId}/nodes/{nodeId}")
    public ResponseEntity<NodeDetailDto> getNodeDetails(@PathVariable String projectId, @PathVariable String nodeId) {
        ProjectNode node = nodeRepository.findById(nodeId).orElse(null);
        if (node == null) return ResponseEntity.notFound().build();

        List<ProjectEdge> edges = edgeRepository.findBySourceNodeIdOrTargetNodeId(nodeId, nodeId);

        Set<String> calledByIds = new HashSet<>();
        Set<String> callsIds = new HashSet<>();

        for (ProjectEdge e : edges) {
            if (e.getTargetNodeId().equals(nodeId)) {
                calledByIds.add(e.getSourceNodeId());
            } else if (e.getSourceNodeId().equals(nodeId)) {
                callsIds.add(e.getTargetNodeId());
            }
        }

        List<ProjectNode> calledBy = nodeRepository.findAllById(calledByIds);
        List<ProjectNode> calls = nodeRepository.findAllById(callsIds);

        NodeDetailDto.EducationalExplanation explanation = NodeDetailDto.EducationalExplanation.builder()
                .purpose(generatePurpose(node))
                .frameworkRole("Central component in the " + node.getLayer() + " layer.")
                .interviewQuestions(generateQuestions(node))
                .build();

        return ResponseEntity.ok(NodeDetailDto.builder()
                .node(node)
                .calledBy(calledBy)
                .calls(calls)
                .educationalContext(explanation)
                .build());
    }

    @GetMapping("/{projectId}/search")
    public ResponseEntity<List<ProjectNode>> searchProjectNodes(@PathVariable String projectId, @RequestParam("q") String query) {
        return ResponseEntity.ok(nodeRepository.findByProjectIdAndLabelContainingIgnoreCase(projectId, query));
    }

    private String convertType(String nodeType) {
        if ("REACT_COMPONENT".equalsIgnoreCase(nodeType)) return "reactComponent";
        if ("SPRING_CONTROLLER".equalsIgnoreCase(nodeType)) return "springController";
        if ("SPRING_SERVICE".equalsIgnoreCase(nodeType)) return "springService";
        if ("SPRING_REPOSITORY".equalsIgnoreCase(nodeType)) return "springRepository";
        if ("DB_TABLE".equalsIgnoreCase(nodeType)) return "dbTable";
        return "defaultNode";
    }

    private String generatePurpose(ProjectNode node) {
        if ("SPRING_CONTROLLER".equalsIgnoreCase(node.getNodeType())) {
            return "Handles HTTP " + (node.getHttpMethod() != null ? node.getHttpMethod() : "") + " requests at " + node.getEndpointPath() + " and routes payload processing to backend services.";
        } else if ("SPRING_SERVICE".equalsIgnoreCase(node.getNodeType())) {
            return "Encapsulates core business rules, transactional boundaries (@Transactional), and orchestrates repositories.";
        } else if ("SPRING_REPOSITORY".equalsIgnoreCase(node.getNodeType())) {
            return "Spring Data JPA Repository providing CRUD and custom SQL queries for entity " + node.getTargetEntity() + ".";
        } else if ("DB_TABLE".equalsIgnoreCase(node.getNodeType())) {
            return "Relational Database Table mapped from JPA Entity " + node.getTargetEntity() + ".";
        }
        return "React UI Component responsible for client rendering and state management.";
    }

    private List<String> generateQuestions(ProjectNode node) {
        if ("SPRING_CONTROLLER".equalsIgnoreCase(node.getNodeType())) {
            return List.of(
                    "What is the difference between @RestController and @Controller in Spring MVC?",
                    "How does Spring DispatcherServlet route incoming requests to @PostMapping handlers?",
                    "How do @Valid and BindingResult work for DTO input validation?"
            );
        } else if ("SPRING_SERVICE".equalsIgnoreCase(node.getNodeType())) {
            return List.of(
                    "How does Spring AOP implement declarative transaction management (@Transactional)?",
                    "What is the difference between REQUIRED and REQUIRES_NEW transaction propagation?",
                    "Why should constructor injection be preferred over @Autowired field injection?"
            );
        }
        return List.of(
                "How does React 18 Virtual DOM reconciliation work?",
                "What is the purpose of useEffect dependency arrays?"
        );
    }
}
