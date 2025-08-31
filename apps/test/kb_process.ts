import { knowledgeBaseManager } from "@repo/knowledge-base";
import * as fs from 'fs';
import { init } from "./init";

async function test() {

    await init();

    const kbs = await knowledgeBaseManager.list();
    if(kbs.length === 0) {
        throw new Error("cannot found kb");
    }

    const kb = await knowledgeBaseManager.get(kbs[0].id);
    const buffer = fs.readFileSync("./what-is-context-engineering.docx");
    const file = new File([buffer], 'what-is-context-engineering.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});

    const result = await kb.processFile(file);
    console.log(result);
}

test();