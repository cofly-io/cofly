import styled from 'styled-components';

// 工作流列表样式组件
export const WorkflowListContainer = styled.div`
  padding: 20px;
`;

export const SearchAndFilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
`;

export const SearchInput = styled.input`
  flex: 1;
  max-width: 300px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  background-color: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.textPrimary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.textPrimary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

export const WorkflowCard = styled.div`
  background: ${({ theme }) => theme.colors.cardBg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const WorkflowInfo = styled.div`
  flex: 1;
`;

export const WorkflowName = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const WorkflowMeta = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const WorkflowActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const StatusBadge = styled.span`
  background: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;

export const ToggleSwitch = styled.label<{ $active: boolean }>`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.$active ? props.theme.colors.accent : props.theme.colors.border};
    transition: 0.4s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: ${props => props.$active ? '23px' : '3px'};
      bottom: 3px;
      background-color: ${({ theme }) => theme.colors.secondary};
      transition: 0.4s;
      border-radius: 50%;
    }
  }
`;

export const MoreButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 16px 0;
`;

export const PaginationInfo = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

export const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const PageButton = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  border: 1px solid ${props => props.$active ? props.theme.colors.accent : props.theme.colors.border};
  background: ${props => props.$active ? props.theme.colors.accent : props.theme.colors.buttonBg};
  color: ${props => props.$active ? props.theme.colors.secondary : props.theme.colors.textPrimary};
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    background: ${props => props.$active ? props.theme.colors.accentHover : props.theme.colors.buttonHover};
  }
`;

export const PageSizeSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  font-size: 14px;
  background: ${({ theme }) => theme.colors.inputBg};
  color: ${({ theme }) => theme.colors.textPrimary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`; 