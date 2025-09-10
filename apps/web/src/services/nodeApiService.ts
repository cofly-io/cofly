interface NodeResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

interface NodeListResponse {
  success: boolean;
  dataSource?: any[];
  total?: number;
  error?: string;
}

interface NodeDetailsResponse {
  success: boolean;
  node?: any;
  error?: string;
}

interface NodeExecuteResponse {
  success: boolean;
  result?: any;
  error?: string;
}

/**
 * 节点API服务类 - 通过HTTP API调用
 */
export class NodeApiService {

  /**
   * 获取所有可用节点
   */
  static async fetchAllNodes(): Promise<NodeListResponse> {
    try {
      const response = await fetch('/api/nodes');
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          dataSource: [],
          total: 0,
          error: result.error || '获取节点失败'
        };
      }

      return {
        success: true,
        dataSource: result.dataSource || [],
        total: result.dataSource?.length || 0
      };

    } catch (error) {
      console.error('❌ 获取节点失败:', error);
      return {
        success: false,
        dataSource: [],
        total: 0,
        error: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 获取特定节点的详细信息
   */
  static async fetchNodeDetails(kind: string): Promise<NodeDetailsResponse> {
    try {
      const response = await fetch(`/api/nodes/${kind}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || '获取节点详情失败'
        };
      }

      return {
        success: true,
        node: result.node // API 返回的是 { node: node.detail }
      };

    } catch (error) {
      console.error('❌ 获取节点详情失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 执行节点
   */
  static async executeNode(nodeName: string, params: any): Promise<NodeExecuteResponse> {
    try {
      const response = await fetch('/api/nodes/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodeName, params }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || '执行节点失败'
        };
      }

      return {
        success: true,
        result: result.result
      };

    } catch (error) {
      console.error('❌ 执行节点失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络错误'
      };
    }
  }
}

// 为了保持向后兼容性，导出实例
export const nodeApiService = NodeApiService;
