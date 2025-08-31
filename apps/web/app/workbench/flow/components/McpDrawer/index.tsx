import React from 'react';
import styled from 'styled-components';
import { useMcpConfig } from '../../hooks/useMcpConfig';
import { McpDrawerContent } from './McpDrawerContent';

interface McpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNodeId?: string;
  selectedNodeDetails?: any;
  onResourcesChange?: (nodeId: string, resources: {
    mcpList: Array<{id: string, name: string, type?: string}>;
    workflowList: Array<{id: string, name: string, version?: string}>;
    connectList: Array<{id: string, name: string, ctype?: string}>;
  }) => void;
}

const DrawerOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 10000;
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
`;

const DrawerContainer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 30vw;
  min-width: 400px;
  max-width: 600px;
  background: ${({ theme }) => theme.panel.nodeBg};
  border-left: 1px solid #ffffff25;
  box-shadow: 0px 0px 8px rgba(64, 93, 158, 0.4);
  transform: translateX(${({ $isOpen }) => $isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  border-radius: 4px 0 0 4px;
`;

const DrawerHeader = styled.div`
  padding: 16px 25px;
  border-bottom: 1px solid ${({ theme }) => theme.panel.ctlBorder};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
`;

const DrawerTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.accent};
  font-size: 16px;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: rgba(243, 8, 8, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  padding: 0px 14px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  height: 28px;
  backdrop-filter: blur(4px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 4px 12px rgba(2, 2, 2, 0.15);
  }
`;

const DrawerBody = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const McpDrawer: React.FC<McpDrawerProps> = ({ 
  isOpen, 
  onClose, 
  selectedNodeId, 
  selectedNodeDetails,
  onResourcesChange 
}) => {
  const mcpConfigState = useMcpConfig();

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <DrawerOverlay $isOpen={isOpen} onClick={handleOverlayClick}>
      <DrawerContainer $isOpen={isOpen}>
        <DrawerHeader>
          <DrawerTitle>资源配置</DrawerTitle>
          <CloseButton onClick={onClose}>
            ✕
          </CloseButton>
        </DrawerHeader>
        <DrawerBody>
          {isOpen && (
            <McpDrawerContent 
              mcpConfigState={mcpConfigState}
              selectedNodeId={selectedNodeId}
              selectedNodeDetails={selectedNodeDetails}
              onResourcesChange={onResourcesChange}
            />
          )}
        </DrawerBody>
      </DrawerContainer>
    </DrawerOverlay>
  );
};