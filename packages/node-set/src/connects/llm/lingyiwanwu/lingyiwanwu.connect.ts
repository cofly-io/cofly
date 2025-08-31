import { Icon } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import { 
    createApiKeyField, 
    createBaseUrlField, 
    testLLMConnection
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'lingyiwanwu',
    name: '零一万物',
    type: 'llm' as const,
    provider: 'lingyiwanwu',
    icon: 'lingyiwanwu.svg' as Icon,
    tags: ["domestic"],
    description: '零一万物AI模型连接',
    version: '1.0.0',
    api: { url: 'https://api.lingyiwanwu.com', suffix: '/v1/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'https://api.lingyiwanwu.com',
        docUrl: 'https://platform.lingyiwanwu.com/docs',
        modelUrl: 'https://platform.lingyiwanwu.com/docs#%E6%A8%A1%E5%9E%8B',
        getKeyUrl: 'https://platform.lingyiwanwu.com/'
    }
};

export class LingyiwanwuConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'yi-large', name: 'yi-large',group: 'Yi'},
            {id: 'yi-large-turbo', name: 'yi-large-turbo',group: 'Yi'},
            {id: 'yi-medium', name: 'yi-medium',group: 'Yi'},
            {id: 'yi-medium-200k', name: 'yi-medium-200k',group: 'Yi'},
            {id: 'yi-spark', name: 'yi-spark',group: 'Yi'},
            {id: 'yi-large-rag', name: 'yi-large-rag',group: 'Yi'},
            {id: 'yi-large-fc', name: 'yi-large-fc',group: 'Yi'},
            {id: 'yi-vision', name: 'yi-vision',group: 'Yi'}
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
            this.overview.api.url,
            message
        );
    }
}