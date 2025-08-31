"use client";

import styled from 'styled-components';

export const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 0;
`;

export const WelcomeMessage = styled.div`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 10px;
  display: flex;
  align-items: center;

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
  width: 120px;
  height: 120px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: white;
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
    color: #333;
    margin: 0;
    text-align: center;
  }
`;