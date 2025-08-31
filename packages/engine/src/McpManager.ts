import { mcpConfigManager, McpData, McpServerConfig } from "@repo/common";

class McpManager {

    async servers() : Promise<McpServerConfig[]> {

        const mcpConfigs = await mcpConfigManager.mediator?.list();
        if (mcpConfigs && mcpConfigs.length > 0) {
            const servers = [];

            for (const mcpConfig of mcpConfigs) {
                const server = this.convert(mcpConfig);
                if(server) {
                    servers.push(server);
                }
            }
        }

        return [];
    }

    async get(id : string) : Promise<McpServerConfig | undefined> {
        return this.convert(await mcpConfigManager.mediator?.get(id));
    }

    private convert(param: McpData | null | undefined) {

        if(!param) {
            return undefined;
        }

        return param.config as McpServerConfig;
    }
}

export const mcpManager = new McpManager();