package com.codeflow.studio.repository;

import com.codeflow.studio.model.ExecutionTrace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExecutionTraceRepository extends JpaRepository<ExecutionTrace, String> {
    List<ExecutionTrace> findByProjectIdOrderByTimestampDesc(String projectId);
}
