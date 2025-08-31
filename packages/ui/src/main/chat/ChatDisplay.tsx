import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
// @ts-ignore
import ReactMarkdown, { type Components } from 'react-markdown'
// @ts-ignore
import remarkGfm from 'remark-gfm'
// @ts-ignore
import remarkMath from 'remark-math'
// @ts-ignore
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark, atomDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '../../context/ThemeProvider'
import { FaCopy, FaDownload, FaChevronDown, FaChevronUp, FaPlay } from "react-icons/fa";

// 移除对已弃用hook的引用 - 现在通过props传入数据和回调
import { MessageInput } from './MessageInput'
import { ChatHistory } from './ChatHistory'
import { getAvatarIcon } from '../../utils/avatarUtils'

import {
  ChatDisplayContainer,
  HistoryPanel,
  ChatPanel,
  ChatContainer,
  MessagesContainer,
  MessageContainer,
  MessageHeader,
  RoleBadge,
  Timestamp,
  MessageContent,
  CodeBlockContainer,
  CodeBlockHeader,
  LanguageLabel,
  ToolbarContainer,
  ToolButton,
  CodeBlockContent,
  InlineCode,
  ImageContainer,
  Blockquote,
  TableContainer,
  InputContainer,
  InputForm,
  TextArea,
  SendButton,
  TypingIndicator,
  ThinkingBlock,
  //GlobalThinkStyles
} from './ChatStyles'

// 引入KaTeX样式
import 'katex/dist/katex.min.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isStreaming?: boolean
}

interface ChatDisplayProps {
  // 原有的 props
  messages?: Message[]
  isLoading?: boolean
  theme?: 'light' | 'dark'
  onSendMessage?: (message: string) => void
  className?: string

  // 流式聊天相关 props - 通过web层传入
  streamMessages?: Message[]
  streamIsLoading?: boolean
  threadId?: string | null
  isLoadingThread?: boolean
  onStreamSendMessage?: (message: string) => Promise<void>
  onLoadThread?: (threadId: string) => Promise<void>
  onSetAgent?: (agentId: string) => Promise<void>
  onStartNewChat?: () => void

  // 配置相关 props
  agentId?: string | null
  userId?: string
  agentName?: string
  agentAvatar?: string
  avatar?: React.ReactNode
  showNewChat?: boolean
  showHistory?: boolean
  showAttachment?: boolean
  showAgent?: boolean
  onHistoryToggle?: (isVisible: boolean, width: number) => void
}

interface CodeBlockProps {
  children: string
  className?: string
  language?: string
  inline?: boolean
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, className, language, inline }) => {
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [wrapped, setWrapped] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const { theme } = useTheme()

  const match = /language-(\w+)/.exec(className || '')
  const lang = language || match?.[1] || 'text'

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }, [children])

  const handleDownload = useCallback(() => {
    const element = document.createElement('a')
    const file = new Blob([children], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `code.${lang}`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }, [children, lang])

  const handleRun = useCallback(() => {
    if (lang === 'javascript' || lang === 'python') {
      setIsRunning(true)
      // 模拟代码执行
      setTimeout(() => {
        setIsRunning(false)
        // console.log('Code executed:', children)
      }, 1000)
    }
  }, [lang, children])

  const shouldCollapse = useMemo(() => {
    return children.split('\n').length > 20
  }, [children])

  const displayedCode = useMemo(() => {
    if (collapsed && shouldCollapse) {
      return children.split('\n').slice(0, 10).join('\n') + '\n...'
    }
    return children
  }, [children, collapsed, shouldCollapse])

  if (inline) {
    return (
      <InlineCode>{children}</InlineCode>
    )
  }

  return (
    <CodeBlockContainer>
      <CodeBlockHeader>
        <LanguageLabel>{lang.toUpperCase()}</LanguageLabel>
        <ToolbarContainer>
          <ToolButton onClick={handleCopy} title="复制">
            <FaCopy size={14} />
            {copied && <span>Copied!</span>}
          </ToolButton>
          <ToolButton onClick={handleDownload} title="下载">
            <FaDownload size={14} />
          </ToolButton>
          {(lang === 'javascript' || lang === 'python') && (
            <ToolButton onClick={handleRun} disabled={isRunning} title="运行">
              <FaPlay size={14} />
              {isRunning && <span>Running...</span>}
            </ToolButton>
          )}
          {/* <ToolButton onClick={() => setWrapped(!wrapped)} title="展开/收起">
            <LuWrapText size={14} />
          </ToolButton> */}
          {shouldCollapse && (
            <ToolButton onClick={() => setCollapsed(!collapsed)} title="Toggle collapse">
              {collapsed ? <FaChevronDown size={14} /> : <FaChevronUp size={14} />}
            </ToolButton>
          )}
        </ToolbarContainer>
      </CodeBlockHeader>
      <CodeBlockContent $wrapped={wrapped}>
        <SyntaxHighlighter
          style={theme.mode === 'dark' ? oneDark : oneLight}
          language={lang}
          PreTag="div"
          wrapLines={wrapped}
          wrapLongLines={wrapped}
          customStyle={{ fontSize: '13px', borderRadius: "0px" }}
        >
          {displayedCode}
        </SyntaxHighlighter>
      </CodeBlockContent>
    </CodeBlockContainer>
  )
}

const ImageComponent: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ src, alt, ...props }) => {
  if (!src) return null

  return (
    <ImageContainer>
      <img src={src} alt={alt} {...props} style={{ maxWidth: '100%', height: 'auto' }} />
    </ImageContainer>
  )
}

const ChatDisplay: React.FC<ChatDisplayProps> = ({
  // 原有的 props
  messages: propMessages,
  isLoading: propIsLoading = false,
  theme = 'dark',
  onSendMessage: propOnSendMessage,
  className,

  // 流式聊天相关 props
  streamMessages,
  streamIsLoading = false,
  threadId,
  isLoadingThread = false,
  onStreamSendMessage,
  onLoadThread,
  onSetAgent,
  onStartNewChat,

  // 配置相关 props
  agentId = null,
  agentName,
  avatar,
  showNewChat = true,
  showHistory = true,
  showAttachment = true,
  showAgent = true,
  onHistoryToggle
}) => {
  const [inputMessage, setInputMessage] = useState('')
  const [isHistoryVisible, setIsHistoryVisible] = useState(false)
  const [historyPanelWidth, setHistoryPanelWidth] = useState(300)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 决定使用哪个数据源
  const useStreamData = agentId !== null && streamMessages !== undefined
  const messages = useStreamData ? streamMessages : (propMessages || [])
  const isLoading = useStreamData ? streamIsLoading : propIsLoading
  const onSendMessage = useStreamData ? onStreamSendMessage : propOnSendMessage

  // 当agentId改变时，设置新的agent
  useEffect(() => {
    if (agentId && useStreamData && onSetAgent) {
      onSetAgent(agentId)
    }
  }, [agentId, onSetAgent, useStreamData])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  // 处理历史会话按钮点击
  const handleHistoryClick = () => {
    const newIsVisible = !isHistoryVisible
    setIsHistoryVisible(newIsVisible)
    onHistoryToggle?.(newIsVisible, historyPanelWidth)
  }

  // 处理附件按钮点击（显示历史对话）
  const handleAttachmentClick = () => {
    // const newIsVisible = !isHistoryVisible
    // setIsHistoryVisible(newIsVisible)
    // onHistoryToggle?.(newIsVisible, historyPanelWidth)
  }

  // 处理历史会话选择
  const handleThreadSelect = async (selectedThreadId: string) => {
    if (selectedThreadId && useStreamData && onLoadThread) {
      try {
        console.log('[ChatDisplay] 开始加载历史会话:', selectedThreadId);

        await onLoadThread(selectedThreadId);

        // 滚动到底部显示最新消息
        setTimeout(() => {
          scrollToBottom();
        }, 100);

        console.log('[ChatDisplay] 历史会话加载完成:', selectedThreadId);
      } catch (error) {
        console.error('[ChatDisplay] 加载历史会话失败:', error);
        // 可以在这里添加错误提示
      }
    }
  }

  // 处理删除会话
  const handleDeleteThread = async (deleteThreadId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/agentic/threads/${deleteThreadId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('删除会话失败')
      }

      console.log('[ChatDisplay] 会话删除成功:', deleteThreadId)
      // 如果删除的是当前会话，清空聊天
      if (deleteThreadId === threadId) {
        onStartNewChat?.()
      }

      return true
    } catch (error) {
      console.error('[ChatDisplay] 删除会话失败:', error)
      return false
    }
  }

  const handleSendMessage = async (message: string) => {
    if (useStreamData && onStreamSendMessage) {
      try {
        await onStreamSendMessage(message)
        setInputMessage('')
      } catch (error) {
        console.error('[ChatDisplay] 发送消息失败:', error)
      }
    } else if (propOnSendMessage) {
      propOnSendMessage(message)
    }
  }

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      handleSendMessage(inputMessage.trim())
      setInputMessage('')
    }
  }, [inputMessage, handleSendMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [handleSubmit])

  // 增强的提取函数：处理转义的HTML标签和流式数据
  const extractThinkContent = useCallback((content: string) => {
    // 尝试匹配各种可能的情况
    const patterns = [
      // 情况1：正常标签 <think>...</think>
      /<think>([\s\S]*?)<\/think>/i,
      // 情况2：转义标签 <think>...&lt;/think&gt;
      /<think>([\s\S]*?)&lt;\/think&gt;/i,
      // 情况3：包裹在<p>中的标签 <p><think>...</think></p>
      /<p[^>]*>\s*<think>([\s\S]*?)<\/think>\s*<\/p>/i,
      // 情况4：包裹在<p>中的转义标签 <p><think>...&lt;/think&gt;</p>
      /<p[^>]*>\s*<think>([\s\S]*?)&lt;\/think&gt;\s*<\/p>/i
    ];

    // 首先尝试完整匹配
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        let thinkContent = match[1]?.trim();
        let mainContent = content.replace(match[0], '').trim();

        // 清理可能残留的标签
        thinkContent = thinkContent?.replace(/<\/?think>/gi, '');
        mainContent = mainContent.replace(/<\/?think>/gi, '');

        return { think: thinkContent, main: mainContent };
      }
    }

    // 如果没有完整匹配，检查是否有未闭合的<think>标签（流式数据情况）
    const thinkStart = content.indexOf('<think>');
    const thinkEnd = content.indexOf('</think>');

    // 如果有</think>但没有<think>，可能<think>在内容开头被截断了
    if (thinkEnd !== -1 && thinkStart === -1) {
      // 假设内容从think内容开始
      const thinkContent = content.substring(0, thinkEnd).trim();
      const mainContent = content.substring(thinkEnd + 8).trim(); // +8 是 '</think>' 的长度

      return { think: thinkContent, main: mainContent };
    }

    if (thinkStart !== -1) {
      if (thinkEnd === -1) {
        // 只有开始标签，没有结束标签（流式数据未完成）
        const thinkContent = content.substring(thinkStart + 7).trim(); // +7 是 '<think>' 的长度
        const mainContent = content.substring(0, thinkStart).trim();

        return { think: thinkContent, main: mainContent };
      } else if (thinkEnd > thinkStart) {
        // 有开始和结束标签，但可能没有被上面的正则匹配到
        const thinkContent = content.substring(thinkStart + 7, thinkEnd).trim();
        const beforeThink = content.substring(0, thinkStart).trim();
        const afterThink = content.substring(thinkEnd + 8).trim(); // +8 是 '</think>' 的长度
        const mainContent = (beforeThink + ' ' + afterThink).trim();

        return { think: thinkContent, main: mainContent };
      }
    }

    return { think: null, main: content };
  }, []);

  // 增强的渲染器：处理转义标签
  const MessageContentRenderer: React.FC<{ content: string; hasThinkContent?: boolean; }> = useCallback(({ content, hasThinkContent }) => {
    const { think, main } = extractThinkContent(content);

    // Print the message role when rendering

    return (
      <>
        {think && (
          <ThinkingBlock>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={components}
              skipHtml={false}
            >
              {think}
            </ReactMarkdown>
          </ThinkingBlock>
        )}
        {main && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={components}
            skipHtml={false}
          >
            {main}
          </ReactMarkdown>
        )}
      </>
    );
  }, [theme, extractThinkContent]);

  const components: Partial<Components> = useMemo(() => ({
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      const language = match?.[1] || 'text'

      if (inline) {
        return <InlineCode>{String(children).replace(/\n$/, '')}</InlineCode>
      }

      return (
        <CodeBlock
          className={className}
          inline={false}
          language={language}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </CodeBlock>
      )
    },
    img: ImageComponent,
    blockquote: ({ children, ...props }: any) => (
      <Blockquote {...props}>{children}</Blockquote>
    ),
    table: ({ children, ...props }: any) => (
      <TableContainer>
        <table {...props}>{children}</table>
      </TableContainer>
    ),
    pre: ({ children, ...props }: any) => {
      // Return children directly to avoid nesting issues
      return <>{children}</>
    },
    p: ({ children, ...props }: any) => {
      // Check if children contains block elements like CodeBlock
      const hasBlockElements = React.Children.toArray(children).some((child: any) => {
        return child?.type === CodeBlock ||
          (child?.props?.className && child.props.className.includes('language-'))
      })

      // If contains block elements, use div instead of p to avoid nesting issues
      if (hasBlockElements) {
        return <div {...props} style={{ margin: '16px 0', ...props.style }}>{children}</div>
      }

      return <p {...props}>{children}</p>
    }
  }), [])

  // 转换消息格式
  const formattedMessages = useMemo(() => {
    let result: Message[] = []

    if (useStreamData && streamMessages) {
      result = streamMessages.map((msg: any) => ({
        id: msg.id,
        role: msg.role || (msg.sender === '我' ? 'user' : 'assistant'),
        content: msg.content,
        timestamp: new Date(msg.timestamp).getTime(),
        isStreaming: false
      }))
    } else {
      result = propMessages || []
      // console.log('[ChatDisplay] 使用propMessages:', {
      //   messageCount: result.length,
      //   messages: result.map(m => ({
      //     id: m.id,
      //     role: m.role,
      //     contentLength: m.content.length
      //   }))
      // })
    }

    return result
  }, [useStreamData, streamMessages, propMessages])

  // 如果使用流式数据，返回带历史记录的完整界面
  if (useStreamData) {
    return (
      <>
        {/* <GlobalThinkStyles /> */}
        <ChatDisplayContainer>
          {/* 左侧历史区域 */}
          <HistoryPanel $isVisible={isHistoryVisible} $width={historyPanelWidth}>
            <ChatHistory
              agentId={agentId || undefined}
              activeThreadId={threadId || undefined}
              onThreadSelect={handleThreadSelect}
              onThreadDelete={handleDeleteThread}
            />
          </HistoryPanel>

          {/* 右侧聊天区域 */}
          <ChatPanel>
            <ChatContainer className={className} $theme={theme}>
              <MessagesContainer>
                {formattedMessages.map((message) => (
                  <MessageContainer key={message.id} $role={message.role}>
                    <MessageHeader>
                      <RoleBadge $role={message.role}>
                        {message.role === 'user' ? (
                          'You'
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px',padding: '0px 4px' }}>
                            {avatar && <div style={{ transform: 'scale(0.8)', display: 'flex', alignItems: 'center' }}>{avatar}</div>}
                            <span>{agentName || 'Assistant'}</span>
                          </div>
                        )}
                      </RoleBadge>
                      <Timestamp>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Timestamp>
                    </MessageHeader>
                    <MessageContent $theme={theme} $hasThinkContent={!!extractThinkContent(message.content).think} $isMine={message.role !== 'assistant'}>
                      <MessageContentRenderer content={message.content} hasThinkContent={message.role === 'assistant' && !!extractThinkContent(message.content).think} />
                    </MessageContent>
                  </MessageContainer>
                ))}
                {isLoading && formattedMessages.filter(msg => msg.role === 'assistant').length === 0 && (
                  <MessageContainer $role="assistant">
                    <MessageHeader>
                      <RoleBadge $role="assistant">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px',padding: '0px 4px' }}>
                          {avatar && <div style={{ transform: 'scale(0.8)', display: 'flex', alignItems: 'center' }}>{avatar}</div>}
                          <span>{agentName || 'Assistant'}</span>
                        </div>
                      </RoleBadge>
                    </MessageHeader>
                    <MessageContent $theme={theme}>
                      <TypingIndicator>
                        <span></span>
                        <span></span>
                        <span></span>
                      </TypingIndicator>
                    </MessageContent>
                  </MessageContainer>
                )}
                <div ref={messagesEndRef} />
              </MessagesContainer>

              <MessageInput
                value={inputMessage}
                onChange={setInputMessage}
                onSend={handleSendMessage}
                onNewChat={onStartNewChat}
                onHistoryClick={handleHistoryClick}
                onAttachmentClick={handleAttachmentClick}
                isLoading={isLoading}
                placeholder="在这里输入消息..."
                showNewChat={showNewChat}
                showHistory={showHistory}
                showAttachment={showAttachment}
                showAgent={showAgent}
              />
            </ChatContainer>
          </ChatPanel>
        </ChatDisplayContainer>
      </>
    )
  }

  // 如果不使用流式数据，返回原有的简单界面
  return (
    <>
      {/* <GlobalThinkStyles /> */}
      <ChatContainer className={className} $theme={theme}>
        <MessagesContainer>
          {formattedMessages.map((message) => (
            <MessageContainer key={message.id} $role={message.role}>
              <MessageHeader>
                <RoleBadge $role={message.role}>
                  {message.role === 'user' ? (
                    'You'
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px',padding: '0px 4px' }}>
                      {avatar && <div style={{ transform: 'scale(0.8)', display: 'flex', alignItems: 'center' }}>{avatar}</div>}
                      <span>{agentName || 'Assistant'}</span>
                    </div>
                  )}
                </RoleBadge>
                <Timestamp>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Timestamp>
              </MessageHeader>
              <MessageContent $theme={theme} $hasThinkContent={!!extractThinkContent(message.content).think} $isMine={message.role !== 'assistant'}>
                <MessageContentRenderer content={message.content} hasThinkContent={message.role === 'assistant' && !!extractThinkContent(message.content).think} />
              </MessageContent>
            </MessageContainer>
          ))}
          {isLoading && formattedMessages.filter(msg => msg.role === 'assistant').length === 0 && (
            <MessageContainer $role="assistant">
              <MessageHeader>
                <RoleBadge $role="assistant">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px',padding: '0px 4px' }}>
                    {avatar && <div style={{ transform: 'scale(0.8)', display: 'flex', alignItems: 'center' }}>{avatar}</div>}
                    <span>{agentName || 'Assistant'}</span>
                  </div>
                </RoleBadge>
              </MessageHeader>
              <MessageContent $theme={theme}>
                <TypingIndicator>
                  <span></span>
                  <span></span>
                  <span></span>
                </TypingIndicator>
              </MessageContent>
            </MessageContainer>
          )}
          <div ref={messagesEndRef} />
        </MessagesContainer>

        {onSendMessage && (
          <InputContainer>
            <InputForm onSubmit={handleSubmit}>
              <TextArea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
              />
              <SendButton type="submit" disabled={!inputMessage.trim()}>
                Send
              </SendButton>
            </InputForm>
          </InputContainer>
        )}
      </ChatContainer>
    </>
  )
}
export default ChatDisplay
export type { ChatDisplayProps, Message }