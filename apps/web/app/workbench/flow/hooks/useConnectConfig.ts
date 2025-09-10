/**
 * 连接配置相关的自定义hooks
 */

import { useCallback, useState, useRef } from 'react';
import { handleAsyncOperationWithRetry, logger } from '../utils/errorHandling';
import { IMetadataResult, IDataOptions } from '@repo/common';

interface UseConnectConfigProps {
  showError: (title: string, message: string) => void;
  showWarning?: (title: string, message: string) => void;
  showSuccess?: (title: string, message: string) => void;
}

export const useConnectConfig = ({
  showError,
  showWarning,
  showSuccess
}: UseConnectConfigProps) => {

  // 连接配置缓存
  const [connectConfigsCache, setConnectConfigsCache] = useState<Map<string, IDataOptions[]>>(new Map());
  const [isLoadingConfigs, setIsLoadingConfigs] = useState<Set<string>>(new Set());

  // 数据库表名缓存
  const [tablesCache, setTablesCache] = useState<Map<string, IMetadataResult>>(new Map());
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
  const handleFetchConnectConfigs = useCallback(async (connectType?: string): Promise<IDataOptions[]> => {
    const cacheKey = connectType || 'all';

    // 检查缓存
    if (!isCacheExpired(cacheKey) && connectConfigsCache.has(cacheKey)) {
      const cachedConfigs = connectConfigsCache.get(cacheKey)!;
      return cachedConfigs;
    }

    // 检查是否正在加载
    if (isLoadingConfigs.has(cacheKey)) {
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
      logger.info('开始获取连接配置', { connectType });

      // 使用新的fetchConnectInstances函数
      const { fetchConnectInstances } = await import('../../utils/dataFetchers');
      const instancesResult = await fetchConnectInstances(connectType);

      return instancesResult;
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
      logger.error('获取连接配置失败', { connectType, error: result.error });
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
  const handleFetchConnectDetail = useCallback(async (
    connectID: string,
    search?: string
  ): Promise<IMetadataResult> => {
    const cacheKey = `${connectID}_${search || ''}`;

    // 检查缓存
    if (!isCacheExpired(cacheKey) && tablesCache.has(cacheKey)) {
      const cachedTables = tablesCache.get(cacheKey)!;
      logger.debug('使用缓存的表名数据', { connectID, search, count: cachedTables.data?.length || 0 });
      return cachedTables;
    }

    // 检查是否正在加载
    if (isLoadingTables.has(cacheKey)) {
      logger.debug('表名数据正在加载中', { connectID, search });
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

    const result = await handleAsyncOperationWithRetry(async () => {
      logger.info('开始获取连接详情', { connectID, search });

      // 使用新的fetchConnectDetail函数
      const { fetchConnectDetail } = await import('../../utils/dataFetchers');
      const detailResult = await fetchConnectDetail(connectID, search);

      return detailResult;
    }, 3, 1000, '获取连接详情失败');

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
      logger.error('获取连接详情失败', { connectID, search, error: result.error });
      showError('获取连接详情失败', result.error);

      return {
        success: false,
        error: result.error,
        data: []
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
    handleFetchConnectDetail,

    // 缓存管理
    clearCache,
    getCacheStats
  };
};