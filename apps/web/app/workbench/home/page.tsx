"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../src/hooks/useAuth';
import { useWorkflow } from '@/contexts/WorkflowContext';

import { HomePage, WorkflowConfig } from '@repo/ui/main/home';
import { FaCoffee } from "react-icons/fa";
import {
  getWorkflowConfigsByUser,
  toggleWorkflowConfigStatus,
  softDeleteWorkflowConfig
} from '@/services/workflowConfigService';
import { useToast, ToastManager } from '@repo/ui';


export default function HomePageContainer() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { createNewWorkflow } = useWorkflow();
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError, toasts, removeToast } = useToast();

  /**
   * 从后端API获取工作流列表数据
   */
  const fetchWorkflows = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const result = await getWorkflowConfigsByUser('default_user');
      if (result.success && result.data) {
        // 过滤掉没有 id 的项目，并转换为 WorkflowConfig 类型
        const validWorkflows = result.data
          .filter((workflow): workflow is WorkflowConfig =>
            workflow.id !== undefined &&
            workflow.createdTime !== undefined &&
            workflow.updatedTime !== undefined
          );
        setWorkflows(validWorkflows);
      } else {
        console.error('Failed to fetch workflows:', result.error);
        setWorkflows([]);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      setWorkflows([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  /**
   * 处理创建新工作流
   */
  const handleCreateWorkflow = () => {
    const workflowId = createNewWorkflow();
    router.push(`/workbench/flow?workflowID=${workflowId}`);
  };

  /**
   * 处理点击工作流卡片，跳转到工作流编辑页面
   * @param workflowId 工作流ID
   */
  const handleWorkflowClick = (workflowId: string) => {
    router.push(`/workbench/flow?workflowID=${workflowId}`);
  };

  /**
   * 处理切换工作流激活状态 - 使用乐观更新避免页面闪动
   * @param workflowId 工作流ID
   */
  const handleToggleWorkflow = async (workflowId: string) => {
    // 保存原始数据，以便失败时恢复
    const originalWorkflows = [...workflows];
    
    try {
      // 乐观更新：立即切换工作流状态
      setWorkflows(prev => prev.map(workflow => 
        workflow.id === workflowId 
          ? { ...workflow, isActive: !workflow.isActive }
          : workflow
      ));
      
      // 调用切换API
      const result = await toggleWorkflowConfigStatus(workflowId);
      
      if (!result.success) {
        // 切换失败，恢复原始数据
        setWorkflows(originalWorkflows);
        console.error('切换工作流状态失败:', result.error);
        showError('操作失败', '切换工作流状态失败');
      }
    } catch (error) {
      // 网络错误，恢复原始数据
      setWorkflows(originalWorkflows);
      console.error('切换工作流状态失败:', error);
      showError('网络错误', '切换工作流状态失败');
    }
  };

  /**
   * 处理删除工作流 - 使用乐观更新避免页面闪动
   * @param workflowId 工作流ID
   */
  const handleDeleteWorkflow = async (workflowId: string): Promise<boolean> => {
    // 保存原始数据，以便失败时恢复
    const originalWorkflows = [...workflows];
    
    try {
      // 乐观更新：立即从UI中移除工作流
      setWorkflows(prev => prev.filter(workflow => workflow.id !== workflowId));
      
      // 调用删除API
      const result = await softDeleteWorkflowConfig(workflowId);
      
      if (result.success) {
        // 删除成功，显示成功toast
        showSuccess('成功', '工作流删除成功');
        return true;
      } else {
        // 删除失败，恢复原始数据
        setWorkflows(originalWorkflows);
        console.error('删除工作流失败:', result.error);
        showError('删除失败', '删除工作流失败');
        return false;
      }
    } catch (error) {
      // 网络错误，恢复原始数据
      setWorkflows(originalWorkflows);
      console.error('删除工作流失败:', error);
      showError('网络错误', '删除工作流失败');
      return false;
    }
  };

  /**
   * 处理导入工作流（暂未实现）
   */
  // const handleImportWorkflow = () => {
  //   console.log('导入业务流程');
  // };
  const slogn = ` Cofly将「Coffee」的闲适与「flow」的丝滑注入自动化基因——让自动化成为您最惬意的数字咖啡师！从此，繁琐复杂、灵嗅嗅觉.`;
  return (
    <>
      <HomePage
        title='欢迎使用现代化流程编排工具'
        slogan={slogn}
        user={user || undefined}
        workflows={workflows}
        loading={loading}
        onWorkflowClick={handleWorkflowClick}
        onToggleWorkflow={handleToggleWorkflow}
        onDeleteWorkflow={handleDeleteWorkflow}
        onCreateWorkflow={handleCreateWorkflow}
        //onImportWorkflow={handleImportWorkflow}
        onLogout={logout}
        DocumentIcon={FaCoffee}
      />
      <ToastManager toasts={toasts} onRemove={removeToast} />
    </>
  );
}