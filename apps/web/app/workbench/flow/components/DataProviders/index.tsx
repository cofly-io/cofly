/**
 * DataProviders组件入口文件
 * 
 * 统一导出所有数据提供者组件和相关的hooks、类型
 */

// 节点分类数据提供者
export { 
  NodeCategoriesProvider, 
  useNodeCategories, 
  withNodeCategories 
} from './NodeCategoriesProvider';

export type { 
  NodeCategory, 
  NodeInfo, 
  NodeCategoriesContextType 
} from './NodeCategoriesProvider';

// 工作流状态提供者
export { 
  WorkflowStateProvider, 
  useWorkflowState, 
  withWorkflowState 
} from './WorkflowStateProvider';

export type { 
  WorkflowState, 
  CanvasStateInfo, 
  UserPreferences, 
  WorkflowStateContextType 
} from './WorkflowStateProvider';

/**
 * 组合所有数据提供者的高阶组件
 */
import React from 'react';
import { NodeCategoriesProvider } from './NodeCategoriesProvider';
import { WorkflowStateProvider } from './WorkflowStateProvider';

interface AllProvidersProps {
  children: React.ReactNode;
  workflowId?: string;
  workflowName?: string;
  showError?: (title: string, message: string) => void;
  autoSaveInterval?: number;
  cacheTimeout?: number;
}

/**
 * 组合所有数据提供者的组件
 * 提供统一的数据管理层
 */
export const AllDataProviders: React.FC<AllProvidersProps> = ({
  children,
  workflowId,
  workflowName,
  showError,
  autoSaveInterval,
  cacheTimeout
}) => {
  return (
    <WorkflowStateProvider
      initialWorkflowId={workflowId}
      initialWorkflowName={workflowName}
      autoSaveInterval={autoSaveInterval}
    >
      <NodeCategoriesProvider
        showError={showError}
        cacheTimeout={cacheTimeout}
      >
        {children}
      </NodeCategoriesProvider>
    </WorkflowStateProvider>
  );
};