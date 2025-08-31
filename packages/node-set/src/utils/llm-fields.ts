import { ConnectTestResult, IConnectField } from '@repo/common'; // 假设这是字段类型
import { EconomicalLLMTester, TestLevel } from './llm-tester-economical';

/**
 * 创建API Key字段配置
 */
export const createApiKeyField = (placeholder = ''): IConnectField => ({
  displayName: 'API Key',
  name: 'apiKey',
  type: 'string',
  default: '',
  description: 'API密钥',
  placeholder,
  typeOptions: { password: true },
  isSecure: true,
  required: true,
  controlType: 'input'
});

/**
 * 创建Secret Key字段配置（百度千帆专用）
 */
export const createSecretKeyField = (placeholder = ''): IConnectField => ({
  displayName: 'Secret Key',
  name: 'secretKey',
  type: 'string',
  default: '',
  description: 'Secret Key密钥',
  placeholder,
  typeOptions: { password: true },
  isSecure: true,
  required: true,
  controlType: 'input'
});

/**
 * 创建Group ID字段配置（MiniMax专用）
 */
export const createGroupIdField = (placeholder = ''): IConnectField => ({
  displayName: 'Group ID',
  name: 'groupId',
  type: 'string',
  default: '',
  description: 'Group ID',
  placeholder,
  required: true,
  controlType: 'input'
});

/**
 * 创建基础URL字段配置
 * @param defaultUrl - 默认URL
 */
export const createBaseUrlField = (defaultUrl: string): IConnectField => ({
  displayName: '基础URL',
  name: 'baseUrl',
  type: 'string',
  default: defaultUrl,
  description: 'API基础URL',
  placeholder: defaultUrl,
  controlType: 'input'
});

/**
 * 创建模型选择字段配置（经济模式下不再必需）
 * @param models - 模型选项数组
 * @param placeholder - 占位文本
 */
// export const createModelField = (
//   models: string[],
//   placeholder = '请选择模型或输入模型'
// ): IConnectField => ({
//   displayName: '模型',
//   name: 'model',
//   type: 'options',
//   placeholder,
//   default: '',
//   description: '选择要使用的模型（可选，用于经济测试）',
//   options: models.map(value => ({ value })),
//   required: false, // 经济模式下不再必需
//   controlType: 'InputSelect'
// });

/**
 * 通用连接测试逻辑（默认使用经济模式）
 */
export const testLLMConnection = async (
  providerId: string,
  config: Record<string, any>,
  defaultBaseUrl: string,
  message?: string
): Promise<ConnectTestResult> => {
  try {
    if (!config.apiKey) return { success: false, message: '缺少必填字段: apiKey' };

    // 百度千帆需要额外验证 secretKey
    if (providerId === 'baidu' && !config.secretKey) {
      return { success: false, message: '缺少必填字段: secretKey' };
    }

    // MiniMax 需要额外验证 groupId
    if (providerId === 'minimax' && !config.groupId) {
      return { success: false, message: '缺少必填字段: groupId' };
    }

    const testConfig: any = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || defaultBaseUrl,
      model: config.model,
      timeout: (config.timeout || 30) * 1000
    };

    // 对于百度千帆，添加 secretKey
    if (providerId === 'baidu' && config.secretKey) {
      testConfig.secretKey = config.secretKey;
    }

    // 对于 MiniMax，添加 groupId
    if (providerId === 'minimax' && config.groupId) {
      testConfig.groupId = config.groupId;
    }

    // 默认使用经济型测试器
    // 优先使用模型列表测试（免费），如果需要模型但没有提供，则使用认证测试
    const testLevel = TestLevel.MODELS;
    testConfig.testLevel = testLevel;
    
    return await EconomicalLLMTester.testConnection(providerId, testConfig);
  } catch (error) {
    return {
      success: false,
      message: `连接失败: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};