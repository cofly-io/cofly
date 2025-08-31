/**
 * 节点菜单组件 - 应用层包装组件
 * 
 * 这个组件是对packages/ui/src/main/flow/menu.tsx的应用层包装
 * 主要负责：
 * 1. 集成节点分类数据的获取和管理
 * 2. 处理应用特定的节点拖拽逻辑
 * 3. 提供节点菜单的状态管理
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// 导入UI层的WorkflowMenu组件
import { WorkflowMenu } from '@repo/ui/main/flow';

// 导入应用层工具和类型
import { logger, handleAsyncOperation } from '../../utils/errorHandling';
import { API_ENDPOINTS } from '../../utils/constants';
import { resolveThemedIcon, getCurrentTheme } from '../../utils/iconUtils';
import type { INodeBasic, CatalogType, Icon, NodeType } from '@cofly-ai/interfaces';
import { NodeCategory } from '../DataProviders';

interface NodeCatalog {
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
  version: string; // This is a string in the API response
  nodeWidth?: number;
  link?: any;
  nodeMode?: NodeType;
}

interface NodeMenuProps {
  onMenuCollapseChange?: (collapsed: boolean) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
}

/**
 * 应用层节点菜单组件
 */
export const NodeMenu: React.FC<NodeMenuProps> = ({
  onMenuCollapseChange,
  showError,
  // Removed showWarning from destructuring since it's not used
}) => {

  // 节点分类数据状态
  const [nodeCatalogs, setNodeCatalogs] = useState<NodeCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // 缓存时间（5分钟）
  const CACHE_DURATION = 5 * 60 * 1000;

  /**
   * 加载节点分类数据
   */
  const loadNodeCatalogs = useCallback(async (forceRefresh = false) => {
    // 检查缓存是否有效
    const now = Date.now();
    if (!forceRefresh && nodeCatalogs.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
      logger.debug('使用缓存的节点分类数据', {
        categoriesCount: nodeCatalogs.length,
        cacheAge: now - lastFetchTime
      });
      return;
    }

    setIsLoading(true);

    const result = await handleAsyncOperation(async () => {

      const response = await fetch(API_ENDPOINTS.NODES);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.dataSource || !Array.isArray(data.dataSource)) {
        throw new Error('节点数据格式错误');
      }
      // data.dataSource.forEach((category: any, index: number) => {
      // });

      // 转换数据格式
      const transformedCategories: NodeCategory[] = data.dataSource.map((category: any) => ({
        id: category.id || category.name,
        name: category.name,
        description: category.description,
        icon: category.icon,
        nodes: Array.isArray(category.nodes) ? category.nodes.map((node: any) => ({
          kind: node.kind,
          name: node.name,
          description: node.description,
          icon: node.icon,
          catalog: node.catalog || category.name, // 使用 catalog 字段
          category: node.catalog || node.category || category.name, // 保持向后兼容
          version: node.version || '1.0.0', // Keep as string here, convert to number later
          nodeWidth: node.nodeWidth,
          nodeMode: node.nodeMode,
          link: node.link
        })) : []
      }));

      return transformedCategories;
    }, '加载节点分类数据失败');

    setIsLoading(false);

    if (result.success) {
      setNodeCatalogs(result.data);
      setLastFetchTime(now);
    } else {
      logger.error('加载节点分类数据失败', result.error);
      showError('加载失败', '无法加载节点分类数据');
    }
  }, [nodeCatalogs.length, lastFetchTime, showError]);

  /**
   * 组件挂载时加载数据
   */
  useEffect(() => {
    loadNodeCatalogs();
  }, []); // 只在组件挂载时执行一次

  /**
   * 处理菜单折叠状态变化
   */
  const handleMenuCollapseChange = useCallback((collapsed: boolean) => {
    logger.debug('节点菜单折叠状态变化', { collapsed });

    if (onMenuCollapseChange) {
      onMenuCollapseChange(collapsed);
    }
  }, [onMenuCollapseChange]);

  /**
   * 刷新节点数据
   */
  const refreshNodeData = useCallback(() => {
    logger.info('手动刷新节点数据');
    loadNodeCatalogs(true);
  }, [loadNodeCatalogs]);

  /**
   * 转换数据格式以适配UI层
   */
  const uiNodeCatalogs = useMemo(() => {
    const currentTheme = getCurrentTheme();
    return nodeCatalogs.map((catalog, index) => {
      // Use original category.id to avoid duplicate keys, add index as fallback for uniqueness
      const categoryId = catalog.id || `category_${index}`;
      return {
        id: categoryId,
        name: catalog.name,
        description: catalog.description || '', // Ensure description is never undefined
        icon: catalog.icon,
        nodes: catalog.nodes.map(node => ({
          kind: node.kind,
          name: node.name,
          description: node.description,
          icon: node.icon as Icon, // 保持原始 icon 对象格式，让 menu 组件处理主题切换
          catalog: catalog.id as CatalogType || 'general',
          version: parseInt(node.version) || 1, // Convert version to number
          nodeWidth: node.nodeWidth,
          nodeMode: node.nodeMode,
          link: node.link
        }))
      };
    });
  }, [nodeCatalogs]);

  // Removed unused getNodeStats function

  // 如果正在加载且没有缓存数据，显示加载状态
  if (isLoading && nodeCatalogs.length === 0) {
    return (
      <div style={{ padding: '10px', fontSize: '13px', color: '#999' }}>
        工作流节点加载中...
      </div>
    );
  }

  // 如果加载失败且没有缓存数据，显示错误状态
  if (!isLoading && nodeCatalogs.length === 0) {
    return (
      <div style={{ padding: '10px', fontSize: '13px', color: '#ff4d4f' }}>
        <div>节点数据加载失败</div>
        <button
          onClick={refreshNodeData}
          style={{
            marginTop: '8px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <WorkflowMenu
      dataSource={uiNodeCatalogs}
      onMenuCollapseChange={handleMenuCollapseChange}
    />
  );
};

export default NodeMenu;