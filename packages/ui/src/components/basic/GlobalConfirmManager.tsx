import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import LiquidConfirm from './LiquidConfirm';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  triggerElement?: HTMLElement | null;
  positioning?: 'center' | 'below-trigger';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
}

interface GlobalConfirmContextType {
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
}

const GlobalConfirmContext = createContext<GlobalConfirmContextType | null>(null);

// 全局状态，不会被热重载重置
let globalConfirmState: ConfirmState = {
  isOpen: false,
  message: '',
};

let globalResolve: ((value: boolean) => void) | null = null;
let globalStateSetters: Set<React.Dispatch<React.SetStateAction<ConfirmState>>> = new Set();

export const GlobalConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [confirmState, setConfirmState] = useState<ConfirmState>(globalConfirmState);

  // 注册状态更新函数
  React.useEffect(() => {
    globalStateSetters.add(setConfirmState);
    return () => {
      globalStateSetters.delete(setConfirmState);
    };
  }, []);

  const showConfirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    console.log('🔍 [GlobalConfirm] showConfirm 被调用, 时间:', new Date().toISOString());
    
    return new Promise<boolean>((resolve) => {
      globalResolve = resolve;
      globalConfirmState = {
        ...options,
        isOpen: true,
      };
      
      // 更新所有注册的组件状态
      globalStateSetters.forEach(setter => {
        setter(globalConfirmState);
      });
      
      console.log('🔍 [GlobalConfirm] 全局状态已更新，isOpen: true');
    });
  }, []);

  const handleConfirm = useCallback(() => {
    console.log('🔍 [GlobalConfirm] handleConfirm 被调用, 时间:', new Date().toISOString());
    
    globalConfirmState = { ...globalConfirmState, isOpen: false };
    globalStateSetters.forEach(setter => {
      setter(globalConfirmState);
    });
    
    if (globalResolve) {
      console.log('🔍 [GlobalConfirm] 调用 resolve(true)');
      globalResolve(true);
      globalResolve = null;
    } else {
      console.warn('🔍 [GlobalConfirm] globalResolve 为 null，无法调用 resolve');
    }
  }, []);

  const handleCancel = useCallback(() => {
    console.log('🔍 [GlobalConfirm] handleCancel 被调用, 时间:', new Date().toISOString());
    
    globalConfirmState = { ...globalConfirmState, isOpen: false };
    globalStateSetters.forEach(setter => {
      setter(globalConfirmState);
    });
    
    if (globalResolve) {
      console.log('🔍 [GlobalConfirm] 调用 resolve(false)');
      globalResolve(false);
      globalResolve = null;
    } else {
      console.warn('🔍 [GlobalConfirm] globalResolve 为 null，无法调用 resolve');
    }
  }, []);

  return (
    <GlobalConfirmContext.Provider value={{ showConfirm }}>
      {children}
      <LiquidConfirm
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        triggerElement={confirmState.triggerElement}
        positioning={confirmState.positioning}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </GlobalConfirmContext.Provider>
  );
};

export const useGlobalConfirm = () => {
  const context = useContext(GlobalConfirmContext);
  if (!context) {
    throw new Error('useGlobalConfirm must be used within a GlobalConfirmProvider');
  }
  return context;
};