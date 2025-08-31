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
    id: 'perplexity',
    name: 'Perplexity',
    type: 'llm',
    provider: 'custom',
    icon: 'perplexity.svg' as Icon,
    description: 'Perplexity AI搜索增强模型连接',
    version: '1.0.0',
    api: { url: 'https://www.perplexity.ai/settings/api', suffix: '/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'https://api.perplexity.ai',
        docUrl: 'https://docs.perplexity.ai/home',
        modelUrl: 'https://docs.perplexity.ai/guides/model-cards',
        getKeyUrl: 'https://www.perplexity.ai/settings/api'
    }
}
/**
 * Perplexity LLM 连接定义
 */
export class PerplexityConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            { id: 'sonar-reasoning-pro', name: 'sonar-reasoning-pro', group: 'Sonar' },
            { id: 'sonar-reasoning', name: 'sonar-reasoning', group: 'Sonar' },
            { id: 'sonar-pro', name: 'sonar-pro', group: 'Sonar' },
            { id: 'sonar', name: 'sonar', group: 'Sonar' }
        ],
        fields: [
            createApiKeyField('pplx-...'),
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
            return await LLMTester.testConnection('perplexity', {
                apiKey: config.apiKey,
                baseUrl: config.baseUrl || 'https://api.perplexity.ai',
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