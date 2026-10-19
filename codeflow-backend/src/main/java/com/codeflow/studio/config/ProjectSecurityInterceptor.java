package com.codeflow.studio.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

/**
 * Enterprise Project Security Interceptor (OWASP A01:2021 / CWE-22 Path Traversal / CWE-89 Parameter Injection).
 * Intercepts all incoming requests containing a {projectId} URI path variable and validates it against strict regex.
 */
@Component
public class ProjectSecurityInterceptor implements HandlerInterceptor {

    @Override
    @SuppressWarnings("unchecked")
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Map<String, String> uriVariables = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        if (uriVariables != null && uriVariables.containsKey("projectId")) {
            String projectId = uriVariables.get("projectId");
            SecuritySanitizer.validateProjectId(projectId);
        }
        return true;
    }
}
