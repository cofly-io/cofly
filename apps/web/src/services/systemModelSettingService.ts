// 系统模型设置数据接口
export interface SystemModelSettingData {
  tabkey: string;
  tabDetails: any;
  createdAt?: Date;
  updatedAt?: Date;
}

// 获取系统模型设置请求参数
export interface GetSystemModelSettingRequest {
  tabkey: string;
}

// 保存/更新系统模型设置请求参数
export interface SaveSystemModelSettingRequest {
  tabkey: string;
  tabDetails: any;
}

// 系统模型设置响应接口
export interface SystemModelSettingResponse {
  success: boolean;
  data?: SystemModelSettingData;
  error?: string;
  message?: string;
}

// 删除系统模型设置响应接口
export interface DeleteSystemModelSettingResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * 系统模型设置服务类
 * 用于管理系统模型设置的CRUD操作
 */
export class SystemModelSettingService {
  
  /**
   * 获取系统模型设置
   */
  static async getSystemModelSetting(tabkey: string): Promise<SystemModelSettingResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('tabkey', tabkey);
      
      const url = `/api/system-settings?${searchParams.toString()}`;
      const response = await fetch(url);
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || '获取系统设置失败'
        };
      }
      
      return {
        success: true,
        data: result
      };
      
    } catch (error) {
      console.error('获取系统设置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络错误'
      };
    }
  }
  
  /**
   * 保存系统模型设置（创建或更新）
   */
  static async saveSystemModelSetting(request: SaveSystemModelSettingRequest): Promise<SystemModelSettingResponse> {
    try {
      const response = await fetch('/api/system-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || '保存系统模型设置失败'
        };
      }
      
      return {
        success: true,
        data: result,
        message: '系统模型设置保存成功'
      };
      
    } catch (error) {
      console.error('保存系统模型设置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络错误'
      };
    }
  }
  
  /**
   * 更新系统模型设置
   */
  static async updateSystemModelSetting(request: SaveSystemModelSettingRequest): Promise<SystemModelSettingResponse> {
    try {
      const response = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || '更新系统设置失败'
        };
      }
      
      return {
        success: true,
        data: result,
        message: '系统设置更新成功'
      };
      
    } catch (error) {
      console.error('更新系统模型设置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络错误'
      };
    }
  }
  
  /**
   * 删除系统模型设置
   */
  static async deleteSystemModelSetting(tabkey: string): Promise<DeleteSystemModelSettingResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append('tabkey', tabkey);
      
      const url = `/api/system-settings?${searchParams.toString()}`;
      const response = await fetch(url, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || '删除系统模型设置失败'
        };
      }
      
      return {
        success: true,
        message: result.message || '系统模型设置删除成功'
      };
      
    } catch (error) {
      console.error('删除系统模型设置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络错误'
      };
    }
  }
}