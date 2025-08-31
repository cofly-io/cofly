"use client";

import styled from 'styled-components';

export const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 0;color:
  rgb(116, 115, 115);
`;

export const WelcomeMessage = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin-top: 100px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.secondary};
  span {
    margin-left: 8px;
  }
`;

export const WorkflowOptionsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
  gap: 20px;
`;

export const WorkflowOption = styled.div`
  width: 300px;
  color: ${({ theme }) => theme.colors.secondary};
  height: 120px;
  border: ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.secondary};
  transition: all 0.2s;

  &:hover {
    border-color: #33C2EE;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  svg {
    font-size: 24px;
    color: #666;
    margin-bottom: 10px;
  }

  p {
    font-size: 14px;
    color:rgb(114, 113, 113);
    margin: 0;
    text-align: center;
  }
`;