import React from 'react';
import styled from 'styled-components';

// 弹窗背景
export const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000000; /* 提高模态框的 z-index，但仍低于 toast */
  padding: 20px;
`;

// 弹窗容器
export const ModalContainer = styled.div`
  // background: ${({ theme }) => theme.mode === 'dark' ? '#10263f' : '#ffffff'};
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  width: 80vw;
  //max-width: 1200px;
  height: auto;
  min-height: 400px;
  max-height: 80vh;
  position: relative;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  display: flex;
  flex-direction: column;
`;

// ConnectPage专用的固定高度Modal容器
export const ConnectPageModalContainer = styled(ModalContainer)`
  height: 90vh;
  max-height: 90vh;
`;

// 蓝色渐变背景的模态框容器
export const PremiumModalContainer = styled(ModalContainer)`
    background: ${props => props.theme.mode === 'dark'
      ? `linear-gradient(135deg,
       rgb(43 45 109 / 95%) 0%, 
       rgb(69 35 105 / 95%) 50%, 
       rgb(32 62 113 / 95%) 100%)`
      : `linear-gradient(135deg,
        rgba(99, 102, 241, 0.95) 0%, 
        rgba(139, 92, 246, 0.95) 50%, 
        rgba(59, 130, 246, 0.95) 100%)`
    };
  /*background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.95) 0%, 
    rgba(139, 92, 246, 0.95) 50%, 
    rgba(59, 130, 246, 0.95) 100%
  );*/
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  color: white;
`;

// ConnectPage专用的固定高度PremiumModal容器
export const PremiumConnectPageModalContainer = styled(ConnectPageModalContainer)`
    background: ${props => props.theme.mode === 'dark'
      ? `linear-gradient(135deg,
       rgb(43 45 109 / 95%) 0%, 
       rgb(69 35 105 / 95%) 50%, 
       rgb(32 62 113 / 95%) 100%)`
      : `linear-gradient(135deg,
        rgba(99, 102, 241, 0.95) 0%, 
        rgba(139, 92, 246, 0.95) 50%, 
        rgba(59, 130, 246, 0.95) 100%)`
    };
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  color: white;
`;

// 弹窗头部
export const ModalHeader = styled.div`
  padding: 8px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'};
`;

// 弹窗内容
export const ModalContent = styled.div`
  padding: 6px 0px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  
   /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 16px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(247, 247, 247, 0.5);
  }
 
`;

export const ModalContentBlock = styled.div`
  flex: 1;
  overflow: auto;
  minHeight: 0;
  padding: 0px 20px;
   /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(247, 247, 247, 0.5);
  }
 
`;

// ConnectPage专用的弹窗内容样式
export const ConnectPageModalContent = styled(ModalContent)`
  height: calc(90vh - 100px);
  max-height: 77vh;
  flex: none;
`;

// 关闭按钮
export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#ededed'};
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#ffffff' : '#000000'};
  }
`;

// // 标题描述
// export const TitleDesc = styled.div`
//   color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
//   display: flex;
//   flex-direction: column;
//   gap: 8px;

//   h4 {
//     font-size: 28px;
//     font-weight: 600;
//     margin: 0;
//     color: ${({ theme }) => theme.colors.textPrimary};
//   }

//   p {
//     margin: 0;
//     font-size: 14px;
//     line-height: 1.6;
//   }
// `; 

// 高级标题样式
export const PremiumTitleDesc = styled.div`
  h4 {
    color: white;
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 2px;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
  }
`;
