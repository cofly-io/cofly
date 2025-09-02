"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ConnectParameterInput } from './ConnectParameterInput';
import { ILLMConnect, IConnect, IConnectField } from '@repo/common';
import {
  FieldsGrid,
  StatusMessage,
  InputContainer,
  Label,
  Required,
  TextInput,

} from '../../shared/modalStyle';
import { SiSpeedtest } from "react-icons/si";
import { ConnectIcon } from '../../modals/ConnectConfigStyles';

import {
  ModalBackdrop,
  PremiumTitleDesc,
  ModalHeader,
  ModalContent,
  PremiumModalContainer,
  ModalContentBlock
} from '../../basic';

// 导入 react-icons
import { HiOutlineDocumentText, HiOutlineKey } from 'react-icons/hi2';
import { HiOutlineCube } from 'react-icons/hi';
import { FaSave } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

// 导入 CoButton 组件
import { CoButton, useToast } from '../../basic';

// 按钮容器样式 - 复制自 NodeSettings.tsx
const CustomButtonContainer = styled.div`
  display: flex; 
  margin-top: -10px;
  padding:6px 20px;
  justify-content: space-between;
`;

// 测试按钮样式 - 复制自 NodeSettings.tsx
const TestButton = styled.button<{ disabled?: boolean }>`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 0px 14px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  height: 28px;
  backdrop-filter: blur(4px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: ${({ disabled }) => disabled ? 'none' : 'translateY(0)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .loading-icon {
    animation: spin 1s linear infinite;
    font-size: 14px;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  svg {
    margin-bottom: -1px;
    margin-right: 8px; 
  }
`;

// 通用按钮容器 - 复制自 NodeSettings.tsx
const CommonBtnContainer = styled.div`
  display: flex;
  gap: 15px;
`;

// 返回按钮样式
const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#ffffff'};
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#ffffff' : '#bfbfbf'};
  }
`;

// 添加关于信息的样式组件
const AboutSection = styled.div`
  margin-bottom: 20px;
  padding: 16px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.02)'
    : 'rgba(248, 250, 252, 0.02)'
  };
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(226, 232, 240, 0.08)'
  };
  backdrop-filter: blur(8px);
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 2px 8px rgba(0, 0, 0, 0.3)'
    : '0 2px 8px rgba(0, 0, 0, 0.05)'
  };
`;

const AboutLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const AboutLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.08)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? '#bfd0eb33'
    : 'rgba(59, 130, 246, 0.15)'
  };
  border-radius: 4px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#bfbfbf' : '#ededed'};
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.15)'
    : 'rgba(240, 240, 240, 0.1)'
  };
    border-color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.4)'
    : 'rgba(59, 130, 246, 0.3)'
  };
    color: ${({ theme }) => theme.mode === 'dark' ? '#dbeafe' : '#ffffff'};
    // transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 4px 12px rgba(59, 130, 246, 0.2)'
    : '0 4px 12px rgba(59, 130, 246, 0.15)'
  };
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;


interface ConnectSettingsProps {
  connect: IConnect | ILLMConnect; // 支持通用连接和 LLM 连接类型
  savedValues?: Record<string, any>;
  onClose: () => void;
  onSave: (connectData: any) => void;
  onTest?: (config: Record<string, any>, message?: string) => Promise<any>;
  editMode?: boolean;
  editData?: {
    id: string;
    connectId: string;
    name: string;
    config: Record<string, any>;
  };
  showBackButton?: boolean; // 是否显示返回按钮
  onBack?: () => void; // 返回按钮的回调
}

export const ConnectSettings: React.FC<ConnectSettingsProps> = ({
  connect,
  savedValues = {},
  onClose,
  onSave,
  onTest,
  editMode = false,
  editData,
  showBackButton = false,
  onBack
}) => {

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [configName, setConfigName] = useState<string>('');
  const [testStatus, setTestStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess } = useToast();

  // 判断是否为LLM连接，添加安全检查
  const isLLMConnect = connect?.overview?.type === 'llm' || connect?.overview?.type === 'llm-embedding';

  // 初始化表单值
  useEffect(() => {
    // 添加安全检查
    if (!connect?.detail?.fields) {
      console.warn('连接详情数据无效: fields 属性缺失');
      return;
    }

    const initialValues: Record<string, any> = {};

    // 使用保存的值或默认值
    connect.detail.fields.forEach((field: IConnectField) => {
      if (savedValues[field.name] !== undefined) {
        initialValues[field.name] = savedValues[field.name];
      } else if (field.default !== undefined) {
        initialValues[field.name] = field.default;
      }
    });

    setFormValues(initialValues);
  }, [connect?.detail?.fields, savedValues]);

  // 在编辑模式下，从 editData.config 初始化表单值
  useEffect(() => {
    if (editMode && editData?.config !== undefined && connect?.detail?.fields) {

      const editValues: Record<string, any> = {};

      // 遍历连接字段定义，从 editData.config 中提取对应的值
      connect.detail.fields.forEach((field: IConnectField) => {
        if (editData.config[field.name] !== undefined) {
          editValues[field.name] = editData.config[field.name];
        } else if (field.default !== undefined) {
          editValues[field.name] = field.default;
        }
      });

      setFormValues(editValues);
    }
  }, [editMode, editData?.config, connect?.detail?.fields]);

  // 初始化配置名称 - 支持编辑模式
  useEffect(() => {
    if (editMode && editData) {
      // 编辑模式：使用现有配置名称
      setConfigName(editData.name);
    } else if (!configName && connect?.overview?.name) {
      // 新建模式：生成默认配置名称
      setConfigName(`${connect.overview.name}模型`);
    }
  }, [connect?.overview?.name, editMode, editData]);

  const handleInputChange = (name: string, value: any) => {
    setFormValues(prev => {
      const newFormValues = {
        ...prev,
        [name]: value
      };
      return newFormValues;
    });

    // 清除测试状态，确保用户修改配置后可以重新测试
    if (testStatus.type) {
      setTestStatus({ type: null, message: '' });
    }
  };

  const handleTest = async () => {
    if (!onTest || !connect.detail.validateConnection) return;

    setIsTestLoading(true);
    setTestStatus({ type: null, message: '' });

    try {
      // 默认使用经济模式
      const testConfig = { ...formValues };

      if (isLLMConnect) {
        // 经济模式：添加标识，后端可以选择更经济的测试方式
        testConfig._testMode = 'economical';
        testConfig._economicalTest = true;
      }

      const result = await onTest(testConfig);

      if (result.success) {
        let message = result.message || '检测成功！';

        // 为经济模式添加费用说明
        if (isLLMConnect && result.details) {
          const cost = result.details.cost || '未知';
          message += ` (${cost})`;
        }

        setTestStatus({
          type: 'success',
          message
        });
      } else {
        setTestStatus({
          type: 'error',
          message: result.message || '连接测试失败'
        });
      }
    } catch (error) {
      setTestStatus({
        type: 'error',
        message: `测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setIsTestLoading(false);
    }
  };


  const handleSave = async () => {
    // 添加安全检查
    if (!connect?.overview) {
      setTestStatus({
        type: 'error',
        message: '连接数据无效，请重新选择连接'
      });
      return;
    }

    setIsSaving(true);

    try {
      // 准备config数据，如果overview中有driver属性，则添加到config中
      const configData = { ...formValues };
      if ((connect.overview as any).driver) {
        configData.driver = (connect.overview as any).driver;
      }

      const connectData = {
        ...(editMode && editData ? { id: editData.id } : {}), // 编辑模式下包含记录ID
        connectId: connect.overview.id,
        name: configName || `${connect.overview.name}`,
        config: configData,
        mtype: connect.overview.type // 如果 connectType 不存在，使用 connect.type 作为后备
      };


      onSave(connectData);
      // 显示成功提示
      showSuccess('保存成功', `${configName} 配置已保存`);
      // 保存成功后关闭弹窗
      onClose();
    } catch (error) {
      console.error('保存配置失败:', error);
      setTestStatus({
        type: 'error',
        message: '保存配置失败，请重试'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 检查必填字段
  const hasRequiredFields = () => {
    // 添加安全检查
    if (!connect?.detail?.fields) {
      return false;
    }

    // 检查配置名称是否填写
    if (!configName || configName.trim() === '') {
      return false;
    }

    // 检查连接字段必填项（排除模型字段，因为经济模式下不需要）
    const requiredFields = connect.detail.fields.filter((field: IConnectField) =>
      field.required && field.name !== 'model'
    );
    const missingFields = requiredFields.filter((field: IConnectField) => {
      const value = formValues[field.name];
      const isEmpty = value === undefined || value === '' || value === null;
      return isEmpty;
    });

    return missingFields.length === 0;
  };

  // 渲染关于信息链接
  const renderAboutSection = () => {
    const about = (connect.overview as any).about;
    if (!about) return null;

    const links = [];

    if (about.docUrl) {
      links.push({
        url: about.docUrl,
        label: '查看文档',
        key: 'doc',
        icon: <HiOutlineDocumentText />
      });
    }

    if (about.modelUrl) {
      links.push({
        url: about.modelUrl,
        label: '模型列表',
        key: 'model',
        icon: <HiOutlineCube />
      });
    }

    if (about.getKeyUrl) {
      links.push({
        url: about.getKeyUrl,
        label: '获取密钥',
        key: 'key',
        icon: <HiOutlineKey />
      });
    }

    if (links.length === 0) return null;

    return (
      <AboutSection>
        {/* <AboutTitle>相关链接</AboutTitle> */}
        <AboutLinks>
          {links.map(link => (
            <AboutLink
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.icon}
              {link.label}
            </AboutLink>
          ))}
        </AboutLinks>
      </AboutSection>
    );
  };

  return (
    <>
      <ModalBackdrop>
        <PremiumModalContainer style={{ width: '60vw' }}>
          {/* Header 部分 */}
          <ModalHeader>
            {/* <div style={{ display: 'flex', alignItems: 'center', width: '100%', userSelect: 'none' }}> */}
            <PremiumTitleDesc style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }} >
              {/* style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }} */}
              <ConnectIcon style={{ width: "40px", height: "32px", borderRadius: "4px" }}>
                <img
                  src={`/connects/${connect.overview.type || 'other'}/${connect.overview.id}/${connect.overview.icon}`}
                  alt={connect.overview.name}
                  style={{ width: '28px', height: '28px' }}
                />
              </ConnectIcon>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{connect.overview.name} 连接配置</h4>
                <p style={{ margin: '4px 0 0 0' }}>{connect.overview.description}</p>
              </div>
            </PremiumTitleDesc>
            {showBackButton && (
              <BackButton onClick={onBack || onClose} title="返回连接列表">
                ✕
              </BackButton>
            )}
            {/* </div> */}
          </ModalHeader>

          {/* Content 部分 */}
          <ModalContent>
            {/* 可滚动的内容区域 */}
            {/* <div style={{ flex: 1, overflow: 'auto', minHeight: 0 ,padding: '0px 20px'}}> */}
            <ModalContentBlock>
              {/* 关于信息部分 */}
              {renderAboutSection()}

              {/* 配置名称输入 */}
              <InputContainer>
                <Label>
                  配置名称
                  <Required>*</Required>
                </Label>
                <TextInput
                  type="text"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder="请输入配置名称"
                  required
                />
              </InputContainer>

              {/* 连接字段 */}
              <FieldsGrid $hasDialogue={false}>
                {connect.detail.fields
                  .filter((field: IConnectField) =>
                    field.name !== 'model' // 过滤掉模型字段
                  )
                  .map((field: IConnectField) => {
                    return (
                      <ConnectParameterInput
                        key={field.name}
                        field={field}
                        value={formValues[field.name]}
                        onChange={handleInputChange}
                        formValues={formValues}
                      />
                    );
                  })}
              </FieldsGrid>
              {/* </div> */}
            </ModalContentBlock>


            {/* 固定在底部的按钮区域 */}
            <div style={{ flexShrink: 0, paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <CustomButtonContainer>
                {connect.detail.validateConnection && onTest && (
                  <TestButton
                    type="button"
                    onClick={handleTest}
                    disabled={isTestLoading || !hasRequiredFields()}
                    title={isLLMConnect ? '经济模式：优先使用免费的模型列表测试' : '测试连接'}
                  >
                    <SiSpeedtest />
                    {isTestLoading ? '测试中...' : isLLMConnect ? '连接测试' : '测试连接'}
                  </TestButton>
                )}

                <CommonBtnContainer>
                  <CoButton variant='Glass' onClick={onClose}>
                    <MdCancel />取消
                  </CoButton>
                  <CoButton
                    variant='Glass'
                    backgroundColor='linear-gradient(135deg, #2c6feb, #1a4fb3)'
                    onClick={handleSave}
                    disabled={isSaving || !hasRequiredFields()}
                  >
                    <FaSave />{isSaving ? '保存中...' : '保存配置'}
                  </CoButton>
                </CommonBtnContainer>
              </CustomButtonContainer>
            </div>

            {/* 状态消息 */}
            {testStatus.type && (
              <StatusMessage type={testStatus.type}>
                {testStatus.message}
              </StatusMessage>
            )}
          </ModalContent>
        </PremiumModalContainer>
      </ModalBackdrop>
    </>
  );
};