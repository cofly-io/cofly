"use client";

import React from 'react';
import styled from 'styled-components';
import { 
  GlassContainer, 
  GlassMain,
  glassBase 
} from '../../components/shared/ui-components';
import { UserInfoSettings } from '../settings/UserInfoSettings';
import { useAuth } from '../../hooks/useAuth';

const ProfileContainer = styled(GlassContainer)`
  min-height: 100vh;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 30px;
  overflow-y: auto;
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(15, 23, 42, 0.1)'
    : 'rgba(248, 250, 252, 0.2)'
  };
`;

const ProfileHeader = styled.div`
  margin-bottom: 30px;
  
  h1 {
    font-size: 28px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0 0 8px 0;
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 16px;
    margin: 0;
  }
`;

interface ProfilePageProps {
  className?: string;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ className }) => {
  const { logout } = useAuth();

  return (
    <ProfileContainer className={className}>
      <GlassMain>
        <ContentArea>
          <ProfileHeader>
            <h1>个人资料</h1>
            <p>管理你的个人信息和账户设置</p>
          </ProfileHeader>
          <UserInfoSettings onLogout={logout} />
        </ContentArea>
      </GlassMain>
    </ProfileContainer>
  );
};

export default ProfilePage;