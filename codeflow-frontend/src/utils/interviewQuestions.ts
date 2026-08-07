export interface QAItem {
  question: string;
  answer: string;
}

export const INTERVIEW_QUESTIONS: Record<string, QAItem[]> = {
  SPRING_CONTROLLER: [
    {
      question: 'What is the difference between @RestController and @Controller in Spring MVC?',
      answer: '@RestController is a convenience annotation combining @Controller and @ResponseBody. Methods return data directly serialized into JSON/XML payloads rather than rendering HTML views.',
    },
    {
      question: 'How does Spring DispatcherServlet route incoming HTTP requests to @PostMapping handlers?',
      answer: 'DispatcherServlet receives the request and consults RequestMappingHandlerMapping to find a matching method based on URL, HTTP method (POST), headers, and media types.',
    },
    {
      question: 'How do @Valid and BindingResult work for DTO input validation?',
      answer: '@Valid triggers JSR-380 / Bean Validation (Hibernate Validator) on the DTO. If validation constraints fail, errors are populated into BindingResult or trigger a MethodArgumentNotValidException.',
    },
  ],
  SPRING_SERVICE: [
    {
      question: 'How does Spring AOP implement declarative transaction management (@Transactional)?',
      answer: 'Spring creates a dynamic JDK or CGLIB proxy around the @Service bean. When a method annotated with @Transactional is invoked, TransactionInterceptor opens a JDBC connection, sets auto-commit to false, and commits on completion or rolls back on unchecked exceptions.',
    },
    {
      question: 'What is the difference between REQUIRED and REQUIRES_NEW transaction propagation?',
      answer: 'REQUIRED joins the existing transaction if one exists, or creates a new one if none exists. REQUIRES_NEW always suspends the current transaction and starts a completely independent physical transaction.',
    },
    {
      question: 'Why is constructor injection preferred over @Autowired field injection?',
      answer: 'Constructor injection promotes immutability (fields can be final), makes components easy to test with mock objects without Spring containers, and prevents circular dependency issues at compile time.',
    },
  ],
  SPRING_REPOSITORY: [
    {
      question: 'How does Spring Data JPA generate SQL queries from method names (e.g., findByUsername)?',
      answer: 'PartTreeJpaQuery parses method names according to a property tree grammar, extracts entity field criteria, and builds a CriteriaQuery / HQL AST which Hibernate translates into native SQL.',
    },
    {
      question: 'What is the N+1 SELECT problem and how do you solve it in JPA?',
      answer: 'The N+1 problem occurs when fetching an entity with lazy relationships causes 1 query for the parent list plus N additional queries for each child. Solved using JOIN FETCH or @EntityGraph annotations.',
    },
    {
      question: 'What is the difference between JpaRepository and CrudRepository?',
      answer: 'JpaRepository extends PagingAndSortingRepository (which extends CrudRepository). It adds JPA-specific methods such as flush(), saveAndFlush(), deleteInBatch(), and pagination returns List<T> instead of Iterable<T>.',
    },
  ],
  DB_TABLE: [
    {
      question: 'What is the difference between Lazy and Eager fetching in JPA @Entity mapping?',
      answer: 'EAGER fetching loads associated entity relationships immediately when the parent entity is loaded. LAZY fetching defers loading until the relationship proxy is first accessed inside an open PersistenceContext.',
    },
    {
      question: 'How does Hibernate dirty checking work during flush phase?',
      answer: 'When an entity is loaded, Hibernate saves a snapshot of its state in the L1 Session cache. Upon session flush or transaction commit, Hibernate compares the current entity state against the snapshot and auto-generates UPDATE queries for changed properties.',
    },
    {
      question: 'What is Optimistic Locking vs Pessimistic Locking in databases?',
      answer: 'Optimistic locking uses a @Version column to verify no concurrent update modified the record before committing. Pessimistic locking locks the database row explicitly via SELECT ... FOR UPDATE.',
    },
  ],
  REACT_COMPONENT: [
    {
      question: 'How does React 18 Virtual DOM reconciliation (Fiber architecture) work?',
      answer: 'React constructs a fiber tree representing UI components. On state updates, it generates a new fiber tree, performs diffing against the current tree (Reconciliation), and batches DOM mutations in the commit phase.',
    },
    {
      question: 'Why should useEffect dependency arrays be specified carefully?',
      answer: 'Omitting dependencies leads to stale closures referencing old state/props. Including unstable object/function references causes infinite re-render loops. Solved with useCallback, useMemo, or functional state updates.',
    },
    {
      question: 'What is the purpose of React Context API vs Redux/Zustand for global state?',
      answer: 'Context API avoids prop drilling for low-frequency global values (theme, auth state). External state managers optimize fine-grained selector re-renders for frequent dynamic updates across deep trees.',
    },
  ],
  REACT_API_CALL: [
    {
      question: 'How do HTTP interceptors work in Axios for Bearer Token authentication?',
      answer: 'Axios request interceptors inject an Authorization header (Bearer <jwt>) into outgoing HTTP requests before network transmission. Response interceptors handle 401 Unauthorized errors globally.',
    },
    {
      question: 'What is CORS (Cross-Origin Resource Sharing) and how is it resolved in Spring Boot?',
      answer: 'CORS is a browser security mechanism blocking cross-domain API requests. Resolved in Spring Boot via @CrossOrigin on controllers or WebMvcConfigurer CORS mappings configuring Access-Control-Allow-Origin headers.',
    },
    {
      question: 'What is the difference between REST API and GraphQL endpoints?',
      answer: 'REST uses fixed resource URLs and HTTP verbs returning rigid JSON DTO schemas. GraphQL exposes a single POST /graphql endpoint allowing clients to query specific fields avoiding over-fetching and under-fetching.',
    },
  ],
};

export function getInterviewQuestionsForNode(nodeType?: string): QAItem[] {
  if (!nodeType) return INTERVIEW_QUESTIONS.SPRING_CONTROLLER;
  const cleanType = nodeType.toUpperCase().trim();

  if (INTERVIEW_QUESTIONS[cleanType]) {
    return INTERVIEW_QUESTIONS[cleanType];
  }
  if (cleanType.includes('CONTROLLER')) return INTERVIEW_QUESTIONS.SPRING_CONTROLLER;
  if (cleanType.includes('SERVICE')) return INTERVIEW_QUESTIONS.SPRING_SERVICE;
  if (cleanType.includes('REPO')) return INTERVIEW_QUESTIONS.SPRING_REPOSITORY;
  if (cleanType.includes('DB') || cleanType.includes('TABLE') || cleanType.includes('ENTITY')) return INTERVIEW_QUESTIONS.DB_TABLE;
  if (cleanType.includes('API') || cleanType.includes('AXIOS') || cleanType.includes('FETCH')) return INTERVIEW_QUESTIONS.REACT_API_CALL;
  if (cleanType.includes('REACT') || cleanType.includes('COMPONENT')) return INTERVIEW_QUESTIONS.REACT_COMPONENT;

  return INTERVIEW_QUESTIONS.SPRING_CONTROLLER;
}
