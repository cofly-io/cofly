// Light Theme Configuration
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
  secondaryBorder: string;
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

export interface LayoutColors {
  // Layout specific colors from workbench/layout.tsx
  textPrimary: string;
  bgPrimary: string;
  bgSecondary: string;
  borderPrimary: string;
  sidebarBg: string;
  sidebarBorder: string;
  iconColor: string;
  iconActiveColor: string;
  iconBg: string;
  iconActiveBg: string;
  labelColor: string;
  labelActiveColor: string;
  toggleBg: string;
  shadowColor: string;
}

export interface PageColors {
  // Page specific colors from main components
  // background: string;
  // text: string;
  // border: string;
  // cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  borderPrimary: string;
  borderSecondary: string;
  borderHover: string;
  cardBg: string;
  cardTitle: string;
  cardText: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  buttonBg: string;
  buttonHover: string;
  buttonBorder: string;
  buttonText: string;
  accentColor: string;
  iconColor: string;
  shadowColor: string;
  scrollbarTrack: string;
  scrollbarThumb: string;
  scrollbarThumbHover: string;
}

export interface LightTheme {
  colors: ThemeColors;
  layout: {
    colors: LayoutColors;
  };
  page: {
    colors: PageColors;
  };
  panel: ThemePanel;
  mode: 'light';
}

// Light theme configuration - 使用新的颜色方案
// 主要颜色：#24C28C, #00B6A2, #00A5B7, #257DAF, #4361A7, #62408A
export const lightTheme: LightTheme = {
  mode: 'light',
  colors: {
    // Background colors - 浅色系
    primary: '#f9fafb', // 极浅灰色主背景
    secondary: '#ffffff', // 纯白色
    tertiary: '#f3f4f6', // 浅灰色

    // Text colors - 深色系文字
    textPrimary: '#1f2937', // 深灰色主文字
    textSecondary: '#6b7280', // 中灰色次要文字
    textTertiary: '#bfbfbf', // 浅灰色辅助文字


    // Border colors - 浅灰色系边框
    border: '#a3a3a3', // 浅灰色边框
    secondaryBorder: '#d1d5db', // 中灰色边框
    borderLight: '#f3f4f6', // 极浅灰色边框
    borderHover: '#24C28C', // hover时使用主色调

    // Interactive colors - 使用新的颜色方案
    accent: '#24C28C', // 主要强调色
    accentHover: '#00B6A2', // hover状态

    // Status colors
    success: '#24C28C',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#257DAF',

    // Specific UI colors
    sidebarBg: '#ffffff',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    inputBg: '#ffffff',
    buttonBg: '#ffffff',
    buttonHover: '#f9fafb',

    // ReactFlow specific colors
    flowBg: '#ffffff',
    nodeBg: '#ffffff',
    handleBg: '#ffffff',
  },

  // Layout colors for workbench/layout.tsx
  layout: {
    colors: {
      textPrimary: '#1f2937',
      bgPrimary: '#ffffff',
      bgSecondary: '#f9fafb',
      borderPrimary: '#e5e7eb',
      sidebarBg: '#ffffff',
      sidebarBorder: '#e5e7eb',
      iconColor: '#00A5B7',
      iconActiveColor: '#24c28c',
      iconBg: '#00B6A2',
      iconActiveBg: 'rgba(36, 194, 140, 0.25)',
      labelColor: '#00C6E0',
      labelActiveColor: '#24C28C',
      toggleBg: '#f3f4f6',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
    },
  },

  // Page colors for main components
  page: {
    colors: {
      // background: '#ffffff',
      // text: '#1f2937',
      // border: '#e5e7eb',
      // cardBorder: '#e5e7eb',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      textTertiary: '#9ca3af',
      bgPrimary: '#ffffff',
      bgSecondary: '#f9fafb',
      bgTertiary: '#f3f4f6',
      borderPrimary: '#e5e7eb',
      borderSecondary: '#d1d5db',
      borderHover: '#24C28C',
      cardBg: '#ffffff',
      cardTitle: '#4361A7',
      cardText: '#6B7280',
      inputBg: '#ffffff',
      inputBorder: '#e5e7eb',
      inputText: '#1f2937',
      inputPlaceholder: '#94a3b8',
      buttonBg: '#24C28C',
      buttonHover: '#00B6A2',
      buttonBorder: 'rgba(36, 194, 140, 0.4)',
      buttonText: '#ffffff',
      accentColor: '#24C28C',
      iconColor: '#94a3b8',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      scrollbarTrack: 'rgba(0, 0, 0, 0.05)',
      scrollbarThumb: 'rgba(0, 0, 0, 0.2)',
      scrollbarThumbHover: 'rgba(0, 0, 0, 0.3)',
    },
  },

  panel: {
    panelBg: '#ffffff',
    nodeBg: '#ffffff',
    ctlBorder: '#24C28C',
  }
};