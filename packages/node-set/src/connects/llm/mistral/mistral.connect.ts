import { Icon } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import { 
    createApiKeyField, 
    createBaseUrlField, 
    testLLMConnection
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'mistral',
    name: 'Mistral AI',
    type: 'llm' as const,
    provider: 'mistral',
    icon: 'mistral.svg' as Icon,
    tags: ["international"],
    description: 'Mistral AI模型连接',
    version: '1.0.0',
    api: { url: 'https://api.mistral.ai/v1', suffix: '/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'https://api.mistral.ai/v1',
        docUrl: 'https://docs.mistral.ai',
        modelUrl: 'https://docs.mistral.ai/getting-started/models/models_overview',
        getKeyUrl: 'https://console.mistral.ai/'
    }
};

export class MistralConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'codestral-2501', name: 'codestral-2501',group: 'Codestral'},
            {id: 'mistral-large-2', name: 'mistral-large-2',group: 'Mistral'},
            {id: 'mistral-large', name: 'mistral-large',group: 'Mistral'},
            {id: 'mistral-nemo', name: 'mistral-nemo',group: 'Mistral'},
            {id: 'mistral-tiny', name: 'mistral-tiny',group: 'Mistral'},
            {id: 'mistral-7b-instruct', name: 'mistral-7b-instruct',group: 'Mistral'},
            {id: 'mixtral-8x22b-instruct', name: 'mixtral-8x22b-instruct',group: 'Mixtral'},
            {id: 'mixtral-8x7b-instruct', name: 'mixtral-8x7b-instruct',group: 'Mixtral'},
            {id: 'open-mistral-7b', name: 'open-mistral-7b',group: 'Open'},
            {id: 'open-mistral-nemo', name: 'open-mistral-nemo',group: 'Open'},
            {id: 'open-mixtral-8x7b', name: 'open-mixtral-8x7b',group: 'Open'},
            {id: 'open-mixtral-8x22b', name: 'open-mixtral-8x22b',group: 'Open'}
        ],
        fields: [
            createApiKeyField('mistral-...'),
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