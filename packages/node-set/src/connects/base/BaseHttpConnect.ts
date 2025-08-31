import { IHttpConnect, ConnectTestResult, Icon } from '@repo/common';
import { BaseConnect } from './BaseConnect';

/**
 * HTTP连接器基类
 * 为HTTP连接器提供通用实现
 */
export abstract class BaseHttpConnect extends BaseConnect implements IHttpConnect {
    abstract override overview: IHttpConnect['overview'] & { icon: Icon };
    abstract override detail: IHttpConnect['detail'];
    
    /**
     * 测试HTTP连接
     * 子类需要实现具体的HTTP测试逻辑
     */
    abstract test(config: Record<string, any>): Promise<ConnectTestResult>;
}