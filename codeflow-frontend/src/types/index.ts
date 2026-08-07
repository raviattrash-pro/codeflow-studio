export interface Project {
  id: string;
  name: string;
  sourceType: 'GITHUB' | 'ZIP';
  sourceUrl?: string;
  status: 'QUEUED' | 'CLONING' | 'PARSING_POM' | 'PARSING_JAVA' | 'PARSING_REACT' | 'RESOLVING_RELATIONSHIPS' | 'COMPLETED' | 'FAILED';
  progressPercentage: number;
  errorMessage?: string;
  backendFramework?: string;
  backendVersion?: string;
  javaVersion?: string;
  frontendFramework?: string;
  frontendVersion?: string;
  databaseType?: string;
  controllerCount?: number;
  serviceCount?: number;
  repositoryCount?: number;
  componentCount?: number;
  apiCount?: number;
  dependencyCount?: number;
}

export interface ProjectNode {
  id: string;
  projectId: string;
  label: string;
  layer: 'FRONTEND' | 'BACKEND' | 'DATABASE' | 'DEPENDENCY';
  nodeType: 'REACT_COMPONENT' | 'SPRING_CONTROLLER' | 'SPRING_SERVICE' | 'SPRING_REPOSITORY' | 'DB_TABLE' | 'REACT_API_CALL';
  filePath?: string;
  lineNumber?: number;
  methodName?: string;
  httpMethod?: string;
  endpointPath?: String;
  packageName?: string;
  annotationsCsv?: string;
  targetEntity?: string;
}

export interface ExecutionStep {
  stepNumber: number;
  nodeId: string;
  title: string;
  category: 'CLIENT_EVENT' | 'HTTP_REQUEST' | 'CONTROLLER_DISPATCH' | 'SERVICE_LOGIC' | 'REPOSITORY_QUERY' | 'SQL_EXECUTION' | 'JSON_RESPONSE';
  description: string;
  annotations?: { name: String; purpose: string; internalWorking: string }[];
  payloadSample?: string;
  fileSnippet?: string;
}

export interface GraphData {
  nodes: {
    id: string;
    type: string;
    data: {
      label: string;
      layer: string;
      nodeType: string;
      filePath?: string;
      httpMethod?: string;
      endpointPath?: string;
      annotations?: string;
      methodName?: string;
      targetEntity?: string;
    };
    position: { x: number; y: number };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
    type?: string;
  }[];
}

export interface NodeDetail {
  node: ProjectNode;
  calledBy: ProjectNode[];
  calls: ProjectNode[];
  educationalContext?: {
    purpose: string;
    interviewQuestions: string[];
    frameworkRole: string;
  };
}

export interface ProjectDependency {
  id: string;
  groupId: string;
  artifactId: string;
  version: string;
  scope: string;
  purposeSummary: string;
  commonAnnotations: string;
}
