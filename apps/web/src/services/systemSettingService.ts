// 设置API服务 - Web层

import { SystemSettingsService, UserSettings, ApiResponse } from '@repo/ui';

class SettingsApiService implements SystemSettingsService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // 获取用户设置
  async getSystemSettings(userId: string): Promise<ApiResponse<UserSettings>> {
    const url = `${this.baseUrl}/users/${userId}/settings`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 这里应该添加认证头
          // 'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // 用户不存在，可能需要重新登录
          return {
            success: false,
            error: 'USER_NOT_FOUND',
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 更新用户设置
  async updateSystemSettings(userId: string, settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    try {
      // 验证设置对象不为空
      if (!settings || Object.keys(settings).length === 0) {
        return {
          success: false,
          error: 'Settings object cannot be empty',
        };
      }

      const response = await fetch(`${this.baseUrl}/users/${userId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        if (response.status === 404) {
          // 用户不存在，可能需要重新登录
          return {
            success: false,
            error: 'USER_NOT_FOUND',
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        message: 'Settings updated successfully',
      };
    } catch (error) {
      console.error('Failed to update user settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 重置用户设置
  async resetSystemSettings(userId: string): Promise<ApiResponse<UserSettings>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/settings/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        message: 'Settings reset successfully',
      };
    } catch (error) {
      console.error('Failed to reset user settings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 测试API连接
  async testApiConnection(type: 'cofly' | 'openai' | 'custom', config: any): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await fetch(`${this.baseUrl}/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, config }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Failed to test API connection:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // 获取MCP工具列表
  async getMcpTools(): Promise<ApiResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/mcp/tools`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Failed to fetch MCP tools:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 导出用户数据
  async exportUserData(userId: string): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/export`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Failed to export user data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 导入用户数据
  async importUserData(userId: string, data: any): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        message: 'Data imported successfully',
      };
    } catch (error) {
      console.error('Failed to import user data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// 创建单例实例
export const settingsApi = new SettingsApiService();