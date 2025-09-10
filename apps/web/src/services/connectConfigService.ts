import { IConnectConfig  } from '@repo/common';

/**
 * 保存连接配置的请求数据
 */
export interface SaveConnectConfigRequest {
  connectId: string;
  name: string;
  mType?: string; // 连接模型类型
  config: Record<string, any>;
  creator?: string;
}

/**
 * 连接配置响应数据
 */
export interface ConnectConfigResponse {
  success: boolean;
  data?: IConnectConfig;
  error?: string;
  message?: string;
}

/**
 * 连接配置列表响应数据
 */
export interface ConnectConfigListResponse {
  success: boolean;
  data: IConnectConfig[];
  total: number;
  error?: string;
}

/**
 * 连接配置服务类 - 通过HTTP API调用
 */
export class ConnectConfigService {
  
  /**
   * 保存连接配置
   */
  static async saveConnectConfig(request: SaveConnectConfigRequest): Promise<ConnectConfigResponse> {
    try {
      const response = await fetch('/api/connect-configs', {
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
          error: result.error || '保存连接配置失败'
        };
      }

      return result;

    } catch (error) {
      console.error('❌ 保存连接配置失败:', error);
      return {
        success: false,
        error: '保存连接配置失败',
        message: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 获取连接配置列表
   */
  static async getConnectConfigs(filter?: {
    cType?: string;
    mType?: string;
    creator?: string;
  }): Promise<ConnectConfigListResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (filter?.cType) {
        searchParams.append('cType', filter.cType);
      }
      if (filter?.mType) {
        searchParams.append('mType', filter.mType);
      }
      // if (filter?.creator) {
      //   searchParams.append('creator', filter.creator);
      // }

      const url = `/api/connect-configs${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
      const response = await fetch(url);

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          data: [],
          total: 0,
          error: result.error || '获取连接配置列表失败'
        };
      }

      return result;

    } catch (error) {
      console.error('获取连接配置列表失败:', error);
      return {
        success: false,
        data: [],
        total: 0,
        error: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 获取单个连接配置
   */
  static async getConnectConfig(id: string): Promise<ConnectConfigResponse> {
    try {
      const response = await fetch(`/api/connect-configs/${id}`);
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || '获取连接配置失败'
        };
      }
      return result;
    } catch (error) {
      console.error('获取连接配置失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 更新连接配置
   */
  static async updateConnectConfig(id: string, request: Partial<SaveConnectConfigRequest>): Promise<ConnectConfigResponse> {
    try {
      const response = await fetch(`/api/connect-configs/${id}`, {
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
          error: result.error || '更新连接配置失败',
          message: result.message
        };
      }

      return result;

    } catch (error) {
      console.error('更新连接配置失败:', error);
      return {
        success: false,
        error: '更新连接配置失败',
        message: error instanceof Error ? error.message : '网络错误'
      };
    }
  }

  /**
   * 删除连接配置
   */
  static async deleteConnectConfig(id: string): Promise<ConnectConfigResponse> {
    try {
      const response = await fetch(`/api/connect-configs/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || '删除连接配置失败',
          message: result.message
        };
      }

      return result;

    } catch (error) {
      console.error('删除连接配置失败:', error);
      return {
        success: false,
        error: '删除连接配置失败',
        message: error instanceof Error ? error.message : '网络错误'
      };
    }
  }
} 