import styled from 'styled-components';
import {
  ModalContainer,
  //TitleDesc,
  FormLabel,
  FormField,
  FormInput,
  FormTextArea,
  FormSelect,
  FormButton
} from './index';

// 高级模态框容器 - 蓝色渐变背景
// export const PremiumModalContainer = styled(ModalContainer)`
//   background: ${props => props.theme.mode === 'dark'
//     ? `linear-gradient(135deg,
//      rgb(43 45 109 / 95%) 0%, 
//      rgb(69 35 105 / 95%) 50%, 
//      rgb(32 62 113 / 95%) 100%)`
//     : `linear-gradient(135deg,
//       rgba(99, 102, 241, 0.95) 0%, 
//       rgba(139, 92, 246, 0.95) 50%, 
//       rgba(59, 130, 246, 0.95) 100%)`
//   };
//   border: 1px solid rgba(255, 255, 255, 0.2);
//   box-shadow: 
//     0 25px 50px rgba(0, 0, 0, 0.3),
//     0 0 0 1px rgba(255, 255, 255, 0.1) inset;
//   color: white;
// `;

// 高级标题样式
// export const PremiumTitleDesc = styled.div`
//   h4 {
//     color: white;
//     font-size: 22px;
//     font-weight: 600;
//     background: linear-gradient(135deg, #ffffff 0%,rgb(167, 164, 167) 100%);
//     -webkit-background-clip: text;
//     -webkit-text-fill-color: transparent;
//     background-clip: text;
//     margin-bottom: 3px;
//   }

//   p {
//     color: rgba(255, 255, 255, 0.8);
//     font-size: 12px;
//     font-weight: 400;
//   }
// `;

// 表单区域样式
export const PremiumFormSection = styled.div`
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 12px;
  width:98%;
  margin: 0 auto;
  margin-bottom: 12px;
`;

// 高级表单标签
export const PremiumFormLabel = styled(FormLabel)`
  color: white;
  font-weight: 600;
`;

// 高级表单字段容器
export const PremiumFormField = styled(FormField)`
  .form-input, .form-textarea, .form-select {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    
    &:focus {
      border-color: rgba(255, 255, 255, 0.4);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
    }
  }
`;

// 高级表单输入框
export const PremiumFormInput = styled(FormInput)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }
    
 &[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
`;

// 高级表单文本区域
export const PremiumFormTextArea = styled(FormTextArea)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  &:focus {
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }
`;

// 高级表单选择框
export const PremiumFormSelect = styled(FormSelect)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  
  option {
    background: ${props => props.theme.mode === 'dark' ? '#1e293b' : '#fff'};
    color: ${props => props.theme.mode === 'dark' ? '#fff' : '#000'};
  }
  
  &:focus {
    border-color: rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }
`;

// 高级表单按钮
export const PremiumFormButton = styled(FormButton)`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 400;
  font-size:12px;  
  width:50%;
  height:36px;
  &:hover {
    opacity:0.8;
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    // transform: translateY(-1px);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
    transform: none;
  }
`;

// 选择区域样式
export const PremiumSelectionArea = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

// 选择区域标题
export const PremiumSelectionTitle = styled.h4`
  color: white;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

// 卡片容器
export const PremiumCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
`;

// 选择卡片
export const PremiumSelectCard = styled.div<{ $selected: boolean }>`
  background: ${props => props.$selected
    ? 'rgba(255, 255, 255, 0.4)'
    : 'rgba(255, 255, 255, 0.08)'
  };
  border: 1px solid ${props => props.$selected
    ? 'rgba(255, 255, 255, 0.6)'
    : 'rgba(255, 255, 255, 0.15)'
  };
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: ${props => props.$selected
    ? '0 8px 32px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.05) inset'
    : 'none'
  };
  
  &:hover {
    background: ${props => props.$selected
    ? 'rgba(255, 255, 255, 0.5)'
    : 'rgba(255, 255, 255, 0.2)'
  };
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  ${props => props.$selected && `
    &::before {
      content: '✔';
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(34, 197, 94, 0.9);
      color: white;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  `}
`;

// 卡片内容
export const PremiumCardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

// 卡片图标
export const PremiumCardIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  font-size: 18px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

// 卡片信息
export const PremiumCardInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

// 卡片名称
export const PremiumCardName = styled.div`
  color: white;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
  line-height: 1.2;
`;

// 卡片描述
export const PremiumCardDescription = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 1.2;
`; 