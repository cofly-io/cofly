import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@repo/database';

/**
 * 获取单个智能体
 * GET /api/agents/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🤖 GET /api/agents/[id] 开始, ID:', id);
    
    const agent = await prisma.aiAgent.findUnique({
      where: { id },
      include: {
        connectConfig: true // 包含连接配置信息
      }
    });

    if (!agent) {
      return NextResponse.json({
        success: false,
        error: '智能体不存在'
      }, { status: 404 });
    }

    // 获取 MCP 关联，包含 MCP 名称信息
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
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
            version: true
          }
        }
      }
    });

    // 获取连接关联
    const connectRelations = await prisma.agentConnect.findMany({
      where: { agentId: agent.id },
      select: { connectId: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        prompt: agent.prompt,
        avatar: agent.avatar,
        modelId: agent.modelId || '',
        modelName: agent.modelName,
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
        // 添加工作流信息
        workflows: workflowRelations.map(rel => ({
          id: rel.workflow.id,
          name: rel.workflow.name,
          type: rel.workflow.version || 'workflow'
        })),
        connectIds: connectRelations.map(rel => rel.connectId),
        createUser: agent.createUser
      }
    });

  } catch (error) {
    console.error('🤖 GET /api/agents/[id] 异常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取智能体失败'
    }, { status: 500 });
  }
}

/**
 * 更新智能体
 * PUT /api/agents/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🤖 PUT /api/agents/[id] 开始, ID:', id);
    
    const body = await request.json();
    console.log('🤖 接收到的更新数据:', body);
    
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

    // 准备更新数据
    const updateData: any = {};
    
    if (body.name) {
      updateData.name = body.name;
    }
    
    if (body.description) {
      updateData.description = body.description;
    }
    
    if (body.prompt !== undefined) {
      updateData.prompt = body.prompt;
    }
    
    if (body.avatar !== undefined) {
      updateData.avatar = body.avatar;
    }
    
    if (body.modelId) {
      updateData.modelId = body.modelId;
    }
    
    if (body.modelName !== undefined) {
      updateData.modelName = body.modelName;
    }
    
    if (body.connectId) {
      updateData.connectid = body.connectId;
    }
    
    // 处理直接传递的mcpmode字段
    if (body.mcpmode !== undefined) {
      // 解析现有的agentinfo
      let existingConfig: any = {};
      if (existingAgent.agentinfo) {
        try {
          existingConfig = JSON.parse(existingAgent.agentinfo);
        } catch (e) {
          console.warn('解析现有agentinfo失败，将使用空对象');
        }
      }
      
      // 更新mcpmode
      const configData = { ...existingConfig };
      if (body.mcpmode !== 'prompt') {
        configData.mcpmode = body.mcpmode;
      } else {
        delete configData.mcpmode;
      }
      
      // 更新agentinfo
      if (Object.keys(configData).length > 0) {
        updateData.agentinfo = JSON.stringify(configData);
      } else {
        updateData.agentinfo = null;
      }
    }
    
    // 处理ModelConfig配置数据
    if (body.modelConfig) {
      // 解析现有的agentinfo
      let existingConfig: any = {};
      if (existingAgent.agentinfo) {
        try {
          existingConfig = JSON.parse(existingAgent.agentinfo);
        } catch (e) {
          console.warn('解析现有agentinfo失败，将使用空对象');
        }
      }
      
      // 合并配置，只更新有变化的字段
      const configData = { ...existingConfig };
      
      if (body.modelConfig.useInternet !== undefined) {
        if (body.modelConfig.useInternet !== false) {
          configData.useInternet = body.modelConfig.useInternet;
        } else {
          delete configData.useInternet;
        }
      }
      if (body.modelConfig.useWorkflow !== undefined) {
        if (body.modelConfig.useWorkflow !== false) {
          configData.useWorkflow = body.modelConfig.useWorkflow;
        } else {
          delete configData.useWorkflow;
        }
      }
      if (body.modelConfig.useConnection !== undefined) {
        if (body.modelConfig.useConnection !== false) {
          configData.useConnection = body.modelConfig.useConnection;
        } else {
          delete configData.useConnection;
        }
      }
      if (body.modelConfig.maxTokens !== undefined) {
        if (body.modelConfig.maxTokens !== 512) {
          configData.maxTokens = body.modelConfig.maxTokens;
        } else {
          delete configData.maxTokens;
        }
      }
      if (body.modelConfig.enableThinking !== undefined) {
        if (body.modelConfig.enableThinking !== false) {
          configData.enableThinking = body.modelConfig.enableThinking;
        } else {
          delete configData.enableThinking;
        }
      }
      if (body.modelConfig.thinkingBudget !== undefined) {
        if (body.modelConfig.thinkingBudget !== 4096) {
          configData.thinkingBudget = body.modelConfig.thinkingBudget;
        } else {
          delete configData.thinkingBudget;
        }
      }
      if (body.modelConfig.minP !== undefined) {
        if (body.modelConfig.minP !== 0.05) {
          configData.minP = body.modelConfig.minP;
        } else {
          delete configData.minP;
        }
      }
      if (body.modelConfig.topP !== undefined) {
        if (body.modelConfig.topP !== 0.7) {
          configData.topP = body.modelConfig.topP;
        } else {
          delete configData.topP;
        }
      }
      if (body.modelConfig.topK !== undefined) {
        if (body.modelConfig.topK !== 50) {
          configData.topK = body.modelConfig.topK;
        } else {
          delete configData.topK;
        }
      }
      if (body.modelConfig.temperature !== undefined) {
        if (body.modelConfig.temperature !== 0.7) {
          configData.temperature = body.modelConfig.temperature;
        } else {
          delete configData.temperature;
        }
      }
      if (body.modelConfig.frequencyPenalty !== undefined) {
        if (body.modelConfig.frequencyPenalty !== 1) {
          configData.frequencyPenalty = body.modelConfig.frequencyPenalty;
        } else {
          delete configData.frequencyPenalty;
        }
      }
      if (body.modelConfig.maxIter !== undefined) {
        if (body.modelConfig.maxIter !== 5) {
          configData.maxIter = body.modelConfig.maxIter;
        } else {
          delete configData.maxIter;
        }
      }
      if (body.modelConfig.mcpMode !== undefined) {
        if (body.modelConfig.mcpMode !== 'prompt') {
          configData.mcpMode = body.modelConfig.mcpMode;
        } else {
          delete configData.mcpMode;
        }
      }
      
      // 如果有配置数据，则转换为JSON字符串，否则设为null
      if (Object.keys(configData).length > 0) {
        updateData.agentinfo = JSON.stringify(configData);
      } else {
        updateData.agentinfo = null;
      }
    }

    // 使用事务更新
    const result = await prisma.$transaction(async (tx) => {
      // 更新智能体基本信息
      const updatedAgent = await tx.aiAgent.update({
        where: { id },
        data: updateData,
        include: {
          connectConfig: true // 包含连接配置信息
        }
      });

      // 如果提供了 mcpIds，更新 MCP 关联
      if (body.mcpIds !== undefined) {
        // 删除原有关联
        await tx.agentMcp.deleteMany({
          where: { agentId: id }
        });

        // 创建新关联
        if (body.mcpIds.length > 0) {
          await tx.agentMcp.createMany({
            data: body.mcpIds.map((mcpId: string) => ({
              agentId: id,
              mcpId: mcpId
            }))
          });
        }
      }

      // 如果提供了 workflowIds，更新工作流关联
      if (body.workflowIds !== undefined) {
        // 删除原有关联
        await tx.agentWorkflow.deleteMany({
          where: { agentId: id }
        });

        // 创建新关联
        if (body.workflowIds.length > 0) {
          await tx.agentWorkflow.createMany({
            data: body.workflowIds.map((workflowId: string) => ({
              agentId: id,
              workflowId: workflowId
            }))
          });
        }
      }

      // 如果提供了 connectIds，更新连接关联
      if (body.connectIds !== undefined) {
        // 删除原有关联
        await tx.agentConnect.deleteMany({
          where: { agentId: id }
        });

        // 创建新关联
        if (body.connectIds.length > 0) {
          await tx.agentConnect.createMany({
            data: body.connectIds.map((connectId: string) => ({
              agentId: id,
              connectId: connectId
            }))
          });
        }
      }

      return updatedAgent;
    });

    // 获取更新后的 MCP 关联
    const mcpRelations = await prisma.agentMcp.findMany({
      where: { agentId: id },
      select: { mcpId: true }
    });

    // 获取更新后的工作流关联
    const workflowRelations = await prisma.agentWorkflow.findMany({
      where: { agentId: id },
      select: { workflowId: true }
    });

    // 获取更新后的连接关联
    const connectRelations = await prisma.agentConnect.findMany({
      where: { agentId: id },
      select: { connectId: true }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        name: result.name,
        description: result.description,
        prompt: result.prompt,
        avatar: result.avatar,
        modelId: result.modelId || '',
        modelName: result.modelName,
        connectid: result.connectid,
        connectConfig: result.connectConfig, // 添加连接配置信息
        agentinfo: result.agentinfo,
        mcpIds: mcpRelations.map(rel => rel.mcpId),
        workflowIds: workflowRelations.map(rel => rel.workflowId),
        connectIds: connectRelations.map(rel => rel.connectId),
        createUser: result.createUser
      },
      message: '智能体更新成功'
    });

  } catch (error) {
    console.error('🤖 PUT /api/agents/[id] 异常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '更新智能体失败'
    }, { status: 500 });
  }
}

/**
 * 删除智能体
 * DELETE /api/agents/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🤖 DELETE /api/agents/[id] 开始, ID:', id);
    
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

      // 删除工作流关联
      await tx.agentWorkflow.deleteMany({
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
    console.error('🤖 DELETE /api/agents/[id] 异常:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '删除智能体失败'
    }, { status: 500 });
  }
}