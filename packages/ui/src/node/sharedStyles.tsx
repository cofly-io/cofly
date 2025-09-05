import styled from 'styled-components';

// 共享面板样式
export const Panel = styled.div.attrs<{ $width: number }>(props => ({
  style: {
    width: `${props.$width}%`,
  },
})) <{ $width: number }>`
  height: 96vh;
  background: ${({ theme }) => theme.panel.panelBg};
  overflow: hidden;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
`;

export const PanelTitle = styled.div`
  color: ${({ theme }) => theme.colors.accent};
  margin: 12px 10px;
  font-size: 14px;
  font-weight: 600;
`;

// 主要容器，包含标题和内容区域
export const OutputContainer = styled.div`
  flex: 1;
  //border-radius:18px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// 容器标题区域
export const OutputContainerTitle = styled.div` 
  //border: 1px solid #1d4f91;
  //border-bottom: none;
  // border-radius:12px 0px 0 0;
  background: ${({ theme }) => theme.panel.nodeBg};
  padding: 16px 12px 0px 16px;
  flex-shrink: 0;  
  /*background:${({ theme }) => theme.colors.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};*/
`;

// 容器内容区域，可滚动
export const OutputContainerContent = styled.div`
  flex: 1;
  overflow: auto;
  padding: 0px 16px;
  // font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textPrimary};
  white-space: pre-wrap;
  word-break: break-word;
  //border: 1px solid #1d4f91;
  //border-top: none;
  background: ${({ theme }) => theme.panel.nodeBg};
  // 隐藏滚动条
  scrollbar-width: none;      
  -ms-overflow-style: none; 
  ::-webkit-scrollbar {
    display: none;
  }
`;

// 空状态样式组件
export const NodeEmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  text-align: center;
`;

export const NodeEmptyStateText = styled.div`
  margin-bottom: 16px;
  font-size:12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`; 

/**********LeftPanel*********************/
// Left panel specific styles
export const PreviousNodeSelector = styled.div`
  margin-bottom: 16px;
`;

export const SelectorLabel = styled.div`
  display: inline-block;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  margin-bottom: 8px;
`;

export const SelectDropdown = styled.select`
  border: 1px solid ${({ theme }) => theme.panel.ctlBorder};
  background: ${({ theme }) => theme.panel.nodeBg};
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  width: 40%;
  padding: 2px 8px;
  border-radius: 2px;
  font-size: 12px;
  &:focus {
    outline: none;
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.inputBg}80;
    color: ${({ theme }) => theme.colors.textSecondary};
    cursor: not-allowed;
  }
`;

// JSON/Schema 按钮容器
export const ButtonGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
`;

// JSON/Schema 按钮样式
export const DataViewButton = styled.button<{ $active?: boolean }>`
  background: ${({ theme, $active }) =>
    $active ? theme.colors.accent : theme.panel.nodeBg
  };
  color: ${({ theme, $active }) =>
    $active ? 'white' : theme.colors.textPrimary
  };
  border: 1px solid ${({ theme, $active }) =>
    $active ? theme.panel.ctlBorder : theme.panel.ctlBorder
  };
  border-radius: 2px;
  padding: 3px 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 50px;
  height:24px;

  &:hover {
    background: ${({ theme, $active }) =>
    $active ? theme.colors.accent : theme.colors.buttonHover
  };
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.inputBg}80;
    color: ${({ theme }) => theme.colors.textSecondary};
    border-color: ${({ theme }) => theme.colors.border};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

// 旋转动画
export const spinAnimation = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// 添加执行按钮样式
export const ExecuteButton = styled.button<{ $disabled: boolean }>`
  ${spinAnimation}
  
  background: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.accent || '#4fc3f7'};
  width: 180px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 2px;
  padding: 8px 16px;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    opacity: ${({ $disabled }) => $disabled ? 1 : 0.8};
    transform: ${({ $disabled }) => $disabled ? 'none' : 'translateY(-1px)'};
  }
  
  .loading-icon {
    animation: spin 1s linear infinite;
    font-size: 14px;
  }
`;

/**********RightPanel*********************/
// Right panel for current node test output
export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.panel.nodeBg};
`;

export const ActionContainer = styled.div`
  padding: 12px 20px 0px 0px;
  // display: flex;
  // gap: 8px;
  // align-items: center;
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  background: ${({ theme, $variant }) =>
    $variant === 'primary'
      ? theme.colors.success || '#2ed573'
      : theme.panel.panelBg
  };
  color: ${({ theme, $variant }) =>
    $variant === 'primary'
      ? 'white'
      : theme.colors.textPrimary
  };
  border: 0px solid ${({ theme, $variant }) =>
    $variant === 'primary'
      ? 'transparent'
      : theme.colors.border
  };
  border-radius: 2px;
  padding: 0px 0px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
    // transform: translateY(-1px);
  }
`;

export const SetMockButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.accent || '#4fc3f7'};
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  text-decoration: underline;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.accentHover || '#29b6f6'};
    text-decoration: none;
  }
  
  &:focus {
    outline: none;
    text-decoration: none;
  }
`;

export const CodeMirrorContainer = styled.div`\r
  height: 100%;
  
  .cm-editor {
    height: 100%;
    background: transparent;
    border: none;
  }
  
  .cm-focused {
    outline: none;
  }
  
  .cm-content {
    padding: 8px;
  }
  
  .cm-scroller {
    font-size: 12px;
  }
`;

export const EditModeActions = styled.div`
  display: flex;
  gap: 10px;
  padding: 0px 12px 0px 0px;
  justify-content: right;
  margin-top: 12px;
`;