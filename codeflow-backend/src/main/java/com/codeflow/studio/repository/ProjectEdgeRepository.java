package com.codeflow.studio.repository;

import com.codeflow.studio.model.ProjectEdge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectEdgeRepository extends JpaRepository<ProjectEdge, String> {
    List<ProjectEdge> findByProjectId(String projectId);
    List<ProjectEdge> findBySourceNodeIdOrTargetNodeId(String sourceNodeId, String targetNodeId);
}
