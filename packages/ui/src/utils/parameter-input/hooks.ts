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
      fetchLinkageData(validSourceValue);
    } else {
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
    // 检查是否是 collection 类型
    if (field.control.dataType === 'options' && field.control.options && Array.isArray(field.control.options)) {
      // 对于 collection，批量删除所有子字段
      const subFieldNames = (field.control.options as any[]).map(subField => `${field.fieldName}.${subField.fieldName}`);
      const { addedFields: newAddedFields } = removeFieldsFromGlobal([field.fieldName, ...subFieldNames]);
      setAddedFields(new Set(newAddedFields));
    } else {
      // 对于普通字段，单独删除
      const { addedFields: newAddedFields } = removeFieldFromGlobal(field.fieldName);
      setAddedFields(new Set(newAddedFields));
    }

    // 清空字段值
    onChange(field.fieldName, field.control.defaultValue || '');
    // 特殊处理：如果删除的是通过 addBy 添加的字段，需要重置对应的 selectadd 控件
    if (field.conditionRules?.addBy) {
      // 找到需要重置的 selectadd 控件
      Object.keys(field.conditionRules.addBy).forEach(dependentFieldName => {
        // 通过触发一个自定义事件来通知特定的 selectadd 控件重置
        const resetEvent = new CustomEvent('selectadd-reset', {
          detail: {
            targetField: dependentFieldName,
            deletedField: field.fieldName
          }
        });
        window.dispatchEvent(resetEvent);
      });
    }
  }, [field.fieldName, field.control.defaultValue, field.control.dataType, field.control.options, addedFields]);

  return {
    isAddedByField,
    handleDeleteField
  };
};

// 字段显示逻辑 Hook
export const useFieldVisibility = (field: UnifiedParameterField, formValues: Record<string, any>, addedFields: Set<string>, allFields: UnifiedParameterField[] = []) => {
  
  // 创建一个递归函数来检查字段的完整依赖链
  const checkFieldVisibility = useCallback((targetField: UnifiedParameterField, checkedFields: Set<string> = new Set()): boolean => {
    // 防止循环依赖
    if (checkedFields.has(targetField.fieldName)) {
      console.warn('🔄 [useFieldVisibility] 检测到循环依赖:', targetField.fieldName);
      return false;
    }
    
    checkedFields.add(targetField.fieldName);
    
    if (!targetField.conditionRules) return true;

    const { showBy, hide, addBy } = targetField.conditionRules;

    // 检查隐藏条件
    if (hide) {
      for (const [key, values] of Object.entries(hide)) {
        const formValue = formValues[key];

        // 支持多种数据类型的比较
        const isValueMatched = (values as any[]).some(expectedValue => {
          return formValue === expectedValue;
        });

        if (isValueMatched) {
          // console.log('🚫 [useFieldVisibility] hide条件匹配，隐藏字段:', {
          //   fieldName: targetField.fieldName,
          //   hideCondition: { [key]: values },
          //   actualValue: formValue
          // });
          return false;
        }
      }
    }

    // 检查显示条件 - 这里是关键改进 
    if (showBy) {
      for (const [key, values] of Object.entries(showBy)) {
        const formValue = formValues[key];
        
        // 🔥 关键改进：首先检查依赖字段本身是否可见
        const dependentField = allFields.find(f => f.fieldName === key);
        if (dependentField) {
          const isDependentFieldVisible = checkFieldVisibility(dependentField, checkedFields);
          if (!isDependentFieldVisible) {
            // console.log('❌ [useFieldVisibility] 依赖字段不可见，隐藏当前字段:', {
            //   fieldName: targetField.fieldName,
            //   dependentField: key,
            //   dependentFieldVisible: isDependentFieldVisible
            // });
            return false;
          }
        }

        // 支持多种数据类型的比较
        const isValueMatched = (values as any[]).some(expectedValue => {
          // 严格相等比较，支持 boolean, string, number 等类型
          return formValue === expectedValue;
        });

        // console.log('🔍 [useFieldVisibility] showBy检查:', {
        //   fieldName: targetField.fieldName,
        //   dependentField: key,
        //   dependentValue: formValue,
        //   dependentValueType: typeof formValue,
        //   expectedValues: values,
        //   expectedValueTypes: (values as any[]).map(v => typeof v),
        //   shouldShow: isValueMatched,
        //   strictComparison: (values as any[]).map(v => ({ expected: v, actual: formValue, match: formValue === v }))
        // });

        if (!isValueMatched) {
          // console.log('❌ [useFieldVisibility] showBy条件不匹配，隐藏字段:', {
          //   fieldName: targetField.fieldName,
          //   dependentField: key,
          //   expectedValues: values,
          //   actualValue: formValue
          // });
          return false;
        }
      }
      
      // console.log('✅ [useFieldVisibility] showBy条件全部匹配，显示字段:', {
      //   fieldName: targetField.fieldName,
      //   showByConditions: showBy,
      //   currentFormValues: Object.fromEntries(
      //     Object.keys(showBy).map(key => [key, formValues[key]])
      //   )
      // });
    }

    // 检查 addBy 条件 - 累积显示逻辑
    if (addBy) {
      let shouldShowByAddBy = false;

      for (const [key, values] of Object.entries(addBy)) {
        const formValue = formValues[key];

        // 支持多种数据类型的比较
        const isValueMatched = (values as any[]).some(expectedValue => {
          return formValue === expectedValue;
        });

        // 只有当前值匹配时才显示（不考虑历史状态）
        if (isValueMatched) {
          shouldShowByAddBy = true;
          break;
        }

        // 如果该字段已经被添加过，也显示
        if (addedFields.has(targetField.fieldName)) {
          shouldShowByAddBy = true;
          break;
        }
      }

      if (!shouldShowByAddBy) {
        // console.log('🔒 [useFieldVisibility] addBy条件不匹配，隐藏字段:', {
        //   fieldName: targetField.fieldName,
        //   addByConditions: addBy,
        //   currentFormValues: Object.fromEntries(
        //     Object.keys(addBy).map(key => [key, formValues[key]])
        //   ),
        //   isInAddedFields: addedFields.has(targetField.fieldName)
        // });
        return false;
      }
    }

    return true;
  }, [formValues, addedFields, allFields]);

  const shouldShow = useMemo(() => {
    return checkFieldVisibility(field);
  }, [field, checkFieldVisibility]);

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