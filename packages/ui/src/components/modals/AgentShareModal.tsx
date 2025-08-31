import React, { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  ModalBackdrop,
  PremiumModalContainer,
  PremiumTitleDesc,
  ModalHeader,
  ModalContent,
  CloseButton,
  FormField,
  FormLabel,
  FormInput,
  FormButton,
  FormButtonGroup,
  PremiumFormButton,
  LiquidToast
} from '../basic';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeProvider';

// 淡入动画
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// 遮罩层
const ShareModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)'};
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.35s ease-out;
`;

// 模态窗容器
const ShareModalContainer = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(41, 41, 54, 0.55)'
    : 'rgba(255, 255, 255, 0.95)'
  };
  backdrop-filter: blur(6px);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.3)'
    : 'rgba(59, 130, 246, 0.2)'
  };
  border-radius: 12px;
  width: 80vw;
  max-width: 80vw;
  padding: 24px;
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(59, 130, 246, 0.2)'
    : '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)'
  };
  z-index: 10001;
  animation: ${fadeIn} 0.35s ease-out;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.1), 
      rgba(168, 85, 247, 0.05)
    );
    border-radius: inherit;
    opacity: 0.6;
    z-index: -1;
  }
`;

// 分享内容区域
const ShareSection = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width:80vw;
`;

// 分享链接输入框
const ShareLinkInput = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.textPrimary};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}20;
  }
  
  &:read-only {
    cursor: pointer;
  }
`;

// 复制按钮
const CopyButton = styled.button<{ $copied?: boolean }>`
  display: flex;
  min-width: 100px;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.$copied ? '#10b981' : '#3b82f6'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$copied ? '#059669' : '#2563eb'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// 分享选项
const ShareOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ShareOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    border-color: ${({ theme }) => theme.colors.borderHover};
  }
`;

const ShareOptionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ShareOptionTitle = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 500;
  font-size: 14px;
`;

const ShareOptionDesc = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

interface AgentShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName?: string;
  onCopyLink?: () => void;
}

export const AgentShareModal: React.FC<AgentShareModalProps> = ({
  isOpen,
  onClose,
  agentId,
  agentName = '智能体',
  onCopyLink
}) => {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/copilot?agent=${agentId}`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      // setToastMessage('分享链接已复制到剪贴板');
      // setToastType('success');
      // setShowToast(true);

      // 调用外部回调
      onCopyLink?.();

      // 2秒后重置复制状态
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      setToastMessage('复制链接失败');
      setToastType('error');
      setShowToast(true);
    }
  }, [shareUrl, onCopyLink]);

  const handleInputClick = () => {
    handleCopyLink();
  };

  if (!isOpen) return null;

  return (
    <>
      <ShareModalOverlay>
        <ShareSection>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <FormLabel style={{ color: theme.colors.textPrimary, marginBottom: '8px' }}>
                分享 "{agentName}" 智能体
              </FormLabel>
              <ShareOptionDesc style={{ marginBottom: '16px' }}>
                通过以下链接，其他人可以查看和使用这个智能体
              </ShareOptionDesc>
            </div>
            <FormButton
              onClick={onClose}
              style={{
                background: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.textPrimary,
                padding: '8px 16px',
                fontSize: '14px',
                width: '22px',
                height: '22px',
                minWidth: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </FormButton>
          </div>

          <div>
            <FormLabel style={{ color: theme.colors.textPrimary, marginBottom: '8px' }}>
              分享链接
            </FormLabel>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ShareLinkInput
                value={shareUrl}
                readOnly
                onClick={handleInputClick}
                title="点击复制链接"
              />
              <CopyButton
                $copied={copied}
                onClick={handleCopyLink}
                disabled={copied}
              >
                {copied ? (
                  <>
                    <FiCheck size={16} />
                    已复制
                  </>
                ) : (
                  <>
                    <FiCopy size={16} />
                    &nbsp;复&nbsp;&nbsp;制
                  </>
                )}
              </CopyButton>
            </div>
          </div>

          {/* <ShareOptions>
                <ShareOption>
                  <ShareOptionInfo>
                    <ShareOptionTitle>公开分享</ShareOptionTitle>
                    <ShareOptionDesc>任何人都可以通过链接访问这个智能体</ShareOptionDesc>
                  </ShareOptionInfo>
                </ShareOption>
                
                <ShareOption>
                  <ShareOptionInfo>
                    <ShareOptionTitle>查看权限</ShareOptionTitle>
                    <ShareOptionDesc>访问者可以查看智能体配置和对话</ShareOptionDesc>
                  </ShareOptionInfo>
                </ShareOption>
              </ShareOptions> */}
        </ShareSection>

      </ShareModalOverlay>

      {/* {showToast && (
        <LiquidToast
          title={toastType === 'success' ? '成功' : '错误'}
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )} */}
    </>
  );
};