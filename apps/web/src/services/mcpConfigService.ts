interface McpConfigData {
  name: string;
  type: string;
  mcpinfo: string;
}

interface McpConfigResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class McpConfigService {
  private static instance: McpConfigService;

  public static getInstance(): McpConfigService {
    if (!McpConfigService.instance) {
      McpConfigService.instance = new McpConfigService();
    }
    return McpConfigService.instance;
  }

  /**
   * 保存 MCP 配置
   */
  async saveMcpConfig(configData: McpConfigData): Promise<McpConfigResponse> {
    try {
      const response = await fetch('/api/mcp-configs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData)
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error saving MCP config:', error);
      return {
        success: false,
        error: 'Network error occurred while saving MCP config'
      };
    }
  }

  /**
   * 获取 MCP 配置列表
   */
  async getMcpConfigs(): Promise<McpConfigResponse> {
    try {
      const response = await fetch('/api/mcp-configs');
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching MCP configs:', error);
      return {
        success: false,
        error: 'Network error occurred while fetching MCP configs'
      };
    }
  }

  /**
   * 删除 MCP 配置
   */
  async deleteMcpConfig(id: string): Promise<McpConfigResponse> {
    try {
      const response = await fetch(`/api/mcp-configs/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting MCP config:', error);
      return {
        success: false,
        error: 'Network error occurred while deleting MCP config'
      };
    }
  }

  /**
   * 更新 MCP 配置
   */
  async updateMcpConfig(id: string, configData: McpConfigData): Promise<McpConfigResponse> {
    try {
      const response = await fetch(`/api/mcp-configs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData)
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating MCP config:', error);
      return {
        success: false,
        error: 'Network error occurred while updating MCP config'
      };
    }
  }
}

export const mcpConfigService = McpConfigService.getInstance();

export default mcpConfigService;