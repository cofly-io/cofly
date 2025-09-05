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
    InputSelect,
    SelectAdd,
    SliderControl,
    Switch,
    SQLText,
    Note,
    TextArea,
    AIhelp
} from '../../controls';
import { SqlCode } from '../../controls/sqlcode';
import { SelecConnect } from '../../controls/selectconnect';

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
    connectConfigs = [],
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
    const { linkageData, linkageLoading, linkageError } = useLinkageData(field, formValues, linkageCallbacks);

    // 动态连接配置状态
    const [dynamicConnectConfigs, setDynamicConnectConfigs] = useState(connectConfigs);

    // AI助手loading状态
    const [aiLoading, setAiLoading] = useState(false);

    // 处理 selectconnect 类型字段的连接配置获取
    useEffect(() => {
        if (field.control.name === 'selectconnect') {
            const fetchConfigs = async () => {
                const connectType = field.control.connectType;
                if (connectType && onFetchConnectInstances) {
                    try {
                        const configs = await onFetchConnectInstances(connectType);
                        const configsWithMtype = configs.map(config => ({
                            ...config,
                            mtype: config.mtype
                        }));
                        setDynamicConnectConfigs(configsWithMtype);
                    } catch (error) {
                        console.error('❌ [UnifiedParameterInput] 获取连接配置失败:', error);
                        const filteredConfigs = connectConfigs.filter(config =>
                            connectType ? (config.mtype === connectType || config.ctype === connectType) : true
                        );
                        setDynamicConnectConfigs(filteredConfigs);
                    }
                } else {
                    const filteredConfigs = connectConfigs.filter(config => {
                        if (!connectType) return true;
                        return config.mtype === connectType || config.ctype === connectType;
                    });
                    setDynamicConnectConfigs(filteredConfigs);
                }
            };

            fetchConfigs();
        }
    }, [field.control.name, field.control.connectType, field.fieldName, onFetchConnectInstances, connectConfigs]);

    // 通用的验证错误检查函数
    const hasValidationError = (fieldName: string) => {
        return validationErrors?.has(fieldName) || false;
    };

    // 通用的必填验证函数
    const isFieldRequired = () => {
        return field.control?.validation?.required || false;
    };

    // 通用的数据类型验证函数
    const validateDataType = (value: any, dataType: string) => {
        switch (dataType) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' || !isNaN(Number(value));
            case 'boolean':
                return typeof value === 'boolean';
            case 'json':
                try {
                    JSON.parse(value);
                    return true;
                } catch {
                    return false;
                }
            default:
                return true;
        }
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
        // const nodeOnlyControls = ['button', 'card', 'jscode', 'cmdcode', 'sqlcode', 'selectfilter', 
        //                          'selectwithdesc', 'selectconnect', 'selectadd', 'slider', 'switch', 
        //                          'sqltext', 'note', 'collection'];

        // if (nodeOnlyControls.includes(controlName) && variant !== 'node') {
        //   return null;
        // }

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
                            type={controlConfig.dataType === 'number' ? "number" : "text"}
                            value={value || ''}
                            onChange={handleInputChange}
                            placeholder={field.description || controlConfig.placeholder}
                            error={errorMessage}
                        />
                    );
                    return renderWithOptionalLabel(control);
                } else {
                    // connect 模式下使用样式化的 input
                    const control = (
                        <StyledTextInput
                            $variant={variant}
                            type={controlConfig.dataType === 'number' ? "number" : "text"}
                            value={value || ''}
                            onChange={(e) => onChange(field.fieldName, e.target.value)}
                            placeholder={field.description || controlConfig.placeholder}
                        />
                    );
                    return renderWithOptionalLabel(control);
                }
            }

            case 'select': {
                if (variant === 'node') {
                    // node 模式下使用 SelectControl 组件
                    const selectOptions = controlConfig.options?.map((opt: any) => ({
                        value: opt.value,
                        label: opt.name || String(opt.value)
                    })) || [];

                    const control = (
                        <SelectControl
                            options={selectOptions}
                            value={value}
                            onChange={(val) => onChange(field.fieldName, val)}
                            placeholder={field.description || controlConfig.placeholder}
                            error={errorMessage}
                        />
                    );
                    return renderWithOptionalLabel(control);
                } else {
                    // connect 模式下使用样式化的 select
                    const control = (
                        <StyledSelect $variant={variant} value={value || ''} onChange={(e) => onChange(field.fieldName, e.target.value)}>
                            <option value="">选择一个选项</option>
                            {controlConfig.options?.map((option: any) => (
                                <option key={option.value} value={option.value}>
                                    {option.name || option.value}
                                </option>
                            ))}
                        </StyledSelect>
                    );
                    return renderWithOptionalLabel(control);
                }
            }

            case 'textarea': {
                if (variant === 'node') {
                    // node 模式下使用 TextArea 组件
                    const control = (
                        <TextArea
                            value={value || ''}
                            onChange={(val) => onChange(field.fieldName, val)}
                            placeholder={field.description || controlConfig.placeholder}
                            error={errorMessage}
                        />
                    );
                    return renderWithOptionalLabel(control);
                } else {
                    // connect 模式下使用样式化的 textarea
                    const control = (
                        <StyledTextArea
                            $variant={variant}
                            value={value || ''}
                            onChange={(e) => onChange(field.fieldName, e.target.value)}
                            placeholder={field.description || controlConfig.placeholder}
                        />
                    );
                    return renderWithOptionalLabel(control);
                }
            }

            case 'selectfilter': {
                const hasLinkageData = field.linkage?.dependsOn && linkageData.length > 0;
                const selectFilterOptions = hasLinkageData
                    ? linkageData.map(item => ({ label: item.label, value: item.value }))
                    : controlConfig.options?.map((opt: any) => ({
                        value: opt.value,
                        label: opt.name || String(opt.value)
                    })) || [];

                const control = (
                    <SelectFilter
                        options={selectFilterOptions}
                        value={value}
                        onChange={(val) => onChange(field.fieldName, val)}
                        placeholder={field.description || controlConfig.placeholder}
                        disabled={!shouldEnable || linkageLoading}
                        loading={linkageLoading}
                        error={linkageError}
                        hasError={hasValidationError(field.fieldName)}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'selectwithdesc': {
                const control = (
                    <SelectWithDesc
                        datasource={controlConfig.options?.map((opt: any) => ({
                            value: opt.value,
                            text: opt.name || opt.value,
                            description: opt.description
                        })) || []}
                        value={value}
                        onChange={(value: string | number) => onChange(field.fieldName, value)}
                        placeholder={field.description || controlConfig.placeholder}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'inputselect': {
                const hasInputSelectLinkageData = field.linkage?.dependsOn && linkageData.length > 0;
                const inputSelectOptions = hasInputSelectLinkageData
                    ? linkageData.map(item => item.label || item.value || item)
                    : controlConfig.options?.map((option: any) =>
                        typeof option === 'string' ? option : (option.name || option.value)
                    ) || [];

                const control = (
                    <InputSelect
                        options={inputSelectOptions}
                        value={value || ''}
                        onChange={(val) => onChange(field.fieldName, val)}
                        placeholder={field.description || controlConfig.placeholder}
                        disabled={!shouldEnable || linkageLoading}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'selectconnect':
                const connectDatasource = dynamicConnectConfigs.map(config => {
                    const connectInfo = {
                        id: config.id,
                        ctype: config.ctype,
                        mtype: config.mtype
                    };
                    return {
                        value: JSON.stringify(connectInfo),
                        text: config.name,
                        description: config.description || `${config.mtype || config.ctype} 连接`
                    };
                });

                // 处理 selectconnect 的 onChange 事件，value 包含完整的连接信息
                const handleSelectConnectChange = (selectedValue: string | number) => {
                    try {
                        // 解析 JSON 格式的 value
                        // const connectInfo = JSON.parse(selectedValue as string);

                        // 保存完整的连接信息到字段值
                        onChange(field.fieldName, selectedValue);
                    } catch (error) {
                        console.error('❌ [UnifiedParameterInput] 解析连接信息失败:', error);
                        // 如果解析失败，按旧格式处理（向后兼容）
                        onChange(field.fieldName, selectedValue);
                    }
                };

                // 处理 value 的兼容性显示
                const getDisplayValue = () => {
                    if (!value) return value;

                    try {
                        // 尝试解析为 JSON，如果成功说明是新格式
                        JSON.parse(value as string);
                        return value; // 新格式直接返回
                    } catch {
                        // 解析失败说明是旧格式（简单ID），需要转换为新格式
                        const matchedConfig = dynamicConnectConfigs.find(config => config.id === value);
                        if (matchedConfig) {
                            return JSON.stringify({
                                id: matchedConfig.id,
                                ctype: matchedConfig.ctype,
                                mtype: matchedConfig.mtype
                            });
                        }
                        return value; // 如果找不到匹配的配置，返回原值
                    }
                };

                const displayValue = getDisplayValue();


                const control = (
                    <SelecConnect
                        datasource={connectDatasource}
                        value={displayValue}
                        onChange={(val) => onChange(field.fieldName, val)}
                        placeholder={field.description || controlConfig.placeholder}
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
                            label : opt.name || opt.value
                        }))|| []}
                        onChange={handleSelectAddChange}
                        placeholder={field.description || controlConfig.placeholder}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'slider': {
                const sliderAttributes = controlConfig.attributes?.[0] || {};
                const control = (
                    <SliderControl
                        value={value || controlConfig.defaultValue || 0}
                        onChange={(val) => onChange(field.fieldName, val)}
                        min={sliderAttributes.minValue || 0}
                        max={sliderAttributes.maxValue || 100}
                        step={sliderAttributes.numberPrecision ? Math.pow(10, -sliderAttributes.numberPrecision) : 1}
                    />
                );
                return renderWithOptionalLabel(control);
            }

            case 'switch': {
                const switchAttributes = controlConfig.attributes?.[0] || {};
                const control = (
                    <Switch
                        value={ value || controlConfig.defaultValue || false }
                        onChange={(checked) => onChange(field.fieldName, checked)}
                        text={switchAttributes.text}
                        {...field.control.attributes}
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
                    <Note value={field.control.defaultValue ? String(field.control.defaultValue ) : ''} />
                );
                return renderWithOptionalLabel(control);
            }

            case 'collection':
                // collection 控件不需要类型判断和必填判断
                return (
                    <CollectionContainer $variant={variant}>
                        <CollectionHeader  $variant={variant}>
                            <CollectionTitle  $variant={variant}>{field.label}</CollectionTitle>
                        </CollectionHeader>
                        <CollectionFields>
                            {controlConfig.options?.map((subField: any, index: number) => (
                                <InlineFieldContainer key={subField.fieldName || index}  $variant={variant}>
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
                                            connectConfigs={connectConfigs}
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