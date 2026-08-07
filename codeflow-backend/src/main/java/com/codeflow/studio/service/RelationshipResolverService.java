package com.codeflow.studio.service;

import com.codeflow.studio.model.ProjectEdge;
import com.codeflow.studio.model.ProjectNode;
import com.codeflow.studio.repository.ProjectEdgeRepository;
import com.codeflow.studio.repository.ProjectNodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class RelationshipResolverService {

    private static final Logger log = LoggerFactory.getLogger(RelationshipResolverService.class);

    private final ProjectNodeRepository nodeRepository;
    private final ProjectEdgeRepository edgeRepository;

    @Autowired
    public RelationshipResolverService(
            ProjectNodeRepository nodeRepository,
            ProjectEdgeRepository edgeRepository) {
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
    }

    public void resolveRelationships(String projectId) {
        log.info("Building cross-layer directed relationship graph for project {}", projectId);

        List<ProjectNode> allNodes = nodeRepository.findByProjectId(projectId);
        List<ProjectEdge> edges = new ArrayList<>();

        List<ProjectNode> reactComponents = filterByType(allNodes, "REACT_COMPONENT");
        List<ProjectNode> reactApiCalls = filterByType(allNodes, "REACT_API_CALL");
        List<ProjectNode> controllers = filterByType(allNodes, "SPRING_CONTROLLER");
        List<ProjectNode> services = filterByType(allNodes, "SPRING_SERVICE");
        List<ProjectNode> repositories = filterByType(allNodes, "SPRING_REPOSITORY");
        List<ProjectNode> dbTables = filterByType(allNodes, "DB_TABLE");

        // 1. Link React Component -> React API Call (Same file)
        for (ProjectNode comp : reactComponents) {
            for (ProjectNode apiCall : reactApiCalls) {
                if (comp.getFilePath() != null && comp.getFilePath().equals(apiCall.getFilePath())) {
                    edges.add(createEdge(projectId, comp.getId(), apiCall.getId(), "Invokes API", "FRONTEND_CALL"));
                }
            }
        }

        // 2. Link React API Call -> Spring Controller (Endpoint Path & HTTP Verb matching)
        for (ProjectNode apiCall : reactApiCalls) {
            for (ProjectNode controller : controllers) {
                if (isMatch(apiCall, controller)) {
                    edges.add(createEdge(projectId, apiCall.getId(), controller.getId(), 
                            apiCall.getHttpMethod() + " " + controller.getEndpointPath(), "HTTP_REST"));
                }
            }
        }

        // 3. Link Controller -> Service (Direct Controller -> Service call chain)
        for (ProjectNode controller : controllers) {
            for (ProjectNode service : services) {
                // Match controller package or class name naming pattern
                String domain = extractDomain(controller.getLabel());
                if (!domain.isEmpty() && service.getLabel().toLowerCase().contains(domain.toLowerCase())) {
                    edges.add(createEdge(projectId, controller.getId(), service.getId(), "Delegates to Service", "METHOD_CALL"));
                } else if (services.size() == 1 || controllers.size() == 1) {
                    edges.add(createEdge(projectId, controller.getId(), service.getId(), "Calls Service", "METHOD_CALL"));
                }
            }
        }

        // 4. Link Service -> Repository
        for (ProjectNode service : services) {
            for (ProjectNode repository : repositories) {
                String domain = extractDomain(service.getLabel());
                if (!domain.isEmpty() && repository.getLabel().toLowerCase().contains(domain.toLowerCase())) {
                    edges.add(createEdge(projectId, service.getId(), repository.getId(), "Queries Repository", "REPOSITORY_INJECTION"));
                } else if (repositories.size() == 1) {
                    edges.add(createEdge(projectId, service.getId(), repository.getId(), "Queries Repository", "REPOSITORY_INJECTION"));
                }
            }
        }

        // 5. Link Repository -> DB Table (Target Entity matching)
        for (ProjectNode repo : repositories) {
            for (ProjectNode table : dbTables) {
                if (repo.getTargetEntity() != null && repo.getTargetEntity().equalsIgnoreCase(table.getTargetEntity())) {
                    edges.add(createEdge(projectId, repo.getId(), table.getId(), "Persists to Table", "DB_QUERY"));
                } else if (dbTables.size() == 1) {
                    edges.add(createEdge(projectId, repo.getId(), table.getId(), "Persists to Table", "DB_QUERY"));
                }
            }
        }

        edgeRepository.saveAll(edges);
        log.info("Saved {} relationship edges for project {}", edges.size(), projectId);
    }

    private List<ProjectNode> filterByType(List<ProjectNode> nodes, String type) {
        List<ProjectNode> list = new ArrayList<>();
        for (ProjectNode n : nodes) {
            if (n.getNodeType().equalsIgnoreCase(type)) {
                list.add(n);
            }
        }
        return list;
    }

    private boolean isMatch(ProjectNode apiCall, ProjectNode controller) {
        if (apiCall.getEndpointPath() == null || controller.getEndpointPath() == null) return false;
        
        String clientPath = apiCall.getEndpointPath().trim().toLowerCase();
        String serverPath = controller.getEndpointPath().trim().toLowerCase();

        // Exact match or wildcard path match
        if (clientPath.equals(serverPath)) return true;
        
        // Strip path params like /users/123 vs /users/{id}
        String clientNormalized = clientPath.replaceAll("/[0-9]+", "/{id}");
        if (clientNormalized.equals(serverPath)) return true;

        return clientPath.contains(serverPath) || serverPath.contains(clientPath);
    }

    private String extractDomain(String label) {
        if (label == null) return "";
        return label.replaceAll("Controller|Service|Repository|\\.java|\\(\\)", "").trim();
    }

    private ProjectEdge createEdge(String projectId, String sourceId, String targetId, String label, String callType) {
        return ProjectEdge.builder()
                .id(UUID.randomUUID().toString())
                .projectId(projectId)
                .sourceNodeId(sourceId)
                .targetNodeId(targetId)
                .edgeLabel(label)
                .callType(callType)
                .build();
    }
}
