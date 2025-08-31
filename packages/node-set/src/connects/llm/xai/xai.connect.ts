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
    id: 'xai',
    name: 'Grok',
    type: 'llm',
    provider: 'xai',
    icon: 'grok.svg' as Icon,
    description: 'xAI Grok AI模型连接',
    version: '1.0.0',
    api: {url:'https://api.x.ai/v1',suffix:'/chat/completions'},
    driver: 'openai',
    about: {
        apiHost: 'https://api.x.ai',
        docUrl: 'https://docs.x.ai/',
        modelUrl: 'https://docs.x.ai/docs/models',
        getKeyUrl: 'https://console.x.ai/'
    }
};
/**
 * xAI Grok LLM 连接定义
 */
export class XAIConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'grok-3-beta', name: 'grok-3-beta',group: 'Grok'},
            {id: 'grok-3-mini-beta', name: 'grok-3-mini-beta',group: 'Grok'},
            {id: 'grok-2', name: 'grok-2',group: 'Grok'},
            {id: 'grok-beta', name: 'grok-beta',group: 'Grok'}
        ],
        fields: [
            createApiKeyField(),
            createBaseUrlField(this.overview.api.url || '')
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
            return await LLMTester.testConnection('xai', {
                apiKey: config.apiKey,
                baseUrl: config.baseUrl || 'https://api.x.ai/v1',
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