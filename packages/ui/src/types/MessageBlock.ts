/**
 * 消息块类型枚举
 */
export enum MessageBlockType {
  UNKNOWN = 'UNKNOWN',
  MAIN_TEXT = 'MAIN_TEXT',
  CODE = 'CODE',
  THINKING = 'THINKING',
  ERROR = 'ERROR'
}

/**
 * 消息块状态
 */
export enum MessageBlockStatus {
  PROCESSING = 'PROCESSING',
  STREAMING = 'STREAMING', 
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

/**
 * 基础消息块接口
 */
export interface BaseMessageBlock {
  id: string
  messageId: string
  type: MessageBlockType
  status: MessageBlockStatus
  content: string
  timestamp: number
}

/**
 * 主文本块
 */
export interface MainTextMessageBlock extends BaseMessageBlock {
  type: MessageBlockType.MAIN_TEXT
}

/**
 * 代码块
 */
export interface CodeMessageBlock extends BaseMessageBlock {
  type: MessageBlockType.CODE
  language: string
  theme?: string
}

/**
 * 思考块
 */
export interface ThinkingMessageBlock extends BaseMessageBlock {
  type: MessageBlockType.THINKING
}

/**
 * 错误块
 */
export interface ErrorMessageBlock extends BaseMessageBlock {
  type: MessageBlockType.ERROR
  error: string
}

/**
 * 未知块
 */
export interface UnknownMessageBlock extends BaseMessageBlock {
  type: MessageBlockType.UNKNOWN
}

/**
 * 消息块联合类型
 */
export type MessageBlock = 
  | MainTextMessageBlock
  | CodeMessageBlock
  | ThinkingMessageBlock
  | ErrorMessageBlock
  | UnknownMessageBlock

/**
 * 消息接口
 */
export interface MessageWithBlocks {
  id: string
  blocks: MessageBlock[]
  currentBlockId?: string
  status: 'streaming' | 'completed' | 'error'
}

// 创建块的辅助函数
export function createMessageBlock<T extends MessageBlock>(
  type: T['type'],
  messageId: string,
  data: Omit<T, 'id' | 'type' | 'messageId' | 'timestamp' | 'status'>,
  status: MessageBlockStatus = MessageBlockStatus.PROCESSING
): T {
  return {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    messageId,
    type,
    status,
    timestamp: Date.now(),
    ...data
  } as T
}

// 创建特定类型块的辅助函数
export function createMainTextBlock(
  messageId: string,
  content: string,
  status: MessageBlockStatus = MessageBlockStatus.PROCESSING
): MainTextMessageBlock {
  return createMessageBlock(MessageBlockType.MAIN_TEXT, messageId, { content }, status)
}

export function createCodeBlock(
  messageId: string,
  content: string,
  language: string,
  theme?: string,
  status: MessageBlockStatus = MessageBlockStatus.PROCESSING
): CodeMessageBlock {
  return createMessageBlock(MessageBlockType.CODE, messageId, { content, language, theme }, status)
}

export function createThinkingBlock(
  messageId: string,
  content: string,
  status: MessageBlockStatus = MessageBlockStatus.PROCESSING
): ThinkingMessageBlock {
  return createMessageBlock(MessageBlockType.THINKING, messageId, { content }, status)
}

export function createErrorBlock(
  messageId: string,
  content: string,
  error: string,
  status: MessageBlockStatus = MessageBlockStatus.ERROR
): ErrorMessageBlock {
  return createMessageBlock(MessageBlockType.ERROR, messageId, { content, error }, status)
}

export function createUnknownBlock(
  messageId: string,
  content: string = '',
  status: MessageBlockStatus = MessageBlockStatus.PROCESSING
): UnknownMessageBlock {
  return createMessageBlock(MessageBlockType.UNKNOWN, messageId, { content }, status)
} 