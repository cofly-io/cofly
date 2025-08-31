import styled from 'styled-components';

// 主题适配的容器组件
// export const WelcomeContainer = styled.div`
//   flex: 1;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 40px;
// `;

// export const WelcomeContent = styled.div`
//   text-align: center;
//   max-width: 400px;
// `;

// export const WelcomeTitle = styled.h2`
//   font-size: 24px;
//   font-weight: 600;
//   margin-bottom: 16px;
//   color: ${({ theme }) => theme.colors.textPrimary};
// `;

// export const IconContainer = styled.div`
//   margin-bottom: 30px;
//   color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  
//   svg {
//     font-size: 3rem;
//     opacity: 0.7;
//     transition: all 0.3s ease;
//   }
  
//   &:hover svg {
//     opacity: 1;
//     transform: scale(1.1);
//     color: ${({ theme }) => theme.mode === 'dark' ? '#e2e8f0' : '#374151'};
//   }
// `;

// export const EmptyContainer = styled.div`
//   flex: 1;
//   display: flex;
//   flex-direction: column;
//   min-height: 0;
//   margin-top: 4px;
// `;

// export const HeaderContainer = styled.div`
//   display: flex;
//   align-items: flex-start;
// `;

// export const TitleContainer = styled.div`
//   flex: 1;
  
//   h2 {
//     margin: 0;
//     color: ${({ theme }) => theme.colors.textPrimary};
//     font-size: 28px;
//     font-weight: 600;
//   }
// `;

// export const ButtonGroup = styled.div`
//   align-self: center;
// `;

// export const PlaceholderContainer = styled.div`
//   margin-top: 40px;
// `; 

/********************************************************** */
// import styled from 'styled-components';

// export const AgentListContainer = styled.div`
//   height: 100%;
//   display: flex;
//   flex-direction: column;
// `;

// export const AgentCardsArea = styled.div`
//   flex: 1;
//   overflow-y: auto;
//   padding: 20px;
//   background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
//   position: relative;
  
//   &::-webkit-scrollbar {
//     width: 8px;
//   }
  
//   &::-webkit-scrollbar-track {
//     background: rgba(255, 255, 255, 0.1);
//     border-radius: 4px;
//   }
  
//   &::-webkit-scrollbar-thumb {
//     background: rgba(255, 255, 255, 0.3);
//     border-radius: 4px;
    
//     &:hover {
//       background: rgba(255, 255, 255, 0.5);
//     }
//   }
// `;

// export const EmptyStateContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   height: 100%;
//   color: rgba(255, 255, 255, 0.6);
//   font-size: 16px;
// `;

// export const AgentGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
//   gap: 20px;
//   align-content: start;
// `;

// export const AgentCardContainer = styled.div<{ avatarColor: string }>`
//   background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
//   border: 1px solid rgba(255, 255, 255, 0.2);
//   border-radius: 12px;
//   padding: 20px;
//   cursor: pointer;
//   transition: all 0.3s ease;
//   position: relative;
//   overflow: hidden;
//   backdrop-filter: blur(10px);
//   box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
  
//   &:hover {
//     transform: translateY(-2px);
//     box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3);
//     border-color: ${props => props.avatarColor}40;
//   }
// `;

// export const DecorativeBackground = styled.div<{ avatarColor: string }>`
//   position: absolute;
//   top: -50%;
//   left: -50%;
//   width: 200%;
//   height: 200%;
//   background: radial-gradient(circle, ${props => props.avatarColor}15 0%, transparent 70%);
//   pointer-events: none;
//   z-index: 0;
// `;

// export const BottomDecorativeLine = styled.div<{ avatarColor: string }>`
//   position: absolute;
//   bottom: 0;
//   left: 0;
//   right: 0;
//   height: 2px;
//   background: linear-gradient(90deg, transparent 0%, ${props => props.avatarColor}60 50%, transparent 100%);
//   z-index: 1;
// `;

// export const AgentIconContainer = styled.div<{ avatarColor: string }>`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   margin-bottom: 16px;
//   position: relative;
//   z-index: 2;
// `;

// export const IconHalo = styled.div<{ avatarColor: string }>`
//   position: absolute;
//   width: 80px;
//   height: 80px;
//   border-radius: 50%;
//   background: radial-gradient(circle, ${props => props.avatarColor}30 0%, ${props => props.avatarColor}10 50%, transparent 100%);
//   filter: blur(8px);
//   z-index: 1;
// `;

// export const IconBody = styled.div<{ avatarColor: string }>`
//   width: 60px;
//   height: 60px;
//   border-radius: 50%;
//   background: linear-gradient(135deg, ${props => props.avatarColor}80 0%, ${props => props.avatarColor}40 100%);
//   border: 2px solid ${props => props.avatarColor}60;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: #fff;
//   font-size: 24px;
//   font-weight: bold;
//   box-shadow: 0 8px 25px ${props => props.avatarColor}40, inset 0 2px 0 rgba(255, 255, 255, 0.3);
//   position: relative;
//   z-index: 2;
// `;

// export const AgentName = styled.h3`
//   margin: 0 0 8px 0;
//   font-size: 18px;
//   font-weight: 600;
//   color: #fff;
//   text-align: center;
//   position: relative;
//   z-index: 2;
//   white-space: nowrap;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   max-width: 100%;
// `;

// export const AgentDescription = styled.p`
//   margin: 0 0 16px 0;
//   font-size: 14px;
//   color: rgba(255, 255, 255, 0.7);
//   text-align: center;
//   line-height: 1.4;
//   position: relative;
//   z-index: 2;
//   display: -webkit-box;
//   -webkit-line-clamp: 2;
//   -webkit-box-orient: vertical;
//   overflow: hidden;
//   text-overflow: ellipsis;
//   max-height: 2.8em;
// `;

// // 模型信息行
// export const ModelInfoRow = styled.div`
//   font-size: 11px;
//   color: rgba(255, 255, 255, 0.6);
//   text-align: center;
//   margin-bottom: 12px;
//   width: 90%;
//   position: relative;
//   z-index: 2;
//   height: 16px;
//   line-height: 16px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 4px;
// `;

// // 模型图标
// export const ModelIcon = styled.img`
//   width: 12px;
//   height: 12px;
//   flex-shrink: 0;
// `;

// // MCP工具信息
// export const McpToolsInfo = styled.div`
//   font-size: 11px;
//   color: rgba(255, 255, 255, 0.5);
//   text-align: center;
//   margin-bottom: 16px;
//   width: 100%;
//   position: relative;
//   z-index: 2;
//   height: 16px;
//   line-height: 16px;
// `;

// // 按钮区域
// export const ButtonArea = styled.div`
//   display: flex;
//   width: 100%;
//   justify-content: space-between;
//   align-items: center;
//   position: relative;
//   z-index: 2;
//   padding: 0px 12px;
//   top: 25px;
// `;

// // 左侧按钮组
// export const LeftButtonGroup = styled.div`
//   display: flex;
//   gap: 10px;
// `;

// // 删除按钮
// export const DeleteButton = styled.button<{ avatarColor: string }>`
//   padding: 2px 4px;
//   border: 1px solid ${props => props.avatarColor}50;
//   border-radius: 3px;
//   background: linear-gradient(135deg, ${props => props.avatarColor}20 0%, transparent 100%);
//   color: #fff;
//   cursor: pointer;
//   box-shadow: 0 4px 15px ${props => props.avatarColor}20, inset 0 1px 0 rgba(255, 255, 255, 0.2);
// `;

// export const ChatButton = styled.div<{ avatarColor: string }>`
//   padding: 8px;
//   border-radius: 50%;
//   background: linear-gradient(135deg, ${props => props.avatarColor}40 0%, ${props => props.avatarColor}20 100%);
//   border: 1px solid ${props => props.avatarColor}60;
//   cursor: pointer;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   box-shadow: 0 4px 15px ${props => props.avatarColor}30, inset 0 1px 0 rgba(255, 255, 255, 0.3);
//   transition: all 0.2s ease;
// `;

export const EditContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'};
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
    : 'radial-gradient(circle, rgba(0, 0, 0, 0.05) 0%, transparent 70%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.mode === 'dark' 
    ? '0 2px 12px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
    : '0 2px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
  };
  color: ${({ theme }) => theme.colors.textPrimary};
  
  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
  }
`;

export const ShareContainer = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'};
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)'
    : 'radial-gradient(circle, rgba(0, 0, 0, 0.05) 0%, transparent 70%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.mode === 'dark' 
    ? '0 2px 12px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
    : '0 2px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
  };
  color: ${({ theme }) => theme.colors.textPrimary};
  
  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
  }
`;

// 抽屉样式
export const DrawerBackdrop = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)'};
  backdrop-filter: blur(4px);
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;


export const DrawerContainer = styled.div<{ $isOpen: boolean; $width: number }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: ${props => props.$width}px;
  min-width: 400px;
  background: ${({ theme }) => theme.mode === 'dark' 
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 100%)'
  };
  border-left: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.mode === 'dark' 
    ? '-5px 0 20px rgba(0, 0, 0, 0.3)'
    : '-5px 0 20px rgba(0, 0, 0, 0.1)'
  };
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 22px;
  background: ${({ theme }) => theme.mode === 'dark'?'linear-gradient(201deg, #333f99, #0f1b3a)':'linear-gradient(201deg, #287d7b, #349174)'};
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
`;

export const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  padding: 0px;
  gap: 5px;
  color: #ffffff;
  svg {
    margin-bottom: 8px;
  }
`;

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 24px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const DrawerContent = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

export const ResizeHandle = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: transparent;
  cursor: col-resize;
  z-index: 10;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
  }
  
  &:active {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.2)'};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 30px;
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
    border-radius: 1px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

export const CreateButtonContainer = styled.div`
  position: relative;
  display: flex;
  z-index: 10000;
`;

export const DropdownContent = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  position: absolute;
  top: 100%;
  left: 80px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? `
      radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 25%),
      radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.12) 0%, transparent 30%),
      radial-gradient(circle at 40% 80%, rgba(14, 165, 233, 0.1) 0%, transparent 35%),
      radial-gradient(circle at 90% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 25%)
    `
    : `
      radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 25%),
      radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.06) 0%, transparent 30%),
      radial-gradient(circle at 40% 80%, rgba(14, 165, 233, 0.05) 0%, transparent 35%),
      radial-gradient(circle at 90% 20%, rgba(139, 92, 246, 0.04) 0%, transparent 25%)
    `
  };
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  /*border: 1px solid ${({ theme }) => theme.colors.primary};*/
  z-index: 9999;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 4px;
`;

export const DropdownItem = styled.div`
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.tertiary};
  }
  svg {
    margin-left: 8px;
    margin-bottom: -2px;
  }
`;