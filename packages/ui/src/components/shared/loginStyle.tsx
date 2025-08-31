import styled, { css } from "styled-components";
/*************************登录组件样式*************************************/
// 液态玻璃登录容器
export const ModalMoContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  
  /* 液态玻璃背景 */
  background: ${({ theme }) => theme.mode === 'dark'
    ? `linear-gradient(135deg, 
      rgb(8, 37, 104) 0%, 
      rgb(52, 77, 116) 25%, 
      rgb(51, 65, 85) 50%, 
      rgb(75, 68, 80) 75%, 
      rgb(7, 45, 107) 100%)`
    : `linear-gradient(135deg, 
      #f8fafc 0%, 
      #f1f5f9 25%, 
      #e2e8f0 50%, 
      #cbd5e1 75%, 
      #94a3b8 100%)`
  };
`;

// 液态玻璃内容卡片
export const ContentSection = styled.div`
  width: 500px;
  display: flex;
  flex-direction: column;
  align-items: left;
  text-align: left;
  padding: 60px 40px;
  border-radius: 20px;
  position: relative;
  z-index: 10;
  
  /* 液态玻璃效果 */
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.4)'
    : 'rgba(248, 250, 252, 0.6)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.2)'
    : 'rgba(59, 130, 246, 0.15)'
  };
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? 'inset 0 0 30px rgba(59, 130, 246, 0.1), 0 20px 40px rgba(0, 0, 0, 0.3)'
    : 'inset 0 0 30px rgba(59, 130, 246, 0.05), 0 20px 40px rgba(0, 0, 0, 0.1)'
  };
`;

export const Logo = styled.img`
  height: 30px;
  position: absolute;
  top: 8px;
  left: 10px;
  z-index: 10;
`;

export const MainHeading = styled.h1`
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
`;

export const SubHeading = styled.h2`
  font-size: 24px;
  font-weight: 400;
  margin-bottom: 40px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#cbd5e1' : '#475569'};
`;

export const DetailText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  margin-bottom: 10px;

  &.english-text {
    font-size: 14px;
    color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  }
`;

export const WelcomeText = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
`;

export const WelcomeSubText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#cbd5e1' : '#475569'};
  margin-bottom: 30px;
`;

export const ConfigText = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};
  margin-bottom: 40px;
`;

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
  width: 100%;

  /* Style for input containers */
  > div {
    position: relative;
  }

  /* Style for validation tooltip */
  .validation-tooltip {
    position: absolute;
    z-index: 1000;
  }
`;

export const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#cbd5e1' : '#475569'};
  margin-bottom: 8px;
  text-align: left;
`;

export const InputField = styled.input`
  width: 100%;
  height: 40px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' 
    ? 'rgba(59, 130, 246, 0.3)' 
    : 'rgba(59, 130, 246, 0.2)'
  };
  border-radius: 4px;
  padding: 0 12px;
  font-size: 14px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.3)'
    : 'rgba(248, 250, 252, 0.5)'
  };
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.6)'
      : 'rgba(59, 130, 246, 0.5)'
    };
    box-shadow: ${({ theme }) => theme.mode === 'dark'
      ? '0 0 20px rgba(59, 130, 246, 0.3)'
      : '0 0 20px rgba(59, 130, 246, 0.2)'
    };
   }

  /* 移除默认的invalid样式，只在显式添加error类时显示红色边框 */
  &::invalid:not(.touched) {
    border-color: ${({ theme }) => theme.mode === 'dark' 
      ? 'rgba(59, 130, 246, 0.3)' 
      : 'rgba(59, 130, 246, 0.2)'
    };
    box-shadow: none;
  }

  &.error, &:invalid.touched {
    border-color: #e53935;
    box-shadow: 0 0 15px rgba(229, 57, 53, 0.3);
  }

  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  }
`;


export const PasswordField = styled(InputField)`
  margin-bottom: 4px;
`;

export const PasswordHint = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
`;

export const SubmitButton = styled.button`
  width: 100%;
  height: 48px;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(168, 85, 247, 0.7))'
    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(168, 85, 247, 0.8))'
  };
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 10px 30px rgba(59, 130, 246, 0.3)'
    : '0 10px 30px rgba(59, 130, 246, 0.2)'
  };

  &:hover {
    box-shadow: ${({ theme }) => theme.mode === 'dark'
    ? '0 15px 40px rgba(59, 130, 246, 0.4)'
    : '0 15px 40px rgba(59, 130, 246, 0.3)'
  };
  }

  &:disabled {
    background: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export const DotContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 40px;
`;

export const LinkText = styled.div`
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#94a3b8' : '#64748b'};

  a {
    color: ${({ theme }) => theme.mode === 'dark' ? '#60a5fa' : '#3b82f6'};
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;

    &:hover {
      color: ${({ theme }) => theme.mode === 'dark' ? '#93c5fd' : '#1d4ed8'};
      text-decoration: underline;
    }
  }
`;

/*************************注册组件样式*************************************/
// 注册表单容器 - 增强样式
export const RegisterFormContainer = styled(FormContainer)`
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : 'rgba(59, 130, 246, 0.05)'
  };
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.4)'
    : 'rgba(59, 130, 246, 0.3)'
  };
    border-radius: 3px;
    transition: background 0.3s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.6)'
    : 'rgba(59, 130, 246, 0.5)'
  };
  }
`;

// 错误消息组件 - 增强样式
export const ErrorMessage = styled.div`
  color: #e53935;
  font-size: 12px;
  margin-top: 4px;
  padding: 6px 8px;
  background: rgba(229, 57, 53, 0.1);
  border: 1px solid rgba(229, 57, 53, 0.2);
  border-radius: 4px;
`;

// 提示文字样式
export const HintText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  margin-top: 4px;
  line-height: 1.4;
`;