import styled, { css } from 'styled-components';

// GPU性能优化 - 移除所有动画keyframes

// 毛玻璃容器基础样式 - 独立导出供其他组件复用
export const glassBase = css`
  backdrop-filter: blur(6px) saturate(150%);
  /*border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };*/
  position: relative;
  //overflow: hidden;
  
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
    //标题栏背景色
    background: ${({ theme }) => theme.mode === 'dark'
    ? `linear-gradient(135deg, 
          rgba(59, 118, 214, 0.08) 0%,
          rgba(153, 71, 230, 0.05) 50%,
          rgba(69, 188, 243, 0.08) 100%)`
    : `linear-gradient(135deg, 
          rgba(59, 130, 246, 0.04) 0%,
          rgba(123, 24, 216, 0.05) 50%,
          rgba(14, 233, 193, 0.08) 100%)`
    };
  }
  &:hover::before {
    opacity: 1;
  }
`;

// 增强版毛玻璃样式 - 用于需要更强视觉效果的组件
export const enhancedGlassBase = css`
  ${glassBase}
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 10px 30px rgba(0, 0, 0, 0.2), inset 0 0 25px rgba(59, 130, 246, 0.05)'
    : '0 10px 30px rgba(0, 0, 0, 0.1), inset 0 0 25px rgba(59, 130, 246, 0.03)'
  };
`;

// 主容器
export const GlassContainer = styled.div`
  display: flex;
  height: 100vh;
  position: relative;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #ffffff 50%, #ffffff 70%,#E5F2DC60 100%)'
  };
`;

// 侧边栏
export const GlassSidebar = styled.div<{ $collapsed?: boolean }>`
  width: ${props => props.$collapsed ? '50px' : '90px'};
  background:  ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(13, 56, 112, 0.5)'
    : '#ffffff'
  };
  ${glassBase}
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px 0;
  position: relative;
  z-index: 5;
  gap:6px;
  pointer-events: auto;
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? 'inset 0 0 30px rgba(162, 168, 177, 0.15), 0 0 50px rgba(59, 130, 246, 0.1)'
    : 'inset 0 0 30px rgba(59, 130, 246, 0.08), 0 0 50px rgba(59, 130, 246, 0.05)'
  };
  transition: width 0.3s ease;
  
  /* 增强磨砂玻璃效果 */
  border-right: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
`;

// 侧边栏项目包装器
export const GlassSidebarItemWrapper = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 6px;
`;

// 侧边栏图标容器
export const GlassSidebarIconContainer = styled.div<{ $active?: boolean; $collapsed?: boolean }>`
  width: ${props => props.$collapsed ? '35px' : '50px'};
  height: ${props => props.$collapsed ? '33px' : '48px'};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: ${({ theme, $active }) => theme.mode === 'dark'
    ? ($active ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)')
    : ($active ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.08)')
  };
  color: ${({ theme, $active }) => $active
    ? theme.mode === 'dark' ? "#ffffff" : '#1acd84'
    : theme.mode === 'dark' ? theme.layout.colors.iconColor : theme.layout.colors.iconColor
  };

  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme, $active }) => theme.mode === 'dark'
    ? ($active ? 'rgba(171, 200, 248, 0.6)' : 'rgba(59, 130, 246, 0.2)')
    : ($active ? 'rgba(31, 158, 89, 0.4)' : 'rgba(59, 130, 246, 0.15)')
  };
  
  // /* 主要的气泡状效果 - 无动画 */
  // &::before {
  //   content: "";
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   width: 100%;
  //   height: 100%;
  //   background: linear-gradient(135deg, rgba(88, 148, 245, 0.3), rgba(171, 138, 238, 0.2));
  //   opacity: 0;
  //   z-index: -1;
  //   border-radius: inherit;
  // }
  
  svg, i {
    font-size: 25px;
    transition: all 0.3s ease;
    z-index: 1;
    filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.2));
  }
`;

// 侧边栏文字标签
export const GlassSidebarLabel = styled.span<{ $active?: boolean; $collapsed?: boolean }>`
  font-size: 13px;
  //这里要改theme,用上theme
  color: ${({ theme, $active }) => $active
    ? theme.layout.colors.iconActiveColor
    : theme.layout.colors.iconColor
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
export const GlassSidebarItem = styled.div<{ $active?: boolean; $collapsed?: boolean }>`
  ${GlassSidebarItemWrapper}
  
  /* 确保点击事件正常工作 */
  pointer-events: auto;
  position: relative;
  z-index: 6;
  
  &:hover ${GlassSidebarIconContainer} {
  color:${({ theme }) => theme.layout.colors.iconBg};
    transform: translateY(-1px) scale(1.0);
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 15px 35px rgba(59, 130, 246, 0.4)'
    : '0 15px 35px rgba(2, 216, 170, 0.4)'
  };
    border-color: rgba(59, 130, 246, 0.5);
  }
  
  &:hover ${GlassSidebarIconContainer}::before {
    opacity: 1;
  }
  
  &:hover ${GlassSidebarIconContainer} svg,
  &:hover ${GlassSidebarIconContainer} i {
    transform: scale(1.2);
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
  }
  
  &:hover ${GlassSidebarLabel} {
    color: ${({ theme }) => theme.layout.colors.labelColor};
    // text-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
  }
  
  ${props => props.$active && css`
    ${GlassSidebarIconContainer} {
      box-shadow: ${({ theme }) => theme.mode === 'dark'
      ? '0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 15px rgba(59, 130, 246, 0.3)'
      : '0 0 20px rgba(129, 229, 236, 0.3), inset 0 0 15px rgba(7, 252, 231, 0.15)'
    };
      
      &::before {
        opacity: 0.8;
      }
    }
  `}
`;

// 主内容区
export const GlassMain = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.1)'
    : 'rgba(248, 250, 252, 0.2)'
  };
`;

// 头部区域
export const GlassHeader = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(22, 42, 90, 0.2)'
    : 'rgba(248, 250, 252, 0.4)'
  };
  ${glassBase}
  padding: 30px;
  padding-bottom: 0px;
  position: relative;
  overflow: visible;
`;

// 描述信息
export const GlassDescInfo = styled.p`
  svg{
    width:18px;
    height:18px;
    color: ${({ theme }) => theme.mode === 'dark'
    ? '#ffffff'
    : '#000000'
  };
  }
`;

// 描述区域
export const GlassDescription = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.3)'
    : 'rgba(248, 250, 252, 0.5)'
  };
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 15px;
  ${enhancedGlassBase}
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.mode === 'dark' ? 'rgb(236, 238, 240)' : 'rgba(30, 41, 59, 0.75)'};
    margin: 0 0 12px 0;
    align-self: flex-start;
  }
  
  p {
    color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(148, 163, 184, 0.75)' : 'rgba(100, 116, 139, 0.75)'};
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

// Tab导航
export const GlassTabNav = styled.div`
  display: flex;
  gap: 2px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.2)'
    : 'rgba(248, 250, 252, 0.3)'
  };
  padding: 4px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : 'rgba(59, 130, 246, 0.08)'
  };
  width: fit-content;
`;

// Tab导航按钮
export const GlassTab = styled.button<{ $active?: boolean }>`
  padding: 10px 20px;
  background: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.25)'
      : 'rgba(59, 246, 135, 0.15)')
    : 'transparent'
  };
  color: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark' ? '#bfbfbf' : '#00A5B7')
    : (theme.mode === 'dark' ? '#969696' : '#94a3b8')
  };
  border: none;
  border-radius:6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover:not([disabled]) {
    color: ${({ $active, theme }) => $active
    ? '#C2BFD0'
    : (theme.mode === 'dark' ? theme.layout.colors.labelColor : '#94a3b8')
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

// 搜索容器
export const GlassSearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 350px;
`;

export const GlassSearchInput = styled.input`
  width: 100%;
  padding: 4px 12px 4px 45px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(66, 75, 97, 0.4)'
    : 'rgba(248, 250, 252, 0.6)'
  };

  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  border-radius: 25px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#1e293b'};
  font-size: 13px;
  // transition: all 0.3s ease;
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? 'inset 0 2px 6px rgba(0, 0, 0, 0.15)'
    : 'inset 0 2px 6px rgba(0, 0, 0, 0.05)'
  };
  
  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
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

export const GlassSearchIcon = styled.div`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  font-size: 13px;
  svg {
    margin-bottom:-2px;
  }
`;

// 搜索框右边的控制按钮
export const GlassControlButton = styled.button`
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
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  // transition: all 0.3s ease;
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
    // transform: translateY(-2px);
  }
`;

// 工作流卡片
export const GlassListCards = styled.div`
  background: ;
   background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(58, 76, 122, 0.3)'
    : 'rgba(248, 250, 252, 0.5)'
  };
   border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '#bfbfbf70'
  };
  border-radius: 4px;
  padding: 8px 22px 8px 22px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : '#99e7cb40'
  };
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

//卡片中的按钮
export const ListCardButtons = styled.button`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(36, 194, 140, 0.08)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(36, 194, 140, 0.15)'
  };
  border-radius: 4px;
  padding: 0px 14px;
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.9)'
    : 'rgba(31, 41, 59, 0.9)'
  };
  font-size: 12px;
  cursor: pointer;
  height:28px;
  backdrop-filter: blur(4px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 2px 8px rgba(0, 0, 0, 0.1)'
    : '0 2px 8px rgba(36, 194, 140, 0.1)'
  };
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(36, 194, 140, 0.3)'
  };
    border-color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.25)'
    : 'rgba(36, 194, 140, 0.25)'
  };
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 4px 12px rgba(0, 0, 0, 0.15)'
    : '0 4px 12px rgba(36, 194, 140, 0.15)'
  };
  }
  &:active {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(36, 194, 140, 0.08)'
  };
    border-color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(36, 194, 140, 0.15)'
  };
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 2px 8px rgba(0, 0, 0, 0.1)'
    : '0 2px 8px rgba(36, 194, 140, 0.1)'
  };
  }
`;

//卡片中的图标容器
export const ListCardIcons = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(36, 194, 140, 0.1)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(36, 194, 140, 0.08)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(36, 194, 140, 0.5)'
  };
    border-color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(36, 194, 140, 0.12)'
  };
  }
`;

/* 工作流卡片
export const GlassWorkflowCard = styled.div`
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
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 20px 50px rgba(0, 0, 0, 0.3), inset 0 0 35px rgba(59, 130, 246, 0.1)'
    : '0 20px 50px rgba(0, 0, 0, 0.15), inset 0 0 35px rgba(59, 130, 246, 0.05)'
  };
    border-color: rgba(59, 130, 246, 0.4);
  }
`;*/

// 开关切换
export const GlassToggleSwitch = styled.div<{ $active: boolean }>`
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
export const GlassStatusBadge = styled.span<{ $active?: boolean }>`
  background: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark'
      ? 'rgba(34, 197, 94, 0.25)'
      : 'rgba(34, 197, 94, 0.15)')
    : (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.25)'
      : 'rgba(147, 147, 147, 0.15)')
  };
  color: ${({ $active,theme }) => $active ?
  (theme.mode === 'dark'?'#22c55e' : 'green')
  :(theme.mode === 'dark'?'#bfbfbf90' : 'rgb(169 171 173)')};
  padding: 2px 10px;
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
export const GlassPagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 30px;
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : 'rgba(59, 130, 246, 0.08)'
  };
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.2)'
    : 'rgba(248, 250, 252, 0.3)'
  };
`;

export const GlassPageButton = styled.button<{ $active?: boolean }>`
  width: 28px;
  height: 28px;
  background: ${({ $active, theme }) => $active
    ? (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.3)'
      : 'rgba(59, 130, 246, 0.2)')
    : (theme.mode === 'dark'
      ? 'rgba(15, 23, 42, 0.4)'
      : 'rgba(248, 250, 252, 0.6)')
  };
  // backdrop-filter: blur(6px);
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
  border-radius: 2px;
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
    // transform: translateY(-2px);
  }
`;

// 开始按钮
// export const StartButton = styled(GlassButton)`
//   margin: 20px auto;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 12px 40px;
//   font-size: 16px;
//   font-weight: 600;
//   border-radius: 25px;
// `;

// 保持向后兼容的组件别名（逐步迁移使用）
// export const LiquidStartButton = StartButton;
export const LiquidGlassToggleSwitch = GlassToggleSwitch;

// 响应式支持
// export const ResponsiveContainer = styled.div`
//   @media (max-width: 768px) {
//     ${GlassContainer} {
//       flex-direction: column;
//     }
    
//     ${GlassSidebar} {
//       width: 100%;
//       height: 60px;
//       flex-direction: row;
//       justify-content: center;
//       padding: 10px 0;
//     }
    
//     ${GlassHeader} {
//       padding: 20px;
//     }
//   }
// `;