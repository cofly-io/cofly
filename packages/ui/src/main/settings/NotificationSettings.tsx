"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { SettingsCard } from './SettingsCard';
import { Toggle, Select, Button, Input } from './SharedStyles';

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
  
  h4 {
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0 0 4px 0;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    margin: 0;
    line-height: 1.4;
  }
`;





const TimeInput = styled(Input)`
  width: 120px;
`;

const NotificationPreview = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : 'rgba(59, 130, 246, 0.05)'
  };
  border: 1px solid ${({ theme }) => theme.colors.accent}40;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  
  h4 {
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0 0 8px 0;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 13px;
    margin: 0;
    line-height: 1.4;
  }
`;

const CustomButton = styled(Button)`
  padding: 8px 16px;
  font-size: 12px;
`;

export const NotificationSettings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    // 系统通知
    systemUpdates: true,
    securityAlerts: true,
    maintenanceNotices: true,
    
    // 工作流通知
    workflowCompletion: true,
    workflowErrors: true,
    workflowScheduled: false,
    
    // 邮件通知
    emailNotifications: true,
    emailFrequency: 'immediate', // immediate, daily, weekly
    
    // 浏览器通知
    browserNotifications: true,
    
    // 免打扰模式
    doNotDisturb: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    
    // 声音设置
    soundEnabled: true,
    soundVolume: 50
  });

  const handleToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSelectChange = (key: string, value: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const testNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('测试通知', {
          body: '这是一个测试通知，用于验证通知设置是否正常工作。',
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('测试通知', {
              body: '这是一个测试通知，用于验证通知设置是否正常工作。',
              icon: '/favicon.ico'
            });
          }
        });
      }
    }
  };

  return (
    <>
      <SettingsCard
        title="系统通知"
        description="管理系统相关的通知设置"
      >
        <SettingRow>
          <SettingInfo>
            <h4>系统更新</h4>
            <p>接收系统版本更新和新功能通知</p>
          </SettingInfo>
          <Toggle 
            $active={notifications.systemUpdates}
            onClick={() => handleToggle('systemUpdates')}
          />
        </SettingRow>
        
        <SettingRow>
          <SettingInfo>
            <h4>安全警报</h4>
            <p>接收安全相关的重要警报信息</p>
          </SettingInfo>
          <Toggle 
            $active={notifications.securityAlerts}
            onClick={() => handleToggle('securityAlerts')}
          />
        </SettingRow>
        
        <SettingRow>
          <SettingInfo>
            <h4>维护通知</h4>
            <p>接收系统维护和停机通知</p>
          </SettingInfo>
          <Toggle 
            $active={notifications.maintenanceNotices}
            onClick={() => handleToggle('maintenanceNotices')}
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard
        title="工作流通知"
        description="管理工作流执行相关的通知"
      >
        <SettingRow>
          <SettingInfo>
            <h4>工作流完成</h4>
            <p>工作流执行完成时发送通知</p>
          </SettingInfo>
          <Toggle 
            $active={notifications.workflowCompletion}
            onClick={() => handleToggle('workflowCompletion')}
          />
        </SettingRow>
        
        <SettingRow>
          <SettingInfo>
            <h4>工作流错误</h4>
            <p>工作流执行出错时发送通知</p>
          </SettingInfo>
          <Toggle 
            $active={notifications.workflowErrors}
            onClick={() => handleToggle('workflowErrors')}
          />
        </SettingRow>
        
        <SettingRow>
          <SettingInfo>
            <h4>定时工作流</h4>
            <p>定时工作流启动时发送通知</p>
          </SettingInfo>
          <Toggle 
            $active={notifications.workflowScheduled}
            onClick={() => handleToggle('workflowScheduled')}
          />
        </SettingRow>
      </SettingsCard>

      <SettingsCard
        title="通知方式"
        description="选择接收通知的方式和频率"
      >
        <SettingRow>
          <SettingInfo>
            <h4>邮件通知</h4>
            <p>通过邮件接收通知</p>
          </SettingInfo>
          <Toggle 
            $active={notifications.emailNotifications}
            onClick={() => handleToggle('emailNotifications')}
          />
        </SettingRow>
        
        {notifications.emailNotifications && (
          <SettingRow>
            <SettingInfo>
              <h4>邮件频率</h4>
              <p>设置邮件通知的发送频率</p>
            </SettingInfo>
            <Select
              value={notifications.emailFrequency}
              onChange={(e) => handleSelectChange('emailFrequency', e.target.value)}
            >
              <option value="immediate">立即发送</option>
              <option value="daily">每日汇总</option>
              <option value="weekly">每周汇总</option>
            </Select>
          </SettingRow>
        )}
        
        <SettingRow>
          <SettingInfo>
            <h4>浏览器通知</h4>
            <p>在浏览器中显示桌面通知</p>
          </SettingInfo>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Toggle 
              $active={notifications.browserNotifications}
              onClick={() => handleToggle('browserNotifications')}
            />
            <Button onClick={testNotification}>
              测试通知
            </Button>
          </div>
        </SettingRow>
      </SettingsCard>

      <SettingsCard
        title="免打扰模式"
        description="设置免打扰时间段"
      >
        <SettingRow>
          <SettingInfo>
            <h4>启用免打扰</h4>
            <p>在指定时间段内不接收通知</p>
          </SettingInfo>
          <Toggle 
            $active={notifications.doNotDisturb}
            onClick={() => handleToggle('doNotDisturb')}
          />
        </SettingRow>
        
        {notifications.doNotDisturb && (
          <>
            <SettingRow>
              <SettingInfo>
                <h4>开始时间</h4>
                <p>免打扰模式开始时间</p>
              </SettingInfo>
              <TimeInput
                type="time"
                value={notifications.quietHoursStart}
                onChange={(e) => handleSelectChange('quietHoursStart', e.target.value)}
              />
            </SettingRow>
            
            <SettingRow>
              <SettingInfo>
                <h4>结束时间</h4>
                <p>免打扰模式结束时间</p>
              </SettingInfo>
              <TimeInput
                type="time"
                value={notifications.quietHoursEnd}
                onChange={(e) => handleSelectChange('quietHoursEnd', e.target.value)}
              />
            </SettingRow>
          </>
        )}
      </SettingsCard>

      <SettingsCard
        title="声音设置"
        description="管理通知声音"
      >
        <SettingRow>
          <SettingInfo>
            <h4>启用声音</h4>
            <p>通知时播放提示音</p>
          </SettingInfo>
          <Toggle 
            $active={notifications.soundEnabled}
            onClick={() => handleToggle('soundEnabled')}
          />
        </SettingRow>
        
        {notifications.soundEnabled && (
          <SettingRow>
            <SettingInfo>
              <h4>音量</h4>
              <p>调整通知声音的音量大小</p>
            </SettingInfo>
            <input
              type="range"
              min="0"
              max="100"
              value={notifications.soundVolume}
              onChange={(e) => handleSelectChange('soundVolume', e.target.value)}
              style={{ width: '120px' }}
            />
          </SettingRow>
        )}
        
        <NotificationPreview>
          <h4>通知预览</h4>
          <p>
            根据当前设置，你将在工作流完成时收到
            {notifications.browserNotifications && '浏览器通知'}
            {notifications.browserNotifications && notifications.emailNotifications && '和'}
            {notifications.emailNotifications && `邮件通知（${
              notifications.emailFrequency === 'immediate' ? '立即发送' :
              notifications.emailFrequency === 'daily' ? '每日汇总' : '每周汇总'
            }）`}
            {notifications.soundEnabled && '，并播放提示音'}
            。
            {notifications.doNotDisturb && 
              `在 ${notifications.quietHoursStart} 到 ${notifications.quietHoursEnd} 期间将不会收到通知。`
            }
          </p>
        </NotificationPreview>
      </SettingsCard>
    </>
  );
};

export default NotificationSettings;