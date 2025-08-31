import { Icon } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import { 
    createApiKeyField, 
    createBaseUrlField, 
    testLLMConnection
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'google',
    name: 'Gemini',
    type: 'llm' as const,
    provider: 'google',
    icon: 'Gemini.svg' as Icon,
    tags: ["international"],
    description: 'Google Gemini/PaLM AI模型连接',
    version: '1.0.0',
    api: { url: 'https://generativelanguage.googleapis.com/v1beta', suffix: '/chat/completions' },
    driver: 'gemini',
    about: {
        apiHost: 'https://gemini.google.com/',
        docUrl: 'https://ai.google.dev/gemini-api/docs',
        modelUrl: 'https://ai.google.dev/gemini-api/docs/models/gemini',
        getKeyUrl: 'https://aistudio.google.com/app/apikey'
    }
};

export class GoogleConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'gemini-2.5-flash-preview', name: 'gemini-2.5-flash-preview',group: 'Gemini'},
            {id: 'gemini-2.5-pro-preview', name: 'gemini-2.5-pro-preview',group: 'Gemini'},
            {id: 'gemini-2.0-flash-exp', name: 'gemini-2.0-flash-exp',group: 'Gemini'},
            {id: 'gemini-2.0-flash', name: 'gemini-2.0-flash',group: 'Gemini'},
            {id: 'gemini-1.5-pro', name: 'gemini-1.5-pro',group: 'Gemini'},
            {id: 'gemini-1.5-flash', name: 'gemini-1.5-flash',group: 'Gemini'},
            {id: 'gemini-1.5-flash-8b', name: 'gemini-1.5-flash-8b',group: 'Gemini'},
            {id: 'gemini-1.0-pro', name: 'gemini-1.0-pro',group: 'Gemini'},
            {id: 'gemini-1.0-ultra', name: 'gemini-1.0-ultra',group: 'Gemini'},
            {id: 'gemma-2-27b-it', name: 'gemma-2-27b-it',group: 'Gemma'},
            {id: 'gemma-2-9b-it', name: 'gemma-2-9b-it',group: 'Gemma'},
            {id: 'text-bison-001', name: 'text-bison-001',group: 'Text Bison'},
            {id: 'chat-bison-001', name: 'chat-bison-001',group: 'Chat Bison'}
        ],
        fields: [
            createApiKeyField('AIza...'),
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