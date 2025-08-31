import { Icon } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import {
    createApiKeyField,
    createBaseUrlField,
    testLLMConnection,
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'deepseek',
    name: 'DeepSeek',
    type: 'llm' as const,
    provider: 'deepseek',
    icon: 'deepseek.svg' as Icon,
    tags: ["domestic"],
    description: 'DeepSeek AI模型连接',
    version: '1.0.0',
    api: { url: 'https://api.deepseek.com', suffix: '/v1/chat/completions' },
    about: {
        apiHost: 'https://api.deepseek.com/',
        docUrl: 'https://platform.deepseek.com/api-docs/',
        modelUrl: 'https://platform.deepseek.com/api-docs/',
        getKeyUrl: 'https://platform.deepseek.com/'
    }
};

export class DeepSeekConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'deepseek-chat', name: 'DeepSeek Chat',group: 'DeepSeek Chat'},
            {id: 'deepseek-coder', name: 'DeepSeek Coder',group: 'DeepSeek Coder'},
            {id: 'deepseek-reasoner', name: 'DeepSeek Reasoner',group: 'DeepSeek Reasoner'}
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