/**
 * 设计令牌 - 统一样式常量
 * Design Tokens - Unified Style Constants
 */

export const DESIGN_TOKENS = {
  // 颜色系统 Color System
  colors: {
    // 主色调 Primary Colors
    liquid: '#3b82f6',
    liquidHover: '#2563eb',
    liquidActive: '#1d4ed8',
    liquidDisabled: '#93c5fd',

    // 成功色 Success Colors
    success: '#10b981',
    successHover: '#059669',
    successLight: '#d1fae5',

    // 错误色 Error Colors
    error: '#ef4444',
    errorHover: '#dc2626',
    errorLight: '#fee2e2',

    // 警告色 Warning Colors
    warning: '#f59e0b',
    warningHover: '#d97706',
    warningLight: '#fef3c7',

    // 中性色 Neutral Colors
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },

    // 边框色 Border Colors
    border: '#e5e7eb',
    borderHover: '#d1d5db',
    borderFocus: '#3b82f6',
    borderError: '#ef4444',

    // 背景色 Background Colors
    background: '#ffffff',
    backgroundDisabled: '#f3f4f6',
    backgroundHover: '#f9fafb',
    
    // 玻璃效果背景 Glass Effect Backgrounds
    glass: {
      primary: 'rgba(255, 255, 255, 0.08)',
      secondary: 'rgba(255, 255, 255, 0.12)',
      hover: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.15)',
      borderHover: 'rgba(255, 255, 255, 0.25)',
    },

    // 文本色 Text Colors
    text: {
      liquid: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      disabled: '#d1d5db',
      placeholder: '#9ca3af',
      inverse: '#ffffff',
    },
  },

  // 字体系统 Typography System
  typography: {
    // 字体大小 Font Sizes
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
    },

    // 字体重量 Font Weights
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    // 行高 Line Heights
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // 间距系统 Spacing System
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
  },

  // 圆角系统 Border Radius System
  borderRadius: {
    none: '0px',
    sm: '2px',
    md: '4px',
    lg: '6px',
    xl: '8px',
    '2xl': '12px',
    full: '9999px',
  },

  // 阴影系统 Shadow System
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    focus: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    focusError: '0 0 0 3px rgba(239, 68, 68, 0.1)',
    
    // 玻璃效果阴影 Glass Effect Shadows
    glass: {
      card: '0 10px 30px rgba(0, 0, 0, 0.2)',
      cardHover: '0 15px 40px rgba(0, 0, 0, 0.3)',
    },
  },
  
  // 模糊效果 Blur Effects
  blur: {
    sm: 'blur(4px)',
    md: 'blur(8px)',
    lg: 'blur(12px)',
    xl: 'blur(16px)',
  },

  // 过渡动画 Transitions
  transitions: {
    fast: '0.15s ease-in-out',
    normal: '0.2s ease-in-out',
    slow: '0.3s ease-in-out',
  },

  // 控件尺寸 Control Sizes
  sizes: {
    // 高度 Heights
    height: {
      xs: '24px',
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '56px',
    },

    // 宽度 Widths
    width: {
      xs: '80px',
      sm: '120px',
      md: '200px',
      lg: '280px',
      xl: '360px',
      full: '100%',
    },
  },

  // 主题模式 Theme Modes
  themes: {
    light: {
      background: '#ffffff',
      text: '#111827',
      border: '#e5e7eb',
    },
    dark: {
      background: '#111827',
      text: '#f9fafb',
      border: '#374151',
    },
  },
} as const;

// 类型导出 Type Exports
export type DesignTokens = typeof DESIGN_TOKENS;
export type ColorKeys = keyof typeof DESIGN_TOKENS.colors;
export type SizeKeys = keyof typeof DESIGN_TOKENS.sizes.height;
export type SpacingKeys = keyof typeof DESIGN_TOKENS.spacing;