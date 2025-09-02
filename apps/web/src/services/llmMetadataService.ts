import { ILLMMetadataOptions, ILLMMetadataResult } from '../../../../packages/interfaces/src/ConnectInterfaces';

/**
 * LLM元数据服务
 * 提供统一的LLM元数据获取接口
 */
export class LLMMetadataService {
    /**
     * 获取LLM元数据
     */
    static async getMetadata(
        datasourceId: string,
        search?: string
    ): Promise<ILLMMetadataResult> {
        try {
            const searchParams = new URLSearchParams({
                ...(search && { search })
            });

            const url = `/api/metadata/${datasourceId}?${searchParams.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '获取LLM元数据失败'
            };
        }
    }

    /**
     * 获取LLM模型列表
     */
    static async getModels(
        datasourceId: string,
        search?: string,
        // connectInfo?: ILLMMetadataOptions['connectInfo']
    ): Promise<ILLMMetadataResult> {
        return this.getMetadata(datasourceId,search);
    }
}