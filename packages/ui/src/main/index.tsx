// 重导出所有工作台组件
export * from './layout';
// export * from './buttons';
export * from './search';
//export * from './connection-card';
export * from './flow';
export * from './home';
export * from './agent';
export * from './team';
export * from './connection';
export * from './components';
export * from '../components/basic/theme-switch';
export * from './settings';
export * from './profile';

// Theme exports
export * from '../themes';
export * from '../context/SettingsContext';
export * from '../context/GlobalThemeStyles';
export * from '../types/settings';

// Context providers
export { UnifiedThemeProvider, useTheme } from '../context/ThemeProvider';
export { default as SettingsProvider, useSettings } from '../context/SettingsContext';

// Backward compatibility aliases
export { UnifiedThemeProvider as ThemeProvider } from '../context/ThemeProvider';
export { UnifiedThemeProvider as GlobalThemeProvider } from '../context/ThemeProvider';
export { useTheme as useGlobalTheme } from '../context/ThemeProvider';