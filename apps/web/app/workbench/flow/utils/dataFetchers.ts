/**
 * 数据获取工具函数
 * 
 * 用于nodeview->nodesetting中渲染控件的回调函数
 * 包含连接配置和表名获取等功能
 */

import type { ConnectConfig } from '../types/node';
/**
 * 获取连接实例列表
 * Node设置selectconnect下拉框数据来源于 fetchConnectInstances 回调函数
 * @returns 连接实例数组
 */
export const fetchConnectInstances = async (connectType?: string) => {
  try {
    // 如果connectType是'kb'，则调用知识库服务
    if (connectType === 'kb') {
      const { AiRagService } = await import('@/services/aiRagService');
      const result = await AiRagService.getAiRags();

      if (!result.success) {
        throw new Error(result.error || '获取知识库实例失败');
      }

      const mappedData = (result.data || []).map(item => {
        return {
          id: item.id || '',
          name: item.name,
          nodeinfo: {}, // 空对象，不包含任何敏感信息
          description: `知识库`
        };
      });
      return mappedData;
    }

    // 原有的连接配置逻辑
    const { ConnectConfigService } = await import('@/services/connectConfigService');
    // 判断connectType如果是llm，则使用mtype参数，否则使用ctype参数
    const queryParam = connectType ?
      (connectType === 'llm' ? { mtype: connectType } : { ctype: connectType }) :
      undefined;
    const result = await ConnectConfigService.getConnectConfigs(queryParam);

    if (!result.success) {
      throw new Error(result.error || '获取连接配置失败');
    }

    const mappedData = (result.data || []).map(item => {
      // selectconnect 只需要基本信息，不需要敏感的配置数据
      return {
        id: item.id || '',
        name: item.name,
        ctype: item.ctype,
        mtype: item.mtype || item.ctype, // 如果mtype为undefined，使用ctype作为默认值
        nodeinfo: {}, // 空对象，不包含任何敏感信息
        description: `${item.mtype || item.ctype} 连接 - ${item.name}`
      };
    });
    return mappedData;
  } catch (error) {
    return [];
  }
};

/**
 * 获取连接详情
 * @param connectInfoStr 连接信息JSON字符串
 * @param search 搜索关键词，可选
 * @returns 连接详情对象
 */
export const fetchConnectDetail = async (connectInfoStr: string, search?: string) => {
  try {
    // 解析连接信息JSON字符串为ConnectConfig类型
    let connectInfo: ConnectConfig;
    connectInfo = JSON.parse(connectInfoStr) as ConnectConfig;

    // 判断是否为LLM类型
    if (connectInfo.mtype === 'llm') {
      // 使用LLM元数据服务
      const { LLMMetadataService } = await import('@/services/llmMetadataService');
      const result = await LLMMetadataService.getModels(connectInfo.id, search);

      if (!result.success) {
        throw new Error(result.error || '获取模型失败');
      }

      return {
        loading: false,
        error: null,
        tableOptions: result.data?.map((item: any) => ({
          label: item.label,
          value: item.value
        })) || []
      };
    } else {
      // 使用数据库元数据服务（保持原来的代码）
      const serviceModule = await import('@/services/databaseMetadataService');
      const { ConnectMetadataService } = serviceModule;
      const result = await ConnectMetadataService.getTables(connectInfo.id, search);

      if (!result.success) {
        throw new Error(result.error || '获取表名失败');
      }

      return {
        loading: false,
        error: null,
        tableOptions: result.data?.map((item: any) => ({
          label: item.label,
          value: item.value
        })) || []
      };
    }
  } catch (error) {
    return {
      loading: false,
      error: error instanceof Error ? error.message : '获取连接详情失败',
      tableOptions: []
    };
  }
};

