/**
 * 连接配置相关的自定义hooks
 */

import { useCallback, useState, useRef } from 'react';
import { ConnectConfig, FetchTablesResponse } from '../types/node';
import { handleAsyncOperation, handleAsyncOperationWithRetry, logger } from '../utils/errorHandling';
import { ConnectConfigService } from '@/services/connectConfigService';
import { fetchDatabaseTables } from '@/services/databaseService';
import { API_ENDPOINTS, REQUEST_TIMEOUT } from '../utils/constants';

interface UseConnectConfigProps {
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
}

export const useConnectConfig = ({
  showError,
  showWarning,
  showSuccess
}: UseConnectConfigProps) => {
  
  // 连接配置缓存
  const [connectConfigsCache, setConnectConfigsCache] = useState<Map<string, ConnectConfig[]>>(new Map());
  const [isLoadingConfigs, setIsLoadingConfigs] = useState<Set<string>>(new Set());
  
  // 数据库表名缓存
  const [tablesCache, setTablesCache] = useState<Map<string, FetchTablesResponse>>(new Map());
  const [isLoadingTables, setIsLoadingTables] = useState<Set<string>>(new Set());

  // 缓存过期时间（5分钟）
  const CACHE_EXPIRE_TIME = 5 * 60 * 1000;
  const cacheTimestamps = useRef<Map<string, number>>(new Map());

  /**
   * 检查缓存是否过期
   */
  const isCacheExpired = useCallback((key: string): boolean => {
    const timestamp = cacheTimestamps.current.get(key);
    if (!timestamp) return true;
    return Date.now() - timestamp > CACHE_EXPIRE_TIME;
  }, []);

  /**
   * 设置缓存时间戳
   */
  const setCacheTimestamp = useCallback((key: string) => {
    cacheTimestamps.current.set(key, Date.now());
  }, []);

  /**
   * 动态获取连接配置
   */
  const handleFetchConnectConfigs = useCallback(async (ctype?: string): Promise<ConnectConfig[]> => {
    const cacheKey = ctype || 'all';
    
    // 检查缓存
    if (!isCacheExpired(cacheKey) && connectConfigsCache.has(cacheKey)) {
      const cachedConfigs = connectConfigsCache.get(cacheKey)!;
      logger.debug('使用缓存的连接配置', { ctype, count: cachedConfigs.length });
      return cachedConfigs;
    }

    // 检查是否正在加载
    if (isLoadingConfigs.has(cacheKey)) {
      logger.debug('连接配置正在加载中', { ctype });
      // 等待加载完成
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (!isLoadingConfigs.has(cacheKey) && connectConfigsCache.has(cacheKey)) {
            resolve(connectConfigsCache.get(cacheKey)!);
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    }

    setIsLoadingConfigs(prev => new Set(prev).add(cacheKey));

    const result = await handleAsyncOperationWithRetry(async () => {
      logger.info('开始获取连接配置', { ctype });

      const serviceResult = await ConnectConfigService.getConnectConfigs({ ctype });

      if (!serviceResult.success) {
        throw new Error(serviceResult.error || '获取连接配置失败');
      }

      // 转换数据格式以匹配UI层期望的格式
      const transformedConfigs: ConnectConfig[] = serviceResult.data.map(config => ({
        id: config.id || '',
        name: config.name,
        ctype: config.ctype,
        nodeinfo: config.config, // 将config字段映射为nodeinfo
        description: config.description
      }));

      logger.info('成功获取连接配置', {
        ctype,
        count: transformedConfigs.length
      });

      return transformedConfigs;
    }, 3, 1000, '获取连接配置失败');

    setIsLoadingConfigs(prev => {
      const newSet = new Set(prev);
      newSet.delete(cacheKey);
      return newSet;
    });

    if (result.success) {
      // 更新缓存
      setConnectConfigsCache(prev => new Map(prev).set(cacheKey, result.data));
      setCacheTimestamp(cacheKey);
      return result.data;
    } else {
      logger.error('获取连接配置失败', { ctype, error: result.error });
      showError('连接配置错误', result.error);
      return [];
    }
  }, [
    connectConfigsCache,
    isLoadingConfigs,
    isCacheExpired,
    setCacheTimestamp,
    showError
  ]);

  /**
   * 动态获取数据库表名
   */
  const handleFetchTables = useCallback(async (
    datasourceId: string, 
    search?: string
  ): Promise<FetchTablesResponse> => {
    const cacheKey = `${datasourceId}_${search || ''}`;
    
    // 检查缓存
    if (!isCacheExpired(cacheKey) && tablesCache.has(cacheKey)) {
      const cachedTables = tablesCache.get(cacheKey)!;
      logger.debug('使用缓存的表名数据', { datasourceId, search, count: cachedTables.tableOptions.length });
      return cachedTables;
    }

    // 检查是否正在加载
    if (isLoadingTables.has(cacheKey)) {
      logger.debug('表名数据正在加载中', { datasourceId, search });
      // 等待加载完成
      return new Promise((resolve) => {
        const checkLoading = () => {
          if (!isLoadingTables.has(cacheKey) && tablesCache.has(cacheKey)) {
            resolve(tablesCache.get(cacheKey)!);
          } else {
            setTimeout(checkLoading, 100);
          }
        };
        checkLoading();
      });
    }

    setIsLoadingTables(prev => new Set(prev).add(cacheKey));

    const result = await handleAsyncOperation(async () => {
      logger.info('开始获取表名', { datasourceId, search });

      const tablesResult = await fetchDatabaseTables(datasourceId, search);

      logger.info('成功获取表名', {
        datasourceId,
        search,
        count: tablesResult.tableOptions.length
      });

      return tablesResult;
    }, '获取表名失败');

    setIsLoadingTables(prev => {
      const newSet = new Set(prev);
      newSet.delete(cacheKey);
      return newSet;
    });

    if (result.success) {
      // 更新缓存
      setTablesCache(prev => new Map(prev).set(cacheKey, result.data));
      setCacheTimestamp(cacheKey);
      return result.data;
    } else {
      logger.error('获取表名失败', { datasourceId, search, error: result.error });
      showError('获取表名失败', result.error);
      
      return {
        loading: false,
        error: result.error,
        tableOptions: []
      };
    }
  }, [
    tablesCache,
    isLoadingTables,
    isCacheExpired,
    setCacheTimestamp,
    showError
  ]);

  /**
   * 创建新的连接配置
   */
  const createConnectConfig = useCallback(async (config: Omit<ConnectConfig, 'id'>): Promise<ConnectConfig | null> => {
    const result = await handleAsyncOperation(async () => {
      logger.info('创建连接配置', { name: config.name, ctype: config.ctype });

      const response = await fetch(API_ENDPOINTS.CONNECT_CONFIGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: config.name,
          ctype: config.ctype,
          config: config.nodeinfo,
          description: config.description
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || '创建连接配置失败');
      }

      const newConfig: ConnectConfig = {
        id: responseData.data.id,
        name: config.name,
        ctype: config.ctype,
        nodeinfo: config.nodeinfo,
        description: config.description
      };

      // 清除相关缓存
      const cacheKey = config.ctype;
      setConnectConfigsCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(cacheKey);
        newCache.delete('all');
        return newCache;
      });
      cacheTimestamps.current.delete(cacheKey);
      cacheTimestamps.current.delete('all');

      logger.info('连接配置创建成功', { id: newConfig.id, name: newConfig.name });

      return newConfig;
    }, '创建连接配置失败');

    if (result.success) {
      showSuccess('成功', '连接配置创建成功');
      return result.data;
    } else {
      showError('创建失败', result.error);
      return null;
    }
  }, [showError, showSuccess]);

  /**
   * 更新连接配置
   */
  const updateConnectConfig = useCallback(async (id: string, updates: Partial<ConnectConfig>): Promise<boolean> => {
    const result = await handleAsyncOperation(async () => {
      logger.info('更新连接配置', { id, updates: Object.keys(updates) });

      const response = await fetch(`${API_ENDPOINTS.CONNECT_CONFIGS}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updates.name,
          ctype: updates.ctype,
          config: updates.nodeinfo,
          description: updates.description
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || '更新连接配置失败');
      }

      // 清除所有缓存
      setConnectConfigsCache(new Map());
      cacheTimestamps.current.clear();

      logger.info('连接配置更新成功', { id });

      return true;
    }, '更新连接配置失败');

    if (result.success) {
      showSuccess('成功', '连接配置更新成功');
      return true;
    } else {
      showError('更新失败', result.error);
      return false;
    }
  }, [showError, showSuccess]);

  /**
   * 删除连接配置
   */
  const deleteConnectConfig = useCallback(async (id: string): Promise<boolean> => {
    const result = await handleAsyncOperation(async () => {
      logger.info('删除连接配置', { id });

      const response = await fetch(`${API_ENDPOINTS.CONNECT_CONFIGS}/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || '删除连接配置失败');
      }

      // 清除所有缓存
      setConnectConfigsCache(new Map());
      cacheTimestamps.current.clear();

      logger.info('连接配置删除成功', { id });

      return true;
    }, '删除连接配置失败');

    if (result.success) {
      showSuccess('成功', '连接配置删除成功');
      return true;
    } else {
      showError('删除失败', result.error);
      return false;
    }
  }, [showError, showSuccess]);

  /**
   * 测试连接配置
   */
  const testConnectConfig = useCallback(async (config: ConnectConfig): Promise<boolean> => {
    const result = await handleAsyncOperation(async () => {
      logger.info('测试连接配置', { id: config.id, name: config.name });

      const response = await fetch(`${API_ENDPOINTS.CONNECT_CONFIGS}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ctype: config.ctype,
          config: config.nodeinfo
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT * 2) // 测试连接可能需要更长时间
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();

      if (!responseData.success) {
        throw new Error(responseData.error || '连接测试失败');
      }

      logger.info('连接测试成功', { id: config.id });

      return true;
    }, '连接测试失败');

    if (result.success) {
      showSuccess('成功', '连接测试成功');
      return true;
    } else {
      showError('测试失败', result.error);
      return false;
    }
  }, [showError, showSuccess]);

  /**
   * 清除缓存
   */
  const clearCache = useCallback((type?: 'configs' | 'tables') => {
    if (!type || type === 'configs') {
      setConnectConfigsCache(new Map());
      logger.info('清除连接配置缓存');
    }
    
    if (!type || type === 'tables') {
      setTablesCache(new Map());
      logger.info('清除表名缓存');
    }
    
    if (!type) {
      cacheTimestamps.current.clear();
      logger.info('清除所有缓存');
    }
  }, []);

  /**
   * 获取缓存统计信息
   */
  const getCacheStats = useCallback(() => {
    return {
      connectConfigs: {
        count: connectConfigsCache.size,
        keys: Array.from(connectConfigsCache.keys())
      },
      tables: {
        count: tablesCache.size,
        keys: Array.from(tablesCache.keys())
      },
      timestamps: {
        count: cacheTimestamps.current.size,
        keys: Array.from(cacheTimestamps.current.keys())
      }
    };
  }, [connectConfigsCache, tablesCache]);

  return {
    // 状态
    isLoadingConfigs: Array.from(isLoadingConfigs),
    isLoadingTables: Array.from(isLoadingTables),
    
    // 主要操作
    handleFetchConnectConfigs,
    handleFetchTables,
    
    // CRUD操作
    createConnectConfig,
    updateConnectConfig,
    deleteConnectConfig,
    testConnectConfig,
    
    // 缓存管理
    clearCache,
    getCacheStats
  };
};