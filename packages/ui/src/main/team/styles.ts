import styled from 'styled-components';

// 主容器
export const TeamContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

// 内容容器（头部下方的内容）
export const TeamContentContainer = styled.div`
  display: flex;
  height: calc(100vh - 55px); /* 调整为更准确的头部高度 */
  background-color: #021330;
  background-image: url('/teambg.png');
  background-size: 60% 60%;
  background-position: 60% 60%;
  background-repeat: no-repeat;
`;

// 左侧聊天区域
export const ChatSidebar = styled.div<{ $width: number; $isResizing?: boolean }>`
  width: ${props => props.$width}px;
  min-width: 280px;
  max-width: 600px;
  height: 100%; /* 确保有明确的高度 */
  background-color: #0f1b3a;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  transition: ${props => props.$isResizing ? 'none' : 'width 0.2s ease'};
  user-select: ${props => props.$isResizing ? 'none' : 'auto'};
`;

// 拖拽调整器
export const ResizeHandle = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  background: transparent;
  cursor: col-resize;
  z-index: 10;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.4);
  }
  
  /* 添加一个更明显的拖拽指示器 */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 30px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 1px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
`;

// 拖拽宽度指示器
export const WidthIndicator = styled.div<{ $isVisible: boolean; $width: number }>`
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  z-index: 11;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.2s ease;
  pointer-events: none;
  
  &::before {
    content: '${props => props.$width}px';
  }
`;


// 消息列表容器
export const MessagesContainer = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0; /* 关键：允许flex子元素收缩 */
  max-height: calc(100vh - 60px - 166px); /* 减去头部、输入框和边距 */
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(76, 76, 77, 0.4);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.6);
  }
`;

// 单条消息
export const MessageItem = styled.div<{ $isOwn?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 16px;
  padding: 8px;
  border-radius: 8px;
  flex-direction: ${props => props.$isOwn ? 'row-reverse' : 'row'};
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

// 消息头像
export const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
`;

// 消息内容
export const MessageContent = styled.div<{ $isOwn?: boolean }>`
  flex: 1;
  text-align: ${props => props.$isOwn ? 'right' : 'left'};
`;

// 消息发送者
export const MessageSender = styled.div<{ $isOwn?: boolean }>`
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  text-align: ${props => props.$isOwn ? 'right' : 'left'};
`;

// 消息文本
export const MessageText = styled.div<{ $isOwn?: boolean }>`
  color: #b0b0b0;
  font-size: 13px;
  line-height: 1.4;
  background-color: ${props => props.$isOwn ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  padding: 8px 12px;
  border-radius: 12px;
  display: inline-block;
  max-width: 80%;
  word-wrap: break-word;
  margin: ${props => props.$isOwn ? '0 0 0 auto' : '0 auto 0 0'};
`;

// 消息时间
export const MessageTime = styled.div<{ $isOwn?: boolean }>`
  color: #666;
  font-size: 11px;
  margin-top: 4px;
  text-align: ${props => props.$isOwn ? 'right' : 'left'};
`;

// 输入区域
export const InputContainer = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  height: 166px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* 防止输入区域被压缩 */
  background-color: #0f1b3a; /* 确保背景色一致 */
`;

// 输入框容器
export const InputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// 输入框
export const MessageInput = styled.textarea`
  width: 100%;
  flex: 1;
  padding: 12px 16px 40px 16px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  outline: none;
  resize: none;
  
  &::placeholder {
    color: #666;
  }
  
  &:focus {
    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.08);
  }
`;

// 输入框底部工具栏
export const InputToolbar = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
`;

// 工具栏左侧（附件图标）
export const ToolbarLeft = styled.div`
  display: flex;
  align-items: center;
`;

// 工具栏右侧（发送图标）
export const ToolbarRight = styled.div`
  display: flex;
  align-items: center;
`;

// 图标按钮
export const IconButton = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 0.9);
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

// 主内容区域
export const TeamMainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// 顶部团队成员区域
export const TopSection = styled.div`
  width: 100%;
  padding: 18px;
  background: rgba(22, 8, 56, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

// 团队成员网格
export const TeamGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  //margin-bottom: 20px;
  align-items: flex-start;
`;

// 团队成员卡片
export const TeamMemberCard = styled.div<{ $isSelected?: boolean; $isFirst?: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
  height: 60px;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  
  ${props => props.$isSelected && `
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
  `}
  
  &:hover {
    background: ${props => props.$isSelected ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.08)'};
    border-color: rgba(255, 255, 255, 0.2);

    .member-menu {
      opacity: 1 !important;
    }
  }
`;

// 管理图标
export const ManageIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  color:rgb(241, 241, 241);
  font-size: 16px;
  transition: color 0.3s ease;

  &:hover {
    color: #66BB6A;
  }
`;

// 移除成员按钮
export const RemoveMemberButton = styled.button`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: rgba(239, 68, 68, 0.8);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.5);
    color: rgba(239, 68, 68, 1);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

// 成员操作菜单容器
export const MemberMenuContainer = styled.div`
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
`;

// 成员头像
export const MemberAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  /* 确保SVG图标正确显示 */
  svg {
    width: 20px;
    height: 20px;
  }
`;

// 成员名称
export const MemberName = styled.h4`
  color: white;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  flex: 1;
`;

// 添加成员按钮
export const AddMemberCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  width: 80px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

// 添加图标
export const AddIcon = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 28px;
  font-weight: 300;
  
  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }
`;

// 团队专用 Tabs 容器
export const TeamTabsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  user-select: none;
`;

// 团队专用 Tab
export const TeamTab = styled.div<{ $active?: boolean }>`
  position: relative;
  padding: 8px 12px 2px;
  cursor: pointer;
  color: ${props => props.$active ? 'white' : 'rgba(255, 255, 255, 0.7)'};
  border-bottom: ${props => props.$active ? '1px solid white' : '2px solid transparent'};
  font-size: 13px;
  transition: all 0.3s ease;
  margin-bottom: -1px;
  background-color: #02133020;
  &:hover {
    color: white;
  }
`;

// 保存按钮
export const SaveButton = styled.button`
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(14, 165, 233, 0.4));
  color: #e2e8f0;
  border: 1px solid rgba(8, 84, 207, 0.4);
  border-radius: 8px;
  padding: 0 20px;
  height: 32px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.6s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.6);
  }

  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(-1px);
  }
`;

// 成员角色
export const MemberRole = styled.p`
  color: #b0b0b0;
  margin: 0 0 8px;
  font-size: 12px;
`;

// 成员状态
export const MemberStatus = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  background-color: ${props => {
    switch (props.$status) {
      case 'online': return 'rgba(76, 175, 80, 0.2)';
      case 'busy': return 'rgba(255, 152, 0, 0.2)';
      case 'away': return 'rgba(158, 158, 158, 0.2)';
      default: return 'rgba(158, 158, 158, 0.2)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'online': return '#4CAF50';
      case 'busy': return '#FF9800';
      case 'away': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  }};
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
  }
`;

 