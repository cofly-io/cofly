import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@repo/database';

// PUT - 更新 MCP 配置
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 验证必需的字段
        if (!id) {
            return NextResponse.json({
                success: false,
                error: '缺少 MCP 配置 ID'
            }, { status: 400 });
        }

        const body = await request.json();
        const { name, type, mcpinfo } = body;
        if (!name || !type || !mcpinfo) {
            return NextResponse.json({
                success: false,
                error: '缺少必需的字段：name、type、mcpinfo'
            }, { status: 400 });
        }

        // 检查 MCP 配置是否存在
        const existingMcp = await prisma.aiMcp.findUnique({
            where: { id }
        });

        if (!existingMcp) {
            return NextResponse.json({
                success: false,
                error: 'MCP 配置不存在'
            }, { status: 404 });
        }

        // 确保 mcpinfo 是字符串格式
        let mcpinfoString = typeof mcpinfo === 'string' ? mcpinfo : JSON.stringify(mcpinfo);

        // 更新 MCP 配置记录
        const updatedMcp = await prisma.aiMcp.update({
            where: { id },
            data: {
                name: name.trim(),
                type: type,
                mcpinfo: mcpinfoString,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedMcp,
            message: 'MCP配置更新成功'
        });
    } catch (error) {
        console.error('Error updating MCP config:', error);
        return NextResponse.json({
            success: false,
            error: '更新 MCP 配置失败'
        }, { status: 500 });
    }
}

// DELETE - 删除 MCP 配置
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({
                success: false,
                error: '缺少 MCP 配置 ID'
            }, { status: 400 });
        }

        // 检查 MCP 配置是否存在
        const mcpConfig = await prisma.aiMcp.findUnique({
            where: { id }
        });

        if (!mcpConfig) {
            return NextResponse.json({
                success: false,
                error: 'MCP 配置不存在'
            }, { status: 404 });
        }

        // 检查是否有智能体正在使用此 MCP
        const agentMcpRelations = await prisma.agentMcp.findMany({
            where: { mcpId: id },
            include: {
                agent: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (agentMcpRelations.length > 0) {
            // 获取使用此 MCP 的智能体名称
            const agentNames = agentMcpRelations.map(relation => relation.agent.name);

            return NextResponse.json({
                success: false,
                error: `${agentNames.join('、')}智能体引用了该MCP无法删除，请先将该工具与智能体解除关系`,
                referencedAgents: agentNames
            }, { status: 400 });
        }

        // 如果没有被引用，删除 MCP 配置
        await prisma.aiMcp.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'MCP 配置删除成功'
        });

    } catch (error) {
        console.error('Error deleting MCP config:', error);
        return NextResponse.json({
            success: false,
            error: '删除 MCP 配置失败'
        }, { status: 500 });
    }
}