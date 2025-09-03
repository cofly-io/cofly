// 显式导出所有来自 @cofly-ai/interfaces 的类型和对象
// 这样可以避免模块重新导出时的问题

// 常量导出
export { 
    NodeLink,
    Symbols,
    CredentialDef,
    PluginDef,
    WorkflowDef,
    AbstractConnectLoader,
    NodeExecutionStatus,
    ConnectCategory,
    KnowledgeBaseDef,
    DocumentStatus,
    DocumentSortDirection,
    ModelSeries
} from "@cofly-ai/interfaces";

// 本地定义的常量
export { McpDef } from "./McpInterfaces";
export { TeamDef } from "./TeamInterfaces";

// 本地定义的类型
export type { AgentConfig, ModelInfo } from "./AgentInterfaces";
export type { McpData, McpListOptions, IMcpLoader } from "./McpInterfaces";
export type { TeamConfig, TeamMemberConfig, TeamData, TeamListOptions, ITeamLoader } from "./TeamInterfaces";

export {
    ErrorType,
    AppError,
    SupportedFileType,
} from '@cofly-ai/interfaces'

// 类型导出
export type {
    // 系统接口
    ApiResponse,
    UploadProps,
    UploadResponse,
    UploadProgress,
    ValidationResult,

    //系统数据操作状态
    ToastType,

    // ToastType,
    // AI 相关类型
    AiEvent,
    
    // 赋值相关类型
    AssignmentCollectionValue,
    // AssignmentTypeOptions,
    
    // 二进制数据类型
    BinaryFileType,
    IBinaryData,
    IBinaryKeyData,
    
    // 分类相关类型
    CatalogType,
    ICatalog,
        
    IAIhelp,
    // 连接相关类型
    ConnectStatus,
    ConnectTestResult,
    ConnectType,
    IConnect,
    IConnectBasic,
    ConnectCategoryType,
    IConnectDetail,
    IConnectFactory,
    IConnectField,
    IConnectInstance,
    IConnectLoaderConfig,
    IConnectRegistry,
    
    // 上下文相关类型
    ContextType,
    IContextObject,
    
    // 凭证相关类型
    CredentialData,
    CredentialInformation,
    CredentialListOptions,
    ICredentialDataDecryptedObject,
    ICredentialLoader,
    
    // 数据库相关类型
    DatabaseFeature,
    IDatabaseMetadataOptions,
    IDatabaseMetadataResult,
    IDatabaseExecutionOptions,
    IDatabaseExecutionResult,
    IDatabaseConnect,
    IDatabaseConnectConfig,
    IOtherConnect,
    
    // 社交相关类型
    ISocialConnect,
       
    // 确保类型选项
    EnsureTypeOptions,
    
    // 执行相关类型
    IExecuteData,
    IExecuteResult,
    IExecuteOptions,
    IExecuteSingleFunctions,
    
    // 表达式相关类型
    ExpressionString,
    
    // 字段相关类型
    FieldType,
    FieldTypeMap,
    IFieldLinkageConfig,
    
    FilterValue,
    
    // 函数相关类型
    FunctionsBase,
    
    // 通用值类型
    GenericValue,
    
    // HTTP 相关类型
    HttpAuthType,
    HttpMethod,
    IHttpConnect,
    IHttpConnectConfig,
    IHttpRequestMethods,
    IHttpRequestOptions,
    
    // 图标相关类型
    Icon,
    IconName,
    
    // 数据对象类型
    IDataObject,
    
    // 显示选项类型
    IDisplayOptions,
    
    // 枚举器相关类型
    IEnumeratorData,
    IEnumeratorOptions,
    
    // 获取节点参数选项
    IGetNodeParameterOptions,
    
    // LLM 相关类型
    ILLMMetadataOptions,
    ILLMMetadataResult,
    ILLMExecuteOptions,
    ILLMExecuteResult,
    ILLMConnect,
    ILLMConnectConfig,
    ILLMOverview,
    LLMFeature,
    LLMModel,
    LLMModelType,
    LLMProvider,
       
    // 节点相关类型
    INode,
    INodeBasic,
    INodeWebhook,
    INodeCredentials,
    INodeCredentialsDetails,
    INodeDetail,
    INodeExecutionData,
    INodeFields,
    INodeInputConfiguration,
    INodeInputFilter,
    INodeOutputConfiguration,
    INodeParameterResourceLocator,
    INodeParameters,
    // INodePropertyCollection,
    INodePropertyMode,
    INodePropertyModeTypeOptions,
    INodePropertyModeValidation,
    INodePropertyOptions,
    INodePropertyRouting,
    //INodePropertyTypeOptions,
    INodeRequestOutput,
    INodeTypeBaseDescription,
    INodes,
    IWebhookMessage,
    NodeGroupType,
    NodeLinkType,
    AvailableResource,
    NodeParameterValue,
    NodeParameterValueType,
    NodePropertyTypes,
    NodeTestResults,
    NodeTypeAndVersion,
    StepType,
    NodeType,
    StatusType,
    
    // 可观察对象类型
    IObservableObject,
    
    // 错误处理类型
    OnError,
    
    // 配对项数据类型
    IPairedItemData,
    
    // Pin 数据类型
    IPinData,
    
    // 插件相关类型
    IPluginLoader,
    PluginData,
    PluginListOptions,
    
    // 后接收动作类型
    PostReceiveAction,
    
    // 代理输入类型
    ProxyInput,
    
    // 相关执行类型
    RelatedExecution,
    
    // 请求选项类型
    IRequestOptionsSimplifiedAuth,
    
    // 资源定位器相关类型
    IResourceLocatorResult,
    ResourceLocatorModes,
    ResourceMapperTypeOptionsExternal,
    ResourceMapperTypeOptionsLocal,
    ResourceMapperValue,

    // 源数据类型
    ISourceData,
    
    // 任务相关类型
    ITaskDataConnections,
    ITaskDataConnectionsSource,
    ITaskMetadata,
    ITaskSubRunMetadata,
    
    // 测试结果类型
    TestResult,
    
    // 主题相关类型
    Themed,
    
    // 版本化节点类型
    IVersionedNodeType,
    
    // 工作流相关类型
    IWorkflowDataProxyData,
    IWorkflowLoader,
    IWorkflowMetadata,
    WorkflowActivateMode,
    WorkflowConfig,
    WorkflowData,
    WorkflowExecuteMode,
    WorkflowListOptions,
    // 日志相关类型
    // LogLevel,
    // LogLocationMetadata,
    // LogMetadata,
    // Logger

    // 知识库相关类型
    DocumentChunk,
    DocumentMetadata,
    DocumentProcessingStatus,
    DocumentBatchOperation,
    DocumentBatchOperationResult,
    DocumentSearchQuery,
    DocumentSearchFilters,
    DocumentSearchResult,
    DocumentSearchResponse,
    ProcessingResult,
    ProcessedDocumentMetadata,
    VectorData,
    KnowledgeBaseMetadata,
    KnowledgeBaseHealth,
    IKnowledgeBaseLoader,
    IKnowledgeBaseInstance
} from "@cofly-ai/interfaces";