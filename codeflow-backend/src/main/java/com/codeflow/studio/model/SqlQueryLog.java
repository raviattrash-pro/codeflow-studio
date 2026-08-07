package com.codeflow.studio.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "sql_query_logs")
public class SqlQueryLog {

    @Id
    private String id;

    @Column(nullable = false)
    private String projectId;

    @Column(nullable = false)
    private String repositoryName;

    @Column(nullable = false)
    private String targetTable;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String sqlQuery;

    private String queryType; // SELECT, INSERT, UPDATE, DELETE

    private long executionTimeMs;

    private int rowsReturned;

    private LocalDateTime timestamp;

    public SqlQueryLog() {
    }

    public SqlQueryLog(String id, String projectId, String repositoryName, String targetTable, String sqlQuery, String queryType, long executionTimeMs, int rowsReturned, LocalDateTime timestamp) {
        this.id = id;
        this.projectId = projectId;
        this.repositoryName = repositoryName;
        this.targetTable = targetTable;
        this.sqlQuery = sqlQuery;
        this.queryType = queryType;
        this.executionTimeMs = executionTimeMs;
        this.rowsReturned = rowsReturned;
        this.timestamp = timestamp;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getRepositoryName() {
        return repositoryName;
    }

    public void setRepositoryName(String repositoryName) {
        this.repositoryName = repositoryName;
    }

    public String getTargetTable() {
        return targetTable;
    }

    public void setTargetTable(String targetTable) {
        this.targetTable = targetTable;
    }

    public String getSqlQuery() {
        return sqlQuery;
    }

    public void setSqlQuery(String sqlQuery) {
        this.sqlQuery = sqlQuery;
    }

    public String getQueryType() {
        return queryType;
    }

    public void setQueryType(String queryType) {
        this.queryType = queryType;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public int getRowsReturned() {
        return rowsReturned;
    }

    public void setRowsReturned(int rowsReturned) {
        this.rowsReturned = rowsReturned;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
