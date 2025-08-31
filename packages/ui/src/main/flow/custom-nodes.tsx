"use client";
import React, { memo, useEffect, useMemo, useState } from 'react';
// @ts-ignore
import { Position, NodeProps } from 'reactflow';
import { IoAddCircleSharp } from "react-icons/io5";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import { VscTools } from "react-icons/vsc";
import { SlOrganization } from "react-icons/sl";
import { TbDatabaseCog } from "react-icons/tb";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useTheme } from '../../context/ThemeProvider';
import { getThemeIcon } from '@repo/ui/utils/themeIcon';
import { NodeLink } from '@repo/common';
import { NodeExecutionStatus } from '@repo/common';
import {
  NodeContainer,
  DraggableArea,
  NodeGraph,
  TriggerNodeGraph,
  AgentNodeGraph,
  AgentNodeContainer,
  NodeHeader,
  NodeIcon,
  AgentNodeIcon,
  StatusIndicator,
  SpinnerIcon,
  CompletedIcon,
  FailedIcon,
  AgentNodeTitle,
  McpLabel,
  TriggerStautsIndicator,
  ExpandButton,
  McpList,
  McpListItem,
  McpItemIcon,
  McpItemText,
  DeleteButton,
  NodeTitle,
  CustomHandle
} from './custom-nodes.styles';

//  触发器 node for actions
export const TriggerNodeComponent = memo(({ data, executionStatus = NodeExecutionStatus.INITIAL }: TriggerNodeProps) => {
  const { themeMode } = useTheme();
  // 直接使用props中的executionStatus，与AgentNodeComponent保持一致
  const actualExecutionStatus = executionStatus;
  
  // 使用 useMemo 优化连接点渲染
  const handles = useMemo(() => {
  const handles: React.ReactElement[] = [];
    // 为没有设置link的节点提供默认值
    const nodeLink = data.link || {
      outputs: [NodeLink.Data]
    };

    // 渲染输入连接点
    if (nodeLink.inputs && nodeLink.inputs.length > 0) {
      nodeLink.inputs.forEach((input: any, index: number) => {
        const handleTop = nodeLink.inputs.length === 1
          ? 50 // 单个连接点居中
          : (100 / (nodeLink.inputs.length + 1)) * (index + 1); // 多个连接点均匀分布

        // 为每个连接点生成独立的提示
        const inputTitle = input.desc && input.desc.trim() !== '' ? input.desc : '输入';

        handles.push(
          <CustomHandle
            key={`input-${index}`}
            type="target"
            position={Position.Left}
            id={`left-${index}`}
            className="left"
            title={inputTitle}
            style={{ top: `${handleTop}%`, transform: 'translateY(-50%)' }}
          />
        );
      });
    }

    // 渲染输出连接点
    if (nodeLink.outputs && nodeLink.outputs.length > 0) {
      nodeLink.outputs.forEach((output: any, index: number) => {
        const handleTop = nodeLink.outputs.length === 1
          ? 50 // 单个连接点居中
          : (100 / (nodeLink.outputs.length + 1)) * (index + 1); // 多个连接点均匀分布

        // 为每个连接点生成独立的提示
        const outputTitle = output.desc && output.desc.trim() !== '' ? output.desc : '输出';

        handles.push(
          <CustomHandle
            key={`output-${index}`}
            type="source"
            position={Position.Right}
            id={`right-${index}`}
            className="right"
            title={outputTitle}
            style={{ top: `${handleTop}%`, transform: 'translateY(-50%)' }}
          />
        );
      });
    }

    return handles;
  }, [data.link]); // 添加依赖项

  return (
    <NodeContainer>
      <DraggableArea>
        <TriggerNodeGraph $nodeType="trigger">
          {handles}
          <NodeHeader>
            <NodeIcon $bgColor="#33C2EE">
            {actualExecutionStatus === NodeExecutionStatus.RUNNING ? (
              // 运行状态：显示旋转的 spinner
              <SpinnerIcon />
            ) : (
              // 其他状态：显示正常图标
              <img src={getThemeIcon(data.icon, themeMode, data.kind, data.catalog) || '/nodes/default/default.svg'} alt={data.title} />
            )}
          </NodeIcon>
          </NodeHeader>
        </TriggerNodeGraph>
        {/* 状态指示器 */}
       <TriggerStautsIndicator>
          {actualExecutionStatus === NodeExecutionStatus.COMPLETED && (
            <CompletedIcon />
          )}
          {actualExecutionStatus === NodeExecutionStatus.FAILED && (
            <FailedIcon />
          )}
        </TriggerStautsIndicator>
      </DraggableArea>
      <NodeTitle>{data.name}</NodeTitle>
    </NodeContainer>
  );
});

TriggerNodeComponent.displayName = 'TriggerNodeComponent';

interface ActionNodeProps extends NodeProps {
  executionStatus?: NodeExecutionStatus;
}

// Custom node for actions
export const ActionNodeComponent = memo(({ data, executionStatus = NodeExecutionStatus.INITIAL }: ActionNodeProps) => {
  const { themeMode } = useTheme();
  
  // 获取实际的执行状态
  const actualExecutionStatus = executionStatus;

  // 使用 useMemo 优化连接点渲染
  const handles = useMemo(() => {
    const handles: React.ReactElement[] = [];

    // 为没有设置link的节点提供默认值
    const nodeLink = data.link || {
      inputs: [NodeLink.Data],
      outputs: [NodeLink.Data]
    };

    // 渲染输入连接点
    if (nodeLink.inputs && nodeLink.inputs.length > 0) {
      nodeLink.inputs.forEach((input: any, index: number) => {
        const handleTop = nodeLink.inputs.length === 1
          ? 50 // 单个连接点居中
          : (100 / (nodeLink.inputs.length + 1)) * (index + 1); // 多个连接点均匀分布

        // 为每个连接点生成独立的提示
        const inputTitle = input.desc && input.desc.trim() !== '' ? input.desc : '';//输入

        handles.push(
          <CustomHandle
            key={`input-${index}`}
            type="target"
            position={Position.Left}
            id={`left-${index}`}
            className="left"
            title={inputTitle}
            style={{ top: `${handleTop}%`, transform: 'translateY(-50%)' }}
          />
        );
      });
    }

    // 渲染输出连接点
    if (nodeLink.outputs && nodeLink.outputs.length > 0) {
      nodeLink.outputs.forEach((output: any, index: number) => {
        const handleTop = nodeLink.outputs.length === 1
          ? 50 // 单个连接点居中
          : (100 / (nodeLink.outputs.length + 1)) * (index + 1); // 多个连接点均匀分布
        // 为每个连接点生成独立的提示
        const outputTitle = output.desc && output.desc.trim() !== '' ? output.desc : '';//输出

        handles.push(
          <CustomHandle
            key={`output-${index}`}
            type="source"
            position={Position.Right}
            id={`right-${index}`}
            className="right"
            title={outputTitle}
            style={{ top: `${handleTop}%`, transform: 'translateY(-50%)' }}
          />
        );
      });
    }
    return handles;
  }, [data.link]); // 添加依赖项

  return (
    <NodeContainer>
      <DraggableArea>
        <NodeGraph $nodeType="action">
          {handles}
          <NodeHeader>
          <NodeIcon $bgColor="#33C2EE">
            {actualExecutionStatus === NodeExecutionStatus.RUNNING ? (
              // 运行状态：显示旋转的 spinner
              <SpinnerIcon />
            ) : (
              // 其他状态：显示正常图标
              <img src={getThemeIcon(data.icon, themeMode, data.kind, data.catalog) || '/nodes/default/default.svg'} alt={data.title} />
            )}
          </NodeIcon>
        </NodeHeader>
        {/* 状态指示器 */}
        <StatusIndicator>
          {actualExecutionStatus === NodeExecutionStatus.COMPLETED && (
            <CompletedIcon />
          )}
          {actualExecutionStatus === NodeExecutionStatus.FAILED && (
            <FailedIcon />
          )}
        </StatusIndicator>
        </NodeGraph>
      </DraggableArea>
      <NodeTitle>{data.name}</NodeTitle>
    </NodeContainer>
  );
});

ActionNodeComponent.displayName = 'ActionNodeComponent';

interface TriggerNodeProps extends NodeProps {
  executionStatus?: NodeExecutionStatus;
}


interface AgentNodeProps extends NodeProps {
  onMcpLabelClick?: () => void;
  onResourceDelete?: (resourceType: string, resourceId: string) => void;
  executionStatus?: NodeExecutionStatus;
}

//  Agent node component
export const AgentNodeComponent = memo(({ data, onMcpLabelClick, onResourceDelete, ...props }: AgentNodeProps & { executionStatus?: NodeExecutionStatus }) => {
  // 从props中获取executionStatus，如果没有则使用默认值
  const executionStatus = props.executionStatus || NodeExecutionStatus.IDLE;
  const { themeMode } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  // 从节点数据中获取资源信息
  const agentResources = data.agentResources || {};
  const resourceItems = [
    ...(agentResources.mcpList || []).map((item: {id: string, name: string}) => ({
      id: item.id,
      type: 'mcp',
      name: item.name,
      icon: VscTools
    })),
    ...(agentResources.workflowList || []).map((item: {id: string, name: string}) => ({
      id: item.id,
      type: 'workflow',
      name: item.name,
      icon: SlOrganization
    })),
    ...(agentResources.connectList || []).map((item: {id: string, name: string}) => ({
      id: item.id,
      type: 'connect',
      name: item.name,
      icon: TbDatabaseCog
    }))
  ];


  // 使用 useMemo 优化连接点渲染
  const handles = useMemo(() => {
    const handles: React.ReactElement[] = [];

    // 为没有设置link的节点提供默认值
    const nodeLink = data.link || {
      inputs: [NodeLink.Data],
      outputs: [NodeLink.Data]
    };

    // 渲染输入连接点
    if (nodeLink.inputs && nodeLink.inputs.length > 0) {
      nodeLink.inputs.forEach((input: any, index: number) => {
        const handleTop = nodeLink.inputs.length === 1
          ? 50 // 单个连接点居中
          : (100 / (nodeLink.inputs.length + 1)) * (index + 1); // 多个连接点均匀分布

        // 为每个连接点生成独立的提示
        const inputTitle = input.desc && input.desc.trim() !== '' ? input.desc : '输入';

        handles.push(
          <CustomHandle
            key={`input-${index}`}
            type="target"
            position={Position.Left}
            id={`left-${index}`}
            className="left"
            title={inputTitle}
            style={{ top: `${handleTop}%`, transform: 'translateY(-50%)' }}
          />
        );
      });
    }

    // 渲染输出连接点
    if (nodeLink.outputs && nodeLink.outputs.length > 0) {
      nodeLink.outputs.forEach((output: any, index: number) => {
        const handleTop = nodeLink.outputs.length === 1
          ? 50 // 单个连接点居中
          : (100 / (nodeLink.outputs.length + 1)) * (index + 1); // 多个连接点均匀分布

        // 为每个连接点生成独立的提示
        const outputTitle = output.desc && output.desc.trim() !== '' ? output.desc : '输出';

        handles.push(
          <CustomHandle
            key={`output-${index}`}
            type="source"
            position={Position.Right}
            id={`right-${index}`}
            className="right"
            title={outputTitle}
            style={{ top: `${handleTop}%`, transform: 'translateY(-50%)' }}
          />
        );
      });
    }

    return handles;
  }, [data.link]); // 添加依赖项

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发节点拖拽
    setIsExpanded(!isExpanded);
  };

  const handleMcpLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发节点拖拽
    onMcpLabelClick?.();
  };

  return (
    <NodeContainer>
      <DraggableArea>
        <AgentNodeContainer>
          <AgentNodeGraph $nodeType="agent">
            {handles}
            <McpLabel onClick={handleMcpLabelClick}>
              可选资源
              <IoAddCircleSharp />
            </McpLabel>
            <NodeHeader>
              <AgentNodeIcon $bgColor="#33C2EE">
                {(() => {
                  const isRunning = executionStatus === NodeExecutionStatus.RUNNING;
                  if (isRunning) {
                    return <SpinnerIcon />;
                  } else {
                    return <img src={getThemeIcon(data.icon, themeMode, data.kind, data.catalog) || '/nodes/default/default.svg'} alt={data.title} />;
                  }
                })()}
              </AgentNodeIcon>
              <AgentNodeTitle style={{ fontSize: "14px" }}>{data.name}</AgentNodeTitle>
            </NodeHeader>
            <ExpandButton onClick={handleExpandToggle}>
              {isExpanded ? <IoChevronUp /> : <IoChevronDown />}
            </ExpandButton>
            {/* 状态指示器 */}
            <StatusIndicator>
              {(() => {
                return (
                  <>
                    {executionStatus === NodeExecutionStatus.COMPLETED && (
                      <CompletedIcon />
                    )}
                    {executionStatus === NodeExecutionStatus.FAILED && (
                      <FailedIcon />
                    )}
                  </>
                );
              })()}
            </StatusIndicator>
          </AgentNodeGraph>
          <McpList $visible={isExpanded}>
            {resourceItems.length > 0 ? (
              resourceItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <McpListItem key={index}>
                    <McpItemIcon>
                      <IconComponent />
                    </McpItemIcon>
                    <McpItemText title={item.name}>{item.name}</McpItemText>
                    <DeleteButton
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResourceDelete?.(item.type, item.id);
                      }}
                      title={`删除${item.type === 'mcp' ? 'MCP工具' : item.type === 'workflow' ? '工作流' : '连接'}: ${item.name}`}
                    >
                      <RiDeleteBin6Line color='#bfbfbf' />
                    </DeleteButton>
                  </McpListItem>
                );
              })
            ) : (
              <McpListItem>
                <McpItemText>暂无配置的资源</McpItemText>
              </McpListItem>
            )}
          </McpList>
        </AgentNodeContainer>
      </DraggableArea>
    </NodeContainer>
  );
});

AgentNodeComponent.displayName = 'AgentNodeComponent';

// Export sticky note component
export { StickyNoteComponent } from './sticky-note';

// Custom node for conditions
// export const ConditionNodeComponent = memo(({ data }: NodeProps) => {
//   return (
//     <NodeContainer $nodeType="condition">
//       <Handle type="target" position={Position.Top} />
//       <Handle type="source" position={Position.Bottom} id="a" />
//       <Handle type="source" position={Position.Right// d="b" />
//       {/* 添加左侧连接点 */}
//       <Handle type="target" posi// n={Position.// t} id="left-target" />
//       <Handle ty// "source" position={Position.Left} id="left-source" />
//       <NodeHeader>
//         <NodeIcon $bgColor="#FF9800">
//  //       <img src={data.icon} alt={data.title} style={{ width: '16p // height: '16px' }} />
//        </NodeIcon>
//         <NodeTitle>{data.title}</NodeTitle>
//    // </NodeHeader>
//       <NodeDescription>{data.description}</NodeDescriptio//
//     </NodeContai// >
//   );
// });

// ConditionNodeC// onent.displayName = 'ConditionNodeComponent';// // // // // // // //