/**
 * 工作流模块统一入口文件
 * 
 * 提供工作流相关的所有导出，方便外部模块使用
 */

// 主页面组件
export { default as WorkflowPage } from './page';
export { default as OriginalWorkflowPage } from './page_backup';

// 组件导出
export * from './components';

// Hooks导出
export * from './hooks';

// 工具函数导出
export * from './utils';

// 类型定义导出
export * from './types';

// 重新导出常用的UI组件（从packages/ui）
export { 
  WorkflowCanvas as UIWorkflowCanvas,
  WorkflowHeader as UIWorkflowHeader,
  WorkflowMenu as UIWorkflowMenu
} from '@repo/ui/main/flow';

export {
  NodeDetailsView,
  ParameterInput
} from '@repo/ui/';

// 重新导出常用的服务
export { testWorkflow } from '@/services/workflowTestService';
export { debugNode } from '@/services/nodeDebugService';
export { ConnectConfigService } from '@/services/connectConfigService';
export { fetchDatabaseTables } from '@/services/databaseService';