import { 
  AgentData, 
  SaveAgentRequest, 
  AgentResponse, 
  AgentListResponse 
} from '@repo/common';

/**
 * 智能体服务类 - 通过HTTP API调用
 */
export class AgentService {

  /**
   * 保存智能体配置
   */
  static async saveAgent(request: SaveAgentRequest): Promise<AgentResponse> {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || '保存智能体失败'
        };
      }

      return result;

    } catch (error) {
      console.error('❌ 保存智能体失败:', error);
      return {
        success: false,
        error: '保存智能体失败',
        message: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 获取智能体列表
   */
  static async getAgents(filter?: {
    createUser?: string;
  }): Promise<AgentListResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (filter?.createUser) {
        searchParams.append('createUser', filter.createUser);
      }

      const url = `/api/agents${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      const response = await fetch(url);

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          data: [],
          total: 0,
          error: result.error || '获取智能体列表失败'
        };
      }

      return result;

    } catch (error) {
      console.error('获取智能体列表失败:', error);
      return {
        success: false,
        data: [],
        total: 0,
        error: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 获取单个智能体
   */
  static async getAgent(id: string): Promise<AgentResponse> {
    try {
      const response = await fetch(`/api/agents/${id}`);
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || '获取智能体失败'
        };
      }

      return result;

    } catch (error) {
      console.error('获取智能体失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 更新智能体
   */
  static async updateAgent(id: string, request: Partial<SaveAgentRequest>): Promise<AgentResponse> {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || '更新智能体失败',
          message: result.message
        };
      }

      return result;

    } catch (error) {
      console.error('更新智能体失败:', error);
      return {
        success: false,
        error: '更新智能体失败',
        message: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 删除智能体
   */
  static async deleteAgent(id: string): Promise<AgentResponse> {
    try {
      const response = await fetch(`/api/agents/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || '删除智能体失败',
          message: result.message
        };
      }

      return result;

    } catch (error) {
      console.error('删除智能体失败:', error);
      return {
        success: false,
        error: '删除智能体失败',
        message: error instanceof Error ? error.message : '网络错误'
      };
    }
  }
}