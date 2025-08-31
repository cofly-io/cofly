// KingbaseES Node.js 驱动类型声明
declare module 'kb' {
  export interface ConnectionConfig {
    user?: string;
    host?: string;
    database?: string;
    password?: string;
    port?: number;
    ssl?: boolean;
    connectionTimeoutMillis?: number;
    query_timeout?: number;
  }

  export interface QueryResult {
    rows: any[];
    rowCount: number;
    insertId?: any;
  }

  export class Client {
    constructor(config: ConnectionConfig);
    connect(): Promise<void>;
    query(text: string, params?: any[]): Promise<QueryResult>;
    end(): Promise<void>;
  }
}