"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SessionSettings {
  sessionTimeout: number; // 分钟
  autoLogout: boolean;
  sessionWarning: boolean;
  warningTime: number; // 分钟
}

interface UseSessionCheckOptions {
  enabled?: boolean; // 是否启用会话检查
  onSessionExpired?: () => void; // 会话过期回调
  onSessionWarning?: () => void; // 会话警告回调
}

export const useSessionCheck = (options: UseSessionCheckOptions = {}) => {
  const { enabled = true, onSessionExpired, onSessionWarning } = options;
  const { data: session } = useSession();
  const router = useRouter();
  
  const [sessionSettings, setSessionSettings] = useState<SessionSettings | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'checking' | 'valid' | 'expired' | 'warning'>('checking');
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0); // 剩余时间（毫秒）

  // 获取用户会话设置
  const fetchSessionSettings = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(`/api/users/${session.user.id}/settings`);
      if (response.ok) {
        const data = await response.json();
        const settings: SessionSettings = {
          sessionTimeout: data.preferences?.sessionTimeout || 480,
          autoLogout: data.preferences?.autoLogout !== false,
          sessionWarning: data.preferences?.sessionWarning !== false,
          warningTime: data.preferences?.warningTime || 5
        };
        setSessionSettings(settings);
      } else {
        // 使用默认设置
        setSessionSettings({
          sessionTimeout: 480,
          autoLogout: true,
          sessionWarning: true,
          warningTime: 5
        });
      }
    } catch (error) {
      console.error('获取会话设置失败:', error);
      // 使用默认设置
      setSessionSettings({
        sessionTimeout: 480,
        autoLogout: true,
        sessionWarning: true,
        warningTime: 5
      });
    }
  }, [session?.user?.id]);

  // 处理会话过期
  const handleSessionExpired = useCallback(async () => {
    try {
      // 清除登录时间
      localStorage.removeItem('loginTime');
      
      // 调用外部回调
      onSessionExpired?.();
      
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
  }, [onSessionExpired, router]);

  // 续期会话
  const renewSession = useCallback(() => {
    localStorage.setItem('loginTime', new Date().toISOString());
    setSessionStatus('valid');
    setShowWarning(false);
    setTimeRemaining(0);
  }, []);

  // 检查会话状态
  const checkSession = useCallback(() => {
    if (!sessionSettings || !enabled) return;

    // 如果设置为永不过期
    if (sessionSettings.sessionTimeout === 0) {
      setSessionStatus('valid');
      setTimeRemaining(0);
      return;
    }

    // 从localStorage获取登录时间
    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) {
      // 如果没有登录时间记录，设置当前时间
      localStorage.setItem('loginTime', new Date().toISOString());
      setSessionStatus('valid');
      setTimeRemaining(sessionSettings.sessionTimeout * 60 * 1000);
      return;
    }

    const loginDate = new Date(loginTime);
    const now = new Date();
    const sessionDuration = sessionSettings.sessionTimeout * 60 * 1000; // 转换为毫秒
    const warningThreshold = sessionSettings.warningTime * 60 * 1000; // 提醒时间阈值

    const timeElapsed = now.getTime() - loginDate.getTime();
    const remaining = sessionDuration - timeElapsed;
    setTimeRemaining(Math.max(0, remaining));

    if (remaining <= 0) {
      // 会话已过期
      setSessionStatus('expired');
      if (sessionSettings.autoLogout) {
        handleSessionExpired();
      }
    } else if (remaining <= warningThreshold && sessionSettings.sessionWarning) {
      // 会话即将过期
      setSessionStatus('warning');
      setShowWarning(true);
      onSessionWarning?.();
    } else {
      // 会话正常
      setSessionStatus('valid');
      setShowWarning(false);
    }
  }, [sessionSettings, enabled, handleSessionExpired, onSessionWarning]);

  // 获取设置
  useEffect(() => {
    if (session && enabled) {
      fetchSessionSettings();
    }
  }, [session, enabled, fetchSessionSettings]);

  // 设置登录时间（仅在首次登录时）
  useEffect(() => {
    if (session && enabled && !localStorage.getItem('loginTime')) {
      localStorage.setItem('loginTime', new Date().toISOString());
    }
  }, [session, enabled]);

  // 定期检查会话状态
  useEffect(() => {
    if (!sessionSettings || !enabled) return;

    // 立即检查一次
    checkSession();

    // 每分钟检查一次会话状态
    const interval = setInterval(checkSession, 60000);

    return () => clearInterval(interval);
  }, [sessionSettings, enabled, checkSession]);

  // 格式化剩余时间
  const formatTimeRemaining = useCallback((ms: number) => {
    if (ms <= 0) return '已过期';
    
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}小时${remainingMinutes}分钟`;
    } else {
      return `${remainingMinutes}分钟`;
    }
  }, []);

  return {
    sessionStatus,
    sessionSettings,
    showWarning,
    timeRemaining,
    formatTimeRemaining: formatTimeRemaining(timeRemaining),
    renewSession,
    handleSessionExpired,
    isSessionValid: sessionStatus === 'valid',
    isSessionExpired: sessionStatus === 'expired',
    isSessionWarning: sessionStatus === 'warning'
  };
};