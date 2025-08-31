import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

/**
 * 获取智能体列表
 * GET /api/agents
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const createUser = searchParams.get('createUser');
    const excludeFields = searchParams.get('excludeFields')?.split(',') || [];
    
    const where: any = {};
    if (createUser) {
      where.createUser = createUser;
    }
    
    // 根据excludeFields动态构建查询
    const includePrompt = !excludeFields.includes('prompt');
    
    // 获取智能体基本信息，包含连接配置
    const agents = await prisma.aiAgent.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        avatar: true,
        modelId: true,
        modelName: true,
        connectid: true,
        agentinfo: true, // 添加agentinfo字段
        createUser: true,
        createdAt: true,
        updatedAt: true,
        ...(includePrompt && { prompt: true }),
        connectConfig: true // 包含连接配置信息
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 获取每个智能体的 MCP 关联，包含 MCP 名称信息
    const agentData = await Promise.all(agents.map(async (agent) => {
      const mcpRelations = await prisma.agentMcp.findMany({
        where: { agentId: agent.id },
        include: {
          mcp: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        }
      });

      // 获取工作流关联
      const workflowRelations = await prisma.agentWorkflow.findMany({
        where: { agentId: agent.id },
        select: { workflowId: true }
      });

      // 获取连接关联
      const connectRelations = await prisma.agentConnect.findMany({
        where: { agentId: agent.id },
        select: { connectId: true }
      });

      const baseData = {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        avatar: agent.avatar,
        modelId: agent.modelId || agent.connectid, // 临时兼容处理
        modelName: agent.modelName || '未选择模型',
        connectid: agent.connectid,
        connectConfig: agent.connectConfig, // 添加连接配置信息
        agentinfo: agent.agentinfo, // 添加agentinfo字段
        mcpIds: mcpRelations.map(rel => rel.mcpId),
        // 添加 MCP 工具信息
        mcpTools: mcpRelations.map(rel => ({
          id: rel.mcp.id,
          name: rel.mcp.name,
          type: rel.mcp.type
        })),
        workflowIds: workflowRelations.map(rel => rel.workflowId),
        connectIds: connectRelations.map(rel => rel.connectId),
        createUser: agent.createUser
      };

      // 只有查询了prompt字段才包含
      if (includePrompt && 'prompt' in agent) {
        return { ...baseData, prompt: agent.prompt };
      }

      return baseData;
    }));

    return NextResponse.json({
      success: true,
      data: agentData,
      total: agentData.length
    });

  } catch (error) {
    console.error('🤖 GET /api/agents 异常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取智能体失败'
    }, { status: 500 });
  }
}

/**
 * 创建智能体
 * POST /api/agents
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🤖 POST /api/agents 开始');
    
    const body = await request.json();
    console.log('🤖 接收到的请求体:', body);
    
    const { 
      name, 
      description, 
      prompt, 
      avatar, 
      modelId, 
      modelName, 
      connectId, 
      mcpIds, 
      workflowIds, 
      connectIds, 
      modelConfig,
      createUser 
    } = body;

    // 验证必填字段
    if (!name || !description || !modelId || !connectId) {
      const error = '缺少必填字段：name、description、modelId 或 connectId';
      console.error('❌ 验证失败:', error);
      return NextResponse.json({
        success: false,
        error
      }, { status: 400 });
    }

    console.log('✅ 字段验证通过');

    // 验证连接配置是否存在
    const connectConfig = await prisma.connectConfig.findUnique({
      where: { id: connectId }
    });

    if (!connectConfig) {
      return NextResponse.json({
        success: false,
        error: '指定的模型配置不存在'
      }, { status: 400 });
    }

    // 如果指定了MCP，验证所有MCP是否存在
    if (mcpIds && mcpIds.length > 0) {
      const mcpConfigs = await prisma.aiMcp.findMany({
        where: { id: { in: mcpIds } }
      });

      if (mcpConfigs.length !== mcpIds.length) {
        return NextResponse.json({
          success: false,
          error: '部分指定的MCP配置不存在'
        }, { status: 400 });
      }
    }

    // 如果指定了工作流，验证所有工作流是否存在
    if (workflowIds && workflowIds.length > 0) {
      const workflowConfigs = await prisma.workflowConfig.findMany({
        where: { id: { in: workflowIds } }
      });

      if (workflowConfigs.length !== workflowIds.length) {
        return NextResponse.json({
          success: false,
          error: '部分指定的工作流配置不存在'
        }, { status: 400 });
      }
    }

    console.log('💾 准备插入数据库...');

    // 构建agentinfo JSON数据
    let agentInfoJson = null;
    if (modelConfig) {
      // 只保存有值且不是默认值的配置项
      const configData: any = {};
      
      if (modelConfig.useInternet !== undefined && modelConfig.useInternet !== false) {
        configData.useInternet = modelConfig.useInternet;
      }
      if (modelConfig.useWorkflow !== undefined && modelConfig.useWorkflow !== false) {
        configData.useWorkflow = modelConfig.useWorkflow;
      }
      if (modelConfig.useConnection !== undefined && modelConfig.useConnection !== false) {
        configData.useConnection = modelConfig.useConnection;
      }
      if (modelConfig.maxTokens !== undefined && modelConfig.maxTokens !== 512) {
        configData.maxTokens = modelConfig.maxTokens;
      }
      if (modelConfig.enableThinking !== undefined && modelConfig.enableThinking !== false) {
        configData.enableThinking = modelConfig.enableThinking;
      }
      if (modelConfig.thinkingBudget !== undefined && modelConfig.thinkingBudget !== 4096) {
        configData.thinkingBudget = modelConfig.thinkingBudget;
      }
      if (modelConfig.minP !== undefined && modelConfig.minP !== 0.05) {
        configData.minP = modelConfig.minP;
      }
      if (modelConfig.topP !== undefined && modelConfig.topP !== 0.7) {
        configData.topP = modelConfig.topP;
      }
      if (modelConfig.topK !== undefined && modelConfig.topK !== 50) {
        configData.topK = modelConfig.topK;
      }
      if (modelConfig.temperature !== undefined && modelConfig.temperature !== 0.7) {
        configData.temperature = modelConfig.temperature;
      }
      if (modelConfig.frequencyPenalty !== undefined && modelConfig.frequencyPenalty !== 1) {
        configData.frequencyPenalty = modelConfig.frequencyPenalty;
      }
      if (modelConfig.maxIter !== undefined && modelConfig.maxIter !== 5) {
        configData.maxIter = modelConfig.maxIter;
      }
      if (modelConfig.mcpMode !== undefined && modelConfig.mcpMode !== 'prompt') {
        configData.mcpMode = modelConfig.mcpMode;
      }
      
      // 如果有配置数据，则转换为JSON字符串
      if (Object.keys(configData).length > 0) {
        agentInfoJson = JSON.stringify(configData);
      }
    }
    
    // 处理直接传递的mcpmode字段
    if (body.mcpmode !== undefined) {
      let configData: any = {};
      
      // 如果已有modelConfig处理的数据，先解析
      if (agentInfoJson) {
        try {
          configData = JSON.parse(agentInfoJson);
        } catch (e) {
          console.warn('解析agentInfoJson失败，将使用空对象');
        }
      }
      
      // 添加mcpmode
      if (body.mcpmode !== 'prompt') {
        configData.mcpmode = body.mcpmode;
      }
      
      // 重新生成JSON
      if (Object.keys(configData).length > 0) {
        agentInfoJson = JSON.stringify(configData);
      }
    }

    // 使用事务保存智能体和关联关系
    const result = await prisma.$transaction(async (tx) => {
      // 保存智能体
      const savedAgent = await tx.aiAgent.create({
        data: {
          name: name,
          description: description,
          prompt: prompt,
          avatar: avatar,
          modelId: modelId,
          modelName: modelName,
          connectid: connectId,
          agentinfo: agentInfoJson,
          createUser: createUser || 'system'
        }
      });

      // 如果有MCP，创建关联关系
      if (mcpIds && mcpIds.length > 0) {
        await tx.agentMcp.createMany({
          data: mcpIds.map((mcpId: string) => ({
            agentId: savedAgent.id,
            mcpId: mcpId
          }))
        });
      }

      // 如果有工作流，创建关联关系
      if (workflowIds && workflowIds.length > 0) {
        await tx.agentWorkflow.createMany({
          data: workflowIds.map((workflowId: string) => ({
            agentId: savedAgent.id,
            workflowId: workflowId
          }))
        });
      }

      // 如果有连接，创建关联关系
      if (connectIds && connectIds.length > 0) {
        await tx.agentConnect.createMany({
          data: connectIds.map((connectId: string) => ({
            agentId: savedAgent.id,
            connectId: connectId
          }))
        });
      }

      return savedAgent;
    });

    console.log('✅ 智能体保存成功:', result.id);

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        name: result.name,
        description: result.description,
        prompt: result.prompt,
        avatar: result.avatar,
        modelId: result.modelId,
        modelName: result.modelName,
        connectid: result.connectid,
        agentinfo: result.agentinfo,
        mcpIds: mcpIds || [],
        workflowIds: workflowIds || [],
        connectIds: connectIds || [],
        createUser: result.createUser
      },
      message: '智能体配置保存成功'
    });

  } catch (error) {
    console.error('🤖 POST /api/agents 异常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '创建智能体失败'
    }, { status: 500 });
  }
}

/**
 * 删除智能体
 * DELETE /api/agents
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('🤖 DELETE /api/agents 开始');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: '缺少智能体 ID'
      }, { status: 400 });
    }
    
    console.log('🤖 要删除的智能体 ID:', id);
    
    // 检查智能体是否存在
    const existingAgent = await prisma.aiAgent.findUnique({
      where: { id }
    });

    if (!existingAgent) {
      return NextResponse.json({
        success: false,
        error: '智能体不存在'
      }, { status: 404 });
    }

    // 使用事务删除
    await prisma.$transaction(async (tx) => {
      // 删除 MCP 关联
      await tx.agentMcp.deleteMany({
        where: { agentId: id }
      });

      // 删除智能体
      await tx.aiAgent.delete({
        where: { id }
      });
    });

    return NextResponse.json({
      success: true,
      message: '智能体删除成功'
    });

  } catch (error) {
    console.error('🤖 DELETE /api/agents 异常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '删除智能体失败'
    }, { status: 500 });
  }
}