import { NextRequest, NextResponse } from 'next/server';
import { teamManager, AddTeamMemberInput } from '@repo/common';
import { initializeServer } from '@/lib/serverInit';

/**
 * 获取团队成员列表
 * GET /api/teams/[id]/members
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 确保服务器已初始化
        await initializeServer();

        const { id } = await params;
        const members = await teamManager.mediator.getMembers(id);

        return NextResponse.json({
            success: true,
            data: members || []
        });
    } catch (error) {
        console.error('获取团队成员失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '获取团队成员失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}

/**
 * 添加团队成员
 * POST /api/teams/[id]/members
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 确保服务器已初始化
        await initializeServer();

        const body = await request.json();

        // 支持单个成员和批量添加
        if (Array.isArray(body)) {
            // 批量添加
            const inputs: AddTeamMemberInput[] = body.map(item => ({
                agentId: item.agentId,
                isLeader: item.isLeader || false,
            }));

            // 验证输入
            for (const input of inputs) {
                if (!input.agentId || input.agentId.trim() === '') {
                    return NextResponse.json(
                        {
                            success: false,
                            error: '智能体ID不能为空'
                        },
                        { status: 400 }
                    );
                }
            }

            const { id } = await params;
            const members = await teamManager.mediator.addMembers(id, inputs);

            return NextResponse.json({
                success: true,
                data: members,
                message: `成功添加 ${members.length} 个成员`
            }, { status: 201 });
        } else {
            // 单个添加
            const input: AddTeamMemberInput = {
                agentId: body.agentId,
                isLeader: body.isLeader || false,
            };

            // 验证输入
            if (!input.agentId || input.agentId.trim() === '') {
                return NextResponse.json(
                    {
                        success: false,
                        error: '智能体ID不能为空'
                    },
                    { status: 400 }
                );
            }

            const { id } = await params;
            const member = await teamManager.mediator.addMember(id, input);

            return NextResponse.json({
                success: true,
                data: member,
                message: '成员添加成功'
            }, { status: 201 });
        }
    } catch (error) {
        console.error('添加团队成员失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: '添加团队成员失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}