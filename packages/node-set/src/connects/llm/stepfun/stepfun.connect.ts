import { Icon } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { ILLMOverview, ConnectTestResult } from '@repo/common';
import { 
    createApiKeyField, 
    createBaseUrlField, 
    testLLMConnection
  } from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'stepfun',
    name: '阶跃星辰',
    type: 'llm' as const,
    provider: 'custom',
    icon: 'stepfun.svg' as Icon,
    tags: ["domestic"],
    description: '阶跃星辰AI模型连接',
    version: '1.0.0',
    api: { url: 'https://api.stepfun.com/v1', suffix: '/chat/completions' },
    driver:"openai",
    about: {
        apiHost: 'https://api.stepfun.com',
        docUrl: 'https://platform.stepfun.com/docs/overview/concept',
        modelUrl: 'https://api.stepfun.com/v1/models',
        getKeyUrl:'https://platform.stepfun.com/interface-key'
    }
};

export class StepfunConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels:[
            {id: 'step-1v-32k', name: 'step-1v-32k',group: 'Step'},
            {id: 'step-1-flash', name: 'step-1-flash',group: 'Step'},
            {id: 'step-1-medium', name: 'step-1-medium',group: 'Step'},
            {id: 'step-1-8k', name: 'step-1-8k',group: 'Step'},
            {id: 'step-1x-medium', name: 'step-1x-medium',group: 'Step'},
            {id: 'step-2-16k', name: 'step-2-16k',group: 'Step'}
        ],
        fields: [
            createApiKeyField(),
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