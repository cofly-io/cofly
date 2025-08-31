import {
    ITeamLoader,
    TeamData,
    TeamConfig,
    TeamMemberConfig,
    TeamListOptions,
    AgentConfig,
    CreateTeamInput,
    UpdateTeamInput,
    AddTeamMemberInput,
    UpdateTeamMemberInput,
    TeamOperationResult
} from "@repo/common";
import { prisma } from '@repo/database';

export class DefaultTeamLoader implements ITeamLoader {

    async get(id: string, opts?: { includeMembers?: boolean }): Promise<TeamData | null | undefined> {
        const team = await prisma.team.findUnique({
            where: { id: id },
        });

        if (!team) {
            return null;
        }

        const teamConfig: TeamConfig = {
            id: team.id,
            name: team.name,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        };

        const teamData: TeamData = {
            id: team.id,
            config: teamConfig,
        };

        // 如果需要包含成员信息
        if (opts?.includeMembers) {
            teamData.members = await this.getMembers(id) || [];
        }

        return teamData;
    }

    async list(opts?: TeamListOptions): Promise<TeamData[] | null | undefined> {
        const teams = await prisma.team.findMany({
            orderBy: { createdAt: 'desc' },
        });

        const teamDataList: TeamData[] = [];

        for (const team of teams) {
            const teamConfig: TeamConfig = {
                id: team.id,
                name: team.name,
                createdAt: team.createdAt,
                updatedAt: team.updatedAt,
            };

            const teamData: TeamData = {
                id: team.id,
                config: teamConfig,
            };

            // 如果需要包含成员信息
            if (opts?.includeMembers) {
                teamData.members = await this.getMembers(team.id) || [];
            }

            teamDataList.push(teamData);
        }

        return teamDataList;
    }

    async getMembers(teamId: string): Promise<TeamMemberConfig[] | null | undefined> {
        const members = await prisma.teamMember.findMany({
            where: { teamId: teamId },
            include: {
                // 注意：这里需要根据实际的数据库关系来调整
                // 如果TeamMember表没有直接关联到AiAgent，可能需要单独查询
            },
            orderBy: [
                { isLeader: 'desc' }, // 领导者排在前面
                { createdAt: 'asc' },
            ],
        });

        const memberConfigs: TeamMemberConfig[] = [];

        for (const member of members) {
            // 获取关联的智能体信息
            const agent = await prisma.aiAgent.findUnique({
                where: { id: member.agentId },
            });

            const memberConfig: TeamMemberConfig = {
                id: member.id,
                teamId: member.teamId,
                agentId: member.agentId,
                isLeader: member.isLeader,
                createdAt: member.createdAt,
            };

            // 如果找到了关联的智能体，添加智能体信息
            if (agent) {
                memberConfig.agent = {
                    id: agent.id,
                    name: agent.name,
                    description: agent.description,
                    prompt: agent.prompt || undefined,
                    avatar: agent.avatar || undefined,
                    connectid: agent.connectid,
                    modelId: agent.modelId || undefined,
                    modelName: agent.modelName || undefined,
                    createdAt: agent.createdAt,
                    updatedAt: agent.updatedAt,
                    createUser: agent.createUser,
                    agentInfo: agent.agentinfo || undefined,
                    agentinfo: agent.agentinfo || undefined,
                } as AgentConfig;
            }

            memberConfigs.push(memberConfig);
        }

        return memberConfigs;
    }

    // ==================== 团队CRUD操作 ====================

    async create(input: CreateTeamInput): Promise<TeamData> {
        const team = await prisma.team.create({
            data: {
                name: input.name,
            },
        });

        const teamConfig: TeamConfig = {
            id: team.id,
            name: team.name,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        };

        return {
            id: team.id,
            config: teamConfig,
            members: [],
        };
    }

    async update(id: string, input: UpdateTeamInput): Promise<TeamData> {
        // 检查团队是否存在
        const existingTeam = await prisma.team.findUnique({
            where: { id },
        });

        if (!existingTeam) {
            throw new Error(`团队不存在: ${id}`);
        }

        // 更新团队信息
        const team = await prisma.team.update({
            where: { id },
            data: {
                ...(input.name && { name: input.name }),
            },
        });

        const teamConfig: TeamConfig = {
            id: team.id,
            name: team.name,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
        };

        return {
            id: team.id,
            config: teamConfig,
            members: await this.getMembers(id) || []
        };
    }

    async delete(id: string): Promise<TeamOperationResult> {
        try {
            // 检查团队是否存在
            const existingTeam = await prisma.team.findUnique({
                where: { id },
            });

            if (!existingTeam) {
                return {
                    success: false,
                    message: `团队不存在: ${id}`,
                };
            }

            // 删除团队（会级联删除成员）
            await prisma.team.delete({
                where: { id },
            });

            return {
                success: true,
                message: '团队删除成功',
            };
        } catch (error) {
            return {
                success: false,
                message: `删除团队失败: ${error instanceof Error ? error.message : '未知错误'}`,
            };
        }
    }

    // ==================== 成员管理操作 ====================

    async addMember(teamId: string, input: AddTeamMemberInput): Promise<TeamMemberConfig> {
        // 检查团队是否存在
        const team = await prisma.team.findUnique({
            where: { id: teamId },
        });

        if (!team) {
            throw new Error(`团队不存在: ${teamId}`);
        }

        // 检查智能体是否存在
        const agent = await prisma.aiAgent.findUnique({
            where: { id: input.agentId },
        });

        if (!agent) {
            throw new Error(`智能体不存在: ${input.agentId}`);
        }

        // 检查是否已经是团队成员
        const existingMember = await prisma.teamMember.findFirst({
            where: {
                teamId: teamId,
                agentId: input.agentId,
            },
        });

        if (existingMember) {
            throw new Error(`智能体 ${agent.name} 已经是团队成员`);
        }

        // 添加成员
        const member = await prisma.teamMember.create({
            data: {
                teamId: teamId,
                agentId: input.agentId,
                isLeader: input.isLeader || false,
            },
        });

        const agentConfig: AgentConfig = {
            id: agent.id,
            name: agent.name,
            description: agent.description,
            prompt: agent.prompt || undefined,
            avatar: agent.avatar || undefined,
            connectid: agent.connectid,
            modelId: agent.modelId || undefined,
            modelName: agent.modelName || undefined,
            createdAt: agent.createdAt,
            updatedAt: agent.updatedAt,
            createUser: agent.createUser,
            agentInfo: agent.agentinfo || undefined,
        };

        return {
            id: member.id,
            teamId: member.teamId,
            agentId: member.agentId,
            isLeader: member.isLeader,
            createdAt: member.createdAt,
            agent: agentConfig,
        };
    }

    async updateMember(teamId: string, memberId: string, input: UpdateTeamMemberInput): Promise<TeamMemberConfig> {
        // 检查成员是否存在
        const existingMember = await prisma.teamMember.findFirst({
            where: {
                id: memberId,
                teamId: teamId,
            },
        });

        if (!existingMember) {
            throw new Error(`团队成员不存在: ${memberId}`);
        }

        // 更新成员信息
        const member = await prisma.teamMember.update({
            where: { id: memberId },
            data: {
                ...(input.isLeader !== undefined && { isLeader: input.isLeader }),
            },
        });

        // 获取关联的智能体信息
        const agent = await prisma.aiAgent.findUnique({
            where: { id: member.agentId },
        });

        const memberConfig: TeamMemberConfig = {
            id: member.id,
            teamId: member.teamId,
            agentId: member.agentId,
            isLeader: member.isLeader,
            createdAt: member.createdAt,
        };

        if (agent) {
            memberConfig.agent = {
                id: agent.id,
                name: agent.name,
                description: agent.description,
                prompt: agent.prompt || undefined,
                avatar: agent.avatar || undefined,
                connectid: agent.connectid,
                modelId: agent.modelId || undefined,
                modelName: agent.modelName || undefined,
                createdAt: agent.createdAt,
                updatedAt: agent.updatedAt,
                createUser: agent.createUser,
                agentInfo: agent.agentinfo || undefined,
                agentinfo: agent.agentinfo || undefined,
            } as AgentConfig;
        }

        return memberConfig;
    }

    async removeMember(teamId: string, memberId: string): Promise<TeamOperationResult> {
        try {
            // 检查成员是否存在
            const existingMember = await prisma.teamMember.findFirst({
                where: {
                    id: memberId,
                    teamId: teamId,
                },
            });

            if (!existingMember) {
                return {
                    success: false,
                    message: `团队成员不存在: ${memberId}`,
                };
            }

            // 删除成员
            await prisma.teamMember.delete({
                where: { id: memberId },
            });

            return {
                success: true,
                message: '成员移除成功',
            };
        } catch (error) {
            return {
                success: false,
                message: `移除成员失败: ${error instanceof Error ? error.message : '未知错误'}`,
            };
        }
    }

    // ==================== 批量操作 ====================

    async addMembers(teamId: string, inputs: AddTeamMemberInput[]): Promise<TeamMemberConfig[]> {
        const results: TeamMemberConfig[] = [];

        for (const input of inputs) {
            try {
                const member = await this.addMember(teamId, input);
                results.push(member);
            } catch (error) {
                // 记录错误但继续处理其他成员
                console.error(`添加成员失败 (agentId: ${input.agentId}):`, error);
            }
        }

        return results;
    }

    async removeMembers(teamId: string, memberIds: string[]): Promise<TeamOperationResult> {
        try {
            let successCount = 0;
            let failCount = 0;
            const errors: string[] = [];

            for (const memberId of memberIds) {
                const result = await this.removeMember(teamId, memberId);
                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                    errors.push(result.message || '未知错误');
                }
            }

            return {
                success: failCount === 0,
                message: `批量移除完成: 成功 ${successCount} 个，失败 ${failCount} 个`,
                data: {
                    successCount,
                    failCount,
                    errors,
                },
            };
        } catch (error) {
            return {
                success: false,
                message: `批量移除失败: ${error instanceof Error ? error.message : '未知错误'}`,
            };
        }
    }
}