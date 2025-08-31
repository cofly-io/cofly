// 参数输入组件的统一导出

export { UnifiedParameterInput } from './UnifiedParameterInput';
export type { 
  UnifiedParameterInputProps, 
  UnifiedParameterField, 
  LinkageCallbacks,
  ParameterInputVariant
} from './types';
export { 
  getGlobalAddedFields, 
  getGlobalDeletedFields, 
  addFieldToGlobal, 
  removeFieldFromGlobal,
  addFieldsToGlobal,
  removeFieldsFromGlobal,
  clearGlobalState 
} from './state-management';
export {
  useLinkageData,
  useGlobalFieldState,
  useAddByField,
  useFieldVisibility
} from './hooks';