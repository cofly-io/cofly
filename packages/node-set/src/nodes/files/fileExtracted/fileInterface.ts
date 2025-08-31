// 类型定义
export interface FileData {
    data?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    fileExtension?: string;
    filePath?: string;
}

export interface FileInfo {
    fileName: string;
    mimeType: string;
    fileSize: number;
    operation: string;
}

export interface ProcessResult {
    [key: string]: any;
    fileInfo: FileInfo;
    success: boolean;
}

// 操作类型常量
export const OPERATION_TYPES = {
    FROM_JSON: 'fromJson',
    FROM_TEXT: 'fromText',
    FROM_CSV: 'fromCsv',
    FILE_TO_BASE64: 'fileToBase64'
} as const;


export type OperationType = typeof OPERATION_TYPES[keyof typeof OPERATION_TYPES];


// 编码类型常量
export const ENCODING_TYPES = {
	UTF8: 'utf8',
	BASE64: 'base64',
	ASCII: 'ascii',
	LATIN1: 'latin1',
	UTF16LE: 'utf16le'
} as const;

export type EncodingType = typeof ENCODING_TYPES[keyof typeof ENCODING_TYPES];

// 源数据保留策略常量
export const KEEP_SOURCE_STRATEGIES = {
	JSON: 'json',
	BINARY: 'binary',
	BOTH: 'both',
	NONE: 'none'
} as const;

export type KeepSourceStrategy = typeof KEEP_SOURCE_STRATEGIES[keyof typeof KEEP_SOURCE_STRATEGIES];

// 默认配置常量
export const DEFAULT_CONFIG = {
	BINARY_PROPERTY_NAME: 'data',
	OUTPUT_PROPERTY: 'data',
	BASE64_OUTPUT_PROPERTY: 'base64',
	ENCODING: ENCODING_TYPES.UTF8,
	KEEP_SOURCE: KEEP_SOURCE_STRATEGIES.JSON
} as const;