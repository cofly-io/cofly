// export type CodeAutocompleteTypes = 'function' | 'functionItem';
import { ConnectType } from './ConnectInterfaces';

export type GenericValue = string | object | number | boolean | undefined | null;

// export type EditorType = 'codeNodeEditor' | 'jsEditor' | 'htmlEditor' | 'sqlEditor' | 'cssEditor';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

// export const LOG_LEVELS = ['silent', 'error', 'warn', 'info', 'debug'] as const;

export type Themed<T> = T | { light: T; dark: T };
export type IconName = `${string}.svg` | `${string}.png`;
export type Icon = Themed<IconName>;


export interface IDataObject {
    [key: string]: GenericValue | IDataObject | GenericValue[] | IDataObject[];
}


// Enforce at least one of resourceMapperMethod or localResourceMapperMethod
export type ResourceMapperTypeOptionsLocal = {
    resourceMapperMethod: string;
    localResourceMapperMethod?: never; // Explicitly disallows this property
};

export type ResourceMapperTypeOptionsExternal = {
    localResourceMapperMethod: string;
    resourceMapperMethod?: never; // Explicitly disallows this property
};

export interface IRequestOptionsSimplifiedAuth {
    auth?: {
        username: string;
        password: string;
        sendImmediately?: boolean;
    };
    body?: IDataObject;
    headers?: IDataObject;
    qs?: IDataObject;
    url?: string;
    skipSslCertificateValidation?: boolean | string;
}

// The encrypted credentials which the nodes can access
export type CredentialInformation =
    | string
    | string[]
    | number
    | boolean
    | IDataObject
    | IDataObject[];

export type WorkflowExecuteMode =
    | 'cli'
    | 'error'
    | 'integrated'
    | 'internal'
    | 'manual'
    | 'retry'
    | 'trigger'
    | 'webhook'
    | 'evaluation';

export type WorkflowActivateMode =
    | 'init'
    | 'create' // unused
    | 'update'
    | 'activate'
    | 'manual' // unused
    | 'leadershipChange';


export interface ICredentialDataDecryptedObject {
    [key: string]: CredentialInformation;
}

export interface IWorkflowMetadata {
    id?: string;
    name?: string;
    active: boolean;
}

export type BinaryFileType = 'text' | 'json' | 'image' | 'audio' | 'video' | 'pdf' | 'html';
export interface IBinaryData {
    [key: string]: string | number | undefined;
    data: string;
    mimeType: string;
    fileType?: BinaryFileType;
    fileName?: string;
    directory?: string;
    fileExtension?: string;
    fileSize?: string; // TODO: change this to number and store the actual value
    id?: string;
}

export interface ISourceData {
    previousNode: string;
    previousNodeOutput?: number; // If undefined "0" gets used
    previousNodeRun?: number; // If undefined "0" gets used
}

export type NodeTypeAndVersion = {
    name: string;
    type: string;
    typeVersion: number;
    disabled: boolean;
    parameters?: INodeParameters;
};

export interface IPinData {
    [nodeName: string]: INodeExecutionData[];
}

export interface INodes {
    [key: string]: INode;
}

export interface IObservableObject {
    [key: string]: any;
    __dataChanged: boolean;
}

export interface IBinaryKeyData {
    [key: string]: IBinaryData;
}

export interface IPairedItemData {
    item: number;
    input?: number; // If undefined "0" gets used
    sourceOverwrite?: ISourceData;
}

export interface RelatedExecution {
    executionId: string;
    workflowId: string;
}


export interface INodeExecutionData {
    [key: string]:
    | IDataObject
    | IBinaryKeyData
    | IPairedItemData
    | IPairedItemData[]
    //| NodeApiError
    //| NodeOperationError
    | number
    | undefined;
    json: IDataObject;
    binary?: IBinaryKeyData;
    //error?: NodeApiError | NodeOperationError;
    pairedItem?: IPairedItemData | IPairedItemData[] | number;
    metadata?: {
        subExecution: RelatedExecution;
    };
}

export interface FunctionsBase {
    // logger: Logger;
    getCredentials<T extends object = ICredentialDataDecryptedObject>(
        type: string,
        itemIndex?: number,
    ): Promise<T>;
    getCredentialsProperties(type: string): INodeFields[];
    getExecutionId(): string;
    getNode(): INode;
    getWorkflow(): IWorkflowMetadata;
    getWorkflowStaticData(type: string): IDataObject;
    getTimezone(): string;
    getRestApiUrl(): string;
    getInstanceBaseUrl(): string;
    getInstanceId(): string;
    getChildNodes(
        nodeName: string,
        options?: { includeNodeParameters?: boolean },
    ): NodeTypeAndVersion[];
    getParentNodes(nodeName: string): NodeTypeAndVersion[];
    getKnownNodeTypes(): IDataObject;
    getMode?: () => WorkflowExecuteMode;
    getActivationMode?: () => WorkflowActivateMode;

    /** @deprecated */
    prepareOutputData(outputData: INodeExecutionData[]): Promise<INodeExecutionData[][]>;
}



type FunctionsBaseWithRequiredKeys<Keys extends keyof FunctionsBase> = FunctionsBase & {
    [K in Keys]: NonNullable<FunctionsBase[K]>;
};

export interface ITaskSubRunMetadata {
    node: string;
    runIndex: number;
}


export interface ITaskMetadata {
    subRun?: ITaskSubRunMetadata[];
    parentExecution?: RelatedExecution;
    subExecution?: RelatedExecution;
    subExecutionsCount?: number;
}

export type ContextType = 'flow' | 'node';
export type IContextObject = {
    [key: string]: any;
};

export interface ITaskDataConnections {
    // Key for each input type and because there can be multiple inputs of the same type it is an array
    // null is also allowed because if we still need data for a later while executing the workflow set temporary to null
    // the nodes get as input TaskDataConnections which is identical to this one except that no null is allowed.
    [key: string]: Array<INodeExecutionData[] | null>;
}

export interface ITaskDataConnectionsSource {
    // Key for each input type and because there can be multiple inputs of the same type it is an array
    // null is also allowed because if we still need data for a later while executing the workflow set temporary to null
    // the nodes get as input TaskDataConnections which is identical to this one except that no null is allowed.
    [key: string]: Array<ISourceData | null>;
}


export interface IExecuteData {
    data: ITaskDataConnections;
    metadata?: ITaskMetadata;
    node: INode;
    source: ITaskDataConnectionsSource | null;
}

export interface ProxyInput {
    all: () => INodeExecutionData[];
    context: any;
    first: () => INodeExecutionData | undefined;
    item: INodeExecutionData | undefined;
    last: () => INodeExecutionData | undefined;
    params?: INodeParameters;
}

export interface IWorkflowDataProxyData {
    [key: string]: any;
    $binary: INodeExecutionData['binary'];
    $data: any;
    $env: any;
    $evaluateExpression: (expression: string, itemIndex?: number) => NodeParameterValueType;
    $item: (itemIndex: number, runIndex?: number) => IWorkflowDataProxyData;
    $items: (nodeName?: string, outputIndex?: number, runIndex?: number) => INodeExecutionData[];
    $json: INodeExecutionData['json'];
    $node: any;
    $parameter: INodeParameters;
    $position: number;
    $workflow: any;
    $: any;
    $input: ProxyInput;
    $thisItem: any;
    $thisRunIndex: number;
    $thisItemIndex: number;
    $now: any;
    $today: any;
    $getPairedItem: (
        destinationNodeName: string,
        incomingSourceData: ISourceData | null,
        pairedItem: IPairedItemData,
    ) => INodeExecutionData | null;
    constructor: any;
}

export type AiEvent =
    | 'ai-messages-retrieved-from-memory'
    | 'ai-message-added-to-memory'
    | 'ai-output-parsed'
    | 'ai-documents-retrieved'
    | 'ai-document-embedded'
    | 'ai-query-embedded'
    | 'ai-document-processed'
    | 'ai-text-split'
    | 'ai-tool-called'
    | 'ai-vector-store-searched'
    | 'ai-llm-generated-output'
    | 'ai-llm-errored'
    | 'ai-vector-store-populated'
    | 'ai-vector-store-updated';

type AiEventPayload = {
    msg: string;
    workflowName: string;
    executionId: string;
    nodeName: string;
    workflowId?: string;
    nodeType?: string;
};

type BaseExecutionFunctions = FunctionsBaseWithRequiredKeys<'getMode'> & {
    continueOnFail(): boolean;
    setMetadata(metadata: ITaskMetadata): void;
    evaluateExpression(expression: string, itemIndex: number): NodeParameterValueType;
    getContext(type: ContextType): IContextObject;
    getExecuteData(): IExecuteData;
    getWorkflowDataProxy(itemIndex: number): IWorkflowDataProxyData;
    //getInputSourceData(inputIndex?: number, connectionType?: NodeConnectionType): ISourceData;
    getExecutionCancelSignal(): AbortSignal | undefined;
    onExecutionCancellation(handler: () => unknown): void;
    logAiEvent(eventName: AiEvent, msg?: string | undefined): void;
};

export type EnsureTypeOptions = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'json';
export interface IGetNodeParameterOptions {
    contextNode?: INode;
    // make sure that returned value would be of specified type, converts it if needed
    ensureType?: EnsureTypeOptions;
    // extract value from regex, works only when parameter type is resourceLocator
    extractValue?: boolean;
    // get raw value of parameter with unresolved expressions
    rawExpressions?: boolean;
}

export type IHttpRequestMethods = 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT';

export interface IHttpRequestOptions {
    url: string;
    baseURL?: string;
    headers?: IDataObject;
    method?: IHttpRequestMethods;
    body?: FormData | GenericValue | GenericValue[] | Buffer | URLSearchParams;
    qs?: IDataObject;
    arrayFormat?: 'indices' | 'brackets' | 'repeat' | 'comma';
    auth?: {
        username: string;
        password: string;
        sendImmediately?: boolean;
    };
    disableFollowRedirect?: boolean;
    encoding?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
    skipSslCertificateValidation?: boolean;
    returnFullResponse?: boolean;
    ignoreHttpStatusErrors?: boolean;
    proxy?: {
        host: string;
        port: number;
        auth?: {
            username: string;
            password: string;
        };
        protocol?: string;
    };
    timeout?: number;
    json?: boolean;
    abortSignal?: string;//GenericAbortSignal;
}

/**
 * 所有连接点类型集合
 */
export const NodeLink = {
    Data: { desc: '', subflow: false },
    Done: { desc: '完成', subflow: false },
    Loop: { desc: '循环', subflow: true },
    Error: { desc: '错误', subflow: false },
    Signal: { desc: '信号', subflow: false },
    Composite: { desc: "组合", subflow: true }
} as const;

export type NodeLinkType =
    (typeof NodeLink)[keyof typeof NodeLink];

export interface INodePropertyOptions {
    name: string;
    value: string;
    action?: string;
    description?: string;
}

export type NodePropertyTypes =
    | 'string'
    | 'number'
    | 'boolean'
    | 'collection'
    | 'multiOptions'
    | 'options'
    | 'dateTime'
    | 'json'

export type ExecuteType = 'once' | 'each';

// export type NodePropertyAction = {
//     type: 'askAiCodeGeneration';
//     handler?: string;
//     target?: string;
// };

export type NodeParameterValue = string | number | boolean | undefined | null;

export type ResourceLocatorModes = 'id' | 'url' | 'list' | string;
export interface IResourceLocatorResult {
    name: string;
    value: string;
    url?: string;
}

export interface INodeParameterResourceLocator {
    __rl: true;
    mode: ResourceLocatorModes;
    value: NodeParameterValue;
    cachedResultName?: string;
    cachedResultUrl?: string;
    __regex?: string;
}

export type FilterValue = {
    // options: FilterOptionsValue;
    // conditions: FilterConditionValue[];
    // combinator: FilterTypeCombinator;
};


export type ResourceMapperValue = {
    mappingMode: string;
    value: { [key: string]: string | number | boolean | null } | null;
    matchingColumns: string[];
    //schema: ResourceMapperField[];
    attemptToConvertTypes: boolean;
    convertFieldsToString: boolean;
};

export type AssignmentCollectionValue = {
    //assignments: AssignmentValue[];
};

export type NodeParameterValueType =
    // TODO: Later also has to be possible to add multiple ones with the name name. So array has to be possible
    | NodeParameterValue
    | INodeParameters
    | INodeParameterResourceLocator
    | ResourceMapperValue
    | FilterValue
    | AssignmentCollectionValue
    | NodeParameterValue[]
    | INodeParameters[]
    | INodeParameterResourceLocator[]
    | ResourceMapperValue[];

export type OnError = 'continueErrorOutput' | 'continueRegularOutput' | 'stopWorkflow';

//AI节点可使用的资源
export type AvailableResource =
    'mcp'
    | 'connect'
    | 'workflow';

export interface INodeParameters {
    [key: string]: NodeParameterValueType;
}
export interface INodeCredentials {
    [key: string]: INodeCredentialsDetails;
}
export interface INodeCredentialsDetails {
    id: string | null;
    name: string;
}

export interface IWebhookMessage {
    workflowId: string;
    body: any;
    method: string,
    url: string,
    query: string
}

export interface INode {
    node: INodeBasic;
    detail: INodeDetail;
    execute?(opts: IExecuteOptions): Promise<any | IExecuteResult>;
    first?(opts: IEnumeratorOptions): Promise<IEnumeratorData>;
    next?(opts: IEnumeratorOptions): Promise<IEnumeratorData>;
}

export interface INodeBasic {
    kind: string;
    name: string;
    catalog: CatalogType;
    version: number;
    event?: string;
    resource?: AvailableResource[];
    description: string;
    icon: Icon;
    nodeWidth?: number;
    stepMode?: StepType;
    nodeMode?: NodeType;
    executeMode?: ExecuteType;
    link?: {
        inputs?: NodeLinkType[];
        outputs?: NodeLinkType[];
    }
}

export interface INodeWebhook extends INodeBasic {
    respondData: RespondData;
}

// export type ResourceMapperTypeOptions = ResourceMapperTypeOptionsBase &
//     (ResourceMapperTypeOptionsLocal | ResourceMapperTypeOptionsExternal);

// export type FilterTypeOptions = {
//     version: 1 | 2 | {}; // required so nodes are pinned on a version
//     caseSensitive?: boolean | string; // default = true
//     leftValue?: string; // when set, user can't edit left side of condition
//     //allowedCombinators?: NonEmptyArray<FilterTypeCombinator>; // default = ['and', 'or']
//     maxConditions?: number; // default = 10
//     typeValidation?: 'strict' | 'loose' | {}; // default = strict, `| {}` is a TypeScript trick to allow custom strings (expressions), but still give autocomplete
// };

export interface IDisplayOptions {
    hide?: {
        //[key: string]: Array<NodeParameterValue | DisplayCondition> | undefined;
    };
    showBy?: {
        // '@version'?: Array<number | DisplayCondition>;
        // '@tool'?: boolean[];
        // [key: string]: Array<NodeParameterValue | DisplayCondition> | undefined;
    };
    addBy?: {
        // '@version'?: Array<number | DisplayCondition>;
        // '@tool'?: boolean[];
        // [key: string]: Array<NodeParameterValue | DisplayCondition> | undefined;
    };

    hideOnCloud?: boolean;
}

//这个干什么
export interface INodePropertyRouting {

}

export type FieldTypeMap = {
    // eslint-disable-next-line id-denylist
    boolean: boolean;
    // eslint-disable-next-line id-denylist
    number: number;
    // eslint-disable-next-line id-denylist
    string: string;
    'string-alphanumeric': string;
    dateTime: string;
    time: string;
    array: unknown[];
    object: object;
    options: any;
    url: string;
    jwt: string;
};

export type FieldType = keyof FieldTypeMap;

export interface IExecuteSingleFunctions extends BaseExecutionFunctions {
    //getInputData(inputIndex?: number, connectionType?: NodeConnectionType): INodeExecutionData;
    getItemIndex(): number;
    getNodeParameter(
        parameterName: string,
        fallbackValue?: any,
        options?: IGetNodeParameterOptions,
    ): NodeParameterValueType | object;
}

export interface INodeRequestOutput {
    maxResults?: number | string;
    postReceive?: PostReceiveAction[];
}

export type PostReceiveAction =
    | ((
        this: IExecuteSingleFunctions,
        items: INodeExecutionData[],
    ) => Promise<INodeExecutionData[]>)


export type NodeGroupType = 'input' | 'output' | 'organization' | 'schedule' | 'transform' | 'trigger';

export type CatalogType = 'trigger' | 'general' | 'AI' | 'files' | 'flow' | 'database' | 'social';

export type StepType = 'nested' | 'independent';

export type NodeType = 'action' | 'agent' | 'webhook';

export type RespondData = 'workflow-result' | 'node-result';

export type StatusType = 'RUNNING' | 'COMPLETED' | 'FAILED' | 'BREAK';

export interface IEnumeratorOptions extends IExecuteOptions {
    index?: number;
}

export interface IExecuteResult {
    data?: any;
    status: StatusType;
}

export interface IEnumeratorData {
    current?: number;
    data?: any;
    eof: boolean;
}

export interface ICatalog{
    id: CatalogType;           // 分类唯一标识符
    name: string;         // 分类名称
    description: string;  // 分类描述
    icon: string;         // 分类图标（可以是图标名称或URL）
}

export interface IAIhelp {
    enable?: boolean;    // 是否启用AI助手功能
    rules?: string;     // AI助手的提示词
}

export interface INodeTypeBaseDescription {
    displayName: string;
    name: string;
    icon?: Icon;
    group: NodeGroupType[];
    description: string;
    documentationUrl?: string;
    subtitle?: string;
    defaultVersion?: number;
    parameterPane?: 'wide';
}

export interface INodeInputFilter {
    Nodes: string[]; // Allowed nodes
}

export interface INodeInputConfiguration {
    catalog?: string;
    displayName?: string;
    required?: boolean;
    // type: NodeConnectionType;
    filter?: INodeInputFilter;
    maxConnections?: number;
}

export interface INodeOutputConfiguration {
    catalog?: 'error';
    displayName?: string;
    maxConnections?: number;
    required?: boolean;
    // type: NodeConnectionType;
}

export type ExpressionString = `=${string}`;

export interface INodeDetail {//extends INodeTypeBaseDescription {
    fields: INodeFields[];
}


// 联动配置接口
export interface IFieldLinkageConfig {
    // 依赖配置 - 当前字段依赖其他字段
    dependsOn?: string;                    // 依赖的字段名
    fetchMethod?: string;                  // 数据获取方法名 (如: 'fetchConnectDetail')
    clearOnChange?: boolean;               // 依赖字段变化时是否清空当前值
    enableWhen?: (value: any) => boolean;  // 何时启用当前字段的函数,只有满足特定条件时才允许用户操作

    // 影响配置 - 当前字段影响其他字段
    targets?: string[];                    // 影响的目标字段名列表
    trigger?: 'onChange' | 'onBlur';       // 触发时机
}

export interface INodeFields {
    displayName: string;
    name: string;
    type: NodePropertyTypes;
    default: NodeParameterValueType;
    description?: string;
    hint?: string;
    disabledOptions?: IDisplayOptions;
    displayOptions?: IDisplayOptions;
    options?: Array<INodePropertyOptions | INodeFields>; //INodePropertyCollection
    placeholder?: string;
    required?: boolean;
    // routing?: INodePropertyRouting;
    isSecure?: boolean;
    connectType?: string;//即connectID
    modes?: INodePropertyMode[];
    controlType?: string;
    // 新增：联动配置
    linkage?: IFieldLinkageConfig;
    // 类型选项配置
    typeOptions?: INodePropertyModeTypeOptions;
    // 新增：AI助手相关配置
    AIhelp?: IAIhelp;
}

export interface INodePropertyModeValidation {
    type: string;
    properties: {};
}

export interface INodePropertyModeTypeOptions {
    height?: number;
    size?: 'small' | 'medium' | 'large';
    minValue?: number;
    maxValue?: number;
    numberPrecision?: number;
    showText?: [string, string];
    password?: boolean;

    // searchListMethod?: string; // Supported by: options
    // searchFilterRequired?: boolean;
    // searchable?: boolean;
}

// 节点执行状态枚举
export enum NodeExecutionStatus {
    IDLE = 'IDLE',           // 空闲状态
    RUNNING = 'RUNNING',     // 运行中
    COMPLETED = 'COMPLETED', // 已完成
    FAILED = 'FAILED',        // 失败
    INITIAL = 'INITIAL',      // 初始状态
}

/**
 * Base description for node McpInterfaces.ts
 */
// export interface INodeTypeBaseDescription {
//   displayName: string;
//   name: string;
//   group: string[];
//   version: number;
//   description: string;
//   defaults?: {
//     name?: string;
//     color?: string;
//   };
//   inputs: string[];
//   outputs: string[];
//   icon?: string;
//   codable?: boolean;
//   hidden?: boolean;
// }

/**
 * Interface for versioned node McpInterfaces.ts
 */
export interface IVersionedNodeType {
    description: INodeTypeBaseDescription;
    execute(...args: any[]): Promise<any>;
}

export interface INodePropertyMode {
    displayName: string;
    name: string;
    type: 'string' | 'list';
    hint?: string;
    validation?: Array<
        INodePropertyModeValidation | { (this: IExecuteSingleFunctions, value: string): void }
    >;
    placeholder?: string;
    url?: string;
    //extractValue?: INodePropertyValueExtractor;
    initType?: string;
    entryTypes?: {
        [name: string]: {
            selectable?: boolean;
            hidden?: boolean;
            queryable?: boolean;
            data?: {
                request?: IHttpRequestOptions;
                output?: INodeRequestOutput;
            };
        };
    };
    //search?: INodePropertyRouting;
    typeOptions?: INodePropertyModeTypeOptions;
}

export interface IExecuteOptions {
    /**
     * The ID of the action within the workflow instance.  This is used as a reference and must
     * be unique within the Instance itself.
     *
     */
    id: string;

    /**
     * The action kind, used to look up the EngineAction definition.
     *
     */
    kind: string;

    name?: string;
    description?: string;

    /**
     * Inputs is a list of configured inputs for the EngineAction.
     *
     * The record key is the key of the EngineAction inoput name, and
     * the value is the variable's value.
     *
     * This will be type checked to match the EngineAction type before
     * save and before execution.
     *
     * Ref inputs for interpolation are "!ref($.<path>)",
     * eg. "!ref($.event.data.email)"
     */
    inputs?: Record<string, any>;
    state?: Map<string, any>;
    step?: any;
    publish?: any;
}