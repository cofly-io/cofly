"use client";

import React, { createContext, useContext, useState } from 'react';

interface MessageContextType {
  lastAssistantMessageId: string | null;
  setLastAssistantMessageId: (id: string | null) => void;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [lastAssistantMessageId, setLastAssistantMessageId] = useState<string | null>(null);

  return (
    <MessageContext.Provider value={{
      lastAssistantMessageId,
      setLastAssistantMessageId
    }}>
      {children}
    </MessageContext.Provider>
  );
}

export function useMessageContext() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
}