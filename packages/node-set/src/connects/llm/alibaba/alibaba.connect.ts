import { Icon } from '@repo/common';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import {
    createApiKeyField,
    createBaseUrlField,
    testLLMConnection
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'alibaba',
    name: '阿里云百炼',
    type: 'llm' as const,
    provider: 'alibaba',
    icon: 'alibaba.svg' as Icon,
    tags: ["domestic"],
    description: '阿里巴巴百炼AI模型连接',
    version: '1.0.0',
    api: { url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/', suffix: '/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'https://dashscope.aliyuncs.com/compatible-mode/v1/',
        docUrl: 'https://help.aliyun.com/zh/model-studio/getting-started/',
        modelUrl: 'https://bailian.console.aliyun.com/?tab=model#/model-market',
        getKeyUrl: 'https://dashscope.console.aliyun.com/'
    }
};

export class AlibabaConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            { id: 'qwen-vl-plus', name: 'qwen-vl-plus', group: 'qwen-vl' },
            { id: 'qwen-coder-plus', name: 'qwen-coder-plus', group: 'qwen-coder', },
            { id: 'qwen-turbo', name: 'qwen-turbo', group: 'qwen-turbo', },
            { id: 'qwen-plus', name: 'qwen-plus', group: 'qwen-plus', },
            { id: 'qwen-max', name: 'qwen-max', group: 'qwen-max', }
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
            this.overview.api.url + this.overview.api.suffix || '',
            message
        );
    }
}