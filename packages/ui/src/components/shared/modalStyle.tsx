import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  height: 100%;
  min-height: 500px;
  overflow: hidden;
  position: relative;
  
  /* 小屏幕垂直布局 */
  @media (max-width: 768px) {
    flex-direction: column;
  }
  
  /* 自定义滚动条样式 */
  * {
    scrollbar-width: thin;
    scrollbar-color: #bfbfbf transparent;
  }
  
  *::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  *::-webkit-scrollbar-track {
    background: transparent;
  }
  
  *::-webkit-scrollbar-thumb {
    background-color: #bfbfbf;
    border-radius: 3px;
  }
  
  *::-webkit-scrollbar-thumb:hover {
    background-color: #999;
  }
`;

export const ConfigPanel = styled.div<{ $hasDialogue: boolean }>`
  width: ${props => props.$hasDialogue ? '55%' : '100%'};
  padding: 20px;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: all 0.3s ease;
  
  /* 小屏幕适配 */
  @media (max-width: 1200px) {
    width: ${props => props.$hasDialogue ? '50%' : '100%'};
  }
  
  @media (max-width: 768px) {
    width: 100%;
    height: ${props => props.$hasDialogue ? '60%' : '100%'};
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
`;

export const Icon = styled.div`
  font-size: 32px;
  margin-right: 16px;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

export const Subtitle = styled.p`
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #666;
`;

// 移除 Form 的滚动条，让 ConfigPanel 统一处理滚动
export const FormSection = styled.div`
  margin-bottom: 24px;
`;

export const FieldsGrid = styled.div<{ $hasDialogue: boolean }>`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0px;
  //gap: 16px;
  margin-bottom: 16px;
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
  background: white;
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.$variant === 'primary' ? '#33C2EE' : '#ddd'};
  background: ${props => props.$variant === 'primary' ? '#33C2EE' : 'white'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#333'};
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$variant === 'primary' ? '#2AA8CC' : '#f5f5f5'};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const TestButton = styled(Button)`
  background: #52c41a;
  border-color: #52c41a;
  color: white;

  &:hover:not(:disabled) {
    background: #389e0d;
    border-color: #389e0d;
  }
`;

export const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 8px 12px;
  border-radius: 4px;
  margin: 12px 0;
  font-size: 13px;
  background: ${props => {
    switch (props.type) {
      case 'success': return '#f6ffed';
      case 'error': return '#fff2f0';
      case 'info': return '#e6f4ff';
      default: return '#f5f5f5';
    }
  }};
  border: 1px solid ${props => {
    switch (props.type) {
      case 'success': return '#b7eb8f';
      case 'error': return '#ffccc7';
      case 'info': return '#91caff';
      default: return '#d9d9d9';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#389e0d';
      case 'error': return '#cf1322';
      case 'info': return '#1677ff';
      default: return '#333';
    }
  }};
`;

export const InputContainer = styled.div`
  margin-bottom: 12px;
`;

export const Label = styled.label`
  margin: 4px 0 4px 0;
  font-size: 12px;
  color: rgba(255, 255, 255);
  line-height: 1.4;
  font-style: normal;
`;

export const Required = styled.span`
  color: #cf1322;
`;

export const TextInput = styled.input`
  width: 100%;
  height: 32px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.05);
  color: #e2e8f0;
  transition: all 0.2s ease;
  outline: none;
  box-sizing: border-box;
`;