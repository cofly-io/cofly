"use client";

import React, { useState, useEffect } from 'react';
import { FaTrashAlt } from "react-icons/fa";
import { useTheme } from '../../context/ThemeProvider';
import {
    Button,
    Card,
    CheckBox,
    JsCode,
    JsonCode,
    CmdCode,
    Input,
    Select as SelectControl,
    SelectFilter,
    SelectWithDesc,
    SelectListDesc,
    InputSelect,
    SelectAdd,
    SliderControl,
    Switch,
    SQLText,
    Note,
    TextArea,
    AIhelp,
    SqlCode
} from '../../controls';

import { UnifiedParameterInputProps } from './types';
import {
    InputContainer,
    Label,
    LabelWithDelete,
    LabelText,
    DeleteButton,
    Required,
    Description,
    StyledTextInput,
    StyledTextArea,
    StyledSelect,
    CheckboxContainer,
    StyledCheckbox,
    CollectionContainer,
    CollectionHeader,
    CollectionTitle,
    CollectionFields,
    InlineFieldContainer,
    InlineLabel,
    InlineInputWrapper,
    Aialign
} from './styles';

import {
    useGlobalFieldState,
    useAddByField,
    useFieldVisibility,
    useLinkageData
} from './hooks';

export const UnifiedParameterInput: React.FC<UnifiedParameterInputProps> = ({
    variant,
    field,
    value,
    onChange,
    formValues = {},
    onExpandModeChange,
    onFetchConnectInstances,
    onFetchConnectDetail,
    linkageCallbacks,
    allFields = [],
    isInCollection = false,
    validationErrors,
    onAIhelpClick
}) => {
    const { theme } = useTheme();

    // 全局状态管理
    const { addedFields, setAddedFields } = useGlobalFieldState();

    // AddBy 字段管理
    const { isAddedByField, handleDeleteField } = useAddByField(field, formValues, addedFields, setAddedFields);

    // 字段显示逻辑
    const { shouldShow, shouldEnable } = useFieldVisibility(field, formValues, addedFields);

    // 联动数据管理
    const { linkageData, linkageLoading, linkageError } = useLinkageData(field, formValues, allFields, linkageCallbacks);

    // 动态连接配置状态（完全依赖动态获取）
    const [dynamicConnectConfigs, setDynamicConnectConfigs] = useState<Array<{ id: string; name: string; description?: string }>>([]);

    // AI助手loading状态
    const [aiLoading, setAiLoading] = useState(false);

    // 通用的动态配置获取方法
    const fetchDynamicConfigs = async (dataSourceType?: string) => {
        if (dataSourceType && onFetchConnectInstances) {
            try {
                const configs = await onFetchConnectInstances(dataSourceType);
                setDynamicConnectConfigs(configs);
            } catch (error) {
                console.error('❌ [UnifiedParameterInput] 获取连接配置失败:', error);
            }
        }
    };

    // 处理数据源类型的动态配置获取（仅在组件初始化时执行）
    useEffect(() => {
        const controlsWithDataSource = ['select', 'selectfilter', 'selectwithdesc', 'selectlistdesc', 'inputselect'];

        // 处理数据源类型的动态配置获取
        if (controlsWithDataSource.includes(field.control.name) && field.control.dataSourceType) {
            fetchDynamicConfigs(field.control.dataSourceType);
        }
    }, [field.control.name, field.control.dataSourceType, onFetchConnectInstances]);

    // 处理联动逻辑（仅在字段值变化时执行）
    useEffect(() => {
        const controlsWithLinkage = ['select', 'selectfilter', 'selectwithdesc', 'selectlistdesc'];

        // 处理联动逻辑：当控件有linkage配置且targets存在时，监听该字段的值变化
        if (controlsWithLinkage.includes(field.control.name) && field.control.linkage?.targets && field.control.linkage.targets.length > 0) {
            const currentValue = formValues[field.fieldName];

            // 当当前控件的值发生变化时，触发联动逻辑
            if (currentValue && onFetchConnectDetail) {
                // 为每个target字段执行数据获取
                field.control.linkage.targets.forEach(async (targetFieldName: string) => {
                    try {
                        let datasourceId = currentValue;
                    } catch (error) {
                        console.error('❌ [UnifiedParameterInput] 联动数据获取失败:', {
                            targetFieldName,
                            error
                        });
                    }
                });
            }
        }
    }, [field.fieldName, field.control.linkage, formValues[field.fieldName], onFetchConnectDetail, linkageCallbacks]);

    // 通用的验证错误检查函数
    const hasValidationError = (fieldName: string) => {
        return validationErrors?.has(fieldName) || false;
    };

    // 通用的必填验证函数
    const isFieldRequired = () => {
        return field.control?.validation?.required || false;
    };

    if (!shouldShow) {
        return null;
    }

    // AI助手点击处理
    const handleAIhelpClick = async () => {
        if (onAIhelpClick) {
            setAiLoading(true);
            try {
                const result = await onAIhelpClick(field.AIhelp?.rules || '', value || '', field.fieldName);
                if (result && result.trim()) {
                    onChange(field.fieldName, result);
                }
            } catch (error) {
                console.error('AI助手调用失败:', error);
            } finally {
                setAiLoading(false);
            }
        }
    };

    // 渲染标签（带或不带删除按钮）
    const renderLabel = () => {
        // AIhelp控件渲染逻辑
        const renderAIhelp = () => {
            if (field.AIhelp?.enable) {
                return (
                    <AIhelp
                        rules={field.AIhelp.rules}
                        content={value || ''}
                        onClick={handleAIhelpClick}
                        loading={aiLoading}
                    />
                );
            }
            return null;
        };

        // 如果在 collection 内部，返回内联标签
        if (isInCollection) {
            return (
                <InlineLabel $variant={variant}>
                    {field.label}
                    {isFieldRequired() && <Required $variant={variant}>*</Required>}
                    <Aialign>{renderAIhelp()}</Aialign>
                </InlineLabel>
            );
        }

        if (isAddedByField) {
            return (
                <LabelWithDelete $variant={variant}>
                    <LabelText $variant={variant}>
                        {field.label}
                        {isFieldRequired() && <Required $variant={variant}>*</Required>}
                        {renderAIhelp()}
                    </LabelText>
                    <DeleteButton onClick={() => handleDeleteField(onChange)} title="删除此字段">
                        <FaTrashAlt size={11} color={theme.colors.textTertiary} />
                    </DeleteButton>
                </LabelWithDelete>
            );
        } else {
            return (
                <Label $variant={variant}>
                    {field.label}
                    {isFieldRequired() && <Required $variant={variant}>*</Required>}
                    <Aialign>{renderAIhelp()}</Aialign>
                </Label>
            );
        }
    };

    // 通用的控件渲染包装器
    const renderWithOptionalLabel = (control: React.ReactNode) => {
        if (isInCollection) {
            return control;
        }
        return (
            <>
                {renderLabel()}
                {control}
            </>
        );
    };

    // 根据控件名称渲染对应的控件
    const renderControlByName = () => {
        const controlName = field.control.name;
        const controlConfig = field.control;
        const errorMessage = hasValidationError(field.fieldName) ? '此字段为必填项' : undefined;

        // 只在 node 模式下显示的控件
        switch (controlName) {
            case 'button':
                return (
                    <Button onClick={() => { }}>
                        {field.label}
                    </Button>
                );

            case 'card':
                return (
                    <Card title={field.label} href="#">
                        {field.description}
                    </Card>
                );

            case 'checkbox':
                if (variant === 'node') {
                    return (
                        <CheckBox
                            checked={value || false}
                            onChange={(checked) => onChange(field.fieldName, checked)}
                            label={field.label}
                            disabled={false}
                        />
                    );
                } else {
                    // connect 模式下使用样式化的 checkbox
                    return (
                        <CheckboxContainer>
                            <StyledCheckbox
                                $variant={variant}
                                type="checkbox"
                                checked={value || false}
                                onChange={(e) => onChange(field.fieldName, e.target.checked)}
                            />
                            <span>{field.label}</span>
                        </CheckboxContainer>
                    );
                }

            case 'jscode': {
                const height = controlConfig.attributes?.[0]?.height ? `${controlConfig.attributes[0].height}px` : "180px";
                const control = (
                    <JsCode
                        value={value || ''}
                        onChange={(val: string) => onChange(field.fieldName, val)}
                        height={height}
                        placeholder={controlConfig.placeholder}
                        onExpandModeChange={onExpandModeChange}
                        hasError={hasValidationError(field.fieldName)}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'jsoncode': {
                const height = controlConfig.attributes?.[0]?.height ? `${controlConfig.attributes[0].height}px` : "180px";
                const control = (
                    <JsonCode
                        value={value || ''}
                        onChange={(val: string) => onChange(field.fieldName, val)}
                        height={height}
                        placeholder={controlConfig.placeholder}
                        onExpandModeChange={onExpandModeChange}
                        hasError={hasValidationError(field.fieldName)}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'cmdcode': {
                const height = controlConfig.attributes?.[0]?.height ? `${controlConfig.attributes[0].height}px` : "180px";
                const control = (
                    <CmdCode
                        value={value || ''}
                        onChange={(val) => onChange(field.fieldName, val)}
                        height={height}
                        placeholder={controlConfig.placeholder}
                        onExpandModeChange={onExpandModeChange}
                        hasError={hasValidationError(field.fieldName)}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'sqlcode': {
                const height = controlConfig.attributes?.[0]?.height ? `${controlConfig.attributes[0].height}px` : "180px";
                const control = (
                    <SqlCode
                        value={value || ''}
                        onChange={(val) => onChange(field.fieldName, val)}
                        height={height}
                        placeholder={controlConfig.placeholder}
                        onExpandModeChange={onExpandModeChange}
                        hasError={hasValidationError(field.fieldName)}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'input': {
                // 获取输入框类型，优先使用 attributes 中的 type，其次是根据 dataType 判断
                const getInputType = () => {
                    // 检查 attributes 中是否定义了 type
                    const attributeType = controlConfig.attributes?.[0]?.type;
                    if (attributeType) {
                        return attributeType; // 可能是 'password', 'email', 'url' 等
                    }
                    // 回退到根据 dataType 判断
                    return controlConfig.dataType === 'number' ? "number" : "text";
                };

                const inputType = getInputType();

                // 🔧 修复：确保 value 是适当的类型，避免 [object Object] 问题
                const inputValue = controlConfig.dataType === 'number' ?
                    (typeof value === 'number' ? value : (value ? Number(value) || '' : '')) :
                    (typeof value === 'string' ? value : (value ? String(value) : ''));

                if (variant === 'node') {
                    // node 模式下使用 Input 组件
                    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                        if (controlConfig.dataType === 'number') {
                            const inputValue = e.target.value;
                            if (inputValue === '' || inputValue === '-' || /^-?\d*\.?\d*$/.test(inputValue)) {
                                if (inputValue === '' || inputValue === '-') {
                                    onChange(field.fieldName, inputValue);
                                } else {
                                    const numValue = parseFloat(inputValue);
                                    onChange(field.fieldName, isNaN(numValue) ? inputValue : numValue);
                                }
                            }
                        } else {
                            onChange(field.fieldName, e.target.value);
                        }
                    };

                    const control = (
                        <Input
                            type={inputType}
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder={controlConfig.placeholder || field.description}
                            error={errorMessage}
                        />
                    );
                    return renderWithOptionalLabel(control);
                } else {
                    // connect 模式下使用样式化的 input
                    const control = (
                        <StyledTextInput
                            $variant={variant}
                            type={inputType}
                            value={inputValue}
                            onChange={(e) => onChange(field.fieldName, e.target.value)}
                            placeholder={controlConfig.placeholder || field.description}
                        />
                    );
                    return renderWithOptionalLabel(control);
                }
            }

            case 'select': {
                if (variant === 'node') {
                    // node 模式下使用 SelectControl 组件
                    // 优先使用动态配置，回退到静态配置
                    const selectOptions = field.control.dataSourceType && dynamicConnectConfigs.length > 0
                        ? dynamicConnectConfigs.map(config => ({
                            value: config.id,
                            label: config.name || String(config.id)
                        }))
                        : controlConfig.options?.map((opt: any) => ({
                            value: opt.value,
                            label: opt.name || String(opt.value)
                        })) || [];

                    // 处理联动onChange事件
                    const handleSelectChange = (val: any) => {
                        // REST API authType 特殊调试日志
                        if (field.fieldName === 'authType') {
                            console.log('🔥 [REST-API-DEBUG] authType 值变化 (node模式):', {
                                fieldName: field.fieldName,
                                oldValue: value,
                                newValue: val,
                                formValues: formValues
                            });
                        }
                        
                        onChange(field.fieldName, val);

                        // 处理联动逻辑
                        if (field.control.linkage?.targets && field.control.linkage.targets.length > 0 && onFetchConnectDetail && val) {
                            console.log('🔗 [select] 触发联动逻辑:', {
                                fieldName: field.fieldName,
                                targets: field.control.linkage.targets,
                                selectedValue: val
                            });

                            field.control.linkage.targets.forEach(async (targetFieldName: string) => {
                                try {
                                    await onFetchConnectDetail(val);
                                    console.log('✅ [select] 联动数据获取成功:', { targetFieldName });
                                } catch (error) {
                                    console.error('❌ [select] 联动数据获取失败:', { targetFieldName, error });
                                }
                            });
                        }
                    };

                    const control = (
                        <SelectControl
                            options={selectOptions}
                            value={value}
                            onChange={handleSelectChange}
                            placeholder={controlConfig.placeholder || field.description}
                            error={errorMessage}
                        />
                    );
                    return renderWithOptionalLabel(control);
                } else {
                    // connect 模式下使用样式化的 select
                    const selectOptions = field.control.dataSourceType && dynamicConnectConfigs.length > 0
                        ? dynamicConnectConfigs
                        : controlConfig.options || [];

                    // 处理联动onChange事件
                    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                        const val = e.target.value;
                        
                        // REST API authType 特殊调试日志
                        if (field.fieldName === 'authType') {
                            console.log('🔥 [REST-API-DEBUG] authType 值变化:', {
                                fieldName: field.fieldName,
                                oldValue: value,
                                newValue: val,
                                formValues: formValues
                            });
                        }
                        
                        onChange(field.fieldName, val);

                        // 处理联动逻辑
                        if (field.control.linkage?.targets && field.control.linkage.targets.length > 0 && onFetchConnectDetail && val) {
                            console.log('🔗 [select] 触发联动逻辑:', {
                                fieldName: field.fieldName,
                                targets: field.control.linkage.targets,
                                selectedValue: val
                            });

                            field.control.linkage.targets.forEach(async (targetFieldName: string) => {
                                try {
                                    await onFetchConnectDetail(val);
                                    console.log('✅ [select] 联动数据获取成功:', { targetFieldName });
                                } catch (error) {
                                    console.error('❌ [select] 联动数据获取失败:', { targetFieldName, error });
                                }
                            });
                        }
                    };

                    const control = (
                        <StyledSelect $variant={variant} value={value || ''} onChange={handleSelectChange}>
                            <option value="">选择一个选项</option>
                            {selectOptions.map((option: any) => {
                                // 处理动态配置和静态配置的不同格式
                                const optionValue = option.id || option.value;
                                const optionLabel = option.name || option.label || optionValue;
                                return (
                                    <option key={optionValue} value={optionValue}>
                                        {optionLabel}
                                    </option>
                                );
                            })}
                        </StyledSelect>
                    );
                    return renderWithOptionalLabel(control);
                }
            }

            case 'textarea': {
                // 🔧 修复：确保 value 是字符串类型，避免 [object Object] 问题
               const textareaAttributes = controlConfig.attributes?.[0] || {};
                // 修复：优先使用 controlConfig.placeholder，优化值处理逻辑
                const textValue = typeof value === 'string' ? value :
                    (value && typeof value === 'object' ? JSON.stringify(value) : 
                     value ? String(value) : '');
                
                if (variant === 'node') {
                    // node 模式下使用 TextArea 组件
                    const control = (
                        <TextArea
                            value={textValue}
                            onChange={(e) => onChange(field.fieldName, e.target.value)}
                            placeholder={controlConfig.placeholder || field.description}
                            error={errorMessage}
                            {...textareaAttributes}
                        />
                    );
                    return renderWithOptionalLabel(control);
                } else {
                    // connect 模式下使用样式化的 textarea
                    const control = (
                        <StyledTextArea
                            $variant={variant}
                            value={textValue}
                            onChange={(e) => onChange(field.fieldName, e.target.value)}
                            placeholder={controlConfig.placeholder || field.description}
                        />
                    );
                    return renderWithOptionalLabel(control);
                }
            }

            case 'selectfilter': {
                // 使用新的联动数据，基于targeting机制
                let selectFilterOptions = [];

                if (linkageData.length > 0) {
                    // 优先使用联动数据
                    selectFilterOptions = linkageData.map(item => ({ label: item.label, value: item.value }));
                } else if (field.control.dataSourceType && dynamicConnectConfigs.length > 0) {
                    // 使用动态配置
                    selectFilterOptions = dynamicConnectConfigs.map(config => ({
                        label: config.name,
                        value: config.id
                    }));
                } else {
                    // 回退到静态配置
                    selectFilterOptions = controlConfig.options?.map((opt: any) => ({
                        value: opt.value,
                        label: opt.name || String(opt.value)
                    })) || [];
                }

                // 处理联动onChange事件
                const handleSelectFilterChange = (val: any) => {
                    onChange(field.fieldName, val);

                    // 处理联动逻辑
                    if (field.control.linkage?.targets && field.control.linkage.targets.length > 0 && onFetchConnectDetail && val) {
                        console.log('🔗 [selectfilter] 触发联动逻辑:', {
                            fieldName: field.fieldName,
                            targets: field.control.linkage.targets,
                            selectedValue: val
                        });

                        field.control.linkage.targets.forEach(async (targetFieldName: string) => {
                            try {
                                await onFetchConnectDetail(val);
                                console.log('✅ [selectfilter] 联动数据获取成功:', { targetFieldName });
                            } catch (error) {
                                console.error('❌ [selectfilter] 联动数据获取失败:', { targetFieldName, error });
                            }
                        });
                    }
                };

                const control = (
                    <SelectFilter
                        options={selectFilterOptions}
                        value={value}
                        onChange={handleSelectFilterChange}
                        placeholder={controlConfig.placeholder || field.description}
                        disabled={!shouldEnable || linkageLoading}
                        loading={linkageLoading}
                        error={linkageError}
                        hasError={hasValidationError(field.fieldName)}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'selectwithdesc': {
                let datasource = [];

                if (field.control.dataSourceType && dynamicConnectConfigs.length > 0) {
                    // 使用动态配置
                    datasource = dynamicConnectConfigs.map(config => ({
                        value: config.id,
                        text: config.name,
                        description: config.description
                    }));
                } else {
                    // 回退到静态配置
                    datasource = controlConfig.options?.map((opt: any) => ({
                        value: opt.value,
                        text: opt.name || opt.value,
                        description: opt.description
                    })) || [];
                }

                // 处理联动onChange事件
                const handleSelectWithDescChange = (value: string | number) => {
                    onChange(field.fieldName, value);

                    // 处理联动逻辑
                    if (field.control.linkage?.targets && field.control.linkage.targets.length > 0 && onFetchConnectDetail && value) {
                        console.log('🔗 [selectwithdesc] 触发联动逻辑:', {
                            fieldName: field.fieldName,
                            targets: field.control.linkage.targets,
                            selectedValue: value
                        });

                        field.control.linkage.targets.forEach(async (targetFieldName: string) => {
                            try {
                                await onFetchConnectDetail(value as string);
                                console.log('✅ [selectwithdesc] 联动数据获取成功:', { targetFieldName });
                            } catch (error) {
                                console.error('❌ [selectwithdesc] 联动数据获取失败:', { targetFieldName, error });
                            }
                        });
                    }
                };

                const control = (
                    <SelectWithDesc
                        datasource={datasource}
                        value={value}
                        onChange={handleSelectWithDescChange}
                        placeholder={controlConfig.placeholder || field.description}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'inputselect': {
                // 使用新的联动数据，基于targeting机制
                let inputSelectOptions = [];

                if (linkageData.length > 0) {
                    // 优先使用联动数据
                    inputSelectOptions = linkageData.map(item => item.label || item.value || item);
                } else if (field.control.dataSourceType && dynamicConnectConfigs.length > 0) {
                    // 使用动态配置
                    inputSelectOptions = dynamicConnectConfigs.map(config => config.name || config.id);
                } else {
                    // 回退到静态配置
                    inputSelectOptions = controlConfig.options?.map((option: any) =>
                        typeof option === 'string' ? option : (option.name || option.value)
                    ) || [];
                }

                const control = (
                    <InputSelect
                        options={inputSelectOptions}
                        value={value || ''}
                        onChange={(val) => onChange(field.fieldName, val)}
                        placeholder={controlConfig.placeholder || field.description}
                        disabled={!shouldEnable || linkageLoading}
                    />
                );
                return renderWithOptionalLabel(control);
            }


            case 'selectlistdesc':
                const connectDatasource = dynamicConnectConfigs.map(config => ({
                    value: config.id,
                    text: config.name,
                    ...(config.description && { description: config.description })
                }));

                // 处理 selectlistdesc 的 onChange 事件，同时处理联动逻辑
                const handleselectlistdescChange = (selectedValue: string | number) => {
                    try {
                        // 解析 JSON 格式的 value
                        // const connectInfo = JSON.parse(selectedValue as string);

                        // 保存完整的连接信息到字段值
                        onChange(field.fieldName, selectedValue);

                        // 处理联动逻辑：当字段配置了 linkage 且有 targets 时
                        if (field.control.linkage?.targets && field.control.linkage.targets.length > 0 && onFetchConnectDetail) {
                            console.log('🔗 [selectlistdesc] 触发联动逻辑:', {
                                fieldName: field.fieldName,
                                targets: field.control.linkage.targets,
                                connectId: selectedValue
                            });

                            // 为每个目标字段获取数据
                            field.control.linkage.targets.forEach(async (targetFieldName: string) => {
                                try {
                                    const result = await onFetchConnectDetail(selectedValue as string);
                                    console.log('✅ [selectlistdesc] 联动数据获取成功:', {
                                        targetFieldName,
                                        tableCount: result.options?.length || 0
                                    });
                                } catch (error) {
                                    console.error('❌ [selectlistdesc] 联动数据获取失败:', {
                                        targetFieldName,
                                        error
                                    });
                                }
                            });
                        }
                    } catch (error) {
                        console.error('❌ [UnifiedParameterInput] 解析连接信息失败:', error);
                        // 如果解析失败，按旧格式处理（向后兼容）
                        onChange(field.fieldName, selectedValue);
                    }
                };

                const control = (
                    <SelectListDesc
                        datasource={connectDatasource}
                        value={value}
                        onChange={handleselectlistdescChange}
                        placeholder={controlConfig.placeholder || field.description || '请选择连接'}
                    />
                );
                return renderWithOptionalLabel(control);

            case 'selectadd': {
                // selectadd 控件的特殊处理逻辑
                const handleSelectAddChange = (value: string | number) => {
                    onChange(field.fieldName, value);

                    // 特殊处理：如果是重置操作，移除相关字段
                    if (value === controlConfig.defaultValue) {
                        const fieldsToRemove: string[] = [];
                        allFields.forEach(f => {
                            if (f.conditionRules?.addBy) {
                                Object.entries(f.conditionRules.addBy).forEach(([dependentField, values]) => {
                                    if (dependentField === field.fieldName) {
                                        fieldsToRemove.push(f.fieldName);
                                    }
                                });
                            }
                        });

                        if (fieldsToRemove.length > 0) {
                            const newAddedFields = new Set(addedFields);
                            fieldsToRemove.forEach(fieldName => {
                                newAddedFields.delete(fieldName);
                                const fieldConfig = allFields.find(f => f.fieldName === fieldName);
                                if (fieldConfig?.control.dataType === 'options' && fieldConfig.control.options) {
                                    (fieldConfig.control.options as any[]).forEach(subField => {
                                        newAddedFields.delete(`${fieldName}.${subField.fieldName}`);
                                    });
                                }
                            });
                            setAddedFields(newAddedFields);
                        }
                        return;
                    }

                    // 查找所有依赖当前字段的字段
                    const fieldsToAdd: string[] = [];
                    allFields.forEach(f => {
                        if (f.conditionRules?.addBy) {
                            Object.entries(f.conditionRules.addBy).forEach(([dependentField, values]) => {
                                if (dependentField === field.fieldName && (values as string[]).includes(value as string)) {
                                    fieldsToAdd.push(f.fieldName);
                                }
                            });
                        }
                    });

                    if (fieldsToAdd.length > 0) {
                        const newAddedFields = new Set(addedFields);
                        fieldsToAdd.forEach(fieldName => {
                            newAddedFields.add(fieldName);
                            const fieldConfig = allFields.find(f => f.fieldName === fieldName);
                            if (fieldConfig?.control.dataType === 'options' && fieldConfig.control.options) {
                                (fieldConfig.control.options as any[]).forEach(subField => {
                                    newAddedFields.add(`${fieldName}.${subField.fieldName}`);
                                });
                            }
                        });
                        setAddedFields(newAddedFields);
                    }
                };

                const control = (
                    <SelectAdd
                        options={controlConfig.options?.map((opt: any) => ({
                            value: opt.value,
                            label: opt.name || opt.value
                        })) || []}
                        onChange={handleSelectAddChange}
                        placeholder={field.description || controlConfig.placeholder}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'slider': {
                const sliderAttributes = controlConfig.attributes?.[0] || {};
                const numberPrecision = sliderAttributes?.step;
                const computedStep = numberPrecision ? Math.pow(10, -numberPrecision) : 1;
                const control = (
                    <SliderControl
                        value={value || controlConfig.defaultValue || 0}
                        onChange={(val) => onChange(field.fieldName, val)}
                        {...sliderAttributes} // 传递 min、max 等属性
                        step={computedStep} // 覆盖 step 为计算值
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'switch': {
                const switchAttributes = controlConfig.attributes?.[0] || {};
                const control = (
                    <Switch
                        value={value || controlConfig.defaultValue || false}
                        onChange={(checked) => onChange(field.fieldName, checked)}
                        {...switchAttributes}
                    // size={field.typeOptions?.size || 'small'}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'sqltext': {
                const control = (
                    <SQLText
                        value={value || ''}
                        onChange={(val) => onChange(field.fieldName, val)}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'note': {
                const control = (
                    <Note value={field.control.defaultValue ? String(field.control.defaultValue) : ''} />
                );
                return renderWithOptionalLabel(control);
            }

            case 'collection':
                // collection 控件不需要类型判断和必填判断
                return (
                    <CollectionContainer $variant={variant}>
                        <CollectionHeader $variant={variant}>
                            <CollectionTitle $variant={variant}>{field.label}</CollectionTitle>
                        </CollectionHeader>
                        <CollectionFields>
                            {controlConfig.options?.map((subField: any, index: number) => (
                                <InlineFieldContainer key={subField.fieldName || index} $variant={variant}>
                                    <InlineInputWrapper>
                                        <UnifiedParameterInput
                                            variant={variant}
                                            field={subField}
                                            value={value?.[subField.fieldName]}
                                            onChange={(name, val) => {
                                                const newValue = { ...value };
                                                newValue[name] = val;
                                                onChange(field.fieldName, newValue);
                                            }}
                                            formValues={formValues}
                                            onExpandModeChange={onExpandModeChange}
                                            // connectConfigs 不再传递
                                            onFetchConnectInstances={onFetchConnectInstances}
                                            onFetchConnectDetail={onFetchConnectDetail}
                                            linkageCallbacks={linkageCallbacks}
                                            allFields={allFields}
                                            isInCollection={true}
                                            validationErrors={validationErrors}
                                            onAIhelpClick={onAIhelpClick}
                                        />
                                    </InlineInputWrapper>
                                </InlineFieldContainer>
                            ))}
                        </CollectionFields>
                    </CollectionContainer>
                );

            default:
                console.warn(`未知的控件类型: ${controlName}`);
                return null;
        }
    };

    return (
        <InputContainer $variant={variant}>
            {renderControlByName()}
        </InputContainer>
    );
};