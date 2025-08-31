"use client";

import { useState, useEffect } from 'react';
import { fetchAllNodes, executeNode } from '../../../src/services/nodeApiService';

export default function NodesPage() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function loadNodes() {
      try {
        setLoading(true);
        const nodesData = await fetchAllNodes();
        setNodes(nodesData);
        setError(null);
      } catch (err) {
        // setError(err instanceof Error ? err.message : '加载节点失败');
        console.error('加载节点失败:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadNodes();
  }, []);
  
  const handleExecuteNode = async (nodeName: string) => {
    try {
      const result = await executeNode(nodeName, {});
      console.log('节点执行结果:', result);
      // 处理执行结果...
    } catch (err) {
      console.error('执行节点失败:', err);
      // 处理错误...
    }
  };
  
  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;
  
  return (
    <div>
      <h1>可用节点</h1>
      <ul>
        {nodes.map((node: any) => (
          <li key={node.name}>
            <h3>{node.displayName}</h3>
            <p>{node.description}</p>
            <button onClick={() => handleExecuteNode(node.name)}>
              执行节点
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}