import { knowledgeBaseManager } from "@repo/common";
import { init } from "./init";

async function test() {

    await init();

    const kb = await knowledgeBaseManager.mediator?.get("cmf3w1agn0001u3407kd31s3d");
    if(!kb) {
        throw new Error("cannot found kb");
    }

    const result = await kb.deleteDocument("5cb3ab7c-67d5-4392-8479-7bde7205b8a3")
    console.log(result);
}

test();