import React, { useState, useCallback } from 'react';
import { DocumentMetadata, DocumentStatus } from './types';
import { formatFileSize, formatFilesDate, getStatusStyle, getStatusText, getFileIcon } from './utils';
import {
  DocumentListCard,
  DocumentListHeader,
  DocumentListHeaderRow,
  DocumentListControls,
  DocumentListStats,
  ViewModeButtons,
  ViewModeButton,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  SelectText,
  TipText,
  DocumentTable,
  DocumentTableHeader,
  DocumentTableBody,
  HeaderCheckbox,
  HeaderCell,
  DocumentItem,
  DocumentCheckbox,
  DocumentIcon,
  DocumentInfo,
  DocumentName,
  DocumentMeta,
  DocumentStatus as StyledDocumentStatus,
  DocumentActions,
  DocumentActionButton,
  GridDocumentCard,
  GridDocumentHeader,
  GridDocumentCheckbox,
  GridDocumentContent,
  GridDocumentIcon,
  GridDocumentDetails,
  GridDocumentTitle,
  GridDocumentMeta,
  GridDocumentPreview,
  GridDocumentActions,
  GridActionGroup,
  GridActionButton
} from './styles';
import { IoIosSquare } from "react-icons/io";

import { BiLogoMicrosoft } from "react-icons/bi";


interface DocumentListProps {
  documents: DocumentMetadata[];
  loading: boolean;
  selectedDocuments: Set<string>;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  onDocumentSelect: (documentId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onDocumentDelete: (documentId: string) => Promise<void>;
  onDocumentReprocess?: (documentId: string) => Promise<void>;
  onDocumentDownload?: (documentId: string) => Promise<void>;
  className?: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading,
  selectedDocuments,
  isAllSelected,
  isPartiallySelected,
  onDocumentSelect,
  onSelectAll,
  onDocumentDelete,
  onDocumentReprocess,
  onDocumentDownload,
  className = ''
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // 处理全选复选框点击
  const handleSelectAllChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSelectAll(e.target.checked);
  }, [onSelectAll]);

  if (loading) {
    return (
      <DocumentListCard>
        <LoadingContainer>
          <LoadingSpinner />
          <LoadingText>加载文档列表中...</LoadingText>
        </LoadingContainer>
      </DocumentListCard>
    );
  }

  return (
    <DocumentListCard>
      {/* 列表头部 */}
      <DocumentListHeader>
        <DocumentListHeaderRow>
          <DocumentListControls>
            {/* 全选复选框 */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <HeaderCheckbox
                type="checkbox"
                checked={isAllSelected}
                ref={input => {
                  if (input) input.indeterminate = isPartiallySelected;
                }}
                onChange={handleSelectAllChange}
              />
              <SelectText>
                {isAllSelected ? '取消全选' : '全选'}
                {selectedDocuments.size > 0 && (
                  <span style={{ marginLeft: '4px'}}>
                    ({selectedDocuments.size} 个已选择)
                  </span>
                )}
              </SelectText>
            </div>

            {/* 文档统计 */}
            <DocumentListStats>
              共 {documents.length} 个文档
            </DocumentListStats>
          </DocumentListControls>

          {/* 视图切换 */}
          <ViewModeButtons>
            <ViewModeButton
              $active={viewMode === 'table'}
              onClick={() => setViewMode('table')}
              title="表格视图"
            >
              {/* <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
              </svg> */}
              <IoIosSquare />
            </ViewModeButton>
            <ViewModeButton
              $active={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
              title="网格视图"
            >
              {/* <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg> */}
              <BiLogoMicrosoft />
            </ViewModeButton>
          </ViewModeButtons>
        </DocumentListHeaderRow>
      </DocumentListHeader>

      {/* 文档列表内容 */}
      {documents.length === 0 ? (
        <TipText>
          暂无文档数据
        </TipText>
      ) : viewMode === 'table' ? (
        /* 表格视图 */
        <DocumentTable>
          <DocumentTableHeader>
            <HeaderCheckbox
              type="checkbox"
              checked={isAllSelected}
              ref={input => {
                if (input) input.indeterminate = isPartiallySelected;
              }}
              onChange={handleSelectAllChange}
            />
            <HeaderCell $width="60px"></HeaderCell>
            <HeaderCell>文档信息</HeaderCell>
            <HeaderCell $width="120px">状态</HeaderCell>
            <HeaderCell $width="80px">大小</HeaderCell>
            <HeaderCell $width="200px">上传时间</HeaderCell>
            <HeaderCell $width="165px">操作</HeaderCell>
          </DocumentTableHeader>
          <DocumentTableBody>
            {documents.map((document) => (
              <DocumentListItem
                key={document.id}
                document={document}
                selected={selectedDocuments.has(document.id)}
                onSelect={onDocumentSelect}
                onDelete={onDocumentDelete}
                onReprocess={onDocumentReprocess}
                onDownload={onDocumentDownload}
                viewMode="table"
              />
            ))}
          </DocumentTableBody>
        </DocumentTable>
      ) : (
        /* 网格视图 */
        <div style={{ padding: '24px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '16px' 
          }}>
            {documents.map((document) => (
              <DocumentListItem
                key={document.id}
                document={document}
                selected={selectedDocuments.has(document.id)}
                onSelect={onDocumentSelect}
                onDelete={onDocumentDelete}
                onReprocess={onDocumentReprocess}
                onDownload={onDocumentDownload}
                viewMode="grid"
              />
            ))}
          </div>
        </div>
      )}
    </DocumentListCard>
  );
};

// 文档列表项组件
interface DocumentListItemProps {
  document: DocumentMetadata;
  selected: boolean;
  onSelect: (documentId: string, selected: boolean) => void;
  onDelete: (documentId: string) => Promise<void>;
  onReprocess?: (documentId: string) => Promise<void>;
  onDownload?: (documentId: string) => Promise<void>;
  viewMode: 'table' | 'grid';
}

const DocumentListItem: React.FC<DocumentListItemProps> = ({
  document,
  selected,
  onSelect,
  onDelete,
  onReprocess,
  onDownload,
  viewMode
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);

  // 处理选择变化
  const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(document.id, e.target.checked);
  }, [document.id, onSelect]);

  // 处理删除
  const handleDelete = useCallback(async () => {
    if (!confirm(`确定要删除文档 "${document.fileName}" 吗？此操作不可撤销。`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(document.id);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [document.id, document.fileName, onDelete]);

  // 处理重新处理
  const handleReprocess = useCallback(async () => {
    if (!onReprocess) return;
    
    if (!confirm(`确定要重新处理文档 "${document.fileName}" 吗？`)) {
      return;
    }

    try {
      setIsReprocessing(true);
      await onReprocess(document.id);
    } catch (error) {
      console.error('Reprocess failed:', error);
    } finally {
      setIsReprocessing(false);
    }
  }, [document.id, document.fileName, onReprocess]);

  // 处理下载
  const handleDownload = useCallback(async () => {
    if (onDownload) {
      try {
        await onDownload(document.id);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  }, [document.id, onDownload]);

  // 表格视图渲染
  if (viewMode === 'table') {
    return (
      <DocumentItem 
        $selected={selected}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* 选择列 */}
        <DocumentCheckbox
          type="checkbox"
          checked={selected}
          onChange={handleSelectChange}
        />

        {/* 图标列 */}
        <HeaderCell $width="60px">
          <DocumentIcon>
            {getFileIcon(document.fileType)}
          </DocumentIcon>
        </HeaderCell>

        {/* 文档信息列 */}
        <HeaderCell>
          <DocumentInfo>
            <DocumentName>
              {document.originalName}
            </DocumentName>
            <DocumentMeta>
              <span>{document.fileType.toUpperCase()} • {document.chunkCount} 个块</span>
            </DocumentMeta>
            {document.textPreview && (
              <div style={{ 
                fontSize: '12px', 
                color: 'rgba(255, 255, 255, 0.5)', 
                marginTop: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '400px'
              }}>
                {document.textPreview}
              </div>
            )}
          </DocumentInfo>
        </HeaderCell>

        {/* 状态列 */}
        <HeaderCell $width="100px">
          <StyledDocumentStatus $status={document.status}>
            {getStatusText(document.status)}
          </StyledDocumentStatus>
        </HeaderCell>

        {/* 大小列 */}
        <HeaderCell $width="80px">
          {formatFileSize(document.fileSize)}
        </HeaderCell>

        {/* 上传时间列 */}
        <HeaderCell $width="200px">
          {formatFilesDate(document.uploadTime)}
        </HeaderCell>

        {/* 操作列 */}
        <HeaderCell $width="180px">
          <DocumentActions style={{ opacity: showActions ? 1 : 0 }}>
            {/* 下载按钮 */}
            <DocumentActionButton
              onClick={handleDownload}
              title="下载文档"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </DocumentActionButton>

            {/* 重新处理按钮 */}
            {onReprocess && (document.status === DocumentStatus.FAILED || document.status === DocumentStatus.COMPLETED) && (
              <DocumentActionButton
                onClick={handleReprocess}
                disabled={isReprocessing}
                title="重新处理"
                style={{ opacity: isReprocessing ? 0.5 : 1 }}
              >
                {isReprocessing ? (
                  <LoadingSpinner style={{ width: '16px', height: '16px', margin: 0 }} />
                ) : (
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </DocumentActionButton>
            )}

            {/* 删除按钮 */}
            <DocumentActionButton
              onClick={handleDelete}
              disabled={isDeleting}
              title="删除文档"
              style={{ opacity: isDeleting ? 0.5 : 1 }}
            >
              {isDeleting ? (
                <LoadingSpinner style={{ width: '16px', height: '16px', margin: 0 }} />
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </DocumentActionButton>
          </DocumentActions>
        </HeaderCell>
      </DocumentItem>
    );
  }

  // 网格视图渲染
  return (
    <GridDocumentCard $selected={selected}>
      {/* 头部：选择框和状态 */}
      <GridDocumentHeader>
        <GridDocumentCheckbox
          type="checkbox"
          checked={selected}
          onChange={handleSelectChange}
        />
        <StyledDocumentStatus $status={document.status}>
          {getStatusText(document.status)}
        </StyledDocumentStatus>
      </GridDocumentHeader>

      {/* 文件图标和信息 */}
      <GridDocumentContent>
        <GridDocumentIcon>
          {getFileIcon(document.fileType)}
        </GridDocumentIcon>
        <GridDocumentDetails>
          <GridDocumentTitle title={document.fileName}>
            {document.fileName}
          </GridDocumentTitle>
          <GridDocumentMeta>
            {document.fileType.toUpperCase()} • {formatFileSize(document.fileSize)}
          </GridDocumentMeta>
          <GridDocumentMeta>
            {document.chunkCount} 个块 • {formatFilesDate(document.uploadTime)}
          </GridDocumentMeta>
        </GridDocumentDetails>
      </GridDocumentContent>

      {/* 文本预览 */}
      {document.textPreview && (
        <GridDocumentPreview>
          {document.textPreview}
        </GridDocumentPreview>
      )}

      {/* 操作按钮 */}
      <GridDocumentActions>
        <GridActionGroup>
          {/* 下载按钮 */}
          <GridActionButton
            $variant="primary"
            onClick={handleDownload}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            下载
          </GridActionButton>

          {/* 重新处理按钮 */}
          {onReprocess && (document.status === DocumentStatus.FAILED || document.status === DocumentStatus.COMPLETED) && (
            <GridActionButton
              $variant="secondary"
              onClick={handleReprocess}
              disabled={isReprocessing}
            >
              {isReprocessing ? (
                <LoadingSpinner style={{ width: '12px', height: '12px', margin: 0 }} />
              ) : (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              重处理
            </GridActionButton>
          )}
        </GridActionGroup>

        {/* 删除按钮 */}
        <GridActionButton
          $variant="danger"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <LoadingSpinner style={{ width: '12px', height: '12px', margin: 0 }} />
          ) : (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </GridActionButton>
      </GridDocumentActions>
    </GridDocumentCard>
  );
};