"use client";

import { createGlobalStyle } from 'styled-components';
import { Theme } from '../themes';

export const GlobalThemeStyles = createGlobalStyle<{ theme: Theme }>`
  :root {
    /* 主题颜色变量 */
    --primary-color: ${props => props.theme.colors.primary};
    --secondary-color: ${props => props.theme.colors.secondary};
    --background-color: ${props => props.theme.page.colors.bgPrimary};
    --surface-color: ${props => props.theme.page.colors.bgSecondary};
    --text-primary: ${props => props.theme.page.colors.textPrimary};
    --text-secondary: ${props => props.theme.page.colors.textSecondary};
    --border-color: ${props => props.theme.page.colors.borderPrimary};
    --shadow-color: ${props => props.theme.page.colors.shadowColor};
    
    /* 布局颜色变量 */
    --layout-bg: ${props => props.theme.layout.colors.bgPrimary};
    --layout-text: ${props => props.theme.layout.colors.textPrimary};
    --layout-border: ${props => props.theme.layout.colors.borderPrimary};
    --layout-shadow: ${props => props.theme.layout.colors.shadowColor};
    
    /* 页面颜色变量 */
    --page-bg: ${props => props.theme.page.colors.bgPrimary};
    --page-text: ${props => props.theme.page.colors.textPrimary};
    --page-border: ${props => props.theme.page.colors.borderPrimary};
    --page-card-bg: ${props => props.theme.page.colors.cardBg};
    --page-card-border: ${props => props.theme.page.colors.borderSecondary};
  }

  * {
    box-sizing: border-box;
  }

  html {
    font-family: 'PingFang SC', 'Microsoft YaHei', 'SimSun', sans-serif;
    font-size: 14px;
    line-height: 1.5;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: var(--background-color);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--surface-color);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
    transition: background 0.3s ease;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }

  /* 选择文本样式 */
  ::selection {
    background-color: ${props => props.theme.mode === 'light' 
      ? 'rgba(36, 194, 140, 0.3)'  /* light模式：淡绿色背景 */
      : 'rgba(255, 255, 255, 0.3)' /* dark模式：淡白色背景 */
    };
    color: ${props => props.theme.colors.textPrimary};
  }

  /* Firefox 兼容性 */
  ::-moz-selection {
    background-color: ${props => props.theme.mode === 'light' 
      ? 'rgba(36, 194, 140, 0.3)'  /* light模式：淡绿色背景 */
      : 'rgba(255, 255, 255, 0.3)' /* dark模式：淡白色背景 */
    };
    color: ${props => props.theme.colors.textPrimary};
  }

  /* 焦点样式 */
  :focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }

  /* 链接样式 */
  a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.3s ease;
  }

  a:hover {
    color: var(--secondary-color);
  }

  /* 按钮基础样式 */
  button {
    cursor: pointer;
    border: none;
    background: none;
    transition: all 0.3s ease;
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* 输入框基础样式 */
  input, textarea, select {
    border: 1px solid var(--border-color);
    background-color: var(--surface-color);
    color: var(--text-primary);
    transition: border-color 0.3s ease, background-color 0.3s ease;
  }

  input:focus, textarea:focus, select:focus {
    border-color: var(--primary-color);
    outline: none;
  }

  /* 输入框文本选中样式 */
  input::selection, textarea::selection {
    background-color: ${props => props.theme.mode === 'light' 
      ? 'rgba(36, 194, 140, 0.3)'  /* light模式：淡绿色背景 */
      : 'rgba(255, 255, 255, 0.3)' /* dark模式：淡白色背景 */
    };
    color: ${props => props.theme.colors.textPrimary};
  }

  input::-moz-selection, textarea::-moz-selection {
    background-color: ${props => props.theme.mode === 'light' 
      ? 'rgba(36, 194, 140, 0.3)'  /* light模式：淡绿色背景 */
      : 'rgba(255, 255, 255, 0.3)' /* dark模式：淡白色背景 */
    };
    color: ${props => props.theme.colors.textPrimary};
  }

  /* 卡片基础样式 */
  .card {
    background-color: var(--page-card-bg);
    border: 1px solid var(--page-card-border);
    border-radius: 8px;
    box-shadow: 0 2px 4px ${props => props.theme.page.colors.shadowColor};
    transition: all 0.3s ease;
  }

  .card:hover {
    box-shadow: 0 4px 8px ${props => props.theme.page.colors.shadowColor};
  }
`;