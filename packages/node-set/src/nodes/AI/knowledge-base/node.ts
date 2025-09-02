import { INode, INodeBasic, ToolMode, INodeDetail, IExecuteOptions } from '@repo/common';
import { AgentInvokeOptions, mcpManager, AgentInstance, TextMessage, agentManager } from "@repo/engine";
import { credentialManager } from '@repo/common';

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
                name: 'connectid',
                type: 'string',
                default: '',
                required: true,
                connectType: "kb",
                controlType: 'selectconnect',
            }
        ]
    };

    async execute(opts: IExecuteOptions): Promise<any> {
       
        // 如果没有找到预期的数据结构，返回空对象或原始结果
        return null;
    }
}