import {
    AppError,
    DocumentSearchQuery,
    DocumentSearchResponse,
    ErrorType,
    IExecuteOptions,
    INode,
    INodeBasic,
    INodeDetail,
    knowledgeBaseManager
} from '@repo/common';

export class KnowledgeBase implements INode {
    node: INodeBasic = {
        kind: "knowledge-base",
        name:"知识库",
        icon: 'knowledge-base.svg',
        catalog: 'AI',
        "version": 1,
        nodeWidth: 600,
        description: "AI可用到的知识库"
    };
    detail: INodeDetail = {
        fields: [
            {
                displayName: '知识库',
                name: 'kbConfig',
                type: 'string',
                default: '',
                required: true,
                connectType: "kb",
                controlType: 'selectconnect',
            },
            {
                displayName: '查询',
                name: 'query',
                type: 'string',
                default: '',
                required: true,
                placeholder: '请输入您要查询的内容',
                controlType: 'textarea',
            },
            {
                displayName: 'topK',
                name: 'topK',
                type: 'number',
                placeholder: '',
                default: 5,
                controlType: 'input'
            },
            {
                displayName: '匹配度',
                name: 'threshold',
                type: 'string',
                placeholder: '',
                default: 0.5,
                controlType: 'input'
            },
        ]
    };

    async execute(opts: IExecuteOptions): Promise<any> {

        const { kbConfig, query } = opts.inputs as any;
        const kbId = JSON.parse(kbConfig || "{}")?.id || '';
        if(!kbId || !query) {
            return {
                results: [],
                totalCount: 0,
                queryTime: 0,
                query,
                error: new AppError(ErrorType.VALIDATION_ERROR, 'Invalid parameters')
            } as DocumentSearchResponse
        }

        const kb = await knowledgeBaseManager.mediator?.get(kbId);
        if(!kb) {
            return {
                results: [],
                totalCount: 0,
                queryTime: 0,
                query,
                error: new AppError(ErrorType.NOT_FOUND_ERROR, 'Knowledge base not found')
            } as DocumentSearchResponse
        }

        const { topK, threshold: matchThreshold } = opts.inputs as any;
        const threshold = Number.parseFloat(matchThreshold);
        if(threshold < -1 || threshold > 1) {
            return {
                results: [],
                totalCount: 0,
                queryTime: 0,
                query,
                error: new AppError(ErrorType.VALIDATION_ERROR, 'Invalid parameter threshold, should between -1 ~ 1, got: ' + matchThreshold)
            } as DocumentSearchResponse
        }
        const search = {
            query, topK, threshold
        } as DocumentSearchQuery;

        return kb.searchDocuments(search);
    }
}