import styled, { keyframes } from 'styled-components';
import { Handle } from 'reactflow';
import { LiaSpinnerSolid } from "react-icons/lia";
import { FaCheckCircle } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";


// 旋转动画
export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const NodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
 // pointer-events: none; /* 禁用整个容器的拖拽 */
`;

export const DraggableArea = styled.div`
  pointer-events: auto; /* 只有这个区域可以拖拽 */
`;

export const NodeGraph = styled.div<{ $nodeType: string }>`
  position: relative;
  padding: 10px 15px;
  border-radius: 5px;
  background: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: 90px;
  height: 80px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

export const TriggerNodeGraph = styled.div<{ $nodeType: string }>`
  position: relative;
  padding: 10px 15px;
  border-radius: 25px 5px 5px 25px;
  background: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: 90px;
  height: 80px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

export const AgentNodeGraph = styled.div<{ $nodeType: string }>`
  position: relative;
  padding: 10px 15px;
  border-radius: 5px;
  background: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  width: 200px;
  height: 80px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  color:#bfbfbf;
  font-weight:600;
  font-size:15px;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

export const AgentNodeContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

export const NodeHeader = styled.div`
  display: flex;
  align-items: center;
`;

export const NodeIcon = styled.div<{ $bgColor: string }>`
  width: 48px;
  height: 50px;
  border-radius: 4px;
  //background-color: ${props => props.$bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  //margin-right: 8px;
  color: white;
  img {
    width: 36px;
    height: 36px;
  }
`;

export const AgentNodeIcon = styled.div<{ $bgColor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  img {
    width: 28px;
    height: 28px;
  }
`;

// 状态指示器容器
export const StatusIndicator = styled.div`
  position: absolute;
  bottom: 0px;
  left: 6px;
  z-index: 10;
`;

// 状态指示器容器
export const TriggerStautsIndicator = styled.div`
  position: absolute;
  bottom: 20px;
  left: 28px;
  z-index: 10;
`;

// 旋转的 Spinner
export const SpinnerIcon = styled(LiaSpinnerSolid)`
  width: 36px;
  height: 36px;
  color: #f59e0b;
  animation: ${spin} 1s linear infinite;
`;

// 完成状态的勾
export const CompletedIcon = styled(FaCheckCircle)`
  width: 14px;
  height: 14px;
  color: #10b981;
`;

// 失败状态的叉
export const FailedIcon = styled(IoCloseCircle)`
  width: 15px;
  height: 15px;
  color: #ef4444;
`;

//这画布上的节点信息，在节点上显示
export const AgentNodeTitle = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 80px;
  max-width: 90px;
  min-width: 68px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const McpLabel = styled.div`
  position: absolute;
  top: 4px;
  right: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #bfbfbf;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 6px; /* 增加内边距来扩大可点击区域 */
  margin: -4px -6px; /* 使用负边距抵消内边距对视觉位置的影响 */
  border-radius: 4px; /* 添加圆角让 hover 区域更自然 */
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    background: rgba(255, 255, 255, 0.05); /* 添加轻微的背景色提供视觉反馈 */
  }
  
  svg {
    width: 17px;
    height: 17px;
  }
`;

export const ExpandButton = styled.div`
  position: absolute;
  bottom: 4px;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 25px;
  cursor: pointer;
  color: #bfbfbf;
  padding: 6px; /* 增加内边距来扩大可点击区域 */
  margin: -6px; /* 使用负边距抵消内边距对视觉位置的影响 */
  border-radius: 4px; /* 添加圆角让 hover 区域更自然 */
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    background: rgba(255, 255, 255, 0.05); /* 添加轻微的背景色提供视觉反馈 */
  }
`;

export const McpList = styled.div<{ $visible: boolean }>`
  width: 200px;
  background: ${({ theme }) => theme.colors.secondary || '#2a2a2a'};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  max-height: ${({ $visible }) => $visible ? '200px' : '0'};
  overflow-y: auto;
  opacity: ${({ $visible }) => $visible ? '1' : '0'};
  transition: all 0.3s ease;
  margin-top: -1px;/*${({ $visible }) => $visible ? '4px' : '0'};*/
`;

export const McpListItem = styled.div`
  padding: 4px 8px;
  font-size: 12px;
  color: #bfbfbf;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent}20;
    color: ${({ theme }) => theme.colors.accent};
    
    .delete-button {
      opacity: 1;
      visibility: visible;
    }
  }
`;

export const McpItemIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  
  svg {
    width: 10px;
    height: 10px;
  }
`;

export const McpItemText = styled.div`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px; /* 限制最大宽度，确保在小容器中也能正确截断 */
  min-width: 0; /* 允许 flex 项目缩小到内容宽度以下 */
`;

export const DeleteButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 17px;
  height: 17px;
  border-radius: 2px;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-left: auto; /* 让删除按钮靠右对齐 */
  padding: 2px; /* 增加内边距来扩大可点击区域 */
  margin-right: -4px; /* 使用负边距抵消内边距对视觉位置的影响 */
  
  &:hover {
    color: rgba(239, 68, 68, 1);
    background: rgba(239, 68, 68, 0.1); /* 添加轻微的背景色提供视觉反馈 */
    transform: scale(1.1);
  }
  
  svg {
    width: 15px;
    height: 15px;
  }
`;

//这画布上的节点信息，在节点上显示
export const NodeTitle = styled.div`
  font-weight: 500;
  font-size: 12px;
  margin-top: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
  width: 80px;
  max-width: 90px;
  min-width: 68px;
  text-align: center;
  word-wrap: break-word;
  word-break: break-all;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
  flex-shrink: 0;
`;

// 定义拖在画布上的节点的样式
export const CustomHandle = styled(Handle)`
  width: 20px;
  height: 20px;
  background: ${({ theme }) => theme.colors.accent}80;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  position: absolute;
  
   /* 向外扩展连线点位置 */
  &.left {
    left: -7px; /* 向左扩展 */
    border-radius: 1px;
    width: 14px;
    height: 22px;
    top: 50%;
    transform: translateY(-50%);
   }
  &.right {
    right: -10px; /* 向右扩展 */
    top: 50%;
    transform: translateY(-50%);
  }
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`;