import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import axios from 'axios';
import {
  Sparkles, Layers, ShieldCheck, Database, Play, Pause, Monitor, Users, Network,
  RotateCcw, Search, ChevronRight, Server, Globe, Cpu,
  Flame, CheckCircle2, ArrowRight, Zap, Code2, GitBranch,
  Terminal, Lock, FileCode, Check, Copy, ExternalLink, Activity,
  BarChart2, Bot, Package, FolderTree, Shield
} from 'lucide-react';
import { Header, ThemeMode } from './components/Header';
import { ProjectDashboard } from './components/ProjectDashboard';
import { InteractiveFlowExplorer } from './components/InteractiveFlowExplorer';
import { NodeInspectorSidebar } from './components/NodeInspectorSidebar';
import { ArchitectureIllustration } from './components/ArchitectureIllustration';

// Lazy-loaded modal bundles for sub-millisecond initial load & chunk splitting
const IngestionModal = lazy(() => import('./components/IngestionModal').then(m => ({ default: m.IngestionModal })));
const MonacoViewerModal = lazy(() => import('./components/MonacoViewerModal').then(m => ({ default: m.MonacoViewerModal })));
const DependencyExplorerModal = lazy(() => import('./components/DependencyExplorerModal').then(m => ({ default: m.DependencyExplorerModal })));
const SqlExplorerModal = lazy(() => import('./components/SqlExplorerModal').then(m => ({ default: m.SqlExplorerModal })));
const AiAssistantModal = lazy(() => import('./components/AiAssistantModal').then(m => ({ default: m.AiAssistantModal })));
const ErDiagramModal = lazy(() => import('./components/ErDiagramModal').then(m => ({ default: m.ErDiagramModal })));
const SecurityExplorerModal = lazy(() => import('./components/SecurityExplorerModal').then(m => ({ default: m.SecurityExplorerModal })));
const FileTreeModal = lazy(() => import('./components/FileTreeModal').then(m => ({ default: m.FileTreeModal })));
const RuntimeTracingModal = lazy(() => import('./components/RuntimeTracingModal').then(m => ({ default: m.RuntimeTracingModal })));
const ApiMetricsDashboardModal = lazy(() => import('./components/ApiMetricsDashboardModal').then(m => ({ default: m.ApiMetricsDashboardModal })));
const SequenceDiagramModal = lazy(() => import('./components/SequenceDiagramModal').then(m => ({ default: m.SequenceDiagramModal })));
const LatencyHeatmapModal = lazy(() => import('./components/LatencyHeatmapModal').then(m => ({ default: m.LatencyHeatmapModal })));
const ReactRuntimeExplorerModal = lazy(() => import('./components/ReactRuntimeExplorerModal').then(m => ({ default: m.ReactRuntimeExplorerModal })));
const CommandPaletteModal = lazy(() => import('./components/CommandPaletteModal').then(m => ({ default: m.CommandPaletteModal })));
const ArchitectureScorecardModal = lazy(() => import('./components/ArchitectureScorecardModal').then(m => ({ default: m.ArchitectureScorecardModal })));
const ApiSandboxModal = lazy(() => import('./components/ApiSandboxModal').then(m => ({ default: m.ApiSandboxModal })));
const TypeScriptGeneratorModal = lazy(() => import('./components/TypeScriptGeneratorModal').then(m => ({ default: m.TypeScriptGeneratorModal })));
const ChaosSimulatorModal = lazy(() => import('./components/ChaosSimulatorModal').then(m => ({ default: m.ChaosSimulatorModal })));
const ArchitectureBlueprintExportModal = lazy(() => import('./components/ArchitectureBlueprintExportModal').then(m => ({ default: m.ArchitectureBlueprintExportModal })));
const ArchitectureDriftModal = lazy(() => import('./components/ArchitectureDriftModal').then(m => ({ default: m.ArchitectureDriftModal })));
const TestSuiteGeneratorModal = lazy(() => import('./components/TestSuiteGeneratorModal').then(m => ({ default: m.TestSuiteGeneratorModal })));
const CloudInfraSynthesizerModal = lazy(() => import('./components/CloudInfraSynthesizerModal').then(m => ({ default: m.CloudInfraSynthesizerModal })));
const EventStreamVisualizerModal = lazy(() => import('./components/EventStreamVisualizerModal').then(m => ({ default: m.EventStreamVisualizerModal })));
const VoiceCopilotModal = lazy(() => import('./components/VoiceCopilotModal').then(m => ({ default: m.VoiceCopilotModal })));
const DistributedTracingModal = lazy(() => import('./components/DistributedTracingModal').then(m => ({ default: m.DistributedTracingModal })));
const VsCodeSidecarModal = lazy(() => import('./components/VsCodeSidecarModal').then(m => ({ default: m.VsCodeSidecarModal })));
const ChromeExtensionModal = lazy(() => import('./components/ChromeExtensionModal').then(m => ({ default: m.ChromeExtensionModal })));
const LiveCollabModal = lazy(() => import('./components/LiveCollabModal').then(m => ({ default: m.LiveCollabModal })));
const ComplianceMatrixModal = lazy(() => import('./components/ComplianceMatrixModal').then(m => ({ default: m.ComplianceMatrixModal })));
const GraphqlGrpcModal = lazy(() => import('./components/GraphqlGrpcModal').then(m => ({ default: m.GraphqlGrpcModal })));
const ServiceMeshModal = lazy(() => import('./components/ServiceMeshModal').then(m => ({ default: m.ServiceMeshModal })));
import {
  ReactRuntimeGraphic, TracingGraphic, ApiMetricsGraphic, SequenceGraphic,
  HeatmapGraphic, ErdGraphic, SecurityGraphic, AiGraphic,
  SqlGraphic, DepsGraphic, FileTreeGraphic, ExportGraphic,
  ScorecardGraphic, SandboxGraphic, TsGenGraphic, ChaosGraphic, BlueprintGraphic,
  DriftGraphic, TestGenGraphic, CloudInfraGraphic, EventStreamGraphic, VoiceCopilotGraphic, DistributedTracingGraphic,
  VsCodeGraphic, ChromeExtGraphic, LiveCollabGraphic, ComplianceGraphic, GraphqlGrpcGraphic, ServiceMeshGraphic
} from './components/ToolPreviewGraphics';
import { Project, GraphData, NodeDetail, ProjectNode, AiAnalysisType } from './types';
import { useToast } from './components/ToastNotification';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DEMO_PROJECT_DATA, DEMO_GRAPH_DATA } from './utils/demoData';

type ScenarioKey = 'checkout' | 'auth' | 'cache' | 'burst';
type StudioTab = 'flow' | 'trace' | 'security' | 'sql' | 'metrics';

interface ScenarioConfig {
  name: string;
  subtitle: string;
  icon: string;
  method: string;
  endpoint: string;
  status: string;
  totalDuration: string;
  nodes: {
    key: string;
    label: string;
    sub: string;
    type: string;
    duration: string;
    icon: string;
    color: string;
    border: string;
    bg: string;
    code: string;
    annotations: string[];
    filePath: string;
  }[];
  sqlQuery: string;
  sqlDuration: string;
  jwtPayload: string;
  callStack: { frame: string; file: string; duration: string; type: string }[];
}

const SCENARIOS: Record<ScenarioKey, ScenarioConfig> = {
  checkout: {
    name: 'Order Checkout Pipeline',
    subtitle: '5 Steps • Spring Boot + JPA Transactional',
    icon: '🛒',
    method: 'POST',
    endpoint: '/api/v1/orders',
    status: '200 OK',
    totalDuration: '28.4ms',
    nodes: [
      {
        key: 'client',
        label: 'React 19 SPA',
        sub: 'useMutation(createOrder)',
        type: 'Client',
        duration: '0.8ms',
        icon: '📱',
        color: 'text-cyan-400',
        border: 'border-cyan-500/40',
        bg: 'bg-cyan-950/30',
        filePath: 'src/features/checkout/CheckoutForm.tsx',
        annotations: ['@tanstack/react-query', 'useState', 'useEffect'],
        code: `const { mutate: checkout } = useMutation({
  mutationFn: (orderData: OrderDTO) =>
    apiClient.post('/api/v1/orders', orderData),
  onSuccess: (res) => navigate(\`/orders/\${res.data.id}\`),
});`
      },
      {
        key: 'gateway',
        label: 'Security Gateway',
        sub: 'JwtAuthFilter (HS256)',
        type: 'Filter',
        duration: '2.1ms',
        icon: '🛡️',
        color: 'text-indigo-400',
        border: 'border-indigo-500/40',
        bg: 'bg-indigo-950/30',
        filePath: 'src/main/java/com/codeflow/config/JwtAuthenticationFilter.java',
        annotations: ['@Component', '@Order(1)', '@Slf4j'],
        code: `@Override
protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
    String token = resolveBearerToken(req);
    if (token != null && jwtValidator.validate(token)) {
        Authentication auth = jwtValidator.getAuthentication(token);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
    chain.doFilter(req, res);
}`
      },
      {
        key: 'controller',
        label: 'OrderController',
        sub: '@PostMapping /api/v1/orders',
        type: 'Controller',
        duration: '1.4ms',
        icon: '⚡',
        color: 'text-sky-400',
        border: 'border-sky-500/40',
        bg: 'bg-sky-950/30',
        filePath: 'src/main/java/com/codeflow/order/OrderController.java',
        annotations: ['@RestController', '@RequestMapping', '@Valid'],
        code: `@PostMapping
public ResponseEntity<OrderResponseDTO> createOrder(@Valid @RequestBody CreateOrderRequest req) {
    Order order = orderService.createOrder(req.toDomain(), req.getItems());
    return ResponseEntity.status(HttpStatus.CREATED).body(OrderResponseDTO.from(order));
}`
      },
      {
        key: 'service',
        label: 'OrderService',
        sub: '@Transactional Isolation.READ_COMMITTED',
        type: 'Service',
        duration: '16.2ms',
        icon: '🛠️',
        color: 'text-blue-400',
        border: 'border-blue-500/40',
        bg: 'bg-blue-950/30',
        filePath: 'src/main/java/com/codeflow/order/OrderService.java',
        annotations: ['@Service', '@Transactional', '@RequiredArgsConstructor'],
        code: `@Transactional
public Order createOrder(Order order, List<OrderItemDTO> items) {
    inventoryService.reserveStock(items);
    paymentService.authorize(order.getPaymentToken(), order.getTotalAmount());
    Order saved = orderRepository.save(order);
    eventPublisher.publishEvent(new OrderCreatedEvent(saved.getId()));
    return saved;
}`
      },
      {
        key: 'db',
        label: 'PostgreSQL DB',
        sub: 'JPA Save / INSERT INTO orders',
        type: 'Database',
        duration: '7.9ms',
        icon: '🗄️',
        color: 'text-amber-400',
        border: 'border-amber-500/40',
        bg: 'bg-amber-950/30',
        filePath: 'src/main/java/com/codeflow/order/OrderRepository.java',
        annotations: ['@Repository', 'JpaRepository<Order, Long>'],
        code: `public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o WHERE o.userId = :userId ORDER BY o.createdAt DESC")
    List<Order> findRecentOrdersByUserId(@Param("userId") Long userId);
}`
      }
    ],
    sqlQuery: `INSERT INTO orders (id, user_id, total_amount, status, created_at)
VALUES ('ord_984e72a', 42, 189.50, 'CONFIRMED', NOW())
RETURNING id, status, created_at;`,
    sqlDuration: '4.2ms',
    jwtPayload: `{
  "sub": "42",
  "email": "alex.morgan@company.com",
  "roles": ["ROLE_BUYER", "ROLE_USER"],
  "iat": 1735689600,
  "exp": 1735776000,
  "iss": "codeflow-auth-server"
}`,
    callStack: [
      { frame: '1. React useMutation.mutateAsync()', file: 'CheckoutForm.tsx:42', duration: '0.8ms', type: 'CLIENT' },
      { frame: '2. JwtAuthenticationFilter.doFilter()', file: 'JwtAuthenticationFilter.java:38', duration: '2.1ms', type: 'FILTER' },
      { frame: '3. OrderController.placeOrder()', file: 'OrderController.java:27', duration: '1.4ms', type: 'CONTROLLER' },
      { frame: '4. OrderService.createOrder()', file: 'OrderService.java:54', duration: '16.2ms', type: 'SERVICE' },
      { frame: '5. OrderRepository.save() -> SQL INSERT', file: 'OrderRepository.java:18', duration: '7.9ms', type: 'REPOSITORY' }
    ]
  },
  auth: {
    name: 'JWT Security & Token Refresh',
    subtitle: '4 Steps • Stateless Bearer Validation',
    icon: '🔐',
    method: 'POST',
    endpoint: '/api/v1/auth/token',
    status: '200 OK',
    totalDuration: '14.2ms',
    nodes: [
      {
        key: 'client',
        label: 'React Auth',
        sub: 'useAuth().login(creds)',
        type: 'Client',
        duration: '0.5ms',
        icon: '📱',
        color: 'text-cyan-400',
        border: 'border-cyan-500/40',
        bg: 'bg-cyan-950/30',
        filePath: 'src/context/AuthContext.tsx',
        annotations: ['useContext', 'useCallback'],
        code: `const login = async (creds: LoginCredentials) => {
  const res = await api.post('/api/v1/auth/token', creds);
  setAccessToken(res.data.token);
  setUser(res.data.user);
};`
      },
      {
        key: 'gateway',
        label: 'Security Filter',
        sub: 'HeaderTokenResolver',
        type: 'Filter',
        duration: '1.2ms',
        icon: '🛡️',
        color: 'text-indigo-400',
        border: 'border-indigo-500/40',
        bg: 'bg-indigo-950/30',
        filePath: 'src/main/java/com/codeflow/config/SecurityConfig.java',
        annotations: ['@Configuration', '@EnableWebSecurity'],
        code: `@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(a -> a.requestMatchers("/api/v1/auth/**").permitAll().anyRequest().authenticated())
        .build();
}`
      },
      {
        key: 'controller',
        label: 'AuthController',
        sub: 'authenticate(dto)',
        type: 'Controller',
        duration: '3.8ms',
        icon: '⚡',
        color: 'text-sky-400',
        border: 'border-sky-500/40',
        bg: 'bg-sky-950/30',
        filePath: 'src/main/java/com/codeflow/auth/AuthController.java',
        annotations: ['@RestController', '@RequestMapping("/api/v1/auth")'],
        code: `@PostMapping("/token")
public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
    Authentication auth = authManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
    );
    String token = jwtTokenProvider.generateToken(auth);
    return ResponseEntity.ok(new AuthResponse(token, "Bearer", 86400));
}`
      },
      {
        key: 'service',
        label: 'JwtTokenProvider',
        sub: 'HMAC-SHA256 Signer',
        type: 'Service',
        duration: '6.4ms',
        icon: '🛠️',
        color: 'text-blue-400',
        border: 'border-blue-500/40',
        bg: 'bg-blue-950/30',
        filePath: 'src/main/java/com/codeflow/auth/JwtTokenProvider.java',
        annotations: ['@Component'],
        code: `public String generateToken(Authentication auth) {
    Instant now = Instant.now();
    return Jwts.builder()
        .setSubject(auth.getName())
        .claim("roles", auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList())
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(now.plusSeconds(86400)))
        .signWith(signingKey, SignatureAlgorithm.HS256)
        .compact();
}`
      },
      {
        key: 'db',
        label: 'PostgreSQL DB',
        sub: 'User Credential Query',
        type: 'Database',
        duration: '2.3ms',
        icon: '🗄️',
        color: 'text-amber-400',
        border: 'border-amber-500/40',
        bg: 'bg-amber-950/30',
        filePath: 'src/main/java/com/codeflow/auth/UserRepository.java',
        annotations: ['@Repository'],
        code: `SELECT u.id, u.email, u.password_hash, u.role FROM users u WHERE u.email = :email AND u.active = true;`
      }
    ],
    sqlQuery: `SELECT id, email, password_hash, role, enabled
FROM users
WHERE email = 'alex.morgan@company.com' AND enabled = true
LIMIT 1;`,
    sqlDuration: '2.3ms',
    jwtPayload: `{
  "sub": "42",
  "email": "alex.morgan@company.com",
  "roles": ["ROLE_USER"],
  "iat": 1735689600,
  "exp": 1735776000
}`,
    callStack: [
      { frame: '1. React AuthContext.login()', file: 'AuthContext.tsx:28', duration: '0.5ms', type: 'CLIENT' },
      { frame: '2. SecurityConfig.filterChain()', file: 'SecurityConfig.java:45', duration: '1.2ms', type: 'FILTER' },
      { frame: '3. AuthController.login()', file: 'AuthController.java:31', duration: '3.8ms', type: 'CONTROLLER' },
      { frame: '4. JwtTokenProvider.generateToken()', file: 'JwtTokenProvider.java:22', duration: '6.4ms', type: 'SERVICE' },
      { frame: '5. UserRepository.findByEmail()', file: 'UserRepository.java:14', duration: '2.3ms', type: 'REPOSITORY' }
    ]
  },
  cache: {
    name: 'Redis Cache Hit Inspection',
    subtitle: 'Zero DB Disk I/O • RAM Retrieval',
    icon: '⚡',
    method: 'GET',
    endpoint: '/api/v1/products/492/stock',
    status: '200 OK (Cache Hit)',
    totalDuration: '1.2ms',
    nodes: [
      {
        key: 'client',
        label: 'React Query',
        sub: 'useQuery([products, 492])',
        type: 'Client',
        duration: '0.3ms',
        icon: '📱',
        color: 'text-cyan-400',
        border: 'border-cyan-500/40',
        bg: 'bg-cyan-950/30',
        filePath: 'src/features/products/ProductCard.tsx',
        annotations: ['staleTime: 60s'],
        code: `const { data: stock } = useQuery({ queryKey: ['product_stock', id], queryFn: fetchStock });`
      },
      {
        key: 'gateway',
        label: 'Edge CDN / Gateway',
        sub: 'Header ETag Cache-Control',
        type: 'Gateway',
        duration: '0.6ms',
        icon: '🛡️',
        color: 'text-indigo-400',
        border: 'border-indigo-500/40',
        bg: 'bg-indigo-950/30',
        filePath: 'src/main/java/com/codeflow/config/CacheFilter.java',
        annotations: ['@CacheControl'],
        code: `res.setHeader("Cache-Control", "public, max-age=60, s-maxage=120");`
      },
      {
        key: 'controller',
        label: 'InventoryController',
        sub: '@GetMapping stock',
        type: 'Controller',
        duration: '0.9ms',
        icon: '⚡',
        color: 'text-sky-400',
        border: 'border-sky-500/40',
        bg: 'bg-sky-950/30',
        filePath: 'src/main/java/com/codeflow/inventory/InventoryController.java',
        annotations: ['@RestController', '@Cacheable("product_stock")'],
        code: `@GetMapping("/{id}/stock")
@Cacheable(value = "product_stock", key = "#id")
public StockDTO getStock(@PathVariable Long id) {
    return inventoryService.getStockLevel(id);
}`
      },
      {
        key: 'service',
        label: 'Redis Cache Cluster',
        sub: 'GET product_stock::492',
        type: 'Cache',
        duration: '1.2ms',
        icon: '⚡',
        color: 'text-emerald-400',
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-950/30',
        filePath: 'src/main/java/com/codeflow/config/RedisConfig.java',
        annotations: ['RedisTemplate<String, Object>', 'TTL 60s'],
        code: `// Redis Key Hit: product_stock::492 -> Payload: { "available": 140, "reserved": 12 }`
      },
      {
        key: 'db',
        label: 'PostgreSQL (Bypassed)',
        sub: '0ms Disk Access Required',
        type: 'Database',
        duration: '0.0ms',
        icon: '🗄️',
        color: 'text-slate-500',
        border: 'border-slate-700/50',
        bg: 'bg-slate-900/40',
        filePath: 'src/main/java/com/codeflow/inventory/InventoryRepository.java',
        annotations: ['[Cache Hit - Bypassed]'],
        code: `-- Zero database roundtrips required. Result served from Redis RAM in 1.2ms.`
      }
    ],
    sqlQuery: `-- Cache Hit: Key 'product_stock::492' resolved from Redis memory cluster.
-- Response latency: 1.2ms (Zero SQL disk queries issued)`,
    sqlDuration: '0.0ms (Cached)',
    jwtPayload: `{ "cache_hit": true, "ttl_seconds": 58, "source": "redis_cluster_01" }`,
    callStack: [
      { frame: '1. React ProductCard.fetchStock()', file: 'ProductCard.tsx:19', duration: '0.3ms', type: 'CLIENT' },
      { frame: '2. Cache-Control Header Filter', file: 'CacheFilter.java:14', duration: '0.6ms', type: 'GATEWAY' },
      { frame: '3. InventoryController.getStock()', file: 'InventoryController.java:23', duration: '0.9ms', type: 'CONTROLLER' },
      { frame: '4. RedisCacheInterceptor.get()', file: 'InventoryService.java:31', duration: '1.2ms', type: 'CACHE' },
      { frame: '5. Response Deserializer', file: 'InventoryController.java:25', duration: '0.8ms', type: 'RESPONSE' }
    ]
  },
  burst: {
    name: 'Telemetry Ingestion Stream',
    subtitle: '5 Steps • High-Throughput Event Queue',
    icon: '📊',
    method: 'POST',
    endpoint: '/api/v1/telemetry/batch',
    status: '202 ACCEPTED',
    totalDuration: '9.1ms',
    nodes: [
      {
        key: 'client',
        label: 'Edge Client',
        sub: 'flushTelemetry(events)',
        type: 'Client',
        duration: '0.9ms',
        icon: '📱',
        color: 'text-cyan-400',
        border: 'border-cyan-500/40',
        bg: 'bg-cyan-950/30',
        filePath: 'src/telemetry/TelemetryClient.ts',
        annotations: ['navigator.sendBeacon', 'gzip'],
        code: `navigator.sendBeacon('/api/v1/telemetry/batch', JSON.stringify(batch));`
      },
      {
        key: 'gateway',
        label: 'TokenBucket Limiter',
        sub: 'RateLimit: 50k req/s',
        type: 'Filter',
        duration: '1.1ms',
        icon: '🛡️',
        color: 'text-indigo-400',
        border: 'border-indigo-500/40',
        bg: 'bg-indigo-950/30',
        filePath: 'src/main/java/com/codeflow/telemetry/RateLimitFilter.java',
        annotations: ['@Component', 'Bucket4j'],
        code: `ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);`
      },
      {
        key: 'controller',
        label: 'TelemetryController',
        sub: '@PostMapping batch',
        type: 'Controller',
        duration: '1.8ms',
        icon: '⚡',
        color: 'text-sky-400',
        border: 'border-sky-500/40',
        bg: 'bg-sky-950/30',
        filePath: 'src/main/java/com/codeflow/telemetry/TelemetryController.java',
        annotations: ['@RestController', '@Async'],
        code: `@PostMapping("/batch")
public ResponseEntity<Void> ingest(@RequestBody List<TelemetryEvent> events) {
    producer.sendBatch(events);
    return ResponseEntity.accepted().build();
}`
      },
      {
        key: 'service',
        label: 'Kafka Producer',
        sub: 'topic: telemetry-stream',
        type: 'Service',
        duration: '4.5ms',
        icon: '🛠️',
        color: 'text-blue-400',
        border: 'border-blue-500/40',
        bg: 'bg-blue-950/30',
        filePath: 'src/main/java/com/codeflow/telemetry/KafkaEventProducer.java',
        annotations: ['@Service', 'KafkaTemplate'],
        code: `kafkaTemplate.send("telemetry-stream", event.getTenantId(), event);`
      },
      {
        key: 'db',
        label: 'TimescaleDB',
        sub: 'Async Hypertable Insert',
        type: 'Database',
        duration: '0.8ms',
        icon: '🗄️',
        color: 'text-amber-400',
        border: 'border-amber-500/40',
        bg: 'bg-amber-950/30',
        filePath: 'src/main/java/com/codeflow/telemetry/TelemetryWorker.java',
        annotations: ['@KafkaListener'],
        code: `INSERT INTO telemetry_hypertable (time, tenant_id, metric, value) VALUES ...;`
      }
    ],
    sqlQuery: `INSERT INTO telemetry_hypertable (time, tenant_id, metric_name, duration_ms, status)
VALUES (NOW(), 'tenant_88', 'checkout.latency', 28.4, 200);`,
    sqlDuration: '0.8ms',
    jwtPayload: `{ "batch_size": 25, "compression": "gzip", "edge_id": "us-east-1a" }`,
    callStack: [
      { frame: '1. EdgeClient.flushBatch()', file: 'TelemetryClient.ts:44', duration: '0.9ms', type: 'CLIENT' },
      { frame: '2. TokenBucketLimiter.probe()', file: 'RateLimitFilter.java:28', duration: '1.1ms', type: 'RATE_LIMIT' },
      { frame: '3. TelemetryController.ingest()', file: 'TelemetryController.java:33', duration: '1.8ms', type: 'CONTROLLER' },
      { frame: '4. KafkaEventProducer.send()', file: 'KafkaEventProducer.java:51', duration: '4.5ms', type: 'KAFKA' },
      { frame: '5. HTTP 202 Accepted Response', file: 'TelemetryController.java:35', duration: '0.8ms', type: 'RESPONSE' }
    ]
  }
};

export default function App() {
  const { showToast } = useToast();
  const handleVoiceCommand = (command: string) => {
    const c = command.toLowerCase();
    if (c.includes('database') || c.includes('entity') || c.includes('erd')) {
      handleOpenToolDirectly('erd');
    } else if (c.includes('chaos') || c.includes('redis') || c.includes('failure') || c.includes('simulate')) {
      handleOpenToolDirectly('chaos');
    } else if (c.includes('glassmorphism')) {
      setCurrentTheme('GLASSMORPHISM');
    } else if (c.includes('night') || c.includes('dark')) {
      setCurrentTheme('NIGHT');
    } else if (c.includes('normal') || c.includes('light')) {
      setCurrentTheme('NORMAL');
    } else if (c.includes('neumorphic')) {
      setCurrentTheme('NEUMORPHIC');
    } else if (c.includes('typescript') || c.includes('dto')) {
      handleOpenToolDirectly('ts-generator');
    } else if (c.includes('heatmap') || c.includes('latency')) {
      handleOpenToolDirectly('heatmap');
    } else if (c.includes('test')) {
      handleOpenToolDirectly('test-gen');
    } else if (c.includes('docker') || c.includes('terraform') || c.includes('cloud')) {
      handleOpenToolDirectly('cloud-infra');
    } else if (c.includes('vscode') || c.includes('ide') || c.includes('sidecar')) {
      handleOpenToolDirectly('vscode');
    } else if (c.includes('chrome') || c.includes('extension')) {
      handleOpenToolDirectly('chrome-ext');
    } else if (c.includes('collab') || c.includes('webrtc') || c.includes('share')) {
      handleOpenToolDirectly('live-collab');
    } else if (c.includes('compliance') || c.includes('soc2') || c.includes('hipaa')) {
      handleOpenToolDirectly('compliance');
    } else if (c.includes('graphql') || c.includes('grpc') || c.includes('proto')) {
      handleOpenToolDirectly('graphql-grpc');
    } else if (c.includes('mesh') || c.includes('istio') || c.includes('envoy')) {
      handleOpenToolDirectly('service-mesh');
    } else {
      handleOpenAi(command, 'ARCHITECTURE');
    }
  };

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<NodeDetail | null>(null);

  // Modals
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
  const [isSqlExplorerOpen, setIsSqlExplorerOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isErDiagramOpen, setIsErDiagramOpen] = useState(false);
  const [isSecurityFlowOpen, setIsSecurityFlowOpen] = useState(false);
  const [isFileTreeOpen, setIsFileTreeOpen] = useState(false);
  const [isRuntimeTracingOpen, setIsRuntimeTracingOpen] = useState(false);
  const [isApiMetricsOpen, setIsApiMetricsOpen] = useState(false);
  const [isSequenceDiagramOpen, setIsSequenceDiagramOpen] = useState(false);
  const [isLatencyHeatmapOpen, setIsLatencyHeatmapOpen] = useState(false);
  const [isReactRuntimeOpen, setIsReactRuntimeOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [isApiSandboxOpen, setIsApiSandboxOpen] = useState(false);
  const [isTsGeneratorOpen, setIsTsGeneratorOpen] = useState(false);
  const [isChaosOpen, setIsChaosOpen] = useState(false);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isDriftOpen, setIsDriftOpen] = useState(false);
  const [isTestGenOpen, setIsTestGenOpen] = useState(false);
  const [isCloudInfraOpen, setIsCloudInfraOpen] = useState(false);
  const [isEventStreamOpen, setIsEventStreamOpen] = useState(false);
  const [isVoiceCopilotOpen, setIsVoiceCopilotOpen] = useState(false);
  const [isDistTracingOpen, setIsDistTracingOpen] = useState(false);
  const [isVsCodeOpen, setIsVsCodeOpen] = useState(false);
  const [isChromeExtOpen, setIsChromeExtOpen] = useState(false);
  const [isLiveCollabOpen, setIsLiveCollabOpen] = useState(false);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [isGraphqlGrpcOpen, setIsGraphqlGrpcOpen] = useState(false);
  const [isServiceMeshOpen, setIsServiceMeshOpen] = useState(false);
  const [viewingFilePath, setViewingFilePath] = useState<string | null>(null);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);
  const [aiInitialAnalysisType, setAiInitialAnalysisType] = useState<AiAnalysisType | undefined>(undefined);

  const closeAllModals = () => {
    setIsIngestModalOpen(false);
    setIsDependencyModalOpen(false);
    setIsSqlExplorerOpen(false);
    setIsAiAssistantOpen(false);
    setIsErDiagramOpen(false);
    setIsSecurityFlowOpen(false);
    setIsFileTreeOpen(false);
    setIsRuntimeTracingOpen(false);
    setIsApiMetricsOpen(false);
    setIsSequenceDiagramOpen(false);
    setIsLatencyHeatmapOpen(false);
    setIsReactRuntimeOpen(false);
    setIsCommandPaletteOpen(false);
    setIsScorecardOpen(false);
    setIsApiSandboxOpen(false);
    setIsTsGeneratorOpen(false);
    setIsChaosOpen(false);
    setIsBlueprintOpen(false);
    setIsDriftOpen(false);
    setIsTestGenOpen(false);
    setIsCloudInfraOpen(false);
    setIsEventStreamOpen(false);
    setIsVoiceCopilotOpen(false);
    setIsDistTracingOpen(false);
    setIsVsCodeOpen(false);
    setIsChromeExtOpen(false);
    setIsLiveCollabOpen(false);
    setIsComplianceOpen(false);
    setIsGraphqlGrpcOpen(false);
    setIsServiceMeshOpen(false);
    setViewingFilePath(null);
  };

  const handleOpenAi = (prompt?: string, analysisType?: AiAnalysisType) => {
    closeAllModals();
    setAiInitialPrompt(prompt);
    setAiInitialAnalysisType(analysisType);
    setIsAiAssistantOpen(true);
  };

  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('NIGHT');

  // Interactive Hero Workbench State
  const [activeScenarioKey, setActiveScenarioKey] = useState<ScenarioKey>('checkout');
  const [studioTab, setStudioTab] = useState<StudioTab>('flow');
  const [activeTraceStep, setActiveTraceStep] = useState(0);
  const [isPlayingTrace, setIsPlayingTrace] = useState(true);
  const [selectedStudioNodeIdx, setSelectedStudioNodeIdx] = useState(2);
  const [hasCopiedSql, setHasCopiedSql] = useState(false);

  const scenario = SCENARIOS[activeScenarioKey];
  const selectedNode = scenario.nodes[selectedStudioNodeIdx] || scenario.nodes[0];

  const isLight = currentTheme === 'NORMAL' || currentTheme === 'GLASSMORPHISM' || currentTheme === 'NEUMORPHIC';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Live Auto-play scrubber for hero workbench
  useEffect(() => {
    if (currentProjectId || !isPlayingTrace) return;
    const interval = setInterval(() => {
      setActiveTraceStep((prev) => (prev + 1) % scenario.nodes.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [currentProjectId, isPlayingTrace, scenario.nodes.length]);

  // Global Dialog State for Scroll Lock
  const isAnyModalOpen = isIngestModalOpen || isDependencyModalOpen || isSqlExplorerOpen ||
    isAiAssistantOpen || isErDiagramOpen || isSecurityFlowOpen || isFileTreeOpen ||
    isRuntimeTracingOpen || isApiMetricsOpen || isSequenceDiagramOpen || isLatencyHeatmapOpen ||
    isReactRuntimeOpen || isCommandPaletteOpen || isScorecardOpen || isApiSandboxOpen ||
    isTsGeneratorOpen || isChaosOpen || isBlueprintOpen || isDriftOpen || isTestGenOpen ||
    isCloudInfraOpen || isEventStreamOpen || isVoiceCopilotOpen || isDistTracingOpen || isVsCodeOpen || isChromeExtOpen || isLiveCollabOpen || isComplianceOpen || isGraphqlGrpcOpen || isServiceMeshOpen || viewingFilePath !== null;

  // Body Scroll Lock when modal is active (prevents background jumping)
  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAnyModalOpen]);

  // Global Keyboard Shortcuts (Esc = Close Modals, Ctrl+K = Command Palette, D = Demo, I = Ingest, Space = Scrubber)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Escape') {
        closeAllModals();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }
      if (e.key === 'd' || e.key === 'D') {
        if (!currentProjectId) {
          handleLoadDemoProject();
        }
      } else if (e.key === 'i' || e.key === 'I') {
        closeAllModals();
        setIsIngestModalOpen(true);
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (!currentProjectId) {
          setActiveTraceStep((prev) => (prev + 1) % scenario.nodes.length);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProjectId, scenario.nodes.length]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProjectNode[]>([]);

  const handleLoadDemoProject = () => {
    setCurrentProjectId(DEMO_PROJECT_DATA.id);
    setProject(DEMO_PROJECT_DATA);
    setGraphData(DEMO_GRAPH_DATA);
    setSelectedNodeId(undefined);
    setSelectedNodeDetail(null);
  };

  const handleOpenToolDirectly = (toolKey: string) => {
    if (!currentProjectId) {
      handleLoadDemoProject();
    }
    closeAllModals();
    if (toolKey === 'tracing') setIsRuntimeTracingOpen(true);
    else if (toolKey === 'metrics') setIsApiMetricsOpen(true);
    else if (toolKey === 'sequence') setIsSequenceDiagramOpen(true);
    else if (toolKey === 'heatmap') setIsLatencyHeatmapOpen(true);
    else if (toolKey === 'erd') setIsErDiagramOpen(true);
    else if (toolKey === 'security') setIsSecurityFlowOpen(true);
    else if (toolKey === 'sql') setIsSqlExplorerOpen(true);
    else if (toolKey === 'deps') setIsDependencyModalOpen(true);
    else if (toolKey === 'ai') setIsAiAssistantOpen(true);
    else if (toolKey === 'files') setIsFileTreeOpen(true);
    else if (toolKey === 'react' || toolKey === 'fiber') setIsReactRuntimeOpen(true);
    else if (toolKey === 'scorecard') setIsScorecardOpen(true);
    else if (toolKey === 'api-sandbox' || toolKey === 'sandbox') setIsApiSandboxOpen(true);
    else if (toolKey === 'ts-generator' || toolKey === 'ts') setIsTsGeneratorOpen(true);
    else if (toolKey === 'chaos') setIsChaosOpen(true);
    else if (toolKey === 'blueprint' || toolKey === 'export-c4') setIsBlueprintOpen(true);
    else if (toolKey === 'drift') setIsDriftOpen(true);
    else if (toolKey === 'test-gen' || toolKey === 'test') setIsTestGenOpen(true);
    else if (toolKey === 'cloud-infra' || toolKey === 'cloud' || toolKey === 'docker') setIsCloudInfraOpen(true);
    else if (toolKey === 'event-stream' || toolKey === 'kafka' || toolKey === 'events') setIsEventStreamOpen(true);
    else if (toolKey === 'voice' || toolKey === 'copilot') setIsVoiceCopilotOpen(true);
    else if (toolKey === 'dist-tracing' || toolKey === 'otel') setIsDistTracingOpen(true);
    else if (toolKey === 'vscode' || toolKey === 'sidecar') setIsVsCodeOpen(true);
    else if (toolKey === 'chrome-ext' || toolKey === 'chrome') setIsChromeExtOpen(true);
    else if (toolKey === 'live-collab' || toolKey === 'collab') setIsLiveCollabOpen(true);
    else if (toolKey === 'compliance' || toolKey === 'soc2') setIsComplianceOpen(true);
    else if (toolKey === 'graphql-grpc' || toolKey === 'graphql' || toolKey === 'grpc') setIsGraphqlGrpcOpen(true);
    else if (toolKey === 'service-mesh' || toolKey === 'mesh' || toolKey === 'istio') setIsServiceMeshOpen(true);
  };

  useEffect(() => {
    if (!currentProjectId || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      axios
        .get<ProjectNode[]>(`/api/v1/projects/${currentProjectId}/search?q=${searchQuery}`)
        .then((res) => setSearchResults(Array.isArray(res.data) ? res.data : []))
        .catch(() => setSearchResults([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [currentProjectId, searchQuery]);

  const handleSelectSearchResult = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleExitProject = () => {
    setCurrentProjectId(null);
    setProject(null);
    setGraphData({ nodes: [], edges: [] });
    setSelectedNodeId(undefined);
    setSelectedNodeDetail(null);
  };

  useEffect(() => {
    if (!currentProjectId) return;

    if (currentProjectId === DEMO_PROJECT_DATA.id) {
      setProject(DEMO_PROJECT_DATA);
      setGraphData(DEMO_GRAPH_DATA);
      return;
    }

    axios
      .get<Project>(`/api/v1/projects/${currentProjectId}`)
      .then((res) => setProject(res.data))
      .catch((err) => console.error('Failed to fetch project:', err));

    axios
      .get<GraphData>(`/api/v1/projects/${currentProjectId}/graph`)
      .then((res) => setGraphData({
        nodes: Array.isArray(res.data?.nodes) ? res.data.nodes : [],
        edges: Array.isArray(res.data?.edges) ? res.data.edges : []
      }))
      .catch((err) => console.error('Failed to fetch graph data:', err));
  }, [currentProjectId]);

  useEffect(() => {
    if (!currentProjectId || !selectedNodeId) {
      setSelectedNodeDetail(null);
      return;
    }

    axios
      .get<NodeDetail>(`/api/v1/projects/${currentProjectId}/nodes/${selectedNodeId}`)
      .then((res) => setSelectedNodeDetail(res.data))
      .catch((err) => console.error('Failed to fetch node detail:', err));
  }, [currentProjectId, selectedNodeId]);

  const handleExportMarkdown = () => {
    if (!currentProjectId || !project) return;
    const markdownContent = `# Architectural Documentation: ${project.name}
Generated by CodeFlow Studio v5.0

## Project Overview
- **Name**: ${project.name}
- **Status**: ${project.status}
- **Progress**: ${project.progressPercentage}%
- **Total Controllers**: ${project.controllerCount}
- **Total Services**: ${project.serviceCount}
- **Total Repositories**: ${project.repositoryCount}

## Architectural Nodes (${graphData.nodes?.length || 0})
${(Array.isArray(graphData.nodes) ? graphData.nodes : []).map((n) => `- **${n.data?.label || n.id}** (${n.data?.nodeType || 'Node'}) - ${n.data?.filePath || 'Internal'}`).join('\n')}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}-architecture.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(scenario.sqlQuery);
    setHasCopiedSql(true);
    setTimeout(() => setHasCopiedSql(false), 2000);
  };

  const getPageBgClass = () => {
    switch (currentTheme) {
      case 'NEUMORPHIC': return 'bg-[#e0e5ec] text-[#2d3748]';
      case 'GLASSMORPHISM': return 'bg-[#eef2f6] text-slate-900';
      case 'NORMAL': return 'bg-[#f8fafc] text-slate-900';
      default: return 'bg-[#090d16] text-slate-100';
    }
  };

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col font-sans select-none ${getPageBgClass()}`}>
      <Header
        currentProjectName={project?.name}
        onOpenCommandPalette={() => { closeAllModals(); setIsCommandPaletteOpen(true); }}
        onOpenScorecard={() => handleOpenToolDirectly('scorecard')}
        onOpenApiSandbox={() => handleOpenToolDirectly('api-sandbox')}
        onOpenTsGenerator={() => handleOpenToolDirectly('ts-generator')}
        onOpenChaos={() => handleOpenToolDirectly('chaos')}
        onOpenBlueprint={() => handleOpenToolDirectly('blueprint')}
        onOpenVoiceCopilot={() => { closeAllModals(); setIsVoiceCopilotOpen(true); }}
        onOpenDrift={() => handleOpenToolDirectly('drift')}
        onOpenTestGen={() => handleOpenToolDirectly('test-gen')}
        onOpenCloudInfra={() => handleOpenToolDirectly('cloud-infra')}
        onOpenEventStream={() => handleOpenToolDirectly('event-stream')}
        onOpenDistTracing={() => handleOpenToolDirectly('dist-tracing')}
        currentProjectId={currentProjectId}
        onLoadDemo={handleLoadDemoProject}
        onOpenIngestModal={() => { closeAllModals(); setIsIngestModalOpen(true); }}
        onOpenDependencies={() => handleOpenToolDirectly('deps')}
        onOpenSqlExplorer={() => handleOpenToolDirectly('sql')}
        onOpenAiAssistant={() => handleOpenAi()}
        onOpenErDiagram={() => handleOpenToolDirectly('erd')}
        onOpenSecurityFlow={() => handleOpenToolDirectly('security')}
        onOpenFileTree={() => handleOpenToolDirectly('files')}
        onOpenRuntimeTracing={() => handleOpenToolDirectly('tracing')}
        onOpenApiMetrics={() => handleOpenToolDirectly('metrics')}
        onOpenSequenceDiagram={() => handleOpenToolDirectly('sequence')}
        onOpenLatencyHeatmap={() => handleOpenToolDirectly('heatmap')}
        onOpenReactRuntime={() => handleOpenToolDirectly('react')}
        onExportMarkdown={handleExportMarkdown}
        onExitProject={handleExitProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onSelectSearchResult={handleSelectSearchResult}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {!currentProjectId ? (
          /* ========================================================================= */
          /* PREMIUM HANDCRAFTED DEVELOPER LANDING STUDIO                               */
          /* ========================================================================= */
          <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-10 flex flex-col items-center relative transition-colors duration-200 ${getPageBgClass()}`}>
            {/* Top Atmospheric Radial Glow (Subtle Cyan & Indigo) */}
            <div className="absolute top-0 inset-x-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.1),rgba(99,102,241,0.1),transparent_70%)] pointer-events-none" />

            {/* 1. Release Eyebrow Chip */}
            <div className={`inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold mb-6 transition-all ${
              isLight
                ? 'bg-sky-500/10 text-sky-700 border border-sky-500/30'
                : 'bg-sky-500/10 text-sky-300 border border-sky-500/30 shadow-md shadow-sky-500/5'
            }`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CODEFLOW STUDIO 5.0 • REACT 19 & SPRING BOOT 3 RUNTIME ENGINE</span>
            </div>

            {/* 2. Hero Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-center max-w-4xl tracking-tight leading-[1.14] mb-4">
              <span className={isLight ? 'text-slate-900' : 'text-slate-50'}>
                Observe, Replay &amp; Master Real Code Execution.
              </span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400">
                From HTTP Request to Hibernate SQL in Milliseconds.
              </span>
            </h1>

            {/* 3. Hero Subtitle */}
            <p className={`text-sm md:text-base max-w-3xl text-center leading-relaxed mb-8 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              A developer-first visual IDE and execution debugger for <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>Spring Boot 3</strong> and <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>React 19</strong>. Step through runtime call-stacks, inspect security filter chains, explore relational schemas, and audit performance bottlenecks.
            </p>

            {/* 4. Main Action Hub (CTAs + Keyboard Hints) */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 z-10">
              <button
                onClick={handleLoadDemoProject}
                className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-sm font-bold text-white shadow-xl shadow-sky-600/25 transition-all transform hover:scale-[1.02] active:scale-98 group"
              >
                <Play className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
                <span>Launch Full Studio (Demo Mode)</span>
                <span className="keycap ml-1">D</span>
              </button>

              <button
                onClick={() => setIsIngestModalOpen(true)}
                className={`w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all transform hover:scale-[1.02] active:scale-98 ${
                  isLight
                    ? 'bg-white border border-slate-300 text-slate-800 shadow-sm hover:bg-slate-50'
                    : 'bg-[#0f172a] border border-slate-700/80 text-slate-200 hover:border-slate-500 shadow-lg'
                }`}
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Import Repository / ZIP</span>
                <span className="keycap ml-1">I</span>
              </button>
            </div>

            {/* Mobile 1-Tap Quick Launch Tools Grid */}
            <div className="w-full sm:hidden mb-8">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  ⚡ All 12 Visual Tools (1-Tap Launch)
                </span>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">● 100% Offline</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { title: 'React 19 Runtime', icon: Activity, key: 'react', col: 'text-sky-400', badge: 'v5.0' },
                  { title: 'Runtime Tracing', icon: Activity, key: 'tracing', col: 'text-cyan-400', badge: 'v4.2' },
                  { title: 'API Metrics', icon: BarChart2, key: 'metrics', col: 'text-indigo-400', badge: 'P95' },
                  { title: 'Sequence Tracer', icon: Zap, key: 'sequence', col: 'text-amber-400', badge: '7-Hop' },
                  { title: '24h Heatmap', icon: Flame, key: 'heatmap', col: 'text-orange-400', badge: 'Matrix' },
                  { title: 'Database ERD', icon: Database, key: 'erd', col: 'text-emerald-400', badge: 'Schema' },
                  { title: 'Security Chain', icon: ShieldCheck, key: 'security', col: 'text-indigo-400', badge: 'JWT' },
                  { title: 'AI Assistant', icon: Bot, key: 'ai', col: 'text-sky-400', badge: 'Audit' },
                  { title: 'SQL Explorer', icon: Database, key: 'sql', col: 'text-blue-400', badge: 'JPA' },
                  { title: 'Dependencies', icon: Package, key: 'deps', col: 'text-indigo-300', badge: 'Maven' },
                  { title: 'File Tree', icon: FolderTree, key: 'files', col: 'text-cyan-300', badge: '5 Views' },
                ].map((tool, i) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleOpenToolDirectly(tool.key)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all active:scale-95 shadow-sm ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                          : 'bg-slate-900/90 border-slate-800 text-slate-100 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${tool.col}`} />
                        <span className="text-xs font-mono font-bold truncate max-w-[85px]">
                          {tool.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">
                        {tool.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Live Telemetry Strip */}
            <div className={`flex flex-wrap items-center justify-center gap-4 md:gap-8 px-6 py-2.5 rounded-2xl text-xs font-mono mb-12 shadow-sm border ${
              isLight
                ? 'bg-white border-slate-200 text-slate-600'
                : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
            }`}>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className={isLight ? 'text-slate-800 font-medium' : 'text-slate-300'}>12 Visual Architecture Tools</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className={isLight ? 'text-slate-800 font-medium' : 'text-slate-300'}>7-Hop Tracing Engine</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className={isLight ? 'text-slate-800 font-medium' : 'text-slate-300'}>100% Offline Demo Mode</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span className={isLight ? 'text-slate-800 font-medium' : 'text-slate-300'}>Spring Security 6 Audit</span>
              </div>
            </div>

            {/* 5.1 Interactive System Architecture Graphic Illustration */}
            <div className="w-full max-w-5xl mb-12">
              <ArchitectureIllustration
                currentTheme={currentTheme}
                onExploreLayer={(layer) => {
                  if (layer === 'client') handleOpenToolDirectly('react');
                  else if (layer === 'gateway') handleOpenToolDirectly('security');
                  else if (layer === 'controller') handleOpenToolDirectly('tracing');
                  else if (layer === 'service') handleOpenToolDirectly('sequence');
                  else if (layer === 'cache') handleOpenToolDirectly('metrics');
                  else if (layer === 'database') handleOpenToolDirectly('sql');
                }}
              />
            </div>

            {/* ===================================================================== */}
            {/* 6. THE LIVE INTERACTIVE WORKBENCH (Core Hands-On Simulation Sandbox)   */}
            {/* ===================================================================== */}
            <div className={`w-full max-w-5xl rounded-2xl border mb-16 overflow-hidden relative shadow-2xl transition-colors duration-200 ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-[#0c1222]/95 border-slate-800/90 text-slate-100'
            }`}>
              {/* macOS Window Chrome Header */}
              <div className={`px-5 py-3 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0a0f1d] border-slate-800'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-slate-400">|</span>
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="text-slate-400 font-bold">Workbench:</span>
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{scenario.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                      {scenario.method} {scenario.endpoint}
                    </span>
                  </div>
                </div>

                {/* Scenario Selector Chips */}
                <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar">
                  {(Object.keys(SCENARIOS) as ScenarioKey[]).map((key) => {
                    const sc = SCENARIOS[key];
                    const isSelected = key === activeScenarioKey;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setActiveScenarioKey(key);
                          setActiveTraceStep(0);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                          isSelected
                            ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md'
                            : isLight
                            ? 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
                            : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        <span>{sc.icon}</span>
                        <span>{sc.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Workbench Navigation Tab Bar */}
              <div className={`px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${
                isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-[#0d1428] border-slate-800/80'
              }`}>
                <div className={`flex items-center space-x-1 p-1 rounded-xl border ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950/60 border-slate-800/80'
                }`}>
                  {[
                    { key: 'flow', label: '⚡ Architecture Flow' },
                    { key: 'trace', label: '🎬 Trace Replay & Stack' },
                    { key: 'security', label: '🔐 Security Filter Chain' },
                    { key: 'sql', label: '🗄️ Relational Schema & SQL' },
                    { key: 'metrics', label: '📊 Latency Matrix' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setStudioTab(t.key as StudioTab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                        studioTab === t.key
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : isLight
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <span className="text-emerald-500 font-bold">● {scenario.status}</span>
                  <span>•</span>
                  <span>Duration: {scenario.totalDuration}</span>
                </div>
              </div>

              {/* Workbench Main Content Body */}
              <div className="p-6">
                {/* TAB 1: ARCHITECTURE FLOW */}
                {studioTab === 'flow' && (
                  <div>
                    {/* Top Scrubber & Controls */}
                    <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
                      isLight ? 'border-slate-200' : 'border-slate-800/80'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setIsPlayingTrace(!isPlayingTrace)}
                          className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                            isPlayingTrace
                              ? 'bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-600/20'
                              : isLight
                              ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          {isPlayingTrace ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isPlayingTrace ? 'Auto-Advancing' : 'Play Flow'}</span>
                        </button>
                        <button
                          onClick={() => setActiveTraceStep((prev) => (prev + 1) % scenario.nodes.length)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                            isLight
                              ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          <span>Step Next</span>
                          <span className="keycap">Space</span>
                        </button>
                      </div>

                      <div className="text-xs font-mono text-slate-400">
                        Active Step <span className="text-sky-400 font-bold">{activeTraceStep + 1}</span> of {scenario.nodes.length}:{' '}
                        <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{scenario.nodes[activeTraceStep]?.label}</span>
                      </div>
                    </div>

                    {/* 5-Node Interactive Visual Flow */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 mb-6 relative">
                      {scenario.nodes.map((n, idx) => {
                        const isCurrentActive = idx === activeTraceStep;
                        const isNodeSelected = idx === selectedStudioNodeIdx;
                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setSelectedStudioNodeIdx(idx);
                              setActiveTraceStep(idx);
                            }}
                            className={`cursor-pointer p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between relative group ${
                              isCurrentActive
                                ? 'ring-2 ring-sky-500 shadow-lg scale-[1.02] z-10 ' + (isLight ? 'bg-sky-50 border-sky-400 text-slate-900' : 'bg-slate-900 border-sky-400 text-white')
                                : isNodeSelected
                                ? (isLight ? 'bg-slate-100 border-indigo-400 text-slate-900' : 'bg-[#151f38] border-indigo-500 text-white')
                                : isLight
                                ? 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                : `${n.bg} ${n.border} opacity-85 hover:opacity-100`
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xl">{n.icon}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                  isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}>
                                  {n.duration}
                                </span>
                              </div>
                              <h4 className={`text-xs font-mono font-bold truncate ${isCurrentActive ? 'text-sky-500' : isLight ? 'text-slate-900' : n.color}`}>
                                {n.label}
                              </h4>
                              <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                                {n.sub}
                              </p>
                            </div>

                            <div className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${
                              isLight ? 'border-slate-100 text-slate-400' : 'border-slate-800/60 text-slate-500'
                            }`}>
                              <span>{n.type}</span>
                              <span className="group-hover:text-sky-400 transition-colors">Inspect →</span>
                            </div>

                            {/* Active Step Indicator Badge */}
                            {isCurrentActive && (
                              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-sky-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-md">
                                {idx + 1}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Node Detail Code & Annotation Inspector */}
                    <div className="rounded-xl bg-slate-950 border border-slate-800/90 p-4 font-mono text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-3">
                        <div className="flex items-center space-x-2 text-slate-300">
                          <FileCode className="w-4 h-4 text-sky-400" />
                          <span className="text-slate-400">Inspecting:</span>
                          <span className="text-white font-bold">{selectedNode.label}</span>
                          <span className="text-slate-500">({selectedNode.filePath})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedNode.annotations.map((ann, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20">
                              {ann}
                            </span>
                          ))}
                        </div>
                      </div>

                      <pre className="p-3.5 rounded-xl bg-[#070a12] text-slate-300 overflow-x-auto text-[11px] leading-relaxed border border-slate-900">
                        <code>{selectedNode.code}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* TAB 2: TRACE REPLAY & CALL STACK */}
                {studioTab === 'trace' && (
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-mono font-bold text-white">Execution Call Stack Scrubber</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">Total Latency: {scenario.totalDuration}</span>
                    </div>

                    <div className="space-y-2 mb-6">
                      {scenario.callStack.map((frame, idx) => {
                        const isCurrent = idx === activeTraceStep;
                        return (
                          <div
                            key={idx}
                            onClick={() => setActiveTraceStep(idx)}
                            className={`cursor-pointer p-3 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                              isCurrent
                                ? 'bg-sky-950/40 border-sky-500 shadow-md ring-1 ring-sky-500/40 text-sky-200'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isCurrent ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {idx + 1}
                              </span>
                              <span className="font-bold">{frame.frame}</span>
                              <span className="text-slate-500 text-[10px]">({frame.file})</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                                {frame.type}
                              </span>
                              <span className="font-bold text-emerald-400">{frame.duration}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* JSON Payload Inspector */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                      <div className="flex items-center justify-between mb-2 text-slate-400">
                        <span>Resolved JWT Claims &amp; Context:</span>
                        <span className="text-emerald-400">● Verified Signature (HS256)</span>
                      </div>
                      <pre className="p-3 rounded-lg bg-[#070a12] text-sky-300 text-[11px] leading-relaxed border border-slate-900">
                        <code>{scenario.jwtPayload}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* TAB 3: SECURITY FILTER CHAIN */}
                {studioTab === 'security' && (
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-mono font-bold text-white">Spring Security 6.2 Stateless Filter Pipeline</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Authentication Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      {[
                        { title: '1. CorsFilter', status: 'ALLOW', desc: 'Origin: localhost:5173', col: 'text-emerald-400' },
                        { title: '2. JwtAuthenticationFilter', status: 'VALIDATED', desc: 'Bearer Token HS256', col: 'text-indigo-400' },
                        { title: '3. SecurityContextHolder', status: 'POPULATED', desc: 'Principal: User(42)', col: 'text-cyan-400' },
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono font-bold text-white">{item.title}</span>
                            <span className={`text-[10px] font-mono font-bold ${item.col}`}>{item.status}</span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                      <div className="text-slate-400 mb-2">Decoded Principal Context:</div>
                      <pre className="p-3 rounded-lg bg-[#070a12] text-indigo-300 text-[11px] leading-relaxed border border-slate-900">
                        <code>{scenario.jwtPayload}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* TAB 4: RELATIONAL SCHEMA & SQL */}
                {studioTab === 'sql' && (
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-mono font-bold text-white">Live JPA SQL Query Execution</span>
                      </div>
                      <button
                        onClick={copySqlToClipboard}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white flex items-center space-x-1"
                      >
                        {hasCopiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{hasCopiedSql ? 'Copied' : 'Copy SQL'}</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs mb-4">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                        <span>Executed Prepared Statement:</span>
                        <span className="text-amber-400 font-bold">Execution Time: {scenario.sqlDuration}</span>
                      </div>
                      <pre className="p-4 rounded-lg bg-[#070a12] text-amber-300 text-[12px] leading-relaxed border border-slate-900 overflow-x-auto">
                        <code>{scenario.sqlQuery}</code>
                      </pre>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Isolation Level</div>
                        <div className="text-white font-bold mt-0.5">READ COMMITTED</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">HikariCP Connection Pool</div>
                        <div className="text-emerald-400 font-bold mt-0.5">Active: 1 / Idle: 9</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Transaction Status</div>
                        <div className="text-cyan-400 font-bold mt-0.5">COMMITTED (0 Rollbacks)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: LATENCY MATRIX & METRICS */}
                {studioTab === 'metrics' && (
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <BarChart2 className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-mono font-bold text-white">24-Hour Latency Distribution &amp; Quantiles</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-bold">● Healthy Service SLO</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono">
                      {[
                        { label: 'P50 Latency', val: '12.4ms', col: 'text-emerald-400' },
                        { label: 'P90 Latency', val: '24.8ms', col: 'text-cyan-400' },
                        { label: 'P95 Latency', val: '28.4ms', col: 'text-indigo-400' },
                        { label: 'P99 Latency', val: '46.1ms', col: 'text-amber-400' },
                      ].map((m, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{m.label}</span>
                          <div className={`text-lg font-extrabold mt-0.5 ${m.col}`}>{m.val}</div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="text-xs font-mono text-slate-400 mb-3">24-Hour Hourly Heatmap Quantiles:</div>
                      <div className="grid grid-cols-12 gap-1.5">
                        {Array.from({ length: 24 }).map((_, h) => {
                          const isSpike = h === 14 || h === 20;
                          return (
                            <div
                              key={h}
                              className={`h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-transform hover:scale-105 cursor-pointer ${
                                isSpike
                                  ? 'bg-amber-500/80 text-slate-950'
                                  : h % 2 === 0
                                  ? 'bg-indigo-600/70 text-white'
                                  : 'bg-indigo-900/60 text-indigo-200'
                              }`}
                              title={`Hour ${h}:00 - ${isSpike ? '48ms (Spike)' : '18ms (Normal)'}`}
                            >
                              <span>{h}h</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Quick-Launch Bar */}
              <div className={`px-6 py-3.5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#090d16] border-slate-800/80'
              }`}>
                <span className="text-xs font-mono text-slate-400">
                  Ready to explore all models, dependencies, and execution logs?
                </span>
                <button
                  onClick={handleLoadDemoProject}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-xs font-mono font-bold text-white shadow-md transition-transform hover:scale-105"
                >
                  Open Full Studio Canvas →
                </button>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 7. ALL 12 VISUAL ARCHITECTURE TOOLS SPOTLIGHT SHOWCASE               */}
            {/* ===================================================================== */}
            <div className="w-full max-w-5xl mb-12">
              <div className="text-center mb-8">
                <h3 className={`text-xl md:text-2xl font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  29 Specialized Visual Architecture Tools
                </h3>
                <p className="text-xs md:text-sm text-slate-400 font-mono mt-1">
                  Click any card to launch interactive demo mode directly into that tool
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: 'React 19 Runtime Explorer',
                    desc: 'Virtual DOM Fiber tree reconciliation, Hook state mutation timeline, and Axios interceptors.',
                    icon: Activity,
                    col: 'text-sky-400',
                    key: 'react',
                    badge: 'v5.0 Core',
                    graphic: ReactRuntimeGraphic,
                    preview: '⚛️ useMutation(createOrder) ➔ Fiber Tree Re-render'
                  },
                  {
                    title: 'Runtime Tracing Replay',
                    desc: 'Step-by-step VCR playback tracing requests from Controller down to Hibernate and PostgreSQL.',
                    icon: Activity,
                    col: 'text-cyan-400',
                    key: 'tracing',
                    badge: 'v4.2 Engine',
                    graphic: TracingGraphic,
                    preview: '▶ Step 4/5: OrderService.createOrder() (16.2ms)'
                  },
                  {
                    title: 'API Metrics & Telemetry',
                    desc: 'Real-time P50/P90/P95/P99 latency distribution, throughput RPS, and bottleneck diagnostics.',
                    icon: BarChart2,
                    col: 'text-indigo-400',
                    key: 'metrics',
                    badge: 'Telemetry',
                    graphic: ApiMetricsGraphic,
                    preview: '📊 P95 Latency: 28.4ms • 14,200 req/min'
                  },
                  {
                    title: '7-Swimlane Sequence Tracer',
                    desc: 'Asynchronous request and response lifecycle mapping across Controller, Service, Cache, and DB.',
                    icon: Zap,
                    col: 'text-amber-400',
                    key: 'sequence',
                    badge: '7 Swimlanes',
                    graphic: SequenceGraphic,
                    preview: '⚡ Controller ➔ JWT Filter ➔ Service ➔ JPA'
                  },
                  {
                    title: '24-Hour Latency Heatmap',
                    desc: 'Hourly quantile matrix diagnosing traffic bursts, cache invalidations, and query spikes.',
                    icon: Flame,
                    col: 'text-orange-400',
                    key: 'heatmap',
                    badge: '24h Matrix',
                    graphic: HeatmapGraphic,
                    preview: '🔥 24-Column Timeline Matrix with Hover Tooltips'
                  },
                  {
                    title: 'Database ERD & SQL Explorer',
                    desc: 'Relational entity diagrams, foreign key linkages, and live executed prepared statements.',
                    icon: Database,
                    col: 'text-emerald-400',
                    key: 'erd',
                    badge: 'JPA Schema',
                    graphic: ErdGraphic,
                    preview: '🗄️ orders ➔ order_items ➔ users (FK Linked)'
                  },
                  {
                    title: 'AI Code & Security Assistant',
                    desc: 'Architectural explanations, Spring Security compliance auditing, and query reviews.',
                    icon: Bot,
                    col: 'text-sky-400',
                    key: 'ai',
                    badge: 'AI Explainer',
                    graphic: AiGraphic,
                    preview: '🤖 "Detected @Transactional with READ_COMMITTED"'
                  },
                  {
                    title: 'Live SQL Query Explorer',
                    desc: 'Inspect executed SQL queries, query execution plans, and transaction boundaries.',
                    icon: Database,
                    col: 'text-blue-400',
                    key: 'sql',
                    badge: 'JPA Queries',
                    graphic: SqlGraphic,
                    preview: '⚡ SELECT id, total_amount FROM orders WHERE user_id = 42'
                  },
                  {
                    title: 'Maven Dependency Graph',
                    desc: 'Analyze project starters, external libraries, CVE vulnerabilities, and transitive links.',
                    icon: Package,
                    col: 'text-indigo-300',
                    key: 'deps',
                    badge: 'Maven BOM',
                    graphic: DepsGraphic,
                    preview: '📦 spring-boot-starter-data-jpa (3.2.0)'
                  },
                  {
                    title: 'Interactive File Tree',
                    desc: 'Explore source files by Layer, Feature, MVC Pattern, Framework, or Raw Directory structure.',
                    icon: FolderTree,
                    col: 'text-cyan-300',
                    key: 'files',
                    badge: '5 Views',
                    graphic: FileTreeGraphic,
                    preview: '📁 /src/main/java/com/codeflow/order'
                  },
                  {
                    title: 'Architecture Spec Exporter',
                    desc: 'Export comprehensive architectural markdown with entity inventories and API schemas.',
                    icon: Package,
                    col: 'text-emerald-400',
                    key: 'export',
                    badge: 'Documentation',
                    graphic: ExportGraphic,
                    preview: '📄 Instant PDF & Markdown Architectural Spec'
                  },
                  {
                    title: 'Architecture Health Scorecard',
                    desc: 'Continuous static AST audit dials: Security (94%), SQL (88%), CVE (98%), React 19 (92%).',
                    icon: Activity,
                    col: 'text-emerald-400',
                    key: 'scorecard',
                    badge: 'NEW HUD',
                    graphic: ScorecardGraphic,
                    preview: '📊 Grade A+ (93%) • 1-Click AI Remediation'
                  },
                  {
                    title: 'REST API Sandbox & cURL',
                    desc: 'Test Spring Boot endpoints, inject JWT headers, and export snippets to cURL, Fetch, Axios & Python.',
                    icon: Terminal,
                    col: 'text-cyan-400',
                    key: 'api-sandbox',
                    badge: 'NEW API',
                    graphic: SandboxGraphic,
                    preview: '⚡ POST /api/v1/orders/checkout ➔ 201 Created'
                  },
                  {
                    title: 'Java DTO ➔ TypeScript Generator',
                    desc: 'Instantly convert Spring JPA entities & Java record classes into strict TypeScript and Zod schemas.',
                    icon: Code2,
                    col: 'text-blue-400',
                    key: 'ts-generator',
                    badge: 'NEW Bridge',
                    graphic: TsGenGraphic,
                    preview: '🔄 UserEntity.java ➔ export interface UserDto'
                  },
                  {
                    title: 'Chaos & Resilience Simulator',
                    desc: 'Simulate HikariCP pool starvation, Stripe 504 timeouts, and visualize Resilience4j circuit states.',
                    icon: Flame,
                    col: 'text-rose-400',
                    key: 'chaos',
                    badge: 'NEW Chaos',
                    graphic: ChaosGraphic,
                    preview: '💥 CLOSED ➔ OPEN ➔ HALF_OPEN State Machine'
                  },
                  {
                    title: '4K Blueprint & C4 Exporter',
                    desc: 'Generate scalable 4K SVG architecture diagrams, C4 models, and PlantUML / Mermaid RFC specs.',
                    icon: Sparkles,
                    col: 'text-purple-400',
                    key: 'blueprint',
                    badge: 'NEW Vector',
                    graphic: BlueprintGraphic,
                    preview: '🖼️ C4 Level 1/2/3 Diagram & 4K SVG Export'
                  },
                  {
                    title: 'Git PR Architecture Drift',
                    desc: 'Compare pull request branches against main to detect layer boundary breaches and API drift.',
                    icon: GitBranch,
                    col: 'text-amber-400',
                    key: 'drift',
                    badge: 'v8.0 Drift',
                    graphic: DriftGraphic,
                    preview: '⚠️ 1 Layer Violation in PaymentWebhook'
                  },
                  {
                    title: 'Automated E2E Test Suite Generator',
                    desc: 'Generate RestAssured Java tests and Playwright TypeScript suites with auth headers & status assertions.',
                    icon: CheckCircle2,
                    col: 'text-emerald-400',
                    key: 'test-gen',
                    badge: 'v8.0 Test',
                    graphic: TestGenGraphic,
                    preview: '🧪 RestAssured & Playwright Contract Tests'
                  },
                  {
                    title: 'Cloud IaC & Docker Synthesizer',
                    desc: 'Auto-synthesize multi-container Docker Compose, AWS Terraform modules & Kubernetes manifests.',
                    icon: Server,
                    col: 'text-sky-400',
                    key: 'cloud-infra',
                    badge: 'v8.0 Cloud',
                    graphic: CloudInfraGraphic,
                    preview: '🐳 Docker Compose + AWS ECS Terraform'
                  },
                  {
                    title: 'Kafka & WebSocket Event Streams',
                    desc: 'Visualize Kafka topics, consumer groups, and live WebSocket / SSE channels with test payload publisher.',
                    icon: Zap,
                    col: 'text-purple-400',
                    key: 'event-stream',
                    badge: 'v8.0 Events',
                    graphic: EventStreamGraphic,
                    preview: '📻 orders.created (3 Consumer Groups • 0 Lag)'
                  },
                  {
                    title: 'OpenTelemetry Distributed Tracing',
                    desc: 'Multi-service span waterfall with automated critical-path bottleneck isolation and W3C TraceContext.',
                    icon: Activity,
                    col: 'text-cyan-400',
                    key: 'dist-tracing',
                    badge: 'v8.0 OTel',
                    graphic: DistributedTracingGraphic,
                    preview: '📊 48.2ms Total Latency (7 Spans Breakdown)'
                  },
                  {
                    title: 'Voice Architecture Copilot',
                    desc: 'Speak natural hands-free commands to audit DB, simulate chaos, switch themes & trigger AI remediation.',
                    icon: Sparkles,
                    col: 'text-pink-400',
                    key: 'voice',
                    badge: 'v8.0 Voice',
                    graphic: VoiceCopilotGraphic,
                    preview: '🎙️ &quot;Audit database entity relationships&quot;'
                  },
                  {
                    title: 'VS Code IDE Sidecar & Extension',
                    desc: 'Bidirectional WebSocket LSP sidecar, TypeScript manifest compiler, and active-editor architecture synchronization.',
                    icon: Monitor,
                    col: 'text-blue-400',
                    key: 'vscode',
                    badge: 'v9.0 NEW',
                    graphic: VsCodeGraphic,
                    preview: '💻 ws://127.0.0.1:4000 • Active: OrderController.java'
                  },
                  {
                    title: 'Chrome Extension & GitHub DOM',
                    desc: 'Manifest V3 injector overlaying interactive CodeFlow badges, layer badges, and flow buttons right on GitHub.',
                    icon: Globe,
                    col: 'text-pink-400',
                    key: 'chrome-ext',
                    badge: 'v9.0 NEW',
                    graphic: ChromeExtGraphic,
                    preview: '🌐 GitHub Overlay • [⚡ View Flow] Injected on PR #42'
                  },
                  {
                    title: 'WebRTC Live Collab & Whiteboard',
                    desc: 'Real-time peer-to-peer architecture review room with multi-cursor broadcasting, live chat & whiteboard pins.',
                    icon: Users,
                    col: 'text-emerald-400',
                    key: 'live-collab',
                    badge: 'v9.0 NEW',
                    graphic: LiveCollabGraphic,
                    preview: '👥 3 Peers Connected (Mesh P2P) • 0ms Relay Latency'
                  },
                  {
                    title: 'Zero-Trust Compliance Matrix',
                    desc: 'Automated policy validator auditing SOC2 Type II, ISO 27001, HIPAA, and GDPR against static codebase AST.',
                    icon: ShieldCheck,
                    col: 'text-teal-400',
                    key: 'compliance',
                    badge: 'v9.0 NEW',
                    graphic: ComplianceGraphic,
                    preview: '🛡️ SOC2 PASS (96%) • ISO 27001 PASS • HIPAA WARN'
                  },
                  {
                    title: 'GraphQL SDL & gRPC Protobuf v3',
                    desc: 'Synthesize production-grade GraphQL SDL queries/mutations and gRPC Proto3 schemas from Spring REST controllers.',
                    icon: FileCode,
                    col: 'text-purple-400',
                    key: 'graphql-grpc',
                    badge: 'v9.0 NEW',
                    graphic: GraphqlGrpcGraphic,
                    preview: '⚡ type Query { order(id: ID!): Order } • service OrderService'
                  },
                  {
                    title: 'Multi-Repo Service Mesh & Istio',
                    desc: 'Multi-service traffic topology visualizer, Envoy proxy sidecar configurations, and Istio VirtualService synthesizer.',
                    icon: Network,
                    col: 'text-cyan-400',
                    key: 'service-mesh',
                    badge: 'v9.0 NEW',
                    graphic: ServiceMeshGraphic,
                    preview: '🕸️ 4 Services Mesh • Envoy Sidecars • Istio mTLS STRICT'
                  }
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={i}
                      onClick={() => handleOpenToolDirectly(f.key)}
                      className={`cursor-pointer p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between group hover:-translate-y-0.5 ${
                        isLight
                          ? 'bg-white border-slate-200 text-slate-800 shadow-sm hover:border-sky-400 hover:shadow-md'
                          : 'bg-[#0f172a]/80 border-slate-800/80 hover:border-sky-500/60 hover:bg-[#131d38] text-slate-100 shadow-lg'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-lg ${isLight ? 'bg-slate-100' : 'bg-slate-900 border border-slate-800'} ${f.col} group-hover:scale-105 transition-transform`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {f.badge}
                          </span>
                        </div>
                        <h4 className={`text-sm font-bold font-mono ${isLight ? 'text-slate-900' : 'text-white'} group-hover:text-sky-400 transition-colors`}>
                          {f.title}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono mt-1.5 leading-relaxed">
                          {f.desc}
                        </p>

                        {/* Graphic Schematic Diagram Preview */}
                        <div className={`mt-3 mb-2 p-1 rounded-xl border overflow-hidden transition-all ${
                          isLight ? 'bg-slate-50 border-slate-200/80 group-hover:border-sky-300' : 'bg-slate-950/60 border-slate-800/80 group-hover:border-sky-500/40'
                        }`}>
                          <f.graphic isLight={isLight} />
                        </div>
                      </div>

                      <div className={`mt-2 pt-2.5 border-t ${isLight ? 'border-slate-100' : 'border-slate-800/60'}`}>
                        <div className={`p-2 rounded-lg text-[10px] font-mono truncate mb-2.5 border ${
                          isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-slate-900'
                        }`}>
                          {f.preview}
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono text-sky-400 font-bold group-hover:text-indigo-400 transition-colors">
                          <span>Launch Tool</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Tech Indicators */}
            <div className={`flex flex-wrap items-center justify-center gap-2 pt-6 border-t text-[11px] font-mono ${
              isLight ? 'border-slate-200 text-slate-500' : 'border-slate-800/60 text-slate-400'
            }`}>
              <span>Java 21</span>
              <span>•</span>
              <span>Spring Boot 3.2</span>
              <span>•</span>
              <span>React 19</span>
              <span>•</span>
              <span>TypeScript 7</span>
              <span>•</span>
              <span>PostgreSQL 16</span>
              <span>•</span>
              <span>Vite 8</span>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* ACTIVE PROJECT WORKSPACE (Interactive Flow Canvas + Inspector)            */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col overflow-hidden">
            {project && <ProjectDashboard project={project} currentTheme={currentTheme} />}

            <div className="flex-1 flex overflow-hidden">
              <InteractiveFlowExplorer
                graphData={graphData}
                onSelectNode={(nodeId) => setSelectedNodeId(nodeId)}
                selectedNodeId={selectedNodeId}
                onViewCode={(path) => setViewingFilePath(path)}
                currentTheme={currentTheme}
              />

              {selectedNodeDetail && (
                <NodeInspectorSidebar
                  nodeDetail={selectedNodeDetail}
                  onClose={() => setSelectedNodeId(undefined)}
                  onViewCode={(path) => setViewingFilePath(path)}
                  currentTheme={currentTheme}
                  onAskAi={(prompt) => handleOpenAi(prompt, 'CODE_REVIEW')}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals with Suspense Chunk Splitting */}
      <ErrorBoundary fallbackTitle="Modal Component Boundary" fallbackMessage="Could not render requested modal component.">
      <Suspense fallback={null}>
        <IngestionModal
          isOpen={isIngestModalOpen}
          onClose={() => setIsIngestModalOpen(false)}
          onProjectIngested={(projectId) => {
            setCurrentProjectId(projectId);
            setSelectedNodeId(undefined);
          }}
          currentTheme={currentTheme}
        />

        <MonacoViewerModal
          projectId={currentProjectId || ''}
          filePath={viewingFilePath}
          onClose={() => setViewingFilePath(null)}
          currentTheme={currentTheme}
          onAskAi={(prompt, analysisType) => handleOpenAi(prompt, (analysisType as AiAnalysisType) || 'CODE_REVIEW')}
        />

        <DependencyExplorerModal
          projectId={currentProjectId}
          isOpen={isDependencyModalOpen}
          onClose={() => setIsDependencyModalOpen(false)}
          currentTheme={currentTheme}
          onAskAi={(prompt, analysisType) => handleOpenAi(prompt, (analysisType as AiAnalysisType) || 'DEPENDENCY_AUDIT')}
        />

        <SqlExplorerModal
          projectId={currentProjectId}
          isOpen={isSqlExplorerOpen}
          onClose={() => setIsSqlExplorerOpen(false)}
          currentTheme={currentTheme}
          onAskAi={(prompt, analysisType) => handleOpenAi(prompt, (analysisType as AiAnalysisType) || 'SQL_OPTIMIZE')}
        />

        <AiAssistantModal
          projectId={currentProjectId}
          isOpen={isAiAssistantOpen}
          onClose={() => {
            setIsAiAssistantOpen(false);
            setAiInitialPrompt(undefined);
            setAiInitialAnalysisType(undefined);
          }}
          currentTheme={currentTheme}
          initialPrompt={aiInitialPrompt}
          initialAnalysisType={aiInitialAnalysisType}
        />

        <ErDiagramModal
          projectId={currentProjectId}
          isOpen={isErDiagramOpen}
          onClose={() => setIsErDiagramOpen(false)}
          currentTheme={currentTheme}
          onAskAi={(prompt, analysisType) => handleOpenAi(prompt, (analysisType as AiAnalysisType) || 'DATABASE')}
        />

        <SecurityExplorerModal
          projectId={currentProjectId}
          isOpen={isSecurityFlowOpen}
          onClose={() => setIsSecurityFlowOpen(false)}
          currentTheme={currentTheme}
          onAskAi={(prompt, analysisType) => handleOpenAi(prompt, (analysisType as AiAnalysisType) || 'SECURITY')}
        />

        <FileTreeModal
          projectId={currentProjectId}
          isOpen={isFileTreeOpen}
          onClose={() => setIsFileTreeOpen(false)}
          onViewCode={(path: string) => {
            setIsFileTreeOpen(false);
            setViewingFilePath(path);
          }}
          currentTheme={currentTheme}
        />

        <RuntimeTracingModal
          projectId={currentProjectId}
          isOpen={isRuntimeTracingOpen}
          onClose={() => setIsRuntimeTracingOpen(false)}
          currentTheme={currentTheme}
        />

        <ApiMetricsDashboardModal
          isOpen={isApiMetricsOpen}
          onClose={() => setIsApiMetricsOpen(false)}
          currentTheme={currentTheme}
        />

        <SequenceDiagramModal
          isOpen={isSequenceDiagramOpen}
          onClose={() => setIsSequenceDiagramOpen(false)}
          currentTheme={currentTheme}
        />

        <LatencyHeatmapModal
          isOpen={isLatencyHeatmapOpen}
          onClose={() => setIsLatencyHeatmapOpen(false)}
          currentTheme={currentTheme}
        />

        <ReactRuntimeExplorerModal
          isOpen={isReactRuntimeOpen}
          onClose={() => setIsReactRuntimeOpen(false)}
          projectId={currentProjectId}
          currentTheme={currentTheme}
        />

        <CommandPaletteModal
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          currentTheme={currentTheme}
          onSelectTool={(toolId) => {
            if (toolId === 'ai') handleOpenAi();
            else handleOpenToolDirectly(toolId);
          }}
          onSelectScenario={(scKey) => {
            setActiveScenarioKey(scKey);
            setActiveTraceStep(0);
          }}
          onSelectTheme={(theme) => setCurrentTheme(theme)}
          onTriggerAi={(prompt, analysisType) => handleOpenAi(prompt, (analysisType as AiAnalysisType) || 'GENERAL')}
        />

        <ArchitectureScorecardModal
          isOpen={isScorecardOpen}
          onClose={() => setIsScorecardOpen(false)}
          currentTheme={currentTheme}
          onTriggerAiFix={(findingTitle, query) => handleOpenAi(query, 'ARCHITECTURE')}
        />

        <ApiSandboxModal
          isOpen={isApiSandboxOpen}
          onClose={() => setIsApiSandboxOpen(false)}
          currentTheme={currentTheme}
        />

        <TypeScriptGeneratorModal
          isOpen={isTsGeneratorOpen}
          onClose={() => setIsTsGeneratorOpen(false)}
          currentTheme={currentTheme}
        />

        <ChaosSimulatorModal
          isOpen={isChaosOpen}
          onClose={() => setIsChaosOpen(false)}
          currentTheme={currentTheme}
        />

        <ArchitectureBlueprintExportModal
          isOpen={isBlueprintOpen}
          onClose={() => setIsBlueprintOpen(false)}
          currentTheme={currentTheme}
        />

        <ArchitectureDriftModal
          isOpen={isDriftOpen}
          onClose={() => setIsDriftOpen(false)}
          currentTheme={currentTheme}
          onTriggerAi={(prompt) => handleOpenAi(prompt, 'ARCHITECTURE')}
        />

        <TestSuiteGeneratorModal
          isOpen={isTestGenOpen}
          onClose={() => setIsTestGenOpen(false)}
          currentTheme={currentTheme}
        />

        <CloudInfraSynthesizerModal
          isOpen={isCloudInfraOpen}
          onClose={() => setIsCloudInfraOpen(false)}
          currentTheme={currentTheme}
        />

        <EventStreamVisualizerModal
          isOpen={isEventStreamOpen}
          onClose={() => setIsEventStreamOpen(false)}
          currentTheme={currentTheme}
        />

        <VoiceCopilotModal
          isOpen={isVoiceCopilotOpen}
          onClose={() => setIsVoiceCopilotOpen(false)}
          currentTheme={currentTheme}
          onExecuteCommand={handleVoiceCommand}
        />

        <DistributedTracingModal
          isOpen={isDistTracingOpen}
          onClose={() => setIsDistTracingOpen(false)}
          currentTheme={currentTheme}
        />

        <VsCodeSidecarModal
          isOpen={isVsCodeOpen}
          onClose={() => setIsVsCodeOpen(false)}
          currentTheme={currentTheme}
        />

        <ChromeExtensionModal
          isOpen={isChromeExtOpen}
          onClose={() => setIsChromeExtOpen(false)}
          currentTheme={currentTheme}
        />

        <LiveCollabModal
          isOpen={isLiveCollabOpen}
          onClose={() => setIsLiveCollabOpen(false)}
          currentTheme={currentTheme}
        />

        <ComplianceMatrixModal
          isOpen={isComplianceOpen}
          onClose={() => setIsComplianceOpen(false)}
          currentTheme={currentTheme}
        />

        <GraphqlGrpcModal
          isOpen={isGraphqlGrpcOpen}
          onClose={() => setIsGraphqlGrpcOpen(false)}
          currentTheme={currentTheme}
        />

        <ServiceMeshModal
          isOpen={isServiceMeshOpen}
          onClose={() => setIsServiceMeshOpen(false)}
          currentTheme={currentTheme}
        />
      </Suspense>
      </ErrorBoundary>

    </div>
  );
}
