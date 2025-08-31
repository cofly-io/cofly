/**
 * 节点调试服务
 * 用于调用单个节点的调试接口
 */

export interface NodeDebugRequest {
  actions: Array<{
    id: string;
    inputs: Record<string, any>;
    kind: string;
    nodeName: string;
    position: {
      x: number;
      y: number;
    };
    type: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
  }>;
}

export interface NodeDebugResponse {
  eventId?: string;
  runData: any[];
}

// 新增：错误响应接口
export interface NodeDebugErrorResponse {
  error: true;
  status: number;
  statusText: string;
  message: string;
  responseData?: any; // 错误响应的JSON数据
  timestamp: string;
}

/**
 * 调用节点调试接口
 * @param nodeData 节点数据
 * @param waitOutput 是否等待输出结果
 * @returns Promise<NodeDebugResponse>
 */
export const debugNode = async (
  nodeData: NodeDebugRequest,
  waitOutput: boolean = true
): Promise<NodeDebugResponse> => {
  try {

    const searchParams = new URLSearchParams(window.location.search);
    const workflowId = searchParams.get('workflowID');

    const response = await fetch(`/api/workflow/debug?workflowID=${workflowId}&waitOutput=${waitOutput}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nodeData),
    });

    console.log('🚀 [debugNode] Response status:', response.status);
    console.log('🚀 [debugNode] Response headers:', [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [debugNode] Error response:', errorText);

      // 尝试解析错误响应为JSON
      let errorData: any = null;
      try {
        errorData = JSON.parse(errorText);
        console.log('✅ [debugNode] Error response parsed as JSON:', errorData);
      } catch (parseError) {
        console.log('⚠️ [debugNode] Error response is not valid JSON, using text format');
        errorData = { message: errorText };
      }

      // 创建详细的错误对象
      const errorResponse: NodeDebugErrorResponse = {
        error: true,
        status: response.status,
        statusText: response.statusText,
        message: `HTTP ${response.status}: ${response.statusText}`,
        responseData: errorData,
        timestamp: new Date().toISOString()
      };

      console.log('❌ [debugNode] Complete error response:', errorResponse);

      // 抛出包含完整错误信息的错误对象
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).debugResponse = errorResponse;
      throw error;
    }

    const result = await response.json();
    console.log('✅ [debugNode] Success result:', JSON.stringify(result, null, 2));

    return result;
  } catch (error) {
    console.error('❌ [debugNode] Debug failed:', error);
    throw error;
  }
};

