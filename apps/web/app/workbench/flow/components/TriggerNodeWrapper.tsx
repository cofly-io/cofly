import React,{ useContext, createContext }  from 'react';
import { TriggerNodeComponent } from '@repo/ui';
import { NodeProps } from 'reactflow';
import { NodeExecutionStatus } from '@repo/common'

interface TriggerContextType {
  getNodeExecutionStatus?: (nodeId: string) => NodeExecutionStatus;
}

const TriggerContext = createContext<TriggerContextType>({});

export const TriggerProvider: React.FC<{
  children: React.ReactNode;
  getNodeExecutionStatus?: (nodeId: string) => NodeExecutionStatus;
}> = ({ children, getNodeExecutionStatus }) => {
  return (
    <TriggerContext.Provider value={{ getNodeExecutionStatus }}>
      {children}
    </TriggerContext.Provider>
  );
};

interface TriggerNodeWrapperProps extends NodeProps {}

// TriggerNode包装器组件
export const TriggerNodeWrapper: React.FC<TriggerNodeWrapperProps> = (props) => {
  const { getNodeExecutionStatus } = useContext(TriggerContext);

  // 获取节点的执行状态
  const executionStatus = getNodeExecutionStatus?.(props.id) || NodeExecutionStatus.INITIAL;
  
  // 如果executionStatus是对象，提取status属性；否则直接使用
  const statusValue = typeof executionStatus === 'object' && (executionStatus as any).status 
    ? (executionStatus as any).status 
    : executionStatus;


  return (
    <TriggerNodeComponent
      {...props}
      executionStatus={statusValue}
    />
  );
};