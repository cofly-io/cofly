/**
 * 主题图标 Hook
 * 监听主题变化并更新节点图标
 * 该文件暂时不用
 */

import { useEffect, useState, useCallback } from 'react';
import { resolveThemedIcon, getCurrentTheme } from '../utils/iconUtils';
import { Icon } from '@repo/common';

/**
 * 使用主题化图标的 Hook
 * @param originalIcon 原始图标配置
 * @param nodeKind 节点类型
 * @returns 解析后的图标路径
 */
export function useThemedIcon(originalIcon: Icon, nodeKind: string): string {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => getCurrentTheme());
  const [resolvedIcon, setResolvedIcon] = useState<string>(() => 
    resolveThemedIcon(originalIcon, nodeKind, currentTheme)
  );

  // 监听主题变化
  useEffect(() => {
    const handleThemeChange = () => {
      const newTheme = getCurrentTheme();
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme);
        setResolvedIcon(resolveThemedIcon(originalIcon, nodeKind, newTheme));
      }
    };

    // 监听 document 的属性变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'data-theme' || mutation.attributeName === 'class')
        ) {
          handleThemeChange();
        }
      });
    });

    // 开始观察
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      // 只有在没有明确设置主题时才响应系统主题变化
      const explicitTheme = document.documentElement.getAttribute('data-theme');
      if (!explicitTheme) {
        handleThemeChange();
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [originalIcon, nodeKind, currentTheme]);

  return resolvedIcon;
}

/**
 * 批量更新节点图标的 Hook
 * @param nodes 节点数组
 * @param updateNodes 更新节点的函数
 */
export function useThemeIconUpdater<T extends { id: string; data: { icon: Icon; kind: string } }>(
  nodes: T[],
  updateNodes: (updater: (nodes: T[]) => T[]) => void
) {
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(() => getCurrentTheme());

  // 更新所有节点图标的函数
  const updateAllNodeIcons = useCallback((newTheme: 'light' | 'dark') => {
    updateNodes((prevNodes) =>
      prevNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          icon: resolveThemedIcon(node.data.icon, node.data.kind, newTheme)
        }
      }))
    );
  }, [updateNodes]);

  // 监听主题变化
  useEffect(() => {
    const handleThemeChange = () => {
      const newTheme = getCurrentTheme();
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme);
        updateAllNodeIcons(newTheme);
      }
    };

    // 监听 document 的属性变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'data-theme' || mutation.attributeName === 'class')
        ) {
          handleThemeChange();
        }
      });
    });

    // 开始观察
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      // 只有在没有明确设置主题时才响应系统主题变化
      const explicitTheme = document.documentElement.getAttribute('data-theme');
      if (!explicitTheme) {
        handleThemeChange();
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [currentTheme, updateAllNodeIcons]);

  return {
    currentTheme,
    updateAllNodeIcons
  };
}