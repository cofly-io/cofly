import { DocumentChunk } from '@repo/common';

/**
 * 文本分块服务
 * 实现智能文本分块算法，保持语义完整性
 */
export class TextChunker {
    constructor(
        private chunkSize: number,
        private chunkOverlap: number
    ) {

    }

    /**
     * 将文本分割成块
     */
    chunkText(
        text: string,
        documentId: string,
        options?: {
            chunkSize?: number;
            chunkOverlap?: number;
            preserveParagraphs?: boolean;
            preserveSentences?: boolean;
        }
    ): DocumentChunk[] {
        const chunkSize = options?.chunkSize || this.chunkSize;
        const chunkOverlap = options?.chunkOverlap || this.chunkOverlap;
        const preserveParagraphs = options?.preserveParagraphs ?? true;
        const preserveSentences = options?.preserveSentences ?? true;

        if (!text || text.trim().length === 0) {
            return [];
        }

        const cleanedText = this.preprocessText(text);

        // 如果文本很短，直接返回单个块
        if (cleanedText.length <= chunkSize) {
            return [{
                id: this.generateChunkId(documentId, 0),
                documentId,
                chunkIndex: 0,
                content: cleanedText,
                contentLength: cleanedText.length,
                startPosition: 0,
                endPosition: cleanedText.length
            }];
        }

        // 根据配置选择分块策略
        if (preserveParagraphs) {
            return this.chunkByParagraphs(cleanedText, documentId, chunkSize, chunkOverlap);
        } else if (preserveSentences) {
            return this.chunkBySentences(cleanedText, documentId, chunkSize, chunkOverlap);
        } else {
            return this.chunkByFixedSize(cleanedText, documentId, chunkSize, chunkOverlap);
        }
    }

    /**
     * 预处理文本
     */
    private preprocessText(text: string): string {
        return text
            // 标准化换行符
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            // 移除多余的空白字符，但保留段落结构
            .replace(/[ \t]+/g, ' ')
            // 移除行首行尾空白
            .replace(/^\s+|\s+$/gm, '')
            // 标准化段落分隔符
            .replace(/\n\s*\n\s*\n+/g, '\n\n')
            .trim();
    }

    /**
     * 按段落分块
     */
    private chunkByParagraphs(
        text: string,
        documentId: string,
        chunkSize: number,
        chunkOverlap: number
    ): DocumentChunk[] {
        const paragraphs = text.split(/\n\s*\n/);
        const chunks: DocumentChunk[] = [];
        let currentChunk = '';
        let currentStartPosition = 0;
        let chunkIndex = 0;

        for (let i = 0; i < paragraphs.length; i++) {
            const paragraph = paragraphs[i]?.trim();
            if (!paragraph) continue;

            const potentialChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;

            // 如果添加这个段落会超过大小限制
            if (potentialChunk.length > chunkSize && currentChunk) {
                // 保存当前块
                const chunk = this.createChunk(
                    documentId,
                    chunkIndex,
                    currentChunk,
                    currentStartPosition,
                    currentStartPosition + currentChunk.length
                );
                chunks.push(chunk);

                // 开始新块，包含重叠内容
                const overlapText = this.getOverlapText(currentChunk, chunkOverlap);
                currentChunk = overlapText ? `${overlapText}\n\n${paragraph}` : paragraph;
                currentStartPosition = currentStartPosition + currentChunk.length - (overlapText?.length || 0);
                chunkIndex++;
            } else {
                currentChunk = potentialChunk;
            }

            // 如果单个段落就超过了大小限制，需要进一步分割
            if (paragraph.length > chunkSize) {
                const sentenceChunks = this.chunkBySentences(paragraph, documentId, chunkSize, chunkOverlap);
                chunks.push(...sentenceChunks.map((chunk, idx) => ({
                    ...chunk,
                    chunkIndex: chunkIndex + idx,
                    startPosition: currentStartPosition + chunk.startPosition,
                    endPosition: currentStartPosition + chunk.endPosition
                })));
                chunkIndex += sentenceChunks.length;
                currentChunk = '';
                currentStartPosition += paragraph.length;
            }
        }

        // 添加最后一个块
        if (currentChunk.trim()) {
            const chunk = this.createChunk(
                documentId,
                chunkIndex,
                currentChunk,
                currentStartPosition,
                currentStartPosition + currentChunk.length
            );
            chunks.push(chunk);
        }

        return chunks;
    }

    /**
     * 按句子分块
     */
    private chunkBySentences(
        text: string,
        documentId: string,
        chunkSize: number,
        chunkOverlap: number
    ): DocumentChunk[] {
        // 句子分割正则表达式（支持中英文）
        const sentenceRegex = /([.!?。！？]+)\s*/g;
        const parts = text.split(sentenceRegex);
        const sentences: string[] = [];

        // 重新组合句子和标点符号
        for (let i = 0; i < parts.length; i += 2) {
            const sentence = parts[i];
            const punctuation = parts[i + 1] || '';
            if (sentence && sentence.trim()) {
                sentences.push((sentence + punctuation).trim());
            }
        }

        const chunks: DocumentChunk[] = [];
        let currentChunk = '';
        let currentStartPosition = 0;
        let chunkIndex = 0;

        for (const sentence of sentences) {
            if (!sentence.trim()) continue;

            const potentialChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;

            if (potentialChunk.length > chunkSize && currentChunk) {
                // 保存当前块
                const chunk = this.createChunk(
                    documentId,
                    chunkIndex,
                    currentChunk,
                    currentStartPosition,
                    currentStartPosition + currentChunk.length
                );
                chunks.push(chunk);

                // 开始新块，包含重叠内容
                const overlapText = this.getOverlapText(currentChunk, chunkOverlap);
                currentChunk = overlapText ? `${overlapText} ${sentence}` : sentence;
                currentStartPosition = currentStartPosition + currentChunk.length - (overlapText?.length || 0);
                chunkIndex++;
            } else {
                currentChunk = potentialChunk;
            }
            //
            // // 如果单个句子就超过了大小限制，按固定大小分割
            // if (sentence.length > chunkSize) {
            //     const fixedChunks = this.chunkByFixedSize(sentence, documentId, chunkSize, chunkOverlap);
            //     chunks.push(...fixedChunks.map((chunk, idx) => ({
            //         ...chunk,
            //         chunkIndex: chunkIndex + idx,
            //         startPosition: currentStartPosition + chunk.startPosition,
            //         endPosition: currentStartPosition + chunk.endPosition
            //     })));
            //     chunkIndex += fixedChunks.length;
            //     currentChunk = '';
            //     currentStartPosition += sentence.length;
            // }
        }

        // 添加最后一个块
        if (currentChunk.trim()) {
            const chunk = this.createChunk(
                documentId,
                chunkIndex,
                currentChunk,
                currentStartPosition,
                currentStartPosition + currentChunk.length
            );
            chunks.push(chunk);
        }

        return chunks;
    }

    /**
     * 按固定大小分块
     */
    private chunkByFixedSize(
        text: string,
        documentId: string,
        chunkSize: number,
        chunkOverlap: number
    ): DocumentChunk[] {
        const chunks: DocumentChunk[] = [];
        let startPosition = 0;
        let chunkIndex = 0;

        while (startPosition < text.length) {
            let endPosition = Math.min(startPosition + chunkSize, text.length);

            // 尝试在单词边界处分割（避免截断单词）
            if (endPosition < text.length) {
                const nextChar = text[endPosition];
                const prevChar = text[endPosition - 1];

                // 如果不是在空白字符处，向前查找最近的空白字符
                if (nextChar && prevChar && !/\s/.test(nextChar) && !/\s/.test(prevChar)) {
                    const spaceIndex = text.lastIndexOf(' ', endPosition);
                    const newlineIndex = text.lastIndexOf('\n', endPosition);
                    const boundaryIndex = Math.max(spaceIndex, newlineIndex);

                    if (boundaryIndex > startPosition) {
                        endPosition = boundaryIndex;
                    }
                }
            }

            const content = text.substring(startPosition, endPosition).trim();

            if (content) {
                const chunk = this.createChunk(
                    documentId,
                    chunkIndex,
                    content,
                    startPosition,
                    endPosition
                );
                chunks.push(chunk);
                chunkIndex++;
            }

            // 计算下一个块的起始位置（考虑重叠）
            startPosition = Math.max(startPosition + 1, endPosition - chunkOverlap);
        }

        return chunks;
    }

    /**
     * 获取重叠文本
     */
    private getOverlapText(text: string, overlapSize: number): string {
        if (overlapSize <= 0 || text.length <= overlapSize) {
            return '';
        }

        const overlapText = text.substring(text.length - overlapSize);

        // 尝试在句子或段落边界处开始重叠
        const sentenceBoundary = overlapText.search(/[.!?。！？]\s*/);
        if (sentenceBoundary > 0) {
            return overlapText.substring(sentenceBoundary + 1).trim();
        }

        // 尝试在单词边界处开始重叠
        const wordBoundary = overlapText.indexOf(' ');
        if (wordBoundary > 0) {
            return overlapText.substring(wordBoundary + 1).trim();
        }

        return overlapText.trim();
    }

    /**
     * 创建文档块
     */
    private createChunk(
        documentId: string,
        chunkIndex: number,
        content: string,
        startPosition: number,
        endPosition: number
    ): DocumentChunk {
        return {
            id: this.generateChunkId(documentId, chunkIndex),
            documentId,
            chunkIndex,
            content: content.trim(),
            contentLength: content.length,
            startPosition,
            endPosition
        };
    }

    /**
     * 生成块ID
     */
    private generateChunkId(documentId: string, chunkIndex: number): string {
        return `${documentId}_chunk_${chunkIndex}`;
    }

    /**
     * 验证分块结果
     */
    validateChunks(chunks: DocumentChunk[]): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (chunks.length === 0) {
            warnings.push('No chunks generated');
            return {isValid: true, errors, warnings};
        }

        // 检查块的连续性
        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (!chunk) {
                continue;
            }

            // 检查块索引
            if (chunk.chunkIndex !== i) {
                errors.push(`Chunk ${i} has incorrect index: ${chunk.chunkIndex}`);
            }

            // 检查块内容
            if (!chunk.content || chunk.content.trim().length === 0) {
                errors.push(`Chunk ${i} has empty content`);
            }

            // 检查位置信息
            if (chunk.startPosition >= chunk.endPosition) {
                errors.push(`Chunk ${i} has invalid position: start=${chunk.startPosition}, end=${chunk.endPosition}`);
            }

            // 检查块大小
            if (chunk.content.length > this.chunkSize * 1.2) {
                warnings.push(`Chunk ${i} is significantly larger than target size: ${chunk.content.length} > ${this.chunkSize}`);
            }

            // 检查块ID格式
            if (!chunk.id.includes(chunk.documentId)) {
                errors.push(`Chunk ${i} ID does not contain document ID`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * 获取分块统计信息
     */
    getChunkingStats(chunks: DocumentChunk[], originalText: string): {
        totalChunks: number;
        averageChunkSize: number;
        minChunkSize: number;
        maxChunkSize: number;
        totalCharacters: number;
        compressionRatio: number;
    } {
        if (chunks.length === 0) {
            return {
                totalChunks: 0,
                averageChunkSize: 0,
                minChunkSize: 0,
                maxChunkSize: 0,
                totalCharacters: 0,
                compressionRatio: 0
            };
        }

        const chunkSizes = chunks.map(chunk => chunk.content.length);
        const totalCharacters = chunkSizes.reduce((sum, size) => sum + size, 0);

        return {
            totalChunks: chunks.length,
            averageChunkSize: Math.round(totalCharacters / chunks.length),
            minChunkSize: Math.min(...chunkSizes),
            maxChunkSize: Math.max(...chunkSizes),
            totalCharacters,
            compressionRatio: originalText.length > 0 ? totalCharacters / originalText.length : 0
        };
    }

    /**
     * 优化分块大小
     */
    optimizeChunkSize(text: string, targetVectorDimension: number = 384): number {
        // 基于文本长度和向量维度估算最优块大小
        const textLength = text.length;
        const avgWordsPerChar = 0.2; // 估算每字符的单词数
        const avgTokensPerWord = 1.3; // 估算每单词的token数

        // 计算建议的块大小
        const estimatedTokens = textLength * avgWordsPerChar * avgTokensPerWord;
        const optimalTokensPerChunk = Math.min(512, targetVectorDimension);
        const suggestedChunkSize = Math.round((optimalTokensPerChunk / avgTokensPerWord) / avgWordsPerChar);

        // 确保在合理范围内
        return Math.max(500, Math.min(2000, suggestedChunkSize));
    }
}