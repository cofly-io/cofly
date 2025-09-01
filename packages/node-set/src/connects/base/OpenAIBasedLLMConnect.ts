import { BaseLLMConnect } from "./BaseLLMConnect";
import { ILLMExecuteOptions, ILLMExecuteResult } from "@repo/interfaces/src";
import { urlJoin } from "../../utils/url-join";

export abstract class OpenAIBasedLLMConnect extends BaseLLMConnect {

    async execute(opts: ILLMExecuteOptions) : Promise<ILLMExecuteResult> {

        if(!opts.connectInfo) {
            return {
                success: false,
                message: `Connection cannot be null`
            }
        }

        if(opts.modelType === 'chat') {
            return this.executeForChat(opts);
        } else if(opts.modelType === 'embedding' || opts.modelType === 'embeddings') {
            return this.executeForEmbedding(opts);
        } else if(opts.modelType === 'reranker' || opts.modelType === 'rerank') {
            return this.executeForReranker(opts);
        }

        return {
            success: false,
            message: "model type not supported"
        }
    }

    private async executeForChat(opts: ILLMExecuteOptions): Promise<ILLMExecuteResult> {
        return this.fetchData(opts, this.overview.api.chat || "chat/completions");
    }

    private async executeForEmbedding(opts: ILLMExecuteOptions): Promise<ILLMExecuteResult> {
        return this.fetchData(opts, this.overview.api.embedding || "embeddings");
    }

    private async executeForReranker(opts: ILLMExecuteOptions): Promise<ILLMExecuteResult> {
        return this.fetchData(opts, this.overview.api.reranker || "rerank");
    }

    private async fetchData(opts: ILLMExecuteOptions, api: string) {

        const apiUrl = urlJoin(opts.connectInfo?.baseUrl ?? this.overview.api.url, api);
        return fetch(apiUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${opts.connectInfo?.apiKey}`
            },
            body: opts.input,
        })
    }
}