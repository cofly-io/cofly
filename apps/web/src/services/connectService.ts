interface ConnectResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

interface ConnectListResponse {
  success: boolean;
  data: ConnectBasicInfo[];
  total: number;
  filters: {
    type: string | null;
    provider: string | null;
  };
  statistics: {
    total: number;
    byType: Record<string, number>;
    byProvider: Record<string, number>;
  };
  error?: string;
}

interface ConnectDetailResponse {
  success: boolean;
  data: ConnectDetailInfo;
  error?: string;
  message?: string;
}

/**
 * 连接基本信息（列表中显示的）
 */
export interface ConnectBasicInfo {
  id: string;
  name: string;
  type: 'db' | 'nosql-db' | 'http' | 'llm';
  provider: string;
  icon: string;
  description: string;
  version: string;
  tags?: string[]; // 仅LLM类型有此字段
  validateConnection: boolean;
  connectionTimeout?: number;
}

/**
 * 连接详细信息（包含字段配置）
 */
export interface ConnectDetailInfo extends ConnectBasicInfo {
  fields: ConnectField[];
  // 数据库特有信息
  defaultPort?: number;
  supportedFeatures?: string[];
  // HTTP 特有信息
  supportedMethods?: string[];
  contentTypes?: string[];
  rateLimits?: {
    requests: number;
    window: number;
  };
  // LLM 特有信息
  supportedModels?: LLMModel[];
  modelTypes?: string[];
  maxContextLength?: number;
  // 连接器的about信息（包含modelUrl等）
  about?: {
    apiHost?: string;
    docUrl?: string;
    modelUrl?: string;
    getKeyUrl?: string;
  };
}

/**
 * 连接字段配置
 */
export interface ConnectField {
  displayName: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
  hint?: string;
  placeholder?: string;
  default: any;
  options?: Array<{ name: string; value: any }>;
  displayOptions?: any;
  typeOptions?: any;
  isSecure: boolean;
  testConnection: boolean;
}

/**
 * LLM 模型信息
 */
export interface LLMModel {
  id: string;
  name: string;
  type: string;
  contextLength: number;
  pricing?: {
    input: number;
    output: number;
  };
}

/**
 * 连接服务类
 */
export class ConnectService {
  private static baseUrl = '/api/connect';

  /**
   * 获取连接列表
   */
  static async getConnectList(params?: {
    type?: string;
    provider?: string;
  }): Promise<ConnectListResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.type) searchParams.append('type', params.type);
      if (params?.provider) searchParams.append('provider', params.provider);

      const url = `${this.baseUrl}/list${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '获取连接列表失败');
      }

      return result;
    } catch (error) {
      console.error('Error fetching connect list:', error);
      throw error;
    }
  }

  /**
   * 获取连接详情
   */
  static async getConnectDetail(id: string): Promise<ConnectDetailResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '获取连接详情失败');
      }

      return result;
    } catch (error) {
      console.error('Error fetching connect detail:', error);
      throw error;
    }
  }

  /**
   * 测试连接
   */
  static async testConnection(connectId: string, config: Record<string, any>, message?: string): Promise<ConnectResponse> {
    try {
      const requestBody: any = {
        connectId,
        config,
      };

      // 如果有消息（LLM对话测试），则包含在请求中
      if (message !== undefined) {
        requestBody.message = message;
      }

      const response = await fetch(`${this.baseUrl}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '连接测试失败');
      }

      return result;
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  }

  /**
   * 获取连接分类
   */
  static async getConnectCategories(): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      name: string;
      description: string;
      type: string;
    }>;
    total: number;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/categories`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '获取连接分类失败');
      }

      return result;
    } catch (error) {
      console.error('Error fetching connect categories:', error);
      throw error;
    }
  }

  /**
   * 保存连接配置
   */
  static async saveConnectConfig(data: {
    connectId: string;
    name: string;
    mtype?: string; // 连接模型类型
    config: Record<string, any>;
    creator?: string;
  }): Promise<ConnectResponse> {
    console.log('🌐 ConnectService.saveConnectConfig 开始');
    console.log('📤 准备发送的数据:', data);

    try {
      console.log('🔗 发送 POST 请求到:', `${this.baseUrl}/config`);

      const response = await fetch(`${this.baseUrl}/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📡 收到响应:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const result = await response.json();
      console.log('📥 响应数据:', result);

      if (!response.ok) {
        console.error('❌ 响应不成功:', result.message || '保存连接配置失败');
        throw new Error(result.message || '保存连接配置失败');
      }

      console.log('✅ 保存成功');
      return result;
    } catch (error) {
      console.error('❌ ConnectService 错误:', error);
      console.error('🔍 错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * 获取连接配置列表
   */
  static async getConnectConfigs(params?: {
    ctype?: string;
    creator?: string;
  }): Promise<{
    success: boolean;
    data: any[];
    total: number;
    error?: string;
  }> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.ctype) searchParams.append('ctype', params.ctype);
      if (params?.creator) searchParams.append('creator', params.creator);

      const url = `${this.baseUrl}/config${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '获取连接配置列表失败');
      }

      return result;
    } catch (error) {
      console.error('Error fetching connect configs:', error);
      throw error;
    }
  }

  /**
   * 根据连接配置ID获取连接器信息（用于模型获取）
   */
  static async getConnectInfoForModels(datasourceId: string): Promise<{
    success: boolean;
    data?: {
      ctype: string;
      modelUrl?: string;
      supportedModels?: Array<{
        id: string;
        name: string;
        group?: string;
        description?: string;
      }>;
      apiKey?: string;
      baseUrl?: string;
    };
    error?: string;
  }> {
    try {
      // 1. 先获取连接配置实例（通过datasourceId）
      const configResult = await this.getConnectConfigById(datasourceId);
      if (!configResult.success || !configResult.data) {
        return {
          success: false,
          error: '获取连接配置失败'
        };
      }

      const connectConfig = configResult.data;
      console.log('📋 [ConnectService] 获取到连接配置:', {
        id: connectConfig.id,
        ctype: connectConfig.ctype,
        name: connectConfig.name
      });

      // 2. 用ctype获取连接器定义详情（从connect-set）
      const connectDetail = await this.getConnectDetail(connectConfig.ctype);
      if (!connectDetail.success) {
        return {
          success: false,
          error: `获取连接器详情失败: ${connectDetail.data || '未知错误'}`
        };
      }

      console.log('📋 [ConnectService] 获取到连接器详情:', {
        id: connectDetail.data.id,
        name: connectDetail.data.name,
        hasSupportedModels: !!connectDetail.data.supportedModels,
        supportedModelsCount: connectDetail.data.supportedModels?.length || 0
      });

      // 3. 构建返回数据
      const connectInfo: {
        ctype: string;
        modelUrl?: string;
        supportedModels?: Array<{
          id: string;
          name: string;
          group?: string;
          description?: string;
        }>;
        apiKey?: string;
        baseUrl?: string;
      } = {
        ctype: connectConfig.ctype,
        apiKey: connectConfig.config?.apiKey,
        baseUrl: connectConfig.config?.baseUrl,
        supportedModels: connectDetail.data.supportedModels?.map((model: any) => ({
          id: model.id,
          name: model.name,
          group: model.group,
          description: model.description
        }))
      };

      // 4. 从连接器的about信息中获取modelUrl
      if (connectDetail.data.about?.modelUrl) {
        connectInfo.modelUrl = connectDetail.data.about.modelUrl;
      }

      console.log('✅ [ConnectService] 构建连接器信息完成:', {
        ctype: connectInfo.ctype,
        hasModelUrl: !!connectInfo.modelUrl,
        modelUrl: connectInfo.modelUrl,
        supportedModelsCount: connectInfo.supportedModels?.length || 0,
        hasApiKey: !!connectInfo.apiKey
      });

      return {
        success: true,
        data: connectInfo
      };

    } catch (error) {
      console.error('❌ [ConnectService] 获取连接器信息失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取连接器信息失败'
      };
    }
  }

  /**
   * 根据ID获取单个连接配置
   */
  private static async getConnectConfigById(id: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/config/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '获取连接配置失败');
      }

      return result;
    } catch (error) {
      console.error('Error fetching connect config by id:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取连接配置失败'
      };
    }
  }
} 