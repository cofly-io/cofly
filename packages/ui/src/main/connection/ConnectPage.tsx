import React, { useState, useRef, useEffect } from 'react';
// 移除已废弃的 IConnectCategory 导入

// 导入UI组件样式
import {
  GlassContainer,
  GlassMain,
  GlassHeader,
  GlassDescription,
  GlassTabNav,
  GlassTab,
  GlassDescInfo,
} from '../../components/shared/ui-components';

import {
  HeaderContainer,
  TitleContainer,
  WelcomeContainer,
  WelcomeContent,
  IconContainer,
  WelcomeTitle,
  PlaceholderContainer,
}
  from '../shared/styles/welcome';
import { SiGitconnected } from "react-icons/si";
import { CoButton, useToast } from '../../components/basic';
import { ConnectConfigModal } from '../../components/modals/ConnectConfigModal';
import { ConnectList } from './ConnectList';

// interface Category {
//   id: string;
//   name: string;
//   description: string;
//   type: string;
// }

interface ConnectConfig {
  id: string;
  name: string;
  ctype: string;
  mtype: string; // 数据库中实际的类型字段
  configinfo: string;
  createdtime: Date;
  updatedtime: Date;
  creator: string | null;
}

interface DeleteResult {
  success: boolean;
  error?: string;
  message?: string;
  errorType?: 'REFERENCED_BY_AGENTS' | 'GENERAL_ERROR';
}

interface ConnectPageProps {
  title: string;
  slogan: string;
  DocumentIcon: React.ComponentType;
  loading: boolean;
  categories?: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
  }>;
  connectConfigs?: ConnectConfig[];
  onConnectSave?: (data: any) => Promise<boolean>;
  onFetchConnects?: () => Promise<any[]>;
  onFetchConnectDetails?: (connectId: string) => Promise<any>;
  onFetchConnectConfigs?: () => Promise<ConnectConfig[]>;
  onDeleteConnect?: (connectId: string) => Promise<DeleteResult | boolean>;
  onEditConnect?: (connect: ConnectConfig) => Promise<any> | any;
  onTest?: (config: Record<string, any>, message?: string) => Promise<any>;
  onStreamTest?: (config: Record<string, any>, message: string, onChunk: (chunk: string) => void) => Promise<any>;
}

export const ConnectPage: React.FC<ConnectPageProps> = ({
  title,
  slogan,
  DocumentIcon,
  loading,
  categories = [],
  connectConfigs = [],
  onConnectSave,
  onFetchConnects,
  onFetchConnectDetails,
  onFetchConnectConfigs,
  onDeleteConnect,
  onEditConnect,
  onTest,
  onStreamTest
}) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  // const { showSuccess } = useToast();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [editingConnect, setEditingConnect] = useState<ConnectConfig | null>(null);

  const handleCreateConnect = () => {

    setEditingConnect(null);
    setIsConnectModalOpen(true);
  };

  const handleConnectModalClose = () => {
    setIsConnectModalOpen(false);
    setEditingConnect(null);
  };

  // const handleConnectClick = (connectId: string) => {
  //   // 可以实现连接详情查看逻辑
  //   console.log('连接配置点击:', connectId);
  // };

  const handleDeleteConnect = async (connectId: string): Promise<DeleteResult | boolean> => {
    if (onDeleteConnect) {
      try {
        const result = await onDeleteConnect(connectId);
        
        // 如果删除成功，刷新列表
        if ((typeof result === 'object' && result.success) || (typeof result === 'boolean' && result)) {
          if (onFetchConnectConfigs) {
            await onFetchConnectConfigs();
          }
        }
        
        return result;
      } catch (error) {
        console.error('删除连接配置失败:', error);
        return {
          success: false,
          error: '删除操作失败',
          message: error instanceof Error ? error.message : '未知错误'
        };
      }
    }
    
    return {
      success: false,
      error: '删除功能未实现'
    };
  };

  const handleEditConnectFromList = async (connect: ConnectConfig) => {
    if (onEditConnect) {
      // 调用父组件的编辑处理函数，获取准备好的编辑数据
      const editData = await onEditConnect(connect);
      if (editData) {
        // 设置编辑数据并打开弹窗
        setEditingConnect(editData);
        setIsConnectModalOpen(true);
      }
    } else {
      // 如果没有提供编辑处理函数，使用默认行为
      setEditingConnect(connect);
      setIsConnectModalOpen(true);
    }
  };

  const handleDebugConnect = (connect: ConnectConfig) => {
    console.log('调试连接配置:', connect);
    // 这里可以实现调试功能，比如测试连接、查看配置详情等
    addToast({
      type: 'info',
      title: '调试连接配置',
      message: `正在调试连接配置: ${connect.name}\n类型: ${connect.ctype}\nID: ${connect.id}`
    });
  };

  const handleConnectSave = async (data: any) => {

    if (onConnectSave) {
      try {
        const success = await onConnectSave(data);

        if (success) {
          addToast({
            type: 'success',
            title: '保存成功',
            message: '连接配置保存成功！'
          });
          setIsConnectModalOpen(false);
        } else {
          addToast({
            type: 'error',
            title: '保存失败',
            message: '保存失败，请重试'
          });
        }
      } catch (error) {
        addToast({
          type: 'error',
          title: '保存失败',
          message: `保存失败: ${error instanceof Error ? error.message : '保存过程中发生错误'}`
        });
      }
    } else {
      setIsConnectModalOpen(false);
    }
  };

  return (
    <GlassContainer>
      {/* <LiquidBackground /> */}
      <GlassMain>
        <GlassHeader>
          <GlassDescription>
            <HeaderContainer>
              <TitleContainer>
                <h3>{title}</h3>
              </TitleContainer>
              <CoButton variant='liquid' onClick={handleCreateConnect}>
                <SiGitconnected />
                <span> 创建新的连接 </span>
              </CoButton>
            </HeaderContainer>
            <GlassDescInfo>
              {slogan}
            </GlassDescInfo>
          </GlassDescription>

          <GlassTabNav>
            <GlassTab $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
              全部
            </GlassTab>
            {categories.map((category) => (
              <GlassTab
                key={category.type}
                $active={activeTab === category.type}
                onClick={() => setActiveTab(category.type)}
              >
                {category.name}
              </GlassTab>
            ))}
          </GlassTabNav>
        </GlassHeader>
        {(() => {
          if (connectConfigs.length === 0) return (
            <WelcomeContainer>
              <WelcomeContent>
                <IconContainer>
                  <DocumentIcon />
                </IconContainer>
                <WelcomeTitle>
                  还没有任何连接配置
                  <p>点击上方的"创建连接"按钮开始配置你的第一个连接</p>
                </WelcomeTitle>
                <CoButton onClick={handleCreateConnect}>
                  快速开始创建连接
                </CoButton>
                <PlaceholderContainer />
              </WelcomeContent>
            </WelcomeContainer>
          );
          else return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, marginTop: '4px' }}>
              <ConnectList
                connects={connectConfigs}
                activeTab={activeTab}
                categories={categories}
                // onConnectClick={handleConnectClick}
                onDeleteConnect={handleDeleteConnect}
                onEditConnect={handleEditConnectFromList}
                onDebugConnect={handleDebugConnect}
              />
            </div>
          );
        })()}
      </GlassMain>

      {/* 连接配置弹窗 */}
      <ConnectConfigModal
        isOpen={isConnectModalOpen}
        onClose={handleConnectModalClose}
        onSave={handleConnectSave}
        onTest={onTest}
        onStreamTest={onStreamTest}
        onFetchConnects={onFetchConnects}
        onFetchConnectDetails={onFetchConnectDetails}
        categories={categories}
        editMode={!!editingConnect}
        editData={editingConnect}
      />
    </GlassContainer>
  )
};