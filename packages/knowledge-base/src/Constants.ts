export const DefaultConfig = {
    DATABASE_NAME: "default",
    COLLECTION_NAME: "cofly_knowledge_base",
    PROCESSOR_MODEL: "internal",
    VECTOR_KIND: "milvus-cli",
    EMBEDDING_MODEL: "all-MiniLM-L6-v2",
    EMBEDDING_DIMENSION: 384,
    DOCUMENT_COUNT: 5,
    CHUNK_SIZE: 1000,
    CHUNK_OVERLAP: 200,
    MAX_RETRIES: 3,
    BATCH_SIZE: 32,
    TIMEOUT: 30000, // 30 seconds
    RETRY_DELAY: 1000,
    BACKOFF_MULTIPLIER: 2,
    DEFAULT_TOPK: 10,
    MAX_TOPK: 100,
    DEFAULT_THRESHOLD: 0.5,
    CACHE_ENABLED: true,
    CACHE_TTL: 5 * 60 * 1000, // 5 MINUTES
    HIGHLIGHT_ENABLED: true,
    RERANKER_MODEL: "none",
    STORAGE_DIR_BASE: "../.storages/",
    MODEL_DIR_BASE: "../.models/"
}