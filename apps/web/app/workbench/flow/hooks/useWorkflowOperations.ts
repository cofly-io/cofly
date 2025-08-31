/**
 * 工作流操作相关的自定义hooks
 */

import { useCallback, useState } from 'react';
import { Node, Edge } from 'reactflow';
import { SaveWorkflowRequest, SaveWorkflowNode } from '../types/workflow';
import { NodeDetails } from '../types/node';
import { processEdgesForSave } from '../utils/edgeProcessing';
import { handleAsyncOperation, logger } from '../utils/errorHandling';
import { API_ENDPOINTS, WORKFLOW_ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import { AIAssistantService } from '@/services/aiAssistantService';


interface UseWorkflowOperationsProps {
  workflowId: string;
  workflowName: string;
  nodes: Node[];
  edges: Edge[];
  nodesDetailsMap: Record<string, NodeDetails>;
  currentCanvasNodes: Node[];
  currentCanvasEdges: Edge[];
  showError: (title: string, message: string) => void;
  showSuccess: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
}

export const useWorkflowOperations = ({
  workflowId,
  workflowName,
  nodes,
  edges,
  nodesDetailsMap,
  currentCanvasNodes,
  currentCanvasEdges,
  showError,
  showSuccess,
  showWarning
}: UseWorkflowOperationsProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  /**
   * 保存工作流到数据库--important
   */
  const handleSave = useCallback(async () => {
    if (isSaving) return;

    setIsSaving(true);

    const result = await handleAsyncOperation(async () => {
      if (!workflowId) {
        throw new Error(WORKFLOW_ERROR_MESSAGES.MISSING_WORKFLOW_ID);
      }

      // 使用最新的画布状态而不是context状态
      const nodesToProcess = currentCanvasNodes.length > 0 ? currentCanvasNodes : nodes;
      const edgesToProcess = currentCanvasEdges.length > 0 ? currentCanvasEdges : edges;

      // 处理节点数据
      const nodesToSave: SaveWorkflowNode[] = [];
      for (const node of nodesToProcess) {
        const nodeInstanceId = node.id;
        const nodeDetails = nodesDetailsMap[nodeInstanceId];

        if (nodeDetails) {
          // 对于StickyNote类型节点，从node.data中提取content
          let inputs = nodeDetails.savedValues || {};

          if (node.type === 'stickyNote' && node.data?.content !== undefined) {
            inputs = {
              ...inputs,
              content: node.data.content,
              color: node.data.color,
              width: node.style?.width || 300,
              height: node.style?.height || 160
            };
          }

          // 保存agentResources到inputs中
          if (nodeDetails.agentResources) {
            inputs.agentResources = nodeDetails.agentResources;
          }

          const nodeToSave: SaveWorkflowNode = {
            id: nodeInstanceId,
            kind: nodeDetails.originalNodeKind || node.data?.kind || 'unknown',
            type: node.type || 'triggerNode',
            position: node.position || { x: 0, y: 0 },
            inputs,
            link: node.data?.link || null,
            lastTestResult: nodeDetails.lastTestResult || null,
            // 保存图标和分类信息 - 使用 catalog 替代 category
            icon: node.data?.icon || null,
            catalog: node.data?.catalog || node.data?.category || null, // 优先使用 catalog，如果没有则使用 category 作为备选
            name: node.data?.name || nodeInstanceId,
            description: node.data?.description || '',
            version: node.data?.version || '1.0.0',
          };
          nodesToSave.push(nodeToSave);

        } else if (node.type === 'stickyNote') {
          // 对于没有nodeDetails的StickyNote，直接从node.data创建
          const nodeToSave: SaveWorkflowNode = {
            id: nodeInstanceId,
            kind: 'stickyNote',
            type: 'stickyNote',
            position: node.position || { x: 0, y: 0 },
            inputs: { content: node.data?.content || '', color: node.data?.color || '#8B7355' },
            link: null,
            lastTestResult: null,
            icon: null,
            catalog: null, // StickyNote 不需要 catalog
            name: nodeInstanceId,
            description: 'Sticky Note',
            version: '1.0.0',
          };
          nodesToSave.push(nodeToSave);

        } else {

        }
      }

      // 处理边数据
      const configuredNodeIds = nodesToSave.map(node => node.id);


      const edgesResult = processEdgesForSave(edgesToProcess, configuredNodeIds, nodesToProcess);

      if (!edgesResult.success) {
        throw new Error(edgesResult.error);
      }

      const edgesToSave = edgesResult.data;

      // 构建保存请求
      const saveRequest: SaveWorkflowRequest = {
        workflowId,
        workflowName,
        nodesToSave,
        edgesToSave,
        createUser: 'default_user'
      };

      logger.debug('发送保存请求', { saveRequest });

      // 发送保存请求
      const response = await fetch(API_ENDPOINTS.WORKFLOW_CONFIG, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || WORKFLOW_ERROR_MESSAGES.SAVE_FAILED);
      }

      logger.info('工作流保存成功', { workflowId, result: result.data });

      return result.data;
    }, WORKFLOW_ERROR_MESSAGES.SAVE_FAILED);

    setIsSaving(false);

    if (result.success) {
      showSuccess('成功', SUCCESS_MESSAGES.WORKFLOW_SAVED);
    } else {
      showError('出错:', result.error);
    }

    return result;
  }, [
    workflowId,
    workflowName,
    nodes,
    edges,
    nodesDetailsMap,
    currentCanvasNodes,
    currentCanvasEdges,
    isSaving,
    showError,
    showSuccess
  ]);

  /**
   * 分享工作流
   */
  const handleShare = useCallback(async () => {
    if (isSharing) return;

    setIsSharing(true);

    const result = await handleAsyncOperation(async () => {
      // TODO: 实现分享功能
      logger.info('分享工作流', { workflowId, workflowName });

      // 这里可以实现分享逻辑，比如：
      // 1. 生成分享链接
      // 2. 复制到剪贴板
      // 3. 发送邮件邀请
      // 4. 生成二维码等

      return { shareUrl: `${window.location.origin}/workflow/share/${workflowId}` };
    }, '分享工作流失败');

    setIsSharing(false);

    if (result.success) {
      showSuccess('成功', '工作流分享链接已生成');
      // 可以进一步处理分享结果，比如复制链接到剪贴板
    } else {
      showError('出错:', result.error);
    }

    return result;
  }, [workflowId, workflowName, isSharing, showError, showSuccess]);

  /**
   * 更多选项处理
   */
  const handleMoreOptions = useCallback(() => {
    logger.info('打开更多选项菜单', { workflowId });
    // TODO: 实现更多选项功能，比如：
    // 1. 工作流设置
    // 2. 权限管理
    // 3. 版本历史
    // 4. 删除工作流等
  }, [workflowId]);

  /**
   * 添加标签
   */
  const handleAddTag = useCallback(() => {
    logger.info('添加工作流标签', { workflowId });
    // TODO: 实现标签功能，比如：
    // 1. 打开标签选择器
    // 2. 创建新标签
    // 3. 管理标签分类等
  }, [workflowId]);

  /**
   * 复制工作流
   */
  const handleDuplicate = useCallback(async () => {
    const result = await handleAsyncOperation(async () => {
      // TODO: 实现复制工作流功能
      logger.info('复制工作流', { workflowId });

      // 复制逻辑：
      // 1. 获取当前工作流数据
      // 2. 生成新的工作流ID
      // 3. 重置节点ID
      // 4. 保存新工作流

      return { newWorkflowId: `${workflowId}_copy_${Date.now()}` };
    }, '复制工作流失败');

    if (result.success) {
      showSuccess('成功', '工作流已复制');
    } else {
      showError('出错:', result.error);
    }

    return result;
  }, [workflowId, showError, showSuccess]);

  /**
   * 删除工作流
   */
  const handleDelete = useCallback(async () => {
    // 确认删除
    const confirmed = window.confirm('确定要删除这个工作流吗？此操作不可撤销。');
    if (!confirmed) return;

    const result = await handleAsyncOperation(async () => {
      const response = await fetch(`${API_ENDPOINTS.WORKFLOW_CONFIG}/${workflowId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '删除工作流失败');
      }

      logger.info('工作流删除成功', { workflowId });

      return result.data;
    }, '删除工作流失败');

    if (result.success) {
      showSuccess('成功', '工作流已删除');
      // 可能需要重定向到工作流列表页面
      // window.location.href = '/workflows';
    } else {
      showError('出错:', result.error);
    }

    return result;
  }, [workflowId, showError, showSuccess]);

  /**
   * 重命名工作流
   */
  const handleRename = useCallback(async (newName: string) => {
    if (!newName.trim()) {
      showWarning('警告', '工作流名称不能为空');
      return;
    }

    const result = await handleAsyncOperation(async () => {
      const response = await fetch(`${API_ENDPOINTS.WORKFLOW_CONFIG}/${workflowId}/rename`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '重命名工作流失败');
      }

      logger.info('工作流重命名成功', { workflowId, oldName: workflowName, newName });

      return result.data;
    }, '重命名工作流失败');

    if (result.success) {
      showSuccess('成功', '工作流重命名成功');
    } else {
      showError('出错:', result.error);
    }

    return result;
  }, [workflowId, workflowName, showError, showSuccess, showWarning]);

  /**
   * AI助手点击回调
   */
  const handleAIhelpClick = useCallback(async (rules: string, content: string, fieldName: string): Promise<string> => {
    // AI助手功能实现
    if (content) {
      try {
        // 调用AI助手服务
        const result = await AIAssistantService.runAgent(
          content + ' 规则和要求： ' + rules,
          'builtin-model',
          `thread-${Date.now()}`,
          'workflow-user'
        );

        // 从结果中提取内容
        if (result && result.content) {
          if (result.isAppend) {
            return content + '\n' + result.content;
          } else {
            return result.content;
          }
        } else if (result && result.error) {
          console.log('❌ [AI助手] 返回错误:', result.error);
          showError('AI助手错误', result.error);
          return '';
        } else {
          showError('AI助手错误', '未能获取有效的响应');
          return '';
        }
      } catch (error) {
        showError('AI助手错误', error instanceof Error ? error.message : '调用AI助手服务失败');
        return '';
      }
    } else {
      // 提示用户输入要求
      showWarning('提示', '请在下方文本框输入您的要求');
      return '';
    }
  }, [showSuccess, showError, showWarning]);

  return {
    // 状态
    isSaving,
    isSharing,

    // 操作函数
    handleSave,
    handleShare,
    handleMoreOptions,
    handleAddTag,
    handleDuplicate,
    handleDelete,
    handleRename,
    handleAIhelpClick
  };
};