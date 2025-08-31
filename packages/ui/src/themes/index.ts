import { darkTheme, DarkTheme } from './DarkTheme';
import { lightTheme, LightTheme } from './LightTheme';
import type { Theme } from './styled';

export { darkTheme, lightTheme };
export type { DarkTheme, LightTheme, Theme };

// Theme constants
export const THEME_MODES = {
  LIGHT: 'light' as const,
  DARK: 'dark' as const,
};

export type ThemeMode = typeof THEME_MODES[keyof typeof THEME_MODES];