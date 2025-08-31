import { Icon } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import { 
    createApiKeyField, 
    createBaseUrlField, 
    testLLMConnection
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'groq',
    name: 'Groq',
    type: 'llm' as const,
    provider: 'groq',
    icon: 'groq.svg' as Icon,
    tags: ["international"],
    description: 'Groq AI模型连接',
    version: '1.0.0',
    api: { url: 'https://api.groq.com/openai', suffix: '/v1/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'https://api.groq.com/openai',
        docUrl: 'https://console.groq.com/docs/quickstart',
        modelUrl: 'https://console.groq.com/docs/models',
        getKeyUrl: 'https://console.groq.com/keys'
    }
};

export class GroqConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'llama-3.1-405b-reasoning', name: 'llama-3.1-405b-reasoning',group: 'LLama'},
            {id: 'llama-3.1-70b-versatile', name: 'llama-3.1-70b-versatile',group: 'LLama'},
            {id: 'llama-3.1-8b-instant', name: 'llama-3.1-8b-instant',group: 'LLama'},
            {id: 'mixtral-8x7b-32768', name: 'mixtral-8x7b-32768',group: 'Mixtral'},
            {id: 'gemma-7b-it', name: 'gemma-7b-it',group: 'Gemma'},
            {id: 'gemma2-9b-it', name: 'gemma2-9b-it',group: 'Gemma'}
        ],
        fields: [
            createApiKeyField('gsk_...'),
            createBaseUrlField(this.overview.api.url),
        ],
        validateConnection: true,
        connectionTimeout: 10
    };

    async test(config: Record<string, any>, message?: string): Promise<ConnectTestResult> {
        return testLLMConnection(
            this.overview.id,
            config,
            this.overview.api.url+this.overview.api.suffix||'',
            message
        );
    }
}