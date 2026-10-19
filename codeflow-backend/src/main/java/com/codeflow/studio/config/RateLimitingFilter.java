package com.codeflow.studio.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Enterprise Rate Limiting & DoS Defense Filter (OWASP API4:2023 Unrestricted Resource Consumption).
 * Implements a thread-safe sliding minute window token bucket per client IP address.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitingFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    private static final int MAX_REQUESTS_PER_MINUTE = 180;
    private static final int INGEST_MAX_REQUESTS_PER_MINUTE = 30;

    private final ConcurrentHashMap<String, ClientQuota> quotaMap = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        if (!(request instanceof HttpServletRequest httpReq) || !(response instanceof HttpServletResponse httpRes)) {
            chain.doFilter(request, response);
            return;
        }

        String uri = httpReq.getRequestURI();
        // Skip rate limiting for static assets or health checks
        if (!uri.startsWith("/api/")) {
            chain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(httpReq);
        boolean isHeavyRoute = uri.contains("/ingest") || uri.contains("/self-healing") || uri.contains("/arch-gate");
        int maxAllowed = isHeavyRoute ? INGEST_MAX_REQUESTS_PER_MINUTE : MAX_REQUESTS_PER_MINUTE;

        long currentMinute = Instant.now().getEpochSecond() / 60;
        String quotaKey = clientIp + ":" + (isHeavyRoute ? "heavy:" : "api:") + currentMinute;

        ClientQuota quota = quotaMap.computeIfAbsent(quotaKey, k -> new ClientQuota(maxAllowed));
        int remaining = quota.decrementAndGet();

        // Evict expired minutes periodically
        if (quotaMap.size() > 5000) {
            quotaMap.entrySet().removeIf(e -> !e.getKey().endsWith(":" + currentMinute));
        }

        httpRes.setHeader("X-RateLimit-Limit", String.valueOf(maxAllowed));
        httpRes.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, remaining)));

        if (remaining < 0) {
            log.warn("[RateLimit] Client IP {} exceeded rate limit on {}", clientIp, uri);
            httpRes.setStatus(429); // 429 Too Many Requests
            httpRes.setContentType("application/json");
            httpRes.getWriter().write(
                    "{\"timestamp\":\"" + Instant.now() + "\",\"status\":429,\"error\":\"Too Many Requests\","
                    + "\"message\":\"Rate limit exceeded. Maximum " + maxAllowed + " requests per minute allowed.\"}"
            );
            return;
        }

        chain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.trim().isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.trim().isEmpty()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }

    private static class ClientQuota {
        private final int limit;
        private final AtomicInteger remaining;

        public ClientQuota(int limit) {
            this.limit = limit;
            this.remaining = new AtomicInteger(limit);
        }

        public int decrementAndGet() {
            return remaining.decrementAndGet();
        }
    }
}
