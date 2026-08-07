package com.codeflow.studio.repository;

import com.codeflow.studio.model.ProjectFileSnippet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectFileSnippetRepository extends JpaRepository<ProjectFileSnippet, String> {
    ProjectFileSnippet findByProjectIdAndFilePath(String projectId, String filePath);
    List<ProjectFileSnippet> findByProjectId(String projectId);
}
