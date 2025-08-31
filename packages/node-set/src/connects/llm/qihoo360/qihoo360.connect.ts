import { Icon } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import { 
    createApiKeyField, 
    createBaseUrlField, 
    testLLMConnection
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'qihoo360',
    name: '360智脑',
    type: 'llm' as const,
    provider: 'qihoo360',
    icon: 'qihoo360.svg' as Icon,
    tags: ["domestic"],
    description: '360智脑AI模型连接',
    version: '1.0.0',
    api: { url: 'https://ai.360.com/api/v1', suffix: '/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'https://ai.360.com/',
        docUrl: 'https://ai.360.com/platform/docs/overview',
        modelUrl: 'https://ai.360.com/platform/limit',
        getKeyUrl: 'https://ai.360.com/'
    }
};

export class Qihoo360Connect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: '360gpt-pro', name: '360gpt-pro',group: '360'},
            {id: '360gpt-turbo', name: '360gpt-turbo',group: '360'},
            {id: '360gpt-turbo-responsibility-8k', name: '360gpt-turbo-responsibility-8k',group: '360'},
            {id: '360gpt2-pro', name: '360gpt2-pro',group: '360'},
            {id: '360gpt_s2_v9', name: '360gpt_s2_v9',group: '360'}
        ],
        fields: [
            createApiKeyField('360-...'),
            createBaseUrlField(this.overview.api.url),
        ],
        validateConnection: true,
        connectionTimeout: 10
    };

    async test(config: Record<string, any>, message?: string): Promise<ConnectTestResult> {
        return testLLMConnection(
            this.overview.id,
            config,
            this.overview.api.url,
            message
        );
    }
}