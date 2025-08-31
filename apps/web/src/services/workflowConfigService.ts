import { WorkflowConfig } from '@repo/common';

// Types for workflow config service
export interface WorkflowConfigData extends Omit<WorkflowConfig, 'id' | 'createdTime' | 'updatedTime'> {
  id?: string;
  version?: string;
  nodesInfo?: any;
  relation?: any;
  createdTime?: string;
  updatedTime?: string;
}

export interface CreateWorkflowConfigRequest {
  name: string;
  version?: string;
  isActive?: boolean;
  nodesInfo?: any;
  relation?: any;
  createUser?: string;
}

export interface UpdateWorkflowConfigRequest {
  name?: string;
  version?: string;
  isActive?: boolean;
  nodesInfo?: any;
  relation?: any;
  action?: 'toggle';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Base API URL
const API_BASE_URL = '/api/workflow-config';

// 创建工作流配置
export async function createWorkflowConfig(data: CreateWorkflowConfigRequest): Promise<ApiResponse<WorkflowConfigData>> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '创建工作流配置失败');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating workflow config:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建工作流配置失败'
    };
  }
}

// 获取所有工作流配置
export async function getAllWorkflowConfigs(): Promise<ApiResponse<WorkflowConfigData[]>> {
  try {
    const response = await fetch(API_BASE_URL);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '获取工作流配置失败');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching workflow configs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取工作流配置失败'
    };
  }
}

// 根据用户获取工作流配置
export async function getWorkflowConfigsByUser(user: string): Promise<ApiResponse<WorkflowConfigData[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}?user=${encodeURIComponent(user)}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '获取用户工作流配置失败');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user workflow configs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户工作流配置失败'
    };
  }
}

// 获取活跃的工作流配置
export async function getActiveWorkflowConfigs(): Promise<ApiResponse<WorkflowConfigData[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}?activeOnly=true`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '获取活跃工作流配置失败');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching active workflow configs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取活跃工作流配置失败'
    };
  }
}

// 根据ID获取工作流配置
export async function getWorkflowConfigById(id: string): Promise<ApiResponse<WorkflowConfigData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '获取工作流配置详情失败');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching workflow config:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取工作流配置详情失败'
    };
  }
}

// 更新工作流配置
export async function updateWorkflowConfig(id: string, data: UpdateWorkflowConfigRequest): Promise<ApiResponse<WorkflowConfigData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '更新工作流配置失败');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating workflow config:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新工作流配置失败'
    };
  }
}

// 切换工作流配置状态
export async function toggleWorkflowConfigStatus(id: string): Promise<ApiResponse<WorkflowConfigData>> {
  return updateWorkflowConfig(id, { action: 'toggle' });
}

// 删除工作流配置 (硬删除)
export async function deleteWorkflowConfig(id: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '删除工作流配置失败');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting workflow config:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除工作流配置失败'
    };
  }
}

// 软删除工作流配置
export async function softDeleteWorkflowConfig(id: string): Promise<ApiResponse<WorkflowConfigData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/soft-delete`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '删除工作流配置失败');
    }

    return await response.json();
  } catch (error) {
    console.error('Error soft deleting workflow config:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除工作流配置失败'
    };
  }
}

// 复制工作流配置
export async function duplicateWorkflowConfig(id: string, newName: string, createUser?: string): Promise<ApiResponse<WorkflowConfigData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newName, createUser }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '复制工作流配置失败');
    }

    return await response.json();
  } catch (error) {
    console.error('Error duplicating workflow config:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '复制工作流配置失败'
    };
  }
}

// 保存当前工作流状态的便捷方法
export async function saveCurrentWorkflow(
  workflowId: string | null,
  workflowName: string,
  nodes: any[],
  edges: any[],
  createUser?: string
): Promise<ApiResponse<WorkflowConfigData>> {
  const workflowData = {
    name: workflowName,
    version: '1.0.0',
    isActive: true,
    nodesInfo: nodes,
    relation: edges,
    createUser: createUser || 'default_user'
  };

  if (workflowId) {
    // 更新现有工作流
    return updateWorkflowConfig(workflowId, {
      nodesInfo: nodes,
      relation: edges
    });
  } else {
    // 创建新工作流
    return createWorkflowConfig(workflowData);
  }
}