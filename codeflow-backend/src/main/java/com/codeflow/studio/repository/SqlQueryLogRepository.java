package com.codeflow.studio.repository;

import com.codeflow.studio.model.SqlQueryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SqlQueryLogRepository extends JpaRepository<SqlQueryLog, String> {
    List<SqlQueryLog> findByProjectId(String projectId);
    List<SqlQueryLog> findByProjectIdAndRepositoryNameContainingIgnoreCase(String projectId, String repositoryName);
}
