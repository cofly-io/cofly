// Test result related interfaces

// 测试结果接口
export interface TestResult {
  timestamp: string;
  success: boolean;
  eventId?: string;
  runData?: any;
  inputs: Record<string, any>;
  nodeKind: string;
  source?: 'leftPanel' | 'rightPanel';
  error?: string;
}

// 节点测试结果接口
export interface NodeTestResults {
  lastTestResult: TestResult;
  testHistory: TestResult[];
}

// 节点参数接口
export interface NodeParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json' | 'textarea' | 'select' | 'multiSelect';
  displayName: string;
  description?: string;
  default?: any;
  required?: boolean;
  options?: Array<{ name: string; value: any }>;
  placeholder?: string;
}