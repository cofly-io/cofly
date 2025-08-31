import { Icon } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { ConnectTestResult, ILLMOverview } from '@repo/common';
import { LLMTester } from '../../../utils/llm-tester';
import {
    createApiKeyField,
    createBaseUrlField,
    testLLMConnection
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'together',
    name: 'Together AI',
    type: 'llm',
    provider: 'together',
    icon: 'together.svg' as Icon,
    description: 'Together AI模型连接',
    version: '1.0.0',
    api: { url: 'https://api.together.xyz/v1', suffix: '/chat/completions' },
    driver: "openai",
    about: {
        apiHost: 'https://api.together.xyz',
        docUrl: 'https://docs.together.ai/docs/introduction',
        modelUrl: 'https://docs.together.ai/docs/chat-models',
        getKeyUrl: 'https://api.together.xyz/'
    }
};
/**
 * Together AI LLM 连接定义
 */
export class TogetherConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            { id: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', name: 'Meta-Llama-3.1-405B-Instruct-Turbo', group: 'Meta' },
            { id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo', name: 'Meta-Llama-3.1-70B-Instruct-Turbo', group: 'Meta' },
            { id: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo', name: 'Meta-Llama-3.1-8B-Instruct-Turbo', group: 'Meta' },
            { id: 'meta-llama/Meta-Llama-3-70B-Instruct-Turbo', name: 'Meta-Llama-3-70B-Instruct-Turbo', group: 'Meta' },
            { id: 'meta-llama/Meta-Llama-3-8B-Instruct-Turbo', name: 'Meta-Llama-3-8B-Instruct-Turbo', group: 'Meta' }
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
            return await LLMTester.testConnection('together', {
                apiKey: config.apiKey,
                baseUrl: config.baseUrl || 'https://api.together.xyz/v1',
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