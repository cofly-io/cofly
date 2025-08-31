import { Icon } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { ConnectTestResult, ILLMOverview } from '@repo/common';
import { LLMTester } from '../../../utils/llm-tester';
import { 
    createApiKeyField, 
    createBaseUrlField, 
    testLLMConnection
} from '../../../utils/llm-fields';

/**
 * GitHub Models LLM 连接定义
 */
const ConnectConfig: ILLMOverview = {
    id: 'github',
    name: 'GitHub Models',
    type: 'llm',
    provider: 'custom',
    icon: 'github.svg' as Icon,
    description: 'GitHub Models AI服务连接',
    version: '1.0.0',
    api: { url: 'https://models.inference.ai.azure.com', suffix: '/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'https://models.inference.ai.azure.com/',
        docUrl: 'https://docs.github.com/en/github-models',
        modelUrl: 'https://github.com/marketplace/models',
        getKeyUrl: 'https://github.com/settings/tokens'
    }
};
export class GitHubConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'gpt-4o', name: 'gpt-4o',group: 'OpenAI'},
            {id: 'gpt-4o-mini', name: 'gpt-4o-mini',group: 'OpenAI'},
            {id: 'gpt-3.5-turbo', name: 'gpt-3.5-turbo',group: 'OpenAI'},
            {id: 'gpt-3.5-turbo-0301', name: 'gpt-3.5-turbo-0301',group: 'OpenAI'}
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
            return await LLMTester.testConnection('github', {
                apiKey: config.apiKey,
                baseUrl: config.baseUrl || 'https://models.inference.ai.azure.com',
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