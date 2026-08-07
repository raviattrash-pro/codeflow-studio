package com.codeflow.studio.repository;

import com.codeflow.studio.model.ProjectNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectNodeRepository extends JpaRepository<ProjectNode, String> {
    List<ProjectNode> findByProjectId(String projectId);
    List<ProjectNode> findByProjectIdAndLayer(String projectId, String layer);
    List<ProjectNode> findByProjectIdAndLabelContainingIgnoreCase(String projectId, String query);
}
