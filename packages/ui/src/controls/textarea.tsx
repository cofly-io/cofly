'use client';
import { forwardRef, useState } from 'react'
import styled from 'styled-components'

// Textarea属性接口定义
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  description?: string
  error?: string
  label?: string
  rows?: number
  loading?: boolean
}

// 样式组件定义
const TextAreaWrapper = styled.div`
  width: 100%;
`

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  font-weight: 500;
`

const BaseTextArea = styled.textarea<{ $hasError?: boolean, $isDragOver?: boolean }>`
  width: 100%;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  transition: all 0.2s ease;
  outline: none;
  resize: vertical;
  min-height: 80px;
  box-sizing: border-box;
  
  border: 1px solid ${({ theme, $hasError, $isDragOver }) =>
    $hasError ? '#ff4d4f' :
      $isDragOver ? (theme?.colors?.accent || '#007bff') :
        (theme?.panel?.ctlBorder || '#ddd')
  };
  background: ${({ theme, $isDragOver }) =>
    $isDragOver ? `${theme?.colors?.accent || '#007bff'}10` : (theme?.panel?.nodeBg || '#fff')
  };
  
  /* 确保在任何主题下文字都可见 */
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'} !important;
  
  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
    font-size: 12px;
  }

  &:hover {
    border-color: ${({ theme, $hasError }) => 
      $hasError ? '#ff4d4f' : (theme?.colors?.borderHover || theme?.panel?.ctlBorder || '#bbb')
    };
  }
  
  /* 增强focus状态的光标和选择可见性 */
  &:focus {
    border-color: ${({ theme, $hasError }) =>
      $hasError ? '#ff4d4f' : (theme.mode === 'dark' 
        ? 'rgba(59, 130, 246, 0.6)' 
        : 'rgba(59, 130, 246, 0.5)')
    };
    box-shadow: ${({ theme, $hasError }) =>
      $hasError
        ? '0 0 0 2px rgba(255, 77, 79, 0.1)'
        : theme.mode === 'dark'
          ? '0 0 20px rgba(59, 130, 246, 0.3)'
          : '0 0 20px rgba(59, 130, 246, 0.2)'
    };
    outline: none;
    /* 强制显示光标 */
    caret-color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'} !important;
    /* 确保光标可见性 */
    -webkit-text-fill-color: ${({ theme }) =>  theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
    text-fill-color: ${({ theme }) =>  theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  }
  
  /* 选中文本的样式 */
  &::selection {
    background-color: ${({ theme }) => '#007bff'}40;
    color: ${({ theme }) =>  theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  }
  
  &::-moz-selection {
    background-color: ${({ theme }) => theme?.colors?.accent || '#007bff'}40;
    color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  }

  &:disabled {
    background: ${({ theme }) => theme.mode === 'dark' ? '#374151' : '#f1f5f9'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#6b7280' : '#9ca3af'};
    cursor: not-allowed;
    
    &::placeholder {
      color: ${({ theme }) => theme.mode === 'dark' ? '#6b7280' : '#9ca3af'};
    }
  }
`

const HelperText = styled.p<{ $isError?: boolean }>`
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: ${props => props.$isError ? '#ff4d4f' : (props.theme.mode === 'dark' ? '#64748b' : '#6b7280')};
`

// TextArea组件
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ rows = 4, description, error, label, onChange, value, loading, ...props }, ref) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
      // 检查是否是JSON路径拖拽
      const hasJsonPath = e.dataTransfer.types.includes('text/plain') &&
        e.dataTransfer.types.includes('application/json');

      if (hasJsonPath) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragOver(true);

        // 动态更新光标位置到鼠标位置
        const target = e.target as HTMLTextAreaElement;
        target.focus(); // 确保获得焦点

        // 对于TextArea，我们需要处理多行文本
        const rect = target.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;

        // 使用canvas测量文本来计算位置
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          const computedStyle = window.getComputedStyle(target);
          context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

          const text = target.value;
          const lines = text.split('\n');
          const lineHeight = parseInt(computedStyle.lineHeight, 10) ||
            parseInt(computedStyle.fontSize, 10) * 1.2;
          const paddingTop = parseInt(computedStyle.paddingTop, 10) || 8;
          const paddingLeft = parseInt(computedStyle.paddingLeft, 10) || 12;

          // 计算当前行
          const currentLine = Math.floor((relativeY - paddingTop) / lineHeight);
          const lineIndex = Math.max(0, Math.min(currentLine, lines.length - 1));

          // 计算该行内的字符位置
          let position = 0;
          for (let i = 0; i < lineIndex; i++) {
            position += (lines[i]?.length || 0) + 1; // +1 for \n
          }

          if (lineIndex < lines.length && lines[lineIndex] !== undefined) {
            const lineText = lines[lineIndex] || '';
            let charPosition = 0;

            for (let i = 0; i <= lineText.length; i++) {
              const textWidth = context.measureText(lineText.substring(0, i)).width;
              if (textWidth + paddingLeft >= relativeX) {
                charPosition = i;
                break;
              }
              charPosition = i;
            }

            position += charPosition;
          }

          // 设置光标位置
          target.setSelectionRange(position, position);
        }
      } else {
        e.dataTransfer.dropEffect = 'none';
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      // 确保只有当鼠标真正离开元素时才触发
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

      // 验证是否是有效的JSON路径拖拽
      if (droppedText && droppedText.includes('{{') && onChange) {
        // 获取当前光标位置
        const target = e.target as HTMLTextAreaElement;

        // 立即获得焦点并获取光标位置
        target.focus();
        const cursorPos = target.selectionStart || target.value.length || 0;
        const currentValue = (value as string) || '';

        // 在光标位置插入拖拽的文本
        const newValue = currentValue.slice(0, cursorPos) + droppedText + currentValue.slice(cursorPos);

        // 创建模拟的change事件
        const mockEvent = {
          target: { value: newValue }
        } as React.ChangeEvent<HTMLTextAreaElement>;

        try {
          onChange(mockEvent);

          // 设置新的光标位置（在插入文本之后）
          const newCursorPos = cursorPos + droppedText.length;

          // 使用多重方式确保光标可见
          requestAnimationFrame(() => {
            target.focus();
            target.setSelectionRange(newCursorPos, newCursorPos);

            // 再次确认
            setTimeout(() => {
              target.focus();
              target.setSelectionRange(newCursorPos, newCursorPos);
            }, 10);
          });
        } catch (error) {
          console.error('TextArea: Error calling onChange', error);
        }
      }
    };

    const dragEvents = {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop
    };

    return (
      <TextAreaWrapper>
        {label && (
          <div>
            <Label>{label}</Label>
          </div>
        )}

        <BaseTextArea
          ref={ref}
          rows={rows}
          $hasError={!!error}
          $isDragOver={isDragOver}
          value={value}
          onChange={onChange}
          {...dragEvents}
          {...props}
        />

        {(description || error) && (
          <HelperText $isError={!!error}>
            {error || description}
          </HelperText>
        )}
      </TextAreaWrapper>
    )
  }
)

TextArea.displayName = 'TextArea'