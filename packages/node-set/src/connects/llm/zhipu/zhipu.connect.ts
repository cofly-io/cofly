import { Icon } from '@repo/common';
import { ConnectTestResult, ILLMOverview } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { LLMTester } from '../../../utils/llm-tester';
import {
    createApiKeyField,
    createBaseUrlField,
    testLLMConnection
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'zhipu',
    name: '智谱ChatGLM',
    type: 'llm',
    provider: 'custom',
    icon: 'zhipu.svg' as Icon,
    description: '智谱ChatGLM AI模型连接',
    version: '1.0.0',
    api: {url:'https://open.bigmodel.cn/api/paas/v4/',suffix:'/chat/completions'},
    driver: 'openai',
    about: {
        apiHost: 'https://open.bigmodel.cn/api/paas/v4/',
        docUrl: 'https://open.bigmodel.cn/dev/howuse/introduction',
        modelUrl: 'https://open.bigmodel.cn/modelcenter/square',
        getKeyUrl: 'https://open.bigmodel.cn/usercenter/apikeys'
    }
};
/**
 * 智谱ChatGLM LLM 连接定义
 */
export class ZhipuConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'glm-4-plus', name: 'glm-4-plus',group: 'GLM'},
            {id: 'glm-4-8k', name: 'glm-4-8k',group: 'GLM'},
            {id: 'glm-4-32k', name: 'glm-4-32k',group: 'GLM'},
            {id: 'glm-4-32k-instruct', name: 'glm-4-32k-instruct',group: 'GLM'},
            {id: 'glm-4-32k-instruct-32k', name: 'glm-4-32k-instruct-32k',group: 'GLM'}
        ],
        fields: [
            createApiKeyField(),
            createBaseUrlField(this.overview.api.url),

        ],
        validateConnection: true,
        connectionTimeout: 10
    };

    async test(config: Record<string, any>, message?: string): Promise<ConnectTestResult> {
        try {
            // 验证必填字段
            if (!config.apiKey) {
                return {
                    success: false,
                    message: '缺少必填字段: apiKey'
                };
            }

            if (!config.model) {
                return {
                    success: false,
                    message: '缺少必填字段: model'
                };
            }

            // 使用通用测试器
            return await LLMTester.testConnection('zhipu', {
                apiKey: config.apiKey,
                baseUrl: config.baseUrl || 'https://open.bigmodel.cn/api/paas/v4',
                model: config.model,
                timeout: (config.timeout || 30) * 1000
            }, message);

        } catch (error) {
            return {
                success: false,
                message: `连接失败: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
}