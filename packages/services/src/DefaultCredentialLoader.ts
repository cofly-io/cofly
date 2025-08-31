import { CredentialListOptions, ICredentialLoader, CredentialData } from "@repo/common";
import { prisma } from '@repo/database';

export class DefaultCredentialLoader implements ICredentialLoader {
    async get(connectId: string): Promise<CredentialData | null | undefined> {

        if(!connectId) {
            throw new Error(`连接Id参数不正确: ${connectId}`);
        }

        const connectConfig = await prisma.connectConfig.findUnique({
            where: { id: connectId }
        });

        if (!connectConfig) {
            throw new Error(`连接配置不存在: ${connectId}`);
        }

        // 解析配置信息
        const configData = JSON.parse(connectConfig.configinfo);

        return {
            id: connectId,
            name: connectConfig.name,
            provider: connectConfig.ctype,
            kind: connectConfig.mtype,
            createAt: connectConfig.createdtime,
            updatedAt: connectConfig.updatedtime,
            config: {
                ...configData,
                provider: connectConfig.ctype,
                kind: connectConfig.mtype
            }
        } as CredentialData;
    }

    async list(opts?: CredentialListOptions): Promise<CredentialData[] | null | undefined> {
        return [];
    }

}