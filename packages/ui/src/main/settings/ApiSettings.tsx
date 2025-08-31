"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { SettingsCard } from './SettingsCard';
import {
  FormGroup,
  Label,
  Input,
  TextArea,
  Button,
  ButtonGroup
} from './SharedStyles';

// 保留 ApiSettings 特有的样式组件
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

const CustomTextArea = styled(TextArea)`
  padding: 12px 16px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(66, 75, 97, 0.4)'
    : 'rgba(248, 250, 252, 0.6)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  min-height: 100px;
  
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

const SecondaryButton = styled(CustomButton)`
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-right: 12px;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.1)'
      : 'rgba(59, 130, 246, 0.05)'
    };
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-2px);
  }
`;

const CustomButtonGroup = styled(ButtonGroup)`
  margin-top: 24px;
`;

const StatusIndicator = styled.div<{ $status: 'connected' | 'disconnected' | 'testing' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'connected':
        return theme.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)';
      case 'disconnected':
        return theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)';
      case 'testing':
        return theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)';
      default:
        return 'transparent';
    }
  }};
  
  color: ${({ $status }) => {
    switch ($status) {
      case 'connected':
        return '#22c55e';
      case 'disconnected':
        return '#ef4444';
      case 'testing':
        return '#3b82f6';
      default:
        return 'inherit';
    }
  }};
`;

const StatusDot = styled.div<{ $status: 'connected' | 'disconnected' | 'testing' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $status }) => {
    switch ($status) {
      case 'connected':
        return '#22c55e';
      case 'disconnected':
        return '#ef4444';
      case 'testing':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  }};
`;

const ApiHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const ApiSettings: React.FC = () => {
  const [apiConfigs, setApiConfigs] = useState({
    cofly: {
      apiKey: '',
      baseUrl: 'https://api.cofly.com',
      status: 'disconnected' as 'connected' | 'disconnected' | 'testing'
    },
    openai: {
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      status: 'disconnected' as 'connected' | 'disconnected' | 'testing'
    },
    custom: {
      name: '',
      apiKey: '',
      baseUrl: '',
      headers: '',
      status: 'disconnected' as 'connected' | 'disconnected' | 'testing'
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (api: string, field: string, value: string) => {
    setApiConfigs(prev => ({
      ...prev,
      [api]: {
        ...prev[api as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const testConnection = async (apiType: string) => {
    setApiConfigs(prev => ({
      ...prev,
      [apiType]: {
        ...prev[apiType as keyof typeof prev],
        status: 'testing'
      }
    }));

    // 模拟API测试
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 随机成功或失败（实际应该调用真实API）
    const success = Math.random() > 0.3;
    
    setApiConfigs(prev => ({
      ...prev,
      [apiType]: {
        ...prev[apiType as keyof typeof prev],
        status: success ? 'connected' : 'disconnected'
      }
    }));
  };

  const saveApiConfig = async (apiType: string) => {
    setIsLoading(true);
    // 模拟保存API配置
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    console.log(`保存 ${apiType} API配置:`, apiConfigs[apiType as keyof typeof apiConfigs]);
  };

  return (
    <>
      <SettingsCard
        title="Cofly API"
        description="配置Cofly服务的API连接"
      >
        <ApiHeader>
          <div></div>
          <StatusIndicator $status={apiConfigs.cofly.status}>
            <StatusDot $status={apiConfigs.cofly.status} />
            {apiConfigs.cofly.status === 'connected' && '已连接'}
            {apiConfigs.cofly.status === 'disconnected' && '未连接'}
            {apiConfigs.cofly.status === 'testing' && '测试中...'}
          </StatusIndicator>
        </ApiHeader>
        
        <FormGroup>
          <Label htmlFor="cofly-api-key">API Key</Label>
          <CustomInput
            id="cofly-api-key"
            type="password"
            value={apiConfigs.cofly.apiKey}
            onChange={(e) => handleInputChange('cofly', 'apiKey', e.target.value)}
            placeholder="请输入Cofly API Key"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="cofly-base-url">Base URL</Label>
          <CustomInput
            id="cofly-base-url"
            type="url"
            value={apiConfigs.cofly.baseUrl}
            onChange={(e) => handleInputChange('cofly', 'baseUrl', e.target.value)}
            placeholder="https://api.cofly.com"
          />
        </FormGroup>
        
        <CustomButtonGroup>
          <SecondaryButton onClick={() => testConnection('cofly')}>
            测试连接
          </SecondaryButton>
          <CustomButton 
            onClick={() => saveApiConfig('cofly')}
            disabled={isLoading || !apiConfigs.cofly.apiKey}
          >
            {isLoading ? '保存中...' : '保存配置'}
          </CustomButton>
        </CustomButtonGroup>
      </SettingsCard>

      <SettingsCard
        title="OpenAI API"
        description="配置OpenAI服务的API连接"
      >
        <ApiHeader>
          <div></div>
          <StatusIndicator $status={apiConfigs.openai.status}>
            <StatusDot $status={apiConfigs.openai.status} />
            {apiConfigs.openai.status === 'connected' && '已连接'}
            {apiConfigs.openai.status === 'disconnected' && '未连接'}
            {apiConfigs.openai.status === 'testing' && '测试中...'}
          </StatusIndicator>
        </ApiHeader>
        
        <FormGroup>
          <Label htmlFor="openai-api-key">API Key</Label>
          <CustomInput
            id="openai-api-key"
            type="password"
            value={apiConfigs.openai.apiKey}
            onChange={(e) => handleInputChange('openai', 'apiKey', e.target.value)}
            placeholder="请输入OpenAI API Key"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="openai-base-url">Base URL</Label>
          <CustomInput
            id="openai-base-url"
            type="url"
            value={apiConfigs.openai.baseUrl}
            onChange={(e) => handleInputChange('openai', 'baseUrl', e.target.value)}
            placeholder="https://api.openai.com/v1"
          />
        </FormGroup>
        
        <CustomButtonGroup>
          <SecondaryButton onClick={() => testConnection('openai')}>
            测试连接
          </SecondaryButton>
          <CustomButton 
            onClick={() => saveApiConfig('openai')}
            disabled={isLoading || !apiConfigs.openai.apiKey}
          >
            {isLoading ? '保存中...' : '保存配置'}
          </CustomButton>
        </CustomButtonGroup>
      </SettingsCard>

      <SettingsCard
        title="自定义API"
        description="配置自定义的API服务连接"
      >
        <ApiHeader>
          <div></div>
          <StatusIndicator $status={apiConfigs.custom.status}>
            <StatusDot $status={apiConfigs.custom.status} />
            {apiConfigs.custom.status === 'connected' && '已连接'}
            {apiConfigs.custom.status === 'disconnected' && '未连接'}
            {apiConfigs.custom.status === 'testing' && '测试中...'}
          </StatusIndicator>
        </ApiHeader>
        
        <FormGroup>
          <Label htmlFor="custom-name">服务名称</Label>
          <CustomInput
            id="custom-name"
            type="text"
            value={apiConfigs.custom.name}
            onChange={(e) => handleInputChange('custom', 'name', e.target.value)}
            placeholder="请输入服务名称"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="custom-api-key">API Key</Label>
          <CustomInput
            id="custom-api-key"
            type="password"
            value={apiConfigs.custom.apiKey}
            onChange={(e) => handleInputChange('custom', 'apiKey', e.target.value)}
            placeholder="请输入API Key"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="custom-base-url">Base URL</Label>
          <CustomInput
            id="custom-base-url"
            type="url"
            value={apiConfigs.custom.baseUrl}
            onChange={(e) => handleInputChange('custom', 'baseUrl', e.target.value)}
            placeholder="https://api.example.com"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="custom-headers">自定义Headers (JSON格式)</Label>
          <CustomTextArea
            id="custom-headers"
            value={apiConfigs.custom.headers}
            onChange={(e) => handleInputChange('custom', 'headers', e.target.value)}
            placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
          />
        </FormGroup>
        
        <CustomButtonGroup>
          <SecondaryButton onClick={() => testConnection('custom')}>
            测试连接
          </SecondaryButton>
          <CustomButton 
            onClick={() => saveApiConfig('custom')}
            disabled={isLoading || !apiConfigs.custom.name || !apiConfigs.custom.baseUrl}
          >
            {isLoading ? '保存中...' : '保存配置'}
          </CustomButton>
        </CustomButtonGroup>
      </SettingsCard>
    </>
  );
};

export default ApiSettings;