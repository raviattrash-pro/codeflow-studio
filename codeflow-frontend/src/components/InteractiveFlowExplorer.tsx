import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GraphData } from '../types';
import { HLDFlowCanvas } from './HLDFlowCanvas';
import { ThemeMode } from './Header';

interface InteractiveFlowExplorerProps {
  graphData: GraphData;
  onSelectNode: (nodeId: string) => void;
  selectedNodeId?: string;
  onViewCode?: (filePath: string) => void;
  currentTheme?: ThemeMode;
  onOpenTool?: (toolKey: string) => void;
  projectName?: string;
}

export interface FlowStep {
  id: string;
  stepNumber: number;
  nodeId: string;
  nodeType: string;
  layer: 'FRONTEND' | 'BACKEND' | 'DATABASE';
  title: string;
  subtitle: string;
  filePath?: string;
  methodName?: string;
  httpMethod?: string;
  endpointPath?: string;
  annotationsCsv?: string;
  description: string;
  dataPayload?: string;
}

export interface FeatureScenario {
  id: string;
  name: string;
  icon: string;
  endpoint: string;
  httpMethod: string;
  description: string;
  color: string;
  steps: FlowStep[];
  subGraphData: GraphData;
}

export const InteractiveFlowExplorer: React.FC<InteractiveFlowExplorerProps> = ({
  graphData,
  onSelectNode,
  selectedNodeId,
  onViewCode,
  currentTheme = 'NIGHT',
  onOpenTool,
  projectName = 'Repository',
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <HLDFlowCanvas
        graphData={graphData}
        flowSteps={[]}
        activeStepIndex={activeStepIndex}
        onSelectStep={setActiveStepIndex}
        onViewCode={onViewCode}
        currentTheme={currentTheme}
        onOpenTool={onOpenTool}
        projectName={projectName}
      />
    </div>
  );
};
