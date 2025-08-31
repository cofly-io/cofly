import React from 'react';
import { WorkflowCardProps } from './types';
import { formatDate } from './utils';
import { FaUserAlt } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";
// 导入UI组件样式
import {
  GlassListCards,
  GlassStatusBadge,
  ListCardButtons
} from '../../components/shared/ui-components';
import { Switch } from '../../controls';

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onWorkflowClick,
  onToggleWorkflow,
  onDeleteWorkflow,
}) => {
  return (
    <GlassListCards 
      onClick={() => onWorkflowClick(workflow.id)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ 
          fontSize: '14px', 
          fontWeight: '400', 
          margin: '0',
          color: 'inherit'
        }}>
          {workflow.name}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#C0C0C0' }}>
            <FaUserAlt size={12} />
            Personal
          </div> */}        
          <Switch 
            value={workflow.isActive} 
            size="medium"
            onChange={(checked) => {
              onToggleWorkflow(workflow.id, workflow.isActive);
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
            <GlassStatusBadge $active={workflow.isActive}>
            {workflow.isActive ? '启用' : '未启'}
          </GlassStatusBadge>
          {/* 删除按钮 */}
          <ListCardButtons
            onClick={async (e) => {
              e.stopPropagation();
              onDeleteWorkflow?.(workflow.id, e.currentTarget as HTMLElement);
            }}
          >
            🗑️ 删除
          </ListCardButtons>
        </div>
      </div>
      <div style={{ 
        color: '#C0C0C0', 
        fontSize: '13px',
        margin: '0'
      }}>
        Last updated {formatDate(workflow.updatedTime)} | Created {formatDate(workflow.createdTime)}
      </div>
    </GlassListCards>
  );
};