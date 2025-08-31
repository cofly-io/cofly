/**
 * 工作流状态提供者组件
 * 
 * 负责管理工作流相关的全局状态，包括：
 * 1. 工作流基本信息（ID、名称、状态等）
 * 2. 画布状态同步
 * 3. 用户偏好设置
 * 4. 状态持久化和恢复
 */

import React, { useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { CanvasState, CanvasViewport } from '../../types/canvas';
import { WorkflowStatusType, ThemeModeType } from '../../utils/constants';
import { handleSyncOperation, logger } from '../../utils/errorHandling';
import { STORAGE_KEYS } from '../../utils/constants';

// 用户偏好设置类型
interface UserPreferences {
  theme: ThemeModeType;
  autoSave: boolean;
  autoLayout: boolean;
  snapToGrid: boolean;
  showGrid: boolean;
  showMinimap: boolean;
  defaultZoom: number;
}

// 工作流状态类型
interface WorkflowState {
  workflowId: string | null;
  workflowName: string;
  status: WorkflowStatusType;
  isActive: boolean;
  lastSaved: number;
  isDirty: boolean; // 是否有未保存的更改
}

// 画布状态类型
interface CanvasStateInfo {
  viewport: CanvasViewport;
  selectedNodes: string[];
  selectedEdges: string[];
  lastInteraction: number;
}

// Context类型定义
interface WorkflowStateContextType {
  // 工作流状态
  workflowState: WorkflowState;
  updateWorkflowState: (updates: Partial<WorkflowState>) => void;
  
  // 画布状态
  canvasState: CanvasStateInfo;
  updateCanvasState: (updates: Partial<CanvasStateInfo>) => void;
  
  // 用户偏好
  userPreferences: UserPreferences;
  updateUserPreferences: (updates: Partial<UserPreferences>) => void;
  
  // 状态管理
  markDirty: () => void;
  markClean: () => void;
  saveState: () => void;
  loadState: () => void;
  resetState: () => void;
  
  // 工具函数
  getStateSnapshot: () => any;
  restoreFromSnapshot: (snapshot: any) => void;
}

// 默认用户偏好
const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'auto',
  autoSave: true,
  autoLayout: false,
  snapToGrid: false,
  showGrid: true,
  showMinimap: false,
  defaultZoom: 1
};

// 默认工作流状态
const DEFAULT_WORKFLOW_STATE: WorkflowState = {
  workflowId: null,
  workflowName: '工作流',
  status: 'draft',
  isActive: false,
  lastSaved: 0,
  isDirty: false
};

// 默认画布状态
const DEFAULT_CANVAS_STATE: CanvasStateInfo = {
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedNodes: [],
  selectedEdges: [],
  lastInteraction: 0
};

// 创建Context
const WorkflowStateContext = createContext<WorkflowStateContextType>({
  workflowState: DEFAULT_WORKFLOW_STATE,
  updateWorkflowState: () => {},
  canvasState: DEFAULT_CANVAS_STATE,
  updateCanvasState: () => {},
  userPreferences: DEFAULT_USER_PREFERENCES,
  updateUserPreferences: () => {},
  markDirty: () => {},
  markClean: () => {},
  saveState: () => {},
  loadState: () => {},
  resetState: () => {},
  getStateSnapshot: () => ({}),
  restoreFromSnapshot: () => {}
});

// Provider Props
interface WorkflowStateProviderProps {
  children: React.ReactNode;
  initialWorkflowId?: string;
  initialWorkflowName?: string;
  autoSaveInterval?: number; // 自动保存间隔，默认30秒
}

/**
 * 工作流状态提供者组件
 */
export const WorkflowStateProvider: React.FC<WorkflowStateProviderProps> = ({
  children,
  initialWorkflowId,
  initialWorkflowName,
  autoSaveInterval = 30000 // 30秒
}) => {
  
  // 状态管理
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    ...DEFAULT_WORKFLOW_STATE,
    workflowId: initialWorkflowId || null,
    workflowName: initialWorkflowName || DEFAULT_WORKFLOW_STATE.workflowName
  });
  
  const [canvasState, setCanvasState] = useState<CanvasStateInfo>(DEFAULT_CANVAS_STATE);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);

  /**
   * 更新工作流状态
   */
  const updateWorkflowState = useCallback((updates: Partial<WorkflowState>) => {
    setWorkflowState(prev => {
      const newState = { ...prev, ...updates };
      
      // 如果有实质性更改，标记为脏数据
      if (updates.workflowName !== undefined || updates.status !== undefined) {
        newState.isDirty = true;
      }
      
      logger.debug('更新工作流状态', { updates, newState });
      return newState;
    });
  }, []);

  /**
   * 更新画布状态
   */
  const updateCanvasState = useCallback((updates: Partial<CanvasStateInfo>) => {
    setCanvasState(prev => {
      const newState = { 
        ...prev, 
        ...updates,
        lastInteraction: Date.now()
      };
      
      logger.debug('更新画布状态', { updates, newState });
      return newState;
    });
  }, []);

  /**
   * 更新用户偏好
   */
  const updateUserPreferences = useCallback((updates: Partial<UserPreferences>) => {
    setUserPreferences(prev => {
      const newPreferences = { ...prev, ...updates };
      
      // 立即保存用户偏好到本地存储
      const result = handleSyncOperation(() => {
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(newPreferences));
        return newPreferences;
      }, '保存用户偏好失败');
      
      if (result.success) {
        logger.debug('更新用户偏好', { updates, newPreferences });
        return newPreferences;
      } else {
        logger.error('保存用户偏好失败', result.error);
        return prev;
      }
    });
  }, []);

  /**
   * 标记为脏数据
   */
  const markDirty = useCallback(() => {
    setWorkflowState(prev => ({ ...prev, isDirty: true }));
  }, []);

  /**
   * 标记为干净数据
   */
  const markClean = useCallback(() => {
    setWorkflowState(prev => ({ 
      ...prev, 
      isDirty: false, 
      lastSaved: Date.now() 
    }));
  }, []);

  /**
   * 保存状态到本地存储
   */
  const saveState = useCallback(() => {
    const result = handleSyncOperation(() => {
      const stateToSave = {
        workflowState,
        canvasState,
        timestamp: Date.now()
      };
      
      // 保存工作流草稿
      if (workflowState.workflowId) {
        const draftKey = `${STORAGE_KEYS.WORKFLOW_DRAFT}_${workflowState.workflowId}`;
        localStorage.setItem(draftKey, JSON.stringify(stateToSave));
      }
      
      // 保存画布视口
      localStorage.setItem(STORAGE_KEYS.CANVAS_VIEWPORT, JSON.stringify(canvasState.viewport));
      
      logger.info('状态保存成功', { workflowId: workflowState.workflowId });
      return true;
    }, '保存状态失败');
    
    if (!result.success) {
      logger.error('保存状态失败', result.error);
    }
  }, [workflowState, canvasState]);

  /**
   * 从本地存储加载状态
   */
  const loadState = useCallback(() => {
    const result = handleSyncOperation(() => {
      // 加载用户偏好
      const savedPreferences = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        setUserPreferences(prev => ({ ...prev, ...preferences }));
      }
      
      // 加载画布视口
      const savedViewport = localStorage.getItem(STORAGE_KEYS.CANVAS_VIEWPORT);
      if (savedViewport) {
        const viewport = JSON.parse(savedViewport);
        setCanvasState(prev => ({ ...prev, viewport }));
      }
      
      // 加载工作流草稿
      if (workflowState.workflowId) {
        const draftKey = `${STORAGE_KEYS.WORKFLOW_DRAFT}_${workflowState.workflowId}`;
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          if (draft.workflowState) {
            setWorkflowState(prev => ({ ...prev, ...draft.workflowState }));
          }
          if (draft.canvasState) {
            setCanvasState(prev => ({ ...prev, ...draft.canvasState }));
          }
        }
      }
      
      logger.info('状态加载成功', { workflowId: workflowState.workflowId });
      return true;
    }, '加载状态失败');
    
    if (!result.success) {
      logger.error('加载状态失败', result.error);
    }
  }, [workflowState.workflowId]);

  /**
   * 重置状态
   */
  const resetState = useCallback(() => {
    setWorkflowState(DEFAULT_WORKFLOW_STATE);
    setCanvasState(DEFAULT_CANVAS_STATE);
    logger.info('状态已重置');
  }, []);

  /**
   * 获取状态快照
   */
  const getStateSnapshot = useCallback(() => {
    return {
      workflowState,
      canvasState,
      userPreferences,
      timestamp: Date.now()
    };
  }, [workflowState, canvasState, userPreferences]);

  /**
   * 从快照恢复状态
   */
  const restoreFromSnapshot = useCallback((snapshot: any) => {
    if (snapshot.workflowState) {
      setWorkflowState(snapshot.workflowState);
    }
    if (snapshot.canvasState) {
      setCanvasState(snapshot.canvasState);
    }
    if (snapshot.userPreferences) {
      setUserPreferences(snapshot.userPreferences);
    }
    logger.info('从快照恢复状态', { timestamp: snapshot.timestamp });
  }, []);

  // 组件挂载时加载状态
  useEffect(() => {
    loadState();
  }, []);

  // 工作流ID变化时重新加载状态
  useEffect(() => {
    if (workflowState.workflowId !== initialWorkflowId) {
      updateWorkflowState({ workflowId: initialWorkflowId || null });
      loadState();
    }
  }, [initialWorkflowId]);

  // 自动保存
  useEffect(() => {
    if (!userPreferences.autoSave || !workflowState.isDirty) {
      return;
    }

    const timer = setTimeout(() => {
      saveState();
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [workflowState.isDirty, userPreferences.autoSave, autoSaveInterval, saveState]);

  // 页面卸载时保存状态
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (workflowState.isDirty) {
        saveState();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [workflowState.isDirty, saveState]);

  // 使用 useMemo 确保稳定的引用
  const contextValue = useMemo(() => ({
    workflowState,
    updateWorkflowState,
    canvasState,
    updateCanvasState,
    userPreferences,
    updateUserPreferences,
    markDirty,
    markClean,
    saveState,
    loadState,
    resetState,
    getStateSnapshot,
    restoreFromSnapshot
  }), [
    workflowState,
    updateWorkflowState,
    canvasState,
    updateCanvasState,
    userPreferences,
    updateUserPreferences,
    markDirty,
    markClean,
    saveState,
    loadState,
    resetState,
    getStateSnapshot,
    restoreFromSnapshot
  ]);

  return (
    <WorkflowStateContext.Provider value={contextValue}>
      {children}
    </WorkflowStateContext.Provider>
  );
};

/**
 * 使用工作流状态的Hook
 */
export const useWorkflowState = () => {
  const context = useContext(WorkflowStateContext);
  if (!context) {
    throw new Error('useWorkflowState must be used within WorkflowStateProvider');
  }
  return context;
};

/**
 * 高阶组件：为组件提供工作流状态
 */
export function withWorkflowState<P extends object>(
  Component: React.ComponentType<P & { workflowState: WorkflowState }>
) {
  const WrappedComponent = (props: P) => {
    const { workflowState } = useWorkflowState();
    
    return (
      <Component 
        {...props} 
        workflowState={workflowState}
      />
    );
  };

  WrappedComponent.displayName = `withWorkflowState(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// 导出类型
export type { 
  WorkflowState, 
  CanvasStateInfo, 
  UserPreferences, 
  WorkflowStateContextType 
};