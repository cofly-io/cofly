import React, { createContext, useContext } from 'react';

interface McpLabelContextType {
  onMcpLabelClick?: (nodeId: string) => void;
}

const McpLabelContext = createContext<McpLabelContextType>({});

export const useMcpLabelContext = () => {
  return useContext(McpLabelContext);
};

interface McpLabelProviderProps {
  children: React.ReactNode;
  onMcpLabelClick?: (nodeId: string) => void;
}

export const McpLabelProvider: React.FC<McpLabelProviderProps> = ({
  children,
  onMcpLabelClick
}) => {
  return (
    <McpLabelContext.Provider value={{ onMcpLabelClick }}>
      {children}
    </McpLabelContext.Provider>
  );
};