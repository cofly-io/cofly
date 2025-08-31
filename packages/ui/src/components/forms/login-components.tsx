"use client";

import React, { ReactNode, useState, useEffect } from "react";
import styled, { css } from "styled-components";
import {
  ModalMoContainer,
  ContentSection,
  Logo,
  WelcomeText,
  WelcomeSubText,
  ConfigText,
  SubmitButton,
  FormContainer,
  LinkText,
  InputLabel, 
  InputField, 
  PasswordField, 
  PasswordHint
} from "../shared/loginStyle";
import AnimatedLogo from "../basic/AnimatedLogo";

// 定位的Logo容器
const LogoContainer = styled.div`
  position: absolute;
  top: 8px;
  left: 10px;
  z-index: 10;
`;


// Reusable login form component
interface LoginFormProps {
  username: string;
  password: string;
  loading: boolean;
  error?: string;
  onUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  registerLink: ReactNode;
}

export const LoginForm = ({
  username,
  password,
  loading,
  error,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  registerLink
}: LoginFormProps) => {
  return (
    <FormContainer onSubmit={onSubmit}>
      <div>
        <InputLabel>邮箱 E-Mail</InputLabel>
        <InputField
          type="email"
          value={username}
          onChange={onUsernameChange}
          placeholder=""
          required
        />
      </div>

      <div>
        <InputLabel>密码 Password</InputLabel>
        <PasswordField
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder=""
          required
        />
        <PasswordHint>密码长度8-16位字符</PasswordHint>
      </div>

      <SubmitButton type="submit" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </SubmitButton>

      {error && (
        <div style={{
          color: '#e53935',
          marginTop: '10px',
          fontSize: '14px',
          padding: '10px',
          borderRadius: '8px',
          background: 'rgba(229, 57, 53, 0.1)',
          border: '1px solid rgba(229, 57, 53, 0.2)'
        }}>
          {error}
        </div>
      )}

      {registerLink}
    </FormContainer>
  );
};

// Full login page component
interface LoginPageProps {
  logoSrc?: string; // 保持兼容性，但现在是可选的
  onLogin: (username: string, password: string) => Promise<void>;
  loading: boolean;
  error?: string;
  registerUrl?: string;
  onRegisterClick?: () => void;
}

export const LoginPageComponent = ({
  logoSrc,
  onLogin,
  loading,
  error,
  registerUrl,
  onRegisterClick,
}: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onLogin(email, password);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleRegisterClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onRegisterClick) {
      e.preventDefault();
      onRegisterClick();
    }
    // 如果没有提供 onRegisterClick，则使用默认的 href 行为
  };

  return (
    <ModalMoContainer>
      <LogoContainer>
        <AnimatedLogo fontSize="18px" />
      </LogoContainer>
      <ContentSection>
        <WelcomeText>欢迎回来</WelcomeText>
        <WelcomeSubText>Welcome back!</WelcomeSubText>

        <ConfigText>
          业务流自动化平台配置与开发环境
          <br />
          Business Automation Platform With The Speed Of No-code
        </ConfigText>

        <LoginForm
          username={email}
          password={password}
          loading={loading}
          error={error}
          onUsernameChange={(e) => setEmail(e.target.value)}
          onPasswordChange={(e) => setPassword(e.target.value)}
          onSubmit={handleLogin}
          registerLink={
            <LinkText>
              还没有账户？<a href={registerUrl || '/register'} onClick={handleRegisterClick}>立即注册</a>
            </LinkText>
          }
        />
      </ContentSection>
    </ModalMoContainer>
  );
};
