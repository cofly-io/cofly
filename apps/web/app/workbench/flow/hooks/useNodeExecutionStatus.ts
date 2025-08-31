/**
 * 节点执行状态管理 Hook
 * 
 * 功能：
 * 1. 监听工作流日志数据中的 :start 节点状态
 * 2. 管理节点的执行状态（RUNNING, COMPLETED, FAILED）
 * 3. 提供节点状态更新的回调
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {NodeExecutionStatus} from '@repo/common';

// 节点状态信息接口
export interface NodeStatusInfo {
    status: NodeExecutionStatus;
    timestamp: number;
    hasStartNode: boolean; // 是否有对应的 :start 节点
}

// 工作流日志数据接口（简化版）
interface WorkflowSpan {
    name: string;
    status: string;
    spanID: string;
    childrenSpans?: WorkflowSpan[];
}

interface UseNodeExecutionStatusProps {
    workflowLogData?: WorkflowSpan | null;
    isTestingWorkflow?: boolean;
}

export const useNodeExecutionStatus = ({
    workflowLogData,
    isTestingWorkflow = false
}: UseNodeExecutionStatusProps) => {
    
    // 存储所有节点的执行状态
    const [nodeStatusMap, setNodeStatusMap] = useState<Record<string, NodeStatusInfo>>({});

    /**
     * 从工作流日志中提取节点状态信息
     */
    const extractNodeStatuses = useCallback((spans: WorkflowSpan[]): Record<string, NodeStatusInfo> => {
        const statusMap: Record<string, NodeStatusInfo> = {};
        
        // 递归遍历所有 spans
        const traverseSpans = (spans: WorkflowSpan[]) => {
            spans.forEach(span => {
                // 跳过系统级别的 span
                if (span.name) {
                    // 直接处理节点状态
                    let status: NodeExecutionStatus;
                    switch (span.status.toUpperCase()) {
                        case 'RUNNING':
                            status = NodeExecutionStatus.RUNNING;
                            break;
                        case 'COMPLETED':
                        case 'SUCCESS':
                            status = NodeExecutionStatus.COMPLETED;
                            break;
                        case 'FAILED':
                        case 'ERROR':
                            status = NodeExecutionStatus.FAILED;
                            break;
                        default:
                            status = NodeExecutionStatus.INITIAL;
                    }

                    statusMap[span.name] = {
                        status,
                        timestamp: Date.now(),
                        hasStartNode: false // 新格式不再有 :start 节点
                    };
                }

                // 递归处理子 spans
                if (span.childrenSpans && span.childrenSpans.length > 0) {
                    traverseSpans(span.childrenSpans);
                }
            });
        };

        traverseSpans(spans);
        return statusMap;
    }, []);

    /**
     * 更新节点状态
     */
    useEffect(() => {
        // 如果没有日志数据
        if (!workflowLogData?.childrenSpans) {
            // 只有在测试状态下才清空状态，非测试状态保持现有状态
            if (isTestingWorkflow) {
                setNodeStatusMap({});
            }
            return;
        }

        // 有日志数据时，无论是否在测试状态都更新状态
        const newStatusMap = extractNodeStatuses(workflowLogData.childrenSpans);

        // 只有状态真正发生变化时才更新
        setNodeStatusMap(prevMap => {
            const hasChanged = Object.keys(newStatusMap).some(nodeName => {
                const newStatus = newStatusMap[nodeName];
                const prevStatus = prevMap[nodeName];

                // 添加类型检查
                if (!newStatus) return false;

                return !prevStatus ||
                    prevStatus.status !== newStatus.status ||
                    prevStatus.hasStartNode !== newStatus.hasStartNode;
            });

            if (hasChanged) {
                return newStatusMap;
            }

            return prevMap;
        });
    }, [workflowLogData, isTestingWorkflow, extractNodeStatuses]);

    /**
     * 获取指定节点的状态
     */
    const getNodeStatus = useCallback((nodeName: string): NodeStatusInfo => {
        const status = nodeStatusMap[nodeName] || {
            status: NodeExecutionStatus.INITIAL,
            timestamp: 0,
            hasStartNode: false
        };
                
        return status;
    }, [nodeStatusMap]);

    /**
     * 检查节点是否正在运行
     */
    const isNodeRunning = useCallback((nodeName: string): boolean => {
        const status = getNodeStatus(nodeName);
        return status.status === NodeExecutionStatus.RUNNING;
    }, [getNodeStatus]);

    /**
     * 检查节点是否已完成
     */
    const isNodeCompleted = useCallback((nodeName: string): boolean => {
        const status = getNodeStatus(nodeName);
        return status.status === NodeExecutionStatus.COMPLETED;
    }, [getNodeStatus]);

    /**
     * 检查节点是否失败
     */
    const isNodeFailed = useCallback((nodeName: string): boolean => {
        const status = getNodeStatus(nodeName);
        return status.status === NodeExecutionStatus.FAILED;
    }, [getNodeStatus]);

    /**
     * 获取所有正在运行的节点
     */
    const runningNodes = useMemo(() => {
        return Object.keys(nodeStatusMap).filter(nodeName => {
            const nodeStatus = nodeStatusMap[nodeName];
            return nodeStatus && nodeStatus.status === NodeExecutionStatus.RUNNING;
        });
    }, [nodeStatusMap]);

    /**
     * 获取所有已完成的节点
     */
    const completedNodes = useMemo(() => {
        return Object.keys(nodeStatusMap).filter(nodeName => {
            const nodeStatus = nodeStatusMap[nodeName];
            return nodeStatus && nodeStatus.status === NodeExecutionStatus.COMPLETED;
        });
    }, [nodeStatusMap]);

    /**
     * 获取所有失败的节点
     */
    const failedNodes = useMemo(() => {
        return Object.keys(nodeStatusMap).filter(nodeName => {
            const nodeStatus = nodeStatusMap[nodeName];
            return nodeStatus && nodeStatus.status === NodeExecutionStatus.FAILED;
        });
    }, [nodeStatusMap]);

    return {
        // 状态数据
        nodeStatusMap,
        runningNodes,
        completedNodes,
        failedNodes,

        // 状态查询方法
        getNodeStatus,
        isNodeRunning,
        isNodeCompleted,
        isNodeFailed,

        // 统计信息
        totalNodes: Object.keys(nodeStatusMap).length,
        runningCount: runningNodes.length,
        completedCount: completedNodes.length,
        failedCount: failedNodes.length
    };
};