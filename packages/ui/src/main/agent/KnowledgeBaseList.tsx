import React, { useState, useMemo, useRef } from 'react';
import styled from 'styled-components';

// 使用液态玻璃样式
import {
  GlassListCards,
  ListCardButtons,
  ListCardIcons
} from '../../components/shared/ui-components';
import { useGlobalConfirm } from '../../components/basic/GlobalConfirmManager';
import { useToast } from '../../components/basic';
import { ToolbarControls } from '../chat/ToolbarControls';
import { GiSecretBook } from "react-icons/gi";
import type { AiRagConfig } from '@repo/common';
import { KnowledgeBaseModal } from '../../components/modals/KnowledgeBaseModal';
import { FilesManagement } from '../../components/basic/FilesManagement';

interface KnowledgeBaseListProps {
  knowledgeBases: AiRagConfig[];
  activeTab: string;
  onKnowledgeBaseClick?: (kbId: string) => void;
  onDeleteKnowledgeBase?: (kbId: string) => void;
  onEditKnowledgeBase?: (kb: AiRagConfig) => Promise<AiRagConfig | null>;
  onSaveKnowledgeBase?: (data: any, editData?: AiRagConfig) => Promise<boolean>;
  onDebugKnowledgeBase?: (kb: AiRagConfig) => void;
  // 文件上传相关
  onFileUpload?: (
    knowledgeBaseId: string,
    file: File,
    onProgress?: (progress: {
      fileId: string;
      fileName: string;
      progress: number;
      uploadSpeed?: number;
      estimatedTimeRemaining?: number;
      uploadedBytes?: number;
      totalBytes?: number;
    }) => void
  ) => Promise<{
    success: boolean;
    fileId?: string;
    error?: string;
    message?: string;
  }>;
  
  // 文档管理相关
  onLoadDocuments?: (
    knowledgeBaseId: string,
    params: {
      page: number;
      limit: number;
      status?: string;
      fileType?: string;
      search?: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    }
  ) => Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
  onDeleteDocument?: (knowledgeBaseId: string, documentId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onDeleteDocumentChunk?: (knowledgeBaseId: string, documentId: string, chunkId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onReprocessDocument?: (knowledgeBaseId: string, documentId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onDownloadDocument?: (knowledgeBaseId: string, documentId: string) => Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }>;
  
  toastHook?: any; // Toast hook实例
  // 连接相关回调
  onFetchConnects?: (mtype?: string) => Promise<any[]>;
  onFetchConnectDetails?: (connectId: string, type?: string) => Promise<any>;
}

export const KnowledgeBaseList: React.FC<KnowledgeBaseListProps> = ({
  knowledgeBases,
  activeTab,
  onKnowledgeBaseClick,
  onDeleteKnowledgeBase,
  onEditKnowledgeBase,
  onSaveKnowledgeBase,
  onDebugKnowledgeBase,
  onFileUpload,
  onLoadDocuments,
  onDeleteDocument,
  onDeleteDocumentChunk,
  onReprocessDocument,
  onDownloadDocument,
  toastHook,
  // 连接相关回调
  onFetchConnects,
  onFetchConnectDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('last-updated');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKnowledgeBase, setEditingKnowledgeBase] = useState<AiRagConfig | null>(null);

  // 过滤和排序知识库配置
  const filteredKnowledgeBases = useMemo(() => {
    let filtered = knowledgeBases;

    // 根据搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(kb =>
        kb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (kb.collectionName && kb.collectionName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 排序
    if (sortBy === 'last-updated') {
      filtered = [...filtered].sort((a, b) =>
        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
      );
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [knowledgeBases, searchTerm, sortBy]);

  const handleEditKnowledgeBase = async (kb: AiRagConfig) => {
    if (onEditKnowledgeBase) {
      // 调用父组件的编辑函数获取详细信息
      const detailData = await onEditKnowledgeBase(kb);
      if (detailData) {
        setEditingKnowledgeBase(detailData);
        setIsModalOpen(true);
      } else {
        console.error('获取知识库详情失败');
      }
    } else {
      // 如果没有onEditKnowledgeBase回调，直接使用当前数据
      setEditingKnowledgeBase(kb);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingKnowledgeBase(null);
  };

  const handleModalSave = async (data: any) => {
    if (onSaveKnowledgeBase) {
      // 传递编辑数据给保存函数，以便区分新建和更新操作
      const success = await onSaveKnowledgeBase(data, editingKnowledgeBase as AiRagConfig);
      if (success) {
        setIsModalOpen(false);
        setEditingKnowledgeBase(null);
      }
      return success;
    }
    return false;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏区 */}
      <ToolbarControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="搜索知识库..."
        sortBy={sortBy}
        onSortChange={() => setSortBy(sortBy === 'last-updated' ? 'name' : 'last-updated')}
      />

      {/* 知识库配置卡片区域 */}
      <div style={{
        flex: 1,
        padding: '0 30px',
        overflowY: 'auto',
        marginBottom: '20px'
      }}>
        {(() => {
          if (filteredKnowledgeBases.length === 0) {
            return (
              <EmptyStateText>
                暂无知识库配置
              </EmptyStateText>
            );
          } else {
            return filteredKnowledgeBases.map((kb, index) => {
              return (
                <KnowledgeBaseCard
                  key={kb.id}
                  knowledgeBase={kb}
                  onKnowledgeBaseClick={onKnowledgeBaseClick}
                  onDeleteKnowledgeBase={onDeleteKnowledgeBase}
                  onEditKnowledgeBase={handleEditKnowledgeBase}
                  onDebugKnowledgeBase={onDebugKnowledgeBase}
                  toastHook={toastHook}
                  onFileUpload={onFileUpload}
                  onLoadDocuments={onLoadDocuments}
                  onDeleteDocument={onDeleteDocument}
                  onDeleteDocumentChunk={onDeleteDocumentChunk}
                  onReprocessDocument={onReprocessDocument}
                  onDownloadDocument={onDownloadDocument}
                />
              );
            });
          }
        })()} 
      </div>
      <KnowledgeBaseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        editMode={true}
        editData={editingKnowledgeBase}
        onLoadConnections={onFetchConnects ? () => onFetchConnects('vector-db') : undefined}
        onFetchLLMConnects={onFetchConnects ? async () => {
          return await onFetchConnects('llm');
        } : undefined}
        onFetchOnlineModels={onFetchConnectDetails}
        onLoadModels={onFetchConnectDetails ? async (connectId: string) => {
          const result = await onFetchConnectDetails(connectId);
          return result.tableOptions || [];
        } : undefined}
      />      
    </div>
  );
};

// 知识库配置卡片组件
interface KnowledgeBaseCardProps {
  knowledgeBase: AiRagConfig;
  onKnowledgeBaseClick?: (kbId: string) => void;
  onDeleteKnowledgeBase?: (kbId: string) => void;
  onEditKnowledgeBase?: (kb: AiRagConfig) => void;
  onDebugKnowledgeBase?: (kb: AiRagConfig) => void;
  toastHook?: any; // Toast hook实例
  // 文件上传相关
  onFileUpload?: (
    knowledgeBaseId: string,
    file: File,
    onProgress?: (progress: {
      fileId: string;
      fileName: string;
      progress: number;
      uploadSpeed?: number;
      estimatedTimeRemaining?: number;
      uploadedBytes?: number;
      totalBytes?: number;
    }) => void
  ) => Promise<{
    success: boolean;
    fileId?: string;
    error?: string;
    message?: string;
  }>;
  
  // 文档管理相关
  onLoadDocuments?: (
    knowledgeBaseId: string,
    params: {
      page: number;
      limit: number;
      status?: string;
      fileType?: string;
      search?: string;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    }
  ) => Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }>;
  onDeleteDocument?: (knowledgeBaseId: string, documentId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onDeleteDocumentChunk?: (knowledgeBaseId: string, documentId: string, chunkId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onReprocessDocument?: (knowledgeBaseId: string, documentId: string) => Promise<{
    success: boolean;
    error?: string;
  }>;
  onDownloadDocument?: (knowledgeBaseId: string, documentId: string) => Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }>;
}

const KnowledgeBaseCard: React.FC<KnowledgeBaseCardProps> = ({
  knowledgeBase,
  onKnowledgeBaseClick,
  onDeleteKnowledgeBase,
  onEditKnowledgeBase,
  onDebugKnowledgeBase,
  toastHook,
  onFileUpload,
  onLoadDocuments,
  onDeleteDocument,
  onDeleteDocumentChunk,
  onReprocessDocument,
  onDownloadDocument,
}) => {
  const { showConfirm } = useGlobalConfirm();
  const [isFilesManagementOpen, setIsFilesManagementOpen] = useState(false);
  // 使用传递的toastHook或创建新的（向后兼容）
  const currentToastHook = toastHook || useToast();
  const { showSuccess, showError } = currentToastHook;
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🔍 [KnowledgeBaseList] 开始删除知识库:', knowledgeBase.id, knowledgeBase.name);

    const confirmed = await showConfirm({
      title: '确认删除',
      message: `确定要删除知识库 "${knowledgeBase.name}" 吗？\n\n删除后将无法恢复。`,
      confirmText: '删除',
      cancelText: '取消',
      triggerElement: deleteButtonRef.current,
      positioning: 'below-trigger'
    });

    console.log('🔍 [KnowledgeBaseList] 用户确认删除:', confirmed);

    if (confirmed) {
      try {
        const response = await fetch(`/api/ai-rag/${knowledgeBase.id}`, {
          method: 'DELETE',
        });

        // 检查HTTP状态码
        if (!response.ok) {
          // 尝试解析错误响应
          try {
            const errorResult = await response.json();
            showError('删除失败', errorResult.error || `服务器错误 (${response.status})`);
          } catch (parseError) {
            console.log('🔍 [KnowledgeBaseList] 解析错误响应失败:', parseError);
            showError('删除失败', `服务器错误 (${response.status})`);
          }
          return;
        }

        const result = await response.json();

        if (result.success) {
          try {
            showSuccess('删除成功', '知识库删除成功');
          } catch (toastError) {
            console.error('🔍 [KnowledgeBaseList] showSuccess调用失败:', toastError);
          }
          // 调用父组件的删除回调来刷新列表
          onDeleteKnowledgeBase?.(knowledgeBase.id!);
        } else {
          showError('删除失败', result.error || '删除失败');
        }
      } catch (error) {
        console.error('🔍 [KnowledgeBaseList] 删除知识库异常:', error);
        showError('删除失败', '网络错误，请重试');
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditKnowledgeBase?.(knowledgeBase);
  };

  const handleDebugClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 打开文档库管理模态窗
    setIsFilesManagementOpen(true);
  };

  const handleCardClick = () => {
    onKnowledgeBaseClick?.(knowledgeBase.id!);
  };

  return (
    <>
      <GlassListCards>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '16px' }}>
            {/* 知识库图标 */}
            <ListCardIcons>
              <GiSecretBook size={22} />
            </ListCardIcons>

            {/* 知识库信息 */}
            <div style={{ flex: 1 }}>
              <KnowledgeBaseTitle>
                {knowledgeBase.name}
              </KnowledgeBaseTitle>
              <KnowledgeBaseSecondaryText>
                 嵌入模型：{knowledgeBase.embeddingModelId} | 向量库：{knowledgeBase.vectorConnectConfig?.name} | 排序模型：{knowledgeBase.rerankerModelId}
               </KnowledgeBaseSecondaryText>
              <KnowledgeBaseTertiaryText>
                {knowledgeBase.documentCount !== null && (
                  <span>文档数：{knowledgeBase.documentCount}</span>
                )}
                {knowledgeBase?.embeddingModelId && (
                  <span>模型：{knowledgeBase?.embeddingModelId}</span>
                )}
              </KnowledgeBaseTertiaryText>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <ListCardButtons onClick={handleDebugClick}>
              📚 文档库管理
            </ListCardButtons>
            <ListCardButtons onClick={handleEditClick}>
              ✏️ 编辑
            </ListCardButtons>
            <ListCardButtons
              ref={deleteButtonRef}
              onClick={handleDeleteClick}
            >
              🗑 删除
            </ListCardButtons>
          </div>
        </div>
      </GlassListCards>
      
      {/* 文档库管理模态窗 */}
      <FilesManagement
        isOpen={isFilesManagementOpen}
        onClose={() => setIsFilesManagementOpen(false)}
        title="文档库管理"
        knowledgeBaseId={knowledgeBase.id}
        onFileUpload={onFileUpload}
        onLoadDocuments={onLoadDocuments}
        onDeleteDocument={onDeleteDocument}
        onDeleteDocumentChunk={onDeleteDocumentChunk}
        onReprocessDocument={onReprocessDocument}
        onDownloadDocument={onDownloadDocument}
      />
    </>
  );
};

// Styled components for theme support
const EmptyStateText = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const KnowledgeBaseTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const KnowledgeBaseSecondaryText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 8px;
`;

const KnowledgeBaseTertiaryText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textTertiary};
  display: flex;
  gap: 12px;
`;