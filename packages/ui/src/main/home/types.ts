import { WorkflowConfig } from '@repo/common';

export type { WorkflowConfig };

export interface WorkflowListProps {
  workflows: WorkflowConfig[];
  onWorkflowClick: (workflowId: string) => void;
  onToggleWorkflow: (workflowId: string, currentStatus: boolean) => void;
  onDeleteWorkflow?: (workflowId: string) => Promise<boolean>;
  onCreateWorkflow: () => void;
}

export interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export interface WorkflowCardProps {
  workflow: WorkflowConfig;
  onWorkflowClick: (workflowId: string) => void;
  onToggleWorkflow: (workflowId: string, currentStatus: boolean) => void;
  onDeleteWorkflow?: (workflowId: string, triggerElement?: HTMLElement) => void;
}