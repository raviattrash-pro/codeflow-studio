package com.codeflow.studio.service;

import com.codeflow.studio.model.Project;
import com.codeflow.studio.model.ProjectNode;
import com.codeflow.studio.repository.ProjectNodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ReactParserService {

    private static final Logger log = LoggerFactory.getLogger(ReactParserService.class);

    private final ProjectNodeRepository nodeRepository;

    @Autowired
    public ReactParserService(ProjectNodeRepository nodeRepository) {
        this.nodeRepository = nodeRepository;
    }

    // Pattern for React Components (e.g. export default function LoginButton() or const Dashboard = ())
    private static final Pattern COMPONENT_PATTERN = Pattern.compile("(?:export\\s+(?:default\\s+)?)?(?:function|const)\\s+([A-Z][A-Za-z0-9_]*)\\s*[:=]?");
    
    // Pattern for Axios / Fetch calls: axios.post('/api/v1/auth/login')
    private static final Pattern API_CALL_PATTERN = Pattern.compile("(?:axios|fetch)\\.(get|post|put|delete|patch)\\s*\\(\\s*[`'\"]([^`'\"]+)[`'\"]");

    public List<ProjectNode> parseReactSourceFiles(File projectDir, Project project) {
        log.info("Starting React/TypeScript parsing for project {}", project.getId());
        List<ProjectNode> reactNodes = new ArrayList<>();

        try (Stream<Path> stream = Files.walk(projectDir.toPath())) {
            List<File> reactFiles = stream
                    .filter(p -> {
                        String s = p.toString().toLowerCase();
                        return (s.endsWith(".tsx") || s.endsWith(".jsx") || s.endsWith(".js") || s.endsWith(".ts"))
                                && !s.contains("node_modules") && !s.contains("dist") && !s.contains("build");
                    })
                    .map(Path::toFile)
                    .collect(Collectors.toList());

            log.info("Found {} React/TypeScript source files in {}", reactFiles.size(), projectDir.getName());

            if (!reactFiles.isEmpty()) {
                project.setFrontendFramework("React");
                project.setFrontendVersion("18.2");
            }

            int componentCount = 0;

            for (File file : reactFiles) {
                try {
                    String content = Files.readString(file.toPath());
                    String relativePath = projectDir.toPath().relativize(file.toPath()).toString().replace("\\", "/");
                    String fileName = file.getName();

                    Matcher compMatcher = COMPONENT_PATTERN.matcher(content);
                    while (compMatcher.find()) {
                        String compName = compMatcher.group(1);
                        if (compName.endsWith("Props") || compName.endsWith("Type") || compName.equalsIgnoreCase("React")) {
                            continue;
                        }
                        componentCount++;

                        ProjectNode compNode = ProjectNode.builder()
                                .id(UUID.randomUUID().toString())
                                .projectId(project.getId())
                                .label(compName + " (" + fileName + ")")
                                .layer("FRONTEND")
                                .nodeType("REACT_COMPONENT")
                                .filePath(relativePath)
                                .lineNumber(1)
                                .methodName(compName)
                                .build();

                        reactNodes.add(compNode);
                    }

                    Matcher apiMatcher = API_CALL_PATTERN.matcher(content);
                    while (apiMatcher.find()) {
                        String method = apiMatcher.group(1).toUpperCase();
                        String rawUrl = apiMatcher.group(2);

                        ProjectNode apiCallNode = ProjectNode.builder()
                                .id(UUID.randomUUID().toString())
                                .projectId(project.getId())
                                .label(method + " " + rawUrl)
                                .layer("FRONTEND")
                                .nodeType("REACT_API_CALL")
                                .filePath(relativePath)
                                .httpMethod(method)
                                .endpointPath(rawUrl)
                                .build();

                        reactNodes.add(apiCallNode);
                    }

                } catch (Exception e) {
                    log.debug("Error reading React file: {}", file.getName());
                }
            }

            nodeRepository.saveAll(reactNodes);
            project.setComponentCount(componentCount);
            log.info("Saved {} React nodes for project {}", reactNodes.size(), project.getId());

        } catch (Exception e) {
            log.error("Error scanning React directory", e);
        }

        return reactNodes;
    }
}
