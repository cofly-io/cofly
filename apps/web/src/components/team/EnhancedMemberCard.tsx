"use client";

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { MdManageAccounts } from "react-icons/md";
import { getAvatarIcon } from '@repo/ui/utils/avatarUtils';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string | { name: string; color: string } | null;
  status: 'online' | 'busy' | 'away' | 'offline';
  lastSeen: string;
  isLeader?: boolean;
}

// EnhancedMemberAvatar组件，用于正确渲染团队成员头像
const EnhancedMemberAvatarIcon: React.FC<{ avatar?: string | { name: string; color: string } | null }> = ({ avatar }) => {
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
              fontSize: '18px'
            }
          });
        }
      } else {
        // 普通字符串，直接作为图标名称
        return React.cloneElement(getAvatarIcon(avatar) as React.ReactElement<any>, {
          style: {
            color: '#3B82F6',
            fontSize: '18px'
          }
        });
      }
    } catch (error) {
      console.warn('解析EnhancedMember avatar JSON失败:', error);
      // 解析失败，使用默认图标
      return React.cloneElement(getAvatarIcon('user') as React.ReactElement<any>, {
        style: {
          color: '#3B82F6',
          fontSize: '18px'
        }
      });
    }
  } else if (avatar && typeof avatar === 'object' && avatar.name) {
    // 已经是对象格式
    return React.cloneElement(getAvatarIcon(avatar.name) as React.ReactElement<any>, {
      style: {
        color: avatar.color || '#3B82F6',
        fontSize: '18px'
      }
    });
  }

  // 默认情况，使用用户图标
  return React.cloneElement(getAvatarIcon('user') as React.ReactElement<any>, {
    style: {
      color: '#3B82F6',
      fontSize: '18px'
    }
  });
};

interface EnhancedMemberCardProps {
  member: TeamMember;
  onRemove: (memberId: string) => void;
  onToggleLeadership: (memberId: string, isLeader: boolean) => void;
  canEdit: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const MemberCard = styled.div<{ $isSelected?: boolean; $isLeader?: boolean }>`
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
  }
`;

const MemberAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  /* 确保SVG图标正确显示 */
  svg {
    width: 18px;
    height: 18px;
  }
`;

const MemberInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MemberName = styled.div`
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MemberRole = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LeaderIcon = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  color: #fbbf24;
  font-size: 16px;
  z-index: 2;
`;

const MenuButton = styled.button<{ $isOpen?: boolean }>`
  position: absolute;
  top: 6px;
  right: 6px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 3;
  opacity: 0;
  
  ${MemberCard}:hover & {
    opacity: 1;
  }
  
  ${props => props.$isOpen && `
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
  `}
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.15);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const DropdownMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 140px;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(4px)' : 'translateY(-4px)'};
  transition: all 0.2s ease;
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  color: ${props => props.$danger ? '#ef4444' : 'rgba(255, 255, 255, 0.9)'};
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  
  &:only-child {
    border-radius: 8px;
  }
  
  &:hover {
    background-color: ${props => props.$danger ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const StatusIndicator = styled.div<{ $status: string }>`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => {
    switch (props.$status) {
      case 'online': return '#10b981';
      case 'busy': return '#f59e0b';
      case 'away': return '#6b7280';
      default: return '#6b7280';
    }
  }};
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

export const EnhancedMemberCard: React.FC<EnhancedMemberCardProps> = ({
  member,
  onRemove,
  onToggleLeadership,
  canEdit,
  isSelected,
  onClick
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = (action: () => void) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      action();
      setIsMenuOpen(false);
    };
  };

  const handleCardClick = () => {
    if (onClick && !isMenuOpen) {
      onClick();
    }
  };

  return (
    <MemberCard 
      $isSelected={isSelected} 
      $isLeader={member.isLeader}
      onClick={handleCardClick}
    >
      <MemberAvatar>
        <EnhancedMemberAvatarIcon avatar={member.avatar} />
      </MemberAvatar>
      
      <MemberInfo>
        <MemberName>{member.name}</MemberName>
        <MemberRole>{member.role}</MemberRole>
      </MemberInfo>

      {member.isLeader && (
        <LeaderIcon title="团队领导">
          <MdManageAccounts />
        </LeaderIcon>
      )}

      <StatusIndicator $status={member.status} />

      {canEdit && (
        <>
          <MenuButton 
            ref={buttonRef}
            $isOpen={isMenuOpen}
            onClick={handleMenuToggle}
            title="更多操作"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </MenuButton>

          <DropdownMenu ref={menuRef} $isOpen={isMenuOpen}>
            <MenuItem
              onClick={handleMenuItemClick(() => onToggleLeadership(member.id, !member.isLeader))}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="m22 11-3-3m0 0-3 3m3-3v12"></path>
              </svg>
              {member.isLeader ? '取消领导者' : '设为领导者'}
            </MenuItem>
            
            <MenuItem
              $danger
              onClick={handleMenuItemClick(() => onRemove(member.id))}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <line x1="22" y1="11" x2="16" y2="17"></line>
                <line x1="16" y1="11" x2="22" y2="17"></line>
              </svg>
              移除成员
            </MenuItem>
          </DropdownMenu>
        </>
      )}
    </MemberCard>
  );
};
