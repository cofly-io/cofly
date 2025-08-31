// MySQL2 驱动类型声明
declare module 'mysql2/promise' {
  export interface Connection {
    execute(sql: string, values?: any[]): Promise<[any[], any]>;
    end(): Promise<void>;
  }
  
  export interface ConnectionOptions {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    charset?: string;
    ssl?: any;
    connectTimeout?: number;
    acquireTimeout?: number;
    timeout?: number;
    socketPath?: string;
  }
  
  export function createConnection(config: ConnectionOptions): Promise<Connection>;
}

// MySQL 经典驱动类型声明
declare module 'mysql' {
  export interface Connection {
    connect(callback: (err: any) => void): void;
    query(sql: string, callback: (err: any, results: any) => void): void;
    end(): void;
    destroy(): void;
  }
  
  export interface ConnectionOptions {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    charset?: string;
    ssl?: any;
    connectTimeout?: number;
    acquireTimeout?: number;
    timeout?: number;
  }
  
  export function createConnection(config: ConnectionOptions): Connection;
}

// KingbaseES 官方驱动类型声明
declare module 'kb' {
  export class Client {
    constructor(config: any);
    connect(callback: (err: any) => void): void;
    query(sql: string, callback: (err: any, result: any) => void): void;
    end(): void;
  }
}

// PostgreSQL 驱动类型声明
declare module 'pg' {
  export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    command: string;
    fields: any[];
  }

  export class Client {
    constructor(config: any);
    connect(): Promise<void>;
    query<T = any>(sql: string): Promise<QueryResult<T>>;
    query<T = any>(sql: string, values: any[]): Promise<QueryResult<T>>;
    end(): Promise<void>;
  }
}

// Oracle 驱动类型声明
declare module 'oracledb' {
  export function getConnection(config: any): Promise<any>;
  export const BIND_OUT: any;
  export const STRING: any;
  export const NUMBER: any;
  export const OUT_FORMAT_OBJECT: any;
  export const OUT_FORMAT_ARRAY: any;
}

// SQL Server 驱动类型声明
declare module 'mssql' {
  export class ConnectionPool {
    constructor(config: any);
    connect(): Promise<void>;
    request(): Request;
    close(): Promise<void>;
  }
  
  export class Request {
    input(name: string, value: any): Request;
    input(name: string, type: any, value: any): Request;
    query(command: string): Promise<IResult<any>>;
  }
  
  export interface IResult<T> {
    recordset: T[];
    recordsets: T[][];
    rowsAffected: number[];
  }
  
  export function connect(config: any): Promise<ConnectionPool>;
  export const VarChar: any;
  export const Int: any;
  export const DateTime: any;
  export const Bit: any;
  export const NVarChar: any;
}



// 其他数据库驱动的基本类型声明（如果需要）
declare module 'mysql2' {
  export interface ConnectionConfig {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    ssl?: boolean | object;
    timeout?: number;
    connectTimeout?: number;
    acquireTimeout?: number;
  }

  export interface Connection {
    connect(callback?: (err: Error | null) => void): void;
    query(sql: string, callback?: (err: Error | null, results?: any, fields?: any) => void): void;
    query(sql: string, values: any[], callback?: (err: Error | null, results?: any, fields?: any) => void): void;
    end(callback?: (err: Error | null) => void): void;
  }

  export function createConnection(config: ConnectionConfig): Connection;
}
