import { Project, GraphData, ProjectDependency } from '../types';

export const DEMO_PROJECT_DATA: Project = {
  id: 'demo-ecommerce-store',
  name: 'codeflow-demo-store (E-Commerce Microservice)',
  sourceType: 'GITHUB',
  sourceUrl: 'https://github.com/codeflow-studio/demo-ecommerce-store.git',
  status: 'COMPLETED',
  progressPercentage: 100,
  errorMessage: undefined,
  controllerCount: 7,
  serviceCount: 5,
  repositoryCount: 4,
};

export const DEMO_GRAPH_DATA: GraphData = {
  nodes: [
    {
      id: 'fe_react_app',
      type: 'custom',
      position: { x: 50, y: 100 },
      data: {
        label: 'Storefront (App.tsx)',
        nodeType: 'REACT_COMPONENT',
        layer: 'FRONTEND',
        filePath: 'src/App.tsx',
        annotations: 'React 19, Vite 8, TailwindCSS, Axios',
      },
    },
    {
      id: 'fe_cart_view',
      type: 'custom',
      position: { x: 50, y: 250 },
      data: {
        label: 'CartCheckout (CartView.tsx)',
        nodeType: 'REACT_COMPONENT',
        layer: 'FRONTEND',
        filePath: 'src/components/CartView.tsx',
        annotations: 'React Component, useState, useEffect, Axios',
      },
    },
    {
      id: 'gw_security',
      type: 'custom',
      position: { x: 250, y: 175 },
      data: {
        label: 'API Gateway',
        nodeType: 'SPRING_CONTROLLER',
        layer: 'BACKEND',
        filePath: 'src/main/java/com/codeflow/demo/config/SecurityConfig.java',
        annotations: '@RestController, Spring Security 6.x, JwtAuthenticationFilter, CorsFilter',
      },
    },
    {
      id: 'ctrl_admin',
      type: 'custom',
      position: { x: 450, y: 50 },
      data: {
        label: 'AdminController',
        nodeType: 'SPRING_CONTROLLER',
        layer: 'BACKEND',
        filePath: 'src/main/java/com/codeflow/demo/controller/AdminController.java',
        endpointPath: '/api/v1/admin/login',
        annotations: '@RestController, @PostMapping, @Valid, @CrossOrigin',
      },
    },
    {
      id: 'ctrl_order',
      type: 'custom',
      position: { x: 450, y: 200 },
      data: {
        label: 'OrderController',
        nodeType: 'SPRING_CONTROLLER',
        layer: 'BACKEND',
        filePath: 'src/main/java/com/codeflow/demo/controller/OrderController.java',
        endpointPath: '/api/v1/orders/checkout',
        annotations: '@RestController, @PostMapping, @Valid, @CrossOrigin',
      },
    },
    {
      id: 'ctrl_payment',
      type: 'custom',
      position: { x: 450, y: 350 },
      data: {
        label: 'PaymentController',
        nodeType: 'SPRING_CONTROLLER',
        layer: 'BACKEND',
        filePath: 'src/main/java/com/codeflow/demo/controller/PaymentController.java',
        endpointPath: '/api/v1/payments/process',
        annotations: '@RestController, @PostMapping, @Valid',
      },
    },
    {
      id: 'svc_auth',
      type: 'custom',
      position: { x: 650, y: 50 },
      data: {
        label: 'AuthService',
        nodeType: 'SPRING_SERVICE',
        layer: 'BACKEND',
        filePath: 'src/main/java/com/codeflow/demo/service/AuthService.java',
        annotations: '@Service, @Transactional, PasswordEncoder, JwtTokenProvider',
      },
    },
    {
      id: 'svc_order',
      type: 'custom',
      position: { x: 650, y: 200 },
      data: {
        label: 'OrderService',
        nodeType: 'SPRING_SERVICE',
        layer: 'BACKEND',
        filePath: 'src/main/java/com/codeflow/demo/service/OrderService.java',
        annotations: '@Service, @Transactional, InventoryValidator',
      },
    },
    {
      id: 'svc_payment',
      type: 'custom',
      position: { x: 650, y: 350 },
      data: {
        label: 'PaymentService',
        nodeType: 'SPRING_SERVICE',
        layer: 'BACKEND',
        filePath: 'src/main/java/com/codeflow/demo/service/PaymentService.java',
        annotations: '@Service, @Transactional, StripeClient',
      },
    },
    {
      id: 'repo_user',
      type: 'custom',
      position: { x: 850, y: 50 },
      data: {
        label: 'UserRepository',
        nodeType: 'SPRING_REPOSITORY',
        layer: 'BACKEND',
        filePath: 'src/main/java/com/codeflow/demo/repository/UserRepository.java',
        annotations: 'JpaRepository, @Repository, findByUsername',
      },
    },
    {
      id: 'repo_order',
      type: 'custom',
      position: { x: 850, y: 200 },
      data: {
        label: 'OrderRepository',
        nodeType: 'SPRING_REPOSITORY',
        layer: 'BACKEND',
        filePath: 'src/main/java/com/codeflow/demo/repository/OrderRepository.java',
        annotations: 'JpaRepository, @Repository, findByUserId',
      },
    },
    {
      id: 'db_admin_account',
      type: 'custom',
      position: { x: 1050, y: 50 },
      data: {
        label: 'admin_accounts',
        nodeType: 'DB_TABLE',
        layer: 'DATABASE',
        filePath: 'db/schema/admin_accounts.sql',
        annotations: 'PostgreSQL Table, Primary Key: id (UUID), Indexes: idx_username',
      },
    },
    {
      id: 'db_orders_table',
      type: 'custom',
      position: { x: 1050, y: 200 },
      data: {
        label: 'orders',
        nodeType: 'DB_TABLE',
        layer: 'DATABASE',
        filePath: 'db/schema/orders.sql',
        annotations: 'PostgreSQL Table, Foreign Key: user_id -> users(id)',
      },
    },
  ],
  edges: [
    { id: 'e1', source: 'fe_react_app', target: 'gw_security', label: '1 HTTP Request' },
    { id: 'e2', source: 'gw_security', target: 'ctrl_admin', label: '2 Dispatch' },
    { id: 'e3', source: 'ctrl_admin', target: 'svc_auth', label: '3 Invoke Service' },
    { id: 'e4', source: 'svc_auth', target: 'repo_user', label: '4 SQL Query' },
    { id: 'e5', source: 'repo_user', target: 'db_admin_account', label: '5 Persistence' },
  ],
};

export const DEMO_ER_DATA = {
  tables: [
    {
      id: 't_users',
      tableName: 'users',
      entityName: 'User.java',
      fields: [
        { name: 'id', type: 'UUID', primaryKey: true },
        { name: 'username', type: 'VARCHAR(255)', primaryKey: false },
        { name: 'password_hash', type: 'VARCHAR(255)', primaryKey: false },
        { name: 'email', type: 'VARCHAR(255)', primaryKey: false },
        { name: 'role', type: 'VARCHAR(50)', primaryKey: false },
        { name: 'created_at', type: 'TIMESTAMP', primaryKey: false },
      ],
    },
    {
      id: 't_orders',
      tableName: 'orders',
      entityName: 'Order.java',
      fields: [
        { name: 'id', type: 'UUID', primaryKey: true },
        { name: 'user_id', type: 'UUID (FK)', primaryKey: false },
        { name: 'total_amount', type: 'NUMERIC(10,2)', primaryKey: false },
        { name: 'status', type: 'VARCHAR(50)', primaryKey: false },
        { name: 'shipping_address', type: 'TEXT', primaryKey: false },
        { name: 'created_at', type: 'TIMESTAMP', primaryKey: false },
      ],
    },
    {
      id: 't_order_items',
      tableName: 'order_items',
      entityName: 'OrderItem.java',
      fields: [
        { name: 'id', type: 'UUID', primaryKey: true },
        { name: 'order_id', type: 'UUID (FK)', primaryKey: false },
        { name: 'product_id', type: 'UUID (FK)', primaryKey: false },
        { name: 'quantity', type: 'INTEGER', primaryKey: false },
        { name: 'price', type: 'NUMERIC(10,2)', primaryKey: false },
      ],
    },
    {
      id: 't_payments',
      tableName: 'payments',
      entityName: 'Payment.java',
      fields: [
        { name: 'id', type: 'UUID', primaryKey: true },
        { name: 'order_id', type: 'UUID (FK)', primaryKey: false },
        { name: 'payment_method', type: 'VARCHAR(50)', primaryKey: false },
        { name: 'transaction_ref', type: 'VARCHAR(255)', primaryKey: false },
        { name: 'amount', type: 'NUMERIC(10,2)', primaryKey: false },
        { name: 'status', type: 'VARCHAR(50)', primaryKey: false },
      ],
    },
    {
      id: 't_admin_accounts',
      tableName: 'admin_accounts',
      entityName: 'AdminAccount.java',
      fields: [
        { name: 'id', type: 'UUID', primaryKey: true },
        { name: 'admin_username', type: 'VARCHAR(100)', primaryKey: false },
        { name: 'permissions', type: 'VARCHAR(255)', primaryKey: false },
        { name: 'last_login', type: 'TIMESTAMP', primaryKey: false },
      ],
    },
  ],
  relations: [
    { source: 'users', target: 'orders', type: 'ONE_TO_MANY', label: '@OneToMany: users.id -> orders.user_id' },
    { source: 'orders', target: 'order_items', type: 'ONE_TO_MANY', label: '@OneToMany: orders.id -> order_items.order_id' },
    { source: 'orders', target: 'payments', type: 'ONE_TO_ONE', label: '@OneToOne: orders.id -> payments.order_id' },
  ],
};

export const DEMO_SECURITY_DATA = {
  authType: 'JWT Stateless Bearer Authentication + Spring Security 6.x',
  filterChain: [
    'CorsFilter',
    'CsrfFilter (Disabled for Stateless API)',
    'JwtAuthenticationFilter (Bearer Header Interceptor)',
    'UsernamePasswordAuthenticationFilter',
    'ExceptionTranslationFilter',
    'AuthorizationFilter (Role & Authority Evaluator)',
  ],
  steps: [
    {
      step: 1,
      name: 'Client Dispatches HTTP Request',
      type: 'HTTP / HTTPS',
      description: 'Axios client serializes request and attaches Bearer JWT token into Authorization header.',
    },
    {
      step: 2,
      name: 'CorsFilter (Cross-Origin Policy)',
      type: 'SPRING_FILTER',
      description: 'Validates Origin header against allowed origins (e.g., http://localhost:3000) and permits OPTIONS preflight requests.',
    },
    {
      step: 3,
      name: 'JwtAuthenticationFilter',
      type: 'CUSTOM_FILTER',
      description: 'Extracts Bearer token from header, validates HMAC-SHA256 signature, parses claims (sub, roles, exp), and instantiates UsernamePasswordAuthenticationToken.',
    },
    {
      step: 4,
      name: 'SecurityContextHolder Populated',
      type: 'SECURITY_CONTEXT',
      description: 'Authentication principal is bound to current ThreadLocal context for duration of request lifecycle.',
    },
    {
      step: 5,
      name: 'AuthorizationFilter & Method Security',
      type: 'METHOD_SECURITY',
      description: 'Validates @PreAuthorize / @Secured constraints and URL antMatchers before DispatcherServlet invokes target controller.',
    },
  ],
};

export const DEMO_SQL_LOGS = [
  {
    id: 'sql1',
    repository: 'OrderRepository.save',
    queryType: 'INSERT',
    targetTable: 'orders',
    durationMs: 14,
    rowCount: 1,
    sql: 'INSERT INTO orders (id, user_id, total_amount, status, shipping_address, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  },
  {
    id: 'sql2',
    repository: 'UserRepository.findByUsername',
    queryType: 'SELECT',
    targetTable: 'users',
    durationMs: 4,
    rowCount: 1,
    sql: 'SELECT u.id, u.username, u.password_hash, u.email, u.role FROM users u WHERE u.username = ?',
  },
  {
    id: 'sql3',
    repository: 'OrderItemRepository.saveAll',
    queryType: 'INSERT',
    targetTable: 'order_items',
    durationMs: 18,
    rowCount: 3,
    sql: 'INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
  },
  {
    id: 'sql4',
    repository: 'PaymentRepository.save',
    queryType: 'INSERT',
    targetTable: 'payments',
    durationMs: 12,
    rowCount: 1,
    sql: 'INSERT INTO payments (id, order_id, payment_method, transaction_ref, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
  },
  {
    id: 'sql5',
    repository: 'OrderRepository.findByUserId',
    queryType: 'SELECT',
    targetTable: 'orders',
    durationMs: 8,
    rowCount: 5,
    sql: 'SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at FROM orders o WHERE o.user_id = ? ORDER BY o.created_at DESC',
  },
  {
    id: 'sql6',
    repository: 'AdminAccountRepository.updateLastLogin',
    queryType: 'UPDATE',
    targetTable: 'admin_accounts',
    durationMs: 6,
    rowCount: 1,
    sql: 'UPDATE admin_accounts SET last_login = NOW() WHERE id = ?',
  },
];

export const DEMO_DEPENDENCIES: ProjectDependency[] = [
  {
    id: 'dep1',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-web',
    version: '3.2.3',
    scope: 'compile',
    purposeSummary: 'Starter for building web, including RESTful, applications using Spring MVC. Uses Tomcat as default embedded container.',
    commonAnnotations: '@RestController, @RequestMapping, @GetMapping, @PostMapping, @PathVariable',
  },
  {
    id: 'dep2',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-data-jpa',
    version: '3.2.3',
    scope: 'compile',
    purposeSummary: 'Starter for using Spring Data JPA with Hibernate, HikariCP connection pooling, and Jakarta Persistence API.',
    commonAnnotations: '@Entity, @Table, @Id, @GeneratedValue, @Repository, @Transactional',
  },
  {
    id: 'dep3',
    groupId: 'org.springframework.boot',
    artifactId: 'spring-boot-starter-security',
    version: '3.2.3',
    scope: 'compile',
    purposeSummary: 'Enterprise-grade authentication and access-control framework for Spring applications.',
    commonAnnotations: '@EnableWebSecurity, @PreAuthorize, @Secured, SecurityFilterChain, PasswordEncoder',
  },
  {
    id: 'dep4',
    groupId: 'org.postgresql',
    artifactId: 'postgresql',
    version: '42.7.2',
    scope: 'runtime',
    purposeSummary: 'PostgreSQL JDBC Driver allowing Java programs to connect to PostgreSQL database servers.',
    commonAnnotations: 'Driver, HikariConfig, DataSource',
  },
  {
    id: 'dep5',
    groupId: 'org.projectlombok',
    artifactId: 'lombok',
    version: '1.18.30',
    scope: 'compile',
    purposeSummary: 'Java annotation library that reduces boilerplate code like getters, setters, equals, hashCode, and constructors.',
    commonAnnotations: '@Data, @Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor, @Builder',
  },
];

export const DEMO_FILE_TREE_DATA = {
  name: 'codeflow-demo-store',
  type: 'folder' as const,
  path: 'codeflow-demo-store',
  children: [
    {
      name: 'src',
      type: 'folder' as const,
      path: 'src',
      children: [
        {
          name: 'main',
          type: 'folder' as const,
          path: 'src/main',
          children: [
            {
              name: 'java',
              type: 'folder' as const,
              path: 'src/main/java',
              children: [
                {
                  name: 'com',
                  type: 'folder' as const,
                  path: 'src/main/java/com',
                  children: [
                    {
                      name: 'codeflow',
                      type: 'folder' as const,
                      path: 'src/main/java/com/codeflow',
                      children: [
                        {
                          name: 'controller',
                          type: 'folder' as const,
                          path: 'src/main/java/com/codeflow/controller',
                          children: [
                            { name: 'AdminController.java', type: 'file' as const, path: 'src/main/java/com/codeflow/demo/controller/AdminController.java', lineCount: 68 },
                            { name: 'OrderController.java', type: 'file' as const, path: 'src/main/java/com/codeflow/demo/controller/OrderController.java', lineCount: 114 },
                            { name: 'PaymentController.java', type: 'file' as const, path: 'src/main/java/com/codeflow/demo/controller/PaymentController.java', lineCount: 82 },
                          ],
                        },
                        {
                          name: 'service',
                          type: 'folder' as const,
                          path: 'src/main/java/com/codeflow/service',
                          children: [
                            { name: 'AuthService.java', type: 'file' as const, path: 'src/main/java/com/codeflow/demo/service/AuthService.java', lineCount: 95 },
                            { name: 'OrderService.java', type: 'file' as const, path: 'src/main/java/com/codeflow/demo/service/OrderService.java', lineCount: 142 },
                            { name: 'PaymentService.java', type: 'file' as const, path: 'src/main/java/com/codeflow/demo/service/PaymentService.java', lineCount: 108 },
                          ],
                        },
                        {
                          name: 'repository',
                          type: 'folder' as const,
                          path: 'src/main/java/com/codeflow/repository',
                          children: [
                            { name: 'UserRepository.java', type: 'file' as const, path: 'src/main/java/com/codeflow/demo/repository/UserRepository.java', lineCount: 34 },
                            { name: 'OrderRepository.java', type: 'file' as const, path: 'src/main/java/com/codeflow/demo/repository/OrderRepository.java', lineCount: 42 },
                          ],
                        },
                        {
                          name: 'config',
                          type: 'folder' as const,
                          path: 'src/main/java/com/codeflow/config',
                          children: [
                            { name: 'SecurityConfig.java', type: 'file' as const, path: 'src/main/java/com/codeflow/demo/config/SecurityConfig.java', lineCount: 76 },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'frontend',
      type: 'folder' as const,
      path: 'frontend',
      children: [
        { name: 'App.tsx', type: 'file' as const, path: 'src/App.tsx', lineCount: 148 },
        { name: 'CartView.tsx', type: 'file' as const, path: 'src/components/CartView.tsx', lineCount: 92 },
      ],
    },
    { name: 'pom.xml', type: 'file' as const, path: 'pom.xml', lineCount: 105 },
  ],
};

export const DEMO_TRACES = [
  {
    id: 'trace_checkout_1',
    projectId: 'demo-ecommerce-store',
    endpoint: '/api/v1/orders/checkout',
    httpMethod: 'POST',
    durationMs: 46,
    status: '200 OK',
    timestamp: new Date().toISOString(),
    traceStepsJson: JSON.stringify([
      { step: 1, layer: 'CLIENT', component: 'CartView.tsx (React 19)', action: 'User clicks Checkout button -> Axios POST /api/v1/orders/checkout', durationMs: 4 },
      { step: 2, layer: 'API_GATEWAY', component: 'SecurityConfig.java', action: 'JwtAuthenticationFilter verifies Bearer token & sets SecurityContextHolder', durationMs: 6 },
      { step: 3, layer: 'CONTROLLER', component: 'OrderController.java', action: 'DispatcherServlet delegates to handleCheckout(@Valid CheckoutDTO)', durationMs: 5 },
      { step: 4, layer: 'SERVICE', component: 'OrderService.java', action: '@Transactional boundary opened. Validates stock & applies pricing logic', durationMs: 12 },
      { step: 5, layer: 'REPOSITORY', component: 'OrderRepository.java', action: 'OrderRepository.save(order) -> Hibernate dirty checks entity state', durationMs: 6 },
      { step: 6, layer: 'REPOSITORY', component: 'PostgreSQL 16 Engine', action: 'INSERT INTO orders (...) VALUES (...) -> 1 row affected (ID: a81f-9921)', durationMs: 10 },
      { step: 7, layer: 'CLIENT', component: 'CartView.tsx (React 19)', action: 'Response HTTP 200 deserialized. UI transitions to Order Confirmation', durationMs: 3 },
    ]),
  },
  {
    id: 'trace_login_2',
    projectId: 'demo-ecommerce-store',
    endpoint: '/api/v1/admin/login',
    httpMethod: 'POST',
    durationMs: 28,
    status: '200 OK',
    timestamp: new Date().toISOString(),
    traceStepsJson: JSON.stringify([
      { step: 1, layer: 'CLIENT', component: 'LoginForm.tsx', action: 'Admin submits credentials -> POST /api/v1/admin/login', durationMs: 3 },
      { step: 2, layer: 'CONTROLLER', component: 'AdminController.java', action: 'AdminController.login(credentials) validated with @Valid', durationMs: 5 },
      { step: 3, layer: 'SERVICE', component: 'AuthService.java', action: 'AuthService queries BCrypt password encoder & issues JWT token', durationMs: 14 },
      { step: 4, layer: 'REPOSITORY', component: 'UserRepository.java', action: 'SELECT * FROM users WHERE username = ? -> 1 row returned', durationMs: 4 },
      { step: 5, layer: 'CLIENT', component: 'AdminDashboard.tsx', action: 'JWT saved to localStorage. Redirect to admin workspace', durationMs: 2 },
    ]),
  },
];

export const DEMO_FILE_SNIPPETS: Record<string, string> = {
  'src/App.tsx': `import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InteractiveFlowExplorer } from './components/InteractiveFlowExplorer';

export default function App() {
  const [cart, setCart] = useState([]);
  
  const handleCheckout = async () => {
    const res = await axios.post('/api/v1/orders/checkout', { items: cart });
    console.log('Order created:', res.data);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />
      <InteractiveFlowExplorer />
    </div>
  );
}`,
  'src/main/java/com/codeflow/demo/controller/OrderController.java': `package com.codeflow.demo.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "http://localhost:3000")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponseDTO> checkout(@Valid @RequestBody OrderRequestDTO dto) {
        OrderResponseDTO response = orderService.processCheckout(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}`,
  'src/main/java/com/codeflow/demo/service/OrderService.java': `package com.codeflow.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.codeflow.demo.repository.OrderRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Transactional
    public OrderResponseDTO processCheckout(OrderRequestDTO dto) {
        // Validate inventory & calculate total
        Order order = new Order(dto);
        Order savedOrder = orderRepository.save(order);
        return new OrderResponseDTO(savedOrder);
    }
}`,
  'src/main/java/com/codeflow/demo/repository/OrderRepository.java': `package com.codeflow.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByUserId(UUID userId);
}`,
  'src/main/java/com/codeflow/demo/config/SecurityConfig.java': `package com.codeflow.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .build();
    }
}`,
  'src/components/CartView.tsx': `import React, { useState } from 'react';
import axios from 'axios';

export const CartView = () => {
  const [items, setItems] = useState([]);
  
  return (
    <div className="p-6 bg-slate-900 rounded-xl">
      <h2>Shopping Cart</h2>
      <button onClick={() => axios.post('/api/v1/orders/checkout', { items })}>
        Confirm Checkout
      </button>
    </div>
  );
};`,
  'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.codeflow</groupId>
    <artifactId>demo-ecommerce-store</artifactId>
    <version>3.0.0</version>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
    </dependencies>
</project>`,
};
