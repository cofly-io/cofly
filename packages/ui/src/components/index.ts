// 基础组件
export * from './basic'
export * from './forms'
export * from './modals'
export * from './debug'

// 新的聊天显示组件
export { default as ChatDisplay } from '../main/chat/ChatDisplay'
export type { ChatDisplayProps, Message } from '../main/chat/ChatDisplay'

// 导出消息块相关类型和工具
export {
  MessageBlockType,
  MessageBlockStatus,
  createMessageBlock,
  createMainTextBlock,
  createCodeBlock,
  createThinkingBlock,
  createErrorBlock,
  createUnknownBlock
} from '../types/MessageBlock'

export type {
  MessageWithBlocks,
  MessageBlock,
  BaseMessageBlock,
  MainTextMessageBlock,
  CodeMessageBlock,
  ThinkingMessageBlock,
  ErrorMessageBlock,
  UnknownMessageBlock
} from '../types/MessageBlock'