import { KnowledgeBaseDef, IKnowledgeBaseLoader } from "@cofly-ai/interfaces";
import { BaseContainer } from "./BaseContainer";

class KnowledgeBaseManager extends BaseContainer<IKnowledgeBaseLoader> {
}

export const knowledgeBaseManager = new KnowledgeBaseManager(KnowledgeBaseDef.identifier);