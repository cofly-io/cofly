// 参数输入组件的类型定义
import { INodeFields, IFieldLinkageConfig } from '@repo/common';

export type ParameterInputVariant = 'node' | 'connect';

// 联动回调函数映射接口
export interface LinkageCallbacks {
  fetchConnectDetail?: (datasourceId: string) => Promise<Array<{ label: string; value: string; }>>;
  // 如果需要其他方法，可以后续添加
}

// 使用@repo/common中的INodeFields替代UnifiedParameterField
export type UnifiedParameterField = INodeFields;

export interface UnifiedParameterInputProps {
  variant: ParameterInputVariant;
  field: UnifiedParameterField;
  value: any;
  onChange: (name: string, value: any) => void;
  formValues?: Record<string, any>;
  onExpandModeChange?: (expanded: boolean) => void;
  connectConfigs?: Array<{
    id: string;
    name: string;
    ctype: string;
    mtype: string;
    nodeinfo: Record<string, any>;
    description?: string;
  }>; // 添加连接配置数据源
  onFetchConnectInstances?: (ctype: string) => Promise<Array<{
    id: string;
    name: string;
    ctype: string;
    mtype: string;
    nodeinfo: Record<string, any>;
    description?: string;
  }>>; // 动态获取连接配置的回调
  onFetchConnectDetail?: (datasourceId: string) => Promise<{
    loading: boolean;
    error: string | null;
    tableOptions: Array<{ label: string; value: string; }>;
  }>; // 动态获取表名的回调
  // 新增：通用联动回调函数映射
  linkageCallbacks?: LinkageCallbacks;
  // 新增：所有字段配置，用于构建选项到字段的映射关系
  allFields?: UnifiedParameterField[];
  // 新增：标识是否在 collection 内部
  isInCollection?: boolean;
  // 新增：验证错误状态
  validationErrors?: Set<string>;
  // 新增：节点ID，用于状态隔离
  nodeId?: string;
  // 新增：AI助手点击回调
  onAIhelpClick?: (prompt: string, content: string, fieldName: string) => Promise<string>;
}