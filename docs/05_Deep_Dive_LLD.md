# CodeFlow Studio - Deep Dive & Low-Level Design (LLD)

This document provides a technical deep dive into the low-level design of the **Parser Engine**, **Relationship Resolver**, **Database Schema**, and **Backend System Architecture**.

---

## 1. Static AST Parser Engine Deep Dive

### 1.1 Java Spring Boot AST Parser (JavaParser Implementation)

The Java parser relies on `com.github.javaparser.ast.VisitorDeclaration` to traverse the Abstract Syntax Tree of every `.java` file in the target project.

```java
public class SpringComponentVisitor extends VoidVisitorAdapter<ParsingContext> {

    @Override
    public void visit(ClassOrInterfaceDeclaration n, ParsingContext ctx) {
        super.visit(n, ctx);
        
        // 1. Controller Detection
        if (n.hasAnnotationWithName("RestController") || n.hasAnnotationWithName("Controller")) {
            ParsedNode controllerNode = ParsedNode.builder()
                .id(UUID.randomUUID().toString())
                .name(n.getNameAsString())
                .type(NodeType.SPRING_CONTROLLER)
                .packageName(ctx.getPackageName())
                .filePath(ctx.getRelativeFilePath())
                .basePath(extractRequestMappingPath(n))
                .build();
            ctx.addNode(controllerNode);
            
            // Inspect Controller Methods
            n.getMethods().forEach(m -> extractEndpointMethod(m, controllerNode, ctx));
        }

        // 2. Service Detection
        if (n.hasAnnotationWithName("Service")) {
            ParsedNode serviceNode = ParsedNode.builder()
                .id(UUID.randomUUID().toString())
                .name(n.getNameAsString())
                .type(NodeType.SPRING_SERVICE)
                .filePath(ctx.getRelativeFilePath())
                .build();
            ctx.addNode(serviceNode);
        }

        // 3. Repository Detection
        if (n.hasAnnotationWithName("Repository") || isSpringDataRepository(n)) {
            ParsedNode repoNode = ParsedNode.builder()
                .id(UUID.randomUUID().toString())
                .name(n.getNameAsString())
                .type(NodeType.SPRING_REPOSITORY)
                .filePath(ctx.getRelativeFilePath())
                .targetEntity(extractTargetEntityFromRepo(n))
                .build();
            ctx.addNode(repoNode);
        }
    }
}
```

### 1.2 React / TypeScript AST Extractor

The React parser scans `.tsx` and `.jsx` files to extract:
1. **Components**: Functions returning JSX elements.
2. **API Call Sites**: Axios/Fetch invocations matching pattern `axios.(get|post|put|delete)<T>('url', payload)`.

```typescript
// Regex & AST Token Pattern Matching Algorithm for React API Invocations
const API_CALL_REGEX = /axios\.(get|post|put|delete|patch)\s*\(\s*[`'"]([^`'"]+)[`'"]/g;

export function extractReactApiCalls(fileContent: string, filePath: string): ReactApiCallSite[] {
  const calls: ReactApiCallSite[] = [];
  let match;
  while ((match = API_CALL_REGEX.exec(fileContent)) !== null) {
    calls.push({
      httpMethod: match[1].toUpperCase(),
      rawUrlPattern: match[2],
      filePath: filePath,
      lineNumber: getLineNumber(fileContent, match.index)
    });
  }
  return calls;
}
```

---

## 2. Relationship Resolver Engine Algorithm

The Relationship Resolver bridges the gap between client component calls, Spring Boot controllers, services, repositories, and JPA entities.

```
       [React Component] 
               │  (Path Matching: Axios URL <-> Spring RequestMapping)
               ▼
      [Spring Controller]
               │  (AST Method Call Graph / Injected Field matching)
               ▼
       [Spring Service]
               │  (Field Injection matching @Autowired / constructor)
               ▼
     [Spring Repository]
               │  (Generics Inspection: JpaRepository<Entity, ID>)
               ▼
     [PostgreSQL Database Table]
```

### Path Matching Logic (Cross-Language Resolver)
1. Normalize URLs: Replace template parameters like `${userId}` or `{id}` with wildcard regex `([^/]+)`.
2. Convert Spring Path `/api/v1/users/{userId}/posts` $\rightarrow$ Regex pattern `^/api/v1/users/([^/]+)/posts$`.
3. Match React Axios call `axios.get('/api/v1/users/' + id + '/posts')` against regex pattern.
4. If match score $> 0.9$, create Edge `Edge(source: ReactNode, target: ControllerEndpointNode, weight: 1.0)`.

---

## 3. Database Schema Design (PostgreSQL)

```sql
-- 1. Projects Table
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(20) NOT NULL, -- GITHUB, ZIP
    source_url TEXT,
    status VARCHAR(30) NOT NULL,     -- QUEUED, PROCESSING, COMPLETED, FAILED
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Project Dependencies Table
CREATE TABLE project_dependencies (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) REFERENCES projects(id) ON DELETE CASCADE,
    group_id VARCHAR(150),
    artifact_id VARCHAR(150) NOT NULL,
    version VARCHAR(50),
    scope VARCHAR(30),
    purpose_summary TEXT
);

-- 3. Parsed Nodes Table
CREATE TABLE project_nodes (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) REFERENCES projects(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    layer VARCHAR(30) NOT NULL,       -- FRONTEND, BACKEND, DATABASE, DEPENDENCY
    node_type VARCHAR(50) NOT NULL,   -- REACT_COMPONENT, SPRING_CONTROLLER, SPRING_SERVICE, SPRING_REPOSITORY, DB_TABLE
    file_path TEXT,
    line_number INT,
    method_name VARCHAR(150),
    metadata_json JSONB
);

-- 4. Directed Graph Edges Table
CREATE TABLE project_edges (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) REFERENCES projects(id) ON DELETE CASCADE,
    source_node_id VARCHAR(36) REFERENCES project_nodes(id) ON DELETE CASCADE,
    target_node_id VARCHAR(36) REFERENCES project_nodes(id) ON DELETE CASCADE,
    edge_label VARCHAR(255),
    metadata_json JSONB
);

-- 5. Database ERD Entities & Relations
CREATE TABLE entity_tables (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) REFERENCES projects(id) ON DELETE CASCADE,
    table_name VARCHAR(150) NOT NULL,
    entity_class VARCHAR(255) NOT NULL
);

CREATE TABLE entity_columns (
    id VARCHAR(36) PRIMARY KEY,
    table_id VARCHAR(36) REFERENCES entity_tables(id) ON DELETE CASCADE,
    column_name VARCHAR(150) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    is_primary_key BOOLEAN DEFAULT FALSE,
    is_foreign_key BOOLEAN DEFAULT FALSE
);

CREATE TABLE entity_relationships (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) REFERENCES projects(id) ON DELETE CASCADE,
    from_table_id VARCHAR(36) REFERENCES entity_tables(id) ON DELETE CASCADE,
    to_table_id VARCHAR(36) REFERENCES entity_tables(id) ON DELETE CASCADE,
    relationship_type VARCHAR(30) NOT NULL, -- ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY, ONE_TO_ONE
    foreign_key_column VARCHAR(150)
);

-- Indexes for performance
CREATE INDEX idx_nodes_project ON project_nodes(project_id);
CREATE INDEX idx_edges_project ON project_edges(project_id);
CREATE INDEX idx_dependencies_project ON project_dependencies(project_id);
```

---

## 4. Backend Clean Architecture Project Package Structure

```
com.codeflow.studio
├── config                 # Spring Security, CORS, Async Thread Pool configuration
├── controller             # REST Controllers (ProjectController, GraphController, FileController)
├── dto                    # Request/Response Data Transfer Objects
├── exception              # Global Exception Handlers & custom exceptions
├── model                  # Domain Models & JPA Entities
├── repository             # Spring Data JPA Repositories
└── service                # Core Business Logic Layer
    ├── ingestion          # Git cloning (JGit) & ZIP extraction
    ├── parser             # Maven, JavaParser AST, and React AST modules
    │   ├── java           # Spring annotation & AST visitors
    │   ├── maven          # pom.xml model parser
    │   ├── react          # React component & route AST scanner
    │   └── database       # JPA Entity & ERD parser
    ├── resolver           # Cross-layer relationship resolution algorithm
    └── storage            # Ephemeral directory management & cleanup
```
