import { createCoflowMcpServer, WorkflowService, NodeService, ConnectService } from '@repo/mcp-workflow-tools';
import { getNodeRegistry } from '@repo/common';
import { getConnectRegistry } from '@repo/common';
import { prisma } from '@repo/database';

// 实现服务接口
const workflowService: WorkflowService = {
    createWorkflowConfig: prisma.workflowConfig.createWorkflowConfig,
    getAllWorkflowConfigs: prisma.workflowConfig.getAllWorkflowConfigs,
    getWorkflowConfigById: prisma.workflowConfig.getWorkflowConfigById,
    updateWorkflowConfig: prisma.workflowConfig.updateWorkflowConfig,
    deleteWorkflowConfig: prisma.workflowConfig.deleteWorkflowConfig
};

const nodeService: NodeService = {
  getNodeRegistry,
};

const connectService: ConnectService = {
  getConnectRegistry
};

const mcpHandler = createCoflowMcpServer( workflowService, nodeService, connectService);

export { mcpHandler as GET, mcpHandler as POST, mcpHandler as PUT, mcpHandler as DELETE }