package com.codeflow.studio.controller;

import com.codeflow.studio.model.ProjectNode;
import com.codeflow.studio.repository.ProjectNodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/projects")
@CrossOrigin(origins = "*")
public class ErDiagramController {

    private final ProjectNodeRepository nodeRepository;

    @Autowired
    public ErDiagramController(ProjectNodeRepository nodeRepository) {
        this.nodeRepository = nodeRepository;
    }

    @GetMapping("/{projectId}/er-diagram")
    public ResponseEntity<Map<String, Object>> getErDiagram(@PathVariable String projectId) {
        List<ProjectNode> nodes = nodeRepository.findByProjectId(projectId);

        List<Map<String, Object>> entityTables = new ArrayList<>();
        List<Map<String, Object>> relations = new ArrayList<>();

        for (ProjectNode n : nodes) {
            if ("DB_TABLE".equalsIgnoreCase(n.getNodeType()) || "DATABASE".equalsIgnoreCase(n.getLayer())) {
                Map<String, Object> table = new HashMap<>();
                table.put("id", n.getId());
                table.put("tableName", n.getLabel().toLowerCase());
                table.put("entityName", n.getTargetEntity() != null ? n.getTargetEntity() : n.getLabel());
                table.put("fields", List.of(
                        Map.of("name", "id", "type", "UUID / Long", "primaryKey", true),
                        Map.of("name", "created_at", "type", "TIMESTAMP", "primaryKey", false),
                        Map.of("name", "updated_at", "type", "TIMESTAMP", "primaryKey", false),
                        Map.of("name", "status", "type", "VARCHAR(50)", "primaryKey", false)
                ));
                entityTables.add(table);
            }
        }

        if (entityTables.isEmpty()) {
            // Default sample entity for preview
            Map<String, Object> u = new HashMap<>();
            u.put("id", "tbl_users");
            u.put("tableName", "users");
            u.put("entityName", "User.java");
            u.put("fields", List.of(
                    Map.of("name", "id", "type", "UUID", "primaryKey", true),
                    Map.of("name", "username", "type", "VARCHAR(100)", "primaryKey", false),
                    Map.of("name", "email", "type", "VARCHAR(255)", "primaryKey", false),
                    Map.of("name", "password_hash", "type", "VARCHAR(255)", "primaryKey", false)
            ));
            entityTables.add(u);

            Map<String, Object> b = new HashMap<>();
            b.put("id", "tbl_bookings");
            b.put("tableName", "bookings");
            b.put("entityName", "Booking.java");
            b.put("fields", List.of(
                    Map.of("name", "id", "type", "UUID", "primaryKey", true),
                    Map.of("name", "user_id", "type", "UUID (FK)", "primaryKey", false),
                    Map.of("name", "amount", "type", "NUMERIC(10,2)", "primaryKey", false),
                    Map.of("name", "status", "type", "VARCHAR(50)", "primaryKey", false)
            ));
            entityTables.add(b);

            relations.add(Map.of(
                    "source", "tbl_users",
                    "target", "tbl_bookings",
                    "type", "@OneToMany",
                    "label", "1 : N (User has Many Bookings)"
            ));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("tables", entityTables);
        result.put("relations", relations);

        return ResponseEntity.ok(result);
    }
}
