// 团队相关接口定义

// Team 相关定义
export const TeamDef = {
    identifier: "ITeamLoader",
};

// 团队配置接口
export interface TeamConfig {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
}

import { AgentConfig } from "./AgentInterfaces";

// 团队成员配置接口
export interface TeamMemberConfig {
  id: string;
  teamId: string;
  agentId: string;
  isLeader: boolean;
  createdAt: Date;
  // 关联的智能体信息
  agent?: AgentConfig;
}

// 团队数据接口（包含成员信息）
export interface TeamData {
  id: string;
  config: TeamConfig;
  members?: TeamMemberConfig[];
}

// 团队列表选项
export interface TeamListOptions {
  includeMembers?: boolean;
  userId?: string;
}

// 创建团队的输入接口
export interface CreateTeamInput {
  name: string;
  createdBy?: string;
}

// 更新团队的输入接口
export interface UpdateTeamInput {
  name?: string;
}

// 添加团队成员的输入接口
export interface AddTeamMemberInput {
  agentId: string;
  isLeader?: boolean;
}

// 更新团队成员的输入接口
export interface UpdateTeamMemberInput {
  isLeader?: boolean;
}

// 操作结果接口
export interface TeamOperationResult {
  success: boolean;
  message?: string;
  data?: any;
}

// 团队加载器接口
export interface ITeamLoader {
  // 查询操作
  get(id: string, opts?: { includeMembers?: boolean }): Promise<TeamData | null | undefined>;
  list(opts?: TeamListOptions): Promise<TeamData[] | null | undefined>;
  getMembers(teamId: string): Promise<TeamMemberConfig[] | null | undefined>;

  // 团队CRUD操作
  create(input: CreateTeamInput): Promise<TeamData>;
  update(id: string, input: UpdateTeamInput): Promise<TeamData>;
  delete(id: string): Promise<TeamOperationResult>;

  // 成员管理操作
  addMember(teamId: string, input: AddTeamMemberInput): Promise<TeamMemberConfig>;
  updateMember(teamId: string, memberId: string, input: UpdateTeamMemberInput): Promise<TeamMemberConfig>;
  removeMember(teamId: string, memberId: string): Promise<TeamOperationResult>;

  // 批量操作
  addMembers(teamId: string, inputs: AddTeamMemberInput[]): Promise<TeamMemberConfig[]>;
  removeMembers(teamId: string, memberIds: string[]): Promise<TeamOperationResult>;
}