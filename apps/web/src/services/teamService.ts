/**
 * 团队管理API工具函数
 */

import { 
    TeamData, 
    CreateTeamInput, 
    UpdateTeamInput, 
    AddTeamMemberInput, 
    UpdateTeamMemberInput,
    TeamMemberConfig,
    TeamOperationResult 
} from '@repo/common';

// API响应类型
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    details?: string;
}

// 基础请求函数
async function apiRequest<T = any>(
    endpoint: string, 
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`/api${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const result = await response.json();
        return result;
    } catch (error) {
        return {
            success: false,
            error: '网络请求失败',
            details: error instanceof Error ? error.message : '未知错误',
        };
    }
}

// ==================== 团队CRUD操作 ====================

/**
 * 获取团队列表
 */
export async function getTeams(includeMembers = false): Promise<ApiResponse<TeamData[]>> {
    return apiRequest<TeamData[]>(`/teams?includeMembers=${includeMembers}`);
}

/**
 * 获取单个团队详情
 */
export async function getTeam(id: string, includeMembers = false): Promise<ApiResponse<TeamData>> {
    return apiRequest<TeamData>(`/teams/${id}?includeMembers=${includeMembers}`);
}

/**
 * 创建新团队
 */
export async function createTeam(input: CreateTeamInput): Promise<ApiResponse<TeamData>> {
    return apiRequest<TeamData>('/teams', {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

/**
 * 更新团队信息
 */
export async function updateTeam(id: string, input: UpdateTeamInput): Promise<ApiResponse<TeamData>> {
    return apiRequest<TeamData>(`/teams/${id}`, {
        method: 'PUT',
        body: JSON.stringify(input),
    });
}

/**
 * 删除团队
 */
export async function deleteTeam(id: string): Promise<ApiResponse<TeamOperationResult>> {
    return apiRequest<TeamOperationResult>(`/teams/${id}`, {
        method: 'DELETE',
    });
}

// ==================== 成员管理操作 ====================

/**
 * 获取团队成员列表
 */
export async function getTeamMembers(teamId: string): Promise<ApiResponse<TeamMemberConfig[]>> {
    return apiRequest<TeamMemberConfig[]>(`/teams/${teamId}/members`);
}

/**
 * 添加单个团队成员
 */
export async function addTeamMember(
    teamId: string, 
    input: AddTeamMemberInput
): Promise<ApiResponse<TeamMemberConfig>> {
    return apiRequest<TeamMemberConfig>(`/teams/${teamId}/members`, {
        method: 'POST',
        body: JSON.stringify(input),
    });
}

/**
 * 批量添加团队成员
 */
export async function addTeamMembers(
    teamId: string, 
    inputs: AddTeamMemberInput[]
): Promise<ApiResponse<TeamMemberConfig[]>> {
    return apiRequest<TeamMemberConfig[]>(`/teams/${teamId}/members`, {
        method: 'POST',
        body: JSON.stringify(inputs),
    });
}

/**
 * 更新团队成员信息
 */
export async function updateTeamMember(
    teamId: string, 
    memberId: string, 
    input: UpdateTeamMemberInput
): Promise<ApiResponse<TeamMemberConfig>> {
    return apiRequest<TeamMemberConfig>(`/teams/${teamId}/members/${memberId}`, {
        method: 'PUT',
        body: JSON.stringify(input),
    });
}

/**
 * 移除团队成员
 */
export async function removeTeamMember(
    teamId: string, 
    memberId: string
): Promise<ApiResponse<TeamOperationResult>> {
    return apiRequest<TeamOperationResult>(`/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
    });
}

// ==================== 便捷操作函数 ====================

/**
 * 切换成员的领导者状态
 */
export async function toggleMemberLeadership(
    teamId: string, 
    memberId: string, 
    isLeader: boolean
): Promise<ApiResponse<TeamMemberConfig>> {
    return updateTeamMember(teamId, memberId, { isLeader });
}

/**
 * 获取团队的领导者列表
 */
export async function getTeamLeaders(teamId: string): Promise<ApiResponse<TeamMemberConfig[]>> {
    const result = await getTeamMembers(teamId);
    if (result.success && result.data) {
        const leaders = result.data.filter(member => member.isLeader);
        return {
            success: true,
            data: leaders,
        };
    }
    return result;
}

/**
 * 检查智能体是否已经是团队成员
 */
export async function isAgentInTeam(teamId: string, agentId: string): Promise<boolean> {
    const result = await getTeamMembers(teamId);
    if (result.success && result.data) {
        return result.data.some(member => member.agentId === agentId);
    }
    return false;
}

// ==================== 错误处理工具 ====================

/**
 * 处理API错误响应
 */
export function handleApiError(result: ApiResponse, defaultMessage = '操作失败'): string {
    if (result.success) return '';
    
    return result.error || result.message || defaultMessage;
}

/**
 * 显示成功消息
 */
export function getSuccessMessage(result: ApiResponse, defaultMessage = '操作成功'): string {
    if (!result.success) return '';
    
    return result.message || defaultMessage;
}
