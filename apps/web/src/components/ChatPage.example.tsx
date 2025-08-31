import React, { useState } from 'react';
import { ChatDisplayWrapper } from './ChatDisplayWrapper';

/**
 * 聊天页面示例
 * 
 * 这个示例展示了如何在web应用中使用重构后的聊天组件
 */
export const ChatPageExample: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>('agent-123');
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const handleHistoryToggle = (isVisible: boolean, width: number) => {
    setIsHistoryVisible(isVisible);
    console.log('History panel toggled:', { isVisible, width });
  };

  const handleAgentChange = (agentId: string) => {
    setSelectedAgentId(agentId);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部工具栏 */}
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #e1e5e9',
        backgroundColor: '#f8f9fa'
      }}>
        <h1>智能聊天助手</h1>
        <div style={{ marginTop: '8px' }}>
          <label>选择智能体：</label>
          <select 
            value={selectedAgentId || ''} 
            onChange={(e) => handleAgentChange(e.target.value)}
            style={{ marginLeft: '8px', padding: '4px 8px' }}
          >
            <option value="">请选择智能体</option>
            <option value="agent-123">通用助手</option>
            <option value="agent-456">代码助手</option>
            <option value="agent-789">写作助手</option>
          </select>
        </div>
      </div>

      {/* 聊天区域 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ChatDisplayWrapper
          agentId={selectedAgentId}
          userId="current-user"
          agentName="智能助手"
          agentAvatar="🤖"
          theme="dark"
          showNewChat={true}
          showHistory={true}
          showAttachment={true}
          showAgent={true}
          onHistoryToggle={handleHistoryToggle}
        />
      </div>

      {/* 状态信息 */}
      <div style={{ 
        padding: '8px 16px', 
        borderTop: '1px solid #e1e5e9',
        backgroundColor: '#f8f9fa',
        fontSize: '12px',
        color: '#6c757d'
      }}>
        当前智能体: {selectedAgentId || '未选择'} | 
        历史面板: {isHistoryVisible ? '显示' : '隐藏'}
      </div>
    </div>
  );
};

export default ChatPageExample;
