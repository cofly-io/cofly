"use client";

import React from 'react';
import type { IConnectField } from '@repo/common';
import type { UnifiedParameterField } from '../../../utils/parameter-input/types';
import { UnifiedParameterInput } from '../../../utils/parameter-input/UnifiedParameterInput';

interface ConnectParameterInputProps {
  field: IConnectField;
  value: any;
  onChange: (name: string, value: any) => void;
  formValues?: Record<string, any>;
}

export const ConnectParameterInput: React.FC<ConnectParameterInputProps> = ({
  field,
  value,
  onChange,
  formValues
}) => {
  // 将原始 field 转换为统一的 field 格式，补充缺失的属性
  const unifiedField: UnifiedParameterField = {
    fieldName: field.fieldName,
    label: field.label,
    // type: field.type,
    control: field.control,
    // default: field.default,
    // options: field.options?.map((opt: any) => {
    //   // 类型守卫：检查是否是 INodePropertyOptions
    //   if ('value' in opt) {
    //     return {
    //       name: opt.name || String(opt.value), // 确保 name 不为 undefined
    //       value: opt.value,
    //       description: (opt as any).description // 可能存在的 description 属性
    //     };
    //   }
    //   // 如果是 INodeFields，直接返回
    //   return opt;
    // }),
    // description: field.description,
    // hint: field.hint,
    // placeholder: field.placeholder,
    // required: field.required,
    // isSecure: field.isSecure,
    // typeOptions: (field.typeOptions as any),
    // displayOptions: field.displayOptions
  };

  return (
    <UnifiedParameterInput
      variant="connect"
      field={unifiedField}
      value={value}
      onChange={onChange}
      formValues={formValues}
      onExpandModeChange={undefined} // Connect变体不支持展开模式
    />
  );
};