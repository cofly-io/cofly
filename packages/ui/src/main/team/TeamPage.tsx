import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MdManageAccounts } from "react-icons/md";
import { PageHeader } from '../../components/basic/PageHeader';
import { ConfirmDialog } from '../../components/basic/ConfirmDialog';
import { getAvatarIcon } from '../../utils/avatarUtils';
import ChatDisplay from '../chat/ChatDisplay';
import {
  TeamContainer,
  TeamContentContainer,
  ChatSidebar,
  ResizeHandle,
  WidthIndicator,
  TeamMainContent,
  TopSection,
  TeamGrid,
  TeamMemberCard,
  MemberAvatar,
  MemberName,
  ManageIcon,
  AddMemberCard,
  AddIcon,
  SaveButton,
  TeamTabsContainer,
  TeamTab,
  RemoveMemberButton,
  MemberMenuContainer
} from './styles';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string | { name: string; color: string } | null;
  status: 'online' | 'busy' | 'away' | 'offline';
  lastSeen: string;
  isLeader?: boolean;
}



interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

// TeamMemberAvatar组件，用于正确渲染团队成员头像
const TeamMemberAvatarIcon: React.FC<{ avatar?: string | { name: string; color: string } | null }> = ({ avatar }) => {
  // 如果avatar是字符串且看起来像JSON，尝试解析
  if (typeof avatar === 'string') {
    try {
      // 检查是否是JSON字符串
      if (avatar.startsWith('{') && avatar.endsWith('}')) {
        const parsed = JSON.parse(avatar);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          // 返回对应的图标，使用指定的颜色
          const iconElement = getAvatarIcon(parsed.name);
          return React.cloneElement(iconElement as React.ReactElement<any>, {
            style: {
              color: parsed.color || '#3B82F6',
              fontSize: '20px'
            }
          });
        }
      } else {
        // 普通字符串，直接作为图标名称
        return React.cloneElement(getAvatarIcon(avatar) as React.ReactElement<any>, {
          style: {
            color: '#3B82F6',
            fontSize: '20px'
          }
        });
      }
    } catch (error) {
      console.warn('解析团队成员avatar JSON失败:', error);
      // 解析失败，使用默认图标
      return React.cloneElement(getAvatarIcon('user') as React.ReactElement<any>, {
        style: {
          color: '#3B82F6',
          fontSize: '20px'
        }
      });
    }
  } else if (avatar && typeof avatar === 'object' && avatar.name) {
    // 已经是对象格式
    return React.cloneElement(getAvatarIcon(avatar.name) as React.ReactElement<any>, {
      style: {
        color: avatar.color || '#3B82F6',
        fontSize: '20px'
      }
    });
  }

  // 默认情况，使用用户图标
  return React.cloneElement(getAvatarIcon('user') as React.ReactElement<any>, {
    style: {
      color: '#3B82F6',
      fontSize: '20px'
    }
  });
};

interface TeamPageProps {
  title: string;
  slogan: string;
  DocumentIcon: React.ComponentType;
  loading: boolean;
  teams?: Team[];
  activeTeamId?: string;
  teamMembers?: TeamMember[];
  onTeamChange?: (teamId: string) => void;
  onCreateTeam?: () => void;
  onAddMember?: () => void;
  onRemoveMember?: (memberId: string) => void;
  onToggleLeadership?: (memberId: string, isLeader: boolean) => void;
  agentId?: string | null;
  userId?: string;
  agentName?: string;
  agentAvatar?: string;
}

export const TeamPage: React.FC<TeamPageProps> = ({
  title,
  slogan,
  DocumentIcon,
  loading,
  teams = [],
  activeTeamId = '',
  teamMembers = [],
  onTeamChange,
  onCreateTeam,
  onAddMember,
  onRemoveMember,
  onToggleLeadership,
  agentId = null,
  userId = "admin",
  agentName = "团队智能体",
  agentAvatar = "👥"
}) => {
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartWidth, setDragStartWidth] = useState(0);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    memberToRemove: { id: string; name: string } | null;
  }>({
    isOpen: false,
    memberToRemove: null
  });

  // 拖拽调整宽度功能
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setDragStartX(e.clientX);
    setDragStartWidth(sidebarWidth);
  }, [sidebarWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - dragStartX;
    const newWidth = dragStartWidth + deltaX;
    
    if (newWidth >= 280 && newWidth <= 600) {
      setSidebarWidth(newWidth);
    }
  }, [isResizing, dragStartX, dragStartWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setDragStartX(0);
    setDragStartWidth(0);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // 团队切换处理函数
  const handleTeamTabClick = (teamId: string) => {
    if (onTeamChange) {
      onTeamChange(teamId);
    }
  };

  // 保存处理函数
  const handleSave = () => {
    console.log('保存团队配置');
    // 这里可以添加保存逻辑
  };

  // 处理团队成员选中
  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(selectedMemberId === memberId ? null : memberId);
  };

  // 处理移除成员确认
  const handleRemoveMemberClick = (member: { id: string; name: string }) => {
    setConfirmDialog({
      isOpen: true,
      memberToRemove: member
    });
  };

  const handleConfirmRemove = () => {
    if (confirmDialog.memberToRemove && onRemoveMember) {
      onRemoveMember(confirmDialog.memberToRemove.id);
    }
    setConfirmDialog({
      isOpen: false,
      memberToRemove: null
    });
  };

  const handleCancelRemove = () => {
    setConfirmDialog({
      isOpen: false,
      memberToRemove: null
    });
  };

  if (loading) {
    return (
      <TeamContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%', 
          color: 'white' 
        }}>
          加载中...
        </div>
      </TeamContainer>
    );
  }

  return (
    <TeamContainer>
      {/* 页面头部 */}
      <PageHeader 
        title={title} 
        subtitle={slogan}
        centerContent={
          <TeamTabsContainer>
            {teams.map((team) => (
              <TeamTab
                key={team.id}
                $active={activeTeamId === team.id}
                onClick={() => handleTeamTabClick(team.id)}
              >
                {team.name}
              </TeamTab>
            ))}
            {onCreateTeam && (
              <TeamTab
                onClick={onCreateTeam}
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  borderBottom: 'none',
                  fontSize: '12px'
                }}
              >
                + 新建团队
              </TeamTab>
            )}
          </TeamTabsContainer>
        }
        actions={
          <SaveButton onClick={handleSave}>
            保存
          </SaveButton>
        }
      />
      
      <TeamContentContainer>
        {/* 左侧聊天区域 - 使用Chart组件 */}
        <ChatSidebar $width={sidebarWidth} $isResizing={isResizing}>        
          <ChatDisplay
            agentId={agentId}
            userId={userId}
            agentName={agentName}
            agentAvatar={agentAvatar}
            showHistory={false}
          />
          
          {/* 拖拽调整器 */}
          <ResizeHandle onMouseDown={handleMouseDown} />
          
          {/* 宽度指示器 */}
          <WidthIndicator 
            $isVisible={isResizing} 
            $width={Math.round(sidebarWidth)} 
          />
        </ChatSidebar>

        {/* 主内容区域 */}
        <TeamMainContent>
          <TopSection>
            {/* 团队成员网格 */}
            <TeamGrid>
              {teamMembers.map((member, index) => {
                const isSelected = selectedMemberId === member.id;
                const isLeader = member.isLeader || false;

                return (
                  <TeamMemberCard
                    key={member.id}
                    $isSelected={isSelected}
                    $isFirst={isLeader}
                    onClick={() => handleMemberSelect(member.id)}
                  >
                    <MemberAvatar>
                      <TeamMemberAvatarIcon avatar={member.avatar} />
                    </MemberAvatar>
                    <MemberName>{member.name}</MemberName>
                    {isLeader && (
                      <ManageIcon title="团队负责人">
                        <MdManageAccounts />
                      </ManageIcon>
                    )}

                    {/* 移除成员按钮 */}
                    {onRemoveMember && !isLeader && (
                      <MemberMenuContainer className="member-menu">
                        <RemoveMemberButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMemberClick({ id: member.id, name: member.name });
                          }}
                          title={`移除 ${member.name}`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </RemoveMemberButton>
                      </MemberMenuContainer>
                    )}
                  </TeamMemberCard>
                );
              })}
              {/* 添加成员按钮 */}
              <AddMemberCard onClick={onAddMember || (() => console.log('添加成员'))}>
                <AddIcon>+</AddIcon>
              </AddMemberCard>
            </TeamGrid>
          </TopSection>

          {/* 可以在这里添加更多内容，比如项目进度、任务列表等 */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            opacity: 0.5
          }}>
            <div style={{ textAlign: 'center', color: 'white' }}>
              <div style={{ fontSize: '80px', marginBottom: '30px' }}>
                <DocumentIcon />
              </div>
              <p style={{ 
                marginTop: '0px', 
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '1px'
              }}>
                开始创建您的虚拟智能团队...
              </p>
            </div>
          </div>
        </TeamMainContent>
      </TeamContentContainer>

      {/* 移除成员确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="移除团队成员"
        message={`确定要从团队中移除 ${confirmDialog.memberToRemove?.name} 吗？\n\n此操作不可撤销，该成员将失去团队访问权限。`}
        confirmText="移除"
        cancelText="取消"
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
        type="danger"
      />
    </TeamContainer>
  );
};