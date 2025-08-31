import styled , { createGlobalStyle }  from 'styled-components';

// 主容器 - 左右布局
export const ChatDisplayContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background-color: ${({ theme }) => theme.mode === 'dark' ? '#0f1b3a' : '#f8fafc'};
`;

// 左侧历史区域
export const HistoryPanel = styled.div<{ $isVisible: boolean; $width: number }>`
  width: ${props => props.$isVisible ? props.$width : 0}px;
  height: 100%;
  background-color: ${({ theme }) => theme.mode === 'dark' ? '#0a1428' : '#ffffff'};
  border-right: ${props => props.$isVisible ? `1px solid ${props.theme.colors.border}` : 'none'};
  overflow: hidden;
  transition: ${props => props.$isVisible ? 'width 0.2s ease' : 'none'};
  flex-shrink: 0;
`;

// 右侧聊天区域
export const ChatPanel = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

// 聊天区域头部
export const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  backdrop-filter: blur(10px);
  flex-shrink: 0;
`;

export const AgentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const AgentAvatar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border: 2px solid ${({ theme }) => theme.colors.border};
`;

export const AgentName = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-shadow: ${({ theme }) => theme.mode === 'dark' ? '0 0 10px rgba(255, 255, 255, 0.3)' : 'none'};
`;

// Styled Components
export const ChatContainer = styled.div<{ $theme: string }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  color: ${({ theme }) => theme.colors.textPrimary};
  background-color: ${({ theme }) => theme.mode === 'dark' ? '#0f1b3a' : '#ffffff'};
`

export const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const MessageContainer = styled.div<{ $role: string }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$role === 'user' ? 'flex-end' : 'flex-start'};
  max-width: 85%;
  ${props => props.$role === 'user' ? 'margin-left: auto;' : 'margin-right: auto;'}
`

export const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`

export const RoleBadge = styled.span<{ $role: string }>`
  background: ${props => props.$role === 'user' 
    ? (props.theme.mode === 'dark' ? '#007bff' : '#24C28C')
    : (props.theme.mode === 'dark' ? '#6c757d' : '#94a3b8')
  };
  color: ${({ theme }) => theme.mode === 'dark' ? 'white' : 'white'};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`

export const Timestamp = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const MessageContent = styled.div<{ $theme?: string; $hasThinkContent?: boolean; $isMine?: boolean }>`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa'};
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 100%;
  
  p, main, section  {
    margin: 0 0 8px 0;
    &:last-child {
      margin-bottom: 0;
    };
    font-size: 13px;
    font-weight: 200;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  ${props => !props.$isMine && !props.$hasThinkContent && `
    p {
      color: ${props.theme.colors.textSecondary};
      font-size: 12px;
    }
  `}

  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin: 16px 0 8px 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    &:first-child {
      margin-top: 0;
    }
  }
`

export const CodeBlockContainer = styled.div`
  margin: 16px 0;
  border-radius: 4px;
  overflow: hidden;  
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(7, 79, 138)' : '#f1f3f4'};
  /* Ensure this container is not treated as a paragraph */
  display: block;
`

export const CodeBlockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(7, 79, 138, 0.66)' : '#e9ecef'};
`

export const LanguageLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#cfcfcfff' : '#495057'};
`

export const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

export const ToolButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: ${({ theme }) => theme.mode === 'dark' ? '#ededed' : '#495057'};
  font-size: 12px;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#dee2e6' : '#f8f9fa'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#495057' : '#212529'};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const CodeBlockContent = styled.div<{ $wrapped: boolean }>`
  // max-height: ${props => props.$wrapped ? 'none' : '400px'};
  // overflow: auto;
`

export const InlineCode = styled.code`
  background: ${({ theme }) => theme.mode === 'dark' ? '#f1f3f4' : '#f8f9fa'};
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
  color: ${({ theme }) => theme.mode === 'dark' ? '#d63384' : '#e83e8c'};
`

export const ImageContainer = styled.div`
  margin: 16px 0;
  text-align: center;
`

export const Blockquote = styled.blockquote`
  border-left: 4px solid ${({ theme }) => theme.colors.accent};
  margin: 16px 0;
  padding-left: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-style: italic;
`

export const TableContainer = styled.div`
  overflow-x: auto;
  margin: 16px 0;  
  table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
      border: 1px solid ${({ theme }) => theme.colors.border};
      padding: 8px 12px;
      text-align: left;
      color: ${({ theme }) => theme.colors.textPrimary};
    }
    
    th {
      background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f8f9fa'};
      font-weight: 600;
    }
  }
`

export const InputContainer = styled.div`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.secondaryBorder};
  background: ${({ theme }) => theme.mode === 'dark' ? '#0f1b3a' : '#f8f9fa'};
`

export const InputForm = styled.form`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`

export const TextArea = styled.textarea`
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`

export const SendButton = styled.button`
  padding: 12px 24px;
  background: ${({ theme }) => theme.colors.accent};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.accentHover};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.textSecondary};
    animation: typing 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
  
  @keyframes typing {
    0%, 80%, 100% { opacity: 0.5; }
    40% { opacity: 1; }
  }
`

export const ThinkingBlock = styled.div`
  position: relative;
  margin-bottom: 14px;
  padding: 30px 20px 20px 20px;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(245, 245, 245, 0.21)' : 'rgba(0, 0, 0, 0.1)'} !important;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(248, 250, 252, 0.5)'};
  
  p {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
  
  &::before {
    content: '思考过程';
    position: absolute;
    top: -5px;
    left: -5px;
    border-radius: 5px;
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(75, 75, 75, 1)' : 'rgba(100, 116, 139, 1)'};
    color: white;
    font-size: 0.75em;
    padding: 2px 8px;
    font-style: normal;
  }
`

// 为原始 HTML think 标签添加全局样式
// export const GlobalThinkStyles = createGlobalStyle`
//   .thinking-block code {
//     background-color: rgba(200, 200, 200, 0.2) !important;
//     color: inherit !important;
//   }
  
//   .thinking-block pre {
//     background-color: rgba(0, 0, 0, 0.1) !important;
//     border: 1px solid rgba(255, 255, 255, 0.1) !important;
//   }
// `