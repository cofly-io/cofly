"use client";

import styled from 'styled-components';

export const TabsContainer = styled.div`
  position: absolute;
  left: 50%;
  top:14px;
  transform: translateY(-50%);
  z-index: 10;
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: row
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 20px;  
  gap: 8px;
`

export const Tab = styled.div<{ $active?: boolean }>`
  position: relative;
  padding: 20px 20px;
  cursor: pointer;
  color: ${props => props.$active ? props.theme.colors.accent : props.theme.colors.textSecondary};
  border-bottom: ${props => props.$active ? `2px solid ${props.theme.colors.accent}` : '2px solid transparent'};
  font-size: 14px;
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;