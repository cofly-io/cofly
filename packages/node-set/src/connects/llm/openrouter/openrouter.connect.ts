import { Icon, ILLMMetadataOptions, ILLMMetadataResult } from '@repo/common';
import { ConnectTestResult, ILLMOverview } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import {
    createApiKeyField,
    createBaseUrlField,
    testLLMConnection
} from '../../../utils/llm-fields';
import {
    getLLMModels,
    extractOpenRouterGroup
} from '../../../utils/llm-models';

const ConnectConfig: ILLMOverview = {
    id: 'openrouter',
    name: 'OpenRouter',
    type: 'llm',
    provider: 'custom',
    icon: 'OpenRouter.svg' as Icon,
    description: 'OpenRouter AI模型路由服务连接',
    version: '1.0.0',
    api: { url: 'https://openrouter.ai/api/v1', suffix: '/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'https://openrouter.ai/api/v1/',
        docUrl: 'https://openrouter.ai/docs/quick-start',
        modelUrl: 'https://openrouter.ai/models',
        getKeyUrl: 'https://openrouter.ai/keys'
    }
};

/**
 * OpenRouter LLM 连接器类
 */
export class OpenRouterConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;

    override detail = {
        supportedModels: [
            { id: 'openai/gpt-4o', name: 'openai/gpt-4o', group: 'OpenAI' },
            { id: 'openai/gpt-4o-mini', name: 'openai/gpt-4o-mini', group: 'OpenAI' },
            { id: 'openai/gpt-4-turbo', name: 'openai/gpt-4-turbo', group: 'OpenAI' },
            { id: 'anthropic/claude-3.5-sonnet', name: 'anthropic/claude-3.5-sonnet', group: 'Anthropic' },
            { id: 'anthropic/claude-3.5-haiku', name: 'anthropic/claude-3.5-haiku', group: 'Anthropic' },
            { id: 'anthropic/claude-3-opus', name: 'anthropic/claude-3-opus', group: 'Anthropic' },
            { id: 'meta-llama/llama-3.1-405b-instruct', name: 'meta-llama/llama-3.1-405b-instruct', group: 'Meta' },
            { id: 'meta-llama/llama-3.1-70b-instruct', name: 'meta-llama/llama-3.1-70b-instruct', group: 'Meta' },
            { id: 'meta-llama/llama-3.1-8b-instruct', name: 'meta-llama/llama-3.1-8b-instruct', group: 'Meta' },
            { id: 'deepseek/deepseek-r1', name: 'deepseek/deepseek-r1', group: 'DeepSeek' },
            { id: 'deepseek/deepseek-r1-0528:free', name: 'deepseek/deepseek-r1-0528:free', group: 'DeepSeek' },
            { id: 'deepseek/deepseek-chat', name: 'deepseek/deepseek-chat', group: 'DeepSeek' },
            { id: 'google/gemini-pro-1.5', name: 'google/gemini-pro-1.5', group: 'Google' },
            { id: 'google/gemini-flash-1.5', name: 'google/gemini-flash-1.5', group: 'Google' },
            { id: 'mistralai/mistral-large', name: 'mistralai/mistral-large', group: 'Mistral AI' },
            { id: 'mistralai/mistral-medium', name: 'mistralai/mistral-medium', group: 'Mistral AI' }
        ],
        fields: [
            createApiKeyField(),
            createBaseUrlField(this.overview.api.url)
        ],
        validateConnection: true,
        connectionTimeout: 10
    };

    async test(config: Record<string, any>, message?: string): Promise<ConnectTestResult> {
        return testLLMConnection(
            this.overview.id,
            config,
            this.overview.api.url + this.overview.api.suffix || '',
            message
        );
    }

    async metadata(opts: ILLMMetadataOptions): Promise<ILLMMetadataResult> {
        try {
            return await this.getModels(opts.connectInfo, opts.search);
        } catch (error: any) {
            console.error('❌ [OpenRouter Connect] metadata 执行错误:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 获取LLM模型列表
     */
    private async getModels(connectInfo?: any, search?: string): Promise<ILLMMetadataResult> {
        return getLLMModels(
            connectInfo,
            search,
            'OpenRouter',
            this.overview.api.url,
            this.detail.supportedModels,
            {
                extractGroup: extractOpenRouterGroup,
                buildApiUrl: (baseUrl: string) => `${baseUrl.replace(/\/$/, '')}/models`,
                parseResponse: (data: any) => {
                    // OpenRouter API 返回格式：{ "data": [...] }
                    const models = data.data || data || [];

                    // 🔧 在 parseResponse 中直接处理模型转换
                    return models.map((model: any) => {
                        // console.log('🔍 [OpenRouter] parseResponse 处理模型:', {
                        //     originalId: model.id,
                        //     originalName: model.name
                        // });

                        return {
                            id: model.id, // 使用实际的模型ID，如 "deepseek/deepseek-r1-0528:free"
                            name: model.id, // 🔧 使用模型ID作为显示名称
                            description: model.description,
                            contextLength: model.context_length,
                            pricing: model.pricing
                        };
                    });
                }
            }
        );
    }
}