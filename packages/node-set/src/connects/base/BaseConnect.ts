import { IConnect, ConnectTestResult, Icon } from '@repo/common';

/**
 * 连接器基类
 * 提供通用的连接器实现模式
 */
export abstract class BaseConnect implements IConnect {
    abstract overview: IConnect['overview'] & { icon: Icon };
    abstract detail: IConnect['detail'];
    
    /**
     * 测试连接方法
     * 子类需要实现具体的测试逻辑
     */
    abstract test(config: Record<string, any>, message?: string): Promise<ConnectTestResult>;
}