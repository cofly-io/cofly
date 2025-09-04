import React, { useState, useEffect, useCallback } from 'react';
import styled, { useTheme } from 'styled-components';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FilesManagementProps, DocumentMetadata, FilesPaginationInfo, FilesDocumentsResponse, FilesApiResponse } from './types';
import { APP_CONFIG } from './constants';
import { FilesFileUpload } from './FileUpload';
import { DocumentList } from './DocumentList';
import { DocumentFilters } from './DocumentFilters';
import { BatchOperations } from './BatchOperations';
import { FilesPagination } from './Pagination';

// Theme interface
interface Theme {
  mode: 'dark' | 'light';
}

// Styled Components with theme support
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
`;

const Modal = styled.div<{ theme: Theme }>`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  };
  border: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'
  };
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.mode === 'dark' ? '#ffffff' : '#1f2937'};
`;

const Header = styled.div<{ theme: Theme }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  //padding: 1.5rem;
  padding:12px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'
  };
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.02)'
    : 'rgba(0, 0, 0, 0.02)'
  };
`;

const Title = styled.h2<{ theme: Theme }>`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#ffffff' : '#1f2937'};
  margin: 0;
`;

const CloseButton = styled.button<{ theme: Theme }>`
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)'
  };
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s ease-in-out;
  padding: 4px 8px;
  border-radius: 4px;

  &:hover {
    color: ${({ theme }) => theme.mode === 'dark' ? '#ffffff' : '#000000'};
    background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'
  };
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const UploadSection = styled.div<{ theme: Theme; $isCollapsed?: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.1)'
  };
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.02)'
    : 'rgba(0, 0, 0, 0.02)'
  };
  transition: all 0.3s ease;
`;

const UploadHeader = styled.div<{ theme: Theme }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  // padding: 1rem 1.5rem;
  padding: 2px 20px 0px 20px;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.05)'
    };
  }
`;

const UploadContent = styled.div<{ $isCollapsed: boolean }>`
  padding: ${({ $isCollapsed }) => $isCollapsed ? '0 1.5rem' : '0 1.5rem 1.5rem 1.5rem'};
  max-height: ${({ $isCollapsed }) => $isCollapsed ? '0' : '500px'};
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${({ $isCollapsed }) => $isCollapsed ? '0' : '1'};
`;

const CollapseButton = styled.div<{ theme: Theme }>`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)'
  };
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.mode === 'dark' ? '#ffffff' : '#000000'};
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const SectionTitle = styled.h3<{ theme: Theme }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.mode === 'dark' ? '#ffffff' : '#1f2937'};
  margin: 0 0 1rem 0;
`;

const ManageSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const FiltersContainer = styled.div<{ theme: Theme }>`
  //padding: 1.5rem;
  padding: 6px 0px;
  padding-bottom: 0;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(0, 0, 0, 0.05)'
  };
  border-radius: 0.5rem;
  // margin: 1rem;
`;

const BatchOperationsContainer = styled.div`
  padding: 0 1.5rem;
  padding-top: 1rem;
`;

const ErrorContainer = styled.div<{ theme: Theme }>`
  margin: 0 1.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
`;

const ErrorContent = styled.div`
  display: flex;
  align-items: center;

  svg {
    width: 1.25rem;
    height: 1.25rem;
    color: #f87171;
    margin-right: 0.5rem;
  }

  span {
    color: #fca5a5;
  }
`;

const DocumentListContainer = styled.div`
  flex: 1;
  padding: 0 1.5rem;
  padding-top: 1rem;
  overflow: hidden;
`;

const PaginationContainer = styled.div`
  padding: 0 1.5rem;
  padding-bottom: 1.5rem;
`;

const EmptyStateContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const EmptyStateContent = styled.div<{ theme: Theme }>`
  text-align: center;

  svg {
    width: 4rem;
    height: 4rem;
    color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.3)'
    : 'rgba(0, 0, 0, 0.3)'
  };
    margin: 0 auto 1rem;
  }

  h3 {
    font-size: 1.125rem;
    font-weight: 500;
    color: ${({ theme }) => theme.mode === 'dark' ? '#ffffff' : '#1f2937'};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.7)'
    : 'rgba(0, 0, 0, 0.7)'
  };
  }
`;

export const FilesManagement: React.FC<FilesManagementProps> = ({
  isOpen,
  onClose,
  title = '文档库管理',
  acceptedTypes = APP_CONFIG.SUPPORTED_FILE_TYPES,
  maxFileSize = APP_CONFIG.MAX_FILE_SIZE,
  onFileSelect,
  knowledgeBaseId,
  onFileUpload,
  onLoadDocuments,
  onDeleteDocument,
  onDeleteDocumentChunk,
  onReprocessDocument,
  onDownloadDocument
}) => {
  const theme = useTheme() as Theme;
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [isUploadCollapsed, setIsUploadCollapsed] = useState(false);

  // 分页状态
  const [pagination, setPagination] = useState<FilesPaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // 过滤器状态
  const [filters, setFilters] = useState({
    status: '',
    fileType: '',
    search: '',
    sortBy: 'uploadTime',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // 加载文档列表
  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 如果没有知识库ID，显示错误
      if (!knowledgeBaseId) {
        setError('缺少知识库ID，无法加载文档列表');
        setDocuments([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }));
        return;
      }

      // 如果没有加载文档的服务函数，显示错误
      if (!onLoadDocuments) {
        setError('文档加载功能未配置，请联系管理员');
        setDocuments([]);
        return;
      }

      // 构建查询参数
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.status && { status: filters.status }),
        ...(filters.fileType && { fileType: filters.fileType }),
        ...(filters.search && { search: filters.search })
      };

      // 调用传递的服务函数
      const result = await onLoadDocuments(knowledgeBaseId, params);

      if (!result.success) {
        throw new Error(result.error || '加载文档列表失败');
      }

      if (result.data) {
        const { documents, pagination: paginationData } = result.data;

        // 转换数据类型
        const transformedDocuments = documents.map(doc => ({
          ...doc,
          uploadTime: new Date(doc.uploadTime),
          processedTime: doc.processedTime ? new Date(doc.processedTime) : undefined
        }));

        setDocuments(transformedDocuments);
        setPagination(paginationData);
      } else {
        setDocuments([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        }));
      }

    } catch (err) {
      console.error('Load documents error:', err);
      setError(err instanceof Error ? err.message : '加载文档列表失败');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [knowledgeBaseId, pagination.page, pagination.limit, filters, onLoadDocuments]);

  // 初始加载和过滤器变化时重新加载
  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen, loadDocuments]);

  // 处理过滤器变化
  const handleFiltersChange = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // 重置到第一页
    setSelectedDocuments(new Set()); // 清空选择
  }, []);

  // 处理分页变化
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    setSelectedDocuments(new Set()); // 清空选择
  }, []);

  // 处理每页数量变化
  const handleLimitChange = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
    setSelectedDocuments(new Set()); // 清空选择
  }, []);

  // 处理文档选择
  const handleDocumentSelect = useCallback((documentId: string, selected: boolean) => {
    setSelectedDocuments(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(documentId);
      } else {
        newSet.delete(documentId);
      }
      return newSet;
    });
  }, []);

  // 处理全选/取消全选
  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedDocuments(new Set(documents.map(doc => doc.id)));
    } else {
      setSelectedDocuments(new Set());
    }
  }, [documents]);

  // 处理批量操作完成
  const handleBatchOperationComplete = useCallback(() => {
    setSelectedDocuments(new Set());
    loadDocuments(); // 重新加载文档列表
  }, [loadDocuments]);

  // 处理单个文档删除
  const handleDocumentDelete = useCallback(async (documentId: string) => {
    console.log('🔧 [FilesManagement] ========== 接收到删除请求 ==========');
    console.log('🔧 [FilesManagement] 删除参数:', { knowledgeBaseId, documentId });
    console.log('🔧 [FilesManagement] onDeleteDocument 函数可用性:', typeof onDeleteDocument === 'function' ? '可用' : '不可用');
    
    try {
      if (!knowledgeBaseId) {
        const errorMsg = '缺少知识库ID，无法删除文档';
        console.error('🔧 [FilesManagement] 验证失败:', errorMsg);
        setError(errorMsg);
        return;
      }

      if (!onDeleteDocument) {
        const errorMsg = '删除功能未配置，请联系管理员';
        console.error('🔧 [FilesManagement] 配置检查失败:', errorMsg);
        setError(errorMsg);
        return;
      }

      console.log('🔧 [FilesManagement] 所有验证通过，开始调用删除服务函数...');
      console.log('🔧 [FilesManagement] 调用 onDeleteDocument(' + knowledgeBaseId + ', ' + documentId + ')');
      
      const startTime = Date.now();
      const result = await onDeleteDocument(knowledgeBaseId, documentId);
      const endTime = Date.now();
      
      console.log('🔧 [FilesManagement] 删除服务函数调用完成');
      console.log('🔧 [FilesManagement] 耗时:', endTime - startTime + 'ms');
      console.log('🔧 [FilesManagement] 服务函数返回结果:', result);
      
      if (!result.success) {
        const error = new Error(result.error || '删除文档失败');
        console.error('🔧 [FilesManagement] 服务函数返回失败结果:', error.message);
        throw error;
      }

      console.log('🔧 [FilesManagement] ✅ 删除成功，开始清理UI状态...');
      
      // 从选择中移除
      setSelectedDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        console.log('🔧 [FilesManagement] 已从选择中移除文档:', documentId);
        return newSet;
      });

      // 重新加载文档列表
      console.log('🔧 [FilesManagement] 开始重新加载文档列表...');
      await loadDocuments();
      console.log('🔧 [FilesManagement] ✅ 文档删除完成，UI已更新');
      console.log('🔧 [FilesManagement] ========== 删除流程成功结束 ==========');
    } catch (err) {
      console.error('🔧 [FilesManagement] ❌ 删除过程中发生错误:', err);
      console.error('🔧 [FilesManagement] 错误详情:', {
        message: err instanceof Error ? err.message : '未知错误',
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(err instanceof Error ? err.message : '删除文档失败');
      console.log('🔧 [FilesManagement] ========== 删除流程异常结束 ==========');
    }
  }, [knowledgeBaseId, onDeleteDocument, loadDocuments]);

  // 处理文档重新处理
  const handleDocumentReprocess = useCallback(async (documentId: string) => {
    try {
      if (!knowledgeBaseId) {
        setError('缺少知识库ID，无法重新处理文档');
        return;
      }

      if (!onReprocessDocument) {
        setError('重新处理功能未配置，请联系管理员');
        return;
      }

      const result = await onReprocessDocument(knowledgeBaseId, documentId);
      if (!result.success) {
        throw new Error(result.error || '重新处理文档失败');
      }

      // 重新加载文档列表以更新状态
      await loadDocuments();
    } catch (err) {
      console.error('Reprocess document error:', err);
      setError(err instanceof Error ? err.message : '重新处理文档失败');
    }
  }, [knowledgeBaseId, onReprocessDocument, loadDocuments]);

  // 处理文档下载
  const handleDocumentDownload = useCallback(async (documentId: string) => {
    try {
      if (!knowledgeBaseId) {
        setError('缺少知识库ID，无法下载文档');
        return;
      }

      if (!onDownloadDocument) {
        setError('下载功能未配置，请联系管理员');
        return;
      }

      const result = await onDownloadDocument(knowledgeBaseId, documentId);
      if (!result.success) {
        throw new Error(result.error || '下载文档失败');
      }

      if (result.url) {
        const link = window.document.createElement('a');
        link.href = result.url;
        link.download = '';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Download document error:', err);
      setError(err instanceof Error ? err.message : '下载文档失败');
    }
  }, [knowledgeBaseId, onDownloadDocument]);

  // 处理上传成功
  const handleUploadSuccess = useCallback((fileId: string) => {
    console.log('文件上传成功:', fileId);
    // 刷新文档列表
    loadDocuments();
  }, [loadDocuments]);

  // 处理上传错误
  const handleUploadError = useCallback((error: string) => {
    setError(error);
  }, []);

  const isAllSelected = documents.length > 0 && selectedDocuments.size === documents.length;
  const isPartiallySelected = selectedDocuments.size > 0 && selectedDocuments.size < documents.length;

  if (!isOpen) {
    return null;
  }

  return (
    <Overlay>
      <Modal theme={theme}>
        {/* 头部 */}
        <Header theme={theme}>
          <Title theme={theme}>{title}</Title>
          <CloseButton theme={theme} onClick={onClose}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </CloseButton>
        </Header>

        {/* 内容区域 */}
        <ContentArea>
          {/* 文件上传区域 */}
          <UploadSection theme={theme} $isCollapsed={isUploadCollapsed}>
            <UploadHeader theme={theme} onClick={() => setIsUploadCollapsed(!isUploadCollapsed)}>
              <SectionTitle theme={theme}>文件上传</SectionTitle>
              <CollapseButton theme={theme}>
                {isUploadCollapsed ? <FiChevronDown /> : <FiChevronUp />}
              </CollapseButton>
            </UploadHeader>
            <UploadContent $isCollapsed={isUploadCollapsed}>
              <FilesFileUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                acceptedTypes={acceptedTypes}
                maxFileSize={maxFileSize}
                multiple={true}
                knowledgeBaseId={knowledgeBaseId}
                onFileUpload={onFileUpload}
              />
            </UploadContent>
          </UploadSection>

          {/* 文档管理区域 */}
          <ManageSection>
            {/* 过滤器 */}
            <FiltersContainer theme={theme}>
              <DocumentFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
              />
            </FiltersContainer>

            {/* 批量操作 */}
            {selectedDocuments.size > 0 && (
              <BatchOperationsContainer>
                <BatchOperations
                  selectedDocuments={Array.from(selectedDocuments)}
                  onOperationComplete={handleBatchOperationComplete}
                />
              </BatchOperationsContainer>
            )}

            {/* 错误提示 */}
            {error && (
              <ErrorContainer theme={theme}>
                <ErrorContent>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </ErrorContent>
              </ErrorContainer>
            )}

            {/* 文档列表 */}
            <DocumentListContainer>
              <DocumentList
                documents={documents}
                loading={loading}
                selectedDocuments={selectedDocuments}
                isAllSelected={isAllSelected}
                isPartiallySelected={isPartiallySelected}
                onDocumentSelect={handleDocumentSelect}
                onSelectAll={handleSelectAll}
                onDocumentDelete={handleDocumentDelete}
                onDocumentReprocess={handleDocumentReprocess}
                onDocumentDownload={handleDocumentDownload}
              />
            </DocumentListContainer>

            {/* 分页 */}
            {!loading && documents.length > 0 && (
              <PaginationContainer>
                <FilesPagination
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              </PaginationContainer>
            )}

            {/* 空状态 
            {!loading && documents.length === 0 && !error && (
              <EmptyStateContainer>
                <EmptyStateContent theme={theme}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3>暂无文档</h3>
                  <p>
                    {filters.search || filters.status || filters.fileType
                      ? '没有找到符合条件的文档，请尝试调整筛选条件'
                      : '还没有上传任何文档，请先上传文档'
                    }
                  </p>
                </EmptyStateContent>
              </EmptyStateContainer>              
            )}*/}
          </ManageSection>
        </ContentArea>
      </Modal>
    </Overlay>
  );
};