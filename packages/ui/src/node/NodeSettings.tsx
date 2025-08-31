"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { ParameterInput } from './ParameterInput';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { SiSpeedtest } from "react-icons/si";
import { FaSave } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { BiSolidShow } from "react-icons/bi";
import { TbEyeClosed } from "react-icons/tb";
import { CoButton } from '../components/basic/Buttons';
import { useTheme } from '../context/ThemeProvider';
import { getThemeIcon } from '../utils/themeIcon';
import { AiOutlineLoading } from "react-icons/ai";

import type {
  NodeSettingsProps
} from './types';



// Main container taking up 98vh x 98vh
const MainContainer = styled.div`
  position: fixed;
  top: 1vh;
  left: 1vw;
  width: 98vw;
  height: 97vh;
  overflow: hidden;
  display: flex;
  user-select: none;
  z-index: 1000;
`;

// 中心轴Draggable divider
const Divider = styled.div<{ onMouseDown: (e: React.MouseEvent) => void }>`
  width: 4px;
  height: 99%;
  /*background: ${({ theme }) => theme.colors.border};*/
  background: ${({ theme }) => theme.colors.textPrimary};
  cursor: col-resize;
  position: relative;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
  
  &::before {
    content: '';
    position: absolute;
    left: -6px;
    right: -6px;
    top: 0;
    bottom: 0;
    cursor: col-resize;
  }
`;

// Floating settings overlay
const SettingsOverlay = styled.div.attrs<{ $visible: boolean; $leftOffset: number; $nodeWidth: number; $expanded?: boolean }>(({ $visible, $leftOffset, $nodeWidth, $expanded }) => ({
  style: {
    left: `${$leftOffset}%`,
    width: $expanded ? '100%' : `${$nodeWidth}px`,
    display: $visible ? 'block' : 'none',
  },
})) <{ $visible: boolean; $leftOffset: number; $nodeWidth: number; $expanded?: boolean }>`
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  height: 96vh;
  background:  ${({ theme }) => theme.panel.nodeBg};
  border-radius: 4px;
  border:1px solid ${({ theme }) => theme.colors.textPrimary}25;
  box-shadow: 0px 0px 8px rgba(64, 93, 158, 0.4);
  z-index: 10001;
  overflow: hidden;
  transition: left 0.1s ease;
`;

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px 25px 20px 25px;
`;

const FixedHeader = styled.div`
  flex-shrink: 0;
`;

const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
  margin-right: -10px;
`;

const FixedFooter = styled.div`
  flex-shrink: 0;
  margin-top: 25px;
`;

const TitleHeader = styled.div<{ onMouseDown: (e: React.MouseEvent) => void }>`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.accent};
  cursor: pointer;
  text-align: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const TitleDesc = styled.div`
  display:flex;
  align-items: center;
  justify-content: center;
`;

const TitleIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-top:-8px;
  margin-right: 6px;
  color: ${({ theme }) => theme.colors.textPrimary};
  user-select: none;
  pointer-events: none;
`;

// 可编辑标签容器
const EditableTitleContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
`;

// 标签样式
const TitleLabel = styled.label`
  font-size: 14px;
  /*color: ${({ theme }) => theme.colors.textPrimary};*/
  background: ${({ theme }) => theme.panel.nodeBg};
  //border: 1px solid ${({ theme }) => theme.colors.textPrimary};
  padding: 6px 6px;
  font-weight: 600;
  cursor: pointer;
  flex: 1;
  user-select: none;
  //transition: all 0.2s ease;
  
  &:hover {
    // border: 1px solid ${({ theme }) => theme.colors.textPrimary};
    // border-bottom: 1px solid ${({ theme }) => theme.colors.borderHover};
    // background: ${({ theme }) => theme.panel.nodeBg};
  }
`;

// 编辑模式下的输入框
const EditInput = styled.input`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.panel.nodeBg};
  border: 0px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.accent};
  border-radius: 2px;
  padding: 8px 6px;
  font-weight: 600;
  flex: 1;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent}20;
  }
  
`;

const Tabs = styled.div`
  display: flex;
  margin-bottom: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.panel.ctlBorder};
  font-size:14px;
`;

const Tab = styled.div<{ $active?: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  color: ${props => props.$active ? props.theme.colors.accent : props.theme.colors.textSecondary};
  border-bottom: 2px solid ${props => props.$active ? props.theme.colors.accent : 'transparent'};
  transition: color 0.2s ease;
  font-weight: ${props => props.$active ? '400' : '200'};
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const ButtonContainer = styled.div`
  display: flex; 
  margin-top: -10px;
  justify-content: space-between;
`;

//节点测试
const TestButton = styled.button<{ $disabled?: boolean }>`
  background: ${({ $disabled, theme }) => {
    if ($disabled) {
      return theme.mode === 'light' ? 'rgba(7, 187, 130, 0.3)' : 'rgba(255, 255, 255, 0.03)';
    }
    return theme.mode === 'light' ? '#07bb82' : 'rgba(255, 255, 255, 0.08)';
  }};
  border: 1px solid ${({ $disabled, theme }) => {
    if ($disabled) {
      return theme.mode === 'light' ? 'rgba(7, 187, 130, 0.4)' : 'rgba(255, 255, 255, 0.08)';
    }
    return theme.mode === 'light' ? '#06a374' : 'rgba(255, 255, 255, 0.15)';
  }};
  border-radius: 4px;
  padding: 0px 14px;
  color: ${({ $disabled, theme }) => {
    if ($disabled) {
      return theme.mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.4)';
    }
    return theme.mode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.9)';
  }};
  font-size: 12px;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  height:28px;
  backdrop-filter: blur(4px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)';
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
  
  &:hover {
    background: ${({ $disabled, theme }) => {
    if ($disabled) {
      return theme.mode === 'light' ? 'rgba(7, 187, 130, 0.3)' : 'rgba(255, 255, 255, 0.03)';
    }
    return theme.mode === 'light' ? '#059669' : 'rgba(255, 255, 255, 0.12)';
  }};
    border-color: ${({ $disabled, theme }) => {
    if ($disabled) {
      return theme.mode === 'light' ? 'rgba(7, 187, 130, 0.4)' : 'rgba(255, 255, 255, 0.08)';
    }
    return theme.mode === 'light' ? '#047857' : 'rgba(255, 255, 255, 0.25)';
  }};
    box-shadow: ${({ $disabled }) => $disabled ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.15)'};
  }
  &:after {
    background: ${({ theme }) => theme.mode === 'light' ? '#07bb82' : 'rgba(255, 255, 255, 0.08)'};
    border-color: ${({ theme }) => theme.mode === 'light' ? '#06a374' : 'rgba(255, 255, 255, 0.15)'};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  &:active {
    transform: ${({ $disabled }) => $disabled ? 'none' : 'translateY(0)'};
  }
  
  .loading-icon {
    animation: spin 1s linear infinite;
    font-size: 14px;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  svg {
    margin-bottom: -1px;
    margin-right: 8px;
    color: #ffffff;
  }
`;

const CommonBtnContainer = styled.div`
  display: flex;
  gap: 15px;
`;


// Toggle button to show/hide settings
const ToggleSettingsButton = styled.button`
  position: absolute;
  top: 8px;
  right: 100px;
  background: ${({ theme }) => theme.panel.panelBg};
  border: 1px solid ${({ theme }) => theme.colors.textPrimary}35;
  border-radius: 4px;
  padding: 0px 11px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 12px;
  height:28px;
  backdrop-filter: blur(4px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    background: ${({ theme }) => theme.colors.textPrimary}12;
    border-color: ${({ theme }) => theme.colors.textPrimary}25;
    box-shadow: 0 4px 12px rgba(2, 2, 2, 0.15);
  }

  svg {
      margin-right: 0px;
      width:18px;
      height:18px;
      color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

// Close button for the entire panel
const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 20px;
  background: rgba(243, 8, 8, 0.58);
  border: 1px solid ${({ theme }) => theme.colors.textPrimary}15;
  border-radius: 4px;
  padding: 0px 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 12px;
  height:28px;
  backdrop-filter: blur(4px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)';
  &:hover {
    background: ${({ theme }) => theme.colors.textPrimary}12;
    border-color: ${({ theme }) => theme.colors.textPrimary}25;
    box-shadow: 0 4px 12px rgba(2, 2, 2, 0.15);
  }
  
  svg {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

// Output content containers
const OutputContainer = styled.div`
  background: ${({ theme }) => theme.colors.inputBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textPrimary};
  min-height: 500px;
  height: 93%;
  white-space: pre-wrap;
  word-break: break-word;
`;

// NodeSettingsProps is now imported from McpInterfaces.ts.ts

export const NodeSettings: React.FC<NodeSettingsProps> = ({
  node,
  parameters,
  savedValues = {},
  onClose,
  onSave,
  onNodeIdChange,
  previousNodeOutput = '',
  onTest,
  onStopTest,
  onTestPreviousNode,
  onSaveMockData,
  testOutput = '',
  nodeWidth,
  lastTestResult,
  previousNodeIds,
  onPreviousNodeChange,
  selectedPreviousNodeId,
  nodesTestResultsMap,
  getLatestNodesTestResultsMap,
  nodesDetailsMap,
  showToast,
  connectConfigs = [],
  onFetchConnectInstances,
  onFetchConnectDetail,
  linkageCallbacks,
  isNodeTesting,
  nodeTestEventId,
  nodeId: propNodeId,
  onAIhelpClick,
}) => {
  console.log('🟡 [NodeSettings] 组件渲染:', {
    nodeId: node?.id,
    onAIhelpClick: typeof onAIhelpClick,
    onAIhelpClickExists: !!onAIhelpClick
  });
  const { themeMode } = useTheme();
  const [activeTab, setActiveTab] = useState('parameters');
  const [nodeId, setNodeId] = useState(node.id);
  const [nodeIcon, setnodeIcon] = useState(getThemeIcon(node.data.icon, themeMode, node.data.kind, node.data.catalog) || '/nodes/default/default.svg');
  const [showSettings, setShowSettings] = useState(true);
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [overlayLeftOffset, setOverlayLeftOffset] = useState(50);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayedTestResult, setDisplayedTestResult] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

  // 添加编辑状态管理
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempNodeId, setTempNodeId] = useState<string>(nodeId);
  const editInputRef = useRef<HTMLInputElement>(null);

  // 监听主题变化，更新节点图标
  useEffect(() => {
    setnodeIcon(getThemeIcon(node.data.icon, themeMode, node.data.kind, node.data.catalog) || '/nodes/default/default.svg');
  }, [themeMode, node.data.icon, node.data.kind, node.data.catalog]);

  // // 创建一个ref来跟踪上次的lastTestResult，记录日志（不再需要重置状态，因为状态由父组件管理）
  // const lastTestResultRef = useRef(lastTestResult);
  // useEffect(() => {
  //   console.log('🔄 [NodeSettings] lastTestResult useEffect triggered:', {
  //     lastTestResult: lastTestResult ? 'has result' : 'no result',
  //     lastTestResultRef: lastTestResultRef.current ? 'has ref' : 'no ref',
  //     isNodeTesting,
  //     hasChanged: lastTestResult !== lastTestResultRef.current,
  //     nodeTestEventId
  //   });

  //   if (lastTestResult && lastTestResult !== lastTestResultRef.current && isNodeTesting) {
  //     console.log('✅ [NodeSettings] New test result received while testing');
  //   }
  //   lastTestResultRef.current = lastTestResult;
  // }, [lastTestResult, isNodeTesting, nodeTestEventId]);

  // 优化: 使用useMemo初始化nodeValues，避免每次渲染重新计算
  const initialNodeValues = useMemo(() => {
    const initialValues: Record<string, any> = {};

    parameters.forEach(param => {
      let value;

      // 优先级：savedValues > node.data > param.default
      if (savedValues[param.name] !== undefined) {
        value = savedValues[param.name];
      } else if (node.data?.[param.name] !== undefined) {
        value = node.data[param.name];
      } else {
        value = param.default;
      }

      initialValues[param.name] = value;
    });

    return initialValues;
  }, [parameters, savedValues, node.data]);

  const [nodeValues, setNodeValues] = useState<Record<string, any>>(initialNodeValues);
  const [hasUserInput, setHasUserInput] = useState<boolean>(false);

  // 优化: 当initialNodeValues变化时更新nodeValues，但只在用户还没有输入时才更新
  useEffect(() => {
    if (!hasUserInput) {
      setNodeValues(initialNodeValues);
    }
  }, [initialNodeValues, hasUserInput]);

  // 组件初始化时打印nodesDetailsMap
  // useEffect(() => {
  //   console.log('NodeSettings界面打开 - nodesDetailsMap:', nodesDetailsMap);
  //   console.log('NodeSettings - activeTab:', activeTab);
  //   console.log('NodeSettings - showSettings:', showSettings);
  //   console.log('NodeSettings - parameters:', parameters);
  //   console.log('NodeSettings - parameters.length:', parameters.length);
  // }, []);



  const actualNodeWidth = useMemo(() => {
    // 确保节点配置面板有合理的最小宽度，不受自动布局影响
    const minWidth = 600; // 设置最小宽度为600px
    const maxWidth = 1000; // 设置最大宽度为1000px
    const defaultWidth = 500; // 默认宽度

    let width = nodeWidth || (node?.data as any)?.nodeWidth || defaultWidth;

    // 如果宽度小于最小值，使用默认宽度
    if (width < minWidth) {
      width = defaultWidth;
    }

    // 如果宽度大于最大值，限制为最大宽度
    if (width > maxWidth) {
      width = maxWidth;
    }

    return width;
  }, [nodeWidth, node?.data]);



  // 初始化和窗口大小改变时重新计算浮窗位置
  useEffect(() => {
    const updateOverlayPosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();

        // 内联计算浮窗位置，避免依赖外部函数
        const overlayWidth = actualNodeWidth;
        const overlayHalfWidth = overlayWidth / 2;
        const leftPanelCenter = (leftWidth / 100) * rect.width;
        const rightEdge = leftPanelCenter + overlayHalfWidth;
        const leftEdge = leftPanelCenter - overlayHalfWidth;

        let finalPosition = leftWidth; // 默认跟随左侧面板中心

        // 如果超出右边界，调整位置
        if (rightEdge > rect.width) {
          finalPosition = ((rect.width - overlayHalfWidth) / rect.width) * 100;
        }

        if (leftEdge < 0) {
          finalPosition = (overlayHalfWidth / rect.width) * 100;
        }

        setOverlayLeftOffset(finalPosition);
      }
    };

    updateOverlayPosition();
    window.addEventListener('resize', updateOverlayPosition);

    return () => {
      window.removeEventListener('resize', updateOverlayPosition);
    };
  }, [leftWidth, actualNodeWidth]);

  const handleValueChange = useCallback((name: string, value: any) => {
    setHasUserInput(true);
    setNodeValues((prev: Record<string, any>) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // 处理标题编辑 - 优化回调函数
  const handleTitleClick = useCallback(() => {
    setIsEditingTitle(true);
    setTempNodeId(nodeId);
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 0);
  }, [nodeId]);

  const handleTitleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTempNodeId(e.target.value);
  }, []);

  const handleTitleInputBlur = useCallback(() => {
    // 检查新名称是否为空或只有空白字符
    if (!tempNodeId?.trim()) {
      showToast?.('warning', '名称无效', '节点名称不能为空');
      setTempNodeId(nodeId); // 恢复原名称
      setIsEditingTitle(false);
      return;
    }

    // 如果名称没有变化，直接关闭编辑模式
    if (tempNodeId === nodeId) {
      setIsEditingTitle(false);
      return;
    }

    // 检查名称是否在nodesDetailsMap中已存在（排除当前节点）
    const isNameExists = Object.keys(nodesDetailsMap || {}).some(existingNodeId =>
      existingNodeId === tempNodeId && existingNodeId !== nodeId
    );

    if (isNameExists) {
      showToast?.('error', '名称冲突', '该节点名称已存在');
      setTempNodeId(nodeId); // 恢复原名称
      setIsEditingTitle(false);
      return;
    }

    // 如果名称有效且不重复，执行更新
    if (tempNodeId) {
      setNodeId(tempNodeId);
      setIsEditingTitle(false);

      // 通知父组件节点ID发生变化
      if (onNodeIdChange) {
        onNodeIdChange(nodeId, tempNodeId);
      }
    }
  }, [tempNodeId, nodeId, nodesDetailsMap, showToast, onNodeIdChange]);

  const handleTitleInputKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setTempNodeId(nodeId);
    }
  }, [handleTitleInputBlur, nodeId]);

  // 优化: 合并保存和取消的逻辑
  const handleCancel = useCallback(() => {
    setHasUserInput(false);
    onClose();
  }, [onClose]);

  const handleSave = useCallback(() => {
    // 数据类型转换逻辑
    const convertedValues: Record<string, any> = {};

    // 辅助函数：检查值是否为空
    const isEmpty = (val: any): boolean => {
      if (val === null || val === undefined) return true;
      if (typeof val === 'string' && val.trim() === '') return true;
      if (typeof val === 'object' && Object.keys(val).length === 0) return true;
      if (Array.isArray(val) && val.length === 0) return true;
      return false;
    };

    // 辅助函数：检查值是否为默认值
    const isDefaultValue = (fieldName: string, value: any): boolean => {
      // 查找对应的字段配置
      const field = parameters.find(param => param.name === fieldName);
      if (!field || field.default === undefined) {
        return false;
      }

      const isDefault = JSON.stringify(value) === JSON.stringify(field.default);
      //console.log('检查默认值:', fieldName, '当前值:', value, '默认值:', field.default, '是否为默认:', isDefault);
      return isDefault;
    };

    // 处理所有nodeValues中的字段，包括selectadd动态添加的字段
    Object.entries(nodeValues).forEach(([fieldName, value]) => {
      if (value !== undefined) {
        // 查找字段配置以确定类型
        const fieldConfig = parameters.find(param => param.name === fieldName);

        let convertedValue: any;

        if (fieldConfig) {
          // 根据字段配置进行类型转换
          switch (fieldConfig.type) {
            case 'number':
              convertedValue = typeof value === 'string' ? parseFloat(value) : value;
              break;
            case 'boolean':
              convertedValue = typeof value === 'string' ? value === 'true' : Boolean(value);
              break;
            default:
              convertedValue = value;
              break;
          }
        } else {
          // 对于动态添加的字段，直接保存值
          convertedValue = value;
        }

        // 过滤掉空值、空对象和默认值
        if (!isEmpty(convertedValue) && !isDefaultValue(fieldName, convertedValue)) {
          convertedValues[fieldName] = convertedValue;
        }
      }
    });

    console.log('🔍 [NodeSettings] 过滤后的参数:', convertedValues);

    onSave({
      ...node,
      id: nodeId || node.id,
      data: {
        ...node.data,
        name: nodeId || node.id,
        ...convertedValues
      }
    });

    setHasUserInput(false);
  }, [nodeValues, parameters, node, nodeId, onSave]);

  // 优化: 使用useCallback缓存鼠标事件处理函数
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let percentage = Math.max(10, Math.min(90, (x / rect.width) * 100));

    // 如果浮窗会撞到边界，限制拖拽
    const overlayWidth = actualNodeWidth;
    const overlayHalfWidth = overlayWidth / 2;
    const proposedCenter = (percentage / 100) * rect.width;

    // 检查右边界限制
    if (proposedCenter + overlayHalfWidth > rect.width) {
      percentage = Math.min(percentage, ((rect.width - overlayHalfWidth) / rect.width) * 100);
    }

    // 检查左边界限制
    if (proposedCenter - overlayHalfWidth < 0) {
      percentage = Math.max(percentage, (overlayHalfWidth / rect.width) * 100);
    }

    // 内联计算浮窗位置
    const leftPanelCenter = (percentage / 100) * rect.width;
    const rightEdge = leftPanelCenter + overlayHalfWidth;
    const leftEdge = leftPanelCenter - overlayHalfWidth;

    let overlayPosition = percentage; // 默认跟随左侧面板中心

    // 如果超出右边界，调整位置
    if (rightEdge > rect.width) {
      overlayPosition = ((rect.width - overlayHalfWidth) / rect.width) * 100;
    }

    if (leftEdge < 0) {
      overlayPosition = (overlayHalfWidth / rect.width) * 100;
    }

    setLeftWidth(percentage);
    setOverlayLeftOffset(overlayPosition);
  }, [isDragging, actualNodeWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 提供给子组件的扩展模式控制函数
  const handleExpandModeChange = useCallback((expanded: boolean) => {
    setIsExpanded(expanded);
  }, []);

  // 处理AI助手点击的回调
  const handleAIhelpClick = useCallback(async (rules: string, content: string, fieldName: string): Promise<string> => {
    if (onAIhelpClick) {
      // 直接传递UnifiedParameterInput的参数格式，不进行转换
      return await onAIhelpClick(rules, content, fieldName);
    }
    return '';
  }, [onAIhelpClick]);

  // 优化: 使用useCallback缓存LeftPanel回调
  const handleLeftPanelTest = useCallback((nodeValues: Record<string, any>, targetNodeId: string) => {
    onTestPreviousNode?.(nodeValues, targetNodeId);
  }, [onTestPreviousNode]);

  const handleDisplayTestResult = useCallback((testResult: any) => {
    if (testResult) {
      setDisplayedTestResult(testResult);
    } else {
      setDisplayedTestResult(null);
    }
  }, []);

  // 验证必填字段
  const validateRequiredFields = useCallback(() => {
    const errorFields = new Set<string>();
    const errorNames: string[] = [];

    console.log('🔍 [NodeSettings] 开始验证必填字段:', { parameters, nodeValues });

    parameters.forEach(param => {
      // 检查是否为必填字段
      // 首先尝试从 param.required 获取
      let isRequired = (param as any).required;

      // 如果不存在，则从 node.detail.fields 中查找
      if (isRequired === undefined && node?.data?.detail?.fields) {
        const fieldDef = node.data.detail.fields.find((f: any) => f.name === param.name);
        isRequired = fieldDef?.required || false;
      }

      // 如果还是找不到，根据节点类型和字段名进行特殊处理
      if (isRequired === undefined) {
        // 对于 jscode 节点的 code 字段，默认为必填
        if (node?.data?.kind === 'jscode' && param.name === 'code') {
          isRequired = true;
        }
        // 可以在这里添加其他节点类型的特殊处理
        else {
          isRequired = false;
        }
      }

      console.log('🔍 [NodeSettings] 检查参数:', {
        name: param.name,
        required: isRequired,
        value: nodeValues[param.name],
        controlType: (param as any).controlType
      });

      if (isRequired) {
        const value = nodeValues[param.name];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          console.log('❌ [NodeSettings] 发现必填字段为空:', param.name);
          errorFields.add(param.name);
          errorNames.push(param.displayName);
        }
      }
    });

    console.log('🔍 [NodeSettings] 验证结果:', { errorFields, errorNames });
    return { errorFields, errorNames };
  }, [parameters, nodeValues]);

  // 优化: 使用useCallback缓存测试函数
  const handleNodeTest = useCallback(async () => {
    // 如果正在测试中，调用停止测试
    if (isNodeTesting) {
      console.log('🛑 [NodeSettings] 停止节点测试');
      if (onStopTest) {
        try {
          await onStopTest(nodeId || node.id);
        } catch (error) {
          console.error('❌ [NodeSettings] 停止测试失败:', error);
          showToast?.('error', '停止失败', error instanceof Error ? error.message : '未知错误');
        }
      } else {
        console.warn('⚠️ [NodeSettings] onStopTest 函数未定义');
      }
      return;
    }

    console.log('🚀 [NodeSettings] 开始节点测试', {
      nodeId,
      hasOnTest: !!onTest,
      nodeValuesKeys: Object.keys(nodeValues),
      currentTestOutput: testOutput ? 'has output' : 'no output',
      currentLastTestResult: lastTestResult ? 'has result' : 'no result',
      isNodeTesting,
      nodeTestEventId
    });

    // 验证必填字段
    const { errorFields, errorNames } = validateRequiredFields();
    if (errorNames.length > 0) {
      console.log('❌ [NodeSettings] 验证失败，设置错误状态');
      setValidationErrors(errorFields);
      showToast?.('error', '验证失败', `请填写必填字段: ${errorNames.join(', ')}`);
      return;
    }

    console.log('✅ [NodeSettings] 验证通过，清除错误状态');
    // 清除验证错误状态
    setValidationErrors(new Set());

    if (onTest) {
      try {
        console.log('🚀 [NodeSettings] 调用测试函数 onTest');
        onTest(nodeValues);
      } catch (error) {
        console.error('❌ [NodeSettings] Test failed:', error);
      }
    } else {
      console.error('❌ [TestButton] onTest 函数未定义!');
    }
  }, [onTest, onStopTest, nodeValues, parameters, isNodeTesting, validateRequiredFields, showToast, nodeId, testOutput, lastTestResult, nodeTestEventId]);

  return (
    <MainContainer ref={containerRef}>
      <ToggleSettingsButton onClick={() => setShowSettings(!showSettings)}>
        {showSettings ? <BiSolidShow /> : <TbEyeClosed />}
      </ToggleSettingsButton>
      <CloseButton onClick={onClose}>关闭 ✖</CloseButton>
      <LeftPanel
        width={leftWidth}
        previousNodeOutput={previousNodeOutput}
        previousNodeIds={previousNodeIds}
        onPreviousNodeChange={onPreviousNodeChange}
        selectedPreviousNodeId={selectedPreviousNodeId}
        nodesTestResultsMap={nodesTestResultsMap}
        getLatestNodesTestResultsMap={getLatestNodesTestResultsMap}
        nodesDetailsMap={nodesDetailsMap}
        showToast={showToast}
        nodeWidth={actualNodeWidth}
        showSettings={showSettings}
        onTest={handleLeftPanelTest}
        onDisplayTestResult={handleDisplayTestResult}
      />

      <Divider onMouseDown={handleMouseDown} />

      <RightPanel
        width={100 - leftWidth}
        onTest={onTest}
        onSaveMockData={onSaveMockData}
        testOutput={testOutput}
        nodeWidth={actualNodeWidth}
        showSettings={showSettings}
        lastTestResult={lastTestResult}
        nodeId={nodeId}
        nodesTestResultsMap={nodesTestResultsMap}
        isNodeTesting={isNodeTesting}
        nodeTestEventId={nodeTestEventId}
        onUpdateNodesTestResultsMap={(id: string, data: any) => {
          console.log('🔧 [NodeSettings] Setting mock data:', {
            id,
            isNodeTesting,
            nodeTestEventId
          });

          // 创建符合mockTestResult格式的数据
          const mockTestResult = {
            timestamp: new Date().toISOString(),
            success: true,
            runData: data,
            inputs: {},
            source: 'mock',
            nodeKind: 'unknown'
          };

          if (onSaveMockData) {
            onSaveMockData(mockTestResult);
          }
        }}
      />

      <SettingsOverlay
        $visible={showSettings}
        $leftOffset={overlayLeftOffset}
        $nodeWidth={actualNodeWidth}
        $expanded={isExpanded}
      >
        <SettingsContainer>
          <TitleHeader onMouseDown={handleMouseDown}>:::::::::</TitleHeader>
          <FixedHeader>
            <TitleDesc>
              <TitleIcon
                src={nodeIcon}
                alt={nodeId}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
              />
              <EditableTitleContainer>
                {isEditingTitle ? (
                  <EditInput
                    ref={editInputRef}
                    value={tempNodeId}
                    onChange={handleTitleInputChange}
                    onBlur={handleTitleInputBlur}
                    onKeyDown={handleTitleInputKeyPress}
                    placeholder="Node ID"
                    data-no-json-drop="true"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                  />
                ) : (
                  <>
                    <TitleLabel
                      onClick={handleTitleClick}
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    >
                      {nodeId}
                    </TitleLabel>
                    {/*  <TitleLabel onClick={handleTitleClick}>{nodeId}</TitleLabel>
                   <EditIcon onClick={handleTitleClick} /> */}
                  </>
                )}
              </EditableTitleContainer>
            </TitleDesc>
            <Tabs>
              <Tab
                $active={activeTab === 'parameters'}
                onClick={() => setActiveTab('parameters')}
              >
                参数
              </Tab>
              <Tab
                $active={activeTab === 'settings'}
                onClick={() => setActiveTab('settings')}
              >
                配置
              </Tab>
            </Tabs>
          </FixedHeader>

          <ScrollableContent>
            {activeTab === 'parameters' && (
              <div>
                {parameters.map(param => {
                  return (
                    <ParameterInput
                      key={param.name}
                      parameter={param}
                      value={nodeValues[param.name]}
                      onChange={handleValueChange}
                      formValues={nodeValues}
                      onExpandModeChange={handleExpandModeChange}
                      connectConfigs={connectConfigs}
                      onFetchConnectDetail={onFetchConnectDetail}
                      onFetchConnectInstances={onFetchConnectInstances}
                      linkageCallbacks={linkageCallbacks}
                      allParameters={parameters}
                      validationErrors={validationErrors}
                      nodeId={propNodeId || node.id}
                      onAIhelpClick={handleAIhelpClick}
                    />
                  );
                })}
              </div>
            )}
          </ScrollableContent>

          <FixedFooter>
            <ButtonContainer>
              <TestButton
                $disabled={false}
                onClick={handleNodeTest}
              >
                {isNodeTesting ? (
                  <>
                    <AiOutlineLoading className="loading-icon" />
                    调试中...
                  </>
                ) : (
                  <>
                    <SiSpeedtest />
                    节点测试
                  </>
                )}
              </TestButton>
              <CommonBtnContainer>
                <CoButton variant='Glass'
                  backgroundColor={themeMode === 'light' ? '#bfbfbf' : undefined}
                  onClick={handleCancel}><MdCancel />取消</CoButton>
                <CoButton
                  variant='Glass'
                  backgroundColor={themeMode === 'dark'
                    ? 'linear-gradient(135deg, #2c6feb, #1a4fb3)'
                    : 'linear-gradient(135deg, #37e6ce, #1dc7d8)'
                  }
                  onClick={handleSave}
                >
                  <FaSave />保存
                </CoButton>
                {/* <Button $primary onClick={handleSave}><FaSave />保存</Button> */}
              </CommonBtnContainer>
            </ButtonContainer>
          </FixedFooter>
        </SettingsContainer>
      </SettingsOverlay>
    </MainContainer>
  );
};