package com.codeflow.studio.config;

import java.util.regex.Pattern;

/**
 * Enterprise Security Sanitizer (OWASP ASVS v4.0 / CWE-20, CWE-22, CWE-89).
 * Centralized defense against Path Traversal, Parameter Injection, and Malformed Identifiers.
 */
public final class SecuritySanitizer {

    private static final Pattern SAFE_PROJECT_ID = Pattern.compile("^[a-zA-Z0-9_-]{1,128}$");

    private SecuritySanitizer() {}

    /**
     * Validates that a project identifier matches safe alphanumeric, hyphen, and underscore characters.
     * Prevents path traversal (e.g., ../, ..\), null byte injections, and SQL injection strings.
     *
     * @param projectId Raw project identifier from path variable or parameter
     * @return Trimmed, safe project identifier
     * @throws IllegalArgumentException if the identifier is null, empty, exceeds 128 chars, or contains forbidden characters
     */
    public static String validateProjectId(String projectId) {
        if (projectId == null || !SAFE_PROJECT_ID.matcher(projectId.trim()).matches()) {
            throw new IllegalArgumentException("Invalid project identifier: alphanumeric, dash, and underscore allowed (max 128 chars).");
        }
        return projectId.trim();
    }

    /**
     * Non-throwing boolean check for safe project identifiers.
     */
    public static boolean isValidProjectId(String projectId) {
        return projectId != null && SAFE_PROJECT_ID.matcher(projectId.trim()).matches();
    }
}
