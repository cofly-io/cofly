// Theme McpInterfaces.ts
export interface ThemeColors {
  // Background colors
  primary: string;
  secondary: string;
  tertiary: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;

  // Border colors
  border: string;
  secondaryBorder:string;
  borderLight: string;
  borderHover: string;

  // Interactive colors
  accent: string;
  accentHover: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Specific UI colors
  sidebarBg: string;
  cardBg: string;
  headerBg: string;
  inputBg: string;
  buttonBg: string;
  buttonHover: string;

  // ReactFlow specific colors
  flowBg: string;
  nodeBg: string;
  handleBg: string;
}

export interface ThemePanel {
  panelBg: string;
  nodeBg: string;
  ctlBorder: string;
}

export interface Theme {
  colors: ThemeColors;
  mode: 'light' | 'dark';
  panel: ThemePanel;
}

// Light theme
export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    // Background colors
    primary: '#f9f9f9',
    secondary: '#ffffff',
    tertiary: '#f5f5f5',

    // Text colors
    textPrimary: '#8a8a8a',
    textSecondary: '#666666',
    textTertiary: '#999999',

    // Border colors
    border: '#e0e0e0',
    secondaryBorder: '#bfbfbf', // 浅灰色边框
    borderLight: '#f0f0f0',
    borderHover: '#d0d0d0',

    // Interactive colors
    accent: '#33C2EE',
    accentHover: '#2aa5c7',

    // Status colors
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',

    // Specific UI colors
    sidebarBg: '#ffffff',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    inputBg: '#ffffff',
    buttonBg: '#ffffff',
    buttonHover: '#f5f5f5',

    // ReactFlow specific colors
    flowBg: '#ffffff',
    nodeBg: '#ffffff',
    handleBg: '#ffffff',
  },
  panel: {
    panelBg: '#ffffff',
    nodeBg: '#ffffff',
    ctlBorder: '#bfbfbf',
  }
};

// Dark theme - 黑色和灰色系配色
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    // Background colors - 灰色系
    // primary: '#000000', // 炭灰色
    // secondary: '#333333', // 中灰色
    // tertiary: '#3a3a3a', // 浅灰色
    
    // Background colors - 黑色和灰色系
    primary: '#2d2d2d', // 深黑色主背景333F50
    secondary: '#333333', // 深灰色
    tertiary: '#3a3a3a', // 中灰色

    // Text colors - 白色系文字
    textPrimary: '#ffffff', // 纯白色主文字
    textSecondary: '#cccccc', // 浅灰色次要文字
    textTertiary: '#999999', // 中灰色辅助文字

    // Border colors - 灰色系边框
    border: '#878787', // 中灰色边框
    secondaryBorder: '#2a3545', // 浅灰色边框
    borderLight: '#353535', // 浅灰色边框
    borderHover: '#4a4a4a', // hover时的边框

    // Interactive colors - 保持蓝色强调色
    accent: '#33C2EE',
    accentHover: '#2aa5c7',

    // Status colors - 稍微调亮的状态色
    success: '#4caf50',
    warning: '#ffa726',
    error: '#ef5350',
    info: '#42a5f5',

    // Specific UI colors - 灰色系UI元素
    sidebarBg: '#2d2d2d', // 深灰色侧边栏
    cardBg: '#2d2d2d', // 深灰色卡片背景
    headerBg: '#2d2d2d', // 深灰色头部背景
    inputBg: '#3a3a3a', // 中灰色输入框背景
    buttonBg: '#3a3a3a', // 中灰色按钮背景
    buttonHover: '#4a4a4a', // hover时的按钮背景

    // ReactFlow specific colors
    flowBg: '#ffffff',
    nodeBg: '#ffffff',
    handleBg: '#ffffff',
  },
  panel: {
    panelBg: '#132a43',
    nodeBg: '#0a1a2a',
    ctlBorder: '#1a5199',
  }
};

// Theme constants
export const THEME_MODES = {
  LIGHT: 'light' as const,
  DARK: 'dark' as const,
};

export type ThemeMode = typeof THEME_MODES[keyof typeof THEME_MODES]; 