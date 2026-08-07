package com.codeflow.studio.service;

import com.codeflow.studio.model.Project;
import com.codeflow.studio.model.ProjectNode;
import com.codeflow.studio.repository.ProjectNodeRepository;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.expr.AnnotationExpr;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class JavaParserService {

    private static final Logger log = LoggerFactory.getLogger(JavaParserService.class);

    private final ProjectNodeRepository nodeRepository;

    @Autowired
    public JavaParserService(ProjectNodeRepository nodeRepository) {
        this.nodeRepository = nodeRepository;
    }

    public List<ProjectNode> parseJavaSourceFiles(File projectDir, Project project) {
        log.info("Starting Java AST parsing for project {}", project.getId());
        List<ProjectNode> parsedNodes = new ArrayList<>();

        try (Stream<Path> stream = Files.walk(projectDir.toPath())) {
            List<File> javaFiles = stream
                    .filter(p -> p.toString().endsWith(".java"))
                    .map(Path::toFile)
                    .collect(Collectors.toList());

            log.info("Found {} .java files to inspect in {}", javaFiles.size(), projectDir.getName());

            int controllerCount = 0;
            int serviceCount = 0;
            int repositoryCount = 0;
            int apiCount = 0;

            for (File javaFile : javaFiles) {
                try {
                    CompilationUnit cu = StaticJavaParser.parse(javaFile);
                    String relativePath = projectDir.toPath().relativize(javaFile.toPath()).toString().replace("\\", "/");
                    String packageName = cu.getPackageDeclaration().map(p -> p.getNameAsString()).orElse("");

                    List<ClassOrInterfaceDeclaration> classes = cu.findAll(ClassOrInterfaceDeclaration.class);

                    for (ClassOrInterfaceDeclaration decl : classes) {
                        String className = decl.getNameAsString();

                        // 1. Controller Detection
                        if (decl.isAnnotationPresent("RestController") || decl.isAnnotationPresent("Controller")) {
                            controllerCount++;
                            String basePath = extractBasePath(decl);

                            for (MethodDeclaration method : decl.getMethods()) {
                                String httpMethod = extractHttpMethod(method);
                                if (httpMethod != null) {
                                    apiCount++;
                                    String endpointPath = combinePaths(basePath, extractEndpointPath(method));

                                    ProjectNode node = ProjectNode.builder()
                                            .id(UUID.randomUUID().toString())
                                            .projectId(project.getId())
                                            .label(className + "." + method.getNameAsString() + "()")
                                            .layer("BACKEND")
                                            .nodeType("SPRING_CONTROLLER")
                                            .filePath(relativePath)
                                            .lineNumber(method.getBegin().map(p -> p.line).orElse(1))
                                            .methodName(method.getNameAsString())
                                            .httpMethod(httpMethod)
                                            .endpointPath(endpointPath)
                                            .packageName(packageName)
                                            .annotationsCsv(getAnnotationsAsString(method))
                                            .build();

                                    parsedNodes.add(node);
                                }
                            }
                        }
                        // 2. Service Detection
                        else if (decl.isAnnotationPresent("Service")) {
                            serviceCount++;
                            ProjectNode node = ProjectNode.builder()
                                    .id(UUID.randomUUID().toString())
                                    .projectId(project.getId())
                                    .label(className)
                                    .layer("BACKEND")
                                    .nodeType("SPRING_SERVICE")
                                    .filePath(relativePath)
                                    .lineNumber(decl.getBegin().map(p -> p.line).orElse(1))
                                    .methodName(className)
                                    .packageName(packageName)
                                    .annotationsCsv(getAnnotationsAsString(decl))
                                    .build();
                            parsedNodes.add(node);
                        }
                        // 3. Repository Detection
                        else if (decl.isAnnotationPresent("Repository") || isRepositoryInterface(decl)) {
                            repositoryCount++;
                            ProjectNode node = ProjectNode.builder()
                                    .id(UUID.randomUUID().toString())
                                    .projectId(project.getId())
                                    .label(className)
                                    .layer("BACKEND")
                                    .nodeType("SPRING_REPOSITORY")
                                    .filePath(relativePath)
                                    .lineNumber(decl.getBegin().map(p -> p.line).orElse(1))
                                    .methodName(className)
                                    .packageName(packageName)
                                    .annotationsCsv(getAnnotationsAsString(decl))
                                    .targetEntity(extractTargetEntity(decl))
                                    .build();
                            parsedNodes.add(node);
                        }
                        // 4. Entity Detection (Database Table)
                        else if (decl.isAnnotationPresent("Entity") || decl.isAnnotationPresent("Table")) {
                            String tableName = extractTableName(decl, className);
                            ProjectNode node = ProjectNode.builder()
                                    .id(UUID.randomUUID().toString())
                                    .projectId(project.getId())
                                    .label("Table: " + tableName)
                                    .layer("DATABASE")
                                    .nodeType("DB_TABLE")
                                    .filePath(relativePath)
                                    .lineNumber(decl.getBegin().map(p -> p.line).orElse(1))
                                    .methodName(className)
                                    .packageName(packageName)
                                    .targetEntity(className)
                                    .annotationsCsv(getAnnotationsAsString(decl))
                                    .build();
                            parsedNodes.add(node);
                        }
                    }

                } catch (Exception e) {
                    log.debug("Skipped unparseable Java file: {}", javaFile.getName());
                }
            }

            nodeRepository.saveAll(parsedNodes);

            project.setControllerCount(controllerCount);
            project.setServiceCount(serviceCount);
            project.setRepositoryCount(repositoryCount);
            project.setApiCount(apiCount);

            log.info("Saved {} backend nodes for project {}", parsedNodes.size(), project.getId());

        } catch (Exception e) {
            log.error("Error walking Java directory", e);
        }

        return parsedNodes;
    }

    private String extractBasePath(ClassOrInterfaceDeclaration decl) {
        if (decl.isAnnotationPresent("RequestMapping")) {
            AnnotationExpr ann = decl.getAnnotationByName("RequestMapping").orElse(null);
            if (ann != null) {
                return ann.toString().replaceAll("@RequestMapping|\\(|\\)|\"", "");
            }
        }
        return "";
    }

    private String extractHttpMethod(MethodDeclaration method) {
        if (method.isAnnotationPresent("GetMapping")) return "GET";
        if (method.isAnnotationPresent("PostMapping")) return "POST";
        if (method.isAnnotationPresent("PutMapping")) return "PUT";
        if (method.isAnnotationPresent("DeleteMapping")) return "DELETE";
        if (method.isAnnotationPresent("PatchMapping")) return "PATCH";
        if (method.isAnnotationPresent("RequestMapping")) return "ALL";
        return null;
    }

    private String extractEndpointPath(MethodDeclaration method) {
        String annName = null;
        if (method.isAnnotationPresent("GetMapping")) annName = "GetMapping";
        else if (method.isAnnotationPresent("PostMapping")) annName = "PostMapping";
        else if (method.isAnnotationPresent("PutMapping")) annName = "PutMapping";
        else if (method.isAnnotationPresent("DeleteMapping")) annName = "DeleteMapping";
        else if (method.isAnnotationPresent("PatchMapping")) annName = "PatchMapping";

        if (annName != null) {
            AnnotationExpr ann = method.getAnnotationByName(annName).orElse(null);
            if (ann != null) {
                String path = ann.toString().replaceAll("@[A-Za-z]+|\\(|\\)|\"", "");
                if (path.startsWith("value=")) path = path.replace("value=", "");
                return path.trim();
            }
        }
        return "";
    }

    private String combinePaths(String base, String endpoint) {
        if (!base.startsWith("/") && !base.isEmpty()) base = "/" + base;
        if (!endpoint.startsWith("/") && !endpoint.isEmpty()) endpoint = "/" + endpoint;
        String combined = (base + endpoint).replaceAll("//+", "/");
        return combined.isEmpty() ? "/" : combined;
    }

    private boolean isRepositoryInterface(ClassOrInterfaceDeclaration decl) {
        return decl.getExtendedTypes().stream()
                .anyMatch(t -> t.getNameAsString().contains("Repository") || t.getNameAsString().contains("JpaRepository"));
    }

    private String extractTargetEntity(ClassOrInterfaceDeclaration decl) {
        return decl.getExtendedTypes().stream()
                .filter(t -> t.getNameAsString().contains("JpaRepository") || t.getNameAsString().contains("CrudRepository"))
                .findFirst()
                .map(t -> t.getTypeArguments().isPresent() ? t.getTypeArguments().get().get(0).toString() : "Entity")
                .orElse("Entity");
    }

    private String extractTableName(ClassOrInterfaceDeclaration decl, String className) {
        if (decl.isAnnotationPresent("Table")) {
            AnnotationExpr ann = decl.getAnnotationByName("Table").orElse(null);
            if (ann != null && ann.toString().contains("name")) {
                String s = ann.toString();
                int idx = s.indexOf("name =");
                if (idx != -1) {
                    return s.substring(idx).replaceAll("name =|\"|\\)|}", "").trim();
                }
            }
        }
        return className.toLowerCase() + "s";
    }

    private String getAnnotationsAsString(ClassOrInterfaceDeclaration decl) {
        return decl.getAnnotations().stream().map(AnnotationExpr::getNameAsString).collect(Collectors.joining(", "));
    }

    private String getAnnotationsAsString(MethodDeclaration method) {
        return method.getAnnotations().stream().map(AnnotationExpr::getNameAsString).collect(Collectors.joining(", "));
    }
}
