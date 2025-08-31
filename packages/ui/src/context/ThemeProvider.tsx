"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { Theme, lightTheme, darkTheme, ThemeMode, THEME_MODES } from '../themes';
import { GlobalThemeStyles } from './GlobalThemeStyles';
import { SettingsProvider, useSettings } from './SettingsContext';
import { SystemSettingsService } from '../types/settings';

// 统一的主题上下文类型
interface UnifiedThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isLoading: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
}

const UnifiedThemeContext = createContext<UnifiedThemeContextType | undefined>(undefined);

// 初始化主题函数，支持从 localStorage 读取
const getInitialTheme = (defaultTheme: ThemeMode): ThemeMode => {
  if (typeof window === 'undefined') {
    return defaultTheme;
  }
  
  try {
    // 查找所有用户设置
    const userSettingsKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('user_settings_')
    );
    
    // 如果有用户设置，优先查找最新的设置
    if (userSettingsKeys.length > 0) {
      for (const key of userSettingsKeys) {
        try {
          const userSettings = localStorage.getItem(key);
          if (userSettings) {
            const settings = JSON.parse(userSettings);
            const savedTheme = settings.theme;
            if (savedTheme === THEME_MODES.LIGHT || savedTheme === THEME_MODES.DARK) {
              return savedTheme;
            }
          }
        } catch (keyError) {
          console.warn(`Failed to parse settings for key ${key}:`, keyError);
          continue;
        }
      }
    }
    
    // 如果没有找到用户设置，尝试查找guest设置
    const guestSettings = localStorage.getItem('user_settings_guest');
    if (guestSettings) {
      const settings = JSON.parse(guestSettings);
      const savedTheme = settings.theme;
      if (savedTheme === THEME_MODES.LIGHT || savedTheme === THEME_MODES.DARK) {
        return savedTheme;
      }
    }
  } catch (error) {
    console.warn('Failed to parse user settings:', error);
  }
  
  return defaultTheme;
};

// 轻量级主题组件（不依赖设置服务）
interface LightweightThemeWrapperProps {
  children: ReactNode;
  defaultTheme: ThemeMode;
}

const LightweightThemeWrapper: React.FC<LightweightThemeWrapperProps> = ({ 
  children, 
  defaultTheme 
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => getInitialTheme(defaultTheme));

  // 监听主题变化事件
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleThemeChange = (event: CustomEvent) => {
        if (event.detail?.theme && event.detail.theme !== themeMode) {
          setThemeMode(event.detail.theme);
        }
      };
      
      const handleStorageChange = () => {
        const newTheme = getInitialTheme(defaultTheme);
        if (newTheme !== themeMode) {
          setThemeMode(newTheme);
        }
      };
      
      // 监听自定义主题变化事件
      window.addEventListener('themechange', handleThemeChange as EventListener);
      // 监听storage事件（跨标签页变化）
      window.addEventListener('storage', handleStorageChange);
      
      // 定期检查localStorage变化（兜底机制）
      const intervalId = setInterval(() => {
        const newTheme = getInitialTheme(defaultTheme);
        if (newTheme !== themeMode) {
          setThemeMode(newTheme);
        }
      }, 1000);
      
      return () => {
        window.removeEventListener('themechange', handleThemeChange as EventListener);
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(intervalId);
      };
    }
  }, [themeMode, defaultTheme]);

  const toggleTheme = () => {
    const newTheme = themeMode === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT;
    setThemeMode(newTheme);
    
    // 更新 localStorage
    if (typeof window !== 'undefined') {
      try {
        const guestSettings = localStorage.getItem('user_settings_guest');
        const settings = guestSettings ? JSON.parse(guestSettings) : {};
        settings.theme = newTheme;
        localStorage.setItem('user_settings_guest', JSON.stringify(settings));
        
        // 触发自定义事件
        const event = new CustomEvent('themechange', { detail: { theme: newTheme } });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('Failed to update theme in localStorage:', error);
      }
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    
    // 更新 localStorage
    if (typeof window !== 'undefined') {
      try {
        const guestSettings = localStorage.getItem('user_settings_guest');
        const settings = guestSettings ? JSON.parse(guestSettings) : {};
        settings.theme = mode;
        localStorage.setItem('user_settings_guest', JSON.stringify(settings));
        
        // 触发自定义事件
        const event = new CustomEvent('themechange', { detail: { theme: mode } });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('Failed to update theme in localStorage:', error);
      }
    }
  };

  const currentTheme = themeMode === THEME_MODES.LIGHT ? lightTheme : darkTheme;

  const value: UnifiedThemeContextType = {
    theme: currentTheme,
    themeMode,
    toggleTheme,
    setTheme,
    isLoading: false,
    lastSyncTime: null,
    syncError: null,
  };

  return (
    <UnifiedThemeContext.Provider value={value}>
      <StyledThemeProvider theme={currentTheme}>
        <GlobalThemeStyles theme={currentTheme} />
        {children}
      </StyledThemeProvider>
    </UnifiedThemeContext.Provider>
  );
};

// 完整功能主题组件（依赖设置服务）
interface FullFeatureThemeWrapperProps {
  children: ReactNode;
}

const FullFeatureThemeWrapper: React.FC<FullFeatureThemeWrapperProps> = ({ children }) => {
  const { settings, updateSettings, isLoading, lastSyncTime, syncError } = useSettings();

  // 监听主题变化，触发自定义事件
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('themechange', { detail: { theme: settings.theme } });
      window.dispatchEvent(event);
    }
  }, [settings.theme, isLoading, syncError]);

  const toggleTheme = () => {
    const newTheme = settings.theme === THEME_MODES.LIGHT ? THEME_MODES.DARK : THEME_MODES.LIGHT;
    updateSettings({ theme: newTheme });
  };

  const setTheme = (mode: ThemeMode) => {
    updateSettings({ theme: mode });
  };

  const currentTheme = settings.theme === THEME_MODES.LIGHT ? lightTheme : darkTheme;

  const value: UnifiedThemeContextType = {
    theme: currentTheme,
    themeMode: settings.theme,
    toggleTheme,
    setTheme,
    isLoading,
    lastSyncTime,
    syncError,
  };

  return (
    <UnifiedThemeContext.Provider value={value}>
        <StyledThemeProvider theme={currentTheme}>
          <GlobalThemeStyles theme={currentTheme} />
          {children}
        </StyledThemeProvider>
      </UnifiedThemeContext.Provider>
  );
};

// 统一的主题提供者接口
interface UnifiedThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  userId?: string;
  settingsService?: SystemSettingsService;
  lightweight?: boolean; // 是否使用轻量级模式
}

export const UnifiedThemeProvider: React.FC<UnifiedThemeProviderProps> = ({
  children,
  defaultTheme = THEME_MODES.LIGHT,
  userId,
  settingsService,
  lightweight = false
}) => {
  // 如果指定轻量级模式或没有提供用户ID和设置服务，使用轻量级组件
  if (lightweight || !userId || !settingsService) {
    return (
      <LightweightThemeWrapper defaultTheme={defaultTheme}>
        {children}
      </LightweightThemeWrapper>
    );
  }

  // 否则使用完整功能组件
  return (
    <SettingsProvider userId={userId} settingsService={settingsService}>
      <FullFeatureThemeWrapper>
        {children}
      </FullFeatureThemeWrapper>
    </SettingsProvider>
  );
};

// 统一的主题钩子
export const useTheme = (): UnifiedThemeContextType => {
  const context = useContext(UnifiedThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a UnifiedThemeProvider');
  }
  return context;
};

// 向后兼容的导出
export const ThemeProvider = UnifiedThemeProvider;
export const GlobalThemeProvider = UnifiedThemeProvider;
export const useGlobalTheme = useTheme;

export default UnifiedThemeProvider;