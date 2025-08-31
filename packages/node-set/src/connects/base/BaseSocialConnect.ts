import { ISocialConnect, Icon,ConnectTestResult } from '@repo/common';
import { BaseConnect } from './BaseConnect';

/**
 * 数据库连接器基类
 * 为数据库连接器提供通用实现
 */
export abstract class BaseSocialConnect extends BaseConnect implements ISocialConnect {
    abstract override overview: ISocialConnect['overview'] & { icon: Icon };
    abstract override detail: ISocialConnect['detail'];

    abstract test(config: Record<string, any>, message?: string): Promise<ConnectTestResult>;
}