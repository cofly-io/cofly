import React, { useContext, createContext } from 'react';
import { AgentNodeComponent } from '@repo/ui';
import { NodeExecutionStatus } from '@repo/common'
// @ts-ignore
import { NodeProps } from 'reactflow';

// 创建 Context 来传递 MCP 标签点击回调、删除资源回调和节点执行状态
interface McpLabelContextType {
  onMcpLabelClick?: (nodeId: string) => void;
  onResourceDelete?: (nodeId: string, resourceType: string, resourceId: string) => void;
  getNodeExecutionStatus?: (nodeId: string) => NodeExecutionStatus;
}

const McpLabelContext = createContext<McpLabelContextType>({});

export const McpLabelProvider: React.FC<{
  children: React.ReactNode;
  onMcpLabelClick?: (nodeId: string) => void;
  onResourceDelete?: (nodeId: string, resourceType: string, resourceId: string) => void;
  getNodeExecutionStatus?: (nodeId: string) => NodeExecutionStatus;
}> = ({ children, onMcpLabelClick, onResourceDelete, getNodeExecutionStatus }) => {
  return (
    <McpLabelContext.Provider value={{ onMcpLabelClick, onResourceDelete, getNodeExecutionStatus }}>
      {children}
    </McpLabelContext.Provider>
  );
};

interface AgentNodeWrapperProps extends NodeProps {}

/**
 * Agent节点的业务层包装组件
 * 负责处理业务逻辑和状态管理，将数据传递给UI组件
 */
export const AgentNodeWrapper: React.FC<AgentNodeWrapperProps> = (props) => {
  const { onMcpLabelClick, onResourceDelete, getNodeExecutionStatus } = useContext(McpLabelContext);
  
  const handleMcpLabelClick = () => {
    onMcpLabelClick?.(props.id);
  };

  const handleResourceDelete = (resourceType: string, resourceId: string) => {
    onResourceDelete?.(props.id, resourceType, resourceId);
  };

  // 获取节点的执行状态
  const executionStatus = getNodeExecutionStatus?.(props.id) || NodeExecutionStatus.INITIAL;
  
  // 如果executionStatus是对象，提取status属性；否则直接使用
  const statusValue = typeof executionStatus === 'object' && (executionStatus as any).status 
    ? (executionStatus as any).status 
    : executionStatus;
  
  return (
    <AgentNodeComponent
      {...props}
      onMcpLabelClick={handleMcpLabelClick}
      onResourceDelete={handleResourceDelete}
      executionStatus={statusValue}
    />
  );
};