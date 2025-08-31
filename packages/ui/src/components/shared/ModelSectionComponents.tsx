import styled from 'styled-components';

// 模型选择区域头部按钮
export const ModelSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const ModelSectionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

export const ModelActionButton = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.$active ? '#3b82f6' : '#d1d5db'};
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  color: ${props => props.$active ? '#3b82f6' : '#6b7280'};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;

// 添加模型按钮
export const AddModelButton = styled(ModelActionButton)`
  background: #f0f9ff;
  border-color: #3b82f6;
  color: #3b82f6;

  &:hover {
    background: #dbeafe;
  }
`;

// 适配AgentConfigModal的蓝色主题版本
export const PremiumModelSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  margin-bottom: 0;
`;

export const PremiumModelSectionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PremiumModelActionButton = styled.button<{ $active?: boolean }>`
  padding: 18px 32px;
  border: 1px solid ${props => props.$active ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)'};
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }
`;

// 添加模型按钮 - 蓝色主题版本
export const PremiumAddModelButton = styled(PremiumModelActionButton)`
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

// 选中模型显示区域 - 原始版本
export const SelectedModelsContainer = styled.div`
  margin-top: 16px;
`;

export const SelectedModelTag = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  margin: 4px 8px 4px 0;
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  font-size: 12px;
  color: #3b82f6;
`;

export const RemoveModelButton = styled.button`
  margin-left: 8px;
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
  padding: 0;

  &:hover {
    color: #dc2626;
  }
`;

export const EmptyModelMessage = styled.div`
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  padding: 20px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
`;

// 选中模型显示区域 - Premium版本（适配蓝色主题）
export const PremiumSelectedModelsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 0;
`;

export const PremiumSelectedModelTag = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid #3b82f6;
  border-radius: 6px;
  font-size: 12px;
  color: #60a5fa;
  gap: 8px;
`;

export const PremiumRemoveModelButton = styled.button`
  background: none;
  border: none;
  color: #60a5fa;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  line-height: 1;
  margin-left: 8px;

  &:hover {
    color: #dc2626;
  }
`;

export const PremiumEmptyModelMessage = styled.div`
  position: relative;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  font-weight: 500;
  padding: 25px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
`;