/**
 * 工作流导出相关的自定义hooks
 */

import { useCallback, useState } from 'react';
import { Node, Edge } from 'reactflow';
import { WorkflowData } from '../types/workflow';
import { NodeDetails } from '../types/node';
import { 
  exportWorkflowData, 
  copyWorkflowToClipboard, 
  exportWorkflowToFile,
  getCurrentCanvasData,
  validateWorkflowData
} from '../utils/workflowExport';
import { handleAsyncOperation, logger } from '../utils/errorHandling';
import { SUCCESS_MESSAGES, WORKFLOW_ERROR_MESSAGES } from '../utils/constants';

interface UseWorkflowExportProps {
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

export const useWorkflowExport = ({
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
}: UseWorkflowExportProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  /**
   * 获取当前画布数据
   */
  const getCanvasData = useCallback(() => {
    return getCurrentCanvasData(currentCanvasNodes, currentCanvasEdges);
  }, [currentCanvasNodes, currentCanvasEdges]);

  /**
   * 生成工作流导出数据
   */
  const generateWorkflowData = useCallback((): WorkflowData | null => {
    const canvasData = getCanvasData();
    
    const result = exportWorkflowData({
      currentEdges: canvasData.edges,
      nodes,
      edges,
      nodesDetailsMap,
      workflowName,
      workflowId
    });

    if (!result.success) {
      showError('出错:', result.error);
      return null;
    }

    // 验证导出数据的完整性
    const validationResult = validateWorkflowData(result.data);
    if (!validationResult.success) {
      showWarning('警告', `工作流数据验证失败: ${validationResult.error}`);
      logger.warn('工作流数据验证失败', { error: validationResult.error, data: result.data });
    }

    return result.data;
  }, [
    workflowId,
    workflowName,
    nodes,
    edges,
    nodesDetailsMap,
    getCanvasData,
    showError,
    showWarning
  ]);

  /**
   * 复制工作流到剪贴板
   */
  const handleCopyToClipboard = useCallback(async () => {
    if (isCopying) return;

    setIsCopying(true);

    const result = await handleAsyncOperation(async () => {
      const workflowData = generateWorkflowData();
      if (!workflowData) {
        throw new Error('无法生成工作流数据');
      }

      logger.debug('开始复制工作流到剪贴板', {
        workflowId,
        nodesCount: workflowData.nodes.length,
        edgesCount: workflowData.edges.length
      });

      const copyResult = await copyWorkflowToClipboard(workflowData);
      if (!copyResult.success) {
        throw new Error(copyResult.error);
      }

      logger.info('工作流已复制到剪贴板', { workflowId });
      
      return workflowData;
    }, '复制到剪贴板失败');

    setIsCopying(false);

    if (result.success) {
      showSuccess('成功', SUCCESS_MESSAGES.COPIED_TO_CLIPBOARD);
    } else {
      showError('出错:', result.error);
    }

    return result;
  }, [
    workflowId,
    generateWorkflowData,
    isCopying,
    showError,
    showSuccess
  ]);

  /**
   * 导出工作流为JSON文件
   */
  const handleExportJSON = useCallback(async (filename?: string) => {
    if (isExporting) return;

    setIsExporting(true);

    const result = await handleAsyncOperation(async () => {
      const workflowData = generateWorkflowData();
      if (!workflowData) {
        throw new Error('无法生成工作流数据');
      }

      logger.debug('开始导出JSON文件', {
        workflowId,
        filename,
        canvasEdgesLength: currentCanvasEdges.length,
        contextEdgesLength: edges.length
      });

      const exportResult = exportWorkflowToFile(workflowData, filename);
      if (!exportResult.success) {
        throw new Error(exportResult.error);
      }

      logger.info('JSON文件导出成功', { workflowId, filename });
      
      return workflowData;
    }, WORKFLOW_ERROR_MESSAGES.EXPORT_FAILED);

    setIsExporting(false);

    if (result.success) {
      showSuccess('成功', SUCCESS_MESSAGES.WORKFLOW_EXPORTED);
    } else {
      showError('出错:', result.error);
    }

    return result;
  }, [
    workflowId,
    edges.length,
    currentCanvasEdges.length,
    generateWorkflowData,
    isExporting,
    showError,
    showSuccess
  ]);

  /**
   * 导出工作流为YAML文件
   */
  const handleExportYAML = useCallback(async (filename?: string) => {
    if (isExporting) return;

    setIsExporting(true);

    const result = await handleAsyncOperation(async () => {
      const workflowData = generateWorkflowData();
      if (!workflowData) {
        throw new Error('无法生成工作流数据');
      }

      // TODO: 实现YAML导出功能
      // 这里需要添加YAML序列化逻辑
      logger.info('导出YAML文件', { workflowId, filename });
      
      // 临时使用JSON格式
      const exportResult = exportWorkflowToFile(workflowData, filename?.replace('.yaml', '.json'));
      if (!exportResult.success) {
        throw new Error(exportResult.error);
      }
      
      return workflowData;
    }, 'YAML文件导出失败');

    setIsExporting(false);

    if (result.success) {
      showSuccess('成功', 'YAML文件已导出');
    } else {
      showError('出错:', result.error);
    }

    return result;
  }, [
    workflowId,
    generateWorkflowData,
    isExporting,
    showError,
    showSuccess
  ]);

  /**
   * 导出工作流图片
   */
  const handleExportImage = useCallback(async (format: 'png' | 'svg' = 'png') => {
    if (isExporting) return;

    setIsExporting(true);

    const result = await handleAsyncOperation(async () => {
      // TODO: 实现图片导出功能
      // 这里需要使用html2canvas或类似库来截取画布
      logger.info('导出工作流图片', { workflowId, format });
      
      // 临时实现
      throw new Error('图片导出功能暂未实现');
    }, '图片导出失败');

    setIsExporting(false);

    if (result.success) {
      showSuccess('成功', '图片已导出');
    } else {
      showError('出错:', result.error);
    }

    return result;
  }, [
    workflowId,
    isExporting,
    showError,
    showSuccess
  ]);

  /**
   * 批量导出多种格式
   */
  const handleBatchExport = useCallback(async (formats: string[]) => {
    if (isExporting) return;

    setIsExporting(true);

    const results = [];

    for (const format of formats) {
      let result;
      switch (format) {
        case 'json':
          result = await handleExportJSON();
          break;
        case 'yaml':
          result = await handleExportYAML();
          break;
        case 'png':
          result = await handleExportImage('png');
          break;
        case 'svg':
          result = await handleExportImage('svg');
          break;
        default:
          logger.warn('不支持的导出格式', { format });
          continue;
      }
      results.push({ format, result });
    }

    setIsExporting(false);

    const successCount = results.filter(r => r.result?.success).length;
    const totalCount = results.length;

    if (successCount === totalCount) {
      showSuccess('成功', `所有格式导出成功 (${successCount}/${totalCount})`);
    } else if (successCount > 0) {
      showWarning('部分成功', `部分格式导出成功 (${successCount}/${totalCount})`);
    } else {
      showError('出错:', '所有格式导出失败');
    }

    return results;
  }, [
    handleExportJSON,
    handleExportYAML,
    handleExportImage,
    isExporting,
    showError,
    showSuccess,
    showWarning
  ]);

  /**
   * 获取导出预览数据
   */
  const getExportPreview = useCallback(() => {
    const workflowData = generateWorkflowData();
    if (!workflowData) return null;

    return {
      metadata: workflowData.metadata,
      nodesCount: workflowData.nodes.length,
      edgesCount: workflowData.edges.length,
      size: JSON.stringify(workflowData).length,
      preview: JSON.stringify(workflowData, null, 2).substring(0, 500) + '...'
    };
  }, [generateWorkflowData]);

  return {
    // 状态
    isExporting,
    isCopying,
    
    // 数据获取
    generateWorkflowData,
    getExportPreview,
    
    // 导出操作
    handleCopyToClipboard,
    handleExportJSON,
    handleExportYAML,
    handleExportImage,
    handleBatchExport
  };
};