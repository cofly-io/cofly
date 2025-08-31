/**
 * 工作流测试按钮组件
 * 
 * 负责管理工作流测试功能的UI和状态
 */

import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';

// UI组件导入
import { CoButton } from '@repo/ui/src/components/basic/Buttons';
import { MdNotStarted, MdStop, MdRefresh } from "react-icons/md";

// 工具函数导入
import { logger } from '../../utils/errorHandling';
import { TEST_STATUS } from '../../utils/constants';

const TestButtonContainer = styled.div<{ $menuCollapsed?: boolean }>`
  position: fixed;
  bottom: 20px;
  right: ${props => props.$menuCollapsed ? '70px' : '335px'};
  z-index: 1000;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TestResultPanel = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: 60px;
  right: 0;
  width: 300px;
  max-height: 400px;
  background: ${({ theme }) => theme.colors?.cardBg || '#ffffff'};
  border: 1px solid ${({ theme }) => theme.colors?.border || '#e1e5e9'};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  display: ${props => props.$visible ? 'block' : 'none'};
  overflow-y: auto;
`;

const TestResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || '#e1e5e9'};
`;

const TestResultTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.textPrimary || '#333'};
`;

const TestResultContent = styled.pre`
  font-size: 12px;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors?.textSecondary || '#666'};
  background: ${({ theme }) => theme.colors?.codeBg || '#f5f5f5'};
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ProgressBar = styled.div<{ $progress: number }>`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors?.border || '#e1e5e9'};
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${props => props.$progress}%;
    background: ${({ theme }) => theme.colors?.primary || '#1890ff'};
    transition: width 0.3s ease;
  }
`;

interface TestButtonProps {
  workflowId?: string;
  isTestingWorkflow?: boolean;
  menuCollapsed?: boolean;
  onTest?: () => Promise<void>;
  onCancel?: () => void;
  testResult?: any;
  showResultPanel?: boolean;
}

/**
 * 工作流测试按钮组件
 */
export const TestButton: React.FC<TestButtonProps> = ({
  workflowId,
  isTestingWorkflow = false,
  menuCollapsed = false,
  onTest,
  onCancel,
  testResult,
  showResultPanel = false
}) => {

  // 组件状态
  const [testStatus, setTestStatus] = useState<string>(TEST_STATUS.IDLE);
  const [testProgress, setTestProgress] = useState(0);
  const [showResult, setShowResult] = useState(showResultPanel);
  const [lastTestTime, setLastTestTime] = useState<number>(0);

  /**
   * 处理测试按钮点击
   */
  const handleTestClick = useCallback(async () => {
    if (!workflowId) {
      logger.warn('工作流ID不存在，无法测试');
      return;
    }

    if (isTestingWorkflow) {
      logger.warn('工作流正在测试中');
      return;
    }

    logger.info('开始工作流测试', { workflowId });
    
    setTestStatus(TEST_STATUS.RUNNING);
    setTestProgress(0);
    setLastTestTime(Date.now());

    try {
      if (onTest) {
        await onTest();
      }
      
      setTestStatus(TEST_STATUS.SUCCESS);
      setTestProgress(100);
      
      // 自动显示结果面板
      if (testResult) {
        setShowResult(true);
      }
      
      logger.info('工作流测试完成', { workflowId });
    } catch (error) {
      setTestStatus(TEST_STATUS.ERROR);
      setTestProgress(0);
      logger.error('工作流测试失败', error);
    }
  }, [workflowId, isTestingWorkflow, onTest, testResult]);

  /**
   * 处理取消测试
   */
  const handleCancelTest = useCallback(() => {
    logger.info('取消工作流测试', { workflowId });
    
    setTestStatus(TEST_STATUS.IDLE);
    setTestProgress(0);
    
    if (onCancel) {
      onCancel();
    }
  }, [workflowId, onCancel]);

  /**
   * 处理重新测试
   */
  const handleRetryTest = useCallback(() => {
    logger.info('重新测试工作流', { workflowId });
    handleTestClick();
  }, [workflowId, handleTestClick]);

  /**
   * 切换结果面板显示
   */
  const toggleResultPanel = useCallback(() => {
    setShowResult(prev => !prev);
  }, []);

  /**
   * 关闭结果面板
   */
  const closeResultPanel = useCallback(() => {
    setShowResult(false);
  }, []);

  /**
   * 模拟测试进度
   */
  useEffect(() => {
    if (testStatus === TEST_STATUS.RUNNING) {
      const interval = setInterval(() => {
        setTestProgress(prev => {
          if (prev >= 90) {
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [testStatus]);

  /**
   * 同步外部测试状态
   */
  useEffect(() => {
    if (isTestingWorkflow && testStatus !== TEST_STATUS.RUNNING) {
      setTestStatus(TEST_STATUS.RUNNING);
    } else if (!isTestingWorkflow && testStatus === TEST_STATUS.RUNNING) {
      setTestStatus(TEST_STATUS.IDLE);
      setTestProgress(0);
    }
  }, [isTestingWorkflow, testStatus]);

  /**
   * 获取按钮文本
   */
  const getButtonText = () => {
    switch (testStatus) {
      case TEST_STATUS.RUNNING:
        return '测试中...';
      case TEST_STATUS.SUCCESS:
        return '测试成功';
      case TEST_STATUS.ERROR:
        return '测试失败';
      default:
        return '业务流测试';
    }
  };

  /**
   * 获取按钮图标
   */
  const getButtonIcon = () => {
    switch (testStatus) {
      case TEST_STATUS.RUNNING:
        return <MdStop size={16} />;
      case TEST_STATUS.ERROR:
        return <MdRefresh size={16} />;
      default:
        return <MdNotStarted size={16} />;
    }
  };

  /**
   * 获取按钮颜色
   */
  const getButtonColor = () => {
    switch (testStatus) {
      case TEST_STATUS.SUCCESS:
        return '#52c41a';
      case TEST_STATUS.ERROR:
        return '#ff4d4f';
      case TEST_STATUS.RUNNING:
        return '#faad14';
      default:
        return '#1890ff';
    }
  };

  /**
   * 处理按钮点击
   */
  const handleButtonClick = () => {
    switch (testStatus) {
      case TEST_STATUS.RUNNING:
        handleCancelTest();
        break;
      case TEST_STATUS.ERROR:
        handleRetryTest();
        break;
      case TEST_STATUS.SUCCESS:
        toggleResultPanel();
        break;
      default:
        handleTestClick();
        break;
    }
  };

  return (
    <TestButtonContainer $menuCollapsed={menuCollapsed}>
      {/* 测试进度条 */}
      {testStatus === TEST_STATUS.RUNNING && (
        <ProgressBar $progress={testProgress} />
      )}

      {/* 测试按钮 */}
      <CoButton
        onClick={handleButtonClick}
        disabled={!workflowId}
        style={{ backgroundColor: getButtonColor() }}
      >
        {getButtonIcon()}
        {getButtonText()}
      </CoButton>

      {/* 测试结果面板 */}
      <TestResultPanel $visible={showResult && !!testResult}>
        <TestResultHeader>
          <TestResultTitle>测试结果</TestResultTitle>
          <button 
            onClick={closeResultPanel}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '16px',
              color: '#999'
            }}
          >
            ×
          </button>
        </TestResultHeader>
        
        <TestResultContent>
          {testResult ? JSON.stringify(testResult, null, 2) : '暂无测试结果'}
        </TestResultContent>
        
        {lastTestTime > 0 && (
          <div style={{ 
            marginTop: '8px', 
            fontSize: '12px', 
            color: '#999',
            textAlign: 'right'
          }}>
            测试时间: {new Date(lastTestTime).toLocaleString()}
          </div>
        )}
      </TestResultPanel>
    </TestButtonContainer>
  );
};

export default TestButton;