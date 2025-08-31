import { Icon } from '@repo/common';
import { BaseLLMConnect } from '../../base/BaseLLMConnect';
import { ConnectTestResult, ILLMOverview } from '@repo/common';
import { LLMTester } from '../../../utils/llm-tester';
import {
    createApiKeyField,
    createBaseUrlField,
    testLLMConnection
} from '../../../utils/llm-fields';

const ConnectConfig: ILLMOverview = {
    id: 'xfyun',
    name: '讯飞星火认知',
    type: 'llm',
    provider: 'custom',
    icon: 'xfyun.svg' as Icon,
    description: '讯飞星火认知AI模型连接',
    version: '1.0.0',
    api: {url:'https://spark-api.xf-yun.com',suffix:'/chat/completions'},
    driver: 'openai',
    about: {
        apiHost: 'https://spark-api.xfyun.cn/',
        docUrl: 'https://www.xfyun.cn/doc/spark/Web.html',
        modelUrl: 'https://www.xfyun.cn/doc/spark/Web.html',
        getKeyUrl: 'https://console.xfyun.cn/'
    }
};

export class XfyunConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'spark-4.0-ultra', name: 'spark-4.0-ultra',group: 'Spark'},
            {id: 'spark-max-32k', name: 'spark-max-32k',group: 'Spark'},
            {id: 'spark-max', name: 'spark-max',group: 'Spark'},
            {id: 'spark-pro-128k', name: 'spark-pro-128k',group: 'Spark'},
            {id: 'spark-pro', name: 'spark-pro',group: 'Spark'},
            {id: 'spark-v3.5', name: 'spark-v3.5',group: 'Spark'},
            {id: 'spark-v3.1', name: 'spark-v3.1',group: 'Spark'},
            {id: 'spark-v2.1', name: 'spark-v2.1',group: 'Spark'},
            {id: 'spark-lite', name: 'spark-lite',group: 'Spark'}
        ],
        fields: [
            createApiKeyField(),
            createBaseUrlField(this.overview.api.url),
        ],
        validateConnection: true,
        connectionTimeout: 10
    };

    async test(config: Record<string, any>, message?: string): Promise<ConnectTestResult> {
        try {
            // 验证必填字段
            if (!config.appId) {
                return {
                    success: false,
                    message: '缺少必填字段: appId'
                };
            }

            if (!config.apiKey) {
                return {
                    success: false,
                    message: '缺少必填字段: apiKey'
                };
            }

            if (!config.apiSecret) {
                return {
                    success: false,
                    message: '缺少必填字段: apiSecret'
                };
            }

            if (!config.model) {
                return {
                    success: false,
                    message: '缺少必填字段: model'
                };
            }

            // 使用通用测试器
            return await LLMTester.testConnection('xfyun', {
                apiKey: config.apiKey,
                appId: config.appId,
                apiSecret: config.apiSecret,
                baseUrl: config.baseUrl || 'https://spark-api.xf-yun.com',
                model: config.model,
                timeout: (config.timeout || 30) * 1000
            }, message);

        } catch (error) {
            return {
                success: false,
                message: `连接失败: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
}