import 'styled-components';
import { LightTheme } from './LightTheme';
import { DarkTheme } from './DarkTheme';

// 通用主题类型
export type Theme = LightTheme | DarkTheme;

// 扩展styled-components的DefaultTheme类型
// 使其支持我们的主题接口
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      tertiary: string;
      textPrimary: string;
      textSecondary: string;
      textTertiary: string;
      border: string;
      secondaryBorder: string;
      borderLight: string;
      borderHover: string;
      accent: string;
      accentHover: string;
      success: string;
      warning: string;
      error: string;
      info: string;
      sidebarBg: string;
      cardBg: string;
      headerBg: string;
      inputBg: string;
      buttonBg: string;
      buttonHover: string;
      flowBg: string;
      nodeBg: string;
      handleBg: string;
    };
    layout: {
      colors: {
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
      };
    };
    page: {
      colors: {
        // background: string;
        // text: string;
        // border: string;
        cardBg: string;
        // cardBorder: string;
        cardTitle: string;
        cardText: string;
        inputBg: string;
        inputBorder: string;
        inputText: string;
        inputPlaceholder: string;
        buttonBg: string;
        buttonBorder: string;
        buttonText: string;
        iconColor: string;
        textPrimary: string;
        textSecondary: string;
        textTertiary: string;
        bgPrimary: string;
        bgSecondary: string;
        bgTertiary: string;
        borderPrimary: string;
        borderSecondary: string;
        borderHover: string;
        buttonHover: string;
        accentColor: string;
        shadowColor: string;
        scrollbarTrack: string;
        scrollbarThumb: string;
        scrollbarThumbHover: string;
      };
    };
    panel: {
      panelBg: string;
      nodeBg: string;
      ctlBorder: string;
    };
    mode: 'light' | 'dark';
  }
}