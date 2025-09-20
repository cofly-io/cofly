// 工作流渲染问题调试脚本
// 在浏览器控制台中运行此脚本来诊断问题

console.log('🔍 开始调试工作流渲染问题...');

// 1. 检查 URL 参数
const urlParams = new URLSearchParams(window.location.search);
const workflowID = urlParams.get('workflowID');
console.log('📋 URL 参数:', { workflowID, fullURL: window.location.href });

// 2. 检查 WorkflowContext 状态
function checkWorkflowContext() {
  // 尝试从 React DevTools 获取 Context 状态
  const reactFiberNode = document.querySelector('[data-reactroot]')?._reactInternalFiber ||
                        document.querySelector('#__next')?._reactInternalFiber ||
                        document.querySelector('#root')?._reactInternalFiber;
  
  console.log('🔍 React Fiber Node:', reactFiberNode);
  
  // 检查是否有 WorkflowContext 相关的状态
  if (window.React && window.React.version) {
    console.log('⚛️ React 版本:', window.React.version);
  }
}

// 3. 检查 API 请求
async function checkAPIRequest() {
  if (!workflowID) {
    console.warn('⚠️ 没有 workflowID，无法检查 API 请求');
    return;
  }
  
  try {
    console.log('🌐 发送 API 请求:', `/api/workflow-config/${workflowID}`);
    const response = await fetch(`/api/workflow-config/${workflowID}`);
    const data = await response.json();
    
    console.log('📥 API 响应:', {
      status: response.status,
      success: data.success,
      hasData: !!data.data,
      data: data.data
    });
    
    if (data.success && data.data) {
      const workflowData = data.data;
      console.log('📋 工作流数据详情:', {
        name: workflowData.name,
        hasNodesInfo: !!workflowData.nodesInfo,
        hasRelation: !!workflowData.relation,
        nodesInfoType: typeof workflowData.nodesInfo,
        relationtype: typeof workflowData.relation
      });
      
      // 尝试解析 nodesInfo
      if (workflowData.nodesInfo) {
        try {
          const nodesInfo = typeof workflowData.nodesInfo === 'string' 
            ? JSON.parse(workflowData.nodesInfo) 
            : workflowData.nodesInfo;
          console.log('🔧 解析后的 nodesInfo:', {
            isArray: Array.isArray(nodesInfo),
            length: nodesInfo?.length,
            firstNode: nodesInfo?.[0],
            allNodeIds: nodesInfo?.map(n => n.id)
          });
        } catch (error) {
          console.error('❌ 解析 nodesInfo 失败:', error);
        }
      }
      
      // 尝试解析 relation
      if (workflowData.relation) {
        try {
          const relation = typeof workflowData.relation === 'string' 
            ? JSON.parse(workflowData.relation) 
            : workflowData.relation;
          console.log('🔗 解析后的 relation:', {
            isArray: Array.isArray(relation),
            length: relation?.length,
            relations: relation
          });
        } catch (error) {
          console.error('❌ 解析 relation 失败:', error);
        }
      }
    }
  } catch (error) {
    console.error('❌ API 请求失败:', error);
  }
}

// 4. 检查 DOM 中的 ReactFlow 元素
function checkReactFlowDOM() {
  const reactFlowElements = document.querySelectorAll('.react-flow');
  console.log('🎨 ReactFlow DOM 元素:', {
    count: reactFlowElements.length,
    elements: Array.from(reactFlowElements).map(el => ({
      className: el.className,
      children: el.children.length,
      hasNodes: el.querySelector('.react-flow__node') !== null,
      hasEdges: el.querySelector('.react-flow__edge') !== null
    }))
  });
  
  const nodes = document.querySelectorAll('.react-flow__node');
  const edges = document.querySelectorAll('.react-flow__edge');
  
  console.log('🔧 ReactFlow 节点和边:', {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodeIds: Array.from(nodes).map(n => n.getAttribute('data-id')),
    edgeIds: Array.from(edges).map(e => e.getAttribute('data-id'))
  });
}

// 5. 检查控制台错误
function checkConsoleErrors() {
  console.log('🔍 检查控制台错误...');
  
  // 重写 console.error 来捕获错误
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args);
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.log('❌ 捕获到的错误:', errors);
    console.error = originalError; // 恢复原始函数
  }, 1000);
}

// 6. 检查网络请求
function checkNetworkRequests() {
  console.log('🌐 监听网络请求...');
  
  // 监听 fetch 请求
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    console.log('📡 Fetch 请求:', args[0]);
    return originalFetch.apply(this, args).then(response => {
      console.log('📥 Fetch 响应:', {
        url: args[0],
        status: response.status,
        ok: response.ok
      });
      return response;
    });
  };
  
  setTimeout(() => {
    window.fetch = originalFetch; // 恢复原始函数
  }, 10000);
}

// 执行所有检查
async function runAllChecks() {
  console.log('🚀 开始执行所有检查...');
  
  checkWorkflowContext();
  await checkAPIRequest();
  checkReactFlowDOM();
  checkConsoleErrors();
  checkNetworkRequests();
  
  console.log('✅ 调试检查完成！请查看上面的输出结果。');
}

// 运行调试
runAllChecks();

// 提供手动检查函数
window.debugWorkflow = {
  checkAPI: checkAPIRequest,
  checkDOM: checkReactFlowDOM,
  checkContext: checkWorkflowContext,
  runAll: runAllChecks
};

console.log('💡 提示：你可以使用 window.debugWorkflow.checkAPI() 等函数进行手动检查');