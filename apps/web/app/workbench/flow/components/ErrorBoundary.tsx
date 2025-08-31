/**
 * 错误边界组件
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { AppError, ErrorType, logger } from '../utils/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

const ErrorContainer = styled.div`
  padding: 20px;
  margin: 20px;
  border: 1px solid ${({ theme }) => theme.colors.error || '#ff4d4f'};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.errorBg || '#fff2f0'};
`;

const ErrorTitle = styled.h3`
  color: ${({ theme }) => theme.colors.error || '#ff4d4f'};
  margin: 0 0 10px 0;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.textPrimary || '#333'};
  margin: 0 0 10px 0;
`;

const ErrorDetails = styled.details`
  margin-top: 10px;
  
  summary {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textSecondary || '#666'};
    margin-bottom: 10px;
  }
`;

const ErrorStack = styled.pre`
  background-color: ${({ theme }) => theme.colors.codeBg || '#f5f5f5'};
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textPrimary || '#333'};
`;

const RetryButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary || '#1890ff'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover || '#40a9ff'};
  }
`;

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // 记录错误日志
    logger.error('ErrorBoundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name
    });

    // 调用外部错误处理器
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 如果是AppError，使用全局错误处理器
    if (error instanceof AppError) {
      // GlobalErrorHandler.handle(error);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <ErrorContainer>
          <ErrorTitle>出现了一个错误</ErrorTitle>
          <ErrorMessage>
            {this.state.error?.message || '未知错误'}
          </ErrorMessage>
          
          <RetryButton onClick={this.handleRetry}>
            重试
          </RetryButton>

          {process.env.NODE_ENV === 'development' && (
            <ErrorDetails>
              <summary>错误详情 (开发模式)</summary>
              <ErrorStack>
                {this.state.error?.stack}
              </ErrorStack>
              {this.state.errorInfo && (
                <ErrorStack>
                  组件堆栈:
                  {this.state.errorInfo.componentStack}
                </ErrorStack>
              )}
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

/**
 * 高阶组件：为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Hook：在函数组件中使用错误处理
 */
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error | AppError, context?: any) => {
    logger.error('useErrorHandler caught an error', error, context);
    
    if (error instanceof AppError) {
      // GlobalErrorHandler.handle(error);
    }
    
    // 在开发环境中抛出错误以触发错误边界
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
  }, []);

  return { handleError };
}