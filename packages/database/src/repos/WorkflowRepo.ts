import { Prisma, WorkflowConfig } from "../schema";
import { prisma } from "../client";

// Types for workflow config operations
export interface CreateWorkflowConfigInput {
  name: string;
  version?: string;
  isActive: boolean;
  nodesInfo?: string;
  relation?: string;
  createUser?: string;
}

export interface UpdateWorkflowConfigInput {
  name?: string;
  version?: string;
  isActive?: boolean;
  nodesInfo?: string;
  relation?: string;
}

export interface WorkflowEngineConfig {
  actions: [],
  edges: []
}

// Error types
export class WorkflowConfigExistsError extends Error {
  constructor(message = "该工作流配置已存在") {
    super(message);
    this.name = "WorkflowConfigExistsError";
  }
}

export class WorkflowConfigNotFoundError extends Error {
  constructor(message = "工作流配置未找到") {
    super(message);
    this.name = "WorkflowConfigNotFoundError";
  }
}

export const workflowRepo = Prisma.defineExtension({
    name: "WorkflowRepo",
    model: {
        workflowConfig: {
            async getWorkflowEngineConfigById(id: string): Promise<WorkflowEngineConfig> {

                const workflowConfig = await this.getWorkflowConfigById(id);
                if(workflowConfig == null
                    || workflowConfig.nodesInfo == null
                    || workflowConfig.relation == null) {
                    throw Error("workflow config is bad");
                }

                const workflow = {
                    actions: JSON.parse(workflowConfig.nodesInfo),
                    edges: JSON.parse(workflowConfig.relation)
                } as WorkflowEngineConfig;

                return workflow;
            },
            async createWorkflowConfig(data: CreateWorkflowConfigInput): Promise<WorkflowConfig> {
                // Check if workflow config with this name already exists for the same user
                if (data.createUser) {
                    const existingConfig = await prisma.workflowConfig.findFirst({
                        where: {
                            name: data.name,
                            createUser: data.createUser,
                            isDeleted: false
                        },
                    });

                    if (existingConfig) {
                        throw new WorkflowConfigExistsError('该用户已存在同名的工作流配置');
                    }
                }
                return prisma.workflowConfig.create({
                    data: {
                        name: data.name,
                        version: data.version,
                        isActive: data.isActive,
                        nodesInfo: data.nodesInfo,
                        relation: data.relation,
                        createUser: data.createUser,
                    },
                });
            },
            async getWorkflowConfigById(id: string): Promise<WorkflowConfig | null> {
                return prisma.workflowConfig.findUnique({
                    where: { id },
                });
            },
            async getWorkflowConfigsByUser(createUser: string): Promise<WorkflowConfig[]> {
                return prisma.workflowConfig.findMany({
                    where: {
                        createUser,
                        isDeleted: false
                    },
                    orderBy: { createdTime: 'desc' },
                });
            },
            async getActiveWorkflowConfigs(): Promise<WorkflowConfig[]> {
                return prisma.workflowConfig.findMany({
                    where: {
                        isActive: true,
                        isDeleted: false
                    },
                    orderBy: { createdTime: 'desc' },
                });
            },
            async getAllWorkflowConfigs(limit?: number | undefined): Promise<WorkflowConfig[]> {
                return prisma.workflowConfig.findMany({
                    where: { isDeleted: false },
                    orderBy: { createdTime: 'desc' },
                    take: limit || undefined,
                });
            },
            async getWorkflowConfigByNameAndUser(
                name: string,
                createUser: string
            ): Promise<WorkflowConfig | null> {
                return prisma.workflowConfig.findFirst({
                    where: {
                        name,
                        createUser,
                        isDeleted: false
                    },
                });
            },
            async updateWorkflowConfig(
                id: string,
                data: UpdateWorkflowConfigInput
            ): Promise<WorkflowConfig> {
                const existingConfig = await this.getWorkflowConfigById(id);

                if (!existingConfig) {
                    throw new WorkflowConfigNotFoundError();
                }

                return prisma.workflowConfig.update({
                    where: { id },
                    data: {
                        ...data,
                        updatedTime: new Date(),
                    },
                });
            },
            async toggleWorkflowConfigStatus(id: string): Promise<WorkflowConfig> {
                const existingConfig = await this.getWorkflowConfigById(id);

                if (!existingConfig) {
                    throw new WorkflowConfigNotFoundError();
                }

                return prisma.workflowConfig.update({
                    where: { id },
                    data: {
                        isActive: !existingConfig.isActive,
                        updatedTime: new Date(),
                    },
                });
            },
            async deleteWorkflowConfig(id: string): Promise<WorkflowConfig> {
                const existingConfig = await this.getWorkflowConfigById(id);

                if (!existingConfig) {
                    throw new WorkflowConfigNotFoundError();
                }

                return prisma.workflowConfig.delete({
                    where: { id },
                });
            },
            async softDeleteWorkflowConfig(id: string): Promise<WorkflowConfig> {
                const existingConfig = await this.getWorkflowConfigById(id);

                if (!existingConfig) {
                    throw new WorkflowConfigNotFoundError();
                }

                return prisma.workflowConfig.update({
                    where: { id },
                    data: {
                        isDeleted: true,
                        deletedAt: new Date(),
                        updatedTime: new Date(),
                    },
                });
            },
            async duplicateWorkflowConfig(
                id: string,
                newName: string,
                createUser?: string
            ): Promise<WorkflowConfig> {
                const existingConfig = await this.getWorkflowConfigById(id);

                if (!existingConfig) {
                    throw new WorkflowConfigNotFoundError();
                }

                // Check if config with new name already exists for the user
                if (createUser) {
                    const duplicateConfig = await this.getWorkflowConfigByNameAndUser(newName, createUser);
                    if (duplicateConfig) {
                        throw new WorkflowConfigExistsError('该用户已存在同名的工作流配置');
                    }
                }

                return prisma.workflowConfig.create({
                    data: {
                        name: newName,
                        version: existingConfig.version,
                        isActive: false, // New duplicate starts as inactive
                        nodesInfo: existingConfig.nodesInfo,
                        relation: existingConfig.relation,
                        createUser: createUser || existingConfig.createUser,
                    },
                });
            },
            async saveCurrentWorkflow(
                workflowId: string,
                workflowName: string,
                nodesToSave: any[],
                edgesToSave: any[],
                createUser: string
            ): Promise<WorkflowConfig> {
                // Convert arrays to JSON strings for storage
                const nodesInfo = JSON.stringify(nodesToSave);
                const relation = JSON.stringify(edgesToSave);

                // Check if workflow already exists by ID
                const existingConfig = await this.getWorkflowConfigById(workflowId);

                if (existingConfig) {
                    // Update existing workflow
                    return prisma.workflowConfig.update({
                        where: { id: workflowId },
                        data: {
                            name: workflowName,
                            nodesInfo,
                            relation,
                            updatedTime: new Date(),
                        },
                    });
                } else {
                    // Create new workflow with the specific ID
                    return prisma.workflowConfig.create({
                        data: {
                            id: workflowId, // Use the provided workflowId as the database ID
                            name: workflowName,
                            version: "1.0",
                            isActive: false,
                            nodesInfo,
                            relation,
                            createUser,
                        },
                    });
                }
            }
        }
    }
})