import { Icon } from '@repo/common';
import { ConnectTestResult, ILLMOverview } from '@repo/common';
import { LLMTester } from '../../../utils/llm-tester';
import {
    createApiKeyField,
    createBaseUrlField,
    testLLMConnection
} from '../../../utils/llm-fields';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
/**
 * Ollama 本地LLM连接定义
 */
const ConnectConfig: ILLMOverview = {
    id: 'ollama',
    name: 'Ollama',
    type: 'llm',
    provider: 'ollama',
    icon: 'ollama.svg' as Icon,
    description: 'Ollama本地大语言模型连接',
    version: '1.0.0',
    api: { url: 'http://localhost:11434', suffix: '/v1/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'http://localhost:11434',
        docUrl: 'https://github.com/ollama/ollama/tree/main/docs',
        //modelUrl: 'https://ollama.com/library',
    }
};
export class OllamaConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [],
        fields: [
            createApiKeyField(),
            createBaseUrlField(this.overview.api.url),
        ],

        validateConnection: true,
        connectionTimeout: 1000
    };

    /**
     * 测试Ollama连接
     */
    async test(config: Record<string, any>, message?: string): Promise<ConnectTestResult> {
        try {
            // 确定实际使用的模型名
            const modelName = config.model === 'custom' ? config.customModel : config.model;

            if (!modelName) {
                return {
                    success: false,
                    message: '请选择或输入模型名称'
                };
            }

            // 使用统一测试器
            const testConfig = {
                apiKey: config.apiKey || '', // Ollama通常不需要API密钥
                baseUrl: config.baseUrl || 'http://localhost:11434',
                model: modelName,
                timeout: config.timeout ? config.timeout * 1000 : 60000,
                headers: {},
                // Ollama特定参数
                temperature: config.temperature,
                topP: config.topP,
                maxTokens: config.maxTokens,
                repeatPenalty: config.repeatPenalty,
                systemPrompt: config.systemPrompt
            };

            return await LLMTester.testConnection('ollama', testConfig, message);
        } catch (error) {
            return {
                success: false,
                message: `Ollama连接测试失败: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
}