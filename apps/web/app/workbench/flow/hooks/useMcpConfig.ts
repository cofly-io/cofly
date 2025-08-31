import { useState, useCallback } from 'react';
import { mcpConfigService } from '../../../../src/services/mcpConfigService';

export interface McpConfig {
  id: string;
  name: string;
  type: string;
  mcpinfo: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface McpConfigState {
  configs: McpConfig[];
  loading: boolean;
  error: string | null;
}

export const useMcpConfig = () => {
  const [state, setState] = useState<McpConfigState>({
    configs: [],
    loading: false,
    error: null
  });

  const fetchConfigs = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await mcpConfigService.getMcpConfigs();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          configs: response.data,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.error || '获取MCP配置失败',
          loading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: '网络错误，请检查连接',
        loading: false
      }));
    }
  }, []);

  const saveConfig = useCallback(async (configData: Omit<McpConfig, 'id'>) => {
    try {
      const response = await mcpConfigService.saveMcpConfig(configData);
      
      if (response.success) {
        // 重新获取配置列表
        await fetchConfigs();
        return { success: true };
      } else {
        return { success: false, error: response.error || '保存失败' };
      }
    } catch (error) {
      return { success: false, error: '网络错误' };
    }
  }, [fetchConfigs]);

  const deleteConfig = useCallback(async (id: string) => {
    try {
      const response = await mcpConfigService.deleteMcpConfig(id);
      
      if (response.success) {
        // 重新获取配置列表
        await fetchConfigs();
        return { success: true };
      } else {
        return { success: false, error: response.error || '删除失败' };
      }
    } catch (error) {
      return { success: false, error: '网络错误' };
    }
  }, [fetchConfigs]);

  return {
    ...state,
    fetchConfigs,
    saveConfig,
    deleteConfig
  };
};