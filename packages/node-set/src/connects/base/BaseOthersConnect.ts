import { IOtherConnect, Icon,ConnectTestResult } from '@repo/common';
import { BaseConnect } from './BaseConnect';

/**
 * 数据库连接器基类
 * 为数据库连接器提供通用实现
 */
export abstract class BaseOthersConnect extends BaseConnect implements IOtherConnect {
    abstract override overview: IOtherConnect['overview'] & { icon: Icon };
    abstract override detail: IOtherConnect['detail'];
    
    /**
     * 测试数据库连接
     * 子类需要实现具体的数据库测试逻辑
     */
    abstract test(config: Record<string, any>): Promise<ConnectTestResult>;
}