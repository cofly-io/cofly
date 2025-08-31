import { getNodeRegistry, IWorkflowLoader, WorkflowData, WorkflowListOptions } from "@repo/common";
import { prisma, WorkflowConfig } from "@repo/database";

export class DefaultWorkflowLoader implements IWorkflowLoader {

    async load(config : WorkflowConfig) : Promise<WorkflowData> {

        const registry = getNodeRegistry();

        const configData = {
            id: config.id,
            name: config.name,
            actions: config.nodesInfo ? JSON.parse(config.nodesInfo) : [],
            edges: config.relation ? JSON.parse(config.relation) : [],
        };

        configData.actions.forEach((action: any) => {
            action.node = registry.getNodeByKind(action.kind);
        });

        return {
            id: config.id,
            name: config.name,
            isActive: config.isActive,
            isDeleted: config.isDeleted,
            createdAt: config.createdTime,
            updatedAt: config.updatedTime,
            createUser: config.createUser,
            config: configData
        } as unknown as WorkflowData;
    }

    async get(id: string): Promise<WorkflowData | null | undefined> {
        const config = await prisma.workflowConfig.getWorkflowConfigById(id);
        if(!config) {
            return null;
        }

        return await this.load(config);
    }

    async list(opts?: WorkflowListOptions): Promise<WorkflowData[] | null | undefined> {
        const configs : WorkflowData[] = [];
        const records = await prisma.workflowConfig.getAllWorkflowConfigs(opts?.limit);
        for(const record of records) {
            configs.push(await this.load(record));
        }
        return configs;
    }
}