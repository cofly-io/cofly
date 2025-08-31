"use client";

import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { ModelInfo } from '@repo/common';

// 弹窗背景
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 弹窗容器
const ModalContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  width: 60vw;
  height: 70vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  }
`;

// 弹窗头部
const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 24px;
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, #60a5fa, #3b82f6);
    border-radius: 1px;
  }
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 8px;
  line-height: 1;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    transform: scale(1.05);
  }
`;

const AddButton = styled.button`
  background: #10b981;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  
  &:hover {
    background: #059669;
  }
`;

// 搜索区域
const SearchSection = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.1);
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
    transform: scale(1.02);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
`;

// 分类标签
const CategoryTabs = styled.div`
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  overflow-x: auto;
  background: rgba(0, 0, 0, 0.1);
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const CategoryTab = styled.button<{ $active?: boolean }>`
  padding: 6px 16px;
  border: 1px solid ${props => props.$active ? '#60a5fa' : 'rgba(255, 255, 255, 0.3)'};
  background: ${props => props.$active ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.8)'};
  border-radius: 20px;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
  
  ${props => props.$active && `
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.3);
  `}
  
  &:hover {
    border-color: #60a5fa;
    background: ${props => props.$active ? 'rgba(96, 165, 250, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
    transform: scale(1.05);
  }
`;

// 内容区域
const ModalContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.05);
  
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
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

const ModelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
`;

const ModelCard = styled.div<{ $selected?: boolean }>`
  padding: 16px;
  border: 2px solid ${props => props.$selected ? '#60a5fa' : 'rgba(255, 255, 255, 0.15)'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${props => props.$selected ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255, 255, 255, 0.08)'};
  backdrop-filter: blur(4px);
  position: relative;
  
  ${props => props.$selected && `
    box-shadow: 0 0 20px rgba(96, 165, 250, 0.3), 
                0 8px 16px rgba(0, 0, 0, 0.2);
    
    &::after {
      content: '✓';
      position: absolute;
      top: 12px;
      right: 12px;
      background: #22c55e;
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
    }
  `}
  
  &:hover {
    border-color: ${props => props.$selected ? '#60a5fa' : '#60a5fa'};
    background: ${props => props.$selected ? 'rgba(96, 165, 250, 0.3)' : 'rgba(255, 255, 255, 0.15)'};
    box-shadow: ${props => props.$selected
    ? '0 0 25px rgba(96, 165, 250, 0.4), 0 12px 24px rgba(0, 0, 0, 0.25)'
    : '0 12px 24px rgba(0, 0, 0, 0.25)'
  };
    transform: translateY(-2px);
  }
`;

const ModelName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
`;

const ModelId = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
`;

const ModelDescription = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
`;

const ModelTags = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

const ModelTag = styled.span`
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
`;

// 底部按钮区域
const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.$variant === 'primary' ? '#10b981' : '#d1d5db'};
  background: ${props => props.$variant === 'primary' ? '#10b981' : 'white'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#374151'};
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$variant === 'primary' ? '#059669' : '#f9fafb'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
`;

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: ModelInfo[]; // 静态模型列表（作为回退）

  // 单选模式（推荐）
  selectedModel?: string;
  onSelectModel?: (modelId: string) => void;

  // 多选模式（向后兼容）
  selectedModels?: string[];
  onSelectModels?: (modelIds: string[]) => void;

  title?: string;
  connectId?: string; // 连接器ID，用于获取在线模型
  config?: Record<string, any>; // 连接配置，用于测试获取模型
  loading?: boolean; // 加载状态

  // 在线模型获取函数
  onFetchOnlineModels?: (connectId: string) => Promise<ModelInfo[]>;

  // 旧版兼容属性
  modelUrl?: string;
  apiKey?: string;
}

export const ModelSelectorModal: React.FC<ModelSelectorModalProps> = ({
  isOpen,
  onClose,
  models,
  selectedModel = '',
  onSelectModel,
  selectedModels = [],
  onSelectModels,
  title = "选择模型",
  loading = false,
  connectId,
  onFetchOnlineModels,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');

  // 在线模型缓存状态
  const [cachedModels, setCachedModels] = useState<Record<string, ModelInfo[]>>({});
  const [isLoadingOnlineModels, setIsLoadingOnlineModels] = useState(false);
  const [onlineModelsError, setOnlineModelsError] = useState<string | null>(null);

  // 强制设置为单选模式
  const isMultiSelect = false;

  // 单选模式的临时选中状态
  const [tempSelectedModel, setTempSelectedModel] = useState<string>(selectedModel);

  // 多选模式的临时选中状态
  const [tempSelectedModels, setTempSelectedModels] = useState<string[]>(selectedModels);

  // 获取在线模型的函数
  const fetchOnlineModels = async (connectId: string) => {
    if (!onFetchOnlineModels) return;

    // 如果已经缓存了该连接的模型，直接返回
    if (cachedModels[connectId]) {
      console.log('🎯 使用缓存的在线模型:', connectId, cachedModels[connectId].length);
      return;
    }

    setIsLoadingOnlineModels(true);
    setOnlineModelsError(null);

    try {
      console.log('🔄 获取在线模型:', connectId);
      const onlineModels = await onFetchOnlineModels(connectId);

      // 缓存获取到的模型
      setCachedModels(prev => ({
        ...prev,
        [connectId]: onlineModels || []
      }));

      console.log('✅ 在线模型获取成功并缓存:', connectId, onlineModels?.length || 0);
    } catch (error) {
      console.error('❌ 获取在线模型失败:', error);
      setOnlineModelsError(error instanceof Error ? error.message : '获取在线模型失败');
    } finally {
      setIsLoadingOnlineModels(false);
    }
  };

  // 当模态框打开且有connectId时，获取在线模型
  useEffect(() => {
    if (isOpen && connectId && onFetchOnlineModels) {
      fetchOnlineModels(connectId);
    }
  }, [isOpen, connectId, onFetchOnlineModels]);

  // 同步选中状态
  useEffect(() => {
    if (isMultiSelect) {
      setTempSelectedModels(selectedModels);
    } else {
      setTempSelectedModel(selectedModel);
    }
  }, [selectedModel, selectedModels, isMultiSelect]);

  // 当前使用的模型列表（优先使用缓存的在线模型，否则使用传入的models）
  const currentModels = useMemo(() => {
    if (connectId && cachedModels[connectId] && cachedModels[connectId].length > 0) {
      console.log('📦 使用缓存的在线模型:', connectId, cachedModels[connectId].length);
      return cachedModels[connectId];
    }
    console.log('📦 使用传入的静态模型:', models.length);
    return models;
  }, [connectId, cachedModels, models]);
  // 动态生成分类列表，基于模型的tags字段
  const categories = React.useMemo(() => {
    const tags = new Set<string>();

    // 从模型数据中提取所有tags
    currentModels.forEach(model => {
      if (model.tags && Array.isArray(model.tags)) {
        model.tags.forEach(tag => {
          tags.add(tag);
        });
      }
    });

    // 转换为数组并排序，'全部'始终在第一位
    const sortedTags = Array.from(tags).sort();
    return ['全部', ...sortedTags];
  }, [currentModels]);

  // 过滤和去重模型
  const filteredModels = useMemo(() => {
    // 去重处理，以model.id为唯一标识
    const uniqueModels = currentModels.reduce((acc, current) => {
      const existing = acc.find(item => item.id === current.id);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, [] as ModelInfo[]);

    let filtered = uniqueModels;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (model.group && model.group.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 分类过滤：只按tags进行过滤
    if (activeCategory !== '全部') {
      filtered = filtered.filter(model =>
        model.tags && model.tags.includes(activeCategory)
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [currentModels, searchTerm, activeCategory]);

  const handleConfirm = () => {
    if (isMultiSelect) {
      // 多选模式
      if (onSelectModels) {
        onSelectModels(tempSelectedModels);
      }
    } else {
      // 单选模式
      if (tempSelectedModel && onSelectModels) {
        onSelectModels([tempSelectedModel]);
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <CloseButton onClick={onClose}>×</CloseButton>
          </div>
        </ModalHeader>

        <SearchSection>
          <SearchContainer>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput
              placeholder="搜索模型 ID 或名称"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
        </SearchSection>

        <CategoryTabs>
          {categories.map((category) => (
            <CategoryTab
              key={category}
              $active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </CategoryTab>
          ))}
        </CategoryTabs>

        <ModalContent>
          {(loading || isLoadingOnlineModels) ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '400px',
              gap: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #e5e7eb',
                borderTop: '3px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{
                color: '#6b7280',
                fontSize: '14px'
              }}>
                {isLoadingOnlineModels ? '正在获取在线模型...' : '正在加载模型列表...'}
              </div>
            </div>
          ) : onlineModelsError ? (
            <EmptyState>
              <div style={{ color: '#ef4444', marginBottom: '8px' }}>⚠️ 获取在线模型失败</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>{onlineModelsError}</div>
              {connectId && (
                <button
                  onClick={() => fetchOnlineModels(connectId)}
                  style={{
                    marginTop: '12px',
                    padding: '6px 12px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  重试获取
                </button>
              )}
            </EmptyState>
          ) : filteredModels.length === 0 ? (
            <EmptyState>
              {searchTerm || activeCategory !== '全部' ? '未找到匹配的模型' : '暂无可用模型'}
            </EmptyState>
          ) : (
            <>
              {/* 模型数量指示器 */}
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📦 模型列表</span>
                <span>({filteredModels.length} 个模型)</span>
                {connectId && cachedModels[connectId] && (
                  <span style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#22c55e',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}>
                    已缓存
                  </span>
                )}
              </div>

              <ModelGrid>
                {filteredModels.map((model) => (
                  <ModelCard
                    key={model.id}
                    $selected={tempSelectedModel === model.id}
                    onClick={() => {
                      if (isMultiSelect) {
                        // 多选模式
                        // if (tempSelectedModels.includes(model.id)) {
                        //   const newSelection = tempSelectedModels.filter(id => id !== model.id);
                        //   setTempSelectedModels(newSelection);
                        // } else {
                        //   const newSelection = [...tempSelectedModels, model.id];
                        //   setTempSelectedModels(newSelection);
                        // }
                      } else {
                        // 单选模式
                        if (tempSelectedModel === model.id) {
                          setTempSelectedModel('');
                        } else {
                          setTempSelectedModel(model.id);
                        }
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
                      <ModelName>{model.name}</ModelName>
                      {model.tags && model.tags.length > 0 && (
                        <ModelTags style={{ marginTop: '-2px' }}>
                          {model.tags.map((tag, index) => (
                            <ModelTag key={index}>{tag}</ModelTag>
                          ))}
                        </ModelTags>
                      )}
                    </div>
                    <ModelId>{model.id}</ModelId>
                    {model.description && (
                      <ModelDescription>{model.group}</ModelDescription>
                    )}
                  </ModelCard>
                ))}
              </ModelGrid>
            </>
          )}
        </ModalContent>

        <ModalFooter>
          <Button onClick={onClose}>取消</Button>
          <Button
            $variant="primary"
            onClick={handleConfirm}
            disabled={!tempSelectedModel}
          >
            确认选择{tempSelectedModel ? ` (${tempSelectedModel.split('/').pop() || tempSelectedModel})` : ''}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </ModalBackdrop>
  );
};