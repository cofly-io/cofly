import styled, { createGlobalStyle } from 'styled-components';

// 添加缩放显示组件的样式
export const ZoomDisplay = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: ${({ theme }) => theme.colors.cardBg};
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 5;
  user-select: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.buttonHover};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const CanvasContainer = styled.div`
  width: 100%;
  height: 100%; /* 确保高度为100% */
  flex: 1;
  position: relative;
  /* 确保容器可以接收键盘焦点 */
  outline: none;

  &.drag-over {
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(51, 194, 238, 0.05);
      border: 2px dashed #33C2EE;
      pointer-events: none;
      z-index: 1000;
    }
  }

  /* 确保 ReactFlow 容器可以获得焦点 */
  .react-flow {
    outline: none;
  }
`;

export const EmptyCanvasMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  background-color: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 400px;

  h3 {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 10px;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  p {
    font-size: 14px;
    margin-bottom: 15px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  .drag-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 15px;
    font-size: 13px;
    color: ${({ theme }) => theme.colors.textTertiary};

    svg {
      margin-right: 8px;
      color: ${({ theme }) => theme.colors.accent};
    }
  }
`;


export const WorkflowContainer = styled.div`
  display: flex;
  height: calc(100vh - 65px);
  width: 100%;
`;

export const TestButtonContainer = styled.div<{ $menuCollapsed?: boolean; $debugTaskbarHeight?: number }>`
  position: fixed;
  bottom: ${({ $debugTaskbarHeight }) => ($debugTaskbarHeight || 0) + 25}px;
  left: ${({ $menuCollapsed }) => $menuCollapsed ? '50%' : '60%'};
  transform: translateX(-50%);
  z-index: 1001;
  transition: all 0.3s ease;
`;

export const TestButton = styled.button`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(14, 165, 233, 0.4))'
    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(14, 165, 233, 0.2))'
  };
  color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.4)'
    : 'rgba(59, 130, 246, 0.3)'
  };
  // border-radius: 25px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  width: 150px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  backdrop-filter: blur(8px) saturate(150%);
  position: relative;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 12px 30px rgba(59, 130, 246, 0.25)'
    : '0 12px 30px rgba(59, 130, 246, 0.15)'
  };

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 8px 20px rgba(59, 130, 246, 0.3)'
    : '0 8px 20px rgba(59, 130, 246, 0.15)'
  };
    border-color: rgba(59, 130, 246, 0.6);
  }

  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 8px 20px rgba(59, 130, 246, 0.3)'
    : '0 8px 20px rgba(59, 130, 246, 0.15)'
  };
  }

  &:disabled {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : 'rgba(59, 130, 246, 0.05)'
  };
    color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
    border-color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    backdrop-filter: blur(4px);
  }

  &:disabled::before {
    display: none;
  }
`;

// ReactFlow 全局样式覆盖
export const ReactFlowGlobalStyles = createGlobalStyle`
  /* 先重置所有panel的样式，避免相互影响 */
  .react-flow__panel {
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
  }

  /* 控制按钮样式 */
  .react-flow__controls-button {
    background: ${({ theme }) => theme.mode === 'dark'
    ? theme.colors.primary
    : '#fefefe'
  } !important;
    color: ${({ theme }) => theme.colors.textPrimary} !important;
    border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? theme.colors.border
    : '#eee'
  } !important;
    
    svg {
      fill: ${({ theme }) => theme.colors.textPrimary} !important;
    }
    
`;