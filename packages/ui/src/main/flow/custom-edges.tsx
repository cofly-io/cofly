import React from 'react';
import {
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  Position,
} from 'reactflow';
import styled from 'styled-components';

// 样式化的边标签
const EdgeLabel = styled.div`
  position: absolute;
  background: ${({ theme }) => theme.colors.accent};
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  pointer-events: all;
  z-index: 1000;
`;

// 直角边组件
export const StraightEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  label,
}) => {
  // 计算直角路径
  const getStraightPath = () => {
    // 计算中间点，创建直角路径
    const midX = sourceX + (targetX - sourceX) * 0.5;
    
    // 根据源和目标位置创建路径
    if (sourcePosition === Position.Right && targetPosition === Position.Left) {
      // 水平连接：右 -> 左
      return `M ${sourceX},${sourceY} L ${midX},${sourceY} L ${midX},${targetY} L ${targetX},${targetY}`;
    } else if (sourcePosition === Position.Bottom && targetPosition === Position.Top) {
      // 垂直连接：下 -> 上
      const midY = sourceY + (targetY - sourceY) * 0.5;
      return `M ${sourceX},${sourceY} L ${sourceX},${midY} L ${targetX},${midY} L ${targetX},${targetY}`;
    } else if (sourcePosition === Position.Right && targetPosition === Position.Top) {
      // 右 -> 上（跨行连接）
      return `M ${sourceX},${sourceY} L ${targetX},${sourceY} L ${targetX},${targetY}`;
    } else if (sourcePosition === Position.Bottom && targetPosition === Position.Left) {
      // 下 -> 左（跨行连接）
      return `M ${sourceX},${sourceY} L ${sourceX},${targetY} L ${targetX},${targetY}`;
    } else {
      // 默认贝塞尔曲线
      const [path] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });
      return path;
    }
  };

  const path = getStraightPath();
  
  // 计算标签位置（路径中点）
  const labelX = sourceX + (targetX - sourceX) * 0.5;
  const labelY = sourceY + (targetY - sourceY) * 0.5;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: '#b1b1b7',
          strokeWidth: 2,
          ...style,
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <EdgeLabel
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
          >
            {label}
          </EdgeLabel>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

// 智能边组件 - 根据节点位置自动选择边类型
export const SmartEdge: React.FC<EdgeProps> = (props) => {
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
  } = props;

  // 检查是否为跨行连接
  const isMultiRowConnection = data?.isMultiRow || false;
  
  // 如果是跨行连接，使用直角边
  if (isMultiRowConnection) {
    return <StraightEdge {...props} />;
  }
  
  // 检查是否为同一行的连接
  const isSameRow = Math.abs(sourceY - targetY) < 50; // 50px 容差
  
  if (isSameRow) {
    // 同一行使用默认贝塞尔曲线
    const [path] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });
    
    return (
      <BaseEdge
        {...props}
        path={path}
        style={{
          stroke: '#b1b1b7',
          strokeWidth: 2,
          ...props.style,
        }}
      />
    );
  }
  
  // 不同行使用直角边
  return <StraightEdge {...props} />;
};

// 导出边类型配置
export const EDGE_TYPES = {
  straight: StraightEdge,
  smart: SmartEdge,
};