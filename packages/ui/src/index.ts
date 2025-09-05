// 组件导出
export * from './components'
export * from './main'
// Node exports with renamed ButtonGroup to avoid conflicts
export {
  NodeSettings,
  LeftPanel,
  RightPanel,
  NodeDetailsView,
  ParameterInput,
  // Rename the node ButtonGroup to avoid conflict with components ButtonGroup
  ButtonGroup as NodeButtonGroup,
  DataViewButton,
  Panel,
  PanelTitle,
  OutputContainer,
  OutputContainerTitle,
  OutputContainerContent,
  NodeEmptyState,
  NodeEmptyStateText,
  PreviousNodeSelector,
  SelectorLabel,
  SelectDropdown,
  ExecuteButton,
  PanelHeader,
  ActionContainer,
  ActionButton,
  SetMockButton,
  CodeMirrorContainer,
  EditModeActions
} from './node'
export * from './node/types'
export * from './controls'
// Context exports (avoiding conflicts with main exports)
export { UnifiedThemeProvider } from './context/ThemeProvider';
export { useTheme } from './context/ThemeProvider';
export { default as SettingsProvider, useSettings } from './context/SettingsContext';
export { GlobalThemeStyles } from './context/GlobalThemeStyles';
export * from './themes'
export * from './utils/avatarUtils'
export * from './hooks/useAuth'

// 新的聊天显示组件
export { default as ChatDisplay } from './main/chat/ChatDisplay'
export type { ChatDisplayProps, Message } from './main/chat/ChatDisplay'

// 示例组件
// export { default as ChatExample } from './example/ChatExample'