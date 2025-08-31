/**
 * 工作流测试服务
 * 用于调用工作流测试接口
 */

export interface WorkflowTestResponse {
  ids: string[];
  [key: string]: any;
}

export interface WorkflowStopResponse {
  success: boolean;
  error?: string;
}

/**
 * 调用工作流测试接口
 * @param workflowId 工作流ID
 * @returns Promise<WorkflowTestResponse>
 */
export const testWorkflow = async (workflowId: string): Promise<WorkflowTestResponse> => {
  try {
    const response = await fetch(`/api/workflow?id=${encodeURIComponent(workflowId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * 停止工作流执行
 * @param eventId 事件ID
 * @returns Promise<WorkflowStopResponse>
 */
export const stopWorkflow = async (eventId: string): Promise<WorkflowStopResponse> => {
  try {
    const response = await fetch(`/api/workflow/stop/${encodeURIComponent(eventId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

export interface WorkflowLogResponse {
  data?: any;
  error?: string;
  status?: 'running' | 'success' | 'error'| 'cancelled';
  success?: boolean;
}

/**
 * 获取工作流执行日志（带请求合并和防抖优化）
 * @param eventId 事件ID
 * @param forceRefresh 是否强制刷新，跳过防抖
 * @returns Promise<WorkflowLogResponse>
 */
export const getWorkflowLog = async (eventId: string, forceRefresh: boolean = false): Promise<WorkflowLogResponse> => {
  const cacheKey = eventId;
  const now = Date.now();

  // 统计总请求数
  requestStats.totalRequests++;

  // 防抖检查：如果距离上次请求时间太短，则跳过请求
  if (!forceRefresh && requestDebounceCache.has(cacheKey)) {
    const lastRequestTime = requestDebounceCache.get(cacheKey)!;
    const timeSinceLastRequest = now - lastRequestTime;
    const minInterval = 800; // 最小请求间隔800ms，避免过于频繁的请求

    if (timeSinceLastRequest < minInterval) {
      requestStats.debouncedRequests++;
      console.log('🚫 [getWorkflowLog] 防抖跳过请求:', { eventId, timeSinceLastRequest, minInterval, stats: requestStats });

      // 返回一个模拟的响应，表示请求被跳过
      return Promise.resolve({
        data: null,
        error: 'Request debounced',
        status: 'running' // 假设还在运行中
      });
    }
  }

  // 如果已经有相同的请求在进行中，直接返回现有Promise
  if (singleRequestCache.has(cacheKey)) {
    requestStats.mergedRequests++;
    console.log('♻️ [getWorkflowLog] 复用现有请求:', { eventId, stats: requestStats });
    return singleRequestCache.get(cacheKey)!;
  }

  console.log('🌐 [getWorkflowLog] 发起新的网络请求:', { eventId, stats: requestStats });

  // 创建新的请求Promise
  const requestPromise = performActualRequest(eventId);

  // 缓存请求Promise
  singleRequestCache.set(cacheKey, requestPromise);
  requestDebounceCache.set(cacheKey, now);

  // 请求完成后清理缓存
  requestPromise.finally(() => {
    // 对于轮询场景，我们希望每次都获取最新数据，所以请求完成后立即清理缓存
    // 但给并发请求一些时间来复用（比如多个组件同时请求同一个eventId）
    setTimeout(() => {
      singleRequestCache.delete(cacheKey);
      console.log('🧹 [getWorkflowLog] 清理请求缓存:', eventId);
    }, 100); // 100ms后清理缓存，足够并发请求复用
  });

  return requestPromise;
};

/**
 * 执行实际的网络请求
 * @param eventId 事件ID
 * @returns Promise<WorkflowLogResponse>
 */
const performActualRequest = async (eventId: string): Promise<WorkflowLogResponse> => {
  // 统计实际网络请求数
  requestStats.actualNetworkRequests++;
  console.log('🌐 [performActualRequest] 执行网络请求:', { eventId, stats: requestStats });

  try {
    const url = `/api/workflow/log/${encodeURIComponent(eventId)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // 尝试获取错误响应内容
      let errorText = '';
      let errorData = null;
      try {
        errorText = await response.text();

        // 尝试解析为JSON
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          // Error response is not JSON
        }
      } catch (e) {
        // Could not read error response body
      }

      // 对于 500 错误，返回错误信息而不是抛出异常（用于轮询重试）
      if (response.status === 500) {
        const errorMessage = errorData?.error || errorText || `HTTP ${response.status}`;
        return {
          data: null,
          error: errorMessage,
          status: 'error'  // 异常状态
        };
      }

      // 其他错误状态仍然抛出异常
      const errorMessage = errorData?.error || errorText || `HTTP ${response.status}`;
      throw new Error(`getWorkflowLog failed: ${errorMessage} (status: ${response.status})`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * 格式化数据为JSON（如果是对象或JSON字符串）
 * @param data 原始数据
 * @returns 格式化后的数据
 */
const formatDataAsJson = (data: any): any => {
  // 如果是字符串，尝试解析为JSON
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return parsed;
    } catch (error) {
      return data;
    }
  }

  // 如果是对象，直接返回
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data;
  }

  // 其他类型直接返回
  return data;
};

/**
 * 处理完成状态的工作流结果，提取节点输出数据
 * @param result 原始结果
 * @returns 处理后的结果
 */
const processCompletedWorkflowResult = (result: WorkflowLogResponse): WorkflowLogResponse => {
  try {
    // Check if trace is null/undefined (workflow not ready yet)
    if (!result.data || result.data === null || result.data === undefined) {
      return {
        data: null,
        success: false,
        error: 'Workflow trace not available yet',
        status: 'running'  // Still in progress
      };
    }

    // 检查是否有 childrenSpans 数据
    if (!result.data?.childrenSpans || !Array.isArray(result.data.childrenSpans)) {
      return {
        data: null,
        success: true  // 虽然没有数据，但执行成功
      };
    }

    const spans = result.data.childrenSpans;

    // 创建节点输出映射
    const nodeOutputs: Record<string, any> = {};

    spans.forEach((span: any) => {
      // 使用 span.name 作为节点ID（这通常对应节点名称）
      if (span.name && span.output) {
        const spanName = span.name; // 确保 spanName 不是 undefined

        // 只提取 output.data，并进行JSON格式化
        const outputData = span.output.data || span.output;
        const formattedData = formatDataAsJson(outputData);
        nodeOutputs[spanName] = formattedData;
      }
    });

    // 🎯 返回所有节点的输出映射，而不是单个节点的输出
    // 这样 useNodeTesting 中的节点匹配逻辑才能正常工作
    
    console.log('🔍 [processCompletedWorkflowResult] 提取的节点输出:', {
      totalNodes: Object.keys(nodeOutputs).length,
      nodeNames: Object.keys(nodeOutputs),
      nodeOutputs
    });

    // 过滤掉系统节点，但保留所有用户节点
    const nodeKeys = Object.keys(nodeOutputs);
    const userNodeKeys = nodeKeys.filter(key =>
      key !== 'Load workflow configuration' &&
      key !== 'function success' &&
      !key.startsWith('$')
    );

    // 创建过滤后的节点输出映射
    const filteredNodeOutputs: Record<string, any> = {};
    userNodeKeys.forEach(key => {
      filteredNodeOutputs[key] = nodeOutputs[key];
    });

    console.log('✅ [processCompletedWorkflowResult] 过滤后的节点输出:', {
      userNodeCount: userNodeKeys.length,
      userNodeNames: userNodeKeys,
      filteredNodeOutputs
    });

    // 返回所有用户节点的输出映射
    return {
      data: filteredNodeOutputs,
      success: true
    };

  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : '处理结果时发生错误',
      status: 'error'  // 异常状态
    };
  }
};

// 请求合并缓存：存储正在进行的轮询请求
const pollingCache = new Map<string, Promise<WorkflowLogResponse>>();

// 进度回调缓存：存储每个eventId的所有回调函数
const progressCallbacks = new Map<string, Array<(data: any) => void>>();

// 单次请求合并缓存：存储正在进行的 getWorkflowLog 请求
const singleRequestCache = new Map<string, Promise<WorkflowLogResponse>>();

// 请求防抖缓存：避免过于频繁的请求
const requestDebounceCache = new Map<string, number>();

// 轮询取消标志：存储每个eventId的取消状态
const pollingCancelFlags = new Map<string, boolean>();

/**
 * 轮询获取工作流执行日志，直到完成（带请求合并优化）
 * @param eventId 事件ID
 * @param onProgress 进度回调函数
 * @param pollInterval 轮询间隔（毫秒），默认2000ms
 * @param maxAttempts 最大轮询次数，默认150次（5分钟）
 * @returns Promise<WorkflowLogResponse>
 */
export const pollWorkflowLog = async (
  eventId: string,
  onProgress?: (data: any) => void,
  pollInterval: number = 2000,
  maxAttempts: number = 150
): Promise<WorkflowLogResponse> => {
  console.log('🔄 [pollWorkflowLog] 请求轮询:', { eventId, hasExistingPoll: pollingCache.has(eventId) });

  // 如果已经有相同eventId的轮询在进行，直接复用
  if (pollingCache.has(eventId)) {
    console.log('♻️ [pollWorkflowLog] 复用现有轮询请求:', eventId);

    // 添加进度回调到回调列表
    if (onProgress) {
      if (!progressCallbacks.has(eventId)) {
        progressCallbacks.set(eventId, []);
      }
      progressCallbacks.get(eventId)!.push(onProgress);
    }

    // 返回现有的Promise
    return pollingCache.get(eventId)!;
  }

  // 初始化取消标志为false
  pollingCancelFlags.set(eventId, false);

  // 创建新的轮询Promise
  const pollingPromise = createPollingPromise(eventId, pollInterval, maxAttempts);

  // 缓存Promise
  pollingCache.set(eventId, pollingPromise);

  // 添加进度回调
  if (onProgress) {
    progressCallbacks.set(eventId, [onProgress]);
  }

  // 轮询完成后清理缓存
  pollingPromise.finally(() => {
    console.log('🧹 [pollWorkflowLog] 清理轮询缓存:', eventId);
    pollingCache.delete(eventId);
    progressCallbacks.delete(eventId);
    // 清理单次请求缓存和防抖缓存
    singleRequestCache.delete(eventId);
    requestDebounceCache.delete(eventId);
    // 清理取消标志
    pollingCancelFlags.delete(eventId);
  });

  return pollingPromise;
};

/**
 * 创建轮询Promise的内部函数
 */
const createPollingPromise = async (
  eventId: string,
  pollInterval: number,
  maxAttempts: number
): Promise<WorkflowLogResponse> => {
  let attempts = 0;

  const poll = async (): Promise<WorkflowLogResponse> => {
    attempts++;

    // 检查是否已被取消
    if (pollingCancelFlags.get(eventId)) {
        console.log('🛑 [createPollingPromise] 轮询已被取消:', eventId);
        return {
          data: null,
          status: 'cancelled'
        };
      }

    try {
      const result = await getWorkflowLog(eventId);

      // 检查是否是后端错误
      if (result.error) {
        // 如果是 childrenSpans 相关错误，可能是执行还没准备好，继续轮询
        if (result.error.includes('childrenSpans') && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          return poll();
        }

        // 其他错误直接返回
        return {
          data: null,
          error: result.error,
          status: 'error'  // 异常状态
        };
      }

      // 调用所有注册的进度回调
      if (result.data && progressCallbacks.has(eventId)) {
        const callbacks = progressCallbacks.get(eventId)!;
        callbacks.forEach(callback => {
          try {
            callback(result.data);
          } catch (error) {
            console.error('❌ Progress callback error:', error);
          }
        });
      }

      // 检查状态 - 处理 trace 数据格式
      let status = result.data?.status || result.status;

      // 如果是 trace 数据格式，从 trace 中提取状态
      if (result.data && !status && result.data.childrenSpans) {
        // 检查所有子 span 的状态
        const spans = result.data.childrenSpans || [];
        const hasRunning = spans.some((span: any) => span.status === 'RUNNING');
        const hasCompleted = spans.some((span: any) => span.status === 'COMPLETED');
        const hasFailed = spans.some((span: any) => span.status === 'FAILED');

        if (hasRunning) {
          status = 'Running';
        } else if (hasFailed) {
          status = 'Failed';
        } else if (hasCompleted && spans.length > 0) {
          status = 'Completed';
        } else {
          status = 'Unknown';
        }
      }
      // 支持多种状态格式（大小写不敏感）
      const normalizedStatus = status?.toString().toLowerCase();

      if (normalizedStatus === 'completed' || normalizedStatus === 'complete' || normalizedStatus === 'success') {
        // 检查是否已被取消
        if (pollingCancelFlags.get(eventId)) {
          console.log('🛑 [createPollingPromise] 工作流已完成但轮询被取消:', eventId);
          return {
            data: null,
            status: 'cancelled'
          };
        }
        // 处理完成状态的数据，提取节点输出
        const processedResult = processCompletedWorkflowResult(result);
        return processedResult;
      }

      if (normalizedStatus === 'failed' || normalizedStatus === 'error') {
        return {
          data: result.data,
          error: result.error || 'Workflow execution failed',
          status: 'error'  // 异常状态
        };
      }

      if ((normalizedStatus === 'running' || normalizedStatus === 'pending' || normalizedStatus === 'in_progress') && attempts < maxAttempts) {
        console.log('⏳ [createPollingPromise] 继续轮询:', { eventId, attempts, normalizedStatus, pollInterval });
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        // 在递归调用前再次检查取消标志
        if (pollingCancelFlags.get(eventId)) {
            console.log('🛑 [createPollingPromise] 轮询在延时后被取消:', eventId);
            return {
              data: null,
              status: 'cancelled'
            };
          }
        return poll();
      }

      if (attempts >= maxAttempts) {
        return {
          data: null,
          error: 'Polling timeout: Maximum attempts reached',
          status: 'error'  // 异常状态
        };
      }

      // 默认情况下继续轮询
      console.log('⏳ [createPollingPromise] 默认继续轮询:', { eventId, attempts, status: normalizedStatus, pollInterval });
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      // 在递归调用前再次检查取消标志
      if (pollingCancelFlags.get(eventId)) {
        console.log('🛑 [createPollingPromise] 默认轮询在延时后被取消:', eventId);
          return {
            data: null,
            status: 'cancelled'
          };
      }
      return poll();

    } catch (error) {
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        return poll();
      } else {
        throw error;
      }
    }
  };

  return poll();
};

/**
 * 清理指定eventId的所有缓存
 * @param eventId 事件ID
 */
export const clearWorkflowLogCache = (eventId: string) => {
  console.log('🧹 [clearWorkflowLogCache] 手动清理缓存:', eventId);
  // 设置取消标志，停止轮询
  pollingCancelFlags.set(eventId, true);
  // 清理所有相关缓存
  pollingCache.delete(eventId);
  progressCallbacks.delete(eventId);
  singleRequestCache.delete(eventId);
  requestDebounceCache.delete(eventId);
};

/**
 * 清理所有缓存
 */
export const clearAllWorkflowLogCache = () => {
  console.log('🧹 [clearAllWorkflowLogCache] 清理所有缓存');
  pollingCache.clear();
  progressCallbacks.clear();
  singleRequestCache.clear();
  requestDebounceCache.clear();
  pollingCancelFlags.clear();
};

// 请求统计
let requestStats = {
  totalRequests: 0,
  mergedRequests: 0,
  debouncedRequests: 0,
  actualNetworkRequests: 0
};

/**
 * 获取当前缓存状态（用于调试）
 */
export const getWorkflowLogCacheStatus = () => {
  return {
    pollingCacheSize: pollingCache.size,
    progressCallbacksSize: progressCallbacks.size,
    singleRequestCacheSize: singleRequestCache.size,
    requestDebounceCacheSize: requestDebounceCache.size,
    pollingCacheKeys: Array.from(pollingCache.keys()),
    singleRequestCacheKeys: Array.from(singleRequestCache.keys()),
    stats: { ...requestStats }
  };
};

/**
 * 重置请求统计
 */
export const resetWorkflowLogStats = () => {
  requestStats = {
    totalRequests: 0,
    mergedRequests: 0,
    debouncedRequests: 0,
    actualNetworkRequests: 0
  };
  console.log('📊 [resetWorkflowLogStats] 统计已重置');
};

/**
 * 打印请求合并效果报告
 */
export const printRequestMergeReport = () => {
  const { totalRequests, mergedRequests, debouncedRequests, actualNetworkRequests } = requestStats;
  const savedRequests = mergedRequests + debouncedRequests;
  const savingRate = totalRequests > 0 ? ((savedRequests / totalRequests) * 100).toFixed(1) : '0';

  console.log('📊 ========== 请求合并效果报告 ==========');
  console.log(`📈 总请求数: ${totalRequests}`);
  console.log(`🌐 实际网络请求: ${actualNetworkRequests}`);
  console.log(`♻️ 合并的请求: ${mergedRequests}`);
  console.log(`🚫 防抖跳过的请求: ${debouncedRequests}`);
  console.log(`💾 节省的请求: ${savedRequests} (${savingRate}%)`);
  console.log('=========================================');

  return {
    totalRequests,
    actualNetworkRequests,
    mergedRequests,
    debouncedRequests,
    savedRequests,
    savingRate: `${savingRate}%`
  };
};

/**
 * 测试请求合并功能
 * @param eventId 测试用的事件ID
 * @param count 并发请求数量
 */
export const testRequestMerging = async (eventId: string = 'test-event-id', count: number = 5) => {
  console.log(`🧪 [testRequestMerging] 开始测试请求合并，发起 ${count} 个并发请求`);

  resetWorkflowLogStats();

  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(getWorkflowLog(eventId));
  }

  try {
    await Promise.all(promises);
    console.log('✅ [testRequestMerging] 所有请求完成');
    printRequestMergeReport();
  } catch (error) {
    console.error('❌ [testRequestMerging] 测试失败:', error);
  }
};

/**
 * 测试轮询防抖功能
 * @param eventId 测试用的事件ID
 * @param interval 请求间隔（毫秒）
 * @param count 请求次数
 */
export const testPollingDebounce = async (eventId: string = 'test-polling-id', interval: number = 500, count: number = 10) => {
  console.log(`🧪 [testPollingDebounce] 开始测试轮询防抖，每 ${interval}ms 发起一次请求，共 ${count} 次`);

  resetWorkflowLogStats();

  for (let i = 0; i < count; i++) {
    console.log(`📤 [testPollingDebounce] 发起第 ${i + 1} 次请求`);
    try {
      await getWorkflowLog(eventId);
    } catch (error) {
      console.log(`❌ [testPollingDebounce] 第 ${i + 1} 次请求失败:`, error);
    }

    if (i < count - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  console.log('✅ [testPollingDebounce] 所有请求完成');
  printRequestMergeReport();
};

// 在全局对象上暴露调试函数（仅在开发环境）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).workflowTestDebug = {
    getCacheStatus: getWorkflowLogCacheStatus,
    resetStats: resetWorkflowLogStats,
    printReport: printRequestMergeReport,
    clearCache: clearAllWorkflowLogCache,
    testMerging: testRequestMerging,
    testPolling: testPollingDebounce
  };
}