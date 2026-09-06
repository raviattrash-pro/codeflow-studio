import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Layers, Sparkles, Play, Activity, BarChart2, Zap, Flame, Database,
  ShieldCheck, Bot, Package, FolderTree, Code2, ArrowRight, CheckCircle2,
  Cpu, Moon, Sun, Box, Workflow, ChevronRight, Pause, RotateCcw,
  Terminal, Shield, FileCode, Clock, Server, Monitor, HardDrive, Check, Copy
} from 'lucide-react';
import { Header, ThemeMode } from './components/Header';
import { IngestionModal } from './components/IngestionModal';
import { ProjectDashboard } from './components/ProjectDashboard';
import { InteractiveFlowExplorer } from './components/InteractiveFlowExplorer';
import { NodeInspectorSidebar } from './components/NodeInspectorSidebar';
import { MonacoViewerModal } from './components/MonacoViewerModal';
import { DependencyExplorerModal } from './components/DependencyExplorerModal';
import { SqlExplorerModal } from './components/SqlExplorerModal';
import { AiAssistantModal } from './components/AiAssistantModal';
import { ErDiagramModal } from './components/ErDiagramModal';
import { SecurityExplorerModal } from './components/SecurityExplorerModal';
import { FileTreeModal } from './components/FileTreeModal';
import { RuntimeTracingModal } from './components/RuntimeTracingModal';
import { ApiMetricsDashboardModal } from './components/ApiMetricsDashboardModal';
import { SequenceDiagramModal } from './components/SequenceDiagramModal';
import { LatencyHeatmapModal } from './components/LatencyHeatmapModal';
import { Project, GraphData, NodeDetail, ProjectNode } from './types';
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
        border: 'border-cyan-500/50',
        bg: 'bg-cyan-950/40',
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
        border: 'border-indigo-500/50',
        bg: 'bg-indigo-950/40',
        filePath: 'src/main/java/com/codeflow/config/JwtAuthenticationFilter.java',
        annotations: ['@Component', '@Order(1)', '@Slf4j'],
        code: `@Override
protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
    String token = resolveToken(req);
    if (token != null && jwtProvider.validate(token)) {
        Authentication auth = jwtProvider.getAuthentication(token);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
    chain.doFilter(req, res);
}`
      },
      {
        key: 'controller',
        label: 'OrderController',
        sub: '@PostMapping @Valid',
        type: 'Controller',
        duration: '1.4ms',
        icon: '⚡',
        color: 'text-blue-400',
        border: 'border-blue-500/50',
        bg: 'bg-blue-950/40',
        filePath: 'src/main/java/com/codeflow/orders/OrderController.java',
        annotations: ['@RestController', '@RequestMapping("/api/v1/orders")', '@PreAuthorize("hasRole(\'BUYER\')")'],
        code: `@PostMapping
@PreAuthorize("hasRole('BUYER')")
public ResponseEntity<OrderResponse> placeOrder(
    @Valid @RequestBody CreateOrderDTO dto,
    @AuthenticationPrincipal UserPrincipal user
) {
    Order order = orderService.createOrder(dto, user.getId());
    return ResponseEntity.status(HttpStatus.CREATED).body(orderMapper.toResponse(order));
}`
      },
      {
        key: 'service',
        label: 'OrderService',
        sub: '@Transactional createOrder()',
        type: 'Service',
        duration: '16.2ms',
        icon: '🛠️',
        color: 'text-purple-400',
        border: 'border-purple-500/50',
        bg: 'bg-purple-950/40',
        filePath: 'src/main/java/com/codeflow/orders/OrderService.java',
        annotations: ['@Service', '@Transactional(rollbackFor = Exception.class)', '@RequiredArgsConstructor'],
        code: `@Transactional(rollbackFor = Exception.class)
public Order createOrder(CreateOrderDTO dto, Long userId) {
    inventoryService.reserveStock(dto.getItems());
    Order order = Order.builder()
        .userId(userId)
        .totalAmount(dto.calculateTotal())
        .status(OrderStatus.CONFIRMED)
        .build();
    return orderRepository.save(order);
}`
      },
      {
        key: 'db',
        label: 'PostgreSQL 16',
        sub: 'ACID Storage (JPA/Hibernate)',
        type: 'Database',
        duration: '7.9ms',
        icon: '🗄️',
        color: 'text-amber-400',
        border: 'border-amber-500/50',
        bg: 'bg-amber-950/40',
        filePath: 'src/main/java/com/codeflow/orders/OrderRepository.java',
        annotations: ['@Repository', 'JpaRepository<Order, UUID>'],
        code: `@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
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
        border: 'border-cyan-500/50',
        bg: 'bg-cyan-950/40',
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
        border: 'border-indigo-500/50',
        bg: 'bg-indigo-950/40',
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
        color: 'text-blue-400',
        border: 'border-blue-500/50',
        bg: 'bg-blue-950/40',
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
        color: 'text-purple-400',
        border: 'border-purple-500/50',
        bg: 'bg-purple-950/40',
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
        border: 'border-amber-500/50',
        bg: 'bg-amber-950/40',
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
    name: 'Inventory Cache-Aside Sync',
    subtitle: '5 Steps • Redis Cluster + Spring Cache',
    icon: '📦',
    method: 'GET',
    endpoint: '/api/v1/products/492/stock',
    status: '200 OK (Cache Hit)',
    totalDuration: '3.8ms',
    nodes: [
      {
        key: 'client',
        label: 'React Catalog',
        sub: 'fetchStock(productId)',
        type: 'Client',
        duration: '0.3ms',
        icon: '📱',
        color: 'text-cyan-400',
        border: 'border-cyan-500/50',
        bg: 'bg-cyan-950/40',
        filePath: 'src/components/ProductCard.tsx',
        annotations: ['useEffect', 'useQuery'],
        code: `const { data: stock } = useQuery(['stock', productId], () =>
  api.get(\`/api/v1/products/\${productId}/stock\`).then(r => r.data)
);`
      },
      {
        key: 'gateway',
        label: 'API Gateway',
        sub: 'RateLimit + Cache-Control',
        type: 'Gateway',
        duration: '0.6ms',
        icon: '🛡️',
        color: 'text-indigo-400',
        border: 'border-indigo-500/50',
        bg: 'bg-indigo-950/40',
        filePath: 'src/main/java/com/codeflow/config/CacheFilter.java',
        annotations: ['@Component'],
        code: `res.setHeader("Cache-Control", "public, max-age=60");`
      },
      {
        key: 'controller',
        label: 'InventoryController',
        sub: '@GetMapping stock',
        type: 'Controller',
        duration: '0.9ms',
        icon: '⚡',
        color: 'text-blue-400',
        border: 'border-blue-500/50',
        bg: 'bg-blue-950/40',
        filePath: 'src/main/java/com/codeflow/inventory/InventoryController.java',
        annotations: ['@RestController', '@RequestMapping("/api/v1/products")'],
        code: `@GetMapping("/{id}/stock")
public ResponseEntity<StockDTO> getStock(@PathVariable Long id) {
    return ResponseEntity.ok(inventoryService.getStock(id));
}`
      },
      {
        key: 'service',
        label: 'Redis Cache Layer',
        sub: '@Cacheable("product_stock")',
        type: 'Cache',
        duration: '1.2ms',
        icon: '⚡',
        color: 'text-emerald-400',
        border: 'border-emerald-500/50',
        bg: 'bg-emerald-950/40',
        filePath: 'src/main/java/com/codeflow/inventory/InventoryService.java',
        annotations: ['@Cacheable(value = "product_stock", key = "#id")'],
        code: `@Cacheable(value = "product_stock", key = "#id", unless = "#result == null")
public StockDTO getStock(Long id) {
    return inventoryRepository.findStockById(id);
}`
      },
      {
        key: 'db',
        label: 'PostgreSQL DB',
        sub: 'Skipped (0 DB I/O)',
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
        border: 'border-cyan-500/50',
        bg: 'bg-cyan-950/40',
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
        border: 'border-indigo-500/50',
        bg: 'bg-indigo-950/40',
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
        color: 'text-blue-400',
        border: 'border-blue-500/50',
        bg: 'bg-blue-950/40',
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
        color: 'text-pink-400',
        border: 'border-pink-500/50',
        bg: 'bg-pink-950/40',
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
        border: 'border-amber-500/50',
        bg: 'bg-amber-950/40',
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
  const [viewingFilePath, setViewingFilePath] = useState<string | null>(null);

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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Live Auto-play scrubber for hero workbench
  useEffect(() => {
    if (currentProjectId || !isPlayingTrace) return;
    const interval = setInterval(() => {
      setActiveTraceStep((prev) => (prev + 1) % scenario.nodes.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [currentProjectId, isPlayingTrace, scenario.nodes.length]);

  // Global Keyboard Shortcuts (D for Demo, I for Ingest, Space for Step)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'd' || e.key === 'D') {
        if (!currentProjectId) {
          handleLoadDemoProject();
        }
      } else if (e.key === 'i' || e.key === 'I') {
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
    handleLoadDemoProject();
    if (toolKey === 'tracing') setIsRuntimeTracingOpen(true);
    if (toolKey === 'metrics') setIsApiMetricsOpen(true);
    if (toolKey === 'sequence') setIsSequenceDiagramOpen(true);
    if (toolKey === 'heatmap') setIsLatencyHeatmapOpen(true);
    if (toolKey === 'erd') setIsErDiagramOpen(true);
    if (toolKey === 'security') setIsSecurityFlowOpen(true);
    if (toolKey === 'sql') setIsSqlExplorerOpen(true);
    if (toolKey === 'deps') setIsDependencyModalOpen(true);
    if (toolKey === 'ai') setIsAiAssistantOpen(true);
    if (toolKey === 'files') setIsFileTreeOpen(true);
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
Generated by CodeFlow Studio v4.2.0

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

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#070a12] text-slate-100 font-sans select-none">
      <Header
        currentProjectName={project?.name}
        currentProjectId={currentProjectId}
        onLoadDemo={handleLoadDemoProject}
        onOpenIngestModal={() => setIsIngestModalOpen(true)}
        onOpenDependencies={() => setIsDependencyModalOpen(true)}
        onOpenSqlExplorer={() => setIsSqlExplorerOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenErDiagram={() => setIsErDiagramOpen(true)}
        onOpenSecurityFlow={() => setIsSecurityFlowOpen(true)}
        onOpenFileTree={() => setIsFileTreeOpen(true)}
        onOpenRuntimeTracing={() => setIsRuntimeTracingOpen(true)}
        onOpenApiMetrics={() => setIsApiMetricsOpen(true)}
        onOpenSequenceDiagram={() => setIsSequenceDiagramOpen(true)}
        onOpenLatencyHeatmap={() => setIsLatencyHeatmapOpen(true)}
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
          /* BESPOKE HANDCRAFTED LANDING STUDIO (Emil Kowalski + Impeccable + Taste)    */
          /* ========================================================================= */
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex flex-col items-center bg-[#070a12] relative blueprint-grid">
            {/* Top Atmospheric Radial Glow */}
            <div className="absolute top-0 inset-x-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.14),rgba(99,102,241,0.18),transparent_75%)] pointer-events-none" />

            {/* 1. Release Eyebrow Chip */}
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 mb-5 shadow-lg shadow-indigo-500/10 badge-sheen">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CODEFLOW STUDIO 4.2 • SYSTEM ARCHITECTURE & RUNTIME ENGINE</span>
            </div>

            {/* 2. Hero Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-center max-w-5xl tracking-tight leading-[1.12] mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400">
                Observe, Replay &amp; Master Real Code Execution.
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
                From HTTP Request to Hibernate SQL in Milliseconds.
              </span>
            </h1>

            {/* 3. Hero Subtitle */}
            <p className="text-sm md:text-base text-slate-400 max-w-3xl text-center leading-relaxed mb-8">
              A developer-first visual IDE and execution debugger for <span className="text-white font-semibold">Spring Boot 3</span> and <span className="text-white font-semibold">React 19</span>. Step through runtime call-stacks, inspect security filter chains, explore relational schemas, and audit performance bottlenecks.
            </p>

            {/* 4. Main Action Hub (CTAs + Keyboard Hints) */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 z-10">
              <button
                onClick={handleLoadDemoProject}
                className="w-full sm:w-auto flex items-center justify-center space-x-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-sm font-bold text-white shadow-2xl shadow-pink-600/30 transition-all transform hover:scale-105 active:scale-95 group badge-sheen"
              >
                <Play className="w-4 h-4 fill-white group-hover:translate-x-0.5 transition-transform" />
                <span>Launch Full Studio (Demo Mode)</span>
                <span className="keycap ml-1">D</span>
              </button>

              <button
                onClick={() => setIsIngestModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-[#0f172a] border border-slate-700/80 hover:border-indigo-500 text-sm font-bold text-slate-200 shadow-lg hover:shadow-indigo-500/20 transition-all transform hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Import Repository / ZIP</span>
                <span className="keycap ml-1">I</span>
              </button>
            </div>

            {/* 5. Live Telemetry Strip */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 px-6 py-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs font-mono text-slate-400 mb-12 shadow-md">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>11 Visual Tools</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>7-Hop Tracing Engine</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>100% Offline Demo Mode</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Spring Security 6 Audit</span>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 6. THE LIVE INTERACTIVE WORKBENCH (Core Hands-On Simulation Sandbox)   */}
            {/* ===================================================================== */}
            <div className="w-full max-w-5xl rounded-3xl border border-slate-800/90 bg-[#0c1222]/95 shadow-[0_20px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl mb-16 overflow-hidden relative">
              {/* macOS Window Chrome Header */}
              <div className="px-5 py-3.5 bg-[#0a0f1d] border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 hover:opacity-100 transition-opacity" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:opacity-100 transition-opacity" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80 hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-slate-600">|</span>
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="text-slate-400 font-bold">Workbench:</span>
                    <span className="text-white font-semibold">{scenario.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-pink-500/20 text-pink-300 border border-pink-500/30">
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
                        className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-600 to-indigo-600 text-white shadow-md'
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
              <div className="px-5 py-2.5 bg-[#0d1428] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
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
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <span className="text-emerald-400 font-bold">● {scenario.status}</span>
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
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/80">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setIsPlayingTrace(!isPlayingTrace)}
                          className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center space-x-1.5 transition-all ${
                            isPlayingTrace
                              ? 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-600/30'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                          }`}
                        >
                          {isPlayingTrace ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isPlayingTrace ? 'Auto-Advancing' : 'Play Flow'}</span>
                        </button>
                        <button
                          onClick={() => setActiveTraceStep((prev) => (prev + 1) % scenario.nodes.length)}
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-300 hover:text-white flex items-center space-x-1"
                        >
                          <span>Step Next</span>
                          <span className="keycap">Space</span>
                        </button>
                      </div>

                      <div className="text-xs font-mono text-slate-400">
                        Active Step <span className="text-pink-400 font-bold">{activeTraceStep + 1}</span> of {scenario.nodes.length}:{' '}
                        <span className="text-white font-bold">{scenario.nodes[activeTraceStep]?.label}</span>
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
                            className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative group ${
                              isCurrentActive
                                ? 'bg-slate-900 border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.4)] scale-105 ring-2 ring-pink-500/50 z-10'
                                : isNodeSelected
                                ? 'bg-[#151f38] border-indigo-500 shadow-md'
                                : `${n.bg} ${n.border} opacity-80 hover:opacity-100 hover:scale-102`
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl drop-shadow-md">{n.icon}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                  {n.duration}
                                </span>
                              </div>
                              <h4 className={`text-xs font-mono font-bold truncate ${isCurrentActive ? 'text-pink-300' : n.color}`}>
                                {n.label}
                              </h4>
                              <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                                {n.sub}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                              <span>{n.type}</span>
                              <span className="group-hover:text-pink-400 transition-colors">Inspect →</span>
                            </div>

                            {/* Active Step Indicator Badge */}
                            {isCurrentActive && (
                              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-pink-500 text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-lg shadow-pink-500/50">
                                {idx + 1}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Node Detail Code & Annotation Inspector */}
                    <div className="rounded-2xl bg-slate-950 border border-slate-800/90 p-4 font-mono text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-3">
                        <div className="flex items-center space-x-2 text-slate-300">
                          <FileCode className="w-4 h-4 text-indigo-400" />
                          <span className="text-slate-400">Inspecting:</span>
                          <span className="text-white font-bold">{selectedNode.label}</span>
                          <span className="text-slate-500">({selectedNode.filePath})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedNode.annotations.map((ann, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              {ann}
                            </span>
                          ))}
                        </div>
                      </div>

                      <pre className="p-3.5 rounded-xl bg-[#090d16] text-slate-300 overflow-x-auto text-[11px] leading-relaxed border border-slate-900">
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
                        <Activity className="w-4 h-4 text-pink-400" />
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
                                ? 'bg-[#1e1533] border-pink-500 shadow-md ring-1 ring-pink-500/40 text-pink-200'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isCurrent ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-400'
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
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs">
                      <div className="flex items-center justify-between mb-2 text-slate-400">
                        <span>Resolved JWT Claims &amp; Context:</span>
                        <span className="text-emerald-400">● Verified Signature (HS256)</span>
                      </div>
                      <pre className="p-3 rounded-xl bg-[#090d16] text-indigo-300 text-[11px] leading-relaxed border border-slate-900">
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
                        <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono font-bold text-white">{item.title}</span>
                            <span className={`text-[10px] font-mono font-bold ${item.col}`}>{item.status}</span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
                      <div className="text-slate-400 mb-2">Decoded Principal Context:</div>
                      <pre className="p-3 rounded-xl bg-[#090d16] text-purple-300 text-[11px] leading-relaxed border border-slate-900">
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

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs mb-4">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                        <span>Executed Prepared Statement:</span>
                        <span className="text-amber-400 font-bold">Execution Time: {scenario.sqlDuration}</span>
                      </div>
                      <pre className="p-4 rounded-xl bg-[#090d16] text-amber-300 text-[12px] leading-relaxed border border-slate-900 overflow-x-auto">
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
                        <div key={i} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">{m.label}</span>
                          <div className={`text-lg font-extrabold mt-0.5 ${m.col}`}>{m.val}</div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="text-xs font-mono text-slate-400 mb-3">24-Hour Hourly Heatmap Quantiles:</div>
                      <div className="grid grid-cols-12 gap-1.5">
                        {Array.from({ length: 24 }).map((_, h) => {
                          const isSpike = h === 14 || h === 20;
                          return (
                            <div
                              key={h}
                              className={`h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-mono font-bold transition-transform hover:scale-110 cursor-pointer ${
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
              <div className="px-6 py-3.5 bg-[#090d16] border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs font-mono text-slate-400">
                  Ready to explore all models, dependencies, and execution logs?
                </span>
                <button
                  onClick={handleLoadDemoProject}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-xs font-mono font-bold text-white shadow-md transition-transform hover:scale-105"
                >
                  Open Full Studio Canvas →
                </button>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 7. ALL 11 VISUAL ARCHITECTURE TOOLS SPOTLIGHT SHOWCASE               */}
            {/* ===================================================================== */}
            <div className="w-full max-w-5xl mb-12">
              <div className="text-center mb-8">
                <h3 className="text-xl md:text-2xl font-bold font-mono text-white">
                  11 Specialized Visual Architecture Tools
                </h3>
                <p className="text-xs md:text-sm text-slate-400 font-mono mt-1">
                  Click any card to launch interactive demo mode directly into that tool
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Runtime Tracing Replay',
                    desc: 'Step-by-step VCR playback tracing requests from Controller down to Hibernate and PostgreSQL.',
                    icon: Activity,
                    col: 'text-cyan-400',
                    key: 'tracing',
                    badge: 'v4.2 Engine',
                    preview: '▶ Step 4/5: OrderService.createOrder() (16.2ms)'
                  },
                  {
                    title: 'API Metrics & Telemetry',
                    desc: 'Real-time P50/P90/P95/P99 latency distribution, throughput RPS, and bottleneck diagnostics.',
                    icon: BarChart2,
                    col: 'text-indigo-400',
                    key: 'metrics',
                    badge: 'Telemetry',
                    preview: '📊 P95 Latency: 28.4ms • 14,200 req/min'
                  },
                  {
                    title: '7-Swimlane Sequence Tracer',
                    desc: 'Asynchronous request and response lifecycle mapping across Controller, Service, Cache, and DB.',
                    icon: Zap,
                    col: 'text-pink-400',
                    key: 'sequence',
                    badge: '7 Swimlanes',
                    preview: '⚡ Controller ➔ JWT Filter ➔ Service ➔ JPA'
                  },
                  {
                    title: '24-Hour Latency Heatmap',
                    desc: 'Hourly quantile matrix diagnosing traffic bursts, cache invalidations, and query spikes.',
                    icon: Flame,
                    col: 'text-amber-400',
                    key: 'heatmap',
                    badge: '24h Matrix',
                    preview: '🔥 24-Column Timeline Matrix with Hover Tooltips'
                  },
                  {
                    title: 'Database ERD & SQL Explorer',
                    desc: 'Relational entity diagrams, foreign key linkages, and live executed prepared statements.',
                    icon: Database,
                    col: 'text-emerald-400',
                    key: 'erd',
                    badge: 'JPA Schema',
                    preview: '🗄️ orders ➔ order_items ➔ users (FK Linked)'
                  },
                  {
                    title: 'AI Code & Security Assistant',
                    desc: 'Architectural explanations, Spring Security compliance auditing, and query reviews.',
                    icon: Bot,
                    col: 'text-purple-400',
                    key: 'ai',
                    badge: 'AI Explainer',
                    preview: '🤖 "Detected @Transactional with READ_COMMITTED"'
                  },
                ].map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div
                      key={i}
                      onClick={() => handleOpenToolDirectly(f.key)}
                      className="cursor-pointer p-5 rounded-2xl bg-[#0f172a]/80 border border-slate-800/80 hover:border-indigo-500/60 hover:bg-[#131d38] transition-all duration-200 flex flex-col justify-between shadow-xl group hover:-translate-y-1"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${f.col} group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {f.badge}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold font-mono text-white group-hover:text-indigo-300 transition-colors">
                          {f.title}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono mt-1.5 leading-relaxed">
                          {f.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/60">
                        <div className="p-2 rounded-lg bg-slate-950 text-[10px] font-mono text-slate-400 border border-slate-900 truncate mb-3">
                          {f.preview}
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono text-indigo-400 font-bold group-hover:text-pink-400 transition-colors">
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
            <div className="flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
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
                />
              )}
            </div>
          </div>
        )}
      </div>

            {/* Modals */}
      <IngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onProjectIngested={(projectId) => {
          setCurrentProjectId(projectId);
          setSelectedNodeId(undefined);
        }}
      />

      <MonacoViewerModal
        projectId={currentProjectId || ''}
        filePath={viewingFilePath}
        onClose={() => setViewingFilePath(null)}
      />

      <DependencyExplorerModal
        projectId={currentProjectId}
        isOpen={isDependencyModalOpen}
        onClose={() => setIsDependencyModalOpen(false)}
      />

      <SqlExplorerModal
        projectId={currentProjectId}
        isOpen={isSqlExplorerOpen}
        onClose={() => setIsSqlExplorerOpen(false)}
      />

      <AiAssistantModal
        projectId={currentProjectId}
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />

      <ErDiagramModal
        projectId={currentProjectId}
        isOpen={isErDiagramOpen}
        onClose={() => setIsErDiagramOpen(false)}
      />

      <SecurityExplorerModal
        projectId={currentProjectId}
        isOpen={isSecurityFlowOpen}
        onClose={() => setIsSecurityFlowOpen(false)}
      />

      <FileTreeModal
        projectId={currentProjectId}
        isOpen={isFileTreeOpen}
        onClose={() => setIsFileTreeOpen(false)}
        onViewCode={(path: string) => {
          setIsFileTreeOpen(false);
          setViewingFilePath(path);
        }}
      />

      <RuntimeTracingModal
        projectId={currentProjectId}
        isOpen={isRuntimeTracingOpen}
        onClose={() => setIsRuntimeTracingOpen(false)}
      />

      <ApiMetricsDashboardModal
        isOpen={isApiMetricsOpen}
        onClose={() => setIsApiMetricsOpen(false)}
      />

      <SequenceDiagramModal
        isOpen={isSequenceDiagramOpen}
        onClose={() => setIsSequenceDiagramOpen(false)}
      />

      <LatencyHeatmapModal
        isOpen={isLatencyHeatmapOpen}
        onClose={() => setIsLatencyHeatmapOpen(false)}
      />
    </div>
  );
}
