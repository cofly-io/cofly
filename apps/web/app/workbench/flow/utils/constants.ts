/**
 * 工作流相关常量定义
 */

import { EdgeStyleConfig } from '../types/canvas';

// ==================== 边样式常量 ====================

/**
 * 默认边样式配置
 */
export const DEFAULT_EDGE_STYLE: EdgeStyleConfig = {
  style: {
    stroke: '#878787',
    strokeWidth: 1
  },
  labelStyle: {
    fill: '#bfbfbf',
    fontSize: 12,
    fontWeight: 500
  },
  labelBgStyle: {
    fill: '#333F50',
    fillOpacity: 0.8,
  }
};

/**
 * 选中状态边样式
 */
export const SELECTED_EDGE_STYLE: EdgeStyleConfig = {
  style: {
    stroke: '#1890ff',
    strokeWidth: 2
  },
  labelStyle: {
    fill: '#1890ff',
    fontSize: 12,
    fontWeight: 600
  },
  labelBgStyle: {
    fill: '#e6f7ff',
    fillOpacity: 0.9,
  }
};

/**
 * 错误状态边样式
 */
export const ERROR_EDGE_STYLE: EdgeStyleConfig = {
  style: {
    stroke: '#ff4d4f',
    strokeWidth: 2
  },
  labelStyle: {
    fill: '#ff4d4f',
    fontSize: 12,
    fontWeight: 500
  },
  labelBgStyle: {
    fill: '#fff2f0',
    fillOpacity: 0.9,
  }
};

// ==================== 节点常量 ====================

/**
 * 默认节点宽度
 */
export const DEFAULT_NODE_WIDTH = 200;

/**
 * 默认节点高度
 */
export const DEFAULT_NODE_HEIGHT = 80;

/**
 * 节点间距
 */
export const NODE_SPACING = {
  HORIZONTAL: 250,
  VERTICAL: 120
};

/**
 * 节点连接点配置
 */
export const NODE_HANDLES = {
  INPUT: '',
  OUTPUT: ''
};

/**
 * 节点类型常量
 */
export const NODE_TYPES = {
  TRIGGER: 'triggerNode',
  ACTION: 'actionNode',
  CONDITION: 'conditionNode',
  LOOP: 'loopNode'
} as const;

// ==================== 画布常量 ====================

/**
 * 画布默认配置
 */
export const CANVAS_CONFIG = {
  DEFAULT_ZOOM: 1,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 2,
  ZOOM_STEP: 0.1,
  GRID_SIZE: 20,
  SNAP_THRESHOLD: 10
};

/**
 * 画布视口默认位置
 */
export const DEFAULT_VIEWPORT = {
  x: 0,
  y: 0,
  zoom: 1
};

/**
 * 复制粘贴偏移量
 */
export const PASTE_OFFSET = {
  x: 50,
  y: 50
};

// ==================== 工作流常量 ====================

/**
 * 工作流版本
 */
export const WORKFLOW_VERSION = '1.0.0';

/**
 * 工作流状态
 */
export const WORKFLOW_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TESTING: 'testing'
} as const;

/**
 * 工作流导出格式
 */
export const EXPORT_FORMATS = {
  JSON: 'json',
  YAML: 'yaml'
} as const;

/**
 * 默认工作流名称
 */
export const DEFAULT_WORKFLOW_NAME = '工作流';

/**
 * 源节点标识符
 */
export const SOURCE_NODE_ID = '$source';

// ==================== 测试常量 ====================

/**
 * 测试状态
 */
export const TEST_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

/**
 * 测试超时时间（毫秒）
 */
export const TEST_TIMEOUT = 30000;

/**
 * 测试重试次数
 */
export const TEST_RETRY_COUNT = 3;

/**
 * 测试历史记录最大数量
 */
export const MAX_TEST_HISTORY = 10;

// ==================== API常量 ====================

/**
 * API端点
 */
export const API_ENDPOINTS = {
  NODES: '/api/nodes',
  WORKFLOW_CONFIG: '/api/workflow-config',
  WORKFLOW_TEST: '/api/workflow/test',
  CONNECT_CONFIGS: '/api/connect-configs',
  DATABASE_TABLES: '/api/database/tables'
} as const;

/**
 * HTTP方法
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
} as const;

/**
 * 请求超时时间（毫秒）
 */
export const REQUEST_TIMEOUT = 10000;

// ==================== 错误消息常量 ====================

/**
 * 通用错误消息
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  UNKNOWN_ERROR: '未知错误，请联系管理员',
  VALIDATION_ERROR: '数据验证失败',
  PERMISSION_ERROR: '权限不足',
  NOT_FOUND_ERROR: '资源不存在'
} as const;

/**
 * 工作流相关错误消息
 */
export const WORKFLOW_ERROR_MESSAGES = {
  SAVE_FAILED: '保存工作流失败',
  LOAD_FAILED: '加载工作流失败',
  EXPORT_FAILED: '导出工作流失败',
  TEST_FAILED: '测试工作流失败',
  INVALID_WORKFLOW: '工作流数据无效',
  MISSING_WORKFLOW_ID: '工作流ID不存在'
} as const;

/**
 * 节点相关错误消息
 */
export const NODE_ERROR_MESSAGES = {
  NODE_NOT_FOUND: '节点不存在',
  NODE_CONFIG_INVALID: '节点配置无效',
  NODE_TEST_FAILED: '节点测试失败',
  NODE_EXECUTION_FAILED: '节点执行失败',
  CIRCULAR_DEPENDENCY: '检测到循环依赖',
  MISSING_REQUIRED_FIELD: '缺少必填字段'
} as const;

// ==================== 成功消息常量 ====================

/**
 * 成功消息
 */
export const SUCCESS_MESSAGES = {
  WORKFLOW_SAVED: '工作流保存成功',
  WORKFLOW_EXPORTED: '工作流导出成功',
  WORKFLOW_TESTED: '工作流测试成功',
  NODE_TESTED: '节点测试成功',
  COPIED_TO_CLIPBOARD: '已复制到剪贴板'
} as const;

// ==================== 本地存储键名 ====================

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  WORKFLOW_DRAFT: 'workflow_draft',
  USER_PREFERENCES: 'user_preferences',
  CANVAS_VIEWPORT: 'canvas_viewport',
  NODE_CATEGORIES_CACHE: 'node_categories_cache'
} as const;

// ==================== 动画和过渡常量 ====================

/**
 * 动画持续时间（毫秒）
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;

/**
 * 过渡缓动函数
 */
export const EASING = {
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out'
} as const;

// ==================== 主题相关常量 ====================

/**
 * 主题模式
 */
export const THEME_MODE = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
} as const;

/**
 * 颜色常量
 */
export const COLORS = {
  PRIMARY: '#1890ff',
  SUCCESS: '#52c41a',
  WARNING: '#faad14',
  ERROR: '#ff4d4f',
  INFO: '#1890ff'
} as const;

// ==================== 调试常量 ====================

/**
 * 调试模式
 */
export const DEBUG_MODE = process.env.NODE_ENV === 'development';

/**
 * 日志级别
 */
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
} as const;

// ==================== 类型导出 ====================

export type WorkflowStatusType = typeof WORKFLOW_STATUS[keyof typeof WORKFLOW_STATUS];
export type TestStatusType = typeof TEST_STATUS[keyof typeof TEST_STATUS];
export type NodeTypeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];
export type ThemeModeType = typeof THEME_MODE[keyof typeof THEME_MODE];