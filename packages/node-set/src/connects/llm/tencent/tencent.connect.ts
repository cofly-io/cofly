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
    id: 'tencent',
    name: '腾讯混元',
    type: 'llm',
    provider: 'custom',
    icon: 'tencent.svg' as Icon,
    description: '腾讯混元AI模型连接',
    version: '1.0.0',
    api: { url: 'https://cloud.tencent.com/product/hunyuan', suffix: '/chat/completions' },
    driver: 'openai',
    about: {
        apiHost: 'https://cloud.tencent.com/product/hunyuan',
        docUrl: 'https://cloud.tencent.com/document/product/1729/111007',
        modelUrl: 'https://cloud.tencent.com/document/product/1729/104753',
        getKeyUrl: 'https://cloud.tencent.com/product/hunyuan'
    }
};
/**
 * 腾讯混元 LLM 连接定义
 */
export class TencentConnect extends BaseLLMConnect {
    override overview: ILLMOverview = ConnectConfig;
    override detail = {
        supportedModels: [
            {id: 'hunyuan-pro', name: 'hunyuan-pro',group: 'Hunyuan'},
            {id: 'hunyuan-standard', name: 'hunyuan-standard',group: 'Hunyuan'},
            {id: 'hunyuan-lite', name: 'hunyuan-lite',group: 'Hunyuan'},
            {id: 'hunyuan-role', name: 'hunyuan-role',group: 'Hunyuan'},
            {id: 'hunyuan-functioncall', name: 'hunyuan-functioncall',group: 'Hunyuan'},
            {id: 'hunyuan-code', name: 'hunyuan-code',group: 'Hunyuan'},
            {id: 'hunyuan-vision', name: 'hunyuan-vision',group: 'Hunyuan'}
        ],
        fields: [
            createApiKeyField('Secret Key'),
            createBaseUrlField(this.overview.api.url),
        ],
        validateConnection: true,
        connectionTimeout: 10
    };

    async test(config: Record<string, any>, message?: string): Promise<ConnectTestResult> {
        try {
            // 验证必填字段
            if (!config.secretId) {
                return {
                    success: false,
                    message: '缺少必填字段: secretId'
                };
            }

            if (!config.secretKey) {
                return {
                    success: false,
                    message: '缺少必填字段: secretKey'
                };
            }

            if (!config.region) {
                return {
                    success: false,
                    message: '缺少必填字段: region'
                };
            }

            if (!config.model) {
                return {
                    success: false,
                    message: '缺少必填字段: model'
                };
            }

            // 使用通用测试器
            return await LLMTester.testConnection('tencent', {
                apiKey: 'tencent-placeholder', // 腾讯使用 secretId/secretKey 认证
                secretId: config.secretId,
                secretKey: config.secretKey,
                region: config.region,
                baseUrl: config.baseUrl || 'https://hunyuan.tencentcloudapi.com',
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