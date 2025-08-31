import { DocumentSearchQuery, knowledgeBaseManager } from "@repo/knowledge-base";
import * as fs from 'fs';
import { init } from "./init";

async function test() {

    await init();

    const kbs = await knowledgeBaseManager.list();
    if(kbs.length === 0) {
        throw new Error("cannot found kb");
    }

    const kb = await knowledgeBaseManager.get(kbs[0].id);

    const query: DocumentSearchQuery = {
        query: "换句话说，不要让自己陷入few-shot的窠臼。 你的上下文越单一",
    };

    const result = await kb.searchDocuments(query)
    console.log(result);
}

test();