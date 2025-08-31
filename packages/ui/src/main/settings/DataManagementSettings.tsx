"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { SettingsCard } from './SettingsCard';
import {
  Button,
  SecondaryButton,
  DangerButton,
  FileInput,
  FileInputLabel,
  ProgressBar,
  ProgressFill,
  StatusText
} from './SharedStyles';

// DataManagementSettings 特有的样式组件
const ActionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActionInfo = styled.div`
  flex: 1;
  
  h4 {
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0 0 4px 0;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    margin: 0;
    line-height: 1.4;
  }
`;

const CustomButton = styled(Button)`
  padding: 10px 20px;
  border-radius: 6px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
    transform: translateY(-1px);
  }
`;

const CustomDangerButton = styled(DangerButton)`
  &:hover {
    background: #dc2626;
  }
`;

const CustomSecondaryButton = styled(SecondaryButton)`
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.1)'
      : 'rgba(59, 130, 246, 0.05)'
    };
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const CustomFileInputLabel = styled(FileInputLabel)`
  padding: 10px 20px;
  border-radius: 6px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
    transform: translateY(-1px);
  }
`;

// 使用共享的 ProgressBar、ProgressFill、StatusText 组件

const DataSizeInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const DataSizeCard = styled.div`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : 'rgba(59, 130, 246, 0.05)'
  };
  border: 1px solid ${({ theme }) => theme.colors.borderLight};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  
  h5 {
    font-size: 14px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0 0 8px 0;
  }
  
  .size {
    font-size: 20px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.accent};
    margin: 0;
  }
  
  .label {
    font-size: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: 4px 0 0 0;
  }
`;

export const DataManagementSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const simulateProgress = async (duration: number = 3000) => {
    setProgress(0);
    const steps = 50;
    const stepDuration = duration / steps;
    
    for (let i = 0; i <= steps; i++) {
      setProgress((i / steps) * 100);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    setStatus({ type: 'info', message: '正在导出数据...' });
    
    await simulateProgress();
    
    // 模拟生成导出文件
    const exportData = {
      workflows: [],
      settings: {},
      connections: [],
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cofly-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsLoading(false);
    setStatus({ type: 'success', message: '数据导出成功！文件已下载到本地。' });
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setStatus({ type: 'info', message: '正在导入数据...' });
    
    await simulateProgress();
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // 这里应该验证数据格式并导入
      console.log('导入的数据:', data);
      
      setStatus({ type: 'success', message: '数据导入成功！请刷新页面查看更改。' });
    } catch (error) {
      setStatus({ type: 'error', message: '数据导入失败，请检查文件格式是否正确。' });
    }
    
    setIsLoading(false);
    event.target.value = ''; // 清空文件选择
  };

  const handleClearCache = async () => {
    if (!confirm('确定要清理缓存吗？这将清除所有临时数据。')) {
      return;
    }
    
    setIsLoading(true);
    setStatus({ type: 'info', message: '正在清理缓存...' });
    
    await simulateProgress(2000);
    
    // 清理本地存储
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    
    setIsLoading(false);
    setStatus({ type: 'success', message: '缓存清理完成！' });
  };

  const handleResetSettings = async () => {
    if (!confirm('确定要重置所有设置吗？这将恢复到默认配置，且无法撤销。')) {
      return;
    }
    
    setIsLoading(true);
    setStatus({ type: 'info', message: '正在重置设置...' });
    
    await simulateProgress(2000);
    
    // 这里应该调用重置设置的API
    console.log('重置所有设置');
    
    setIsLoading(false);
    setStatus({ type: 'success', message: '设置重置完成！请刷新页面查看更改。' });
  };

  const handleDeleteAllData = async () => {
    const confirmText = '删除所有数据';
    const userInput = prompt(`这是一个危险操作，将删除所有工作流、连接和设置数据。\n\n如果确定要继续，请输入："${confirmText}"`);
    
    if (userInput !== confirmText) {
      return;
    }
    
    setIsLoading(true);
    setStatus({ type: 'info', message: '正在删除所有数据...' });
    
    await simulateProgress(3000);
    
    // 这里应该调用删除所有数据的API
    console.log('删除所有数据');
    
    setIsLoading(false);
    setStatus({ type: 'success', message: '所有数据已删除！' });
  };

  return (
    <>
      <SettingsCard
        title="数据导出"
        description="导出你的工作流、设置和连接数据"
      >
        <DataSizeInfo>
          <DataSizeCard>
            <h5>工作流数据</h5>
            <div className="size">2.3 MB</div>
            <div className="label">15个工作流</div>
          </DataSizeCard>
          <DataSizeCard>
            <h5>连接配置</h5>
            <div className="size">156 KB</div>
            <div className="label">8个连接</div>
          </DataSizeCard>
          <DataSizeCard>
            <h5>用户设置</h5>
            <div className="size">45 KB</div>
            <div className="label">所有配置</div>
          </DataSizeCard>
        </DataSizeInfo>
        
        <ActionRow>
          <ActionInfo>
            <h4>导出所有数据</h4>
            <p>将所有工作流、连接和设置导出为JSON文件</p>
          </ActionInfo>
          <CustomButton 
            onClick={handleExportData}
            disabled={isLoading}
          >
            {isLoading ? '导出中...' : '导出数据'}
          </CustomButton>
        </ActionRow>
        
        {isLoading && (
          <ProgressBar>
            <ProgressFill $progress={progress} />
          </ProgressBar>
        )}
        
        {status.type && (
          <StatusText $type={status.type}>
            {status.message}
          </StatusText>
        )}
      </SettingsCard>

      <SettingsCard
        title="数据导入"
        description="从备份文件恢复你的数据"
      >
        <ActionRow>
          <ActionInfo>
            <h4>导入数据文件</h4>
            <p>选择之前导出的JSON文件来恢复数据</p>
          </ActionInfo>
          <div>
            <FileInput
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImportData}
              disabled={isLoading}
            />
            <CustomFileInputLabel htmlFor="import-file">
              {isLoading ? '导入中...' : '选择文件'}
            </CustomFileInputLabel>
          </div>
        </ActionRow>
        
        {isLoading && (
          <ProgressBar>
            <ProgressFill $progress={progress} />
          </ProgressBar>
        )}
        
        {status.type && (
          <StatusText $type={status.type}>
            {status.message}
          </StatusText>
        )}
      </SettingsCard>

      <SettingsCard
        title="缓存管理"
        description="管理应用缓存和临时数据"
      >
        <ActionRow>
          <ActionInfo>
            <h4>清理缓存</h4>
            <p>清除浏览器缓存和临时文件，可能提升性能</p>
          </ActionInfo>
          <CustomSecondaryButton 
            onClick={handleClearCache}
            disabled={isLoading}
          >
            {isLoading ? '清理中...' : '清理缓存'}
          </CustomSecondaryButton>
        </ActionRow>
        
        {isLoading && (
          <ProgressBar>
            <ProgressFill $progress={progress} />
          </ProgressBar>
        )}
        
        {status.type && (
          <StatusText $type={status.type}>
            {status.message}
          </StatusText>
        )}
      </SettingsCard>

      <SettingsCard
        title="危险操作"
        description="这些操作可能会导致数据丢失，请谨慎使用"
      >
        <ActionRow>
          <ActionInfo>
            <h4>重置所有设置</h4>
            <p>将所有设置恢复到默认状态，不会影响工作流数据</p>
          </ActionInfo>
          <CustomDangerButton 
            onClick={handleResetSettings}
            disabled={isLoading}
          >
            {isLoading ? '重置中...' : '重置设置'}
          </CustomDangerButton>
        </ActionRow>
        
        <ActionRow>
          <ActionInfo>
            <h4>删除所有数据</h4>
            <p>永久删除所有工作流、连接和设置数据，此操作无法撤销</p>
          </ActionInfo>
          <CustomDangerButton 
            onClick={handleDeleteAllData}
            disabled={isLoading}
          >
            {isLoading ? '删除中...' : '删除所有数据'}
          </CustomDangerButton>
        </ActionRow>
        
        {isLoading && (
          <ProgressBar>
            <ProgressFill $progress={progress} />
          </ProgressBar>
        )}
        
        {status.type && (
          <StatusText $type={status.type}>
            {status.message}
          </StatusText>
        )}
      </SettingsCard>
    </>
  );
};

export default DataManagementSettings;