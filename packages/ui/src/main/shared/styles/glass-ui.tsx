import styled, { keyframes, css } from 'styled-components';

// 移除动画效果以优化GPU性能

// 毛玻璃容器基础样式 - 独立导出供其他组件使用
export const glassBase = css`
  backdrop-filter: blur(6px) saturate(150%);
  /*border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };*/
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
    background: ${({ theme }) => theme.mode === 'dark'
    ? `linear-gradient(135deg, 
          rgba(59, 130, 246, 0.08) 0%,
          rgba(168, 85, 247, 0.05) 50%,
          rgba(14, 165, 233, 0.08) 100%)`
    : `linear-gradient(135deg, 
          rgba(59, 130, 246, 0.04) 0%,
          rgba(168, 85, 247, 0.02) 50%,
          rgba(14, 165, 233, 0.04) 100%)`
  };
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

// 增强版毛玻璃样式 - 用于需要更强视觉效果的组件
export const enhancedGlassBase = css`
  ${glassBase}
  backdrop-filter: blur(6px) saturate(160%) brightness(105%);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 10px 30px rgba(0, 0, 0, 0.2), inset 0 0 25px rgba(59, 130, 246, 0.05)'
    : '0 10px 30px rgba(0, 0, 0, 0.1), inset 0 0 25px rgba(59, 130, 246, 0.03)'
  };
`;

// 液态玻璃主容器
export const LiquidGlassContainer = styled.div`
  display: flex;
  height: 100vh;
  position: relative;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)'
  };
`;

// 液态玻璃侧边栏
export const LiquidGlassSidebar = styled.div<{ $collapsed?: boolean }>`
  width: ${props => props.$collapsed ? '60px' : '90px'};
  background: ${({ theme }) => theme.layout?.colors?.sidebarBg || (theme.mode === 'dark'
    ? 'rgba(13, 56, 112, 0.5)'
    : 'rgba(0, 181, 162, 0.1)'
  )};
  ${glassBase}
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  position: relative;
  z-index: 5;
  pointer-events: auto;
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? 'inset 0 0 30px rgba(117, 167, 247, 0.15), 0 0 50px rgba(59, 130, 246, 0.1)'
    : 'inset 0 0 30px rgba(59, 130, 246, 0.08), 0 0 50px rgba(59, 130, 246, 0.05)'
  };
  transition: width 0.3s ease;
  
  /* 增强磨砂玻璃效果 */
  border-right: 1px solid ${({ theme }) => theme.layout?.colors?.sidebarBorder || (theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(0, 181, 162, 0.2)'
  )};
`;

// 液态玻璃侧边栏项目包装器
export const LiquidGlassSidebarItemWrapper = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 6px;
`;

// 液态玻璃侧边栏图标容器
export const LiquidGlassSidebarIconContainer = styled.div<{ $active?: boolean; $collapsed?: boolean }>`
  width: ${props => props.$collapsed ? '40px' : '50px'};
  height: ${props => props.$collapsed ? '38px' : '48px'};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: ${({ theme, $active }) => $active
    ? theme.layout?.colors?.iconActiveBg || (theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(36, 194, 140, 0.25)')
    : theme.layout?.colors?.iconBg || (theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(36, 194, 140, 0.15)')
  };
  color: ${({ theme, $active }) => {
    if ($active) {
      return theme.layout?.colors?.iconActiveColor || '#ffffff';
    }
    return theme.layout?.colors?.iconColor || (theme.mode === 'dark' ? '#bfbfbf' : '#6b7280');
  }};

  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme, $active }) => theme.mode === 'dark'
    ? ($active ? 'rgba(171, 200, 248, 0.6)' : 'rgba(59, 130, 246, 0.2)')
    : ($active ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.15)')
  };
  
  /* 主要的气泡状效果 */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(88, 148, 245, 0.3), rgba(171, 138, 238, 0.2));
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
    border-radius: inherit;
  }
  
  svg, i {
    font-size: 26px;
    transition: all 0.3s ease;
    z-index: 1;
    filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.2));
  }
`;

// 液态玻璃侧边栏文字标签
export const LiquidGlassSidebarLabel = styled.span<{ $active?: boolean; $collapsed?: boolean }>`
  font-size: 13px;
  color: ${({ theme, $active }) => $active
    ? theme.layout?.colors?.labelActiveColor || '#ffffff'
    : theme.layout?.colors?.labelColor || (theme.mode === 'dark' ? '#C0C0C0' : '#4361A7')
  };
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  opacity: ${props => props.$collapsed ? 0 : 1};
  transform: ${props => props.$collapsed ? 'scale(0.8)' : 'scale(1)'};
  line-height: 2.5;
  letter-spacing: 1.5px;
`;

// 兼容性别名，保持原有组件可用
export const LiquidGlassSidebarItem = styled.div<{ $active?: boolean; $collapsed?: boolean }>`
  ${LiquidGlassSidebarItemWrapper}  
  /* 确保点击事件正常工作 */
  pointer-events: auto;
  position: relative;
  z-index: 6;
  
  /*
  &:hover ${LiquidGlassSidebarIconContainer} {
    color:rgb(209, 209, 209);
    transform: translateY(-3px) scale(1.05);
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 15px 35px rgba(59, 130, 246, 0.4)'
    : '0 15px 35px rgba(59, 130, 246, 0.2)'
  };
    border-color: rgba(59, 130, 246, 0.5);
  }
  
  &:hover ${LiquidGlassSidebarIconContainer}::before {
    opacity: 1;
  }
  
  &:hover ${LiquidGlassSidebarIconContainer} svg,
  &:hover ${LiquidGlassSidebarIconContainer} i {
    transform: scale(1.2);
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
  }
  
  &:hover ${LiquidGlassSidebarLabel} {
    color: ${({ theme }) => theme.mode === 'dark' ? '#C2BFD0' : '#3b82f6'};
    //transform: scale(1.1);
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
  }
  */
  ${props => props.$active && css`
    ${LiquidGlassSidebarIconContainer} {
      box-shadow: ${({ theme }) => theme.mode === 'dark'
      ? '0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 15px rgba(59, 130, 246, 0.3)'
      : '0 0 20px rgba(59, 130, 246, 0.3), inset 0 0 15px rgba(59, 130, 246, 0.15)'
    };
      
      &::before {
        opacity: 0.8;
      }
    }
  `}
`;

// 液态玻璃主内容
export const LiquidGlassMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.1)'
    : 'rgba(248, 250, 252, 0.2)'
  };
  backdrop-filter: blur(3px);
`;

// 液态玻璃头部区
export const LiquidGlassHeader = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.25)'
    : 'rgba(248, 250, 252, 0.4)'
  };
  ${glassBase}
  /*border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.15)'
    : 'rgba(59, 130, 246, 0.1)'
  };*/
  padding: 30px;
  padding-bottom: 12px;
  position: relative;
  overflow: hidden;
`;

// 液态玻璃创建按钮>>>为什么这里也有个LiquidGlassButton
export const LiquidGlassButton = styled.button`
  background: ${({ theme }) => theme.page?.colors?.buttonBg || (theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(14, 165, 233, 0.4))'
    : 'linear-gradient(135deg, rgba(36, 194, 140, 0.4), rgba(0, 181, 162, 0.4))'
  )};
  color: ${({ theme }) => theme.page?.colors?.buttonText || (theme.mode === 'dark' ? '#e2e8f0' : '#ffffff')};
  border: 1px solid ${({ theme }) => theme.page?.colors?.buttonBorder || (theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.4)'
    : 'rgba(36, 194, 140, 0.4)'
  )};
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  backdrop-filter: blur(6px);
  position: relative;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 6px 20px rgba(59, 130, 246, 0.25)'
    : '0 6px 20px rgba(59, 130, 246, 0.15)'
  };
  // display: flex;
  // align-items: center;  
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
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 12px 30px rgba(59, 130, 246, 0.4)'
    : '0 12px 30px rgba(59, 130, 246, 0.2)'
  };
    border-color: rgba(59, 130, 246, 0.6);
  }
  
  &:hover::before {
    left: 100%;
  }
  span{
    padding-right:8px;
  }
`;

// 液态玻璃描述区
export const LiquidGlassDescription = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.page?.colors?.cardBg || (theme.mode === 'dark'
    ? 'rgba(15, 75, 131, 0.5)'
    : 'rgba(248, 250, 252, 0.4)'
  )};
  width: 100%;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 15px;
  ${enhancedGlassBase}
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.page?.colors?.cardTitle || (theme.mode === 'dark' ? 'rgb(236, 238, 240)' : '#4361A7')};
    margin: 0 0 12px 0;
    align-self: flex-start;
  }

  p {
    color: ${({ theme }) => theme.page?.colors?.cardText || (theme.mode === 'dark' ? 'rgba(148, 163, 184, 0.75)' : '#6B7280')};
    line-height: 1.6;
    font-size: 14px;
  }
  
  a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    
    &:hover {
      color: #60a5fa;
      text-shadow: 0 0 10px rgba(59, 130, 246, 0.6);
    }
  }
`;

export const LiquidGlassDescInfo = styled.p`
  //flex: 1;
`;

// 液态玻璃Tab导航
export const LiquidGlassTabNav = styled.div`
  display: flex;
  gap: 2px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.2)'
    : 'rgba(248, 250, 252, 0.3)'
  };
  padding: 4px;
  border-radius: 12px;
  backdrop-filter: blur(6px);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : 'rgba(59, 130, 246, 0.08)'
  };
  width: fit-content;
`;


// 液态玻璃Tab导航按钮
export const LiquidGlassTab = styled.button<{ $active?: boolean }>`
  padding: 10px 20px;
  background: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.25)'
      : 'rgba(59, 130, 246, 0.15)')
    : 'transparent'
  };
  color: ${({ $active, theme }) => $active
    ? '#DDDDDD'
    : (theme.mode === 'dark' ? '#969696' : '#94a3b8')
  };
  border: none;
  border-radius:6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  ${props => props.$active && css`
    box-shadow: ${({ theme }) => theme.mode === 'dark'
      ? '0 4px 12px rgba(59, 130, 246, 0.3)'
      : '0 4px 12px rgba(59, 130, 246, 0.2)'
    };
  `}
  
  &:hover:not([disabled]) {
    color: ${({ $active, theme }) => $active
    ? '#C2BFD0'
    : (theme.mode === 'dark' ? '#94a3b8' : '#64748b')
  };
    background: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.25)'
      : 'rgba(59, 130, 246, 0.15)')
    : (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.1)'
      : 'rgba(59, 130, 246, 0.05)')
  };
  }
`;

// 液态玻璃搜索容器
export const LiquidGlassSearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 350px;
`;

export const LiquidGlassSearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 45px;
  background: ${({ theme }) => theme.page?.colors?.inputBg || (theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.4)'
    : 'rgba(248, 250, 252, 0.6)'
  )};

  border: 1px solid ${({ theme }) => theme.page?.colors?.inputBorder || (theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(0, 181, 162, 0.2)'
  )};
  border-radius: 25px;
  color: ${({ theme }) => theme.page?.colors?.inputText || (theme.mode === 'dark' ? '#e2e8f0' : '#4361A7')};
  font-size: 14px;
  // transition: all 0.3s ease;
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? 'inset 0 2px 6px rgba(0, 0, 0, 0.15)'
    : 'inset 0 2px 6px rgba(0, 0, 0, 0.05)'
  };
  
  &::placeholder {
    color: ${({ theme }) => theme.page?.colors?.inputPlaceholder || (theme.mode === 'dark' ? '#64748b' : '#94a3b8')};
  }
  
  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 0 0 3px rgba(59, 130, 246, 0.2), inset 0 2px 6px rgba(0, 0, 0, 0.15)'
    : '0 0 0 3px rgba(59, 130, 246, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.05)'
  };
  }
`;

export const LiquidGlassSearchIcon = styled.div`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.page?.colors?.iconColor || (theme.mode === 'dark' ? '#64748b' : '#94a3b8')};
  font-size: 14px;
`;

// 液态玻璃控制按钮
export const LiquidGlassControlButton = styled.button`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.4)'
    : 'rgba(248, 250, 252, 0.6)'
  };
  backdrop-filter: blur(6px);
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.1)'
  };
    color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'};
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
  }
`;

// 液态玻璃工作流卡片
export const LiquidGlassWorkflowCard = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(58, 76, 122, 0.3)'
    : 'rgba(248, 250, 252, 0.5)'
  };
  backdrop-filter: blur(6px) saturate(160%);
  border-radius: 4px;
  padding: 12px 22px 12px 22px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.15)'
    : 'rgba(59, 130, 246, 0.1)'
  };
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 10px 30px rgba(0, 0, 0, 0.2), inset 0 0 25px rgba(59, 130, 246, 0.05)'
    : '0 10px 30px rgba(0, 0, 0, 0.1), inset 0 0 25px rgba(59, 130, 246, 0.03)'
  };
  margin-bottom: 15px;
  cursor: pointer;
  ${glassBase}
  
  &:hover {
    //transform: translateY(-8px);
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 20px 50px rgba(0, 0, 0, 0.3), inset 0 0 35px rgba(59, 130, 246, 0.1)'
    : '0 20px 50px rgba(0, 0, 0, 0.15), inset 0 0 35px rgba(59, 130, 246, 0.05)'
  };
    border-color: rgba(59, 130, 246, 0.4);
  }
`;

// 液态玻璃开关
export const LiquidGlassToggleSwitch = styled.div<{ $active: boolean }>`
  position: relative;
  width: 44px;
  height: 24px;
  background: ${({ $active, theme }) => $active
    ? 'rgba(59, 130, 246, 0.5)'
    : (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.2)'
      : 'rgba(59, 130, 246, 0.15)')
  };
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(6px);
  border: 1px solid ${({ $active, theme }) => $active
    ? 'rgba(59, 130, 246, 0.6)'
    : (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.3)'
      : 'rgba(59, 130, 246, 0.2)')
  };
  
  ${props => props.$active && css`
    box-shadow: 0 0 15px rgba(59, 130, 246, 0.4);
  `}
  
  &::before {
    content: "";
    position: absolute;
    top: 2px;
    left: ${props => props.$active ? '22px' : '2px'};
    width: 18px;
    height: 18px;
    background: ${({ $active }) => $active ? '#3b82f6' : '#e2e8f0'};
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: ${({ $active }) => $active
    ? '0 2px 10px rgba(59, 130, 246, 0.5)'
    : '0 2px 6px rgba(0, 0, 0, 0.25)'
  };
  }
`;

// 状态徽章
export const LiquidGlassStatusBadge = styled.span<{ $active?: boolean }>`
  background: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark'
      ? 'rgba(34, 197, 94, 0.25)'
      : 'rgba(34, 197, 94, 0.15)')
    : (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.25)'
      : 'rgba(59, 130, 246, 0.15)')
  };
  color: ${({ $active }) => $active ? '#22c55e' : '#3b82f6'};
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid ${({ $active, theme }) => $active
    ? (theme.mode === 'dark'
      ? 'rgba(34, 197, 94, 0.3)'
      : 'rgba(34, 197, 94, 0.2)')
    : (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.3)'
      : 'rgba(59, 130, 246, 0.2)')
  };
  backdrop-filter: blur(6px);
`;

// 分页区域
export const LiquidGlassPagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : 'rgba(59, 130, 246, 0.08)'
  };
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.2)'
    : 'rgba(248, 250, 252, 0.3)'
  };
  backdrop-filter: blur(6px);
`;

export const LiquidGlassPageButton = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  background: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.3)'
      : 'rgba(59, 130, 246, 0.2)')
    : (theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.4)'
      : 'rgba(248, 250, 252, 0.6)')
  };
  backdrop-filter: blur(6px);
  border: 1px solid ${({ $active, theme }) => $active
    ? 'rgba(59, 130, 246, 0.5)'
    : (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.2)'
      : 'rgba(59, 130, 246, 0.15)')
  };
  color: ${({ $active, theme }) => $active
    ? '#3b82f6'
    : (theme.mode === 'dark' ? '#94a3b8' : '#64748b')
  };
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.3)'
      : 'rgba(59, 130, 246, 0.2)')
    : (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.2)'
      : 'rgba(59, 130, 246, 0.1)')
  };
    color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'};
    border-color: rgba(59, 130, 246, 0.4);
    transform: translateY(-2px);
  }
`;

// 响应式支持
// export const ResponsiveContainer = styled.div`
//   @media (max-width: 768px) {
//     ${LiquidGlassContainer} {
//       flex-direction: column;
//     }
    
//     ${LiquidGlassSidebar} {
//       width: 100%;
//       height: 60px;
//       flex-direction: row;
//       justify-content: center;
//       padding: 10px 0;
//     }
    
//     ${LiquidGlassHeader} {
//       padding: 20px;
//     }
//   }
// `;
