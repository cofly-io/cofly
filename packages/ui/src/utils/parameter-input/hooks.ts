// 参数输入组件的自定义 Hooks
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { UnifiedParameterField, LinkageCallbacks } from './types';
import { getGlobalAddedFields, addFieldToGlobal, removeFieldFromGlobal, addFieldsToGlobal, removeFieldsFromGlobal } from './state-management';

// 联动数据管理 Hook - 现在基于控件的target配置
export const useLinkageData = (field: UnifiedParameterField, formValues: Record<string, any>, allFields: UnifiedParameterField[] = [], linkageCallbacks?: LinkageCallbacks) => {
  const [linkageData, setLinkageData] = useState<any[]>([]);
  const [linkageLoading, setLinkageLoading] = useState(false);
  const [linkageError, setLinkageError] = useState<string | null>(null);
  const linkageCacheRef = useRef<Map<string, any[]>>(new Map());

  // 联动数据获取逻辑
  const fetchLinkageData = useCallback(async (sourceValue: any) => {
    if (!linkageCallbacks || !sourceValue) {
      console.log('⚠️ [fetchLinkageData] 缺少必要参数，清空数据');
      setLinkageData([]);
      return;
    }

    // 使用 fetchConnectDetail 作为默认的联动方法
    const fetchMethod = linkageCallbacks.fetchConnectDetail;
    if (!fetchMethod) {
      console.warn(`❌ [fetchLinkageData] 联动方法未找到`);
      return;
    }

    // 生成缓存键
    const cacheKey = `${field.fieldName}_fetchConnectDetail_${JSON.stringify(sourceValue)}`;
    console.log('🔑 [fetchLinkageData] 缓存键:', cacheKey);

    // 检查缓存
    const cachedData = linkageCacheRef.current.get(cacheKey);
    if (cachedData) {
      setLinkageData(cachedData);
      return;
    }

    try {
      setLinkageLoading(true);
      setLinkageError(null);

      const data = await fetchMethod(sourceValue);
      const resultData = data || [];

      // 缓存结果
      linkageCacheRef.current.set(cacheKey, resultData);
      setLinkageData(resultData);
    } catch (error) {
      setLinkageError(error instanceof Error ? error.message : '数据获取失败');
      setLinkageData([]);
    } finally {
      setLinkageLoading(false);
    }
  }, [field.fieldName, linkageCallbacks]);

  // 监听是否有其他字段target到当前字段
  useEffect(() => {
    // 查找所有target到当前字段的字段
    const sourceFields = allFields.filter(sourceField =>
      sourceField.control.linkage?.targets?.includes(field.fieldName)
    );

    if (sourceFields.length === 0) {
      // 如果没有字段target到当前字段，清空数据
      setLinkageData([]);
      return;
    }

    console.log('🔗 [useLinkageData] 找到target到当前字段的源字段:', {
      targetField: field.fieldName,
      sourceFields: sourceFields.map(f => f.fieldName)
    });

    // 监听所有源字段的值变化
    const sourceValues = sourceFields.map(sourceField => {
      const value = formValues[sourceField.fieldName];

      // 如果是JSON格式的值（如selectlistdesc），尝试解析ID
      // if (typeof value === 'string' && value.startsWith('{')) {
      //   try {
      //     const connectInfo = JSON.parse(value);
      //     return connectInfo.id;
      //   } catch {
      //     return value;
      //   }
      // }

      return value;
    });

    // 获取第一个有值的源字段值
    const validSourceValue = sourceValues.find(value => value && value !== '');

    if (validSourceValue) {
      console.log('📞 [useLinkageData] 检测到源字段值变化，获取联动数据:', {
        targetField: field.fieldName,
        sourceValue: validSourceValue
      });

      fetchLinkageData(validSourceValue);
    } else {
      console.log('🗑️ [useLinkageData] 所有源字段值为空，清空数据');
      setLinkageData([]);
    }
  }, [
    // 监听所有可能的源字段值变化 - 使用JSON.stringify来稳定依赖
    JSON.stringify(allFields
      .filter(sourceField => sourceField.control.linkage?.targets?.includes(field.fieldName))
      .map(sourceField => ({ fieldName: sourceField.fieldName, value: formValues[sourceField.fieldName] }))),
    field.fieldName,
    fetchLinkageData
  ]);

  return {
    linkageData,
    linkageLoading,
    linkageError
  };
};

// 全局字段状态管理 Hook
export const useGlobalFieldState = () => {
  const [addedFields, setAddedFields] = useState<Set<string>>(() => getGlobalAddedFields());

  // 监听全局状态变化
  useEffect(() => {
    const checkGlobalState = () => {
      const globalFields = getGlobalAddedFields();
      const currentFields = new Set(globalFields);

      // 只有当状态真正变化时才更新
      if (currentFields.size !== addedFields.size ||
        ![...currentFields].every(field => addedFields.has(field))) {
        setAddedFields(currentFields);
      }
    };

    // 定期检查全局状态变化，但频率降低
    const interval = setInterval(checkGlobalState, 200);

    return () => clearInterval(interval);
  }, [addedFields]);

  return {
    addedFields,
    setAddedFields
  };
};

// AddBy 字段管理 Hook
export const useAddByField = (
  field: UnifiedParameterField,
  formValues: Record<string, any>,
  addedFields: Set<string>,
  setAddedFields: (fields: Set<string>) => void
) => {
  // 检查当前字段是否是通过 addBy 显示的
  const isAddedByField = useMemo(() => {
    if (!field.conditionRules?.addBy) return false;
    return addedFields.has(field.fieldName);
  }, [field.conditionRules?.addBy, addedFields, field.fieldName]);

  // 处理 addBy 字段的添加逻辑
  useEffect(() => {
    if (!field.conditionRules?.addBy) return;

    const { addBy } = field.conditionRules;
    let shouldAdd = false;

    for (const [key, values] of Object.entries(addBy)) {
      const formValue = formValues[key];
      if ((values as string[]).includes(formValue)) {
        shouldAdd = true;
        break;
      }
    }

    if (shouldAdd) {
      // 检查是否是 collection 类型
      if (field.control.dataType === 'options' && field.control.options && Array.isArray(field.control.options)) {
        // 对于 collection，批量添加所有子字段
        const subFieldNames = (field.control.options as any[]).map(subField => `${field.fieldName}.${subField.fieldName}`);
        const globalFields = addFieldsToGlobal([field.fieldName, ...subFieldNames]);
        setAddedFields(new Set(globalFields));
      } else {
        // 对于普通字段，单独添加
        const globalFields = addFieldToGlobal(field.fieldName);
        setAddedFields(new Set(globalFields));
      }
    }
  }, [field.conditionRules?.addBy, formValues, field.fieldName, field.control.dataType, field.control.options]);

  // 处理删除字段
  const handleDeleteField = useCallback((onChange: (name: string, value: any) => void) => {
    console.log('🗑️ [DeleteField] 开始删除字段:', {
      fieldName: field.fieldName,
      fieldType: field.control.dataType,
      isCollection: field.control.dataType === 'options',
      hasOptions: !!field.control.options,
      optionsLength: field.control.options?.length || 0,
      currentAddedFields: Array.from(addedFields)
    });

    // 检查是否是 collection 类型
    if (field.control.dataType === 'options' && field.control.options && Array.isArray(field.control.options)) {
      // 对于 collection，批量删除所有子字段
      const subFieldNames = (field.control.options as any[]).map(subField => `${field.fieldName}.${subField.fieldName}`);
      console.log('📦 [DeleteField] Collection 删除子字段:', {
        mainField: field.fieldName,
        subFieldNames,
        allFieldsToDelete: [field.fieldName, ...subFieldNames]
      });

      const { addedFields: newAddedFields } = removeFieldsFromGlobal([field.fieldName, ...subFieldNames]);
      setAddedFields(new Set(newAddedFields));

      console.log('✅ [DeleteField] Collection 删除完成:', {
        newAddedFieldsSize: newAddedFields.size,
        newAddedFieldsList: Array.from(newAddedFields)
      });
    } else {
      // 对于普通字段，单独删除
      console.log('📄 [DeleteField] 普通字段删除:', field.fieldName);
      const { addedFields: newAddedFields } = removeFieldFromGlobal(field.fieldName);
      setAddedFields(new Set(newAddedFields));

      console.log('✅ [DeleteField] 普通字段删除完成:', {
        newAddedFieldsSize: newAddedFields.size,
        newAddedFieldsList: Array.from(newAddedFields)
      });
    }

    // 清空字段值
    onChange(field.fieldName, field.control.defaultValue || '');
    console.log('🔄 [DeleteField] 已清空字段值:', {
      fieldName: field.fieldName,
      defaultValue: field.control.defaultValue || ''
    });

    // 特殊处理：如果删除的是通过 addBy 添加的字段，需要重置对应的 selectadd 控件
    if (field.conditionRules?.addBy) {
      console.log('🔄 [DeleteField] 检查是否需要重置 selectadd 控件:', {
        fieldName: field.fieldName,
        addBy: field.conditionRules.addBy
      });

      // 获取当前全局状态
      const currentGlobalFields = getGlobalAddedFields();
      console.log('🔍 [DeleteField] 当前全局字段状态:', Array.from(currentGlobalFields));

      // 找到需要重置的 selectadd 控件
      Object.keys(field.conditionRules.addBy).forEach(dependentFieldName => {
        console.log('🎯 [DeleteField] 需要重置的 selectadd 控件:', {
          dependentFieldName,
          currentValue: formValues[dependentFieldName]
        });

        // 通过触发一个自定义事件来通知特定的 selectadd 控件重置
        const resetEvent = new CustomEvent('selectadd-reset', {
          detail: {
            targetField: dependentFieldName,
            deletedField: field.fieldName
          }
        });
        window.dispatchEvent(resetEvent);
        console.log('📡 [DeleteField] 已发送 selectadd 重置事件:', {
          targetField: dependentFieldName,
          deletedField: field.fieldName
        });
      });
    }
  }, [field.fieldName, field.control.defaultValue, field.control.dataType, field.control.options, addedFields]);

  return {
    isAddedByField,
    handleDeleteField
  };
};

// 字段显示逻辑 Hook
export const useFieldVisibility = (field: UnifiedParameterField, formValues: Record<string, any>, addedFields: Set<string>) => {
  const shouldShow = useMemo(() => {
    if (!field.conditionRules) return true;

    const { showBy, hide, addBy } = field.conditionRules;

    // 检查隐藏条件
    if (hide) {
      for (const [key, values] of Object.entries(hide)) {
        const formValue = formValues[key];
        if ((values as string[]).includes(formValue)) {
          return false;
        }
      }
    }

    // 检查显示条件
    if (showBy) {
      for (const [key, values] of Object.entries(showBy)) {
        const formValue = formValues[key];
        if (!(values as string[]).includes(formValue)) {
          return false;
        }
      }
    }

    // 检查 addBy 条件 - 累积显示逻辑
    if (addBy) {
      let shouldShowByAddBy = false;

      for (const [key, values] of Object.entries(addBy)) {
        const formValue = formValues[key];

        // 只有当前值匹配时才显示（不考虑历史状态）
        if ((values as string[]).includes(formValue)) {
          shouldShowByAddBy = true;
          break;
        }

        // 如果该字段已经被添加过，也显示
        if (addedFields.has(field.fieldName)) {
          shouldShowByAddBy = true;
          break;
        }
      }

      if (!shouldShowByAddBy) {
        return false;
      }
    }

    return true;
  }, [field.conditionRules, formValues, addedFields, field.fieldName]);

  // 检查字段是否应该启用（基于联动配置）
  const shouldEnable = useMemo(() => {
    // 现在linkage只用于targeting，不再有dependsOn，所以默认启用所有字段
    return true;
  }, []);

  return {
    shouldShow,
    shouldEnable
  };
};