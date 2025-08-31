"use client";

import React, { useEffect, useState } from 'react';
import { SettingsPage } from '@repo/ui/main';
import { AppSettingsProvider } from '../../../src/providers/SettingsProvider';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast, ToastManager } from '@repo/ui';

interface ModelOption {
  value: string;
  label: string;
}

interface ConnectConfig {
  id: string;
  name: string;
  ctype: string;
}

// 会话检查组件
const SessionChecker: React.FC<{
  children: React.ReactNode;
  userId: string;
}> = ({ children, userId }) => {
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [sessionStatus, setSessionStatus] = useState<'checking' | 'valid' | 'expired' | 'warning'>('checking');
  const [showWarning, setShowWarning] = useState(false);

  // 获取用户设置
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/settings`);
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else if (response.status === 404) {
          // 用户不存在，需要重新登录
          console.error('用户不存在，需要重新登录');
          handleSessionExpired();
          return;
        } else {
          console.error('获取用户设置失败:', response.statusText);
          // 如果获取设置失败，使用默认设置
          setSettings({
            sessionTimeout: 480, // 默认8小时
            autoLogout: true,
            sessionWarning: true,
            warningTime: 5
          });
        }
      } catch (error) {
        console.error('获取用户设置错误:', error);
        // 检查是否是网络错误中的 USER_NOT_FOUND
        if (error instanceof Error && error.message.includes('USER_NOT_FOUND')) {
          console.error('用户不存在，需要重新登录');
          handleSessionExpired();
          return;
        }
        // 使用默认设置
        setSettings({
          sessionTimeout: 480,
          autoLogout: true,
          sessionWarning: true,
          warningTime: 5
        });
      }
    };

    if (userId) {
      fetchSettings();
    }
  }, [userId]);

  // 检查会话状态
  useEffect(() => {
    if (!settings) return;

    const checkSession = () => {
      // 如果设置为永不过期
      if (settings.sessionTimeout === 0) {
        setSessionStatus('valid');
        return;
      }

      // 从localStorage获取登录时间
      const loginTime = localStorage.getItem('loginTime');
      if (!loginTime) {
        // 如果没有登录时间记录，设置当前时间
        localStorage.setItem('loginTime', new Date().toISOString());
        setSessionStatus('valid');
        return;
      }

      const loginDate = new Date(loginTime);
      const now = new Date();
      const sessionDuration = settings.sessionTimeout * 60 * 1000; // 转换为毫秒
      const warningThreshold = settings.warningTime * 60 * 1000; // 提醒时间阈值

      const timeElapsed = now.getTime() - loginDate.getTime();
      const timeRemaining = sessionDuration - timeElapsed;

      if (timeRemaining <= 0) {
        // 会话已过期
        setSessionStatus('expired');
        if (settings.autoLogout) {
          handleSessionExpired();
        }
      } else if (timeRemaining <= warningThreshold && settings.sessionWarning) {
        // 会话即将过期
        setSessionStatus('warning');
        setShowWarning(true);
      } else {
        // 会话正常
        setSessionStatus('valid');
        setShowWarning(false);
      }
    };

    // 立即检查一次
    checkSession();

    // 每分钟检查一次会话状态
    const interval = setInterval(checkSession, 60000);

    return () => clearInterval(interval);
  }, [settings]);

  // 处理会话过期
  const handleSessionExpired = async () => {
    try {
      // 清除登录时间
      localStorage.removeItem('loginTime');

      // 登出并跳转到登录页面
      await signOut({
        callbackUrl: '/login',
        redirect: true
      });
    } catch (error) {
      console.error('登出失败:', error);
      // 强制跳转到登录页面
      router.push('/login');
    }
  };

  // 续期会话
  const renewSession = () => {
    localStorage.setItem('loginTime', new Date().toISOString());
    setSessionStatus('valid');
    setShowWarning(false);
  };

  // 手动登出
  const handleLogout = () => {
    handleSessionExpired();
  };

  if (sessionStatus === 'checking') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        正在检查会话状态...
      </div>
    );
  }

  if (sessionStatus === 'expired' && !settings?.autoLogout) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '16px'
      }}>
        <div style={{ fontSize: '18px', color: '#ef4444' }}>
          ⚠️ 会话已过期
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
          您的登录会话已过期，请重新登录以继续使用
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          重新登录
        </button>
      </div>
    );
  }

  return (
    <>
      {children}

      {/* 会话过期警告弹窗 */}
      {showWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#f59e0b',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚠️ 会话即将过期
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              您的登录会话将在 {settings?.warningTime} 分钟内过期。
              您可以选择续期会话或重新登录。
            </div>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                重新登录
              </button>
              <button
                onClick={renewSession}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                续期会话
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function SettingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;
  const [builtinModelSettings, setBuiltinModelSettings] = useState<{
    connectid?: string;
    model?: string;
    isAppend?: boolean;
  } | null>(null);
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();

  // 加载模型列表的回调函数
  const handleLoadModels = async (connectId: string): Promise<ModelOption[]> => {
    try {
      const { LLMMetadataService } = await import('@/services/llmMetadataService');
      // LLMMetadataService是静态类，直接调用静态方法
      const result = await LLMMetadataService.getModels(connectId);

      if (!result.success || !result.data) {
        console.error('获取模型列表失败:', result.error);
        return [];
      }

      const models: ModelOption[] = [];
      if (result.data) {
        result.data.forEach(item => {
          models.push({
            value: item.value,
            label: item.label
          });
        });
      }

      return models;
    } catch (error) {
      console.error('加载模型列表失败:', error);
      return [];
    }
  };

  // 处理路由跳转到连接页面
  const handleNavigateToConnections = () => {
    router.push('/workbench/connections');
  };

  // 加载系统设置
  useEffect(() => {
    const loadBuiltinModelSettings = async () => {
      try {
        const { SystemModelSettingService } = await import('@/services/systemModelSettingService');
        const result = await SystemModelSettingService.getSystemModelSetting('builtin-model');
        
        if (result.success && result.data?.tabDetails) {
          const settings = typeof result.data.tabDetails === 'string' 
            ? JSON.parse(result.data.tabDetails)
            : result.data.tabDetails;
          setBuiltinModelSettings(settings);
        }
      } catch (error) {
        console.error('加载内置模型设置失败:', error);
      }
    };
    
    loadBuiltinModelSettings();
  }, []);

  // 加载连接配置的回调函数
  const handleLoadConnections = async (): Promise<ConnectConfig[]> => {
    try {
      const { ConnectConfigService } = await import('@/services/connectConfigService');
      // 判断connectType如果是llm，则使用mtype参数，否则使用ctype参数
      const queryParam = { mtype: 'llm' };
      const result = await ConnectConfigService.getConnectConfigs(queryParam);
      if (!result.success) {
        throw new Error(result.error || '获取连接配置失败');
      }

      const mappedData = (result.data || []).map(item => {
        // selectconnect 只需要基本信息，不需要敏感的配置数据
        return {
          id: item.id || '',
          name: item.name,
          ctype: item.ctype,
          mtype: item.mtype || item.ctype, // 如果mtype为undefined，使用ctype作为默认值
          nodeinfo: {}, // 空对象，不包含任何敏感信息
          description: `${item.mtype || item.ctype} 连接 - ${item.name}`
        };
      });
      return mappedData;
    } catch (error) {
      return [];
    }
  };

  // 保存系统设置的回调函数
  const handleSaveSettings = async (tabkey: string, tabDetails: string): Promise<boolean> => {
    try {
      const { SystemModelSettingService } = await import('@/services/systemModelSettingService');
      const result = await SystemModelSettingService.saveSystemModelSetting({ tabkey, tabDetails });
      
      return result.success;
    } catch (error) {
      console.error('保存系统设置失败:', error);
      return false;
    }
  };

  // 设置登录时间（仅在首次登录时）
  useEffect(() => {
    if (session && !localStorage.getItem('loginTime')) {
      localStorage.setItem('loginTime', new Date().toISOString());
    }
  }, [session]);

  // 如果正在加载会话信息
  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        正在加载...
      </div>
    );
  }

  // 如果用户未登录，跳转到登录页面
  if (status === 'unauthenticated' || !session) {
    router.push('/login');
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        正在跳转到登录页面...
      </div>
    );
  }

  if (!userId) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#ef4444'
      }}>
        获取用户信息失败，请重新登录
      </div>
    );
  }

  return (
    <AppSettingsProvider userId={userId}>
      <SessionChecker userId={userId}>
        <SettingsPage
          onLoadModels={handleLoadModels}
          onLoadConnections={handleLoadConnections}
          onSaveSettings={handleSaveSettings}
          onNavigateToConnections={handleNavigateToConnections}
          builtinModelSettings={builtinModelSettings}
          onShowToast={{ showSuccess, showError, showWarning }}
        />
        <ToastManager toasts={toasts} onRemove={removeToast} />
      </SessionChecker>
    </AppSettingsProvider>
  );
}