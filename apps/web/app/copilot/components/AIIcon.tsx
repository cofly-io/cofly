"use client";

import React from "react";
import styled from "styled-components";

// AI图标容器
const AIIconContainer = styled.div`
  position: relative;
  margin: 1rem 0 0.5rem 0;
  height: 0;
  z-index: 1;
`;

// Gemini风格的钻石图标
const DiamondIcon = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(45deg);
  flex-shrink: 0;
  position: absolute;
  left: 0;
  top: 0;
`;

const DiamondInner = styled.div`
  width: 0.75rem;
  height: 0.75rem;
  background: white;
  border-radius: 0.25rem;
  transform: rotate(-45deg);
`;

export function AIIcon() {
  return (
    <AIIconContainer>
      <DiamondIcon>
        <DiamondInner />
      </DiamondIcon>
    </AIIconContainer>
  );
}