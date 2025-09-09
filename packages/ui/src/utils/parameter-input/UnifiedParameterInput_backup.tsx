// "use client";

// import React, { useState, useEffect, useCallback } from 'react';
// import { FaTrashAlt } from "react-icons/fa";
// import { useTheme } from '../../context/ThemeProvider';
// import {
//   Button,
//   Card,
//   CheckBox,
//   JsCode,
//   CmdCode,
//   Input,
//   Select as SelectControl,
//   SelectFilter,
//   SelectWithDesc,
//   InputSelect,
//   SelectAdd,
//   SliderControl,
//   Switch,
//   SQLText,
//   FileUpload,
//   Note,
//   TextArea,
//   AIhelp
// } from '../../controls';
// import { SqlCode } from '../../controls/sqlcode';
// import { SelecConnect } from '../../controls/selectlistdesc';

// import { UnifiedParameterInputProps, UnifiedParameterField } from './types';
// import type { INodePropertyOptions } from '@repo/common';
// import {
//   InputContainer,
//   Label,
//   LabelWithDelete,
//   LabelText,
//   DeleteButton,
//   Required,
//   Description,
//   StyledTextInput,
//   StyledTextArea,
//   StyledSelect,
//   CheckboxContainer,
//   StyledCheckbox,
//   CollectionContainer,
//   CollectionHeader,
//   CollectionTitle,
//   CollectionFields,
//   InlineFieldContainer,
//   InlineLabel,
//   InlineInputWrapper,
//   Aialign
// } from './styles';

// import {
//   useGlobalFieldState,
//   useAddByField,
//   useFieldVisibility,
//   useLinkageData
// } from './hooks';
// import { getGlobalAddedFields, getGlobalDeletedFields } from './state-management';

// export const UnifiedParameterInput: React.FC<UnifiedParameterInputProps> = ({
//   variant,
//   field,
//   value,
//   onChange,
//   formValues = {},
//   onExpandModeChange,
//   connectConfigs = [],
//   onFetchConnectInstances,
//   onFetchConnectDetail,
//   linkageCallbacks,
//   allFields = [],
//   isInCollection = false,
//   validationErrors,
//   onAIhelpClick
// }) => {
//   const { theme } = useTheme();

//   // 监听 selectadd 重置事件
//   useEffect(() => {
//     if (field.controlType === 'selectadd') {
//       const handleReset = (event: CustomEvent) => {
//         const { targetField, deletedField } = event.detail;

//         // 只有当事件是针对当前字段时才重置
//         if (targetField === field.name) {
//           // 重置 selectadd 控件的值
//           onChange(field.name, field.displayName);
//         }
//       };

//       window.addEventListener('selectadd-reset', handleReset as EventListener);

//       return () => {
//         window.removeEventListener('selectadd-reset', handleReset as EventListener);
//       };
//     }
//   }, [field.controlType, field.name, onChange, value]);
//   // 全局状态管理
//   const { addedFields, setAddedFields } = useGlobalFieldState();

//   // AddBy 字段管理
//   const { isAddedByField, handleDeleteField } = useAddByField(field, formValues, addedFields, setAddedFields);

//   // 字段显示逻辑
//   const { shouldShow, shouldEnable } = useFieldVisibility(field, formValues, addedFields);

//   // 联动数据管理
//   const { linkageData, linkageLoading, linkageError } = useLinkageData(field, formValues, linkageCallbacks);

//   // 通用的验证错误检查函数
//   const hasValidationError = (fieldName: string) => {
//     return validationErrors?.has(fieldName) || false;
//   };

//   // 动态连接配置状态
//   const [dynamicConnectConfigs, setDynamicConnectConfigs] = useState(connectConfigs);

//   // AI助手loading状态
//   const [aiLoading, setAiLoading] = useState(false);

//   // 处理 selectconnect 类型字段的连接配置获取
//   useEffect(() => {
//     if (field.controlType === 'selectlistdesc') {
//       const fetchConfigs = async () => {
//         const connectType = field.connectType;
//         if (connectType && onFetchConnectInstances) {
//           try {
//             const configs = await onFetchConnectInstances(connectType);
//             // 确保每个配置都有 mtype 字段
//             const configsWithMtype = configs.map(config => ({
//               ...config,
//               mtype: config.mtype
//             }));
//             setDynamicConnectConfigs(configsWithMtype);
//           } catch (error) {
//             console.error('❌ [UnifiedParameterInput] 获取连接配置失败:', error);
//             // 降级到使用静态配置，按 mtype 或 ctype 过滤
//             const filteredConfigs = connectConfigs.filter(config =>
//               connectType ? (config.mtype === connectType || config.ctype === connectType) : true
//             );
//             setDynamicConnectConfigs(filteredConfigs);
//           }
//         } else {
//           // 使用静态配置，按 mtype 或 ctype 过滤
//           const filteredConfigs = connectConfigs.filter(config => {
//             if (!connectType) return true;
//             return config.mtype === connectType || config.ctype === connectType;
//           });
//           setDynamicConnectConfigs(filteredConfigs);
//         }
//       };

//       fetchConfigs();
//     }
//   }, [field.controlType, field.connectType, field.name, onFetchConnectInstances, connectConfigs]);

//   if (!shouldShow) {
//     return null;
//   }

//   // 事件处理函数
//   const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     let newValue;

//     if (field.type === 'boolean') {
//       newValue = (event.target as HTMLInputElement).checked;
//     } else if (field.type === 'number') {
//       const inputValue = event.target.value;
//       if (variant === 'node') {
//         if (inputValue === '') {
//           newValue = '';
//         } else {
//           const numValue = parseFloat(inputValue);
//           newValue = isNaN(numValue) ? inputValue : numValue;
//         }
//       } else {
//         newValue = inputValue ? Number(inputValue) : undefined;
//       }
//     } else {
//       newValue = event.target.value;
//     }

//     onChange(field.name, newValue);
//   };

//   const handleTextAreaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
//     onChange(field.name, event.target.value);
//   };

//   const handleInputChange = (value: string) => {
//     onChange(field.name, value);
//   };

//   const handleSelectChange = (value: string | number) => {
//     onChange(field.name, value);

//     // 特殊处理：如果是 selectadd 控件，需要主动添加相关字段
//     if (field.controlType === 'selectadd') {

//       // 如果是重置操作，移除相关字段
//       if (value === field.displayName) {
//         const fieldsToRemove: string[] = [];
//         allFields.forEach(f => {
//           if (f.displayOptions?.addBy) {
//             Object.entries(f.displayOptions.addBy).forEach(([dependentField, values]) => {
//               if (dependentField === field.name) {
//                 fieldsToRemove.push(f.name);
//               }
//             });
//           }
//         });

//         if (fieldsToRemove.length > 0) {
//           // 从 addedFields 中移除字段
//           const newAddedFields = new Set(addedFields);
//           fieldsToRemove.forEach(fieldName => {
//             newAddedFields.delete(fieldName);
//             // 如果是 collection，还要删除子字段
//             const fieldConfig = allFields.find(f => f.name === fieldName);
//             if (fieldConfig?.type === 'collection' && fieldConfig.options) {
//               (fieldConfig.options as any[]).forEach(subField => {
//                 newAddedFields.delete(`${fieldName}.${subField.name}`);
//               });
//             }
//           });
//           setAddedFields(newAddedFields);
//         }
//         return;
//       }

//       // 查找所有依赖当前字段的字段
//       const fieldsToAdd: string[] = [];
//       allFields.forEach(f => {
//         if (f.displayOptions?.addBy) {
//           Object.entries(f.displayOptions.addBy).forEach(([dependentField, values]) => {
//             if (dependentField === field.name && (values as string[]).includes(value as string)) {
//               fieldsToAdd.push(f.name);
//             }
//           });
//         }
//       });

//       if (fieldsToAdd.length > 0) {
//         // 先清除这些字段的删除状态，然后添加
//         const globalFields = getGlobalAddedFields();
//         const deletedFields = getGlobalDeletedFields();

//         fieldsToAdd.forEach(fieldName => {
//           // 从删除列表中移除（如果存在）
//           if (deletedFields.has(fieldName)) {
//             deletedFields.delete(fieldName);
//           }

//           // 添加到全局字段列表
//           globalFields.add(fieldName);
//           // 如果是 collection，还要添加子字段
//           const fieldConfig = allFields.find(f => f.name === fieldName);
//           if (fieldConfig?.type === 'collection' && fieldConfig.options) {
//             (fieldConfig.options as any[]).forEach(subField => {
//               const subFieldName = `${fieldName}.${subField.name}`;
//               if (deletedFields.has(subFieldName)) {
//                 deletedFields.delete(subFieldName);
//               }
//               globalFields.add(subFieldName);
//             });
//           }
//         });

//         // 更新全局状态
//         (window as any).__addedFields = globalFields;
//         (window as any).__deletedFields = deletedFields;

//         // 更新本地状态
//         setAddedFields(new Set(globalFields));
//       }
//     }
//   };

//   const handleCheckboxChange = (checked: boolean) => {
//     onChange(field.name, checked);
//   };

//   const handleFileChange = (file: File | null) => {
//     onChange(field.name, file);
//   };

//   const handleButtonClick = () => {
//     // Button actions can be handled here
//   };

//   const handleAIhelpClick = async () => {
//     if (onAIhelpClick) {
//       setAiLoading(true); // 开始loading
//       try {
//         const result = await onAIhelpClick(field.AIhelp?.rules || '', value || '', field.name);
//         if (result && result.trim()) {
//           // 将AI助手的返回结果填充到字段中
//           onChange(field.name, result);
//         }
//       } catch (error) {
//         console.error('AI助手调用失败:', error);
//       } finally {
//         setAiLoading(false); // 结束loading
//       }
//     }
//   };

//   // 渲染标签（带或不带删除按钮）
//   const renderLabel = () => {
//     // AIhelp控件渲染逻辑
//     const renderAIhelp = () => {
//       if (field.AIhelp?.enable) {
//         return (
//           <AIhelp
//             rules={field.AIhelp.rules}
//             content={value || ''}
//             onClick={handleAIhelpClick}
//             loading={aiLoading}
//           />
//         );
//       }
//       return null;
//     };

//     // 如果在 collection 内部，返回内联标签
//     if (isInCollection) {
//       return (
//         <InlineLabel $variant={variant}>
//           {field.displayName}
//           {field.required && <Required $variant={variant}>*</Required>}
//           <Aialign>{renderAIhelp()}</Aialign>
//         </InlineLabel>
//       );
//     }

//     if (isAddedByField) {
//       return (
//         <LabelWithDelete $variant={variant}>
//           <LabelText $variant={variant}>
//             {field.displayName}
//             {field.required && <Required $variant={variant}>*</Required>}
//             {renderAIhelp()}
//           </LabelText>
//           <DeleteButton onClick={() => handleDeleteField(onChange)} title="删除此字段">
//             <FaTrashAlt size={11} color={theme.colors.textTertiary} />
//           </DeleteButton>
//         </LabelWithDelete>
//       );
//     } else {
//       return (
//         <Label $variant={variant}>
//           {field.displayName}
//           {field.required && <Required $variant={variant}>*</Required>}
//           <Aialign>{renderAIhelp()}</Aialign>
//         </Label>
//       );
//     }
//   };

//   // 类型守卫函数
//   const isSelectOption = (option: any): option is INodePropertyOptions => {
//     return option && typeof option === 'object' && 'value' in option && !('displayName' in option);
//   };

//   const isUnifiedParameterField = (option: any): option is UnifiedParameterField => {
//     return option && typeof option === 'object' && 'name' in option && 'displayName' in option && 'type' in option;
//   };

//   const renderInput = () => {
//     const controlType = field.controlType || field.type;

//     switch (controlType) {
//       case 'button':
//         if (variant !== 'node') return null;
//         return (
//           <Button onClick={handleButtonClick}>
//             {field.displayName}
//           </Button>
//         );

//       case 'card':
//         if (variant !== 'node') return null;
//         return (
//           <Card
//             title={field.displayName}
//             href="#"
//           >
//             {field.description}
//           </Card>
//         );

//       case 'checkbox':
//         return (
//           <CheckBox
//             checked={value || false}
//             onChange={handleCheckboxChange}
//             label={field.displayName}
//             disabled={false}
//           />
//         );

//       case 'jscode':
//         if (variant !== 'node') return null;
//         const jsCodeHeight = field.typeOptions?.height ? `${field.typeOptions.height}px` : "180px";
//         const hasJsCodeError = hasValidationError(field.name);

//         // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//         if (isInCollection) {
//           return React.createElement(JsCode, {
//             value: value || '',
//             onChange: (val: string) => onChange(field.name, val),
//             height: jsCodeHeight,
//             placeholder: field.placeholder,
//             onExpandModeChange: onExpandModeChange,
//             hasError: hasJsCodeError
//           });
//         }
//         return (
//           <>
//             {renderLabel()}
//             {React.createElement(JsCode, {
//               value: value || '',
//               onChange: (val: string) => onChange(field.name, val),
//               height: jsCodeHeight,
//               placeholder: field.placeholder,
//               onExpandModeChange: onExpandModeChange,
//               hasError: hasJsCodeError
//             })}
//           </>
//         );

//       case 'cmdcode':
//         if (variant !== 'node') return null;
//         const cmdCodeHeight = field.typeOptions?.height ? `${field.typeOptions.height}px` : "180px";
//         const hasCmdCodeError = hasValidationError(field.name);
//         // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//         if (isInCollection) {
//           return (
//             <CmdCode
//               value={value || ''}
//               onChange={(val) => onChange(field.name, val)}
//               height={cmdCodeHeight}
//               placeholder={field.placeholder}
//               onExpandModeChange={onExpandModeChange}
//               hasError={hasCmdCodeError}
//             />
//           );
//         }
//         return (
//           <>
//             {renderLabel()}
//             <CmdCode
//               value={value || ''}
//               onChange={(val) => onChange(field.name, val)}
//               height={cmdCodeHeight}
//               placeholder={field.placeholder}
//               onExpandModeChange={onExpandModeChange}
//               hasError={hasCmdCodeError}
//             />
//           </>
//         );

//       case 'sqlcode':
//         if (variant !== 'node') return null;
//         const sqlCodeHeight = field.typeOptions?.height ? `${field.typeOptions.height}px` : "180px";
//         const hasSqlCodeError = hasValidationError(field.name);
//         // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//         if (isInCollection) {
//           return (
//             <SqlCode
//               value={value || ''}
//               onChange={(val) => onChange(field.name, val)}
//               height={sqlCodeHeight}
//               placeholder={field.placeholder}
//               onExpandModeChange={onExpandModeChange}
//               hasError={hasSqlCodeError}
//             />
//           );
//         }
//         return (
//           <>
//             {renderLabel()}
//             <SqlCode
//               value={value || ''}
//               onChange={(val) => onChange(field.name, val)}
//               height={sqlCodeHeight}
//               placeholder={field.placeholder}
//               onExpandModeChange={onExpandModeChange}
//               hasError={hasSqlCodeError}
//             />
//           </>
//         );

//       case 'input':
//       case 'string':
//         if (variant === 'node') {
//           // 为 type 是 number 且 controlType 是 input 的字段创建数字输入处理函数
//           const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//             if (field.type === 'number') {
//               const inputValue = e.target.value;
//               // 允许空值、负号、小数点和数字
//               if (inputValue === '' || inputValue === '-' || /^-?\d*\.?\d*$/.test(inputValue)) {
//                 // 如果是有效的数字格式，转换为数字类型
//                 if (inputValue === '' || inputValue === '-') {
//                   onChange(field.name, inputValue);
//                 } else {
//                   const numValue = parseFloat(inputValue);
//                   onChange(field.name, isNaN(numValue) ? inputValue : numValue);
//                 }
//               }
//               // 如果不是有效格式，不更新值（阻止输入）
//             } else {
//               onChange(field.name, e.target.value);
//             }
//           };

//           // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//           if (isInCollection) {
//             return (
//               <Input
//                 type={field.type === 'number' ? "number" : "text"}
//                 value={value || ''}
//                 onChange={handleNumberInputChange}
//                 placeholder={field.description || field.placeholder}
//                 error={hasValidationError(field.name) ? '此字段为必填项' : undefined}
//               />
//             );
//           }
//           return (
//             <>
//               {renderLabel()}
//               <Input
//                 type={field.type === 'number' ? "number" : "text"}
//                 value={value || ''}
//                 onChange={handleNumberInputChange}
//                 placeholder={field.description || field.placeholder}
//                 error={hasValidationError(field.name) ? '此字段为必填项' : undefined}
//               />
//             </>
//           );
//         }
//         else {
//           return (
//             <>
//               {renderLabel()}
//               <StyledTextInput
//                 $variant={variant}
//                 type={field.typeOptions?.password ? "password" : (field.type === 'number' ? "number" : "text")}
//                 value={value || ''}
//                 onChange={handleChange}
//                 placeholder={field.placeholder || field.description}
//                 min={field.typeOptions?.minValue}
//                 max={field.typeOptions?.maxValue}
//               />
//             </>
//           );
//         }

//       case 'number':
//         if (variant === 'node') {
//           // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//           if (isInCollection) {
//             return (
//               <Input
//                 type="number"
//                 value={value || ''}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//                   const target = e.target as HTMLInputElement;
//                   const inputValue = target.value;
//                   if (inputValue === '') {
//                     onChange(field.name, '');
//                   } else {
//                     const numValue = parseFloat(inputValue);
//                     onChange(field.name, isNaN(numValue) ? inputValue : numValue);
//                   }
//                 }}
//                 placeholder={field.description || field.placeholder}
//                 error={hasValidationError(field.name) ? '此字段为必填项' : undefined}
//               />
//             );
//           }
//           return (
//             <>
//               {renderLabel()}
//               <Input
//                 type="number"
//                 value={value || ''}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//                   const target = e.target as HTMLInputElement;
//                   const inputValue = target.value;
//                   if (inputValue === '') {
//                     onChange(field.name, '');
//                   } else {
//                     const numValue = parseFloat(inputValue);
//                     onChange(field.name, isNaN(numValue) ? inputValue : numValue);
//                   }
//                 }}
//                 placeholder={field.description || field.placeholder}
//                 error={hasValidationError(field.name) ? '此字段为必填项' : undefined}
//               />
//             </>
//           );
//         } else {
//           return (
//             <>
//               {renderLabel()}
//               <StyledTextInput
//                 $variant={variant}
//                 type="number"
//                 value={value !== undefined ? value : ''}
//                 onChange={handleChange}
//                 placeholder={field.placeholder || field.description}
//                 min={field.typeOptions?.minValue}
//                 max={field.typeOptions?.maxValue}
//                 step={field.typeOptions?.numberPrecision ? Math.pow(10, -field.typeOptions.numberPrecision) : undefined}
//               />
//             </>
//           );
//         }

//       case 'boolean':
//         return (
//           <CheckboxContainer>
//             <StyledCheckbox
//               $variant={variant}
//               type="checkbox"
//               checked={value || false}
//               onChange={handleChange}
//             />
//             <span>{field.displayName}</span>
//           </CheckboxContainer>
//         );

//       case 'select':
//         if (variant === 'node') {
//           // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//           if (isInCollection) {
//             return (
//               <SelectControl
//                 options={field.options?.filter(isSelectOption).map((opt: any) => ({
//                   value: opt.value,
//                   label: opt.name || String(opt.value)
//                 })) || []}
//                 value={value}
//                 onChange={handleSelectChange}
//                 placeholder={field.description || field.placeholder}
//                 error={hasValidationError(field.name) ? '此字段为必填项' : undefined}
//               />
//             );
//           }
//           return (
//             <>
//               {renderLabel()}
//               <SelectControl
//                 options={field.options?.filter(isSelectOption).map((opt: any) => ({
//                   value: opt.value,
//                   label: opt.name || String(opt.value)
//                 })) || []}
//                 value={value}
//                 onChange={handleSelectChange}
//                 placeholder={field.description || field.placeholder}
//                 error={hasValidationError(field.name) ? '此字段为必填项' : undefined}
//               />
//             </>
//           );
//         } else {
//           return (
//             <StyledSelect $variant={variant} value={value || ''} onChange={handleChange}>
//               <option value="">选择一个选项</option>
//               {field.options?.map((option: any) => {

//                 // 类型检查：确保option是INodePropertyOptions类型（有value属性）
//                 if (isSelectOption(option)) {
//                   return (
//                     <option key={option.value} value={option.value}>
//                       {option.name || option.value}
//                     </option>
//                   );
//                 }
//                 return null;
//               })}
//             </StyledSelect>
//           );
//         }

//       case 'selectfilter':
//         if (variant !== 'node') return null;

//         const hasLinkageData = field.linkage?.dependsOn && linkageData.length > 0;
//         const selectFilterOptions = hasLinkageData
//           ? linkageData.map(item => ({ label: item.label, value: item.value }))
//           : field.options?.filter(isSelectOption).map((opt: any) => ({
//             value: opt.value,
//             label: opt.name || String(opt.value)
//           })) || [];

//         // 动态获取数据源字段值：优先使用联动配置，否则查找 ConnectType 为 "llm" 的字段
//         const getDatasourceId = () => {
//           if (hasLinkageData) return undefined;

//           // 如果有联动依赖配置，使用依赖字段的值
//           if (field.linkage?.dependsOn) {
//             return formValues?.[field.linkage.dependsOn];
//           }

//           // 否则查找所有字段中 ConnectType 为 "llm" 的字段值
//           const connectField = allFields.find(f => f.connectType === 'llm');
//           if (connectField) {
//             return formValues?.[connectField.name];
//           }

//           // 兼容旧的 datasource 字段名
//           return formValues?.datasource;
//         };

//         const datasourceId = getDatasourceId();
//         const enableDynamicLoad = !hasLinkageData && !!datasourceId;

//         // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//         if (isInCollection) {
//           return (
//             <SelectFilter
//               options={selectFilterOptions}
//               value={value}
//               onChange={handleSelectChange}
//               placeholder={field.description || field.placeholder}
//               datasourceId={field.name === 'table' ? datasourceId : undefined}
//               enableDynamicLoad={field.name === 'table' && enableDynamicLoad}
//               filterPlaceholder={field.name === 'table' ? '输入表名过滤...' : '输入过滤条件...'}
//               onFetchConnectDetail={!hasLinkageData ? (datasourceId: string) => {
//                 // 从表单值中获取连接信息
//                 const dependsOnField = field.linkage?.dependsOn || 'datasource';
//                 const connectValue = formValues?.[dependsOnField];
//                 if (onFetchConnectDetail) {
//                   try {
//                     // 尝试解析连接信息
//                     const connectInfo = JSON.parse(connectValue as string);
//                     const mtype = connectInfo.mtype || connectInfo.ctype;
//                     return (onFetchConnectDetail as any)(connectInfo.id, undefined, mtype);
//                   } catch (error) {
//                     console.warn('⚠️ [UnifiedParameterInput] 解析连接信息失败，使用原始值 (collection):', error);
//                     // 如果解析失败，按旧格式处理（向后兼容）
//                     return onFetchConnectDetail(datasourceId);
//                   }
//                 }
//                 return Promise.resolve({ loading: false, error: '未提供回调函数', tableOptions: [] });
//               } : undefined}
//               disabled={!shouldEnable || linkageLoading}
//               loading={linkageLoading}
//               error={linkageError}
//               hasError={hasValidationError(field.name)}
//             />
//           );
//         }

//         return (
//           <>
//             {renderLabel()}
//             <SelectFilter
//               options={selectFilterOptions}
//               value={value}
//               onChange={handleSelectChange}
//               placeholder={field.description || field.placeholder}
//               datasourceId={field.name === 'table' ? datasourceId : undefined}
//               enableDynamicLoad={field.name === 'table' && enableDynamicLoad}
//               filterPlaceholder={field.name === 'table' ? '输入表名过滤...' : '输入过滤条件...'}
//               onFetchConnectDetail={!hasLinkageData ? (datasourceId: string) => {
//                 // 从表单值中获取连接信息
//                 const dependsOnField = field.linkage?.dependsOn || 'datasource';
//                 const connectValue = formValues?.[dependsOnField];

//                 if (onFetchConnectDetail) {
//                   try {
//                     // 尝试解析连接信息
//                     const connectInfo = JSON.parse(connectValue as string);
//                     const mtype = connectInfo.mtype || connectInfo.ctype;
//                     return (onFetchConnectDetail as any)(connectInfo.id, undefined, mtype);
//                   } catch (error) {
//                     console.warn('⚠️ [UnifiedParameterInput] 解析连接信息失败，使用原始值:', error);
//                     // 如果解析失败，按旧格式处理（向后兼容）
//                     return onFetchConnectDetail(datasourceId);
//                   }
//                 }
//                 return Promise.resolve({ loading: false, error: '未提供回调函数', tableOptions: [] });
//               } : undefined}
//               disabled={!shouldEnable || linkageLoading}
//               loading={linkageLoading}
//               error={linkageError}
//               hasError={hasValidationError(field.name)}
//             />
//           </>
//         );

//       case 'options':
//         return (
//           <StyledSelect $variant={variant} value={value || ''} onChange={handleChange}>
//             <option value="">{variant === 'node' ? 'Select an option' : '选择一个选项'}</option>
//             {field.options?.filter(isSelectOption).map((option: any) => {

//               const selectOption = option as INodePropertyOptions;
//               const normalizedValue = selectOption.value;
//               return (
//                 <option key={String(normalizedValue)} value={String(normalizedValue)}>
//                   {selectOption.name || String(selectOption.value)}
//                 </option>
//               );
//             })}
//           </StyledSelect>
//         );

//       case 'selectwithdesc':
//         if (variant !== 'node') return null;
//         // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//         if (isInCollection) {
//           return (
//             <SelectWithDesc
//               datasource={field.options?.filter(isSelectOption).map((opt: any) => ({
//                 value: opt.value,
//                 text: opt.name || opt.value,
//                 description: opt.description
//               })) || []}
//               value={value}
//               onChange={(value: string | number) => onChange(field.name, value)}
//               placeholder={field.description || field.placeholder}
//             />
//           );
//         }
//         return (
//           <>
//             {renderLabel()}
//             <SelectWithDesc
//               datasource={field.options?.filter(isSelectOption).map((opt: any) => ({
//                 value: opt.value,
//                 text: opt.name || opt.value,
//                 description: opt.description
//               })) || []}
//               value={value}
//               onChange={(value: string | number) => onChange(field.name, value)}
//               placeholder={field.description || field.placeholder}
//             />
//           </>
//         );

//       case 'inputselect':
//         const hasInputSelectLinkageData = field.linkage?.dependsOn && linkageData.length > 0;
//         const inputSelectOptions = hasInputSelectLinkageData
//           ? linkageData.map(item => item.label || item.value || item)
//           : field.options?.filter(isSelectOption).map((option: any) =>
//             typeof option === 'string' ? option : (option.name || option.value)
//           ) || [];

//         if (variant === 'node') {
//           // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//           if (isInCollection) {
//             return (
//               <>
//                 <InputSelect
//                   options={inputSelectOptions}
//                   value={value || ''}
//                   onChange={handleInputChange}
//                   placeholder={field.description || field.placeholder}
//                   disabled={!shouldEnable || linkageLoading}
//                   hasError={hasValidationError(field.name)}
//                 />
//                 {linkageLoading && (
//                   <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '4px' }}>
//                     正在加载选项...
//                   </div>
//                 )}
//                 {linkageError && (
//                   <div style={{ fontSize: '12px', color: theme.colors.error, marginTop: '4px' }}>
//                     {linkageError}
//                   </div>
//                 )}
//               </>
//             );
//           }
//           return (
//             <>
//               {renderLabel()}
//               <InputSelect
//                 options={inputSelectOptions}
//                 value={value || ''}
//                 onChange={handleInputChange}
//                 placeholder={field.description || field.placeholder}
//                 disabled={!shouldEnable || linkageLoading}
//                 hasError={hasValidationError(field.name)}
//               />
//               {linkageLoading && (
//                 <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '4px' }}>
//                   正在加载选项...
//                 </div>
//               )}
//               {linkageError && (
//                 <div style={{ fontSize: '12px', color: theme.colors.error, marginTop: '4px' }}>
//                   {linkageError}
//                 </div>
//               )}
//             </>
//           );
//         } else {
//           return (
//             <InputSelect
//               value={value || ''}
//               onChange={handleInputChange}
//               options={inputSelectOptions}
//               placeholder={field.placeholder || field.description}
//               disabled={!shouldEnable || linkageLoading}
//             />
//           );
//         }

//       case 'sqltext':
//         if (variant !== 'node') return null;
//         // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//         if (isInCollection) {
//           return (
//             <SQLText
//               value={value || ''}
//               onChange={(val) => onChange(field.name, val)}
//             />
//           );
//         }
//         return (
//           <>
//             {renderLabel()}
//             <SQLText
//               value={value || ''}
//               onChange={(val) => onChange(field.name, val)}
//             />
//           </>
//         );

//       case 'file':
//         if (variant !== 'node') return null;
//         // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//         if (isInCollection) {
//           return (
//             <FileUpload
//               onChange={handleFileChange}
//               placeholder={field.description || field.placeholder}
//             />
//           );
//         }
//         return (
//           <>
//             {renderLabel()}
//             <FileUpload
//               onChange={handleFileChange}
//               placeholder={field.description || field.placeholder}
//             />
//           </>
//         );

//       case 'note':
//         if (variant !== 'node') return null;

//         if (variant === 'node') {
//           // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//           if (!isInCollection) {
//             return (
//               <Note
//                 value={field.default ? String(field.default) : ''}
//               />
//             );
//           }
//           return (
//             <>
//               {renderLabel()}
//               <Note
//                 value={field.default ? String(field.default) : ''}
//               />
//             </>
//           );
//         }
//         return null;

//       case 'selectconnect':
//         const connectDatasource = dynamicConnectConfigs.map(config => {
//           const connectInfo = {
//             id: config.id,
//             ctype: config.ctype,
//             mtype: config.mtype
//           };
//           return {
//             value: JSON.stringify(connectInfo),
//             text: config.name,
//             description: config.description || `${config.mtype || config.ctype} 连接`
//           };
//         });

//         // 处理 selectconnect 的 onChange 事件，value 包含完整的连接信息
//         const handleSelectConnectChange = (selectedValue: string | number) => {
//           try {
//             // 解析 JSON 格式的 value
//             const connectInfo = JSON.parse(selectedValue as string);

//             // 保存完整的连接信息到字段值
//             onChange(field.name, selectedValue);

//             // 约束：只有当 selectconnect 字段配置了 linkage 时，才触发联动逻辑
//             // if (field.linkage && field.linkage.targets && field.linkage.targets.length > 0) {
//             //   console.log('🔗 [selectconnect] 触发联动逻辑:', {
//             //     fieldName: field.name,
//             //     targets: field.linkage.targets,
//             //     selectedValue
//             //   });
//             //   // 联动逻辑会由 useLinkageData hook 自动处理
//             // } else {
//             //   console.log('⚠️ [selectconnect] 跳过联动逻辑 - 未配置 linkage:', {
//             //     fieldName: field.name,
//             //     hasLinkage: !!field.linkage,
//             //     hasTargets: !!(field.linkage?.targets?.length)
//             //   });
//             // }
//           } catch (error) {
//             console.error('❌ [UnifiedParameterInput] 解析连接信息失败:', error);
//             // 如果解析失败，按旧格式处理（向后兼容）
//             onChange(field.name, selectedValue);
//           }
//         };

//         // 处理 value 的兼容性显示
//         const getDisplayValue = () => {
//           if (!value) return value;

//           try {
//             // 尝试解析为 JSON，如果成功说明是新格式
//             JSON.parse(value as string);
//             return value; // 新格式直接返回
//           } catch {
//             // 解析失败说明是旧格式（简单ID），需要转换为新格式
//             const matchedConfig = dynamicConnectConfigs.find(config => config.id === value);
//             if (matchedConfig) {
//               return JSON.stringify({
//                 id: matchedConfig.id,
//                 ctype: matchedConfig.ctype,
//                 mtype: matchedConfig.mtype
//               });
//             }
//             return value; // 如果找不到匹配的配置，返回原值
//           }
//         };

//         const displayValue = getDisplayValue();

//         // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//         if (isInCollection) {
//           return (
//             <SelecConnect
//               datasource={connectDatasource}
//               value={displayValue}
//               onChange={handleSelectConnectChange}
//               placeholder={field.description || field.placeholder || '请选择连接'}
//             />
//           );
//         }

//         return (
//           <>
//             {renderLabel()}
//             <SelecConnect
//               datasource={connectDatasource}
//               value={displayValue}
//               onChange={handleSelectConnectChange}
//               placeholder={field.description || field.placeholder || '请选择连接'}
//             />
//           </>
//         );

//       case 'slider':
//         // 智能值处理：优先使用有效的数字值，否则使用默认值，最后使用最小值
//         const getSliderValue = () => {
//           if (typeof value === 'number') {
//             return value;
//           }
//           if (typeof field.default === 'number') {
//             return field.default;
//           }
//           return field.typeOptions?.minValue || 0;
//         };

//         const sliderValue = getSliderValue();

//         if (variant === 'node') {
//           // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//           if (isInCollection) {
//             return (
//               <SliderControl
//                 value={sliderValue}
//                 min={field.typeOptions?.minValue || 0}
//                 max={field.typeOptions?.maxValue || 1}
//                 step={field.typeOptions?.numberPrecision ? Math.pow(10, -field.typeOptions.numberPrecision) : 0.01}
//                 onChange={(val) => onChange(field.name, val)}
//                 placeholder={field.description || field.placeholder}
//                 formatValue={(val) => val.toFixed(field.typeOptions?.numberPrecision || 2)}
//               />
//             );
//           }
//           return (
//             <>
//               {renderLabel()}
//               <SliderControl
//                 value={sliderValue}
//                 min={field.typeOptions?.minValue || 0}
//                 max={field.typeOptions?.maxValue || 1}
//                 step={field.typeOptions?.numberPrecision ? Math.pow(10, -field.typeOptions.numberPrecision) : 0.01}
//                 onChange={(val) => onChange(field.name, val)}
//                 placeholder={field.description || field.placeholder}
//                 formatValue={(val) => val.toFixed(field.typeOptions?.numberPrecision || 2)}
//               />
//             </>
//           );
//         } else {
//           return (
//             <SliderControl
//               value={sliderValue}
//               min={field.typeOptions?.minValue || 0}
//               max={field.typeOptions?.maxValue || 1}
//               step={field.typeOptions?.numberPrecision ? Math.pow(10, -field.typeOptions.numberPrecision) : 0.01}
//               onChange={(val) => onChange(field.name, val)}
//               placeholder={field.placeholder || field.description}
//               formatValue={(val) => val.toFixed(field.typeOptions?.numberPrecision || 2)}
//             />
//           );
//         }

//       case 'textarea':
//         if (variant === 'node') {
//           // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//           if (isInCollection) {
//             return (
//               <TextArea
//                 value={value || ''}
//                 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(field.name, e.target.value)}
//                 placeholder={field.description || field.placeholder}
//                 error={hasValidationError(field.name) ? '此字段为必填项' : undefined}
//               />
//             );
//           }
//           return (
//             <>
//               {renderLabel()}
//               <TextArea
//                 value={value || ''}
//                 onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(field.name, e.target.value)}
//                 placeholder={field.description || field.placeholder}
//                 error={hasValidationError(field.name) ? '此字段为必填项' : undefined}
//               />
//             </>
//           );
//         } else {
//           return (
//             <>
//               {renderLabel()}
//               <StyledTextArea
//                 $variant={variant}
//                 value={value || ''}
//                 onChange={handleTextAreaChange}
//                 placeholder={field.placeholder || field.description}
//               />
//             </>
//           );
//         }

//       case 'collection':
//         // Collection 类型：渲染一个包含多个子字段的容器
//         if (variant !== 'node') return null;
//         const collectionFields = field.options?.filter(isUnifiedParameterField) || [];
//         return (
//           <CollectionContainer $variant={variant}>
//             <CollectionHeader $variant={variant}>
//               <CollectionTitle $variant={variant}>
//                 {field.displayName}
//                 {field.required && <Required $variant={variant}>*</Required>}
//               </CollectionTitle>
//               {isAddedByField && (
//                 <DeleteButton onClick={() => handleDeleteField(onChange)} title="删除此字段组">
//                   <FaTrashAlt size={11} color={theme.colors.textTertiary} />
//                 </DeleteButton>
//               )}
//             </CollectionHeader>
//             <CollectionFields>
//               {collectionFields.map((subField: any, index: any) => (

//                 <UnifiedParameterInput
//                   key={`${field.name}.${subField.name}`}
//                   variant={variant}
//                   field={{
//                     ...subField,
//                     name: `${field.name}.${subField.name}` // 使用嵌套的字段名
//                   }}
//                   value={value?.[subField.name]}
//                   onChange={(name, val) => {
//                     // 处理嵌套字段的值更新
//                     const fieldName = name.split('.').pop(); // 获取子字段名
//                     const newValue = { ...value, [fieldName!]: val };
//                     onChange(field.name, newValue);
//                   }}
//                   formValues={formValues}
//                   onExpandModeChange={onExpandModeChange}
//                   connectConfigs={connectConfigs}
//                   onFetchConnectInstances={onFetchConnectInstances}
//                   onFetchConnectDetail={onFetchConnectDetail}
//                   linkageCallbacks={linkageCallbacks}
//                   allFields={allFields}
//                   isInCollection={true} // 标识这是在 collection 内部
//                 />
//               ))}
//             </CollectionFields>
//           </CollectionContainer>
//         );

//       case 'switch':
//         // Switch控件处理逻辑
//         const handleSwitchChange = (checked: boolean) => {
//           onChange(field.name, checked);
//         };

//         // 智能值处理：优先使用有效的布尔值，否则使用默认值
//         let switchValue: boolean;
//         if (typeof value === 'boolean') {
//           // 如果传入的是有效的布尔值，使用它
//           switchValue = value;
//         } else {
//           // 否则使用字段配置的默认值，确保类型转换为布尔值
//           switchValue = Boolean(field.default) || false;
//         }

//         const switchWithLabel = (
//           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//             <Switch
//               value={switchValue}
//               onChange={handleSwitchChange}
//               disabled={!shouldEnable}
//               size={field.typeOptions?.size || 'small'}
//             />
//             <span style={{ fontSize: '14px', color: switchValue ? theme.colors.success : theme.colors.textSecondary }}>
//               {field.typeOptions?.showText ?
//                 (switchValue ? field.typeOptions?.showText[0] : field.typeOptions.showText[1]) :
//                 (switchValue ? '是' : '否')
//               }
//             </span>
//           </div>
//         );

//         if (variant === 'node') {
//           // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//           if (isInCollection) {
//             return switchWithLabel;
//           }
//           return (
//             <>
//               {renderLabel()}
//               {switchWithLabel}
//             </>
//           );
//         } else {
//           return switchWithLabel;
//         }

//       case 'selectadd':
//         // 动态构建选项值到字段名的映射关系
//         const optionToFieldMap: Record<string, string[]> = {};
//         allFields.forEach(f => {
//           if (f.displayOptions?.addBy) {

//             Object.entries(f.displayOptions.addBy).forEach(([dependentField, values]) => {
//               if (dependentField === field.name) {
//                 (values as string[]).forEach((value: string) => {
//                   if (!optionToFieldMap[value]) {
//                     optionToFieldMap[value] = [];
//                   }
//                   optionToFieldMap[value].push(f.name);
//                 });
//               }
//             });
//           }
//         });


//         // 过滤掉已选择的选项
//         const filteredOptions = field.options?.filter(isSelectOption).filter((opt: any) => {
//           const optionValue = opt.value as string;
//           const correspondingFields = optionToFieldMap[optionValue] || [];

//           // 如果这个选项没有对应的字段，则显示（不过滤）
//           if (correspondingFields.length === 0) {
//             return true;
//           }
//           // 检查对应字段是否已添加
//           // const fieldsStatus = correspondingFields.map(fieldName => ({
//           //   fieldName,
//           //   isAdded: addedFields.has(fieldName)
//           // }));

//           const hasAnyFieldAdded = correspondingFields.some(fieldName => addedFields.has(fieldName));

//           // 如果这个选项对应的任何一个字段已经被添加，则隐藏这个选项
//           return !hasAnyFieldAdded;
//         }) || [];

//         // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//         if (isInCollection) {
//           return (
//             <SelectAdd
//               options={filteredOptions.map((opt: any) => ({
//                 value: opt.value,
//                 label: opt.name || opt.value,
//                 description: opt.description
//               }))}
//               onChange={handleSelectChange}
//               placeholder={field.placeholder || field.description}
//               label={field.displayName}
//               default={String(field.default || field.placeholder || field.description || '')}
//             />
//           );
//         }

//         return (
//           <>
//             {renderLabel()}
//             <SelectAdd
//               options={filteredOptions.map((opt: any) => ({
//                 value: opt.value,
//                 label: opt.name || opt.value,
//                 description: opt.description
//               }))}
//               onChange={handleSelectChange}
//               placeholder={field.placeholder || field.description}
//               label={field.displayName}
//               default={String(field.default || field.placeholder || field.description || '')}
//             />
//           </>
//         );

//       default:
//         // 默认文本输入
//         if (variant === 'node') {
//           // 在 collection 内部时，标签已经在外层渲染，这里只返回控件
//           if (isInCollection) {
//             return (
//               <Input
//                 type="text"
//                 value={value || ''}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(field.name, e.target.value)}
//                 placeholder={field.description || field.placeholder}
//               />
//             );
//           }
//           return (
//             <>
//               {renderLabel()}
//               <Input
//                 type="text"
//                 value={value || ''}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(field.name, e.target.value)}
//                 placeholder={field.description || field.placeholder}
//               />
//             </>
//           );
//         } else {
//           return (
//             <StyledTextInput
//               $variant={variant}
//               type="text"
//               value={value || ''}
//               onChange={handleChange}
//               placeholder={field.placeholder || field.description}
//             />
//           );
//         }
//     }
//   };

//   // 如果在 collection 内部，使用内联布局
//   if (isInCollection) {
//     return (
//       <InlineFieldContainer $variant={variant}>
//         {renderLabel()}
//         <InlineInputWrapper>
//           {renderInput()}
//           {field.hint && (
//             <Description $variant={variant} $isHint>
//               {field.hint}
//             </Description>
//           )}
//         </InlineInputWrapper>
//       </InlineFieldContainer>
//     );
//   }

//   return (
//     <InputContainer $variant={variant}>
//       {renderInput()}
//       {field.hint && (
//         <Description $variant={variant} $isHint>
//           {field.hint}
//         </Description>
//       )}
//     </InputContainer>
//   );
// };

// export default UnifiedParameterInput;