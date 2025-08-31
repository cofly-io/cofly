import { ILLMConnect, ILLMOverview, ConnectTestResult, Icon } from '@repo/common';
import { BaseConnect } from './BaseConnect';

/**
 * LLM连接器基类
 * 为LLM连接器提供通用实现
 */
export abstract class BaseLLMConnect extends BaseConnect implements ILLMConnect {
    abstract override overview: ILLMOverview & { icon: Icon };
    abstract override detail: ILLMConnect['detail'];
    
    /**
     * 测试LLM连接
     * 子类可以重写此方法实现特定的测试逻辑
     */
    abstract test(config: Record<string, any>, message?: string): Promise<ConnectTestResult>;
}