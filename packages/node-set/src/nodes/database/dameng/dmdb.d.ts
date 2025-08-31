// 达梦数据库 Node.js 驱动 (dmdb) 的 TypeScript 类型声明

declare module 'dmdb' {
  // 连接配置接口
  export interface ConnectionConfig {
    connectString: string;  // 连接字符串，格式: dm://username:password@host:port/database
    poolMax?: number;       // 连接池最大连接数
    poolMin?: number;       // 连接池最小连接数
    poolTimeout?: number;   // 连接闲置超时时间(秒)
    queueMax?: number;      // 等待队列最大个数
    queueRequests?: boolean; // 是否启用等待队列
    queueTimeout?: number;  // 等待超时时间(毫秒)
    autoCommit?: boolean;   // 是否自动提交
    extendedMetaData?: boolean; // 是否扩展元数据
    fetchAsBuffer?: number[]; // 以Buffer格式获取的数据类型
    fetchAsString?: number[]; // 以String格式获取的数据类型
    outFormat?: number;     // 输出格式
  }

  // 查询结果接口
  export interface QueryResult {
    rows?: any[];
    rowsAffected?: number;
    insertId?: number;
    metaData?: any[];
  }

  // 执行选项接口
  export interface ExecuteOptions {
    resultSet?: boolean;
    autoCommit?: boolean;
    outFormat?: number;
  }

  // 绑定参数接口
  export interface BindParameter {
    val: any;
    dir: number;  // 参数方向: BIND_IN, BIND_OUT, BIND_INOUT
    type?: number; // 数据类型
  }

  // 连接池类
  export class Pool {
    getConnection(): Promise<Connection>;
    close(): Promise<void>;
    terminate(): Promise<void>;
  }

  // 连接类
  export class Connection {
    execute(sql: string): Promise<QueryResult>;
    execute(sql: string, binds: any): Promise<QueryResult>;
    execute(sql: string, binds: any, options: ExecuteOptions): Promise<QueryResult>;
    execute(sql: string, binds: any, options: ExecuteOptions, callback: (err: Error | null, result: QueryResult) => void): void;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    close(): Promise<void>;
    close(callback: (err: Error | null) => void): void;
  }

  // 常量
  export const OUT_FORMAT_ARRAY: number;
  export const OUT_FORMAT_OBJECT: number;
  export const BLOB: number;
  export const BUFFER: number;
  export const CLOB: number;
  export const CURSOR: number;
  export const DATE: number;
  export const DEFAULT: number;
  export const NUMBER: number;
  export const STRING: number;
  export const BIND_IN: number;
  export const BIND_INOUT: number;
  export const BIND_OUT: number;
  export const POOL_STATUS_CLOSED: number;
  export const POOL_STATUS_DRAINING: number;
  export const POOL_STATUS_OPEN: number;

  // 主要函数
  export function createPool(config: ConnectionConfig): Promise<Pool>;
  export function createPool(config: ConnectionConfig, callback: (err: Error | null, pool: Pool) => void): void;
  export function getConnection(config: ConnectionConfig): Promise<Connection>;
  export function getConnection(config: ConnectionConfig, callback: (err: Error | null, connection: Connection) => void): void;

  // 全局属性
  export let autoCommit: boolean;
  export let extendedMetaData: boolean;
  export let fetchAsBuffer: number[];
  export let fetchAsString: number[];
  export let outFormat: number;
  export let poolMax: number;
  export let poolMin: number;
  export let poolTimeout: number;
  export let queueMax: number;
  export let queueRequests: boolean;
  export let queueTimeout: number;
}