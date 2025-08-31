import { Icon } from '@repo/common';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import {
    createApiKeyField,
    createBaseUrlField,
    testLLMConnection
} from '../../../utils/llm-fields';

/**
 * Anthropic Claude LLM 连接器类
 */
export class AnthropicConnect extends BaseLLMConnect {
    override overview: ILLMOverview = {
        id: 'anthropic',
        name: 'Anthropic',
        type: 'llm' as const,
        provider: 'anthropic',
        icon: 'anthropic.svg' as Icon,
        tags: ["international"],
        description: 'Anthropic Claude AI模型连接',
        version: '1.0.0',
        api: { url: 'https://api.anthropic.com/'},
        driver: 'anthropic',
        about: {
            apiHost: 'https://api.anthropic.com/',
            docUrl: 'https://docs.anthropic.com/en/docs',
            modelUrl: 'https://docs.anthropic.com/en/docs/about-claude/models',
            getKeyUrl: 'https://console.anthropic.com/'
        }
    };

    override detail = {
        supportedModels: [
            {id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', group: 'Claude 4'},
            {id: 'claude-opus-4-20250514', name: 'Claude Opus 4', group: 'Claude 4'},
            {id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', group: 'Claude 3.7'},
            {id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', group: 'Claude 3.7'},
            {id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', group: 'Claude 3.7'}, 
            {id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', group: 'Claude 3.5'},
            {id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', group: 'Claude 3.5'},
            {id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet (Legacy)', group: 'Claude 3.5'},
            {id: 'claude-3-5-haiku-20240307', name: 'Claude 3.5 Haiku (Legacy)', group: 'Claude 3.5'},
            {id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', group: 'Claude 3'},
            {id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', group: 'Claude 3'},
        ],
        fields: [
            createApiKeyField('sk-ant-...'),
            createBaseUrlField(this.overview.api.url)
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