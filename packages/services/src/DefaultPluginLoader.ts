import { IPluginLoader, PluginData, PluginListOptions } from "@repo/common";
import { prisma } from '@repo/database';

export class DefaultPluginLoader implements IPluginLoader {

    async get(id: string): Promise<PluginData | null | undefined> {
        const record = await prisma.aiMcp.findUnique({
            where: { id: id },
        });
        if(!record) {
            return null;
        }

        return {
            id: id,
            config: record
        } as unknown as PluginData;
    }

    async list(opts?: PluginListOptions): Promise<PluginData[] | null | undefined> {
        const configs : PluginData[] = [];
        const records = await prisma.plugin.findMany();
        for(const record of records) {
            configs.push({
                id: record.id,
                config: record
            } as unknown as PluginData);
        }
        return configs;
    }
}