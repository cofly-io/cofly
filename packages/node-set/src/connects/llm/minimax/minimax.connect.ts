import { Icon } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import { 
    createApiKeyField, 
    createGroupIdField,
    createBaseUrlField, 
    testLLMConnection
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'minimax',
    name: 'MiniMax',
    type: 'llm' as const,
    provider: 'minimax',
    icon: 'minimax.svg' as Icon,
    tags: ["domestic"],
    description: 'MiniMax AI模型连接',
    version: '1.0.0',
    api: { url: 'https://api.minimax.chat/v1/', suffix: '/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'https://api.minimax.chat/v1/',
        docUrl: 'https://platform.minimaxi.com/document/Announcement',
        modelUrl: 'https://platform.minimaxi.com/document/Models',
        getKeyUrl: 'https://api.minimax.chat/'
    }
};

export class MinimaxConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'abab6.5s-chat', name: 'abab6.5s-chat',group: 'Abab'},
            {id: 'abab6.5-chat', name: 'abab6.5-chat',group: 'Abab'},
            {id: 'abab6.5g-chat', name: 'abab6.5g-chat',group: 'Abab'},
            {id: 'abab5.5s-chat', name: 'abab5.5s-chat',group: 'Abab'},
            {id: 'abab5.5-chat', name: 'abab5.5-chat',group: 'Abab'},
            {id: 'abab6-chat', name: 'abab6-chat',group: 'Abab'}
        ],
        fields: [
            createApiKeyField('eyJ...'),
            createGroupIdField('Group ID'),
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