import { MetadataResult } from '@repo/common'

export class MetadataService {
    /**
     * 获取数据库表名
     */
    static async MetaData(
        datasourceId: string,
        search?: string
    ): Promise<MetadataResult> {
        const searchParams = new URLSearchParams({
            ...(search && { search })
        });
        const url = `/api/metadata/${datasourceId}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();
        return result;
    }
}