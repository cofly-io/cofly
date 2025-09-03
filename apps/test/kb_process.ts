import { knowledgeBaseManager } from "@repo/common";
import * as fs from 'fs';
import { init } from "./init";

async function test() {

    await init();

    const kbs = await knowledgeBaseManager.mediator?.list();
    if(!kbs || kbs.length === 0) {
        throw new Error("cannot found kb");
    }

    const kb = await knowledgeBaseManager.mediator?.get(kbs[0].id);
    if(!kb) {
        throw new Error("cannot found kb");
    }

    const buffer = fs.readFileSync("./what-is-context-engineering.docx");
    const file = new File([buffer], 'what-is-context-engineering.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});

    const result = await kb.processFile(file);
    console.log(result);
}

test();