import React, { useContext, createContext } from 'react';
import { ActionNodeComponent } from '@repo/ui';
import { NodeProps } from 'reactflow';
import { NodeExecutionStatus } from '@repo/common'

interface ActionContextType {
  getNodeExecutionStatus?: (nodeId: string) => NodeExecutionStatus;
}

const ActionContext = createContext<ActionContextType>({});

export const ActionProvider: React.FC<{
  children: React.ReactNode;
  getNodeExecutionStatus?: (nodeId: string) => NodeExecutionStatus;
}> = ({ children, getNodeExecutionStatus }) => {
  return (
    <ActionContext.Provider value={{ getNodeExecutionStatus }}>
      {children}
    </ActionContext.Provider>
  );
};

interface ActionNodeWrapperProps extends NodeProps { }

// ActionNode包装器组件
export const ActionNodeWrapper: React.FC<ActionNodeWrapperProps> = (props) => {
  const { getNodeExecutionStatus } = useContext(ActionContext);

  // 获取节点的执行状态
  const executionStatus = getNodeExecutionStatus?.(props.id) || NodeExecutionStatus.INITIAL;
  
  // 如果executionStatus是对象，提取status属性；否则直接使用
  const statusValue = typeof executionStatus === 'object' && (executionStatus as any).status 
    ? (executionStatus as any).status 
    : executionStatus;
  
  return (
    <ActionNodeComponent
      {...props}
      executionStatus={statusValue}
    />
  );
};