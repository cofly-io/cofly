/**
 * 图标工具函数
 * 处理主题化图标路径的解析和转换
 */

import { Icon } from '@repo/common';

/**
 * 解析主题化图标，返回适合当前主题的图标路径
 * @param icon 图标配置（可能是字符串或主题化对象）
 * @param nodeKind 节点类型
 * @param theme 当前主题 ('light' | 'dark')
 * @param catalog 节点分类（可选）
 * @returns 解析后的图标路径
 */
export function resolveThemedIcon(icon: Icon, nodeKind: string, theme: 'light' | 'dark' = 'light', catalog?: string): string {
  // 如果是字符串，直接使用
  if (typeof icon === 'string') {
    return catalog ? `/nodes/${catalog}/${nodeKind}/${icon}` : `/nodes/${nodeKind}/${icon}`;
  }
  
  // 如果是主题化对象，根据当前主题选择
  if (typeof icon === 'object' && icon !== null) {
    const themedIcon = icon[theme] || icon.light || icon.dark;
    if (themedIcon) {
      return catalog ? `/nodes/${catalog}/${nodeKind}/${themedIcon}` : `/nodes/${nodeKind}/${themedIcon}`;
    }
  }
  
  // 降级处理：使用默认图标
  return catalog ? `/nodes/${catalog}/${nodeKind}/${nodeKind}.svg` : `/nodes/${nodeKind}/${nodeKind}.svg`;
}

/**
 * 获取当前主题
 * 从 document 或其他地方获取当前主题设置
 * @returns 当前主题
 */
export function getCurrentTheme(): 'light' | 'dark' {
    // 检查 document 的 data-theme 属性
    if (typeof document !== 'undefined') {
        const theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark' || theme === 'light') {
            return theme;
        }

        // 检查 class 属性
        if (document.documentElement.classList.contains('dark')) {
            return 'dark';
        }

        // 检查系统偏好
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    }

    // 默认返回浅色主题
    return 'light';
}

/**
 * 为节点数据解析图标路径
 * @param nodeData 节点数据
 * @param theme 主题
 * @param catalog 节点分类（可选）
 * @returns 带有解析后图标路径的节点数据
 */
export function resolveNodeIcon<T extends { icon: Icon; kind: string; catalog?: string }>(
    nodeData: T,
    theme?: 'light' | 'dark',
    catalog?: string
): T & { resolvedIcon: string } {
    const currentTheme = theme || getCurrentTheme();
    const nodeDataCatalog = catalog || nodeData.catalog;
    const resolvedIcon = resolveThemedIcon(nodeData.icon, nodeData.kind, currentTheme, nodeDataCatalog);

    return {
        ...nodeData,
        resolvedIcon
    };
}

/**
 * 批量解析节点图标
 * @param nodes 节点数组
 * @param theme 主题
 * @param catalog 节点分类（可选）
 * @returns 带有解析后图标的节点数组
 */
export function resolveNodesIcons<T extends { icon: Icon; kind: string; catalog?: string }>(
    nodes: T[],
    theme?: 'light' | 'dark',
    catalog?: string
): Array<T & { resolvedIcon: string }> {
    const currentTheme = theme || getCurrentTheme();

    return nodes.map(node => resolveNodeIcon(node, currentTheme, catalog));
}