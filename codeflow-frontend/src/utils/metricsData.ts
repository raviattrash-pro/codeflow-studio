export interface ApiMetric {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  controller: string;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  requestCount24h: number;
  errorRatePercent: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
  layer: 'BACKEND';
}

export interface SequenceHop {
  step: number;
  from: 'BROWSER' | 'REACT_APP' | 'API_GATEWAY' | 'CONTROLLER' | 'SERVICE' | 'REPOSITORY' | 'DATABASE';
  to: 'BROWSER' | 'REACT_APP' | 'API_GATEWAY' | 'CONTROLLER' | 'SERVICE' | 'REPOSITORY' | 'DATABASE';
  title: string;
  protocol: 'HTTP' | 'INTERNAL_AOP' | 'JDBC_SQL' | 'JSON_RETURN' | 'REACT_STATE';
  payloadSummary: string;
  durationMs: number;
  annotationHint?: string;
}

export interface HeatmapCell {
  hour: number; // 0 to 23
  endpointId: string;
  p95LatencyMs: number;
  requestCount: number;
  errorCount: number;
}

export const DEMO_API_METRICS: ApiMetric[] = [
  {
    id: 'm1',
    endpoint: '/api/v1/orders/checkout',
    method: 'POST',
    controller: 'OrderController',
    avgLatencyMs: 84,
    p95LatencyMs: 142,
    p99LatencyMs: 220,
    requestCount24h: 12450,
    errorRatePercent: 0.12,
    status: 'OPTIMAL',
    layer: 'BACKEND'
  },
  {
    id: 'm2',
    endpoint: '/api/v1/payments/process',
    method: 'POST',
    controller: 'PaymentController',
    avgLatencyMs: 310,
    p95LatencyMs: 480,
    p99LatencyMs: 850,
    requestCount24h: 9800,
    errorRatePercent: 1.45,
    status: 'DEGRADED',
    layer: 'BACKEND'
  },
  {
    id: 'm3',
    endpoint: '/api/v1/admin/login',
    method: 'POST',
    controller: 'AdminController',
    avgLatencyMs: 65,
    p95LatencyMs: 95,
    p99LatencyMs: 140,
    requestCount24h: 3200,
    errorRatePercent: 0.05,
    status: 'OPTIMAL',
    layer: 'BACKEND'
  },
  {
    id: 'm4',
    endpoint: '/api/v1/users/{id}',
    method: 'GET',
    controller: 'UserController',
    avgLatencyMs: 28,
    p95LatencyMs: 45,
    p99LatencyMs: 78,
    requestCount24h: 38400,
    errorRatePercent: 0.02,
    status: 'OPTIMAL',
    layer: 'BACKEND'
  },
  {
    id: 'm5',
    endpoint: '/api/v1/products/search',
    method: 'GET',
    controller: 'ProductController',
    avgLatencyMs: 115,
    p95LatencyMs: 190,
    p99LatencyMs: 340,
    requestCount24h: 54100,
    errorRatePercent: 0.25,
    status: 'OPTIMAL',
    layer: 'BACKEND'
  },
  {
    id: 'm6',
    endpoint: '/api/v1/cart/items',
    method: 'PUT',
    controller: 'CartController',
    avgLatencyMs: 42,
    p95LatencyMs: 70,
    p99LatencyMs: 110,
    requestCount24h: 18200,
    errorRatePercent: 0.08,
    status: 'OPTIMAL',
    layer: 'BACKEND'
  },
  {
    id: 'm7',
    endpoint: '/api/v1/reports/inventory-sync',
    method: 'POST',
    controller: 'ReportController',
    avgLatencyMs: 620,
    p95LatencyMs: 940,
    p99LatencyMs: 1450,
    requestCount24h: 850,
    errorRatePercent: 3.80,
    status: 'CRITICAL',
    layer: 'BACKEND'
  }
];

export const DEMO_SEQUENCE_HOPS: SequenceHop[] = [
  {
    step: 1,
    from: 'BROWSER',
    to: 'REACT_APP',
    title: 'User clicks "Submit Checkout" button',
    protocol: 'REACT_STATE',
    payloadSummary: '{ cartId: "cart_9921", paymentMethod: "STRIPE_TOKEN" }',
    durationMs: 2,
    annotationHint: 'onClick handler triggers React dispatch & form validation'
  },
  {
    step: 2,
    from: 'REACT_APP',
    to: 'API_GATEWAY',
    title: 'POST /api/v1/orders/checkout',
    protocol: 'HTTP',
    payloadSummary: 'Bearer eyJhbGciOiJIUzI1NiIs... + JSON OrderDTO',
    durationMs: 18,
    annotationHint: 'Axios interceptor attaches JWT Auth header & CORS preflight'
  },
  {
    step: 3,
    from: 'API_GATEWAY',
    to: 'CONTROLLER',
    title: 'JwtAuthenticationFilter & Route to OrderController',
    protocol: 'HTTP',
    payloadSummary: 'SecurityContextHolder.setAuthentication(userPrincipal)',
    durationMs: 6,
    annotationHint: '@RestController, @Valid @RequestBody CheckoutRequest'
  },
  {
    step: 4,
    from: 'CONTROLLER',
    to: 'SERVICE',
    title: 'OrderService.processCheckout(dto)',
    protocol: 'INTERNAL_AOP',
    payloadSummary: 'TransactionInterceptor opens connection & starts TX',
    durationMs: 4,
    annotationHint: '@Service, @Transactional(propagation = REQUIRED)'
  },
  {
    step: 5,
    from: 'SERVICE',
    to: 'REPOSITORY',
    title: 'OrderRepository.save(orderEntity)',
    protocol: 'INTERNAL_AOP',
    payloadSummary: 'Hibernate Session dirty-checks entities in L1 Cache',
    durationMs: 5,
    annotationHint: 'Spring Data JpaRepository<Order, UUID>'
  },
  {
    step: 6,
    from: 'REPOSITORY',
    to: 'DATABASE',
    title: 'INSERT INTO orders (...) VALUES (...)',
    protocol: 'JDBC_SQL',
    payloadSummary: 'HikariCP Pool allocates connection #4. Query executed.',
    durationMs: 14,
    annotationHint: 'PostgreSQL 16 Engine executes insert with primary key constraint'
  },
  {
    step: 7,
    from: 'DATABASE',
    to: 'REPOSITORY',
    title: 'PostgreSQL returns Generated Keys & Row Count (1)',
    protocol: 'JDBC_SQL',
    payloadSummary: 'ID: a81f09e2-34f1-4fbb-b36c, status: "CONFIRMED"',
    durationMs: 3,
    annotationHint: 'Hibernate hydrates Order entity and updates L1 snapshot'
  },
  {
    step: 8,
    from: 'REPOSITORY',
    to: 'SERVICE',
    title: 'Entity returned to transactional boundary',
    protocol: 'INTERNAL_AOP',
    payloadSummary: 'TransactionInterceptor commits JDBC TX & releases pool socket',
    durationMs: 3,
    annotationHint: 'ACID transaction committed successfully'
  },
  {
    step: 9,
    from: 'SERVICE',
    to: 'CONTROLLER',
    title: 'OrderResponseDTO mapped from domain entity',
    protocol: 'INTERNAL_AOP',
    payloadSummary: 'MapStruct converts Order -> OrderResponseDTO',
    durationMs: 2,
    annotationHint: 'ResponseEntity.status(HttpStatus.CREATED).body(response)'
  },
  {
    step: 10,
    from: 'CONTROLLER',
    to: 'API_GATEWAY',
    title: 'HTTP 201 Created JSON response serializing',
    protocol: 'HTTP',
    payloadSummary: 'MappingJackson2HttpMessageConverter writes UTF-8 stream',
    durationMs: 5,
    annotationHint: 'GlobalExceptionHandler & ResponseBodyAdvice hooks'
  },
  {
    step: 11,
    from: 'API_GATEWAY',
    to: 'REACT_APP',
    title: 'Response arrives at browser network stack',
    protocol: 'HTTP',
    payloadSummary: '{ orderId: "ORD-9921", status: "CONFIRMED", total: 149.99 }',
    durationMs: 12,
    annotationHint: 'Axios Promise resolves and triggers React useState update'
  },
  {
    step: 12,
    from: 'REACT_APP',
    to: 'BROWSER',
    title: 'Virtual DOM reconciliation & Order Success Card Rendered',
    protocol: 'REACT_STATE',
    payloadSummary: 'UI Transition to /order-confirmation/ORD-9921',
    durationMs: 4,
    annotationHint: 'React 19 Fiber commit phase paints updated DOM'
  }
];

export const generateDemoHeatmapData = (): HeatmapCell[] => {
  const cells: HeatmapCell[] = [];
  const endpointIds = DEMO_API_METRICS.map((m) => m.id);

  endpointIds.forEach((endpointId) => {
    const baseMetric = DEMO_API_METRICS.find((m) => m.id === endpointId)!;
    for (let hour = 0; hour < 24; hour++) {
      // Create realistic peak times around hour 11-14 and 19-22
      const isPeak = (hour >= 11 && hour <= 14) || (hour >= 19 && hour <= 22);
      const randomVariance = Math.sin(hour + endpointId.charCodeAt(1)) * 0.35 + 1;
      const peakMultiplier = isPeak ? 1.6 : 0.8;
      
      const p95 = Math.round(baseMetric.p95LatencyMs * randomVariance * peakMultiplier);
      const reqs = Math.round((baseMetric.requestCount24h / 24) * randomVariance * peakMultiplier);
      const errCount = Math.floor(reqs * (baseMetric.errorRatePercent / 100) * (isPeak ? 1.5 : 0.7));

      cells.push({
        hour,
        endpointId,
        p95LatencyMs: Math.max(15, p95),
        requestCount: Math.max(10, reqs),
        errorCount: Math.max(0, errCount)
      });
    }
  });

  return cells;
};
