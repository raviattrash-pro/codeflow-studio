package com.codeflow.studio.controller;

import com.codeflow.studio.dto.GithubIngestRequestDto;
import com.codeflow.studio.dto.ProjectStatusDto;
import com.codeflow.studio.model.Project;
import com.codeflow.studio.model.ProjectDependency;
import com.codeflow.studio.repository.ProjectDependencyRepository;
import com.codeflow.studio.repository.ProjectRepository;
import com.codeflow.studio.service.AnalysisCoordinatorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.InetAddress;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private static final Logger log = LoggerFactory.getLogger(ProjectController.class);
    private static final Pattern SAFE_PROJECT_ID = Pattern.compile("^[a-zA-Z0-9_-]+$");

    private final ProjectRepository projectRepository;
    private final ProjectDependencyRepository dependencyRepository;
    private final AnalysisCoordinatorService coordinatorService;

    @Autowired
    public ProjectController(
            ProjectRepository projectRepository,
            ProjectDependencyRepository dependencyRepository,
            AnalysisCoordinatorService coordinatorService) {
        this.projectRepository = projectRepository;
        this.dependencyRepository = dependencyRepository;
        this.coordinatorService = coordinatorService;
    }

    @PostMapping("/github")
    public ResponseEntity<ProjectStatusDto> ingestGithubRepo(@RequestBody GithubIngestRequestDto request) {
        if (request == null || request.getGithubUrl() == null || request.getGithubUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("GitHub repository URL is required");
        }

        String rawUrl = request.getGithubUrl().trim();
        validateGithubUrlSecurity(rawUrl);

        while (rawUrl.endsWith("/") && rawUrl.length() > 1) {
            rawUrl = rawUrl.substring(0, rawUrl.length() - 1);
        }

        String repoName = "repository";
        int lastSlash = rawUrl.lastIndexOf('/');
        if (lastSlash >= 0 && lastSlash < rawUrl.length() - 1) {
            repoName = rawUrl.substring(lastSlash + 1).replace(".git", "");
        }

        String projectId = "prj_" + UUID.randomUUID().toString().substring(0, 8);

        Project project = Project.builder()
                .id(projectId)
                .name(repoName)
                .sourceType("GITHUB")
                .sourceUrl(rawUrl)
                .status("PROCESSING")
                .progressPercentage(10)
                .build();

        projectRepository.save(project);

        coordinatorService.processGithubProjectAsync(projectId, rawUrl);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(ProjectStatusDto.builder()
                .projectId(projectId)
                .status("PROCESSING")
                .progressPercentage(10)
                .errorDetails(null)
                .build());
    }

    @PostMapping("/upload")
    public ResponseEntity<ProjectStatusDto> uploadZipFile(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }

        String projectId = "prj_" + UUID.randomUUID().toString().substring(0, 8);
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "uploaded-project.zip";

        Project project = Project.builder()
                .id(projectId)
                .name(fileName.replace(".zip", ""))
                .sourceType("ZIP")
                .status("PROCESSING")
                .progressPercentage(10)
                .build();

        projectRepository.save(project);

        try {
            InputStream zipStream = file.getInputStream();
            coordinatorService.processZipProjectAsync(projectId, zipStream);
        } catch (Exception e) {
            log.error("Failed to read uploaded ZIP file", e);
            project.setStatus("FAILED");
            project.setErrorMessage(e.getMessage());
            projectRepository.save(project);
        }

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(ProjectStatusDto.builder()
                .projectId(projectId)
                .status("PROCESSING")
                .progressPercentage(10)
                .build());
    }

    @GetMapping("/{projectId}/status")
    public ResponseEntity<ProjectStatusDto> getStatus(@PathVariable String projectId) {
        if (projectId == null || !SAFE_PROJECT_ID.matcher(projectId).matches()) {
            return ResponseEntity.badRequest().build();
        }
        return projectRepository.findById(projectId)
                .map(p -> ResponseEntity.ok(ProjectStatusDto.builder()
                        .projectId(p.getId())
                        .status(p.getStatus())
                        .progressPercentage(p.getProgressPercentage())
                        .errorDetails(p.getErrorMessage())
                        .completedAt(p.getUpdatedAt())
                        .build()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<Project> getProjectDetails(@PathVariable String projectId) {
        if (projectId == null || !SAFE_PROJECT_ID.matcher(projectId).matches()) {
            return ResponseEntity.badRequest().build();
        }
        return projectRepository.findById(projectId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectRepository.findAll());
    }

    @GetMapping("/{projectId}/dependencies")
    public ResponseEntity<List<ProjectDependency>> getDependencies(@PathVariable String projectId) {
        if (projectId == null || !SAFE_PROJECT_ID.matcher(projectId).matches()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(dependencyRepository.findByProjectId(projectId));
    }

    /**
     * SSRF (Server-Side Request Forgery) Defense Validator (OWASP A10:2021).
     * Rejects loopback, private IP ranges, link-local addresses, and cloud metadata APIs.
     */
    private void validateGithubUrlSecurity(String urlStr) {
        try {
            URI uri = new URI(urlStr);
            String scheme = uri.getScheme();
            if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
                throw new IllegalArgumentException("Invalid URL scheme: only http and https are allowed");
            }
            String host = uri.getHost();
            if (host == null || host.trim().isEmpty()) {
                throw new IllegalArgumentException("Repository URL must specify a valid host");
            }

            InetAddress addr = InetAddress.getByName(host);
            if (addr.isLoopbackAddress() || addr.isSiteLocalAddress() || addr.isLinkLocalAddress() || addr.isAnyLocalAddress()) {
                throw new IllegalArgumentException("Security violation: Access to internal/loopback network addresses is blocked");
            }

            String ip = addr.getHostAddress();
            if (ip.startsWith("169.254.") || ip.startsWith("127.") || ip.equals("0.0.0.0") || ip.startsWith("10.") || ip.startsWith("192.168.")) {
                throw new IllegalArgumentException("Security violation: Access to restricted network addresses is blocked");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid repository URL format: " + e.getMessage());
        }
    }
}
