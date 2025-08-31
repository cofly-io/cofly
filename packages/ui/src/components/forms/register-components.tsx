"use client";

import React, { ReactNode, useState, useEffect } from "react";
import styled from "styled-components";
import {
  ModalMoContainer,
  RegisterFormContainer,
  InputLabel,
  InputField,
  PasswordField,
  PasswordHint,
  ContentSection,
  Logo,
  WelcomeText,
  WelcomeSubText,
  ConfigText,
  SubmitButton,
  LinkText,
  ErrorMessage,
  HintText
} from "../shared/loginStyle";


// Registration form interface
interface RegisterFormProps {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  loading: boolean;
  error?: string;
  formErrors: {
    email?: string;
    name?: string;
    password?: string;
    confirmPassword?: string;
  };
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loginLink: ReactNode;
}

// Reusable registration form component
export const RegisterForm = ({
  email,
  name,
  password,
  confirmPassword,
  loading,
  error,
  formErrors,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  loginLink
}: RegisterFormProps) => {
  return (
    <RegisterFormContainer onSubmit={onSubmit}>
      <div>
        <InputLabel>邮箱 Email *</InputLabel>
        <InputField
          type="email"
          value={email}
          onChange={onEmailChange}
          placeholder="请输入邮箱"
          required
        />
        {formErrors.email && (
          <ErrorMessage>{formErrors.email}</ErrorMessage>
        )}
        <HintText>
          邮箱将用于密码找回，请确保填写正确
        </HintText>
      </div>

      <div>
        <InputLabel>姓名 Name *</InputLabel>
        <InputField
          type="text"
          value={name}
          onChange={onNameChange}
          placeholder="请输入姓名"
          required
        />
        {formErrors.name && (
          <ErrorMessage>{formErrors.name}</ErrorMessage>
        )}
      </div>

      <div>
        <InputLabel>密码 Password *</InputLabel>
        <PasswordField
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder="请输入密码"
          minLength={8}
          maxLength={16}
          required
        />
        <PasswordHint>密码长度8-16位字符</PasswordHint>
        {formErrors.password && (
          <ErrorMessage>{formErrors.password}</ErrorMessage>
        )}
      </div>

      <div>
        <InputLabel>确认密码 Confirm Password *</InputLabel>
        <PasswordField
          type="password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          placeholder="请再次输入密码"
          required
        />
        {formErrors.confirmPassword && (
          <ErrorMessage>{formErrors.confirmPassword}</ErrorMessage>
        )}
      </div>

      <SubmitButton type="submit" disabled={loading}>
        {loading ? '注册中...' : '注册'}
      </SubmitButton>

      {error && (
        <div style={{ 
          color: '#e53935', 
          marginTop: '15px', 
          fontSize: '14px',
          padding: '12px',
          borderRadius: '8px',
          background: 'rgba(229, 57, 53, 0.1)',
          border: '1px solid rgba(229, 57, 53, 0.2)',
          backdropFilter: 'blur(5px)'
        }}>
          {error}
        </div>
      )}

      {loginLink}
    </RegisterFormContainer>
  );
};

// Registration page props
interface RegisterPageProps {
  logoSrc: string;
  backgroundImageUrl?: string;
  onRegister: (data: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  loading: boolean;
  error?: string;
  loginUrl: string;
  onLanguageChange?: () => void;
}

// Full registration page component
export const RegisterPageComponent = ({
  logoSrc,
  backgroundImageUrl,
  onRegister,
  loading,
  error,
  loginUrl,
  onLanguageChange
}: RegisterPageProps) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    name?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const errors: typeof formErrors = {};

    // Email validation
    if (!email.trim()) {
      errors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '邮箱格式不正确';
    }

    // Name validation
    if (!name.trim()) {
      errors.name = '姓名不能为空';
    } else if (name.trim().length < 2) {
      errors.name = '姓名至少2个字符';
    }

    // Password validation
    if (!password) {
      errors.password = '密码不能为空';
    } else if (password.length < 8 || password.length > 16) {
      errors.password = '密码长度必须8-16位字符';
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = '请确认密码';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onRegister({
        email: email.trim(),
        password,
        name: name.trim(),
      });
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <ModalMoContainer>
      <Logo src={logoSrc} alt="Logo" />
      <ContentSection>
        <WelcomeText>创建新账户</WelcomeText>
        <WelcomeSubText>Create your account!</WelcomeSubText>

        <ConfigText>
          加入业务流自动化平台，开启高效工作新体验
          <br />
          Join our platform and streamline your workflow automation
        </ConfigText>

        <RegisterForm
          email={email}
          name={name}
          password={password}
          confirmPassword={confirmPassword}
          loading={loading}
          error={error}
          formErrors={formErrors}
          onEmailChange={(e) => setEmail(e.target.value)}
          onNameChange={(e) => setName(e.target.value)}
          onPasswordChange={(e) => setPassword(e.target.value)}
          onConfirmPasswordChange={(e) => setConfirmPassword(e.target.value)}
          onSubmit={handleRegister}
          loginLink={
            <LinkText>
              已有账户？<a href={loginUrl}>立即登录</a>
            </LinkText>
          }
        />
      </ContentSection>
    </ModalMoContainer>
  );
};

