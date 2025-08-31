import { IDatabaseMetadataOptions, IDatabaseMetadataResult } from '@repo/common';

/**
 * 节点元数据服务
 * 提供统一的节点元数据获取接口
 */
export class ConnectMetadataService {
  /**
   * 获取节点元数据
   */
  static async getMetadata(
    options: IDatabaseMetadataOptions
  ): Promise<IDatabaseMetadataResult> {
    try {
      const searchParams = new URLSearchParams({
        type: options.type,
        ...(options.tableName && { tableName: options.tableName }),
        ...(options.search && { search: options.search })
      });

      const url = `/api/metadata/${options.datasourceId}?${searchParams.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取元数据失败'
      };
    }
  }

  /**
   * 获取数据库表名
   */
  static async getTables(
    datasourceId: string,
    search?: string
  ): Promise<IDatabaseMetadataResult> {
    return this.getMetadata({
      type: 'tables',
      datasourceId,
      search
    });
  }

  /**
   * 获取表的列名
   */
  static async getColumns(
    datasourceId: string,
    tableName: string,
    search?: string
  ): Promise<IDatabaseMetadataResult> {
    return this.getMetadata( {
      type: 'columns',
      datasourceId,
      tableName,
      search
    });
  }

  /**
   * 获取数据库schema
   */
  static async getSchemas(
    nodeKind: string,
    datasourceId: string,
    search?: string
  ): Promise<IDatabaseMetadataResult> {
    return this.getMetadata( {
      type: 'schemas',
      datasourceId,
      search
    });
  }
}