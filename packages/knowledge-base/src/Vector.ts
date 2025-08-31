import { VectorService } from "./types";
import { KnowledgeBaseInstance } from "./KnowledgeBaseManager";
import { LocalVectorService } from "./vectors/LocalVectorService";
import { MilvusVectorService } from "./vectors/MilvusVectorService";

export function getVectorService(kb: KnowledgeBaseInstance): VectorService {
    if (kb.config.vector.kind === "connect") {
        return new MilvusVectorService(kb);
    }

    return new LocalVectorService(kb);
}