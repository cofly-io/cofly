// 参数输入组件的自定义 Hooks
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { UnifiedParameterField, LinkageCallbacks } from './types';
import { getGlobalAddedFields, addFieldToGlobal, removeFieldFromGlobal, addFieldsToGlobal, removeFieldsFromGlobal, clearGlobalState } from './state-management';

// 联动数据管理 Hook
export const useLinkageData = (field: UnifiedParameterField, formValues: Record<string, any>, linkageCallbacks?: LinkageCallbacks) => {
  const [linkageData, setLinkageData] = useState<any[]>([]);
  const [linkageLoading, setLinkageLoading] = useState(false);
  const [linkageError, setLinkageError] = useState<string | null>(null);
  const linkageCacheRef = useRef<Map<string, any[]>>(new Map());
  const isInitializedRef = useRef(false);
  const prevDependentValueRef = useRef<any>(undefined);

  // 联动数据获取逻辑
  const fetchLinkageData = useCallback(async (dependentValue: any) => {
    console.log('🔄 [fetchLinkageData] 开始获取联动数据:', {
      fieldName: field.name,
      dependentValue,
      fetchMethod: field.linkage?.fetchMethod,
      hasLinkageCallbacks: !!linkageCallbacks
    });

    if (!field.linkage?.fetchMethod || !linkageCallbacks || !dependentValue) {
      console.log('⚠️ [fetchLinkageData] 缺少必要参数，清空数据');
      setLinkageData([]);
      return;
    }

    const fetchMethod = linkageCallbacks[field.linkage.fetchMethod as keyof LinkageCallbacks];
    if (!fetchMethod) {
      console.warn(`❌ [fetchLinkageData] 联动方法 ${field.linkage.fetchMethod} 未找到`);
      return;
    }

    // 生成缓存键 - 使用更详细的键来避免冲突
    const cacheKey = `${field.name}_${field.linkage.fetchMethod}_${JSON.stringify(dependentValue)}`;
    console.log('🔑 [fetchLinkageData] 缓存键:', cacheKey);

    // 检查缓存
    const cachedData = linkageCacheRef.current.get(cacheKey);
    if (cachedData) {
      console.log('📦 [fetchLinkageData] 使用缓存数据:', cachedData.length, '项');
      setLinkageData(cachedData);
      return;
    }

    try {
      setLinkageLoading(true);
      setLinkageError(null);
      console.log('🌐 [fetchLinkageData] 调用联动方法:', field.linkage.fetchMethod);
      
      const data = await fetchMethod(dependentValue);
      const resultData = data || [];

      console.log('✅ [fetchLinkageData] 获取数据成功:', resultData.length, '项');

      // 缓存结果
      linkageCacheRef.current.set(cacheKey, resultData);
      setLinkageData(resultData);
    } catch (error) {
      console.error('❌ [fetchLinkageData] 联动数据获取失败:', error);
      setLinkageError(error instanceof Error ? error.message : '数据获取失败');
      setLinkageData([]);
    } finally {
      setLinkageLoading(false);
    }
  }, [field.linkage, linkageCallbacks, field.name]);

  // 联动数据初始化和变化监听 - 合并为一个 useEffect
  useEffect(() => {
    if (!field.linkage?.dependsOn) return;

    const dependentValue = formValues[field.linkage.dependsOn];
    const prevDependentValue = prevDependentValueRef.current;

    console.log('🔍 [useLinkageData] useEffect 触发:', {
      fieldName: field.name,
      dependsOn: field.linkage.dependsOn,
      dependentValue,
      prevDependentValue,
      isInitialized: isInitializedRef.current,
      trigger: field.linkage.trigger
    });

    // 检查是否需要响应变化
    const hasTrigger = field.linkage.trigger === 'onChange' || field.linkage.trigger === 'onBlur';
    // 对于 model 字段依赖 connectid 的情况，强制启用 onChange 响应
    const isModelConnectidLinkage = field.name === 'model' && field.linkage.dependsOn === 'connectid';
    const shouldRespondToChange = hasTrigger || (field.linkage.dependsOn === 'datasource') || isModelConnectidLinkage;

    console.log('🎯 [useLinkageData] 响应条件检查:', {
      hasTrigger,
      shouldRespondToChange,
      trigger: field.linkage.trigger,
      isModelConnectidLinkage,
      fieldLinkage: field.linkage
    });

    // 初始化或值发生变化时
    const valueChanged = prevDependentValue !== dependentValue;
    const shouldProcess = !isInitializedRef.current || (isInitializedRef.current && valueChanged);
    const shouldExecute = !isInitializedRef.current || shouldRespondToChange;

    console.log('🚦 [useLinkageData] 执行条件:', {
      valueChanged,
      shouldProcess,
      shouldExecute,
      willExecute: shouldProcess && shouldExecute
    });

    if (shouldProcess && shouldExecute) {
      if (field.linkage.clearOnChange && formValues[field.name] && valueChanged) {
        console.log('🧹 [useLinkageData] 需要清空当前字段值 (暂未实现)');
        // 这里需要外部提供 onChange 函数来清空当前字段值
        // 暂时跳过，因为没有 onChange 回调
      }

      if (dependentValue) {
        console.log('📞 [useLinkageData] 调用 fetchLinkageData');
        fetchLinkageData(dependentValue);
        if (!isInitializedRef.current) {
          isInitializedRef.current = true;
          console.log('✅ [useLinkageData] 标记为已初始化');
        }
      } else {
        console.log('🗑️ [useLinkageData] 依赖值为空，清空数据');
        setLinkageData([]);
      }

      prevDependentValueRef.current = dependentValue;
      console.log('💾 [useLinkageData] 更新 prevDependentValue:', dependentValue);
    } else {
      console.log('⏭️ [useLinkageData] 跳过执行');
    }
  }, [field.linkage?.dependsOn ? formValues[field.linkage.dependsOn] : undefined, fetchLinkageData, field.linkage, formValues, field.name]);

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
    if (!field.displayOptions?.addBy) return false;
    return addedFields.has(field.name);
  }, [field.displayOptions?.addBy, addedFields, field.name]);

  // 处理 addBy 字段的添加逻辑
  useEffect(() => {
    if (!field.displayOptions?.addBy) return;

    const { addBy } = field.displayOptions;
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
      if (field.type === 'collection' && field.options && Array.isArray(field.options)) {
        // 对于 collection，批量添加所有子字段
        const subFieldNames = (field.options as any[]).map(subField => `${field.name}.${subField.name}`);
        const globalFields = addFieldsToGlobal([field.name, ...subFieldNames]);
        setAddedFields(new Set(globalFields));
      } else {
        // 对于普通字段，单独添加
        const globalFields = addFieldToGlobal(field.name);
        setAddedFields(new Set(globalFields));
      }
    }
  }, [field.displayOptions?.addBy, formValues, field.name, field.type, field.options]);

  // 处理删除字段
  const handleDeleteField = useCallback((onChange: (name: string, value: any) => void, formOnChange?: (name: string, value: any) => void) => {
    console.log('🗑️ [DeleteField] 开始删除字段:', {
      fieldName: field.name,
      fieldType: field.type,
      isCollection: field.type === 'collection',
      hasOptions: !!field.options,
      optionsLength: field.options?.length || 0,
      currentAddedFields: Array.from(addedFields)
    });

    // 检查是否是 collection 类型
    if (field.type === 'collection' && field.options && Array.isArray(field.options)) {
      // 对于 collection，批量删除所有子字段
      const subFieldNames = (field.options as any[]).map(subField => `${field.name}.${subField.name}`);
      console.log('📦 [DeleteField] Collection 删除子字段:', {
        mainField: field.name,
        subFieldNames,
        allFieldsToDelete: [field.name, ...subFieldNames]
      });
      
      const { addedFields: newAddedFields } = removeFieldsFromGlobal([field.name, ...subFieldNames]);
      setAddedFields(new Set(newAddedFields));
      
      console.log('✅ [DeleteField] Collection 删除完成:', {
        newAddedFieldsSize: newAddedFields.size,
        newAddedFieldsList: Array.from(newAddedFields)
      });
    } else {
      // 对于普通字段，单独删除
      console.log('📄 [DeleteField] 普通字段删除:', field.name);
      const { addedFields: newAddedFields } = removeFieldFromGlobal(field.name);
      setAddedFields(new Set(newAddedFields));
      
      console.log('✅ [DeleteField] 普通字段删除完成:', {
        newAddedFieldsSize: newAddedFields.size,
        newAddedFieldsList: Array.from(newAddedFields)
      });
    }

    // 清空字段值
    onChange(field.name, field.default || '');
    console.log('🔄 [DeleteField] 已清空字段值:', {
      fieldName: field.name,
      defaultValue: field.default || ''
    });

    // 特殊处理：如果删除的是通过 addBy 添加的字段，需要重置对应的 selectadd 控件
    if (field.displayOptions?.addBy) {
      console.log('🔄 [DeleteField] 检查是否需要重置 selectadd 控件:', {
        fieldName: field.name,
        addBy: field.displayOptions.addBy
      });
      
      // 获取当前全局状态
      const currentGlobalFields = getGlobalAddedFields();
      console.log('🔍 [DeleteField] 当前全局字段状态:', Array.from(currentGlobalFields));
      
      // 找到需要重置的 selectadd 控件
      Object.keys(field.displayOptions.addBy).forEach(dependentFieldName => {
        console.log('🎯 [DeleteField] 需要重置的 selectadd 控件:', {
          dependentFieldName,
          currentValue: formValues[dependentFieldName]
        });
        
        // 通过触发一个自定义事件来通知特定的 selectadd 控件重置
        const resetEvent = new CustomEvent('selectadd-reset', {
          detail: { 
            targetField: dependentFieldName,
            deletedField: field.name 
          }
        });
        window.dispatchEvent(resetEvent);
        console.log('📡 [DeleteField] 已发送 selectadd 重置事件:', {
          targetField: dependentFieldName,
          deletedField: field.name
        });
      });
    }
  }, [field.name, field.default, field.type, field.options, addedFields]);

  return {
    isAddedByField,
    handleDeleteField
  };
};

// 字段显示逻辑 Hook
export const useFieldVisibility = (field: UnifiedParameterField, formValues: Record<string, any>, addedFields: Set<string>) => {
  const shouldShow = useMemo(() => {
    if (!field.displayOptions) return true;

    const { showBy, hide, addBy } = field.displayOptions;

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
        if (addedFields.has(field.name)) {
          shouldShowByAddBy = true;
          break;
        }
      }

      if (!shouldShowByAddBy) {
        return false;
      }
    }

    return true;
  }, [field.displayOptions, formValues, addedFields, field.name]);

  // 检查字段是否应该启用（基于联动配置）
  const shouldEnable = useMemo(() => {
    if (!field.linkage?.enableWhen || !field.linkage?.dependsOn) return true;

    const dependentValue = formValues[field.linkage.dependsOn];
    return field.linkage.enableWhen(dependentValue);
  }, [field.linkage, formValues]);

  return {
    shouldShow,
    shouldEnable
  };
};