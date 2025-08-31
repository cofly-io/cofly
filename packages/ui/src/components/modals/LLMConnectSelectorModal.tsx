"use client";

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  ModalBackdrop,
  PremiumModalContainer,
  PremiumTitleDesc,
  ModalHeader,
  ModalContent,
  CloseButton,
  FormButton,
  FormButtonGroup
} from '../basic';
import { LLMCntDetailsView } from '../forms/connect/LLMCntDetailsView';

const LLMConnectGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
`;

const LLMConnectCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
  }
`;

const ConnectIcon = styled.div`
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
`;

const ConnectName = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
`;

const ConnectDescription = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
`;

const ErrorState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #ff6b6b;
  font-size: 14px;
  text-align: center;
`;

interface LLMConnectInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  provider: string;
  tags?: string[];
}

interface LLMConnectSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectCreated?: () => void; // 连接创建成功后的回调
  onFetchLLMConnects?: () => Promise<any[]>;
  onFetchConnectDetails?: (connectId: string) => Promise<any>;
  onSaveConnect?: (data: any) => Promise<boolean>;
  onTestConnect?: (config: Record<string, any>, message?: string) => Promise<any>;
}

export const LLMConnectSelectorModal: React.FC<LLMConnectSelectorModalProps> = ({
  isOpen,
  onClose,
  onConnectCreated,
  onFetchLLMConnects,
  onFetchConnectDetails,
  onSaveConnect,
  onTestConnect
}) => {
  const [llmConnects, setLlmConnects] = useState<LLMConnectInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedConnect, setSelectedConnect] = useState<any | null>(null);

  // 获取LLM连接列表
  const fetchLLMConnects = async () => {
    if (!onFetchLLMConnects) {
      setError('未提供连接数据获取方法');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const connectsData = await onFetchLLMConnects();
      console.log('🔍 获取到的连接数据:', connectsData);
      
      // 过滤只显示LLM类型的连接
      const llmConnectsFiltered = connectsData.filter(connect => 
        connect.type === 'llm' || connect.mtype === 'llm'
      );
      
      console.log('🎯 过滤后的LLM连接:', llmConnectsFiltered);
      setLlmConnects(llmConnectsFiltered || []);
    } catch (err) {
      console.error('❌ 获取LLM连接列表失败:', err);
      setError(err instanceof Error ? err.message : '获取连接列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLLMConnects();
      setSelectedConnect(null);
    }
  }, [isOpen]);

  // 处理连接选择
  const handleConnectSelect = async (connectInfo: LLMConnectInfo) => {
    if (!onFetchConnectDetails) {
      console.error('❌ 未提供连接详情获取方法');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📋 获取连接详情:', connectInfo.id);
      const connectDetails = await onFetchConnectDetails(connectInfo.id);
      console.log('✅ 连接详情获取成功:', connectDetails);
      setSelectedConnect(connectDetails);
    } catch (err) {
      console.error('❌ 获取连接详情失败:', err);
      setError(err instanceof Error ? err.message : '获取连接详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理连接保存
  const handleConnectSave = async (data: any) => {
    if (!onSaveConnect) {
      console.error('❌ 未提供连接保存方法');
      return;
    }

    try {
      console.log('💾 保存LLM连接:', data);
      await onSaveConnect(data);
      console.log('✅ LLM连接保存成功');
      
      // 调用创建成功回调
      if (onConnectCreated) {
        onConnectCreated();
      }
      
      // 关闭弹窗
      onClose();
    } catch (err) {
      console.error('❌ 保存LLM连接失败:', err);
      throw err; // 让LLMCntDetailsView处理错误显示
    }
  };

  // 返回连接列表
  const handleBackToList = () => {
    setSelectedConnect(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <ModalBackdrop>
      <PremiumModalContainer style={{ height: '90vh', width: selectedConnect ? '90vw' : '80vw', maxWidth: selectedConnect ? '1200px' : '900px' }}>
        <ModalHeader>
          <PremiumTitleDesc>
            <h4>{selectedConnect ? '配置大模型连接' : '选择大模型连接'}</h4>
            <p>
              {selectedConnect 
                ? '配置您选择的大模型连接参数，完成后即可在智能体中使用' 
                : '选择一个大模型提供商来创建连接配置'
              }
            </p>
          </PremiumTitleDesc>
          <CloseButton onClick={selectedConnect ? handleBackToList : onClose} style={{ color: 'white' }}>
            {selectedConnect ? '←' : '×'}
          </CloseButton>
        </ModalHeader>

        <ModalContent style={{ height: 'calc(90vh - 80px)' }}>
          {selectedConnect ? (
            // 显示连接配置详情
            <LLMCntDetailsView
              connect={selectedConnect}
              onClose={handleBackToList}
              onSave={handleConnectSave}
              onTest={onTestConnect}
              editMode={false}
              showBackButton={true}
            />
          ) : (
            // 显示连接列表
            <>
              {loading ? (
                <LoadingState>
                  🔄 正在加载大模型连接...
                </LoadingState>
              ) : error ? (
                <ErrorState>
                  ⚠️ {error}
                </ErrorState>
              ) : llmConnects.length === 0 ? (
                <LoadingState>
                  暂无可用的大模型连接类型
                </LoadingState>
              ) : (
                <LLMConnectGrid>
                  {llmConnects.map((connect) => (
                    <LLMConnectCard
                      key={connect.id}
                      onClick={() => handleConnectSelect(connect)}
                    >
                      <ConnectIcon>
                        {connect.icon ? (
                          <img
                            src={`/connects/llm/${connect.provider || connect.id}/${connect.icon}`}
                            alt={connect.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div style={{ fontSize: '24px' }}>🤖</div>
                        )}
                      </ConnectIcon>
                      <ConnectName>{connect.name}</ConnectName>
                      <ConnectDescription>{connect.description}</ConnectDescription>
                      {connect.tags && connect.tags.length > 0 && (
                        <div style={{ 
                          marginTop: '8px', 
                          display: 'flex', 
                          gap: '4px', 
                          flexWrap: 'wrap' 
                        }}>
                          {connect.tags.map((tag, index) => (
                            <span
                              key={index}
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px',
                                color: 'rgba(255, 255, 255, 0.7)'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </LLMConnectCard>
                  ))}
                </LLMConnectGrid>
              )}
              
              {!selectedConnect && (
                <FormButtonGroup style={{ padding: '20px', justifyContent: 'center' }}>
                  <FormButton
                    $variant="secondary"
                    onClick={onClose}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'white'
                    }}
                  >
                    取消
                  </FormButton>
                </FormButtonGroup>
              )}
            </>
          )}
        </ModalContent>
      </PremiumModalContainer>
    </ModalBackdrop>
  );
}; 