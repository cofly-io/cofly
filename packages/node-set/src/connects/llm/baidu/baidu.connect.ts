import { Icon } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import { 
    createApiKeyField, 
    createSecretKeyField,
    createBaseUrlField, 
    testLLMConnection
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'baidu',
    name: '百度文心千帆',
    type: 'llm' as const,
    provider: 'baidu',
    icon: 'baidu.svg' as Icon,
    tags: ["domestic"],
    description: '百度文心千帆AI模型连接',
    version: '1.0.0',
    api: { url: 'https://qianfan.baidubce.com', suffix: '/v2/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'https://api.baichuan-ai.com',
        docUrl: 'https://cloud.baidu.com/doc/index.html',
        modelUrl: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/s/Fm2vrveyu',
        getKeyUrl: 'https://console.bce.baidu.com/qianfan/'
    }
};

export class BaiduConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'deepseek-r1', name: 'DeepSeek R1',group: 'DeepSeek'},
            {id: 'deepseek-v3', name: 'DeepSeek V3',group: 'DeepSeek'},
            {id: 'ernie-4.0-8k-latest', name: 'ERNIE-4.0',group: 'ERNIE'},
            {id: 'ernie-4.0-turbo-8k-latest', name: 'ERNIE 4.0 Trubo',group: 'ERNIE'},
            {id: 'ernie-speed-8k', name: 'ERNIE Speed',group: 'ERNIE'},
            {id: 'ernie-lite-8k', name: 'ERNIE Lite',group: 'ERNIE'},
            {id: 'bge-large-zh', name: 'BGE Large ZH',group: 'Embedding'},
            {id: 'bge-large-en', name: 'BGE Large EN',group: 'Embedding'}
        ],
        fields: [
            createApiKeyField('API Key'),
            createSecretKeyField('Secret Key'),
            createBaseUrlField(this.overview.api.url),
        ],
        validateConnection: true,
        connectionTimeout: 1000
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