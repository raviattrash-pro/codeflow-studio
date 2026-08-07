export interface AnnotationDetail {
  name: string;
  whyUsed: string;
  internalWorking: string;
}

export const ANNOTATION_DICTIONARY: Record<string, AnnotationDetail> = {
  '@RestController': {
    name: '@RestController',
    whyUsed: 'Combines @Controller and @ResponseBody. Marks class as a RESTful HTTP endpoint handler returning JSON/XML payloads directly to clients.',
    internalWorking: 'Spring DispatcherServlet intercepts HTTP requests, matches HandlerMapping, and delegates execution to the controller method. ResponseBodyAdvice serializes the return value into JSON using Jackson MappingJackson2HttpMessageConverter.',
  },
  '@Controller': {
    name: '@Controller',
    whyUsed: 'Stereotype annotation marking a Spring MVC controller component that handles HTTP requests and returns view templates (e.g. Thymeleaf, JSP).',
    internalWorking: 'Scanned during component scanning (@ComponentScan). Registered in RequestMappingHandlerMapping. ViewResolver resolves the returned String view name to an actual template.',
  },
  '@Service': {
    name: '@Service',
    whyUsed: 'Marks a Java class as a Business Logic Service component in the service layer.',
    internalWorking: 'Spring IoC container instantiates this class as a singleton bean during application context initialization. Frequently wrapped by Spring AOP proxies for declarative transaction handling.',
  },
  '@Repository': {
    name: '@Repository',
    whyUsed: 'Marks Data Access Object (DAO) classes and encapsulates database CRUD operations.',
    internalWorking: 'Registers bean in Spring context and enables PersistenceExceptionTranslationPostProcessor to catch vendor-specific SQL exceptions and rethrow them as Spring DataAccessException hierarchy.',
  },
  '@Autowired': {
    name: '@Autowired',
    whyUsed: 'Injects dependent Spring beans automatically by type (Dependency Injection).',
    internalWorking: 'AutowiredAnnotationBeanPostProcessor inspects bean fields, setters, and constructors via reflection during bean post-processing and injects matching bean references from BeanFactory.',
  },
  '@Transactional': {
    name: '@Transactional',
    whyUsed: 'Defines atomic database transaction boundaries around service methods to guarantee ACID properties.',
    internalWorking: 'Spring AOP creates a dynamic proxy wrapping the target bean. TransactionInterceptor intercepts call, gets connection from PlatformTransactionManager, sets autoCommit=false, and commits on success or rolls back on RuntimeException.',
  },
  '@GetMapping': {
    name: '@GetMapping',
    whyUsed: 'Shortcut for @RequestMapping(method = RequestMethod.GET). Maps HTTP GET requests to handler methods.',
    internalWorking: 'RequestMappingHandlerMapping registers URL patterns and matches incoming GET request URIs to invoke method via reflection.',
  },
  '@PostMapping': {
    name: '@PostMapping',
    whyUsed: 'Shortcut for @RequestMapping(method = RequestMethod.POST). Maps HTTP POST requests to create/submit resource actions.',
    internalWorking: 'DispatcherServlet matches POST request content-type and body data to method parameters via HttpMessageConverter.',
  },
  '@PutMapping': {
    name: '@PutMapping',
    whyUsed: 'Shortcut for @RequestMapping(method = RequestMethod.PUT). Maps HTTP PUT requests for full resource updates.',
    internalWorking: 'Resolves URI path variables and deserializes request payload into target Java entity.',
  },
  '@DeleteMapping': {
    name: '@DeleteMapping',
    whyUsed: 'Shortcut for @RequestMapping(method = RequestMethod.DELETE). Maps HTTP DELETE requests for resource removal.',
    internalWorking: 'Dispatches DELETE request to target service method and returns HTTP 204 No Content or 200 OK.',
  },
  '@RequestBody': {
    name: '@RequestBody',
    whyUsed: 'Binds incoming HTTP JSON body directly to a Java DTO parameter object.',
    internalWorking: 'MappingJackson2HttpMessageConverter reads HTTP input stream and deserializes JSON fields into Java class properties.',
  },
  '@PathVariable': {
    name: '@PathVariable',
    whyUsed: 'Extracts template path variables directly from the request URI (e.g. /users/{id}).',
    internalWorking: 'PathVariableMethodArgumentResolver extracts URI matrix variables matched by RequestMappingHandlerMapping.',
  },
  '@RequestParam': {
    name: '@RequestParam',
    whyUsed: 'Extracts query parameter values from URL string (e.g. ?search=codeflow).',
    internalWorking: 'RequestParamMethodArgumentResolver parses query parameters from ServletRequest.getParameterMap().',
  },
  '@Entity': {
    name: '@Entity',
    whyUsed: 'Specifies that a Java class is a JPA persistent domain model mapped to a relational database table.',
    internalWorking: 'Hibernate SessionFactory inspects class annotations at startup, registers metadata in EntityMetamodel, and generates corresponding DDL/SQL statements.',
  },
  '@Table': {
    name: '@Table',
    whyUsed: 'Specifies the target database table name and indexes for an @Entity class.',
    internalWorking: 'Hibernate schema generator maps the class to the specified table name in SQL queries.',
  },
  '@Id': {
    name: '@Id',
    whyUsed: 'Denotes the primary key property of an entity.',
    internalWorking: 'Used by Hibernate PersistenceContext for L1 session identity map lookups and dirty checking.',
  },
  '@GeneratedValue': {
    name: '@GeneratedValue',
    whyUsed: 'Provides specification of primary key value generation strategies (IDENTITY, SEQUENCE, AUTO, UUID).',
    internalWorking: 'IdentifierGenerator delegates to database sequence or auto-increment column during SQL INSERT.',
  },
  '@Valid': {
    name: '@Valid',
    whyUsed: 'Triggers automated validation of nested DTO properties using Bean Validation (JSR-380).',
    internalWorking: 'MethodValidationInterceptor invokes Hibernate Validator engine before method execution.',
  },
};

export function getAnnotationDetails(csvOrList?: string): AnnotationDetail[] {
  if (!csvOrList) return [];

  const tokens = csvOrList
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const results: AnnotationDetail[] = [];

  for (const token of tokens) {
    const formatted = token.startsWith('@') ? token : `@${token}`;
    if (ANNOTATION_DICTIONARY[formatted]) {
      results.push(ANNOTATION_DICTIONARY[formatted]);
    } else {
      results.push({
        name: formatted,
        whyUsed: `Spring Framework / Java annotation ${formatted} used for metadata configuration.`,
        internalWorking: `Processed by Spring annotation processor during context startup or runtime reflection reflection.`,
      });
    }
  }

  return results;
}
