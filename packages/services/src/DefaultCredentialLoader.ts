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

        // 解析配置信息，处理字段名兼容性和空值情况
        let configData: any = {};
        
        try {
            // 优先使用新的驼峰命名字段
            const configInfoStr = connectConfig.configInfo;
            
            if (!configInfoStr) {
                console.warn(`⚠️ [DefaultCredentialLoader] 连接配置 ${connectId} 的 configInfo 字段为空`);
                configData = {};
            } else if (typeof configInfoStr === 'string') {
                configData = JSON.parse(configInfoStr);
            } else {
                // 如果已经是对象，直接使用
                configData = configInfoStr;
            }
        } catch (parseError) {
            console.error(`❌ [DefaultCredentialLoader] 解析连接配置失败:`, {
                connectId,
                configInfo: connectConfig.configInfo,
                error: parseError
            });
            throw new Error(`解析连接配置失败: ${parseError instanceof Error ? parseError.message : '未知错误'}`);
        }

        return {
            id: connectId,
            name: connectConfig.name,
            provider: connectConfig.cType,
            kind: connectConfig.mType || connectConfig.cType,
            createAt: connectConfig.createdAt,
            updatedAt: connectConfig.updatedAt,
            config: {
                ...configData,
                provider: connectConfig.cType,
                kind: connectConfig.mType || connectConfig.cType
            }
        } as CredentialData;
    }

    async list(opts?: CredentialListOptions): Promise<CredentialData[] | null | undefined> {
        return [];
    }

}