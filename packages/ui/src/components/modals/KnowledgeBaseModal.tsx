import React, { useState, useEffect } from 'react';
import {
    ModalBackdrop,
    ModalHeader,
    ModalContent,
    CloseButton,
    FormButtonGroup,
    PremiumModalContainer,
    PremiumTitleDesc,
    PremiumFormSection,
    PremiumFormLabel,
    PremiumFormField,
    PremiumFormInput,
    PremiumFormButton,
    TabButton,
    BasicSelect
} from '../basic';
import { Slider } from '../basic/Slider';
import { InputSelect } from '../../controls';
import { useToast, ToastManager } from '../basic/LiquidToast';
import styled from 'styled-components';

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 改为4列 */
  gap: 16px; /* 稍微减小间距 */
  margin-bottom: 24px;
  padding: 0 16px;
//   width: 100%; /* 确保容器宽度100% */
//   min-width: 1200px; /* 设置最小宽度确保四列布局 */
//   overflow-x: auto; /* 如果屏幕太小允许水平滚动 */
`;

const Card = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? '#1f293790' : '#f5f5f5'};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#e5e7eb'};
  border-radius: 12px;
  padding: 20px;
  height: 320px;
  box-shadow: ${({ theme }) => theme.mode === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'};
  min-width: 280px; /* 设置卡片最小宽度 */
`;

const CardTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f9fafb' : '#111827'};
`;

const CardDescription = styled.p`
  margin: 0 0 16px 0;
  font-size: 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#9ca3af' : '#6b7280'};
  line-height: 1.4;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 400;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f9fafb' : '#374151'};
`;

const TabNavContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#e5e7eb'};
  margin-bottom: 24px;
  padding: 0px 16px;
`;

const FixedHeightTabContent = styled.div`
   min-height: 360px;
   padding:0px 20px;
`;

const AdvancedSettingsContainer = styled.div`
  padding: 20px;
  background: ${({ theme }) => theme.mode === 'dark' ? '#1f293790' : '#f5f5f5'};
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#d1d5db'};
`;

const ParameterDescription = styled.p`
  margin: 4px 0 8px 0;
  font-size: 12px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#9ca3af' : '#6b7280'};
  line-height: 1.4;
`;

const ThemedInputSelect = styled.div`
  .input-select {
    width: 100%;   
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#ffffff'};
    border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#f9fafb' : '#1f2937'};
    font-size: 13px;
  }
`;

// Themed components specifically for advanced tab
const AdvancedFormInput = styled(PremiumFormInput)`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#ffffff'} !important;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db'} !important;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f9fafb' : '#1f2937'} !important;
  
  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#9ca3af' : '#6b7280'} !important;
  }
  
  &:focus {
    border-color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.6)' : '#3b82f6'} !important;
    outline: 0;
    box-shadow: ${({ theme }) => theme.mode === 'dark' ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : '0 0 0 3px rgba(59, 130, 246, 0.1)'} !important;
  }
`;

const AdvancedFormLabel = styled(PremiumFormLabel)`
  color: ${({ theme }) => theme.mode === 'dark' ? '#f9fafb' : '#374151'} !important;
`;

const PageTip = styled.div`
    background: ${({ theme }) => theme.mode === 'dark' ? '#ffd11830' : '#fef3c7'};
    border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#f59e0b30' : '#f59e0b50'};
    padding: 8px;
    display: flex;
    font-size:12px;
    font-weight:400;
    margin-top: 16px;
    color: ${({ theme }) => theme.mode === 'dark' ? '#d9d9d9' : '#92400e'};
`;

interface ConnectConfig {
    id: string;
    name: string;
    ctype: string;
}

interface ModelOption {
    value: string;
    label: string;
}

interface KnowledgeBaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (data: any) => Promise<boolean>;
    editMode?: boolean;
    editData?: any;
    onLoadModels?: (connectId: string) => Promise<ModelOption[]>;
    onLoadConnections?: () => Promise<ConnectConfig[]>;
    onFetchLLMConnects?: () => Promise<any[]>;
    onFetchOnlineModels?: (datasourceId: string, search?: string, type?: string) => Promise<any>;
    connections?: ConnectConfig[];
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
    isOpen,
    onClose,
    onSave,
    editMode = false,
    editData,
    onLoadModels,
    onLoadConnections,
    onFetchLLMConnects,
    onFetchOnlineModels,
    connections: propConnections
}) => {
    const [activeTab, setActiveTab] = useState<'general' | 'advanced'>('general');
    const [formData, setFormData] = useState({
        name: '',
        embeddingConnectId: '',
        embeddingModel: '',
        vectorConnectId: '',
        rerankerConnectId: '',
        rerankModel: '',
        documentChunks: 30,
        embeddingDimension: '',
        // 高级设置字段
        chunkSize: 1000,
        chunkOverlap: 200,
        similarityThreshold: 0.7
    });

    // 连接和模型相关状态
    const [connections, setConnections] = useState<ConnectConfig[]>(propConnections || []);
    const [llmConnections, setLlmConnections] = useState<any[]>([]);
    const [embeddingModels, setEmbeddingModels] = useState<ModelOption[]>([]);
    const [rerankModels, setRerankModels] = useState<ModelOption[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [modelsCache, setModelsCache] = useState<Record<string, ModelOption[]>>({});

    const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();

    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 处理嵌入模型连接配置变更
    const handleEmbeddingConnectionChange = async (connectionId: string) => {
        setFormData(prev => ({ ...prev, embeddingConnectId: connectionId, embeddingModel: '' }));
        await loadEmbeddingModels(connectionId);
    };

    // 处理排序模型连接配置变更
    const handleRerankConnectionChange = async (connectionId: string) => {
        setFormData(prev => ({ ...prev, rerankerConnectId: connectionId, rerankModel: '' }));
        await loadRerankModels(connectionId);
    };

    // 加载连接配置 - 只在模态框打开时调用
    useEffect(() => {
        if (!isOpen) return;

        if (propConnections) {
            setConnections(propConnections);
        } else if (onLoadConnections) {
            const fetchConnections = async () => {
                try {
                    const data = await onLoadConnections();
                    setConnections(data);
                } catch (error) {
                    console.error('获取连接配置失败:', error);
                }
            };
            fetchConnections();
        }
    }, [isOpen, propConnections, onLoadConnections]);

    // 加载LLM连接配置 - 只在模态框打开时调用
    useEffect(() => {
        if (!isOpen) return;

        if (onFetchLLMConnects) {
            const fetchLLMConnections = async () => {
                try {
                    const data = await onFetchLLMConnects();
                    setLlmConnections(data);
                } catch (error) {
                    console.error('获取LLM连接配置失败:', error);
                }
            };
            fetchLLMConnections();
        }
    }, [isOpen, onFetchLLMConnects]);

    // 加载嵌入模型列表的独立函数
    const loadEmbeddingModels = async (connectionId: string) => {
        if (!connectionId) {
            setEmbeddingModels([]);
            return;
        }

        const cachedModels = modelsCache[connectionId + 'embedding'];
        if (cachedModels) {
            setEmbeddingModels(cachedModels);
            return;
        }

        setLoading(true);
        try {
            if (onFetchOnlineModels) {
                const result = await onFetchOnlineModels(connectionId, 'embedding');
                if (!result.error && result.tableOptions && result.tableOptions.length > 0) {
                    const modelOptions = result.tableOptions.map((option: any) => ({
                        value: option.value,
                        label: option.label || option.value
                    }));
                    setEmbeddingModels(modelOptions);
                    setModelsCache(prev => ({ ...prev, [connectionId + 'embedding']: modelOptions }));
                } else {
                    setEmbeddingModels([]);
                }
            } else if (onLoadModels) {
                const modelOptions = await onLoadModels(connectionId);
                setEmbeddingModels(modelOptions);
                setModelsCache(prev => ({ ...prev, [connectionId + 'embedding']: modelOptions }));
            }
        } catch (error) {
            console.error('获取嵌入模型列表失败:', error);
            setEmbeddingModels([]);
        } finally {
            setLoading(false);
        }
    };

    // 加载排序模型列表的独立函数
    const loadRerankModels = async (connectionId: string) => {
        if (!connectionId) {
            setRerankModels([]);
            return;
        }

        const cachedModels = modelsCache[connectionId + 'reranker'];
        if (cachedModels) {
            setRerankModels(cachedModels);
            return;
        }

        setLoading(true);
        try {
            if (onFetchOnlineModels) {
                const result = await onFetchOnlineModels(connectionId, 'reranker');
                if (!result.error && result.tableOptions && result.tableOptions.length > 0) {
                    const modelOptions = result.tableOptions.map((option: any) => ({
                        value: option.value,
                        label: option.label || option.value
                    }));
                    setRerankModels(modelOptions);
                    setModelsCache(prev => ({ ...prev, [connectionId + 'reranker']: modelOptions }));
                } else {
                    setRerankModels([]);
                }
            } else if (onLoadModels) {
                const modelOptions = await onLoadModels(connectionId);
                setRerankModels(modelOptions);
                setModelsCache(prev => ({ ...prev, [connectionId + 'reranker']: modelOptions }));
            }
        } catch (error) {
            console.error('获取排序模型列表失败:', error);
            setRerankModels([]);
        } finally {
            setLoading(false);
        }
    };

    // 当嵌入模型连接ID变化时，自动加载模型列表
    useEffect(() => {
        if (formData.embeddingConnectId && isOpen && llmConnections.length > 0) {
            loadEmbeddingModels(formData.embeddingConnectId);
        }
    }, [formData.embeddingConnectId, isOpen, llmConnections.length]);

    // 当排序模型连接ID变化时，自动加载模型列表
    useEffect(() => {
        if (formData.rerankerConnectId && isOpen && llmConnections.length > 0) {
            loadRerankModels(formData.rerankerConnectId);
        }
    }, [formData.rerankerConnectId, isOpen, llmConnections.length]);

    // 清除历史数据 - 新建知识库时重置所有状态
    useEffect(() => {
        if (isOpen && !editData) {
            // 新建模式：清空所有历史数据
            setFormData({
                name: '',
                embeddingConnectId: '',
                embeddingModel: '',
                vectorConnectId: '',
                rerankerConnectId: '',
                rerankModel: '',
                documentChunks: 30,
                embeddingDimension: '',
                chunkSize: 1000,
                chunkOverlap: 200,
                similarityThreshold: 0.7
            });
            // 清空模型列表和缓存
            setEmbeddingModels([]);
            setRerankModels([]);
            setModelsCache({});
        }
    }, [isOpen, editData]);

    // 当editData变化时更新表单数据
    useEffect(() => {
        if (editData) {
            setFormData({
                name: editData.name || '',
                embeddingConnectId: editData.embeddingConnectId || '',
                embeddingModel: editData.embeddingModelId || '',
                vectorConnectId: editData.vectorConnectId || '',
                rerankerConnectId: editData.rerankerConnectId || '',
                rerankModel: editData.rerankerModelId || '',
                embeddingDimension: editData.embeddingDimension || '',
                documentChunks: editData.documentChunks || 30,
                chunkSize: editData.chunkSize || 1000,
                chunkOverlap: editData.chunkOverlap || 200,
                similarityThreshold: editData.matchingThreshold || 0.7
            });
        }
    }, [editData]);

    const handleSave = async () => {
        try {
            // 验证必填字段
            if (!formData.name || formData.name.trim() === '') {
                showWarning('警告', '请填写知识库名称');
                return;
            }

            if (onSave) {
                // 映射字段名称以匹配API期望的格式，只传递API需要的字段
                const apiData = {
                    name: formData.name,
                    embeddingConnectId: formData.embeddingConnectId,
                    embeddingModelId: formData.embeddingModel,
                    embeddingDimension: formData.embeddingDimension,
                    vectorConnectId: formData.vectorConnectId,
                    rerankerConnectId: formData.rerankerConnectId,
                    rerankerModelId: formData.rerankModel,
                    chunkSize: formData.chunkSize,
                    chunkOverlap: formData.chunkOverlap,
                    matchingThreshold: formData.similarityThreshold
                };



                const success = await onSave(apiData);
                if (success) {
                    showSuccess('成功', '知识库配置保存成功');
                    onClose();
                } else {
                    showError('错误', '保存失败，请重试');
                }
            }
        } catch (error) {
            showError('错误', '保存过程中发生错误');
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <ModalBackdrop>
                <PremiumModalContainer style={{ maxWidth: '1400px', width: '90vw' }}>
                    <ModalHeader>
                        <PremiumTitleDesc>
                            <h4>{editMode ? '编辑知识库' : '添加知识库'}</h4>
                            <p>配置知识库的基本信息和处理参数</p>
                        </PremiumTitleDesc>
                        <CloseButton onClick={onClose}>×</CloseButton>
                    </ModalHeader>

                    <ModalContent>
                        {/* 基本信息 */}
                        <PremiumFormSection>
                            <PremiumFormField>
                                <PremiumFormLabel>知识库名称</PremiumFormLabel>
                                <PremiumFormInput
                                    type="text"
                                    placeholder="请输入知识库名称"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                            </PremiumFormField>
                        </PremiumFormSection>

                        {/* 标签页导航 */}
                        <TabNavContainer>
                            <TabButton
                                $active={activeTab === 'general'}
                                onClick={() => setActiveTab('general')}
                            >
                                常规设置
                            </TabButton>
                            <TabButton
                                $active={activeTab === 'advanced'}
                                onClick={() => setActiveTab('advanced')}
                            >
                                高级设置
                            </TabButton>
                        </TabNavContainer>

                        <FixedHeightTabContent>
                            {activeTab === 'general' && (
                                <>
                                    {/* 四列卡片布局 */}
                                    <CardsContainer>
                                        {/* 文件处理卡片 */}
                                        <Card>
                                            <CardTitle>No 1.文件处理</CardTitle>
                                            <CardDescription>
                                                将您上传的文档（Word、PDF等）自动进行整理和分段，为后续处理做好准备                                            </CardDescription>
                                            <FormGroup>
                                                <Label>连接配置</Label>
                                                <BasicSelect
                                                    defaultValue=""
                                                >
                                                    <option value="">使用系统内置处理</option>
                                                    {llmConnections.map((conn) => (
                                                        <option key={conn.id} value={conn.id}>
                                                            {conn.name}
                                                        </option>
                                                    ))}
                                                </BasicSelect>
                                            </FormGroup>
                                        </Card>

                                        {/* 嵌入模型卡片 */}
                                        <Card>
                                            <CardTitle>No 2.ﾠ嵌入模型</CardTitle>
                                            <CardDescription>
                                                把文字内容转换成计算机能理解的数字代码，就像给每段话分配一个专属身份证。
                                            </CardDescription>
                                            <FormGroup>
                                                <Label>连接配置</Label>
                                                <BasicSelect
                                                    value={formData.embeddingConnectId}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleEmbeddingConnectionChange(e.target.value)}
                                                >
                                                    <option value="">使用内置模型</option>
                                                    {llmConnections.map((conn) => (
                                                        <option key={conn.id} value={conn.id}>
                                                            {conn.name}
                                                        </option>
                                                    ))}
                                                </BasicSelect>
                                            </FormGroup>

                                            <FormGroup>
                                                <Label>模型选择</Label>
                                                <ThemedInputSelect>
                                                    <InputSelect
                                                        options={embeddingModels.map(model => model.value)}
                                                        value={formData.embeddingModel}
                                                        onChange={(value) => handleInputChange('embeddingModel', value)}
                                                        //placeholder="请先选择连接配置"
                                                        disabled={!formData.embeddingConnectId || loading}
                                                        className="input-select"
                                                    />
                                                </ThemedInputSelect>
                                            </FormGroup>
                                        </Card>

                                        {/* 向量库卡片 */}
                                        <Card>
                                            <CardTitle>No 3.ﾠ向量库</CardTitle>
                                            <CardDescription>
                                                存储所有转换后的内容，像一个智能图书馆，能快速找到与问题相关的内容。
                                            </CardDescription>
                                            <FormGroup>
                                                <Label>向量库连接</Label>
                                                <BasicSelect
                                                    value={formData.vectorConnectId}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('vectorConnectId', e.target.value)}
                                                >
                                                    <option value="">使用内置存储</option>
                                                    {connections.map((conn) => (
                                                        <option key={conn.id} value={conn.id}>
                                                            {conn.name}
                                                        </option>
                                                    ))}
                                                </BasicSelect>
                                            </FormGroup>
                                        </Card>

                                        {/* 排序模型卡片 */}
                                        <Card>
                                            <CardTitle>No 4.ﾠ排序模型</CardTitle>
                                            <CardDescription>
                                                对搜索结果进行智能排序，把最符合您需求的答案优先展示在前面。
                                            </CardDescription>
                                            <FormGroup>
                                                <Label>连接配置</Label>
                                                <BasicSelect
                                                    value={formData.rerankerConnectId}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleRerankConnectionChange(e.target.value)}
                                                >
                                                    <option value="">不排序</option>
                                                    {llmConnections.map((conn) => (
                                                        <option key={conn.id} value={conn.id}>
                                                            {conn.name}
                                                        </option>
                                                    ))}
                                                </BasicSelect>
                                            </FormGroup>

                                            <FormGroup>
                                                <Label>模型选择</Label>
                                                <ThemedInputSelect>
                                                    <InputSelect
                                                        options={rerankModels.map(model => model.value)}
                                                        value={formData.rerankModel}
                                                        onChange={(value) => handleInputChange('rerankModel', value)}
                                                        placeholder="请先选择连接配置"
                                                        disabled={!formData.rerankerConnectId || loading}
                                                        className="input-select"
                                                    />
                                                </ThemedInputSelect>
                                            </FormGroup>
                                        </Card>
                                    </CardsContainer>
                                    {/* 警告提示 */}
                                    {/* <PageTip>
                                        ⚠ 注意：当上方四块内容未被设置被保存，则采用系统内部的模型和向量库，文件处理的精度会有欠缺
                                    </PageTip> */}
                                </>
                            )}

                            {activeTab === 'advanced' && (
                                <AdvancedSettingsContainer>
                                    <PremiumFormSection>
                                        <PremiumFormField>
                                            <AdvancedFormLabel>请求文档片段数量</AdvancedFormLabel>
                                            <ParameterDescription>
                                                控制每次检索时返回的文档片段数量。数量越多，提供的上下文越丰富，但也会增加处理时间和成本。建议根据问题复杂度调整：简单问题用较少片段，复杂问题用较多片段。
                                            </ParameterDescription>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <Slider
                                                        value={formData.documentChunks}
                                                        min={1}
                                                        max={50}
                                                        step={1}
                                                        onChange={(value) => handleInputChange('documentChunks', Math.round(value))}
                                                        showValue={true}
                                                        formatValue={(val) => val.toString()}
                                                    />
                                                </div>
                                            </div>
                                        </PremiumFormField>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                            <PremiumFormField>
                                                <AdvancedFormLabel>分段大小</AdvancedFormLabel>
                                                <ParameterDescription>
                                                    指文档切分后的字符数量。较小的分段匹配更精确但可能丢失上下文；较大的分段匹配精度可能降低。建议范围：500-1500字符。
                                                </ParameterDescription>
                                                <AdvancedFormInput
                                                    type="number"
                                                    placeholder="数值(建议不超过1000字)"
                                                    value={formData.chunkSize}
                                                    onChange={(e) => handleInputChange('chunkSize', parseInt(e.target.value) || 0)}
                                                    style={{ marginTop: '2px' }}
                                                />
                                            </PremiumFormField>

                                            <PremiumFormField>
                                                <AdvancedFormLabel>重叠大小</AdvancedFormLabel>
                                                <ParameterDescription>
                                                    相邻文档分段之间重叠的字符数量，重叠可避免信息被分割到不同段落中，提高检索的连续性。通常设置为分段大小的10-20%。
                                                </ParameterDescription>
                                                <AdvancedFormInput
                                                    type="number"
                                                    placeholder="数值(建议不超过1000字)"
                                                    value={formData.chunkOverlap}
                                                    onChange={(e) => handleInputChange('chunkOverlap', parseInt(e.target.value) || 0)}
                                                    style={{ marginTop: '2px' }}
                                                />
                                            </PremiumFormField>

                                            <PremiumFormField>
                                                <AdvancedFormLabel>嵌入维度</AdvancedFormLabel>
                                                <ParameterDescription>
                                                    把文字(比如一个词、一句话)转换成一系列的数字，生成的那串数字就叫“向量”，维度越高，Tokend消耗越大，建议：512-2048。                                               </ParameterDescription>
                                                <AdvancedFormInput
                                                    type="number"
                                                    // step="any"
                                                    placeholder="留空则表示不设置"
                                                    value={formData.embeddingDimension}
                                                    onChange={(e) => handleInputChange('embeddingDimension', e.target.value ? parseFloat(e.target.value) : '')}
                                                    style={{ marginTop: '2px' }}
                                                />
                                            </PremiumFormField>

                                            <PremiumFormField>
                                                <AdvancedFormLabel>匹配度阈值</AdvancedFormLabel>
                                                <ParameterDescription>
                                                    用于筛选检索结果的相似度(0-1)。阈值越高结果越相关但数量少；阈值越低结果越多但相关性可能下降。建议0.6-0.8。
                                                </ParameterDescription>
                                                <AdvancedFormInput
                                                    type="number"
                                                    placeholder="未设置"
                                                    value={formData.similarityThreshold}
                                                    onChange={(e) => handleInputChange('similarityThreshold', parseFloat(e.target.value) || 0)}
                                                    style={{ marginTop: '2px' }}
                                                />
                                            </PremiumFormField>
                                        </div>

                                        {/* 警告提示 */}
                                        <PageTip>
                                            ⚠  注意：修改分段大小和重叠大小后，只有新上传的文档会使用新设置，已有文档需要重新上传才能生效
                                        </PageTip>
                                    </PremiumFormSection>
                                </AdvancedSettingsContainer>
                            )}

                        </FixedHeightTabContent>

                        <FormButtonGroup>
                            <PremiumFormButton
                                $variant="primary"
                                onClick={handleSave}
                                style={{
                                    background: '#3b82f6',
                                    border: 'none',
                                    fontWeight: '600'
                                }}
                            >
                                确定
                            </PremiumFormButton>
                            <PremiumFormButton $variant="secondary" onClick={onClose}>
                                取消
                            </PremiumFormButton>
                        </FormButtonGroup>
                    </ModalContent>
                </PremiumModalContainer>
            </ModalBackdrop>
            <ToastManager toasts={toasts} onRemove={removeToast} />
        </>
    );
};