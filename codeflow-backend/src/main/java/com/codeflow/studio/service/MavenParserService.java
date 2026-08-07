package com.codeflow.studio.service;

import com.codeflow.studio.model.Project;
import com.codeflow.studio.model.ProjectDependency;
import com.codeflow.studio.repository.ProjectDependencyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.maven.model.Dependency;
import org.apache.maven.model.Model;
import org.apache.maven.model.io.xpp3.MavenXpp3Reader;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class MavenParserService {

    private static final Logger log = LoggerFactory.getLogger(MavenParserService.class);

    private final ProjectDependencyRepository dependencyRepository;

    @Autowired
    public MavenParserService(ProjectDependencyRepository dependencyRepository) {
        this.dependencyRepository = dependencyRepository;
    }

    public void parseProjectDependencies(File projectDir, Project project) {
        log.info("Starting Maven pom.xml parsing for project {}", project.getId());
        
        File pomFile = findPomXml(projectDir);
        if (pomFile == null || !pomFile.exists()) {
            log.warn("No pom.xml found in {}", projectDir.getAbsolutePath());
            return;
        }

        try (FileReader reader = new FileReader(pomFile)) {
            MavenXpp3Reader mavenReader = new MavenXpp3Reader();
            Model model = mavenReader.read(reader);

            if (model.getParent() != null && model.getParent().getVersion() != null) {
                project.setBackendVersion(model.getParent().getVersion());
                project.setBackendFramework("Spring Boot");
            }

            if (model.getProperties() != null && model.getProperties().getProperty("java.version") != null) {
                project.setJavaVersion(model.getProperties().getProperty("java.version"));
            } else {
                project.setJavaVersion("21");
            }

            List<ProjectDependency> dependenciesList = new ArrayList<>();
            List<Dependency> mavenDeps = model.getDependencies();

            for (Dependency dep : mavenDeps) {
                String artifactId = dep.getArtifactId();
                String groupId = dep.getGroupId();

                ProjectDependency pDep = ProjectDependency.builder()
                        .id(UUID.randomUUID().toString())
                        .projectId(project.getId())
                        .groupId(groupId)
                        .artifactId(artifactId)
                        .version(dep.getVersion() != null ? dep.getVersion() : "Managed")
                        .scope(dep.getScope() != null ? dep.getScope() : "compile")
                        .purposeSummary(explainDependencyPurpose(artifactId))
                        .commonAnnotations(getCommonAnnotations(artifactId))
                        .build();

                dependenciesList.add(pDep);
            }

            dependencyRepository.saveAll(dependenciesList);
            project.setDependencyCount(dependenciesList.size());
            log.info("Saved {} Maven dependencies for project {}", dependenciesList.size(), project.getId());

        } catch (Exception e) {
            log.error("Error parsing pom.xml for project {}", project.getId(), e);
        }
    }

    private File findPomXml(File rootDir) {
        File directPom = new File(rootDir, "pom.xml");
        if (directPom.exists()) return directPom;

        try (Stream<Path> stream = Files.walk(rootDir.toPath())) {
            Optional<Path> found = stream
                    .filter(p -> p.getFileName().toString().equalsIgnoreCase("pom.xml"))
                    .findFirst();
            return found.map(Path::toFile).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }

    private String explainDependencyPurpose(String artifactId) {
        if (artifactId.contains("spring-boot-starter-web")) {
            return "Provides Spring MVC for creating REST APIs with Embedded Tomcat server and Jackson JSON support.";
        } else if (artifactId.contains("spring-boot-starter-data-jpa")) {
            return "Provides Spring Data JPA and Hibernate ORM for relational database interaction.";
        } else if (artifactId.contains("spring-boot-starter-security")) {
            return "Provides authentication, authorization, JWT filter chains, and web security protections.";
        } else if (artifactId.contains("postgresql")) {
            return "PostgreSQL JDBC Database Driver for database connectivity.";
        } else if (artifactId.contains("h2")) {
            return "H2 In-Memory Lightweight Database Engine for development and testing.";
        } else if (artifactId.contains("lombok")) {
            return "Automates Java boilerplate code generation like getters, setters, constructors, and builders.";
        }
        return "Provides core library utilities and classes for " + artifactId + ".";
    }

    private String getCommonAnnotations(String artifactId) {
        if (artifactId.contains("starter-web")) {
            return "@RestController, @RequestMapping, @GetMapping, @PostMapping, @PathVariable, @RequestBody";
        } else if (artifactId.contains("starter-data-jpa")) {
            return "@Entity, @Table, @Id, @GeneratedValue, @OneToMany, @ManyToOne, @Transactional";
        } else if (artifactId.contains("starter-security")) {
            return "@EnableWebSecurity, @PreAuthorize, @Bean SecurityFilterChain";
        }
        return "@Configuration, @Bean, @Autowired";
    }
}
