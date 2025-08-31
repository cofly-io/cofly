import { Icon } from '@repo/common';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { 
    createApiKeyField, 
    createBaseUrlField, 
    testLLMConnection
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'baichuan',
    name: '百川大模型',
    type: 'llm' as const,
    provider: 'baichuan',
    icon: 'baichuan.svg' as Icon,
    tags: ["domestic"],
    description: '百川大模型AI连接',
    version: '1.0.0',
    api: { url: 'https://api.baichuan-ai.com', suffix: '/v1/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'https://api.baichuan-ai.com',
        docUrl: 'https://platform.baichuan-ai.com/docs',
        modelUrl: 'https://platform.baichuan-ai.com/price',
        getKeyUrl: 'https://platform.baichuan-ai.com/'
    }
};

export class BaichuanConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'baichuan2-turbo', name: 'baichuan2-turbo',group: 'Baichuan'},
            {id: 'baichuan2-turbo-192k', name: 'baichuan2-turbo-192k',group: 'Baichuan'},
            {id: 'baichuan3-turbo', name: 'baichuan3-turbo',group: 'Baichuan'},
            {id: 'baichuan3-turbo-128k', name: 'baichuan3-turbo-128k',group: 'Baichuan'},
        ],
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
            this.overview.api.url+this.overview.api.suffix||'',
            message
        );
    }
}