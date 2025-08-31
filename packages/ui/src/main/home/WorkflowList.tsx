import React, { useState, useMemo } from 'react';
import { WorkflowListProps } from './types';
import { filterAndSortWorkflows, paginateItems } from './utils';
import { SearchAndFilter } from '../../components/basic/SearchAndFilter';
import { WorkflowCard } from './WorkflowCard';
import { Pagination } from './Pagination';
import { ToolbarControls } from '../chat/ToolbarControls';
import { useGlobalConfirm } from '../../components/basic/GlobalConfirmManager';

export const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  onWorkflowClick,
  onToggleWorkflow,
  onDeleteWorkflow,
  onCreateWorkflow,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('last-updated');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const { showConfirm } = useGlobalConfirm();

  // 处理删除工作流
  const handleDeleteWorkflow = async (workflowId: string, triggerElement?: HTMLElement) => {
    const confirmed = await showConfirm({
      title: '删除工作流',
      message: '确定要删除这个工作流吗？删除后将无法恢复。',
      confirmText: '删除',
      cancelText: '取消',
      triggerElement: triggerElement,
      positioning: 'below-trigger'
    });

    if (confirmed) {
      // 等待确认对话框关闭动画完成（350ms）后再执行删除操作
      setTimeout(async () => {
        try {
          // 调用父组件的删除函数，toast将在父组件中显示
          await onDeleteWorkflow?.(workflowId);
        } catch (error) {
          console.error('删除工作流失败:', error);
        }
      }, 400); // 比确认对话框关闭动画稍长一点，确保完全关闭
    }
  };

  // 过滤和排序工作流
  const filteredWorkflows = useMemo(() => 
    filterAndSortWorkflows(workflows, searchTerm, sortBy),
    [workflows, searchTerm, sortBy]
  );

  // 分页处理
  const paginationData = useMemo(() => 
    paginateItems(filteredWorkflows, currentPage, pageSize),
    [filteredWorkflows, currentPage, pageSize]
  );

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏区域 */}
      <ToolbarControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search"
        sortBy={sortBy}
        onSortChange={() => setSortBy(sortBy === 'last-updated' ? 'name' : 'last-updated')}
      />

      {/* 工作流卡片区域 */}
      <div style={{ 
        flex: 1, 
        padding: '0 30px', 
        overflowY: 'auto',
        marginBottom: '20px'
      }}>
        {paginationData.paginatedItems.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onWorkflowClick={onWorkflowClick}
            onToggleWorkflow={onToggleWorkflow}
            onDeleteWorkflow={handleDeleteWorkflow}
          />
        ))}
      </div>

      {/* 分页区域 */}
      <Pagination
        currentPage={currentPage}
        totalPages={paginationData.totalPages}
        totalItems={filteredWorkflows.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />


    </div>
  );
};