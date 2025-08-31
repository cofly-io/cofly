"use client";

import React from 'react';
import { UnifiedParameterInput, type UnifiedParameterField, type LinkageCallbacks } from '../utils/UnifiedParameterInput';
import type { NodePropertyTypes,INodeFields } from '@repo/common';

interface ParameterInputProps {
  parameter:INodeFields;
  // parameter: {
  //   name: string;
  //   displayName: string;
  //   type: string;
  //   controlType?: string;
  //   default?: any;
  //   options?: { name: string; value: any; description?: string }[];
  //   description?: string;
  //   placeholder?: string;
  //   ConnectType?: string; // 添加ConnectType支持
  //   displayOptions?: {
  //     show?: {
  //       [key: string]: string[];
  //     };
  //     hide?: {
  //       [key: string]: string[];
  //     };
  //     addBy?: {
  //       [key: string]: string[];
  //     };
  //   };
  //   // 新增：联动配置支持
  //   linkage?: {
  //     dependsOn?: string;
  //     fetchMethod?: string;
  //     clearOnChange?: boolean;
  //     enableWhen?: (value: any) => boolean;
  //     targets?: string[];
  //     trigger?: 'onChange' | 'onBlur';
  //   };
  //   // 新增：typeOptions支持
  //    typeOptions?: {
  //      password?: boolean;
  //      minValue?: number;
  //      maxValue?: number;
  //      numberPrecision?: number;
  //      size?: 'small' | 'medium' | 'large';
  //      showText?: [string, string]; // [开启文本, 关闭文本]
  //    };
  //    // 新增：required支持
  //    required?: boolean;
  //  };
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
    name: parameter.name,
    displayName: parameter.displayName,
    type: parameter.type as NodePropertyTypes,
    controlType: parameter.controlType,
    default: parameter.default,
    options: parameter.options,
    description: parameter.description,
    displayOptions: parameter.displayOptions,
    connectType: parameter.connectType, // 传递connectType
    linkage: parameter.linkage, // 传递联动配置
    AIhelp: (parameter as any).AIhelp, // 传递AIhelp配置
    // Node 变体的默认值
    hint: undefined,
    placeholder: parameter.placeholder, // 传递placeholder属性
    required: (parameter as any).required || false,
    isSecure: false,
    typeOptions: (parameter as any).typeOptions
  };

  // 转换所有参数为统一格式
  const allFields: UnifiedParameterField[] = allParameters.map(param => ({
    name: param.name,
    displayName: param.displayName,
    type: param.type as NodePropertyTypes,
    controlType: param.controlType,
    default: param.default,
    options: param.options,
    description: param.description,
    displayOptions: param.displayOptions,
    connectType: param.connectType,
    linkage: param.linkage,
    AIhelp: (param as any).AIhelp, // 传递AIhelp配置
    hint: undefined,
    placeholder: param.placeholder,
    required: (param as any).required || false,
    isSecure: false,
    typeOptions: (param as any).typeOptions
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