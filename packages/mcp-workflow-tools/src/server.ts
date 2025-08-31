import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { createMcpHandler } from "mcp-handler";
import { z } from 'zod';

// 定义工具参数的Zod schemas
const WorkflowCreateSchema = z.object({
  name: z.string().min(1, "工作流名称不能为空"),
  version: z.string().optional().default("1.0.0"),
  isActive: z.boolean().optional().default(true),
  nodesInfo: z.array(z.any()).optional().default([]),
  relation: z.array(z.any()).optional().default([]),
  createUser: z.string().optional().default("mcp-user"),
  description: z.string().optional()
});

const WorkflowListSchema = z.object({
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
  activeOnly: z.boolean().optional().default(false),
  search: z.string().optional()
});

const WorkflowGetSchema = z.object({
  id: z.string().min(1, "工作流ID不能为空")
});

const WorkflowUpdateSchema = z.object({
  id: z.string().min(1, "工作流ID不能为空"),
  name: z.string().optional(),
  version: z.string().optional(),
  isActive: z.boolean().optional(),
  nodesInfo: z.array(z.any()).optional(),
  relation: z.array(z.any()).optional(),
  description: z.string().optional()
});

const WorkflowDeleteSchema = z.object({
  id: z.string().min(1, "工作流ID不能为空")
});

const GetNodesSchema = z.object({
  kind: z.string().optional()
});

const GetConnectsSchema = z.object({
  type: z.string().optional(),
  provider: z.string().optional()
});

// 工具服务接口定义
export interface WorkflowService {
  createWorkflowConfig(data: any): Promise<any>;
  getAllWorkflowConfigs(): Promise<any[]>;
  getWorkflowConfigById(id: string): Promise<any | null>;
  updateWorkflowConfig(id: string, data: any): Promise<any>;
  deleteWorkflowConfig(id: string): Promise<any>;
}

export interface NodeService {
  getNodeRegistry(): any;
}

export interface ConnectService {
  getConnectRegistry(): any;
}

// 创建MCP服务器的工厂函数
export function createCoflowMcpServer(
  workflowService: WorkflowService,
  nodeService: NodeService,
  connectService: ConnectService
) {
    return createMcpHandler(
        server => {

            // 注册workflow-create工具
            server.tool(
                'workflow-create',
                WorkflowCreateSchema.shape,
                {
                    description: '创建新的工作流配置。支持设置工作流名称、版本、节点信息和关系配置。'
                },
                async (args): Promise<CallToolResult> => {
                    try {
                        const result = await workflowService.createWorkflowConfig({
                            name: args.name,
                            version: args.version,
                            isActive: args.isActive,
                            nodesInfo: JSON.stringify(args.nodesInfo),
                            relation: JSON.stringify(args.relation),
                            createUser: args.createUser
                        });

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        data: result,
                                        message: `工作流 "${args.name}" 创建成功`
                                    }, null, 2)
                                }
                            ]
                        };
                    } catch (error) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: false,
                                        error: error instanceof Error ? error.message : '创建工作流失败'
                                    }, null, 2)
                                }
                            ]
                        };
                    }
                }
            );

            // 注册workflow-list工具
            server.tool(
                'workflow-list',
                WorkflowListSchema.shape,
                {
                    description: '获取工作流配置列表。支持分页、搜索和按状态过滤。'
                },
                async (args): Promise<CallToolResult> => {
                    try {
                        const configs = await workflowService.getAllWorkflowConfigs();

                        // 应用过滤和分页
                        let filteredConfigs = configs;
                        if (args.activeOnly) {
                            filteredConfigs = configs.filter(config => config.isActive);
                        }
                        if (args.search) {
                            filteredConfigs = filteredConfigs.filter(config =>
                                config.name.toLowerCase().includes(args.search!.toLowerCase())
                            );
                        }

                        const startIndex = args.offset;
                        const endIndex = startIndex + args.limit;
                        const paginatedConfigs = filteredConfigs.slice(startIndex, endIndex);

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        data: {
                                            data: paginatedConfigs,
                                            total: filteredConfigs.length,
                                            limit: args.limit,
                                            offset: args.offset
                                        },
                                        message: `获取 ${paginatedConfigs.length} 个工作流配置`
                                    }, null, 2)
                                }
                            ]
                        };
                    } catch (error) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: false,
                                        error: error instanceof Error ? error.message : '获取工作流列表失败'
                                    }, null, 2)
                                }
                            ]
                        };
                    }
                }
            );

            // 注册workflow-get工具
            server.tool(
                'workflow-get',
                WorkflowGetSchema.shape,
                {
                    description: '根据ID获取特定工作流配置的详细信息。'
                },
                async (args): Promise<CallToolResult> => {
                    try {
                        const result = await workflowService.getWorkflowConfigById(args.id);

                        if (!result) {
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({
                                            success: false,
                                            error: `工作流 ${args.id} 不存在`
                                        }, null, 2)
                                    }
                                ]
                            };
                        }

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        data: result,
                                        message: `获取工作流 "${result.name}" 成功`
                                    }, null, 2)
                                }
                            ]
                        };
                    } catch (error) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: false,
                                        error: error instanceof Error ? error.message : '获取工作流失败'
                                    }, null, 2)
                                }
                            ]
                        };
                    }
                }
            );

            // 注册workflow-update工具
            server.tool(
                'workflow-update',
                WorkflowUpdateSchema.shape,
                {
                    description: '更新现有工作流配置。可以更新名称、版本、状态、节点信息等。'
                },
                async (args): Promise<CallToolResult> => {
                    try {
                        const {id, ...updateData} = args;

                        const result = await workflowService.updateWorkflowConfig(id, {
                            ...updateData,
                            nodesInfo: updateData.nodesInfo ? JSON.stringify(updateData.nodesInfo) : undefined,
                            relation: updateData.relation ? JSON.stringify(updateData.relation) : undefined
                        });

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        data: result,
                                        message: `工作流 "${result.name}" 更新成功`
                                    }, null, 2)
                                }
                            ]
                        };
                    } catch (error) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: false,
                                        error: error instanceof Error ? error.message : '更新工作流失败'
                                    }, null, 2)
                                }
                            ]
                        };
                    }
                }
            );

            // 注册workflow-delete工具
            server.tool(
                'workflow-delete',
                WorkflowDeleteSchema.shape,
                {
                    description: '根据ID删除指定的工作流配置。删除操作不可逆，请谨慎使用。'
                },
                async (args): Promise<CallToolResult> => {
                    try {
                        await workflowService.deleteWorkflowConfig(args.id);

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        message: `工作流 ${args.id} 删除成功`
                                    }, null, 2)
                                }
                            ]
                        };
                    } catch (error) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: false,
                                        error: error instanceof Error ? error.message : '删除工作流失败'
                                    }, null, 2)
                                }
                            ]
                        };
                    }
                }
            );

            // 注册get-nodes工具
            server.tool(
                'get-nodes',
                GetNodesSchema.shape,
                {
                    description: '获取所有可用的节点信息，按分类组织。可以指定kind参数获取特定类型的节点。'
                },
                async (args): Promise<CallToolResult> => {
                    try {
                        const nodeRegistry = nodeService.getNodeRegistry();

                        if (args.kind) {
                            const node = nodeRegistry.getNodeByKind(args.kind);
                            if (!node) {
                                return {
                                    content: [
                                        {
                                            type: 'text',
                                            text: JSON.stringify({
                                                success: false,
                                                error: `未找到类型为 "${args.kind}" 的节点`
                                            }, null, 2)
                                        }
                                    ]
                                };
                            }

                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({
                                            success: true,
                                            data: {node},
                                            message: `获取节点 "${args.kind}" 成功`
                                        }, null, 2)
                                    }
                                ]
                            };
                        } else {
                            const categories = nodeRegistry.getAllCategories();
                            const nodesByCategory = nodeRegistry.getNodesByCategoryNotWithDetail();

                            const result = categories.map((category: any) => ({
                                ...category,
                                nodes: nodesByCategory[category.id] || []
                            }));

                            const totalNodes = result.reduce((sum: number, cat: any) => sum + cat.nodes.length, 0);

                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({
                                            success: true,
                                            data: {
                                                dataSource: result,
                                                statistics: {
                                                    categoriesCount: result.length,
                                                    totalNodes
                                                }
                                            },
                                            message: `获取 ${result.length} 个分类，共 ${totalNodes} 个节点`
                                        }, null, 2)
                                    }
                                ]
                            };
                        }
                    } catch (error) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: false,
                                        error: error instanceof Error ? error.message : '获取节点信息失败'
                                    }, null, 2)
                                }
                            ]
                        };
                    }
                }
            );

            // 注册get-connects工具
            server.tool(
                'get-connects',
                GetConnectsSchema.shape,
                {
                    description: '获取所有可用的连接配置信息。支持按类型(type)和提供商(provider)过滤。'
                },
                async (args): Promise<CallToolResult> => {
                    try {
                        const registry = connectService.getConnectRegistry();

                        let connects;
                        if (args.type) {
                            connects = registry.getConnectsByType(args.type as any);
                        } else if (args.provider) {
                            connects = registry.getConnectsByProvider(args.provider);
                        } else {
                            connects = registry.getAllConnects();
                        }

                        const formattedConnects = connects.map((connect: any) => ({
                            id: connect.overview.id,
                            name: connect.overview.name,
                            type: connect.overview.type,
                            provider: connect.overview.provider,
                            icon: connect.overview.icon,
                            description: connect.overview.description,
                            version: connect.overview.version,
                            ...(connect.overview.type === 'llm' && {tags: connect.overview.tags || []}),
                            validateConnection: connect.detail.validateConnection || false,
                            connectionTimeout: connect.detail.connectionTimeout
                        }));

                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: true,
                                        data: {
                                            connects: formattedConnects,
                                            total: formattedConnects.length,
                                            filters: {
                                                type: args.type || null,
                                                provider: args.provider || null
                                            }
                                        },
                                        message: `获取 ${formattedConnects.length} 个连接${args.type ? ` (类型: ${args.type})` : ''}${args.provider ? ` (提供商: ${args.provider})` : ''}`
                                    }, null, 2)
                                }
                            ]
                        };
                    } catch (error) {
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: false,
                                        error: error instanceof Error ? error.message : '获取连接信息失败'
                                    }, null, 2)
                                }
                            ]
                        };
                    }
                }
            );

            return server;
        },
        {
            capabilities: {},
        },
        {
            streamableHttpEndpoint: '/streamable',
            sseEndpoint: '/sse',
            sseMessageEndpoint: '/message',
            basePath: '/',
        })
};