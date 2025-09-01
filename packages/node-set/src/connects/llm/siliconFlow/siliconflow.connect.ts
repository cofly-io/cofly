import { Icon, IDatabaseMetadataOptions, IDatabaseMetadataResult } from '@repo/common';
import { ConnectTestResult, ILLMOverview } from '@repo/common';
import {
    createApiKeyField,
    createBaseUrlField,
    testLLMConnection
} from '../../../utils/llm-fields';
import {
    getLLMModels,
    buildSiliconFlowApiUrl,
    isSiliconFlowValidModel,
    transformSiliconFlowModelData
} from '../../../utils/llm-models';
import { OpenAIBasedLLMConnect } from "../../base/OpenAIBasedLLMConnect";

/**
 * 硅基流动 LLM 连接器类
 */
export class SiliconFlowConnect extends OpenAIBasedLLMConnect {
    override overview: ILLMOverview = {
        id: 'siliconflow',
        name: '硅基流动',
        type: 'llm' as const,
        provider: 'siliconflow',
        tags: ['domestic'],
        icon: 'siliconflow.svg' as Icon,
        description: '硅基流动AI大模型连接',
        version: '1.0.0',
        api: { url: 'https://api.siliconflow.cn/v1', suffix: '/chat/completions' },
        driver: 'openai',
        about: {
            apiHost: 'https://api.siliconflow.cn',
            docUrl: 'https://docs.siliconflow.cn/',
            modelUrl: 'https://cloud.siliconflow.cn/models',
            getKeyUrl: 'https://account.siliconflow.cn/'
        }
    };

    override detail = {
        supportedModels: [
            { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek-R1' },
            { id: 'deepseek-ai/DeepSeek-V3', name: 'DeepSeek-V3' },
            { id: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen2.5-72B-Instruct' },
            { id: 'Qwen/Qwen2.5-32B-Instruct', name: 'Qwen2.5-32B-Instruct' },
            { id: 'Qwen/Qwen2.5-14B-Instruct', name: 'Qwen2.5-14B-Instruct' },
            { id: 'Qwen/Qwen2.5-7B-Instruct', name: 'Qwen2.5-7B-Instruct' },
            { id: 'Qwen/Qwen2.5-3B-Instruct', name: 'Qwen2.5-3B-Instruct' },
            { id: 'Qwen/Qwen2.5-1B-Instruct', name: 'Qwen2.5-1B-Instruct' },
            { id: 'Qwen/Qwen2.5-0.5B-Instruct', name: 'Qwen2.5-0.5B-Instruct' }
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

    async metadata(opts: IDatabaseMetadataOptions): Promise<IDatabaseMetadataResult> {
        try {
            switch (opts.type) {
                case 'models':
                    return await this.getModels(opts.datasourceId, opts.search);
                default:
                    return {
                        success: false,
                        error: `不支持的元数据类型: ${opts.type}`
                    };
            }
        } catch (error: any) {
            console.error('❌ [SiliconFlow Connect] metadata 执行错误:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 获取LLM模型列表
     */
    private async getModels(datasourceId?: string, search?: string): Promise<IDatabaseMetadataResult> {
        return getLLMModels(
            datasourceId,
            search,
            'SiliconFlow',
            this.overview.api.url,
            this.detail.supportedModels,
            {
                buildApiUrl: buildSiliconFlowApiUrl,
                isValidModel: isSiliconFlowValidModel,
                transformModel: transformSiliconFlowModelData
            }
        );
    }

}