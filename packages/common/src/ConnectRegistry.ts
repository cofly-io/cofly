import { injectable } from 'inversify';
import { IConnect, IConnectRegistry, ConnectType, ConnectTestResult } from './Interfaces';

/**
 * 连接注册表
 * 负责管理所有连接定义的注册、查询和测试
 */
@injectable()
export class ConnectRegistry implements IConnectRegistry {
    private connects: Map<string, IConnect> = new Map();
    private connectTypes: Set<any> = new Set();

    hasType(connectClass: any): boolean {
        return this.connectTypes.has(connectClass);
    }
    /**
     * 注册连接定义
     */
    registerConnect(connectClass: any): IConnect {
        const connect = new connectClass() as IConnect;
        const connectId = connect.overview.id;

        if (this.connects.has(connectId)) {
            console.warn(`Connect with id "${connectId}" already exists. Overwriting...`);
        }

        this.connects.set(connectId, connect);
        this.connectTypes.add(connectClass);

        return connect;
    }

    /**
     * 根据ID获取连接定义
     */
    getConnectById(id: string): IConnect | undefined {
        return this.connects.get(id);
    }

    /**
     * 根据类型获取连接定义列表
     */
    getConnectsByType(type: ConnectType): IConnect[] {
        return Array.from(this.connects.values()).filter(
            connect => connect.overview.type === type
        );
    }

    /**
     * 根据提供商获取连接定义列表
     */
    getConnectsByProvider(provider: string): IConnect[] {
        return Array.from(this.connects.values()).filter(
            connect => connect.overview.provider === provider
        );
    }

    /**
     * 获取所有连接定义
     */
    getAllConnects(): IConnect[] {
        return Array.from(this.connects.values());
    }

    /**
     * 测试连接
     */
    async testConnection(connectId: string, config: Record<string, any>): Promise<ConnectTestResult> {
        const connect = this.getConnectById(connectId);

        if (!connect) {
            return {
                success: false,
                message: `Connect with id "${connectId}" not found`
            };
        }

        if (!connect.test) {
            return {
                success: false,
                message: `Connect "${connectId}" does not support connection testing`
            };
        }

        try {
            return await connect.test(config);
        } catch (error) {
            return {
                success: false,
                message: `Connection test failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    /**
     * 获取连接统计信息
     */
    getStatistics(): {
        total: number;
        byType: Record<ConnectType, number>;
        byProvider: Record<string, number>;
    } {
        const stats = {
            total: this.connects.size,
            byType: {} as Record<ConnectType, number>,
            byProvider: {} as Record<string, number>
        };

        this.connects.forEach(connect => {
            // 按类型统计
            const type = connect.overview.type;
            stats.byType[type] = (stats.byType[type] || 0) + 1;

            // 按提供商统计
            const provider = connect.overview.provider;
            if (provider) {
                stats.byProvider[provider] = (stats.byProvider[provider] || 0) + 1;
            }
        });

        return stats;
    }

    /**
     * 清除所有注册的连接
     */
    clear(): void {
        this.connects.clear();
        console.log('🧹 Cleared all registered connects');
    }

    /**
     * 获取连接总数
     */
    getConnectCount(): number {
        return this.connects.size;
    }

    /**
     * 检查连接是否存在
     */
    hasConnect(id: string): boolean {
        return this.connects.has(id);
    }

    /**
     * 获取所有连接ID列表
     */
    getAllConnectIds(): string[] {
        return Array.from(this.connects.keys());
    }

    /**
     * 获取连接描述信息（不包含敏感信息）
     */
    getConnectDescriptions(): Array<{
        id: string;
        name: string;
        type: ConnectType;
        provider: string;
        description: string;
    }> {
        return Array.from(this.connects.values()).map(connect => ({
            id: connect.overview.id,
            name: connect.overview.name,
            type: connect.overview.type,
            provider: connect.overview.provider || 'unknown',
            description: connect.overview.description,
        }));
    }
}