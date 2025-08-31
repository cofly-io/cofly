"use client";

import React, { useState } from 'react';
import styled from 'styled-components';

// 弹窗背景 - 参考AvatarPanelModal样式
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

// 弹窗容器 - 现代化玻璃态设计
const ModalContainer = styled.div`
  width: 90%;
  max-width: 500px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  // box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  // font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  }
`;

// 弹窗头部 - 玻璃态样式
const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #60a5fa, #3b82f6);
    border-radius: 1px;
  }
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: white;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

// 内容区域 - 移除padding，因为ModalContainer已有padding
const ModalContent = styled.div`
  flex: 1;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: white;
`;

const Required = styled.span`
  color: #fca5a5;
  margin-left: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: rgba(96, 165, 250, 0.6);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
    background: rgba(255, 255, 255, 0.15);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &.error {
    border-color: rgba(239, 68, 68, 0.6);
    
    &:focus {
      border-color: rgba(239, 68, 68, 0.6);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
    }
  }
`;

const ErrorMessage = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #fca5a5;
`;

// 按钮区域 - 玻璃态样式
const ModalFooter = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: 1px solid ${props => 
    props.$variant === 'primary' 
      ? 'rgba(96, 165, 250, 0.6)' 
      : 'rgba(255, 255, 255, 0.3)'
  };
  background: ${props => 
    props.$variant === 'primary' 
      ? 'rgba(96, 165, 250, 0.2)' 
      : 'rgba(255, 255, 255, 0.1)'
  };
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${props => 
      props.$variant === 'primary' 
        ? 'rgba(96, 165, 250, 0.3)' 
        : 'rgba(255, 255, 255, 0.2)'
    };
    border-color: ${props => 
      props.$variant === 'primary' 
        ? 'rgba(96, 165, 250, 0.8)' 
        : 'rgba(255, 255, 255, 0.5)'
    };
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      background: ${props => 
        props.$variant === 'primary' 
          ? 'rgba(96, 165, 250, 0.2)' 
          : 'rgba(255, 255, 255, 0.1)'
      };
      box-shadow: none;
    }
  }
`;

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddModel: (model: { id: string; name: string }) => void;
}

export const AddModelModal: React.FC<AddModelModalProps> = ({
  isOpen,
  onClose,
  onAddModel
}) => {
  const [modelId, setModelId] = useState('');
  const [modelName, setModelName] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 验证表单
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!modelId.trim()) {
      newErrors.modelId = '模型ID是必填项';
    } else if (!/^[a-zA-Z0-9\-_.:/ ]+$/.test(modelId.trim())) {
      newErrors.modelId = '模型ID只能包含字母、数字、连字符、下划线、点、冒号和斜杠';
    }
    
    if (!modelName.trim()) {
      newErrors.modelName = '模型名称是必填项';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理添加模型
  const handleAddModel = () => {
    if (validateForm()) {
      onAddModel({
        id: modelId.trim(),
        name: modelName.trim()
      });
      handleClose();
    }
  };

  // 关闭弹窗并重置表单
  const handleClose = () => {
    setModelId('');
    setModelName('');
    setErrors({});
    onClose();
  };

  // 处理输入变化时清除错误
  const handleInputChange = (field: string, value: string) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (field === 'modelId') {
      setModelId(value);
      // 同步模型ID到模型名称
      setModelName(value);
    } else if (field === 'modelName') {
      setModelName(value);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>添加模型</ModalTitle>
          <CloseButton onClick={handleClose}>×</CloseButton>
        </ModalHeader>

        <ModalContent>
          <FormGroup>
            <Label>
              模型ID<Required>*</Required>
            </Label>
            <Input
              type="text"
              value={modelId}
              onChange={(e) => handleInputChange('modelId', e.target.value)}
              placeholder="必填，例如 gpt-3.5-turbo"
              className={errors.modelId ? 'error' : ''}
            />
            {errors.modelId && <ErrorMessage>{errors.modelId}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>模型名称</Label>
            <Input
              type="text"
              value={modelName}
              onChange={(e) => handleInputChange('modelName', e.target.value)}
              placeholder="例如 GPT-4"
              className={errors.modelName ? 'error' : ''}
            />
            {errors.modelName && <ErrorMessage>{errors.modelName}</ErrorMessage>}
          </FormGroup>
        </ModalContent>

        <ModalFooter>
          <Button onClick={handleClose}>取消</Button>
          <Button 
            $variant="primary" 
            onClick={handleAddModel}
            disabled={!modelId.trim() || !modelName.trim()}
          >
            添加模型
          </Button>
        </ModalFooter>
      </ModalContainer>
    </ModalBackdrop>
  );
};