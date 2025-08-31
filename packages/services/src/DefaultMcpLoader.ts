import { IMcpLoader, McpData, McpListOptions } from "@repo/common";
import { prisma, AiMcp } from '@repo/database'

export class DefaultMcpLoader implements IMcpLoader {

    parseConfig(record: AiMcp) : McpData {
        const data = JSON.parse(record.mcpinfo);
        return {
            ...record,
            id: data.id,
            config: data
        } as McpData;
    }

    async get(id: string): Promise<McpData | undefined> {
        const record = await prisma.aiMcp.findUnique({
            where: { id: id },
        });
        if(!record) {
            return undefined;
        }

        return this.parseConfig(record);
    }

    async list(opts?: McpListOptions): Promise<McpData[]> {
        const configs : McpData[] = [];
        const records = await prisma.aiMcp.findMany();
        for(const record of records) {
            configs.push(this.parseConfig(record));
        }
        return configs;
    }
}