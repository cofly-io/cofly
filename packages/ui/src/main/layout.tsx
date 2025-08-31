"use client";

import styled from 'styled-components';

export const PageContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
`;

export const Sidebar = styled.div<{ $collapsed?: boolean }>`
  width: ${props => props.$collapsed ? '50px' : '110px'};
  background-color: ${({ theme }) => theme.colors.sidebarBg};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  transition: width 0.3s ease;
  position: relative;
`;

export const SidebarItem = styled.div<{ $active?: boolean; $collapsed?: boolean }>`
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: ${props => props.$active ? props.theme.colors.accent : props.theme.colors.textSecondary};
  background-color: ${props => props.$active ? props.theme.colors.tertiary : 'transparent'};
  border-left: ${props => props.$active ? `3px solid ${props.theme.colors.accent}` : '3px solid transparent'};
  font-size: 12px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.tertiary};
  }

  svg {
    margin-bottom: ${props => props.$collapsed ? '0' : '5px'};
    font-size: 18px;
    fill: ${props => props.$active ? props.theme.colors.accent : 'currentColor'};
    color: ${props => props.$active ? props.theme.colors.accent : 'currentColor'};
    path {
      fill: ${props => props.$active ? props.theme.colors.accent : 'currentColor'};
    }
  }
`;

export const SidebarToggle = styled.div`
  position: absolute;
  right: -1px;
  top: 40%;
  transform: translateY(-50%);
  z-index: 10;
  cursor: pointer;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 60px;
`;

export const ToggleDots = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 100%;

  li {
    width: 2px;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.textTertiary};
    border-radius: 50%;
  }
`;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 5;
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  background-color: ${({ theme }) => theme.colors.headerBg};
`;

export const Title = styled.h1`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

export const SubTitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
  margin-top: 5px;
`;

export const ContentArea = styled.div`
  flex: 1;
  padding: 0;
  //overflow-y: auto;
  display: flex;
  //flex-direction: column;
  height: 100%;
`;




