import { Icon } from '@repo/common';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import {
    createApiKeyField,
    createBaseUrlField,
    testLLMConnection
} from '../../../utils/llm-fields';
import { OpenAIBasedLLMConnect } from "../../base/OpenAIBasedLLMConnect";

/**
 * OpenAI LLM 连接器类
 */
export class OpenAIConnect extends OpenAIBasedLLMConnect {
    override overview: ILLMOverview = {
        id: 'openai',
        name: 'OpenAI',
        type: 'llm' as const,
        provider: 'openai',
        icon: 'openai.svg' as Icon,
        tags: ["international"],
        description: 'OpenAI GPT模型连接',
        version: '1.0.0',
        api: { url: 'https://api.openai.com/v1', suffix: '/chat/completions' },
        driver: 'openai',
        about: {
            apiHost: 'https://api.openai.com',
            docUrl: 'https://platform.openai.com/docs',
            modelUrl: 'https://platform.openai.com/docs/models',
            getKeyUrl: 'https://platform.openai.com/api-keys'
        }
    };

    override detail = {
        fields: [
            createApiKeyField('sk-...'),
            createBaseUrlField(this.overview.api.url),
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
}