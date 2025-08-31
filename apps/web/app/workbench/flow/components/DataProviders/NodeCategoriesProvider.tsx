/**
 * 节点分类数据提供者组件
 * 
 * 负责管理节点分类数据的获取、缓存和状态管理
 * 从原始page.tsx中抽取出来，提供更好的数据管理和错误处理
 */

import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { handleAsyncOperation, handleAsyncOperationWithRetry, logger } from '../../utils/errorHandling';
import { API_ENDPOINTS } from '../../utils/constants';

// 节点分类数据类型
interface NodeCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  nodes: NodeInfo[];
}

interface NodeInfo {
  kind: string;
  name: string;
  description: string;
  icon: string;
  catalog?: string; // 使用 catalog 替代 category
  category?: string; // 保留用于向后兼容
  version: string;
  nodeWidth?: number;
  link?: any;
}

// Context类型定义
interface NodeCategoriesContextType {
  nodeCategories: NodeCategory[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number;
  refreshData: (forceRefresh?: boolean) => Promise<void>;
  clearCache: () => void;
  getStats: () => {
    totalCategories: number;
    totalNodes: number;
    categoriesWithNodes: number;
    emptyCategories: number;
  };
}

// 创建Context
const NodeCategoriesContext = createContext<NodeCategoriesContextType>({
  nodeCategories: [],
  isLoading: true,
  error: null,
  lastFetchTime: 0,
  refreshData: async () => {},
  clearCache: () => {},
  getStats: () => ({ totalCategories: 0, totalNodes: 0, categoriesWithNodes: 0, emptyCategories: 0 })
});

// Provider Props
interface NodeCategoriesProviderProps {
  children: React.ReactNode;
  showError?: (title: string, message: string) => void;
  cacheTimeout?: number; // 缓存超时时间，默认5分钟
}

/**
 * 节点分类数据提供者组件
 */
export const NodeCategoriesProvider: React.FC<NodeCategoriesProviderProps> = ({
  children,
  showError,
  cacheTimeout = 5 * 60 * 1000 // 默认5分钟缓存
}) => {
  
  // 状态管理
  const [nodeCategories, setNodeCategories] = useState<NodeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  /**
   * 加载节点分类数据
   */
  const loadNodeCatalogs = async (forceRefresh = false) => {
    // 检查缓存是否有效
    const now = Date.now();
    if (!forceRefresh && nodeCategories.length > 0 && (now - lastFetchTime) < cacheTimeout) {
      logger.debug('使用缓存的节点分类数据', { 
        categoriesCount: nodeCategories.length,
        cacheAge: now - lastFetchTime 
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await handleAsyncOperationWithRetry(async () => {
      logger.info('开始加载节点分类数据', { forceRefresh });

      const response = await fetch(API_ENDPOINTS.NODES);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.dataSource || !Array.isArray(data.dataSource)) {
        throw new Error('节点数据格式错误');
      }

      // 转换和验证数据格式
      const transformedCategories: NodeCategory[] = data.dataSource
        .filter((category: any) => category && typeof category === 'object')
        .map((category: any) => {
          const nodes = Array.isArray(category.nodes) 
            ? category.nodes
                .filter((node: any) => node && typeof node === 'object' && node.kind)
                .map((node: any) => ({
                  kind: node.kind,
                  name: node.name || node.kind,
                  description: node.description || '',
                  icon: node.icon || '',
                  category: node.category || category.name,
                  categories: node.category ? [node.category] : [category.name],
                  version: node.version || '1.0.0',
                  nodeWidth: node.nodeWidth,
                  link: node.link
                }))
            : [];

          return {
            id: category.id || category.name || `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: category.name || '未命名分类',
            description: category.description,
            icon: category.icon || '',
            nodes
          };
        });

      return transformedCategories;
    }, 3, 1000, '加载节点分类数据失败');

    setIsLoading(false);

    if (result.success) {
      setNodeCategories(result.data);
      setLastFetchTime(now);
      setError(null);
    } else {
      const errorMessage = result.error;
      setError(errorMessage);
      logger.error('加载节点分类数据失败', errorMessage);
      
      if (showError) {
        showError('加载失败', '无法加载节点分类数据');
      }
    }
  };

  /**
   * 刷新数据
   */
  const refreshData = async (forceRefresh = false) => {
    await loadNodeCatalogs(forceRefresh);
  };

  /**
   * 清除缓存
   */
  const clearCache = () => {
    setNodeCategories([]);
    setLastFetchTime(0);
    setError(null);
    logger.info('清除节点分类缓存');
  };

  /**
   * 获取统计信息
   */
  const getStats = () => {
    const stats = {
      totalCategories: nodeCategories.length,
      totalNodes: nodeCategories.reduce((sum, cat) => sum + cat.nodes.length, 0),
      categoriesWithNodes: nodeCategories.filter(cat => cat.nodes.length > 0).length,
      emptyCategories: nodeCategories.filter(cat => cat.nodes.length === 0).length
    };

    return stats;
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadNodeCatalogs();
  }, []); // 只在组件挂载时执行一次

  // 使用 useMemo 确保稳定的引用，避免不必要的重新渲染
  const contextValue = useMemo(() => ({
    nodeCategories,
    isLoading,
    error,
    lastFetchTime,
    refreshData,
    clearCache,
    getStats
  }), [nodeCategories, isLoading, error, lastFetchTime]);

  return (
    <NodeCategoriesContext.Provider value={contextValue}>
      {children}
    </NodeCategoriesContext.Provider>
  );
};

/**
 * 使用节点分类数据的Hook
 */
export const useNodeCategories = () => {
  const context = useContext(NodeCategoriesContext);
  if (!context) {
    throw new Error('useNodeCategories must be used within NodeCategoriesProvider');
  }
  return context;
};

/**
 * 高阶组件：为组件提供节点分类数据
 */
export function withNodeCategories<P extends object>(
  Component: React.ComponentType<P & { nodeCategories: NodeCategory[] }>
) {
  const WrappedComponent = (props: P) => {
    const { nodeCategories } = useNodeCategories();
    
    return (
      <Component 
        {...props} 
        nodeCategories={nodeCategories}
      />
    );
  };

  WrappedComponent.displayName = `withNodeCategories(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// 导出类型
export type { NodeCategory, NodeInfo, NodeCategoriesContextType };