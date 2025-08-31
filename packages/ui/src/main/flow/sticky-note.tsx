"use client";

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer, NodeToolbar, Position } from 'reactflow';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { FiEdit3, FiTrash2, FiMoreHorizontal } from 'react-icons/fi';
import { MdColorLens } from 'react-icons/md';

// Sticky Note颜色选项
const STICKY_COLORS = [
  '#8B7355', // 默认棕色 
  '#7B6B47', // 橄榄绿
  '#8B4B5C', // 深红
  '#4B7B5C', // 绿色
  '#4B5B8B', // 蓝色
  '#6B4B8B', // 紫色
  '#5B5B5B', // 灰色
];

// 外层包装容器，用于显示操作按钮
const StickyWrapper = styled.div`
  position: relative;
  display: flex;
  height: 100%;  
  overflow: hidden;
  
  /* 优化拖拽体验 */
  .react-flow__resize-control {
    cursor: nw-resize !important;
    
    &.top {
      cursor: n-resize !important;
    }
    
    &.bottom {
      cursor: s-resize !important;
    }
    
    &.left {
      cursor: w-resize !important;
    }
    
    &.right {
      cursor: e-resize !important;
    }
    
    &.top.left {
      cursor: nw-resize !important;
    }
    
    &.top.right {
      cursor: ne-resize !important;
    }
    
    &.bottom.left {
      cursor: sw-resize !important;
    }
    
    &.bottom.right {
      cursor: se-resize !important;
    }
  }
  
  .react-flow__resize-control:hover {
    opacity: 1 !important;
  }
`;

const StickyContainer = styled.div<{ $color: string; $isEditing: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  background: ${props => props.$color};
  border-radius: 2px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: ${props => props.$isEditing ? 'text' : 'grab'};
  overflow: hidden;
  box-sizing: border-box;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    cursor: ${props => props.$isEditing ? 'text' : 'grabbing'};
  }
`;

const StickyContent = styled.div`
  color: white;
  font-size: 10px;
  line-height: 1.5;
  word-wrap: break-word;
  
  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 8px 0;
    color: white;
  }
  
  p {
    margin: 0 0 8px 0;
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul, ol {
    margin: 0 0 8px 16px;
    padding: 0;
  }
  
  li {
    margin-bottom: 4px;
  }
  
  code {
    background: rgba(0, 0, 0, 0.2);
    padding: 2px 4px;
    border-radius: 3px;
  }
  
  pre {
    background: rgba(0, 0, 0, 0.2);
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
    
    code {
      background: none;
      padding: 0;
    }
  }
  
  blockquote {
    border-left: 3px solid rgba(255, 255, 255, 0.3);
    margin: 0 0 8px 0;
    padding-left: 12px;
    font-style: italic;
  }
  
  a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: underline;
  }
`;

const StickyEditor = styled.textarea`
  width: 100%;
  height: 100%;
  min-height: 120px;
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 8px;
  color: white;
  font-size: 14px;
  line-height: 1.5;
  resize: none; /* 禁用textarea自己的resize，使用容器的resize */
  outline: none;
  box-sizing: border-box;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(0, 0, 0, 0.15);
  }
`;

const StickyActions = styled.div`
  display: flex;
  gap: 4px;
  transition: all 0.2s ease;
  z-index: 10;
`;

const ColorPalette = styled.div`
  position: absolute;
  top: -50px;
  right: 0;
  display: flex;
  gap: 6px;
  background: rgba(0, 0, 0, 0.9);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 20;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 16px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid rgba(0, 0, 0, 0.9);
  }
`;

const ColorOption = styled.div<{ $color: string; $isSelected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.$color};
  cursor: pointer;
  border: 2px solid ${props => props.$isSelected ? 'white' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
    border-color: rgba(255, 255, 255, 0.7);
  }
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.05);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const EditHint = styled.div`
  position: absolute;
  bottom: 8px;
  right: 12px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
`;

export interface StickyNoteData {
  content: string;
  color: string;
  onUpdate?: (id: string, data: Partial<StickyNoteData>) => void;
  onDelete?: (id: string) => void;
}

export interface StickyNoteProps extends NodeProps {
  data: StickyNoteData;
  onUpdate?: (id: string, data: Partial<StickyNoteData>) => void;
  onDelete?: (id: string) => void;
}

interface StickyNoteNodeProps extends NodeProps<StickyNoteData> {
  selected: boolean;
}

export const StickyNoteComponent = ({ id, data, selected }: StickyNoteNodeProps) => {
  // 从data中提取回调函数
  const onUpdate = data?.onUpdate;
  const onDelete = data?.onDelete;
  
  // 调试日志
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [editContent, setEditContent] = useState(data?.content || '');
  
  // 当data.content变化时，同步更新editContent
  useEffect(() => {
    setEditContent(data?.content || '');
  }, [data?.content]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 双击进入编辑模式
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditContent(data?.content || '');
  }, [data?.content]);

  // 保存编辑内容
  const handleSave = useCallback(() => {
    setIsEditing(false);
    if (editContent !== data?.content) {
      console.log('💾 [StickyNote] 保存内容:', { id, editContent, hasOnUpdate: !!onUpdate });
      // 按照ReactFlow官方示例，创建新的数据对象来通知变化
      onUpdate?.(id, { content: editContent });
    }
  }, [id, editContent, data?.content, onUpdate]);

  // 取消编辑
  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditContent(data?.content || '');
  }, [data?.content]);

  // 处理键盘事件
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
    // 阻止事件冒泡，避免触发画布的快捷键
    e.stopPropagation();
  }, [handleCancel, handleSave]);

  // 编辑模式下自动聚焦
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // 点击外部区域保存
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isEditing && textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing, handleSave]);

  // 颜色变更
  const handleColorChange = useCallback((color: string) => {
    console.log('🎨 [StickyNote] 颜色变更:', { id, color, currentData: data, hasOnUpdate: !!onUpdate });
    // 按照ReactFlow官方示例，创建新的数据对象来通知变化
    onUpdate?.(id, { color });
    setShowColorPalette(false);
  }, [id, onUpdate, data]);

  // 删除便签
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  }, [id, onDelete]);

  // 切换颜色面板
  const handleToggleColorPalette = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowColorPalette(!showColorPalette);
  }, [showColorPalette]);

  // 进入编辑模式
  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditContent(data?.content || '');
  }, [data?.content]);

  // 监控data变化
  // useEffect(() => {
  //   console.log('📊 [StickyNote] Data变化:', {id, data});
  // }, [id, data]);

  const currentColor = (data?.color || STICKY_COLORS[0]) as string;
  const displayContent = data?.content || '# 我是便签\n## 这里可以记录你需要的信息\n ### [教程](https://docs.cofly-ai.com/workflows/sticky-notes/)';

  return (
    <>
      {/* ReactFlow NodeResizer */}
      <NodeResizer
        color="#ff0071"
        minWidth={300}
        minHeight={160}
        maxWidth={600}
        maxHeight={400}
        isVisible={Boolean(selected) && !isEditing}
        handleStyle={{
          backgroundColor: '#ff0071',
          border: '2px solid white',
          borderRadius: '3px',
          width: '8px',
          height: '8px',
          opacity: 0.8
        }}
        lineStyle={{
          borderColor: '#ff0071',
          borderWidth: '2px',
          opacity: 0.6
        }}
      />
      <NodeToolbar
        isVisible={Boolean(selected) && !isEditing}
        position={Position.Top}
      >
        {/* 悬停操作按钮 */}
        <StickyActions className="sticky-actions">
          {showColorPalette && (
            <ColorPalette>
              {STICKY_COLORS.map((color) => (
                <ColorOption
                  key={color}
                  $color={color}
                  $isSelected={color === currentColor}
                  onClick={() => handleColorChange(color)}
                />
              ))}
            </ColorPalette>
          )}
          <ActionButton onClick={handleToggleColorPalette} title="更改颜色">
            <MdColorLens/>
          </ActionButton>
          <ActionButton onClick={handleEdit} title="编辑">
            <FiEdit3/>
          </ActionButton>
          <ActionButton onClick={handleDelete} title="删除">
            <FiTrash2/>
          </ActionButton>
        </StickyActions>
      </NodeToolbar>
      <StickyWrapper>

        <StickyContainer
          $color={currentColor}
          $isEditing={isEditing}
          onDoubleClick={handleDoubleClick}
        >

          {/* 内容区域 */}
          {isEditing ? (
            <StickyEditor
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder="输入markdown内容..."
            />
          ) : (
            <StickyContent>
              <ReactMarkdown components={{
                a: ({ href, children, ...props }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                    {children}
                  </a>
                ),
              }}>{displayContent}</ReactMarkdown>
              {!data?.content && (
                <EditHint>双击编辑</EditHint>
              )}
            </StickyContent>
          )}
        </StickyContainer>
      </StickyWrapper>
    </>
  );
};

StickyNoteComponent.displayName = 'StickyNoteComponent';

export { STICKY_COLORS };