import { NextRequest, NextResponse } from 'next/server';
import { initializeConnects } from '@repo/node-set';
import { IDatabaseConnect, IDatabaseMetadataOptions, ILLMConnect, ILLMMetadataOptions } from '@repo/common';
import { prisma } from "@repo/database";

/**
 * 通用的连接实例获取和验证函数
 */
async function getAndValidateConnectInstance(
    provider: string,
    mtype: 'db' | 'llm'
): Promise<{ success: boolean; instance?: any; error?: string; status?: number }> {
    const connectRegistry = await initializeConnects();
    const connectInstance = mtype === 'db' 
        ? connectRegistry.getConnectById(provider) as IDatabaseConnect
        : connectRegistry.getConnectById(provider) as ILLMConnect;

    if (!connectInstance) {
        const errorMsg = mtype === 'db' 
            ? `连接类型不存在: ${provider}`
            : `该连接未获取在线模型列表[${provider}]`;
        return {
            success: false,
            error: errorMsg,
            status: 404
        };
    }

    // 检查节点是否支持metadata方法
    if (!connectInstance.metadata) {
        const errorMsg = mtype === 'db' 
            ? `连接类型不支持元数据获取: ${provider}`
            : `该连接未获取在线模型列表[${provider}]`;
        return {
            success: false,
            error: errorMsg,
            status: 400
        };
    }

    return {
        success: true,
        instance: connectInstance
    };
}

/**
 * 构建数据库元数据选项
 */
function buildDatabaseMetadataOptions(
    connectInfo: any,
    search: string | null
): IDatabaseMetadataOptions {
    return {
        host: connectInfo.host || 'localhost',
        port: connectInfo.port || 3306,
        database: connectInfo.database,
        user: connectInfo.username || connectInfo.user,
        password: connectInfo.password || '',
        connectTimeout: (connectInfo.connectTimeout || 30) * 1000,
        ssl: connectInfo.ssl || false,
        charset: connectInfo.charset || 'utf8mb4',
        search: search || undefined,
    };
}

/**
 * 构建LLM元数据选项
 */
function buildLLMMetadataOptions(
    connectInfo: any,
    search: string | null
): ILLMMetadataOptions {
    return {
        connectInfo: {
            apiKey: connectInfo.apiKey,
            baseUrl: connectInfo.baseUrl
        },
        search: search || undefined,
    };
}

/**
 * GET /api/nodes/[nodeID]/metadata
 * 获取节点的元数据（如表名、列名等）
 **/
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ connectId: string }> }
) {
    try {
        const { connectId } = await params;
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        // 根据ID获取connect的配置信息
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

        const provider = connectConfig.cType;
        const mtype = connectConfig.mType as 'db' | 'llm';

        // 验证连接类型
        if (mtype !== 'db' && mtype !== 'llm') {
            return NextResponse.json(
                {
                    success: false,
                    error: '不支持该节点类型'
                },
                { status: 400 }
            );
        }

        // 获取和验证连接实例
        const validation = await getAndValidateConnectInstance(provider, mtype);
        if (!validation.success) {
            return NextResponse.json(
                {
                    success: false,
                    error: validation.error
                },
                { status: validation.status! }
            );
        }

        const connectInstance = validation.instance!;
        const connectInfo = JSON.parse(connectConfig.configInfo);

        // 根据类型构建元数据选项并执行
        let result;
        if (mtype === 'db') {
            const metadataOptions = buildDatabaseMetadataOptions(connectInfo, search);
            result = await connectInstance.metadata(metadataOptions);
        } else { // mtype === 'llm'
            const metadataOptions = buildLLMMetadataOptions(connectInfo, search);
            result = await connectInstance.metadata(metadataOptions);
        }

        return NextResponse.json(result);

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