// 工作流渲染问题的临时修复组件
// 这个组件可以帮助调试和修复工作流渲染问题

import React, { useEffect, useState } from 'react';

interface WorkflowDebugProps {
  workflowId: string;
}

export const WorkflowDebugFix: React.FC<WorkflowDebugProps> = ({ workflowId }) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const debugWorkflow = async () => {
      try {
        console.log('🔍 [Debug] 开始调试工作流:', workflowId);
        
        // 1. 检查 API 请求
        const response = await fetch(`/api/workflow-config/${workflowId}`);
        const result = await response.json();
        
        console.log('📥 [Debug] API 响应:', result);
        
        if (!result.success) {
          throw new Error(result.error || 'API 请求失败');
        }
        
        const workflowData = result.data;
        
        // 2. 解析 nodesInfo
        let nodesInfoArray = [];
        try {
          if (workflowData.nodesInfo) {
            if (typeof workflowData.nodesInfo === 'string') {
              nodesInfoArray = JSON.parse(workflowData.nodesInfo);
            } else if (Array.isArray(workflowData.nodesInfo)) {
              nodesInfoArray = workflowData.nodesInfo;
            }
          }
        } catch (parseError) {
          console.error('❌ [Debug] 解析 nodesInfo 失败:', parseError);
          throw new Error(`解析 nodesInfo 失败: ${parseError}`);
        }
        
        // 3. 解析 relation
        let relationArray = [];
        try {
          if (workflowData.relation) {
            if (typeof workflowData.relation === 'string') {
              relationArray = JSON.parse(workflowData.relation);
            } else if (Array.isArray(workflowData.relation)) {
              relationArray = workflowData.relation;
            }
          }
        } catch (parseError) {
          console.error('❌ [Debug] 解析 relation 失败:', parseError);
          throw new Error(`解析 relation 失败: ${parseError}`);
        }
        
        // 4. 检查节点数据完整性
        const nodeValidation = nodesInfoArray.map((nodeInfo: any, index: number) => {
          const validation = {
            index,
            id: nodeInfo.id,
            hasId: !!nodeInfo.id,
            hasKind: !!nodeInfo.kind,
            hasType: !!nodeInfo.type,
            hasPosition: !!nodeInfo.position,
            hasInputs: !!nodeInfo.inputs,
            kind: nodeInfo.kind,
            type: nodeInfo.type,
            position: nodeInfo.position,
            isValid: !!(nodeInfo.id && nodeInfo.kind && nodeInfo.position)
          };
          
          console.log(`🔧 [Debug] 节点 ${index} 验证:`, validation);
          return validation;
        });
        
        // 5. 检查边数据完整性
        const edgeValidation = relationArray.map((relation: any, index: number) => {
          const validation = {
            index,
            from: relation.from,
            to: relation.to,
            hasFrom: !!relation.from,
            hasTo: !!relation.to,
            isValid: !!(relation.from && relation.to)
          };
          
          console.log(`🔗 [Debug] 边 ${index} 验证:`, validation);
          return validation;
        });
        
        // 6. 检查节点 API 可用性
        const nodeApiChecks = await Promise.allSettled(
          nodesInfoArray.map(async (nodeInfo: any) => {
            try {
              const response = await fetch(`/api/nodes/${nodeInfo.kind}`);
              const isOk = response.ok;
              const data = isOk ? await response.json() : null;
              
              return {
                kind: nodeInfo.kind,
                apiAvailable: isOk,
                hasNodeDefinition: !!(data?.node),
                hasLink: !!(data?.node?.link),
                hasIcon: !!(data?.node?.icon),
                error: isOk ? null : `HTTP ${response.status}`
              };
            } catch (error) {
              return {
                kind: nodeInfo.kind,
                apiAvailable: false,
                error: error instanceof Error ? error.message : '未知错误'
              };
            }
          })
        );
        
        const apiResults = nodeApiChecks.map((result, index) => {
          const data = result.status === 'fulfilled' ? result.value : { error: result.reason };
          console.log(`🌐 [Debug] 节点 API ${index}:`, data);
          return data;
        });
        
        setDebugInfo({
          workflowData,
          nodesInfoArray,
          relationArray,
          nodeValidation,
          edgeValidation,
          apiResults,
          summary: {
            totalNodes: nodesInfoArray.length,
            validNodes: nodeValidation.filter(n => n.isValid).length,
            totalEdges: relationArray.length,
            validEdges: edgeValidation.filter(e => e.isValid).length,
            apiSuccessCount: apiResults.filter(r => r.apiAvailable).length
          }
        });
        
        console.log('✅ [Debug] 调试完成');
        
      } catch (error) {
        console.error('❌ [Debug] 调试失败:', error);
        setError(error instanceof Error ? error.message : '调试失败');
      }
    };
    
    if (workflowId) {
      debugWorkflow();
    }
  }, [workflowId]);
  
  if (error) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: '#ff4444', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        zIndex: 9999,
        maxWidth: '400px'
      }}>
        <h4>🚨 工作流调试错误</h4>
        <p>{error}</p>
      </div>
    );
  }
  
  if (!debugInfo) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: '#4444ff', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        zIndex: 9999
      }}>
        🔍 正在调试工作流...
      </div>
    );
  }
  
  const { summary } = debugInfo;
  const hasIssues = summary.validNodes < summary.totalNodes || 
                   summary.validEdges < summary.totalEdges ||
                   summary.apiSuccessCount < summary.totalNodes;
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: hasIssues ? '#ff8800' : '#00aa00', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      zIndex: 9999,
      maxWidth: '300px',
      fontSize: '12px'
    }}>
      <h4>{hasIssues ? '⚠️' : '✅'} 工作流调试结果</h4>
      <div>节点: {summary.validNodes}/{summary.totalNodes}</div>
      <div>边: {summary.validEdges}/{summary.totalEdges}</div>
      <div>API: {summary.apiSuccessCount}/{summary.totalNodes}</div>
      {hasIssues && (
        <div style={{ marginTop: '5px', fontSize: '10px' }}>
          请查看控制台获取详细信息
        </div>
      )}
    </div>
  );
};

// 使用方法：在 WorkflowEditor 组件中添加
// <WorkflowDebugFix workflowId={workflowId || ''} />