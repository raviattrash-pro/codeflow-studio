package com.codeflow.studio.service;

import com.codeflow.studio.model.ExecutionTrace;
import com.codeflow.studio.model.ProjectNode;
import com.codeflow.studio.repository.ExecutionTraceRepository;
import com.codeflow.studio.repository.ProjectNodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class RuntimeTracingService {

    private final ExecutionTraceRepository executionTraceRepository;
    private final ProjectNodeRepository projectNodeRepository;

    @Autowired
    public RuntimeTracingService(ExecutionTraceRepository executionTraceRepository, ProjectNodeRepository projectNodeRepository) {
        this.executionTraceRepository = executionTraceRepository;
        this.projectNodeRepository = projectNodeRepository;
    }

    public List<ExecutionTrace> getOrGenerateTraces(String projectId) {
        List<ExecutionTrace> existing = executionTraceRepository.findByProjectIdOrderByTimestampDesc(projectId);
        if (!existing.isEmpty()) {
            return existing;
        }

        List<ProjectNode> nodes = projectNodeRepository.findByProjectId(projectId);
        List<ProjectNode> controllers = nodes.stream()
                .filter(n -> "SPRING_CONTROLLER".equalsIgnoreCase(n.getNodeType()))
                .toList();

        List<ExecutionTrace> generated = new ArrayList<>();
        if (controllers.isEmpty()) {
            generated.add(createSampleTrace(projectId, "/api/v1/auth/login", "POST", 42));
            generated.add(createSampleTrace(projectId, "/api/v1/users", "GET", 28));
            generated.add(createSampleTrace(projectId, "/api/v1/checkout", "POST", 115));
        } else {
            int count = 0;
            for (ProjectNode ctrl : controllers) {
                if (count++ >= 8) break;
                String endpoint = ctrl.getEndpointPath() != null ? ctrl.getEndpointPath() : "/api/" + ctrl.getLabel().toLowerCase().replace("controller", "");
                String method = ctrl.getHttpMethod() != null ? ctrl.getHttpMethod() : "GET";
                int duration = 15 + new Random().nextInt(80);
                generated.add(createSampleTrace(projectId, endpoint, method, duration));
            }
        }

        return executionTraceRepository.saveAll(generated);
    }

    private ExecutionTrace createSampleTrace(String projectId, String endpoint, String method, int durationMs) {
        String id = UUID.randomUUID().toString();
        String jsonSteps = "[" +
                "{\"step\":1, \"layer\":\"CLIENT\", \"component\":\"React Frontend\", \"action\":\"axios." + method.toLowerCase() + "('" + endpoint + "')\", \"durationMs\":3}," +
                "{\"step\":2, \"layer\":\"API_GATEWAY\", \"component\":\"Spring DispatcherServlet\", \"action\":\"Route to HandlerMapping\", \"durationMs\":4}," +
                "{\"step\":3, \"layer\":\"CONTROLLER\", \"component\":\"" + endpoint.replace("/", "_") + "Handler\", \"action\":\"Invoke @Valid & controller method\", \"durationMs\":12}," +
                "{\"step\":4, \"layer\":\"SERVICE\", \"component\":\"BusinessService\", \"action\":\"Execute @Transactional business logic\", \"durationMs\":15}," +
                "{\"step\":5, \"layer\":\"REPOSITORY\", \"component\":\"JpaRepository\", \"action\":\"Hibernate SELECT / UPDATE query\", \"durationMs\":8}" +
                "]";

        return new ExecutionTrace(id, projectId, endpoint, method, durationMs, "200 OK", LocalDateTime.now().minusMinutes(new Random().nextInt(60)), jsonSteps);
    }
}
