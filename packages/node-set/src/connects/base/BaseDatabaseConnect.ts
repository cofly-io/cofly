import { IDatabaseConnect, ConnectTestResult, Icon } from '@repo/common';
import { BaseConnect } from './BaseConnect';

/**
 * 数据库连接器基类
 * 为数据库连接器提供通用实现
 */
export abstract class BaseDatabaseConnect extends BaseConnect implements IDatabaseConnect {
    abstract override overview: IDatabaseConnect['overview'] & { icon: Icon };
    abstract override detail: IDatabaseConnect['detail'];
    
    /**
     * 测试数据库连接
     * 子类需要实现具体的数据库测试逻辑
     */
    abstract test(config: Record<string, any>): Promise<ConnectTestResult>;
}