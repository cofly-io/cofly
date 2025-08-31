'use client';
import { forwardRef, useState } from 'react'
import styled from 'styled-components'

// 输入框属性接口定义
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  multiline?: boolean
  rows?: number
  description?: string
  error?: string
  label?: string
  loading?: boolean
}

// 样式组件定义
const InputWrapper = styled.div`
  width: 100%;
`
const BaseInput = styled.input<{ $hasError?: boolean, $isDragOver?: boolean }>`
  width: 100%;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.panel.ctlBorder};
  border-radius:3px;
  padding: 0 12px;
  font-size: 12px;
  background: ${({ theme }) => theme.panel.nodeBg};
  color: ${({ theme }) => theme.mode === 'dark' ? '#f8fafc' : '#0f172a'};
  &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.6)'
      : 'rgba(59, 130, 246, 0.5)'
    };
      box-shadow: ${({ theme }) => theme.mode === 'dark'
      ? '0 0 20px rgba(59, 130, 246, 0.3)'
      : '0 0 20px rgba(59, 130, 246, 0.2)'
    };
  }

  /* 移除默认的invalid样式，只在显式添加error类时显示红色边框 */
  &::invalid:not(.touched) {
    border-color: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.3)'
    : 'rgba(59, 130, 246, 0.2)'
  };
    box-shadow: none;
  }

  &.error, &:invalid.touched {
    border-color: #e53935;
    box-shadow: 0 0 15px rgba(229, 57, 53, 0.3);
  }

  &::placeholder {
    color: ${({ theme }) => theme.mode === 'dark' ? '#64748b' : '#94a3b8'};
  }
`

const BaseTextArea = styled.textarea<{ $hasError?: boolean, $isDragOver?: boolean }>`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${({ theme, $hasError, $isDragOver }) =>
    $hasError ? theme.colors.error :
      $isDragOver ? theme.colors.accent :
        theme.colors.border
  };
  border-radius: 4px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme, $isDragOver }) =>
    $isDragOver ? `${theme.colors.accent}10` : theme.colors.inputBg
  };
  transition: all 0.2s ease;
  outline: none;
  resize: vertical;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textTertiary};
    font-size: 14px;
  }

  &:hover {
    border-color: ${({ theme, $hasError }) => $hasError ? theme.colors.error : theme.colors.borderHover};
  }

  &:focus {
    border-color: ${({ theme, $hasError }) => $hasError ? theme.colors.error : theme.colors.accent};
    box-shadow: 0 0 0 2px ${({ theme, $hasError }) =>
    $hasError
      ? 'rgba(255, 77, 79, 0.1)'
      : `${theme.colors.accent}20`
  };
    outline: none;
    /* 强制显示光标 */
    caret-color: ${({ theme }) => theme.colors.textPrimary} !important;
    /* 确保光标可见性 */
    -webkit-text-fill-color: ${({ theme }) => theme.colors.textPrimary};
    text-fill-color: ${({ theme }) => theme.colors.textPrimary};
  }

  &::selection {
    background-color: ${({ theme }) => theme.colors.accent}40;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  
  &::-moz-selection {
    background-color: ${({ theme }) => theme.colors.accent}40;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.borderLight};
    color: ${({ theme }) => theme.colors.textTertiary};
    cursor: not-allowed;
    
    &::placeholder {
      color: ${({ theme }) => theme.colors.textTertiary};
    }
  }
`

const HelperText = styled.p<{ $isError?: boolean }>`
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: ${({ theme, $isError }) =>
    $isError ? theme.colors.error : theme.colors.textSecondary
  };
`

// 输入框组件
export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ multiline, rows = 3, description, error, label, onChange, value, loading, ...props }, ref) => {
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
        const target = e.target as HTMLInputElement;
        target.focus(); // 确保获得焦点

        // 根据鼠标X位置计算字符位置
        const rect = target.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;

        // 使用canvas测量文本来精确计算位置
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          const computedStyle = window.getComputedStyle(target);
          context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`;

          const text = target.value;
          let position = 0;

          // 遍历每个字符找到最接近的位置
          for (let i = 0; i <= text.length; i++) {
            const textWidth = context.measureText(text.substring(0, i)).width;
            const paddingLeft = parseInt(computedStyle.paddingLeft, 10) || 12;

            if (textWidth + paddingLeft >= relativeX) {
              position = i;
              break;
            }
            position = i;
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
      const jsonData = e.dataTransfer.getData('application/json');

      if (droppedText && droppedText.includes('{{') && onChange) {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;

        // 立即获得焦点并获取光标位置
        target.focus();
        const cursorPos = target.selectionStart || target.value.length || 0;
        const currentValue = (value as string) || '';

        // 在光标位置插入拖拽的文本
        const newValue = currentValue.slice(0, cursorPos) + droppedText + currentValue.slice(cursorPos);

        // 创建模拟的change事件
        const mockEvent = {
          target: { value: newValue }
        } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

        try {
          onChange(mockEvent);

          // 强制设置新的光标位置和焦点
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
          console.error('Input: Error calling onChange', error);
        }
      }
    };

    const dragEvents = {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop
    };

    return (
      <InputWrapper>
        {multiline ? (
          <BaseTextArea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            rows={rows}
            $hasError={!!error}
            $isDragOver={isDragOver}
            value={value}
            onChange={onChange}
            onKeyDown={props.onKeyDown}
            {...dragEvents}
            {...props}
          />
        ) : (
          <BaseInput
            ref={ref as React.RefObject<HTMLInputElement>}
            $hasError={!!error}
            $isDragOver={isDragOver}
            value={value}
            onChange={onChange}
            onKeyDown={props.onKeyDown}
            {...dragEvents}
            {...props}
          />
        )}

        {(description || error) && (
          <HelperText $isError={!!error}>
            {error || description}
          </HelperText>
        )}
      </InputWrapper>
    )
  }
)

Input.displayName = 'Input'
