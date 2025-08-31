"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

import { UserSettings, ApiResponse, SystemSettingsService, defaultSettings } from '../types/settings';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  syncToServer: () => Promise<void>;
  testApiConnection: (type: 'cofly' | 'openai' | 'custom', config: any) => Promise<ApiResponse<{ status: string }>>;
  exportData: () => Promise<void>;
  importData: (data: any) => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
  userId?: string; // 用户ID，用于服务器同步
  settingsService?: SystemSettingsService; // 设置服务，由外部注入
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  userId,
  settingsService
}) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // LocalStorage key
  const getStorageKey = () => userId ? `user_settings_${userId}` : 'user_settings_guest';

  // 从LocalStorage加载设置
  const loadFromLocalStorage = (): UserSettings => {
    if (typeof window === 'undefined') return defaultSettings;

    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
    }
    return defaultSettings;
  };

  // 保存到LocalStorage
  const saveToLocalStorage = (newSettings: UserSettings) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  };

  // 从服务器加载设置
  const loadFromServer = async (): Promise<UserSettings | null> => {
    if (!userId || !settingsService) return null;

    try {
      setIsLoading(true);
      setSyncError(null);
      const response = await settingsService.getSystemSettings(userId);

      if (response.success && response.data) {
        setLastSyncTime(new Date());
        return { ...defaultSettings, ...response.data };
      } else {
        
        if (response.error === 'USER_NOT_FOUND') {
          // 用户不存在，设置错误状态但不直接跳转
          setSyncError('USER_SESSION_INVALID');
          
          // 返回默认设置，让上层组件处理认证状态
          return defaultSettings;
        }
        setSyncError(response.error || 'Failed to load settings');
      }
    } catch (error) {
      console.error('Failed to load settings from server:', error);
      setSyncError('Network error');
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  // 同步到服务器
  const syncToServer = useCallback(async (settingsToSync?: UserSettings): Promise<void> => {
    if (!userId || !settingsService) return;

    // 使用传入的设置或当前设置
    const currentSettings = settingsToSync || settings;

    try {
      setIsSyncing(true);
      setSyncError(null);
      const response = await settingsService.updateSystemSettings(userId, currentSettings);

      if (response.success) {
        setLastSyncTime(new Date());
      } else {
        if (response.error === 'USER_NOT_FOUND') {
          // 用户不存在，设置错误状态让上层组件处理
          setSyncError('USER_SESSION_INVALID');
          return;
        }
        setSyncError(response.error || 'Failed to sync settings');
        throw new Error(response.error);
      }
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Network error');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [userId, settingsService]);

  // 防抖同步
  const debouncedSync = useCallback(
    debounce(async (settingsToSync: UserSettings) => {
      if (userId && settingsService) {
        try {
          await syncToServer(settingsToSync);
        } catch (error) {
          // 错误已在syncToServer中处理
        }
      }
    }, 1000),
    [userId, settingsService, syncToServer]
  );

  // 初始化设置
  useEffect(() => {
    const initializeSettings = async () => {
      
      // 首先从LocalStorage加载
      const localSettings = loadFromLocalStorage();
      setSettings(localSettings);

      // 只有在有用户ID且用户已认证时，才尝试从服务器加载
      if (userId && userId !== 'undefined' && userId.trim() !== '') {
        const serverSettings = await loadFromServer();
        if (serverSettings) {
          // 合并本地和服务器设置，本地设置优先（用户可能已经在本地修改了主题）
          const mergedSettings = { ...serverSettings, ...localSettings };
          setSettings(mergedSettings);
          saveToLocalStorage(mergedSettings);

          // 如果本地设置与服务器不同，同步到服务器
          if (JSON.stringify(localSettings) !== JSON.stringify(serverSettings)) {
            try {
              await syncToServer(mergedSettings);
            } catch (error) {
              // 错误已在syncToServer中处理
            }
          }
        }
      } else {
        // 清除任何之前的同步错误
        setSyncError(null);
      }

      setIsLoading(false);
    };

    initializeSettings();
  }, [userId, syncToServer]);

  // 更新设置
  const updateSettings = async (updates: Partial<UserSettings>): Promise<void> => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    // 立即保存到LocalStorage
    saveToLocalStorage(newSettings);

    // 如果是主题更新，强制重新渲染页面样式
    if (updates.theme && typeof window !== 'undefined') {
      // 触发样式重新计算
      document.documentElement.style.setProperty('--theme-update', Date.now().toString());

      // 强制重新渲染 styled-components
      const event = new CustomEvent('themechange', {
        detail: { theme: updates.theme }
      });
      window.dispatchEvent(event);
    }

    // 如果有用户ID和设置服务，防抖同步到服务器
    if (userId && settingsService) {
      debouncedSync(newSettings);
    }
  };

  // 重置设置
  const resetSettings = async (): Promise<void> => {
    setSettings(defaultSettings);
    saveToLocalStorage(defaultSettings);

    // 如果有用户ID和设置服务，同步到服务器
    if (userId && settingsService) {
      try {
        await syncToServer(defaultSettings);
      } catch (error) {
        // 错误已在syncToServer中处理
      }
    }
  };

  // API连接测试
  const testApiConnection = async (type: 'cofly' | 'openai' | 'custom', config: any): Promise<ApiResponse<{ status: string }>> => {
    if (!settingsService) {
      return { success: false, error: 'Settings service not available' };
    }

    try {
      return await settingsService.testApiConnection(type, config);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  };

  // 导出数据
  const exportData = async (): Promise<void> => {
    try {
      const exportData = {
        settings,
        exportTime: new Date().toISOString(),
        version: '1.0'
      };
      downloadJson(exportData, `cofly-settings-${new Date().toISOString().split('T')[0]}.json`);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  };

  // 导入数据
  const importData = async (data: any): Promise<void> => {
    try {
      if (data.settings) {
        await updateSettings(data.settings);
      }
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        syncToServer: () => syncToServer(),
        testApiConnection,
        exportData,
        importData,
        isLoading,
        isSyncing,
        lastSyncTime,
        syncError
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// 辅助函数
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

function downloadJson(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default SettingsProvider;