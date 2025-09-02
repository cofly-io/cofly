"use client";

import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { PiCopyDuotone } from 'react-icons/pi';
import { useTheme } from '../../../context/ThemeProvider';

// JSON tree 容器样式
const JsonTreeContainer = styled.div`
  .json-tree {
    font-size: 12px;
    line-height: 1.2;
    color: ${({ theme }) => theme.colors.textPrimary};
    position: relative;
  }

  .vjs-tree-node {
    position: relative;
    display: flex;
    align-items: flex-start;
    min-height: 20px;
    padding: 1px 0;
    
    &:hover {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(0, 0, 0, 0.05)'
        : 'rgba(255, 255, 255, 0.02)'
      };
      
      .copy-icon {
        opacity: 1;
        width: 20px;
        height: 20px;
        visibility: visible;
      }
    }
  }

  .copy-icon {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    cursor: pointer;
    color: ${({ theme }) => theme.mode === 'light' 
      ? 'rgba(0, 0, 0, 0.6)'
      : 'rgba(255, 255, 255, 0.6)'
    };
    font-size: 16px;
    padding: 4px;
    border-radius: 3px;
    background: ${({ theme }) => theme.mode === 'light' 
      ? 'rgba(255, 255, 255, 0.8)'
      : 'rgba(0, 0, 0, 0.3)'
    };
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      color: ${({ theme }) => theme.colors.accent};
      background: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(36, 194, 140, 0.2)'
        : 'rgba(86, 156, 214, 0.3)'
      };
      transform: translateY(-50%) scale(1.1);
    }
    
    &:active {
      transform: translateY(-50%) scale(0.95);
    }
  }

  .vjs-indent {
    display: flex;
    align-items: flex-start;
    position: relative;
    flex-shrink: 0;
  }

  .vjs-indent-line {
    width: 20px;
    position: relative;
    display: flex;
    align-items: flex-start;
    min-height: 20px;
    
    /* 使用主题颜色的缩进线 */
    &::before {
      content: '';
      position: absolute;
      left: 10px;
      top: 0;
      bottom: -10px;
      width: 1px;
      background: ${({ theme }) => theme.mode === 'light' 
        ? '#CCCCCC'
        : '#6B6B6B'
      };
      z-index: 1;
    }
    
    &:last-child::after {
      content: '';
      position: absolute;
      left: 10px;
      top: 10px;
      width: 10px;
      height: 1px;
      background: ${({ theme }) => theme.mode === 'light' 
        ? '#CCCCCC'
        : '#6B6B6B'
      };
      z-index: 2;
    }
    
    &.last-child::before {
      bottom: 10px;
    }
  }
  .vjs-icon {
    width: 16px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 6px;
    font-size: 13px;
    user-select: none;
    flex-shrink: 0;
    margin-top: 0px;
  }
  .vjs-icon-toggle {
    cursor: pointer;
    color: ${({ theme }) => theme.mode === 'light' 
      ? '#2196F3'
      : 'rgb(102, 217, 239)'
    };
    transition: all 0.2s ease;
    
    &:hover {
      color: ${({ theme }) => theme.mode === 'light' 
        ? '#1976D2'
        : 'rgb(109, 155, 192)'
      };
      transform: scale(1.2);
    }
    
    &.expanded {
      color: ${({ theme }) => theme.mode === 'light' 
        ? '#1565C0'
        : '#569cd6'
      };
      font-size: 16px;
    }
    
    &.collapsed {
      color: ${({ theme }) => theme.mode === 'light' 
        ? '#7B1FA2'
        : 'rgb(174, 129, 255)'
      };
      font-size: 18px;
    }
  }
  .vjs-icon-leaf {
    color: ${({ theme }) => theme.mode === 'light' 
      ? 'rgba(0, 0, 0, 0.3)'
      : 'rgba(255, 255, 255, 0.3)'
    };
    font-size: 10px;
  }
  .vjs-key {
    color: ${({ theme }) => theme.mode === 'light' 
      ? '#0b574d'
      : '#fff'
    };
    font-weight: 500;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    padding: 2px 4px;
    border-radius: 3px;
    white-space: nowrap;
    
    &:hover {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(25, 118, 210, 0.1)'
        : 'rgba(86, 156, 214, 0.3)'
      };
      color: ${({ theme }) => theme.mode === 'light' 
        ? '#0D47A1'
        : '#7bb3f0'
      };
    }
    
    &:active {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(25, 118, 210, 0.2)'
        : 'rgba(86, 156, 214, 0.5)'
      };
    }
  }
  .vjs-colon {
    margin: 0 6px;
    color: ${({ theme }) => theme.colors.textPrimary};
    opacity: 0.8;
  }
  .vjs-value {
    color: ${({ theme }) => theme.colors.textPrimary};
    word-break: break-word;
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    padding: 2px 4px;
    border-radius: 3px;
    white-space: pre-wrap;
    line-height: 1.4;
    
    &:hover {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(25, 118, 210, 0.1)'
        : 'rgba(86, 156, 214, 0.2)'
      };
      color: ${({ theme }) => theme.mode === 'light' 
        ? '#0D47A1'
        : '#7bb3f0'
      };
    }
    
    &:active {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(25, 118, 210, 0.2)'
        : 'rgba(86, 156, 214, 0.4)'
      };
    }
  }
  .vjs-value-string {
    color: ${({ theme }) => theme.mode === 'light' 
      ? '#E65100'
      : '#f39c12'
    };
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    padding: 2px 4px;
    border-radius: 3px;
    white-space: pre-wrap;
    line-height: 1.4;
    word-break: break-word;
    
    &:hover {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(230, 81, 0, 0.1)'
        : 'rgba(243, 156, 18, 0.2)'
      };
      color: ${({ theme }) => theme.mode === 'light' 
        ? '#BF360C'
        : '#f5c842'
      };
    }
    
    &:active {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(230, 81, 0, 0.2)'
        : 'rgba(243, 156, 18, 0.3)'
      };
    }
  }
  .vjs-value-number {
    color: ${({ theme }) => theme.mode === 'light' 
      ? '#2E7D32'
      : 'rgb(166, 226, 46)'
    };
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    padding: 2px 4px;
    border-radius: 3px;
    
    &:hover {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(46, 125, 50, 0.1)'
        : 'rgba(166, 226, 46, 0.2)'
      };
      color: ${({ theme }) => theme.mode === 'light' 
        ? '#1B5E20'
        : 'rgb(186, 246, 66)'
      };
    }
    
    &:active {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(46, 125, 50, 0.2)'
        : 'rgba(166, 226, 46, 0.3)'
      };
    }
  }
  .vjs-value-boolean {
    color: ${({ theme }) => theme.mode === 'light' 
      ? '#1976D2'
      : '#3498db'
    };
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    padding: 2px 4px;
    border-radius: 3px;
    
    &:hover {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(25, 118, 210, 0.1)'
        : 'rgba(52, 152, 219, 0.2)'
      };
      color: ${({ theme }) => theme.mode === 'light' 
        ? '#0D47A1'
        : '#5dade2'
      };
    }
    
    &:active {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(25, 118, 210, 0.2)'
        : 'rgba(52, 152, 219, 0.3)'
      };
    }
  }
  .vjs-value-null {
    color: ${({ theme }) => theme.mode === 'light' 
      ? '#757575'
      : '#95a5a6'
    };
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    padding: 2px 4px;
    border-radius: 3px;
    
    &:hover {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(117, 117, 117, 0.1)'
        : 'rgba(149, 165, 166, 0.2)'
      };
      color: ${({ theme }) => theme.mode === 'light' 
        ? '#424242'
        : '#bdc3c7'
      };
    }
    
    &:active {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(117, 117, 117, 0.2)'
        : 'rgba(149, 165, 166, 0.3)'
      };
    }
  }
  .vjs-value-object {
    color: ${({ theme }) => theme.mode === 'light' 
      ? '#D32F2F'
      : '#e74c3c'
    };
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    padding: 2px 4px;
    border-radius: 3px;
    
    &:hover {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(211, 47, 47, 0.1)'
        : 'rgba(231, 76, 60, 0.2)'
      };
      color: ${({ theme }) => theme.mode === 'light' 
        ? '#B71C1C'
        : '#ec7063'
      };
    }
    
    &:active {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(211, 47, 47, 0.2)'
        : 'rgba(231, 76, 60, 0.3)'
      };
    }
  }
  .vjs-expandable {
    color: ${({ theme }) => theme.mode === 'light' 
      ? '#D32F2F'
      : '#e74c3c'
    };
    cursor: pointer;
    user-select: none;
    transition: all 0.2s ease;
    padding: 2px 4px;
    border-radius: 3px;
    
    &:hover {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(211, 47, 47, 0.1)'
        : 'rgba(231, 76, 60, 0.2)'
      };
      color: ${({ theme }) => theme.mode === 'light' 
        ? '#B71C1C'
        : '#ec7063'
      };
    }
    
    &:active {
      background-color: ${({ theme }) => theme.mode === 'light' 
        ? 'rgba(211, 47, 47, 0.2)'
        : 'rgba(231, 76, 60, 0.3)'
      };
    }
  }
  .vjs-bracket {
    color: ${({ theme }) => theme.colors.textPrimary};
    opacity: 0.6;
    margin-left: 4px;
  }
  .vjs-comma {
    color: ${({ theme }) => theme.colors.textPrimary};
    opacity: 0.6;
    margin-left: 2px;
  }
  [draggable="true"] {
    transition: all 0.2s ease;
    
    &:active {
      opacity: 0.7;
      transform: scale(0.98);
    }
  }
  .copied {
    background: rgba(46, 204, 113, 0.3);
    border-color: #2ecc71;
    animation: pulse 0.5s;
  }
`;

interface TreeNodeProps {
  nodeKey: string;
  value: any;
  level: number;
  isLast: boolean;
  parentPath: string;
  isArrayItem?: boolean;
  onToggle: () => void;
  isExpanded: boolean;
  nodeId?: any;
  draggable?: boolean;
}

// TreeNode component
const TreeNode = React.memo<TreeNodeProps>(({
  nodeKey,
  value,
  level,
  isLast,
  parentPath,
  isArrayItem = false,
  onToggle,
  isExpanded,
  nodeId,
  draggable = true
}) => {
  const currentPath = isArrayItem ? `${nodeId}.${parentPath}[${nodeKey}]` : (parentPath ? `${nodeId}.${parentPath}.${nodeKey}` : `${nodeId}.${nodeKey}`);
  const isExpandable = typeof value === 'object' && value !== null;

  // 复制功能
  const handleCopy = useCallback((copyValue: any) => {
    const textToCopy = typeof copyValue === 'string' ? copyValue : JSON.stringify(copyValue, null, 2);
    navigator.clipboard.writeText(textToCopy).then(() => {
      console.log('Copied to clipboard:', textToCopy);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }, []);

  // 判断是否应该显示复制图标
  const shouldShowCopyIcon = useCallback(() => {
    // 只在有值的行显示复制图标：
    // 1. 对象/数组的开始行（包含开括号的行）
    // 2. 叶子节点行（键值对）
    // 不在闭合括号行显示（第5行和第6行）
    return isExpandable || !isExpandable;
  }, [isExpandable]);

  // 获取要复制的值
  const getCopyValue = useCallback(() => {
    if (level === 0 && isExpandable && isExpanded) {
      // 第一行：复制整个对象
      return value;
    }
    if (isExpandable && isExpanded) {
      // 对象开始行：复制该对象的完整键值对
      return { [nodeKey]: value };
    }
    if (isExpandable && !isExpanded) {
      // 折叠的对象：复制键值对
      return { [nodeKey]: value };
    }
    if (!isExpandable) {
      // 叶子节点：复制键值对格式
      return { [nodeKey]: value };
    }
    return value;
  }, [nodeKey, value, isExpandable, isExpanded, level]);

  const renderIndent = (isLastChild: boolean = false) => {
    const indentElements = [];
    for (let i = 0; i < level; i++) {
      const isLastLevel = i === level - 1;
      const className = isLastLevel && isLastChild ? 'vjs-indent-line last-child' : 'vjs-indent-line';
      indentElements.push(<span key={i} className={className} />);
    }
    return indentElements;
  };

  const renderIcon = () => {
    if (isExpandable) {
      return (
        <span
          className={`vjs-icon vjs-icon-toggle ${isExpanded ? 'expanded' : 'collapsed'}`}
          onClick={onToggle}
        >
          {isExpanded ? '⊖' : '⊕'}
        </span>
      );
    }
    return <span className="vjs-icon vjs-icon-leaf">•</span>;
  };

  const getValueClass = () => {
    const type = typeof value;
    if (value === null) return 'vjs-value-null';
    if (type === 'string') return 'vjs-value-string';
    if (type === 'number') return 'vjs-value-number';
    if (type === 'boolean') return 'vjs-value-boolean';
    if (type === 'object') return 'vjs-value-object';
    return 'vjs-value';
  };

  const getDisplayValue = () => {
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      const summary = Array.isArray(value)
        ? `Array(${value.length})`
        : `Object(${keys.length})`;
      return summary;
    }
    return String(value);
  };

  const displayValue = getDisplayValue();

  // 辅助函数：根据 draggable 属性返回拖拽相关的 props
  const getDragProps = (dragPath: string) => {
    if (!draggable) {
      return { draggable: false };
    }
    return {
      draggable: true,
      ...createDragHandlers(dragPath)
    };
  };

  const createDragHandlers = (dragPath: string) => ({
    onDragStart: (e: React.DragEvent) => {
      // 检查拖拽目标是否为受限制的输入框
      const checkForRestrictedInput = (element: Element | null): boolean => {
        if (!element) return false;

        // 检查当前元素是否有 data-no-json-drop 属性
        if (element.hasAttribute('data-no-json-drop')) {
          return true;
        }

        // 递归检查父元素
        return checkForRestrictedInput(element.parentElement);
      };

      // 监听整个拖拽过程
      const handleDragOver = (event: Event) => {
        const dragEvent = event as DragEvent;
        const target = dragEvent.target as Element;

        if (checkForRestrictedInput(target)) {
          dragEvent.preventDefault();
          dragEvent.stopPropagation();
          if (dragEvent.dataTransfer) {
            dragEvent.dataTransfer.dropEffect = 'none';
          }
        }
      };

      // 临时添加全局拖拽监听
      document.addEventListener('dragover', handleDragOver);

      // 清理监听器
      const cleanup = () => {
        document.removeEventListener('dragover', handleDragOver);
        document.removeEventListener('dragend', cleanup);
      };

      document.addEventListener('dragend', cleanup);

      const plainData = `{{ $.${dragPath} }}`;
      const noBracesData = `$.${dragPath}`;
      const jsonData = JSON.stringify({
        type: 'json-path',
        path: dragPath,
        value: dragPath,
        noBraces: noBracesData
      });

      e.dataTransfer.setData('text/plain', plainData);
      e.dataTransfer.setData('text/plain-no-braces', noBracesData);
      e.dataTransfer.setData('application/json', jsonData);
      e.dataTransfer.effectAllowed = 'copy';

      e.stopPropagation();
    }
  });

  // 数组项渲染
  if (isArrayItem && isExpandable) {
    if (isExpanded) {
      return (
        <div className="vjs-tree-node">
          <div className="vjs-indent">
            {renderIndent(isLast)}
          </div>
          {renderIcon()}
          <span
            className="vjs-key"
            {...getDragProps(currentPath)}
          >
            {nodeKey}
          </span>
          <span className="vjs-colon">: </span>
          <span className="vjs-bracket">
            {Array.isArray(value) ? '[' : '{'}
          </span>
          {shouldShowCopyIcon() && (
            <PiCopyDuotone
              className="copy-icon"
              onClick={() => handleCopy(getCopyValue())}
            />
          )}
        </div>
      );
    } else {
      return (
        <div className="vjs-tree-node">
          <div className="vjs-indent">
            {renderIndent(isLast)}
          </div>
          {renderIcon()}
          <span
            className="vjs-key"
            {...getDragProps(currentPath)}
          >
            {nodeKey}
          </span>
          <span className="vjs-colon">: </span>
          <span
            className="vjs-expandable"
            onClick={onToggle}
            {...getDragProps(currentPath)}
          >
            {displayValue}
          </span>
          {!isLast && <span className="vjs-comma">,</span>}
          {shouldShowCopyIcon() && (
            <PiCopyDuotone
              className="copy-icon"
              onClick={() => handleCopy(getCopyValue())}
            />
          )}
        </div>
      );
    }
  }

  // 数组项叶子节点
  if (isArrayItem) {
    return (
      <div className="vjs-tree-node">
        <div className="vjs-indent">
          {renderIndent(isLast)}
        </div>
        {renderIcon()}
        <span
          className={getValueClass()}
        >
          {displayValue}
        </span>
        {!isLast && <span className="vjs-comma">,</span>}
        {shouldShowCopyIcon() && (
          <PiCopyDuotone
            className="copy-icon"
            onClick={() => handleCopy(getCopyValue())}
          />
        )}
      </div>
    );
  }

  // 普通属性渲染
  if (isExpandable && isExpanded) {
    return (
      <div className="vjs-tree-node">
        <div className="vjs-indent">
          {renderIndent(isLast)}
        </div>
        {renderIcon()}
        <span
          className="vjs-key"
          {...getDragProps(currentPath)}
        >
          "{nodeKey}"
        </span>
        <span className="vjs-colon">: </span>
        <span className="vjs-bracket">
          {Array.isArray(value) ? '[' : '{'}
        </span>
        {shouldShowCopyIcon() && (
          <PiCopyDuotone
            className="copy-icon"
            onClick={() => handleCopy(getCopyValue())}
          />
        )}
      </div>
    );
  }

  if (isExpandable) {
    return (
      <div className="vjs-tree-node">
        <div className="vjs-indent">
          {renderIndent(isLast)}
        </div>
        {renderIcon()}
        <span
          className="vjs-key"
          {...getDragProps(currentPath)}
        >
          "{nodeKey}"
        </span>
        <span className="vjs-colon">: </span>
        <span
          className="vjs-expandable"
          onClick={onToggle}
          {...getDragProps(currentPath)}
        >
          {displayValue}
        </span>
        {!isLast && <span className="vjs-comma">,</span>}
        {shouldShowCopyIcon() && (
          <PiCopyDuotone
            className="copy-icon"
            onClick={() => handleCopy(getCopyValue())}
          />
        )}
      </div>
    );
  }

  // 叶子节点
  return (
    <div className="vjs-tree-node">
      <div className="vjs-indent">
        {renderIndent(isLast)}
      </div>
      {renderIcon()}
      <span
        className="vjs-key"
        {...getDragProps(currentPath)}
      >
        "{nodeKey}"
      </span>
      <span className="vjs-colon">: </span>
      <span
        className={getValueClass()}
      >
        {displayValue}
      </span>
      {!isLast && <span className="vjs-comma">,</span>}
      {shouldShowCopyIcon() && (
        <PiCopyDuotone
          className="copy-icon"
          onClick={() => handleCopy(getCopyValue())}
        />
      )}
    </div>
  );
});

interface JsonTreeProps {
  data: any;
  nodeId?: any;
  initialExpandDepth?: number;
  draggable?: boolean;
}

// JSON树主组件
export const JsonTree = React.memo<JsonTreeProps>(({
  data,
  nodeId,
  initialExpandDepth = 2,
  draggable = true
}) => {
  const { theme } = useTheme();
  const getInitialExpandedKeys = useCallback(() => {
    const keys = new Set<string>();
    const addKeys = (obj: any, path: string, depth: number) => {
      if (depth > initialExpandDepth || typeof obj !== 'object' || obj === null) return;

      keys.add(path);

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            addKeys(item, `${path}[${index}]`, depth + 1);
          }
        });
      } else {
        Object.keys(obj).forEach(key => {
          const newPath = path ? `${path}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            addKeys(obj[key], newPath, depth + 1);
          }
        });
      }
    };

    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'object' && data[key] !== null) {
        addKeys(data[key], key, 1);
      }
    });

    return keys;
  }, [data, initialExpandDepth]);

  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => getInitialExpandedKeys());

  const toggleExpand = useCallback((key: string) => {
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const renderNode = useCallback((
    key: string,
    value: any,
    level: number,
    isLast: boolean,
    parentPath: string,
    isArrayItem: boolean = false
  ): React.ReactNode => {
    const currentPath = parentPath ? `${parentPath}.${key}` : key;
    const nodeKey = isArrayItem ? `${parentPath}[${key}]` : currentPath;
    const isExpanded = expandedKeys.has(nodeKey);
    const isExpandable = typeof value === 'object' && value !== null;

    const node = (
      <TreeNode
        key={nodeKey}
        nodeKey={key}
        value={value}
        level={level}
        isLast={isLast && (!isExpandable || !isExpanded)}
        parentPath={parentPath}
        isArrayItem={isArrayItem}
        onToggle={() => toggleExpand(nodeKey)}
        isExpanded={isExpanded}
        nodeId={nodeId}
        draggable={draggable}
      />
    );

    if (isExpandable && isExpanded) {
      const children = Array.isArray(value)
        ? value.map((item, index) =>
          renderNode(index.toString(), item, level + 1, index === value.length - 1, nodeKey, true)
        )
        : Object.keys(value).map((k, index, arr) =>
          renderNode(k, value[k], level + 1, index === arr.length - 1, nodeKey, false)
        );

      // 闭合括号行不显示复制图标
      const closingBracket = (
        <div key={`${nodeKey}-close`} className="vjs-tree-node">
          <div className="vjs-indent">
            {Array.from({ length: level }, (_, i) => (
              <span key={i} className={i === level - 1 && isLast ? "vjs-indent-line last-child" : "vjs-indent-line"} />
            ))}
          </div>
          <span className="vjs-icon vjs-icon-leaf">•</span>
          <span className="vjs-bracket">
            {Array.isArray(value) ? ']' : '}'}
          </span>
          {!isLast && <span className="vjs-comma">,</span>}
        </div>
      );

      return (
        <React.Fragment key={nodeKey}>
          {node}
          {children}
          {closingBracket}
        </React.Fragment>
      );
    }

    return node;
  }, [expandedKeys, toggleExpand, nodeId, draggable]);

  return (
    <JsonTreeContainer>
      <div className="json-tree">
        {Object.keys(data).map((key, index, arr) =>
          renderNode(key, data[key], 0, index === arr.length - 1, '', false)
        )}
      </div>
    </JsonTreeContainer>
  );
});