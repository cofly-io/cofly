// Workflow related interfaces
export const WorkflowDef = {
    identifier: "IWorkflowLoader"
}

// 工作流配置接口
export interface WorkflowConfig {
  id: string;
  name: string;
  isActive: boolean;
  createdTime: string;
  updatedTime: string;
  createUser: string;
}

export interface WorkflowData {
    id: string;
    name: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date,
    updatedAt: Date,
    createUser: string;
    config?: any;
}

export interface WorkflowListOptions {
    limit?: number;
}

export interface IWorkflowLoader {
    get(id: string): Promise<WorkflowData | null | undefined>;
    list(opts?: WorkflowListOptions) : Promise<WorkflowData[] | null  | undefined>;
}