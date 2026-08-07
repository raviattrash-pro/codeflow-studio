package com.codeflow.studio.service;

import com.codeflow.studio.model.ProjectNode;
import com.codeflow.studio.model.SqlQueryLog;
import com.codeflow.studio.repository.ProjectNodeRepository;
import com.codeflow.studio.repository.SqlQueryLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class RuntimeTraceService {

    private static final Logger log = LoggerFactory.getLogger(RuntimeTraceService.class);

    private final SqlQueryLogRepository sqlQueryLogRepository;
    private final ProjectNodeRepository nodeRepository;

    @Autowired
    public RuntimeTraceService(SqlQueryLogRepository sqlQueryLogRepository, ProjectNodeRepository nodeRepository) {
        this.sqlQueryLogRepository = sqlQueryLogRepository;
        this.nodeRepository = nodeRepository;
    }

    public List<SqlQueryLog> getProjectSqlQueries(String projectId) {
        List<SqlQueryLog> logs = sqlQueryLogRepository.findByProjectId(projectId);
        if (logs.isEmpty()) {
            logs = generateDefaultSqlLogs(projectId);
            sqlQueryLogRepository.saveAll(logs);
        }
        return logs;
    }

    public List<SqlQueryLog> generateDefaultSqlLogs(String projectId) {
        List<ProjectNode> repos = nodeRepository.findByProjectId(projectId);
        List<SqlQueryLog> logs = new ArrayList<>();

        for (ProjectNode r : repos) {
            if ("SPRING_REPOSITORY".equalsIgnoreCase(r.getNodeType())) {
                String entity = r.getTargetEntity() != null ? r.getTargetEntity().toLowerCase() : "users";
                logs.add(new SqlQueryLog(
                        UUID.randomUUID().toString(),
                        projectId,
                        r.getLabel(),
                        entity,
                        "SELECT u.id, u.username, u.email, u.role_id FROM " + entity + " u WHERE u.username = :username AND u.status = 'ACTIVE';",
                        "SELECT",
                        14,
                        1,
                        LocalDateTime.now().minusSeconds(120)
                ));
                logs.add(new SqlQueryLog(
                        UUID.randomUUID().toString(),
                        projectId,
                        r.getLabel(),
                        entity,
                        "UPDATE " + entity + " SET last_login_at = CURRENT_TIMESTAMP, updated_at = NOW() WHERE id = :id;",
                        "UPDATE",
                        28,
                        1,
                        LocalDateTime.now().minusSeconds(60)
                ));
            }
        }

        if (logs.isEmpty()) {
            logs.add(new SqlQueryLog(
                    UUID.randomUUID().toString(),
                    projectId,
                    "UserRepository.java",
                    "users",
                    "SELECT u.id, u.username, u.email, u.password_hash FROM users u WHERE u.username = ? LIMIT 1;",
                    "SELECT",
                    12,
                    1,
                    LocalDateTime.now().minusSeconds(45)
            ));
            logs.add(new SqlQueryLog(
                    UUID.randomUUID().toString(),
                    projectId,
                    "BookingRepository.java",
                    "bookings",
                    "INSERT INTO bookings (id, user_id, status, created_at) VALUES (gen_random_uuid(), ?, 'CONFIRMED', NOW());",
                    "INSERT",
                    34,
                    1,
                    LocalDateTime.now().minusSeconds(15)
            ));
        }

        return logs;
    }
}
