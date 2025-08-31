"use client";

import React, { useState, useEffect } from 'react';
import { TeamPage } from '@repo/ui/main';
import { TbSteam } from "react-icons/tb";
import { CreateTeamModal } from '@/components/team/CreateTeamModal';
import { AddMemberDrawer } from '@/components/team/AddMemberDrawer';
import {
  getTeams,
  createTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  updateTeamMember
} from '@/services/teamService';
import { TeamData, TeamMemberConfig } from '@repo/common';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen: string;
  isLeader?: boolean;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

export default function TeamPageContainer() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<string>('');
  const [currentTeamMembers, setCurrentTeamMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 新增状态
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [currentTeamData, setCurrentTeamData] = useState<TeamData | null>(null);

  // 获取团队数据
  const loadTeams = async () => {
    try {
      setLoading(true);
      const result = await getTeams(true);

      if (result.success && result.data) {
        // 转换团队数据为UI需要的格式
        const teamsData: Team[] = result.data.map((team: TeamData) => ({
          id: team.id,
          name: team.config.name,
          members: team.members ? team.members.map((member: TeamMemberConfig) => ({
            id: member.id,
            name: member.agent?.name || '未知成员',
            role: member.isLeader ? '团队领导' : '团队成员',
            avatar: member.agent?.avatar || '🤖',
            status: 'online' as const,
            lastSeen: '',
            isLeader: member.isLeader || false
          })) : []
        }));

        setTeams(teamsData);

        // 设置默认选中第一个团队
        if (teamsData.length > 0 && !activeTeamId) {
          setActiveTeamId(teamsData[0].id);
          setCurrentTeamMembers(teamsData[0].members);
          setCurrentTeamData(result.data[0]);
        } else if (activeTeamId) {
          // 更新当前选中团队的数据
          const currentTeam = teamsData.find(t => t.id === activeTeamId);
          const currentTeamRawData = result.data.find((t: TeamData) => t.id === activeTeamId);
          if (currentTeam && currentTeamRawData) {
            setCurrentTeamMembers(currentTeam.members);
            setCurrentTeamData(currentTeamRawData);
          }
        }

        setError(null);
      } else {
        setError(result.error || '获取团队数据失败');
      }
    } catch (err) {
      console.error('获取团队数据失败:', err);
      setError('网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  // 处理团队切换
  const handleTeamChange = (teamId: string) => {
    setActiveTeamId(teamId);
    const selectedTeam = teams.find(team => team.id === teamId);
    if (selectedTeam) {
      setCurrentTeamMembers(selectedTeam.members);
      // 同时更新原始团队数据
      loadTeams();
    }
  };

  // 创建团队
  const handleCreateTeam = async (name: string) => {
    try {
      const result = await createTeam({ name });
      if (result.success) {
        await loadTeams();
        // 自动切换到新创建的团队
        if (result.data) {
          setActiveTeamId(result.data.id);
        }
      } else {
        throw new Error(result.error || '创建团队失败');
      }
    } catch (error) {
      console.error('创建团队失败:', error);
      throw error;
    }
  };

  // 添加成员
  const handleAddMember = async (agentId: string) => {
    if (!activeTeamId) return;

    try {
      const result = await addTeamMember(activeTeamId, { agentId, isLeader: false });
      if (result.success) {
        await loadTeams();
      } else {
        throw new Error(result.error || '添加成员失败');
      }
    } catch (error) {
      console.error('添加成员失败:', error);
      throw error;
    }
  };

  // 移除成员
  const handleRemoveMember = async (memberId: string) => {
    if (!activeTeamId) return;

    try {
      const result = await removeTeamMember(activeTeamId, memberId);
      if (result.success) {
        await loadTeams();
      } else {
        throw new Error(result.error || '移除成员失败');
      }
    } catch (error) {
      console.error('移除成员失败:', error);
      alert('移除成员失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 切换领导者状态
  const handleToggleLeadership = async (memberId: string, isLeader: boolean) => {
    if (!activeTeamId) return;

    try {
      const result = await updateTeamMember(activeTeamId, memberId, { isLeader });
      if (result.success) {
        await loadTeams();
      } else {
        throw new Error(result.error || '更新成员失败');
      }
    } catch (error) {
      console.error('更新成员失败:', error);
      alert('更新成员失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  // 如果有错误，显示错误信息
  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">团队协作</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>错误:</strong> {error}
        </div>
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">调试信息:</h2>
          <p>请检查:</p>
          <ul className="list-disc list-inside">
            <li>数据库连接是否正常</li>
            <li>Team和TeamMember表是否存在数据</li>
            <li>API路由是否正确配置</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <>
      <TeamPage
        title="团队协作"
        slogan="与团队成员实时协作，提高工作效率"
        DocumentIcon={TbSteam}
        loading={loading}
        teams={teams}
        activeTeamId={activeTeamId}
        teamMembers={currentTeamMembers}
        onTeamChange={handleTeamChange}
        onCreateTeam={() => setIsCreateModalOpen(true)}
        onAddMember={() => setIsAddDrawerOpen(true)}
        onRemoveMember={handleRemoveMember}
        onToggleLeadership={handleToggleLeadership}
      />

      {/* 新建团队模态框 */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTeam}
      />

      {/* 添加成员抽屉 */}
      <AddMemberDrawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        teamId={activeTeamId}
        currentMembers={currentTeamData?.members || []}
        onAddMember={handleAddMember}
      />
    </>
  );
} 