import { NextRequest, NextResponse } from 'next/server';
import { initializeConnects } from '@repo/node-set';
import { IDatabaseConnect, IDatabaseMetadataOptions } from '@repo/common';
import { prisma } from "@repo/database";

/**
 * GET /api/nodes/[nodeID]/metadata
 * 获取节点的元数据（如表名、列名等）
 * 
 * 查询参数:
 * - type: 元数据类型 ('tables' | 'columns' | 'schemas')
 * - datasourceId: 数据源ID
 * - tableName: 表名（获取列名时需要）
 * - search: 搜索关键词（可选）
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ connectId: string }> }
) {
    try {
        const { connectId } = await params; // nodeID实际上是nodeKind
        const { searchParams } = new URL(request.url);

        if (!connectId) {
            return NextResponse.json(
                {
                    success: false,
                    error: '缺少必填参数: connectId'
                },
                { status: 400 }
            );
        }

        const connectConfig = await prisma.connectConfig.findUnique({
            where: { id: connectId }
        });

        if (!connectConfig) {
            return NextResponse.json({
                success: false,
                error: '连接不存在'
            }, {
                status: 404
            });
        }

        const mtype = connectConfig.mtype;

        if (mtype === 'db') {
            const provider = connectConfig.ctype;
            const type = searchParams.get('type') as 'tables' | 'columns' | 'schemas' | 'models';
            const tableName = searchParams.get('tableName');
            const search = searchParams.get('search');

            // 验证必填参数
            if (!type) {
                return NextResponse.json(
                    {
                        success: false,
                        error: '缺少必填参数: type'
                    },
                    { status: 400 }
                );
            }

            // 获取节点实例 - 先尝试通过ID获取，如果没有则通过provider获取
            const connectRegistry = await initializeConnects();
            let connectInstance = connectRegistry.getConnectById(provider) as IDatabaseConnect;
            
            if (!connectInstance) {
                // 如果通过ID找不到，尝试通过provider查找
                connectInstance = connectRegistry.getConnectsByProvider(provider).pop() as IDatabaseConnect;
            }
            
            if (!connectInstance) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `连接类型不存在: ${provider}`
                    },
                    { status: 404 }
                );
            }

            // 检查节点是否支持metadata方法
            if (!connectInstance.metadata) {
                return NextResponse.json(
                    {
                        success: false,
                         error: `该连接未获取在线模型列表[${provider}]`
                    },
                    { status: 400 }
                );
            }

            // 构建metadata选项
            const metadataOptions: IDatabaseMetadataOptions = {
                type,
                datasourceId: connectId,
                tableName: tableName || undefined,
                search: search || undefined,
            };

            // 调用节点的metadata方法
            const result = await connectInstance.metadata(metadataOptions);

            return NextResponse.json(result);
        } else if (mtype === 'llm') {
            const provider = connectConfig.ctype;
            const type = searchParams.get('type') as 'models';
            const search = searchParams.get('search');

            // 验证必填参数
            if (!type) {
                return NextResponse.json(
                    {
                        success: false,
                        error: '缺少必填参数: type'
                    },
                    { status: 400 }
                );
            }


            // 获取节点实例 - 先尝试通过ID获取，如果没有则通过provider获取
            const connectRegistry = await initializeConnects();
            let connectInstance = connectRegistry.getConnectById(provider) as IDatabaseConnect;
            
            if (!connectInstance) {
                // 如果通过ID找不到，尝试通过provider查找
                connectInstance = connectRegistry.getConnectsByProvider(provider).pop() as IDatabaseConnect;
            }
            
            if (!connectInstance) {
                return NextResponse.json(
                    {
                        success: false,
                        error:  `该连接未获取在线模型列表[${provider}]`
                    },
                    { status: 404 }
                );
            }

            // 检查节点是否支持metadata方法
            if (!connectInstance.metadata) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `该连接未获取在线模型列表[${provider}]`
                    },
                    { status: 400 }
                );
            }

            // 构建metadata选项
            const metadataOptions: IDatabaseMetadataOptions = {
                type,
                datasourceId: connectId,
                search: search || undefined,
            };

            // 调用节点的metadata方法
            const result = await connectInstance.metadata(metadataOptions);
            return NextResponse.json(result);
        }

        return NextResponse.json(
            {
                success: false,
                error: '不支持该节点类型'
            },
            { status: 400 }
        );
    } catch (error) {
        console.error('❌ [Node Metadata API] 执行失败:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}