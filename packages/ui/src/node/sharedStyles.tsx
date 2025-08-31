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