// Dark Theme Configuration
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

export interface DarkTheme {
  colors: ThemeColors;
  layout: {
    colors: LayoutColors;
  };
  page: {
    colors: PageColors;
  };
  panel: ThemePanel;
  mode: 'dark';
}

// Dark theme configuration - 保持原有dark主题的一致性
export const darkTheme: DarkTheme = {
  mode: 'dark',
  colors: {
    // Background colors - 黑色和灰色系
    primary: '#2d2d2d', // 深黑色主背景
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
  
  // Layout colors extracted from workbench/layout.tsx
  layout: {
    colors: {
      textPrimary: '#ffffff',
      bgPrimary: '#2d2d2d',
      bgSecondary: '#333333',
      borderPrimary: 'rgba(255, 255, 255, 0.1)',
      sidebarBg: '#2d2d2d',
      sidebarBorder: 'rgba(255, 255, 255, 0.1)',
      iconColor: '#bfbfbf',
      iconActiveColor: '#ffffff',
      iconBg: '#d1d1d1',
      iconActiveBg: 'rgba(59, 130, 246, 0.25)',
      labelColor: '#ffffff',
      labelActiveColor: '#ffffff',
      toggleBg: '#3a3a3a',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
    },
  },
  
  // Page colors extracted from main components
  page: {
    colors: {
      // background: '#2d2d2d',
      // text: '#ffffff',
      // border: '#878787',
      // cardBorder: 'rgba(255, 255, 255, 0.1)',
      textPrimary: '#ffffff',
      textSecondary: '#cccccc',
      textTertiary: '#999999',
      bgPrimary: '#2d2d2d',
      bgSecondary: '#333333',
      bgTertiary: '#3a3a3a',
      borderPrimary: '#878787',
      borderSecondary: 'rgba(255, 255, 255, 0.1)',
      borderHover: '#4a4a4a',
      cardBg: '#2d2d2d',
      cardTitle: '#ffffff',
      cardText: '#cccccc',
      inputBg: '#3a3a3a',
      inputBorder: '#878787',
      inputText: '#ffffff',
      inputPlaceholder: '#999999',
      buttonBg: '#3a3a3a',
      buttonHover: '#4a4a4a',
      buttonBorder: '#878787',
      buttonText: '#ffffff',
      accentColor: '#33C2EE',
      iconColor: '#cccccc',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      scrollbarTrack: 'rgba(255, 255, 255, 0.05)',
      scrollbarThumb: 'rgba(255, 255, 255, 0.2)',
      scrollbarThumbHover: 'rgba(255, 255, 255, 0.3)',
    }
  },
  
  panel: {
    panelBg: '#132a43',
    nodeBg: '#0a1a2a',
    ctlBorder: '#1a5199',
  }
};