// 参数输入组件的样式配置
import styled from 'styled-components';
import { ParameterInputVariant } from './types';

// 样式配置接口
interface VariantConfig {
  container: {
    marginBottom: string;
  };
  label: {
    fontSize: string;
    fontWeight: string;
    marginBottom: string;
    color: (theme: any) => string;
  };
  description: {
    fontSize: string;
    color: (theme: any) => string;
    marginTop?: string;
    marginBottom?: string;
  };
  input: {
    height?: string;
    padding: string;
    fontSize: string;
    borderRadius: string;
    border: (theme: any) => string;
    background: (theme: any) => string;
    color: (theme: any) => string;
    placeholderColor: (theme: any) => string;
    focusBorderColor: string | ((theme: any) => string);
    focusBoxShadow?: string;
    hoverBorderColor?: (theme: any) => string;
    disabledBackground?: (theme: any) => string;
    disabledColor?: (theme: any) => string;
  };
  required: {
    color: string;
    marginLeft: string;
  };
}

// 变体样式配置
export const variantConfigs: Record<ParameterInputVariant, VariantConfig> = {
  node: {
    container: {
      marginBottom: '6px'
    },
    label: {
      fontSize: '13px',
      fontWeight: '200',
      marginBottom: '6px',
      color: (theme: any) => theme.colors.textPrimary
    },
    description: {
      fontSize: '12px',
      color: (theme: any) => theme.colors.textTertiary
    },
    input: {
      padding: '6px',
      fontSize: '13px',
      borderRadius: '4px',
      border: (theme: any) => `1px solid ${theme.colors.border}`,
      background:(theme: any) => theme.colors.inputBg,
      color: (theme: any) => theme.colors.textPrimary,
      placeholderColor: (theme: any) => theme.colors.textTertiary,
      focusBorderColor: (theme: any) => theme.colors.accent
    },
    required: {
      color: '#ef4444',
      marginLeft: '4px'
    }
  },
  connect: {
    container: {
      marginBottom: '16px'
    },
    label: {
      fontSize: '12px',
      fontWeight: '500',
      marginBottom: '8px',
      color: (theme: any) => theme.mode === 'dark' ? '#e2e8f0' : '#ffffff'
    },
    description: {
      fontSize: '12px',
      color: (theme: any) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : '#6b7280',
      marginTop: '4px',
      marginBottom: '4px'
    },
    input: {
      height: '32px',
      padding: '0 12px',
      fontSize: '14px',
      borderRadius: '4px',
      border: (theme: any) => theme.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e0e0e010',
      background: (theme: any) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff10',
      color: (theme: any) => theme.mode === 'dark' ? '#e2e8f0' : '#ffffff',
      placeholderColor: (theme: any) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.4)' : '#9ca3af',
      focusBorderColor: '#3b82f6',
      focusBoxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      hoverBorderColor: (theme: any) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db',
      disabledBackground: (theme: any) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f9fafb',
      disabledColor: (theme: any) => theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#9ca3af'
    },
    required: {
      color: '#ef4444',
      marginLeft: '4px'
    }
  }
};

// 样式化组件
export const InputContainer = styled.div<{ $variant: ParameterInputVariant }>`
  margin-bottom: ${props => variantConfigs[props.$variant].container.marginBottom};
`;

export const Label = styled.label<{ $variant: ParameterInputVariant }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => variantConfigs[props.$variant].label.marginBottom};
  font-size: ${props => variantConfigs[props.$variant].label.fontSize};
  font-weight: ${props => variantConfigs[props.$variant].label.fontWeight};
  color: ${props => variantConfigs[props.$variant].label.color(props.theme)};
`;

export const LabelWithDelete = styled.div<{ $variant: ParameterInputVariant }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => variantConfigs[props.$variant].label.marginBottom};
`;

export const LabelText = styled.span<{ $variant: ParameterInputVariant }>`
  font-size: ${props => variantConfigs[props.$variant].label.fontSize};
  font-weight: ${props => variantConfigs[props.$variant].label.fontWeight};
  color: ${props => variantConfigs[props.$variant].label.color(props.theme)};
`;

export const DeleteButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #dc2626;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

export const Aialign = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
`;

export const Required = styled.span<{ $variant: ParameterInputVariant }>`
  color: ${props => variantConfigs[props.$variant].required.color};
  margin-left: ${props => variantConfigs[props.$variant].required.marginLeft};
`;

export const Description = styled.p<{ $variant: ParameterInputVariant; $isHint?: boolean }>`
  margin: ${props => {
    const config = variantConfigs[props.$variant].description;
    if (props.$isHint) {
      return `${config.marginTop || '0'} 0 0 0`;
    }
    return `${config.marginTop || '0'} 0 ${config.marginBottom || '0'} 0`;
  }};
  font-size: ${props => variantConfigs[props.$variant].description.fontSize};
  color: ${props => variantConfigs[props.$variant].description.color(props.theme)};
  line-height: 1.4;
  font-style: ${props => props.$isHint ? 'italic' : 'normal'};
`;

export const StyledTextInput = styled.input<{ $variant: ParameterInputVariant }>`
  width: 100%;
  ${props => props.$variant === 'connect' ? `height: ${variantConfigs[props.$variant].input.height};` : ''}
  padding: ${props => variantConfigs[props.$variant].input.padding};
  border: ${props => variantConfigs[props.$variant].input.border(props.theme)};
  border-radius: ${props => variantConfigs[props.$variant].input.borderRadius};
  font-size: ${props => variantConfigs[props.$variant].input.fontSize};
  background: ${props => variantConfigs[props.$variant].input.background(props.theme)};
  color: ${props => variantConfigs[props.$variant].input.color(props.theme)};
  transition: all 0.2s ease;
  outline: none;
  box-sizing: border-box;
  font-size:12px;

  &::placeholder {
    color: ${props => variantConfigs[props.$variant].input.placeholderColor(props.theme)};
  }

  &:focus {
    border-color: ${props => {
    const focusColor = variantConfigs[props.$variant].input.focusBorderColor;
    return typeof focusColor === 'function' ? focusColor(props.theme) : focusColor;
  }};
    ${props => props.$variant === 'connect' && variantConfigs[props.$variant].input.focusBoxShadow ?
    `box-shadow: ${variantConfigs[props.$variant].input.focusBoxShadow};` : ''}
  }

  ${props => props.$variant === 'connect' && variantConfigs[props.$variant].input.hoverBorderColor ? `
    &:hover {
      border-color: ${variantConfigs[props.$variant].input.hoverBorderColor!(props.theme)};
    }
  ` : ''}

  ${props => props.$variant === 'connect' && variantConfigs[props.$variant].input.disabledBackground ? `
    &:disabled {
      background: ${variantConfigs[props.$variant].input.disabledBackground!(props.theme)};
      color: ${variantConfigs[props.$variant].input.disabledColor!(props.theme)};
      cursor: not-allowed;
      
      &::placeholder {
        color: ${props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#d1d5db'};
      }
    }
  ` : ''}
  
  &[type="password"] {
    font-family: inherit;
  }
`;

export const StyledTextArea = styled.textarea<{ $variant: ParameterInputVariant }>`
  width: 100%;
  ${props => props.$variant === 'connect' ? `min-height: 80px;` : ''}
  padding: ${props => variantConfigs[props.$variant].input.padding};
  border: ${props => variantConfigs[props.$variant].input.border(props.theme)};
  border-radius: ${props => variantConfigs[props.$variant].input.borderRadius};
  font-size: ${props => variantConfigs[props.$variant].input.fontSize};
  background: ${props => variantConfigs[props.$variant].input.background(props.theme)};
  color: ${props => variantConfigs[props.$variant].input.color(props.theme)};
  transition: all 0.2s ease;
  outline: none;
  box-sizing: border-box;
  resize: vertical;

  &::placeholder {
    color: ${props => variantConfigs[props.$variant].input.placeholderColor(props.theme)};
  }

  &:focus {
    border-color: ${props => {
    const focusColor = variantConfigs[props.$variant].input.focusBorderColor;
    return typeof focusColor === 'function' ? focusColor(props.theme) : focusColor;
  }};
    ${props => props.$variant === 'connect' && variantConfigs[props.$variant].input.focusBoxShadow ?
    `box-shadow: ${variantConfigs[props.$variant].input.focusBoxShadow};` : ''}
  }

  ${props => props.$variant === 'connect' && variantConfigs[props.$variant].input.hoverBorderColor ? `
    &:hover {
      border-color: ${variantConfigs[props.$variant].input.hoverBorderColor!(props.theme)};
    }
  ` : ''}

  ${props => props.$variant === 'connect' && variantConfigs[props.$variant].input.disabledBackground ? `
    &:disabled {
      background: ${variantConfigs[props.$variant].input.disabledBackground!(props.theme)};
      color: ${variantConfigs[props.$variant].input.disabledColor!(props.theme)};
      cursor: not-allowed;
    }
  ` : ''}
`;

export const StyledSelect = styled.select<{ $variant: ParameterInputVariant }>`
  width: 100%;
  ${props => props.$variant === 'connect' ? `height: ${variantConfigs[props.$variant].input.height};` : ''}
  padding: ${props => variantConfigs[props.$variant].input.padding};
  border: ${props => variantConfigs[props.$variant].input.border(props.theme)};
  border-radius: ${props => variantConfigs[props.$variant].input.borderRadius};
  font-size: ${props => variantConfigs[props.$variant].input.fontSize};
  background: ${props => variantConfigs[props.$variant].input.background(props.theme)};
  color: ${props => variantConfigs[props.$variant].input.color(props.theme)};
  transition: all 0.2s ease;
  outline: none;
  cursor: pointer;
  box-sizing: border-box;

  option {
    background: ${props => props.theme.mode === 'dark' ? '#1a1a1a' : '#ffffff'};
    color: ${props => variantConfigs[props.$variant].input.color(props.theme)};
    padding: 8px 12px;
  }

  &:focus {
    border-color: ${props => {
    const focusColor = variantConfigs[props.$variant].input.focusBorderColor;
    return typeof focusColor === 'function' ? focusColor(props.theme) : focusColor;
  }};
    ${props => props.$variant === 'connect' && variantConfigs[props.$variant].input.focusBoxShadow ?
    `box-shadow: ${variantConfigs[props.$variant].input.focusBoxShadow};` : ''}
  }

  ${props => props.$variant === 'connect' && variantConfigs[props.$variant].input.hoverBorderColor ? `
    &:hover {
      border-color: ${variantConfigs[props.$variant].input.hoverBorderColor!(props.theme)};
    }
  ` : ''}

  ${props => props.$variant === 'connect' && variantConfigs[props.$variant].input.disabledBackground ? `
    &:disabled {
      background: ${variantConfigs[props.$variant].input.disabledBackground!(props.theme)};
      color: ${variantConfigs[props.$variant].input.disabledColor!(props.theme)};
      cursor: not-allowed;
    }
  ` : ''}
`;

export const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledCheckbox = styled.input<{ $variant: ParameterInputVariant }>`
  margin-right: 8px;
  ${props => props.$variant === 'connect' ? 'width: 16px; height: 16px;' : ''}
  accent-color: ${props => {
    const focusColor = variantConfigs[props.$variant].input.focusBorderColor;
    if (props.$variant === 'node') {
      return typeof focusColor === 'function' ? focusColor(props.theme) : focusColor;
    }
    return '#3b82f6';
  }};
`;

// Collection 样式组件
export const CollectionContainer = styled.div<{ $variant: ParameterInputVariant }>`
  border: 1px solid ${({ theme }) => theme.panel?.ctlBorder || '#e5e7eb'};
  border-radius: 6px;
  padding: 12px;
  margin-bottom: ${props => variantConfigs[props.$variant].container.marginBottom};
  background: ${({ theme }) => theme.panel?.nodeBg || '#ffffff'};
  position: relative;
`;

export const CollectionHeader = styled.div<{ $variant: ParameterInputVariant }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.panel?.ctlBorder || '#e5e7eb'};
`;

export const CollectionTitle = styled.h4<{ $variant: ParameterInputVariant }>`
  margin: 0;
  font-size: ${props => variantConfigs[props.$variant].label.fontSize};
  font-weight: ${props => variantConfigs[props.$variant].label.fontWeight};
  color: ${props => variantConfigs[props.$variant].label.color(props.theme)};
`;

export const CollectionFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Collection 内部字段的内联布局容器
export const InlineFieldContainer = styled.div<{ $variant: ParameterInputVariant }>`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: ${props => variantConfigs[props.$variant].container.marginBottom};
`;

// Collection 内部的内联标签
export const InlineLabel = styled.label<{ $variant: ParameterInputVariant }>`
  flex-shrink: 0;
  min-width: 80px;
  font-size: ${props => variantConfigs[props.$variant].label.fontSize};
  font-weight: ${props => variantConfigs[props.$variant].label.fontWeight};
  color: ${props => variantConfigs[props.$variant].label.color(props.theme)};
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

// Collection 内部的输入控件容器
export const InlineInputWrapper = styled.div`
  flex: 1;
  min-width: 0; // 防止 flex 子元素溢出
`;