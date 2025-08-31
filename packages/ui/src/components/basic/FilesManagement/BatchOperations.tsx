import React, { useState, useCallback } from 'react';
import { BatchOperationResult } from './types';
import {
  BatchOperationsCard,
  BatchOperationsHeader,
  BatchOperationsInfo,
  BatchOperationsActions,
  BatchActionButton,
  LoadingSpinner
} from './styles';

interface BatchOperationsProps {
  selectedDocuments: string[];
  onOperationComplete: () => void;
  className?: string;
}

interface BatchOperationStatus {
  batchId: string;
  operation: string;
  progress: number;
  completed: number;
  total: number;
  isRunning: boolean;
}

export const BatchOperations: React.FC<BatchOperationsProps> = ({
  selectedDocuments,
  onOperationComplete,
  className = ''
}) => {
  const [currentOperation, setCurrentOperation] = useState<BatchOperationStatus | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);

  // 执行批量操作
  const executeBatchOperation = useCallback(async (operation: string) => {
    try {
      // 这里应该是实际的API调用
      // const response = await fetch('/api/documents/batch', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     operation,
      //     documentIds: selectedDocuments
      //   })
      // });

      // 模拟批量操作
      const batchId = `batch-${Date.now()}`;
      
      // 设置操作状态
      setCurrentOperation({
        batchId,
        operation,
        progress: 0,
        completed: 0,
        total: selectedDocuments.length,
        isRunning: true
      });

      // 模拟进度更新
      simulateProgress(batchId, operation);
    } catch (error) {
      console.error('Batch operation error:', error);
      alert(error instanceof Error ? error.message : '批量操作失败');
    }
  }, [selectedDocuments]);

  // 模拟进度更新
  const simulateProgress = useCallback((batchId: string, operation: string) => {
    let completed = 0;
    const total = selectedDocuments.length;
    
    const interval = setInterval(() => {
      completed += Math.random() > 0.3 ? 1 : 0; // 随机进度
      const progress = Math.min((completed / total) * 100, 100);
      
      setCurrentOperation(prev => prev ? {
        ...prev,
        progress,
        completed: Math.min(completed, total)
      } : null);

      if (completed >= total) {
        clearInterval(interval);
        setTimeout(() => {
          setCurrentOperation(null);
          onOperationComplete();
        }, 1000);
      }
    }, 500);
  }, [selectedDocuments.length, onOperationComplete]);

  // 处理删除操作
  const handleDelete = useCallback(() => {
    setShowConfirmDialog('delete');
  }, []);

  // 处理重新处理操作
  const handleReprocess = useCallback(() => {
    setShowConfirmDialog('reprocess');
  }, []);

  // 处理导出操作
  const handleExport = useCallback(() => {
    setShowConfirmDialog('export');
  }, []);

  // 确认操作
  const confirmOperation = useCallback(async (operation: string) => {
    setShowConfirmDialog(null);
    await executeBatchOperation(operation);
  }, [executeBatchOperation]);

  // 取消操作
  const cancelOperation = useCallback(() => {
    setShowConfirmDialog(null);
  }, []);

  // 获取操作名称
  const getOperationName = useCallback((operation: string) => {
    const names: Record<string, string> = {
      delete: '删除',
      reprocess: '重新处理',
      export: '导出'
    };
    return names[operation] || operation;
  }, []);

  // 获取操作描述
  const getOperationDescription = useCallback((operation: string) => {
    const descriptions: Record<string, string> = {
      delete: '将永久删除选中的文档及其相关数据，此操作不可撤销',
      reprocess: '将重新处理选中的文档，包括文本提取和向量化',
      export: '将导出选中文档的元数据和内容信息'
    };
    return descriptions[operation] || '';
  }, []);

  if (selectedDocuments.length === 0) {
    return null;
  }

  return (
    <>
      <BatchOperationsCard>
      <BatchOperationsHeader>
        <BatchOperationsInfo>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clipRule="evenodd" />
          </svg>
          已选择 {selectedDocuments.length} 个文档
        </BatchOperationsInfo>

        {/* 操作按钮 */}
        {!currentOperation && (
          <BatchOperationsActions>
            <BatchActionButton onClick={handleReprocess}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重新处理
            </BatchActionButton>

            <BatchActionButton onClick={handleExport}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              导出
            </BatchActionButton>

            <BatchActionButton onClick={handleDelete}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              删除
            </BatchActionButton>
          </BatchOperationsActions>
        )}
      </BatchOperationsHeader>

      {/* 进度显示 */}
      {currentOperation && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)' }}>
              正在{getOperationName(currentOperation.operation)}文档...
            </span>
            <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)' }}>
              {currentOperation.completed} / {currentOperation.total}
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            background: 'rgba(255, 255, 255, 0.2)', 
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div 
              style={{ 
                height: '100%', 
                background: '#60a5fa', 
                borderRadius: '4px',
                transition: 'width 0.3s ease',
                width: `${currentOperation.progress}%`
              }}
            />
          </div>
        </div>
      )}
      </BatchOperationsCard>

      {/* 确认对话框 */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000001
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 50%, rgba(59, 130, 246, 0.95) 100%)',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            margin: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ flexShrink: 0 }}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#fbbf24' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div style={{ marginLeft: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '500', margin: 0 }}>
                  确认{getOperationName(showConfirmDialog)}
                </h3>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', margin: '0 0 8px 0' }}>
                您即将对 {selectedDocuments.length} 个文档执行{getOperationName(showConfirmDialog)}操作。
              </p>
              <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', margin: 0 }}>
                {getOperationDescription(showConfirmDialog)}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={cancelOperation}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button
                onClick={() => confirmOperation(showConfirmDialog)}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: showConfirmDialog === 'delete' ? '#ef4444' : showConfirmDialog === 'reprocess' ? '#f59e0b' : '#22c55e',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                确认{getOperationName(showConfirmDialog)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};