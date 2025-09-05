"use client";

import React from 'react';
import { UnifiedParameterInput } from '../utils/parameter-input/UnifiedParameterInput';
import type { UnifiedParameterField, LinkageCallbacks } from '../utils/parameter-input/types';
import type { INodeFields } from '@repo/common';

interface ParameterInputProps {
  parameter:INodeFields;
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
  onFetchConnectInstances?: (connectType: string) => Promise<Array<{
    id: string;
    name: string;
    ctype: string;
    mtype: string;
    nodeinfo: Record<string, any>;
    description?: string;
  }>>;
  onFetchConnectDetail?: (datasourceId: string) => Promise<{
    loading: boolean;
    error: string | null;
    tableOptions: Array<{ label: string; value: string; }>;
  }>; // 动态获取表名的回调
  // 新增：通用联动回调函数映射
  linkageCallbacks?: LinkageCallbacks;
  // 新增：所有字段配置
  allParameters?: ParameterInputProps['parameter'][];
  // 新增：验证错误状态
  validationErrors?: Set<string>;
  // 新增：节点ID，用于状态隔离
  nodeId?: string;
  // 新增：AI助手点击回调
  onAIhelpClick?: (rules: string, content: string, fieldName: string) => Promise<string>;
}

export const ParameterInput: React.FC<ParameterInputProps> = ({
  parameter,
  value,
  onChange,
  formValues,
  onExpandModeChange,
  connectConfigs,
  onFetchConnectInstances,
  onFetchConnectDetail,
  linkageCallbacks,
  allParameters = [],
  validationErrors,
  nodeId,
  onAIhelpClick
}) => {
 // 将原始 parameter 转换为统一的 field 格式
  const unifiedField: UnifiedParameterField = {
    fieldName: parameter.fieldName,
    label: parameter.label,
    description: parameter.description,
    tooltip: parameter.tooltip,
    conditionRules: parameter.conditionRules,
    control: parameter.control,
    linkage: parameter.linkage,
    AIhelp: parameter.AIhelp
  };

  // 转换所有参数为统一格式
  const allFields: UnifiedParameterField[] = allParameters.map(param => ({
    fieldName: param.fieldName,
    label: param.label,
    description: param.description,
    tooltip: param.tooltip,
    conditionRules: param.conditionRules,
    control: param.control,
    linkage: param.linkage,
    AIhelp: param.AIhelp
  }));

  return (
    <UnifiedParameterInput
      variant="node"
      field={unifiedField}
      value={value}
      onChange={onChange}
      formValues={formValues}
      onExpandModeChange={onExpandModeChange}
      connectConfigs={connectConfigs}
      onFetchConnectInstances={onFetchConnectInstances}
      onFetchConnectDetail={onFetchConnectDetail}
      linkageCallbacks={linkageCallbacks}
      allFields={allFields}
      validationErrors={validationErrors}
      nodeId={nodeId}
      onAIhelpClick={onAIhelpClick}
    />
  );
};