package com.codeflow.studio.repository;

import com.codeflow.studio.model.ProjectDependency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectDependencyRepository extends JpaRepository<ProjectDependency, String> {
    List<ProjectDependency> findByProjectId(String projectId);
}
