/**
 * 数据库连接测试工具
 * 提供统一的数据库连接测试接口
 */

import {
  MySQLConnect,
  PostgreSQLConnect,
  SQLServerConnect,
  OracleConnect,
  KingbaseConnect,
  DamengConnect
} from '../index';

export type DatabaseProvider = 'mysql' | 'postgresql' | 'sqlserver' | 'oracle' |  'kingbase' | 'dameng';

export interface DatabaseTestConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  // 可选配置
  charset?: string;
  ssl?: boolean;
  timeout?: number;
  // SQL Server 特有
  domain?: string;
  instanceName?: string;
  // Oracle 特有
  serviceName?: string;
  sid?: string;
}

export interface DatabaseTestResult {
  success: boolean;
  message: string;
  error?: string;
  connectionTime?: number;
  serverInfo?: {
    version?: string;
    type?: string;
  };
}

/**
 * 数据库连接测试器
 */
export class DatabaseTester {
  // 支持的数据库提供商
  private static readonly PROVIDERS = {
    mysql: new MySQLConnect(),
    postgresql: new PostgreSQLConnect(),
    sqlserver: new SQLServerConnect(),
    oracle: new OracleConnect(),
    kingbase: new KingbaseConnect(),
    dameng: new DamengConnect()
  } as const;

  /**
   * 检查提供商是否支持
   */
  static isProviderSupported(provider: string): provider is DatabaseProvider {
    return provider in this.PROVIDERS;
  }

  /**
   * 获取支持的提供商列表
   */
  static getSupportedProviders(): DatabaseProvider[] {
    return Object.keys(this.PROVIDERS) as DatabaseProvider[];
  }

  /**
   * 获取提供商详细信息
   */
  static getProviderDetails() {
    return Object.entries(this.PROVIDERS).map(([key, connect]) => ({
      provider: key as DatabaseProvider,
      name: connect.overview.name,
      description: connect.overview.description,
      defaultPort: connect.detail.defaultPort,
      supportedFeatures: connect.detail.supportedFeatures
    }));
  }

  /**
   * 测试数据库连接
   */
  static async testConnection(
    provider: DatabaseProvider,
    config: DatabaseTestConfig
  ): Promise<DatabaseTestResult> {
    if (!this.isProviderSupported(provider)) {
      return {
        success: false,
        message: `不支持的数据库提供商: ${provider}`,
        error: 'UNSUPPORTED_PROVIDER'
      };
    }

    const dbConnect = this.PROVIDERS[provider];
    
    try {
      const startTime = Date.now();
      const result = await dbConnect.test(config);
      const connectionTime = Date.now() - startTime;

      return {
        ...result,
        connectionTime
      };
    } catch (error) {
      return {
        success: false,
        message: '数据库连接测试失败',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 批量测试数据库连接
   */
  static async testMultipleConnections(
    tests: Array<{
      id?: string;
      provider: DatabaseProvider;
      config: DatabaseTestConfig;
    }>
  ): Promise<Array<DatabaseTestResult & { id?: string; provider: DatabaseProvider }>> {
    const testPromises = tests.map(async (test) => {
      const { id, provider, config } = test;
      
      try {
        const result = await this.testConnection(provider, config);
        return {
          id: id || `${provider}-${Date.now()}`,
          provider,
          ...result
        };
      } catch (error) {
        return {
          id: id || `${provider}-${Date.now()}`,
          provider,
          success: false,
          message: '测试执行异常',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    return Promise.all(testPromises);
  }

  /**
   * 验证数据库配置
   */
  static validateConfig(provider: DatabaseProvider, config: Partial<DatabaseTestConfig>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 基本必填字段检查
    if (!config.host) errors.push('host 是必填字段');
    if (!config.port) errors.push('port 是必填字段');
    if (!config.database) errors.push('database 是必填字段');
    if (!config.username) errors.push('username 是必填字段');
    if (!config.password) errors.push('password 是必填字段');

    // 端口范围检查
    if (config.port && (config.port < 1 || config.port > 65535)) {
      errors.push('port 必须在 1-65535 范围内');
    }

    // 提供商特定验证
    switch (provider) {
      case 'oracle':
        if (!config.serviceName && !config.sid) {
          errors.push('Oracle 数据库需要提供 serviceName 或 sid');
        }
        break;
      case 'sqlserver':
        // SQL Server 可能需要域名
        if (config.domain && !config.username?.includes('\\')) {
          // 如果提供了域名但用户名中没有域名前缀，可以给出建议
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
} 