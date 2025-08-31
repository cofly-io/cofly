'use client';

import React, { useState, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
// @ts-ignore
import { shell } from '@codemirror/legacy-modes/mode/shell';
import styled, { useTheme } from 'styled-components';

// Shell语法高亮扩展
const shellExtension = StreamLanguage.define(shell);

const CommandEditorContainer = styled.div<{ $isDragOver?: boolean; $height?: string; $hasError?: boolean }>`
  position: relative;
  border: 1px solid ${({ theme, $isDragOver, $hasError }) =>
    $hasError ? '#8B0000' : ($isDragOver ? theme.colors.accent : theme.panel.ctlBorder)
  };
  /*background: ${({ theme, $isDragOver }) =>
    $isDragOver ? `${theme.colors.accent}10` : theme.panel.nodeBg
  };*/
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  transition: all 0.2s ease;
  
  .cm-editor {
    height: ${({ $height }) => $height || '180px'};
    overflow-y: auto;
  }
  
  .cm-scroller {
    max-height: inherit;
  }
`;

const ExpandButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: ${({ theme }) => theme.colors.buttonBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  z-index: 10;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.buttonHover};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const ModalOverlay = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: ${({ $visible }) => $visible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
  animation: ${({ $visible }) => $visible ? 'fadeIn 0.2s ease-out' : 'none'};
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      backdrop-filter: blur(0px);
    }
    to {
      opacity: 1;
      backdrop-filter: blur(4px);
    }
  }
`;

const ModalContainer = styled.div<{ $visible: boolean }>`
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  width: 95vw;
  height: 90vh;
  max-width: 1400px;
  max-height: 900px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  transform: ${({ $visible }) => $visible ? 'scale(1) translateY(0)' : 'scale(0.98) translateY(10px)'};
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.headerBg};
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.buttonHover};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const ModalContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 24px 16px;
  min-height: 0;
`;

const EditorWrapper = styled.div<{ $isDragOver?: boolean }>`
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${({ theme, $isDragOver }) =>
    $isDragOver ? theme.colors.accent : theme.colors.border
  };
  background: ${({ theme, $isDragOver }) =>
    $isDragOver ? `${theme.colors.accent}10` : 'transparent'
  };
  transition: all 0.2s ease;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px 20px;
  justify-content: flex-end;
  background: ${({ theme }) => theme.colors.headerBg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 6px;
  border: 1px solid ${({ theme, $primary }) => $primary ? theme.colors.accent : theme.colors.border};
  background: ${({ theme, $primary }) => $primary ? theme.colors.accent : theme.colors.buttonBg};
  color: ${({ theme, $primary }) => $primary ? theme.colors.secondary : theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  min-width: 80px;
  
  &:hover {
    transform: translateY(-1px);
    background: ${({ theme, $primary }) => $primary ? theme.colors.accentHover : theme.colors.buttonHover};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const StatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.headerBg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const HelpText = styled.div`
  margin-bottom: 12px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.tertiary};
  border-radius: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-left: 3px solid ${({ theme }) => theme.colors.accent};
`;

interface CommandEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
  onExpandModeChange?: (expanded: boolean) => void;
  placeholder?: string;
  hasError?: boolean;
}

// 命令输入编辑器组件
export const CmdCode: React.FC<CommandEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  height = '180px',
  onExpandModeChange,
  placeholder = '请输入命令...',
  hasError = false
}) => {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState(value);
  const [lineCount, setLineCount] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const editorRef = useRef<any>(null);
  const modalEditorRef = useRef<any>(null);

  const handleExpandClick = () => {
    setModalValue(value);
    setIsModalOpen(true);
    onExpandModeChange?.(true);
  };

  const handleModalSave = () => {
    if (onChange) {
      onChange(modalValue);
    }
    setIsModalOpen(false);
    onExpandModeChange?.(false);
  };

  const handleModalCancel = () => {
    setModalValue(value); // 重置为原始值
    setIsModalOpen(false);
    onExpandModeChange?.(false);
  };

  const handleModalValueChange = (newValue: string) => {
    setModalValue(newValue);
    setLineCount(newValue.split('\n').length);
  };

  // 拖拽处理函数
  const handleDragOver = (e: React.DragEvent) => {
    const hasJsonPath = e.dataTransfer.types.includes('text/plain') &&
      e.dataTransfer.types.includes('application/json');

    if (hasJsonPath) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOver(true);

      // 获取 CodeMirror 实例并动态更新光标位置
      const currentEditor = isModalOpen ? modalEditorRef.current : editorRef.current;

      if (currentEditor && currentEditor.view) {
        const view = currentEditor.view;

        // 获取鼠标在编辑器中的位置
        const dom = view.dom;
        const rect = dom.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 使用 CodeMirror 的 posAtCoords API 获取鼠标位置对应的文档位置
        const pos = view.posAtCoords({ x: e.clientX, y: e.clientY });

        if (pos !== null) {
          // 设置光标位置到鼠标位置
          view.dispatch({
            selection: { anchor: pos, head: pos }
          });

          // 确保编辑器获得焦点
          view.focus();
        }
      }
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    const relatedTarget = e.relatedTarget as HTMLElement;

    if (!target.contains(relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedText = e.dataTransfer.getData('text/plain');

    if (droppedText && droppedText.includes('{{') && onChange) {
      const currentValue = isModalOpen ? modalValue : value;

      // 检查文本是否已经存在，避免重复插入
      if (currentValue.includes(droppedText)) {
        return;
      }

      // 获取 CodeMirror 实例
      const currentEditor = isModalOpen ? modalEditorRef.current : editorRef.current;

      if (currentEditor) {
        const view = currentEditor.view;

        if (view) {
          // 获取当前光标位置
          const cursorPos = view.state.selection.main.head;

          // 计算新值
          const newValue = currentValue.slice(0, cursorPos) + droppedText + currentValue.slice(cursorPos);

          // 只通过 onChange/setValue 更新值，让 CodeMirror 自然响应
          if (isModalOpen) {
            setModalValue(newValue);
          } else {
            onChange(newValue);
          }

          // 设置光标位置到插入文本之后
          setTimeout(() => {
            const newCursorPos = cursorPos + droppedText.length;
            view.dispatch({
              selection: { anchor: newCursorPos, head: newCursorPos }
            });
          }, 0);
        }
      }
    }
  };

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleModalSave();
      }

      if (e.key === 'Escape') {
        handleModalCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, modalValue]);

  // 阻止模态窗口外部滚动
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <>
      <CommandEditorContainer
        $isDragOver={isDragOver}
        $height={height}
        $hasError={hasError}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CodeMirror
          ref={editorRef}
          value={value}
          onChange={(val) => onChange?.(val)}
          readOnly={readOnly}
          height="auto"
          extensions={[shellExtension]}
          theme={theme.mode === 'dark' ? 'dark' : 'light'}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            autocompletion: true,
            foldGutter: true,
            syntaxHighlighting: true,
            dropCursor: false // 禁用拖拽光标
          }}
          placeholder={placeholder}
          style={{
            fontSize: '14px',
            borderRadius: '4px',
            height: '100%'
          }}
        />
        {!readOnly && (
          <ExpandButton onClick={handleExpandClick} title="在大窗口中编辑">
            ⛶
          </ExpandButton>
        )}
      </CommandEditorContainer>

      <ModalOverlay $visible={isModalOpen} onClick={handleModalCancel}>
        <ModalContainer $visible={isModalOpen} onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>命令编辑器</ModalTitle>
            <CloseButton onClick={handleModalCancel}>×</CloseButton>
          </ModalHeader>

          <ModalContent>
            <HelpText>
              💡 提示：可以输入多行命令，每行一个命令。支持常见的shell命令，如：ls, cd, echo, npm, git等
            </HelpText>
            <EditorWrapper
              $isDragOver={isDragOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CodeMirror
                ref={modalEditorRef}
                value={modalValue}
                onChange={handleModalValueChange}
                height="100%"
                extensions={[shellExtension]}
                theme={theme.mode === 'dark' ? 'dark' : 'light'}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  autocompletion: true,
                  foldGutter: true,
                  syntaxHighlighting: true,
                  searchKeymap: true,
                  closeBrackets: true,
                  bracketMatching: true,
                  dropCursor: false // 禁用拖拽光标
                }}
                placeholder={placeholder}
                style={{
                  fontSize: '16px',
                  height: '100%'
                }}
              />
            </EditorWrapper>
          </ModalContent>

          <StatusBar>
            <span>行数: {lineCount}</span>
            <span>Ctrl+S 保存 • Esc 取消</span>
          </StatusBar>

          <ModalButtons>
            <Button onClick={handleModalCancel}>取消</Button>
            <Button $primary onClick={handleModalSave}>保存</Button>
          </ModalButtons>
        </ModalContainer>
      </ModalOverlay>
    </>
  );
};