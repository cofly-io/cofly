import React from 'react';
import styled from 'styled-components';

// 自定义 Select 包装器
const SelectWrapper = styled.div`
    position: relative;
    width: 100%;
    
    &::after {
        content: "▼"; /* 使用Unicode字符 */
        font-size: 12px; /* 调整图标大小 */
        color: ${({ theme }) => theme.mode === 'dark' ? '#9ca3af' : '#555'}; /* 调整图标颜色 */
        position: absolute;
        right: 10px; /* 调整图标在框内的水平位置 */
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none; /* 确保点击下拉框本身而不是图标 */
        z-index: 1;
    }
`;

const StyledSelect = styled.select`
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 100%;
    padding: 8px 30px 8px 12px; /* 右侧留出空间给自定义箭头 */
    border: 1px solid ${({ theme }) => theme.mode === 'dark' ? '#ffffff20' : '#d1d5db'};
    border-radius: 4px;
    background: ${({ theme }) => theme.mode === 'dark' ? '#1f2937' : '#ffffff'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#f9fafb' : '#111827'};
    font-size: 13px;
    cursor: pointer;

    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    &:disabled {
        background: ${({ theme }) => theme.mode === 'dark' ? '#1f2937' : '#f9fafb'};
        color: ${({ theme }) => theme.mode === 'dark' ? '#6b7280' : '#9ca3af'};
        cursor: not-allowed;
    }

    /* 隐藏默认箭头 */
    &::-ms-expand {
        display: none;
    }
`;

export interface BasicSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
    className?: string;
}

export const BasicSelect: React.FC<BasicSelectProps> = ({
    children,
    className,
    ...props
}) => {
    return (
        <SelectWrapper className={className}>
            <StyledSelect {...props}>
                {children}
            </StyledSelect>
        </SelectWrapper>
    );
};

export default BasicSelect;