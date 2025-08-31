"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { SettingsCard } from './SettingsCard';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalConfirm } from '../../components/basic/GlobalConfirmManager';
import { ToastType } from '@repo/common';
import {
  FormGroup,
  Label,
  Input,
  Button,
  SecondaryButton,
  ButtonGroup,
  DangerButton
} from './SharedStyles';

// 保留 UserInfoSettings 特有的样式组件
const CustomInput = styled(Input)`
  padding: 12px 16px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(66, 75, 97, 0.4)'
    : 'rgba(248, 250, 252, 0.6)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
  }
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}20;
  }
`;

const CustomButton = styled(Button)`
  background: ${({ theme }) => theme.colors.accent};
  
  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
    transform: translateY(-2px);
  }
`;

const CustomSecondaryButton = styled(SecondaryButton)`
  margin-right: 12px;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : 'rgba(59, 130, 246, 0.05)'
  };
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const CustomButtonGroup = styled(ButtonGroup)`
  margin-top: 24px;
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.accent};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  font-weight: 600;
`;

const AvatarInfo = styled.div`
  flex: 1;
  
  h4 {
    font-size: 16px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0 0 4px 0;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    margin: 0;
  }
`;

const ChangeAvatarButton = styled(CustomSecondaryButton)`
  margin: 0;
  padding: 8px 16px;
  font-size: 12px;
`;

const CustomDangerButton = styled(DangerButton)`
  &:hover {
    background: #dc2626;
    transform: translateY(-2px);
  }
`;

const LogoutSection = styled.div`
  padding: 20px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.borderLight};
  margin-top: 20px;
  
  h4 {
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0 0 8px 0;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    margin: 0 0 16px 0;
    line-height: 1.4;
  }
`;

interface UserInfoSettingsProps {
  onLogout?: () => Promise<void>;
}

export const UserInfoSettings: React.FC<UserInfoSettingsProps> = ({ onLogout }) => {
  const { showConfirm } = useGlobalConfirm();
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const { user } = useAuth();

  const [userInfo, setUserInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // 当用户数据加载时更新表单
  useEffect(() => {
    if (user) {
      setUserInfo(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // 这里应该调用实际的API
  };

  const handleChangePassword = async () => {
    if (userInfo.newPassword !== userInfo.confirmPassword) {
      setToast({
        message: `新密码和确认密码不匹配`,
        type: 'warning'
      });
      return;
    }

    setIsLoading(true);
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    // 清空密码字段
    setUserInfo(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));

    console.log('修改密码');
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      title: '确认退出',
      message: '确定要退出登录吗？',
      confirmText: '退出',
      cancelText: '取消'
    });

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    try {
      if (onLogout) {
        await onLogout();
      }
    } catch (error) {
      setToast({
        message: `退出登录失败，请重试`,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SettingsCard
        title="个人资料"
        description="管理你的个人信息和头像"
      >
        <AvatarSection>
          <Avatar>
            {userInfo.name.charAt(0).toUpperCase()}
          </Avatar>
          <AvatarInfo>
            <h4>{userInfo.name}</h4>
            <p>{userInfo.email}</p>
          </AvatarInfo>
          <ChangeAvatarButton>
            更换头像
          </ChangeAvatarButton>
        </AvatarSection>

        <FormGroup>
          <Label htmlFor="name">姓名</Label>
          <CustomInput
            id="name"
            type="text"
            value={userInfo.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="请输入姓名"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">邮箱</Label>
          <CustomInput
            id="email"
            type="email"
            value={userInfo.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="请输入邮箱"
          />
        </FormGroup>

        <CustomButtonGroup>
          <CustomSecondaryButton>取消</CustomSecondaryButton>
          <CustomButton
            onClick={handleSaveProfile}
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : '保存更改'}
          </CustomButton>
        </CustomButtonGroup>
      </SettingsCard>

      <SettingsCard
        title="密码设置"
        description="修改你的登录密码"
      >
        <FormGroup>
          <Label htmlFor="currentPassword">当前密码</Label>
          <CustomInput
            id="currentPassword"
            type="password"
            value={userInfo.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            placeholder="请输入当前密码"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="newPassword">新密码</Label>
          <CustomInput
            id="newPassword"
            type="password"
            value={userInfo.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            placeholder="请输入新密码"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="confirmPassword">确认新密码</Label>
          <CustomInput
            id="confirmPassword"
            type="password"
            value={userInfo.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            placeholder="请再次输入新密码"
          />
        </FormGroup>

        <CustomButtonGroup>
          <CustomSecondaryButton>取消</CustomSecondaryButton>
          <CustomButton
            onClick={handleChangePassword}
            disabled={isLoading || !userInfo.currentPassword || !userInfo.newPassword}
          >
            {isLoading ? '修改中...' : '修改密码'}
          </CustomButton>
        </CustomButtonGroup>
      </SettingsCard>

      <SettingsCard
        title="账户管理"
        description="管理你的账户安全和登录状态"
      >
        <LogoutSection>
          <h4>退出登录</h4>
          <p>退出当前账户，你需要重新登录才能继续使用。</p>
          <CustomDangerButton
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? '退出中...' : '退出登录'}
          </CustomDangerButton>
        </LogoutSection>
      </SettingsCard>
    </>
  );
};

export default UserInfoSettings;