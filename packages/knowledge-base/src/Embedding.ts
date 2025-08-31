import { EmbeddingService } from "./types";
import { KnowledgeBaseInstance } from "./KnowledgeBaseManager";
import { LocalEmbeddingService } from "./embeddings/LocalEmbeddingService";
import { RemoteEmbeddingService } from "./embeddings/RemoteEmbeddingService";

export function getEmbeddingService(kb: KnowledgeBaseInstance): EmbeddingService {
    if (kb.config.embedding.kind === "connect") {
        return new RemoteEmbeddingService(kb);
    }

    return new LocalEmbeddingService(kb);
}