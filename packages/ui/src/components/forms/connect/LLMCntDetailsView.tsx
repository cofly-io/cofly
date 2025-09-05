"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ILLMConnect, ModelInfo } from '@repo/common';
import { ModelSelectorModal } from './ModelSelectorModal';
import { ConnectParameterInput } from './ConnectParameterInput';
import { AddModelModal } from './AddModelModal';
import {
  Container,
  ConfigPanel,
  Header,
  Icon,
  Title,
  Subtitle,
  FormSection,
  FieldsGrid,
  // ButtonContainer,
  // Button,
  // TestButton,
  // StatusMessage,
  InputContainer,
  Label,
  Required,
  TextInput
} from '../../shared/modalStyle';

// const HeaderInfo = styled.div`
//   flex: 1;
// `;

// const Description = styled.p`
//   margin: 0;
//   font-size: 14px;
//   color: #666;
//   line-height: 1.5;
// `;

// // 表单区域
// const FormSection = styled.div`
//   background: white;
//   border-radius: 12px;
//   padding: 24px;
//   margin-bottom: 24px;
//   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
// `;

const SectionTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

// // 输入框样式
// const InputGroup = styled.div`
//   margin-bottom: 20px;

//   &:last-child {
//     margin-bottom: 0;
//   }
// `;

// const Label = styled.label`
//   display: block;
//   margin-bottom: 8px;
//   font-size: 14px;
//   font-weight: 500;
//   color: #333;
// `;

// const Input = styled.input`
//   width: 100%;
//   padding: 12px 16px;
//   border: 1px solid #d1d5db;
//   border-radius: 8px;
//   font-size: 14px;
//   transition: all 0.2s;

//   &:focus {
//     outline: none;
//     border-color: #3b82f6;
//     box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
//   }

//   &::placeholder {
//     color: #9ca3af;
//   }
// `;

// 模型选择区域
const ModelsSection = styled.div`
  // background: white;
  // border-radius: 12px;
  // padding: 24px;
  // margin-bottom: 24px;
  // box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// 按钮区域
const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: 1px solid ${props => props.$variant === 'primary' ? '#3b82f6' : '#d1d5db'};
  background: ${props => props.$variant === 'primary' ? '#3b82f6' : 'white'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#374151'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$variant === 'primary' ? '#2563eb' : '#f9fafb'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 测试按钮
const TestButton = styled(Button)`
  background: #10b981;
  border-color: #10b981;
  color: white;

  &:hover:not(:disabled) {
    background: #059669;
    border-color: #059669;
  }
`;

// 状态消息
const StatusMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  background: ${props =>
    props.type === 'success' ? '#dcfce7' :
      props.type === 'error' ? '#fee2e2' :
        '#dbeafe'
  };
  color: ${props =>
    props.type === 'success' ? '#166534' :
      props.type === 'error' ? '#dc2626' :
        '#1d4ed8'
  };
  border: 1px solid ${props =>
    props.type === 'success' ? '#bbf7d0' :
      props.type === 'error' ? '#fecaca' :
        '#bfdbfe'
  };
  font-size: 13px;
`;

// 模型选择区域头部按钮
const ModelSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModelSectionButtons = styled.div`
  display: flex;
  gap: 12px;
`;

const ModelActionButton = styled.button<{ $active?: boolean }>`
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
const AddModelButton = styled(ModelActionButton)`
  background: #f0f9ff;
  border-color: #3b82f6;
  color: #3b82f6;

  &:hover {
    background: #dbeafe;
  }
`;

// 选中模型显示区域
const SelectedModelsContainer = styled.div`
  margin-top: 16px;
`;

const SelectedModelTag = styled.div`
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

const RemoveModelButton = styled.button`
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

const EmptyModelMessage = styled.div`
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  padding: 20px;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
`;

interface LLMCntDetailsViewProps {
  connect: ILLMConnect;
  onClose: () => void;
  onSave: (connectData: any) => void;
  onTest?: (config: Record<string, any>, message?: string) => Promise<any>;
  editMode?: boolean;
  editData?: {
    id: string;
    connectId: string;
    name: string;
    config: Record<string, any>;
  };
  showBackButton?: boolean;
}



export const LLMCntDetailsView: React.FC<LLMCntDetailsViewProps> = ({
  connect,
  onClose,
  onSave,
  onTest,
  editMode = false,
  editData,
  showBackButton = false
}) => {
  const [configName, setConfigName] = useState<string>('');
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [showAddModelModal, setShowAddModelModal] = useState<boolean>(false);
  const [showModelSelector, setShowModelSelector] = useState<boolean>(false);
  const [customModels, setCustomModels] = useState<ModelInfo[]>([]);
  const [testStatus, setTestStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (editMode && editData) {
      setConfigName(editData.name);
      setFormValues(editData.config);
      setSelectedModels(editData.config.models || []);
    } else {
      setConfigName(`${connect.overview.name} 配置`);
      // 从字段中获取默认值
      const initialValues: Record<string, any> = {};
      connect.detail.fields.forEach(field => {
        initialValues[field.fieldName] = field.control.defaultValue || '';
      });
      setFormValues(initialValues);
    }
  }, [connect, editMode, editData]);

  // 处理表单字段值变更
  const handleFieldChange = (name: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 按组分类模型
  const groupedModels = React.useMemo(() => {
    if (!connect.detail.supportedModels) return {};

    return connect.detail.supportedModels.reduce((groups, model) => {
      const modelInfo = model as ModelInfo;
      const groupKey = modelInfo.group || 'Unknown';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      const group = groups[groupKey];
      if (group) {
        group.push(modelInfo);
      }
      return groups;
    }, {} as Record<string, ModelInfo[]>);
  }, [connect.detail.supportedModels]);

  // 将模型数据转换为弹窗需要的格式，仅包含系统预定义模型
  const systemModels = React.useMemo(() => {
    const supportedModels = connect.detail.supportedModels || [];

    // 只返回系统预定义的模型，不包含自定义模型
    return supportedModels.map((model) => {
      const modelInfo = model as ModelInfo;
      return {
        id: modelInfo.id,
        name: modelInfo.name,
        group: modelInfo.group,
        description: `${modelInfo.group} 类型模型`,
        tags: [modelInfo.group?.toLowerCase() || 'unknown', '推理']
      };
    });
  }, [connect.detail.supportedModels]);

  // 获取选中的模型信息，包含自定义模型
  const selectedModelInfos = React.useMemo(() => {
    return selectedModels.map(modelId => {
      // 先在支持的模型中查找
      const supportedModel = connect.detail.supportedModels?.find(m => (m as ModelInfo).id === modelId);
      if (supportedModel) {
        return supportedModel as ModelInfo;
      }

      // 再在自定义模型中查找
      const customModel = customModels.find(m => m.id === modelId);
      return customModel;
    }).filter(Boolean) as ModelInfo[];
  }, [selectedModels, connect.detail.supportedModels, customModels]);

  // 验证表单
  const isFormValid = () => {
    const requiredFields = connect.detail.fields.filter(field => field.control.validation?.required);
    const isRequiredFieldsValid = requiredFields.every(field => {
      const value = formValues[field.fieldName];
      return value !== undefined && value !== null && String(value).trim() !== '';
    });
    return configName.trim() !== '' && isRequiredFieldsValid && selectedModels.length > 0;
  };

  // 测试连接
  const handleTest = async () => {
    if (!onTest || !isFormValid()) return;

    setIsTestLoading(true);
    setTestStatus({ type: 'info', message: '正在测试连接...' });

    try {
      const config = {
        ...formValues,
        models: selectedModels,
        model: selectedModels[0] // 测试时使用第一个模型
      };

      const result = await onTest(config, '你好，请简单介绍一下自己。');

      if (result.success) {
        setTestStatus({
          type: 'success',
          message: result.message || '连接测试成功'
        });
      } else {
        setTestStatus({
          type: 'error',
          message: result.message || '连接测试失败'
        });
      }
    } catch (error) {
      setTestStatus({
        type: 'error',
        message: error instanceof Error ? error.message : '连接测试失败'
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  // 保存配置
  const handleSave = async () => {
    if (!isFormValid()) return;

    setIsSaving(true);

    try {
      const connectData = {
        connectId: connect.overview.id,
        name: configName,
        config: {
          ...formValues,
          models: selectedModels
        },
        mtype: connect.overview.type,
        // 在编辑模式下传递记录ID
        ...(editMode && editData && { id: editData.id })
      };

      // console.log('💾 LLMCntDetailsView 保存数据:', {
      //   editMode,
      //   editDataId: editData?.id,
      //   connectDataWithId: connectData
      // });

      await onSave(connectData);
      onClose();
    } catch (error) {
      console.error('❌ LLMCntDetailsView 保存失败:', error);
      setTestStatus({
        type: 'error',
        message: '保存配置失败，请重试'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 处理添加模型按钮点击
  const handleAddModelClick = () => {
    setShowAddModelModal(true);
  };

  // 处理添加模型
  const handleAddModel = (model: { id: string; name: string }) => {
    // 创建新的模型信息
    const newModel: ModelInfo = {
      id: model.id,
      name: model.name,
      group: 'Custom' // 自定义模型默认分组
    };

    // 添加到自定义模型列表
    setCustomModels(prev => [...prev, newModel]);

    // 自动选择新添加的模型
    setSelectedModels(prev => [...prev, model.id]);

    console.log('添加新模型:', newModel);
  };

  // 处理选择模型按钮点击
  const handleSelectModel = () => {
    setShowModelSelector(true);
  };

  // 处理模型选择确认
  const handleModelSelect = (modelIds: string[]) => {
    // 与现有选中的模型合并，去重
    setSelectedModels(prev => {
      const merged = [...new Set([...prev, ...modelIds])];
      return merged;
    });
    setShowModelSelector(false);
  };

  // 移除单个模型
  const handleRemoveModel = (modelId: string) => {
    setSelectedModels(prev => prev.filter(id => id !== modelId));
  };

  return (
    <Container>
       <ConfigPanel $hasDialogue={false}>
      <Header>
        <Icon>
          {connect.overview.icon ? (
            <img
              src={`/connects/llm/${connect.overview.id}/${connect.overview.icon}`}
              alt={connect.overview.name}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div style={{ fontSize: '24px' }}>🤖</div>
          )}
        </Icon>
        <div>
          <Title>{connect.overview.name}</Title>
          <Subtitle>{connect.overview.description}</Subtitle>
        </div>
      </Header>

      <FormSection>
        <InputContainer>
          <Label>
            基本配置
            <Required>*</Required>
          </Label>
          <TextInput
            type="text"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="请输入配置名称"
            required
          />
        </InputContainer>
        {/* 动态生成字段 */}
        <FieldsGrid $hasDialogue={false}>
          {connect.detail.fields.map((field) => {
            return (<ConnectParameterInput
              key={field.fieldName}
              field={field}
              value={formValues[field.fieldName]}
              onChange={handleFieldChange}
              formValues={formValues}
            />
            );
          })}
        </FieldsGrid>
        <ButtonContainer>
          <Button onClick={onClose}>
            取消
          </Button>

          <TestButton
            onClick={handleTest}
            disabled={isTestLoading || !isFormValid()}
          >
            {isTestLoading ? '测试中...' : '测试连接'}
          </TestButton>

          <Button
            $variant="primary"
            onClick={handleSave}
            disabled={isSaving || !isFormValid()}
          >
            {isSaving ? '保存中...' : '保存配置'}
          </Button>
        </ButtonContainer>
        <ModelsSection>
          <SectionTitle>模型选择</SectionTitle>
          <ModelSectionHeader>
            <ModelSectionButtons>
              <ModelActionButton $active={selectedModels.length > 0} onClick={handleSelectModel}>选择模型</ModelActionButton>
              <AddModelButton onClick={handleAddModelClick}>添加模型</AddModelButton>
            </ModelSectionButtons>
          </ModelSectionHeader>

          {/* 显示选中的模型 */}
          {selectedModels.length > 0 ? (
            <SelectedModelsContainer>
              {selectedModelInfos.map((model) => (
                <SelectedModelTag key={model.id}>
                  {model.name}
                  <RemoveModelButton onClick={() => handleRemoveModel(model.id)}>
                    ×
                  </RemoveModelButton>
                </SelectedModelTag>
              ))}
            </SelectedModelsContainer>
          ) : (
            <EmptyModelMessage>
              请点击"选择模型"按钮来添加模型
            </EmptyModelMessage>
          )}

          {/* 注释掉的原有模型显示代码 */}
          {/* {Object.entries(groupedModels).map(([groupName, models]) => (
          <ModelGroup key={groupName}>
            <GroupTitle>{groupName}</GroupTitle>
            <ModelList>
              {models.map((model) => (
                <ModelCard
                  key={model.id}
                  $selected={selectedModels.includes(model.id)}
                  onClick={() => {
                    if (selectedModels.includes(model.id)) {
                      setSelectedModels(prev => prev.filter(id => id !== model.id));
                    } else {
                      setSelectedModels(prev => [...prev, model.id]);
                    }
                  }}
                >
                  <ModelName>{model.name}</ModelName>
                  <ModelId>{model.id}</ModelId>
                </ModelCard>
              ))}
            </ModelList>
          </ModelGroup>
        ))} */}
        </ModelsSection>
      </FormSection>


      {testStatus.type && (
        <StatusMessage type={testStatus.type}>
          {testStatus.message}
        </StatusMessage>
      )}



      {/* 模型选择弹窗 */}
      <ModelSelectorModal
        isOpen={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        models={systemModels}
        selectedModels={selectedModels}
        onSelectModels={handleModelSelect}
        title={`${connect.overview.name} 模型选择`}
        modelUrl={connect.overview.about?.modelUrl}
        apiKey={formValues.apiKey || ''}
      />

      {/* 添加模型弹窗 */}
      <AddModelModal
        isOpen={showAddModelModal}
        onClose={() => setShowAddModelModal(false)}
        onAddModel={handleAddModel}
      />
      </ConfigPanel>
    </Container>
  );
};