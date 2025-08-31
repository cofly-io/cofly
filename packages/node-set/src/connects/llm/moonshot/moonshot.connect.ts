import { Icon } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import {
    createApiKeyField,
    createBaseUrlField,
    testLLMConnection
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'moonshot',
    name: '月之暗面',
    type: 'llm' as const,
    provider: 'moonshot',
    icon: 'moonshot.svg' as Icon,
    tags: ["domestic"],
    description: 'Moonshot AI模型连接',
    version: '1.0.0',
    api: { url: 'https://api.moonshot.cn/v1', suffix: '/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'https://api.moonshot.cn',
        docUrl: 'https://platform.moonshot.cn/docs/',
        modelUrl: 'https://platform.moonshot.cn/docs/intro#%E6%A8%A1%E5%9E%8B%E5%88%97%E8%A1%A8',
        getKeyUrl: 'https://platform.moonshot.cn/'
    }
};

export class MoonshotConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'moonshot-v1-8k', name: 'moonshot-v1-8k',group: 'Moonshot'},
            {id: 'moonshot-v1-32k', name: 'moonshot-v1-32k',group: 'Moonshot'},
            {id: 'moonshot-v1-128k', name: 'moonshot-v1-128k',group: 'Moonshot'}
        ],
        fields: [
            createApiKeyField('sk-...'),
            createBaseUrlField(this.overview.api.url)
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