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
    // switch (connectType) {
    // case 'kb': {
    //   const { AiRagService } = await import('@/services/aiRagService');
    //   const result = await AiRagService.getAiRags();
    // const mappedData = (result.data || []).map(item => {
    //   return {
    //     id: item.id || '',
    //     name: item.name,
    //   };
    // });
    //   return result?.data;
    // }
    // case 'llm':
    // default: {
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
      return {
        id: item.id || '',
        name: item.name,
        description: connectType === 'llm' ? item.ctype : ''
      };
    });
    return mappedData;
    //   }
    // }
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
export const fetchConnectDetail = async (connectID: string, search?: string) => {
  try {
    const { MetadataService } = await import('@/services/metadataService');
    const result = await MetadataService.MetaData(connectID, search);
    if (!result.success) {
      throw new Error(result.error || '获取数据失败');
    }
    return {
      Options: result.data?.map((item: any) => ({
        label: item.label,
        value: item.value
      })) || []
    };
  } catch (error) {
    return {
      loading: false,
      error: error instanceof Error ? error.message : '获取连接详情失败',
      tableOptions: []
    };
  }
};

