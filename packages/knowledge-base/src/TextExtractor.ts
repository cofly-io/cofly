import { promises as fs } from 'fs';
import path from 'path';
import { SupportedFileType, ErrorType, AppError } from '@repo/common';

// Lazy load PDF parser to avoid initialization issues
let pdfParse: any = null;
const getPdfParse = async () => {
    if (!pdfParse) {
        try {
            pdfParse = await import("pdfjs-dist/legacy/build/pdf.mjs");
        } catch (error) {
            console.warn('pdf-parse not available:', error);
            pdfParse = null;
        }
    }
    return pdfParse;
};

// Word extraction (basic implementation)
let wordParse: any = null;
const getWordParse = async () => {
    if (!wordParse) {
        try {
            const { default: mammoth } = await import("mammoth");
            wordParse = mammoth;
        } catch (error) {
            console.warn('pdf-parse not available:', error);
            wordParse = null;
        }
    }
    return wordParse;
};

// PowerPoint extraction (basic implementation)
let pptParse: any = null;
const getPptParse = async () => {
    if (!pptParse) {
        try {
            const { default: PptxParser } = await import("node-pptx-parser");
            pptParse = PptxParser;
        } catch (error) {
            console.warn('pptx2json not available:', error);
            pptParse = null;
        }
    }
    return pptParse;
};


// Excel extraction (basic implementation)
let excelParse: any = null;
const getExcelParse = async () => {
    if (!excelParse) {
        try {
            const xlsx = await import('xlsx');
            xlsx.set_fs(fs);
            excelParse = xlsx;
        } catch (error) {
            console.warn('pptx2json not available:', error);
            excelParse = null;
        }
    }
    return excelParse;
};

/**
 * 文本提取服务
 * 支持多种文档格式的文本提取
 */
export class TextExtractor {

    /**
     * 从文件中提取文本内容
     */
    async extractText(filePath: string, fileType: SupportedFileType): Promise<string> {
        try {
            switch (fileType) {
                case SupportedFileType.TXT:
                    return await this.extractFromTxt(filePath);
                case SupportedFileType.PDF:
                    return await this.extractFromPdf(filePath);
                case SupportedFileType.DOC:
                case SupportedFileType.DOCX:
                    return await this.extractFromWord(filePath);
                case SupportedFileType.XLS:
                case SupportedFileType.XLSX:
                    return await this.extractFromExcel(filePath);
                case SupportedFileType.PPT:
                case SupportedFileType.PPTX:
                    return await this.extractFromPowerPoint(filePath);
                default:
                    throw new Error(`Unsupported file type: ${fileType}`);
            }
        } catch (error) {
            const appError: AppError = {
                type: ErrorType.EXTRACTION_FAILED,
                message: `Failed to extract text from ${fileType} file: ${error instanceof Error ? error.message : 'Unknown error'}`,
                timestamp: new Date(),
                details: {filePath, fileType, originalError: error}
            };
            throw appError;
        }
    }

    /**
     * 从 TXT 文件提取文本
     */
    private async extractFromTxt(filePath: string): Promise<string> {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return this.cleanText(content);
        } catch (error) {
            throw new Error(`Failed to read TXT file: ${error}`);
        }
    }

    /**
     * 从 PDF 文件提取文本
     */
    private async extractFromPdf(filePath: string): Promise<string> {
        try {
            const pdfParser = await getPdfParse();
            const data = new Uint8Array(await fs.readFile(filePath));
            const pdfDoc = await pdfParser.getDocument({data}).promise;

            let fullText = "";

            // 遍历每一页
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const content = await page.getTextContent();

                fullText += content.items.map((item : any) => item.str).join(" ");
            }

            return this.cleanText(fullText);
        } catch (error) {
            throw new Error(`Failed to extract text from PDF: ${error}`);
        }
    }

    /**
     * 从 Word 文档提取文本 (DOC/DOCX)
     */
    private async extractFromWord(filePath: string): Promise<string> {
        try {
            const worldParse = await getWordParse()
            const result = await worldParse.extractRawText({path: filePath});

            if (result.messages && result.messages.length > 0) {
                console.warn('Word extraction warnings:', result.messages);
            }

            return this.cleanText(result.value);
        } catch (error) {
            throw new Error(`Failed to extract text from Word document: ${error}`);
        }
    }

    /**
     * 从 Excel 文件提取文本 (XLS/XLSX)
     */
    private async extractFromExcel(filePath: string): Promise<string> {
        try {
            const xlsx = await getExcelParse();
            const data = await fs.readFile(filePath);
            const workbook = xlsx.read(data, { type: "buffer" });
            let allText = '';

            // 遍历所有工作表
            workbook.SheetNames.forEach((sheetName : any) => {
                const worksheet = workbook.Sheets[sheetName];
                if (!worksheet) {
                    return;
                }
                const sheetData = xlsx.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: ''
                }) as string[][];

                // 添加工作表名称
                allText += `\n=== ${sheetName} ===\n`;

                // 提取所有单元格文本
                sheetData.forEach(row => {
                    const rowText = row
                        .filter(cell => cell && cell.toString().trim() !== '')
                        .join(' | ');
                    if (rowText) {
                        allText += rowText + '\n';
                    }
                });
            });

            return this.cleanText(allText);
        } catch (error) {
            throw new Error(`Failed to extract text from Excel file: ${error}`);
        }
    }

    /**
     * 从 PowerPoint 文件提取文本 (PPT/PPTX)
     */
    private async extractFromPowerPoint(filePath: string): Promise<string> {
        try {
            // 对于 PPTX 文件，使用 pptx2json
            if (path.extname(filePath).toLowerCase() === '.pptx') {
                return await this.extractFromPptx(filePath);
            } else {
                // 对于 PPT 文件，目前返回基本信息
                // 在生产环境中，可能需要更专业的库来处理旧格式
                return `PowerPoint 文档 (${path.basename(filePath)}) - 需要转换为 PPTX 格式以提取完整文本内容`;
            }
        } catch (error) {
            throw new Error(`Failed to extract text from PowerPoint: ${error}`);
        }
    }

    /**
     * 从 PPTX 文件提取文本
     */
    private async extractFromPptx(filePath: string): Promise<string> {
        try {
            const pptxParser = await getPptParse();
            if (!pptxParser) {
                return `PowerPoint 演示文稿 (${path.basename(filePath)}) - PPTX 解析器不可用`;
            }

            const slides = await (new pptxParser(filePath)).extractText(filePath);
            let allText = '';

            slides.forEach((slide: any, index: number) => {
                allText += `\n=== 幻灯片 ${index + 1} ===\n`;
                allText += slide.text;
            });

            return this.cleanText(allText);
        } catch (error) {
            // 如果 pptx2json 失败，尝试基本的文件信息提取
            console.warn('PPTX extraction failed, using fallback method:', error);
            return `PowerPoint 演示文稿 (${path.basename(filePath)}) - 文本提取遇到问题，请检查文件格式`;
        }
    }

    /**
     * 清理和预处理文本
     */
    private cleanText(text: string): string {
        if (!text) return '';

        return text
            // 移除特殊控制字符
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            // 标准化换行符
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            // 压缩多个空格为单个空格，但保留换行
            .replace(/[ \t]+/g, ' ')
            // 移除行首行尾空白
            .replace(/^\s+|\s+$/gm, '')
            // 移除多余的换行符（3个或更多连续换行变为2个）
            .replace(/\n\s*\n\s*\n+/g, '\n\n')
            // 确保文本不为空
            .trim();
    }

    /**
     * 验证提取的文本内容
     */
    validateExtractedText(text: string): { isValid: boolean; error?: string } {
        if (!text || text.trim().length === 0) {
            return {
                isValid: false,
                error: '提取的文本内容为空'
            };
        }

        if (text.length < 10) {
            return {
                isValid: false,
                error: '提取的文本内容过短，可能提取失败'
            };
        }

        // 检查是否包含过多的特殊字符（可能表示提取失败）
        const specialCharRatio = (text.match(/[^\w\s\u4e00-\u9fa5]/g) || []).length / text.length;
        if (specialCharRatio > 0.5) {
            return {
                isValid: false,
                error: '提取的文本包含过多特殊字符，可能提取失败'
            };
        }

        return {isValid: true};
    }

    /**
     * 获取文本预览（前N个字符）
     */
    getTextPreview(text: string, maxLength: number = 500): string {
        if (!text) return '';

        const cleanedText = this.cleanText(text);
        if (cleanedText.length <= maxLength) {
            return cleanedText;
        }

        // 在单词边界处截断
        const truncated = cleanedText.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');

        if (lastSpaceIndex > maxLength * 0.8) {
            return truncated.substring(0, lastSpaceIndex) + '...';
        }

        return truncated + '...';
    }

    /**
     * 检测文本语言（简单实现）
     */
    detectLanguage(text: string): 'zh' | 'en' | 'mixed' | 'unknown' {
        if (!text || text.length < 10) return 'unknown';

        const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
        const totalChars = chineseChars + englishChars;

        if (totalChars === 0) return 'unknown';

        const chineseRatio = chineseChars / totalChars;
        const englishRatio = englishChars / totalChars;

        if (chineseRatio > 0.7) return 'zh';
        if (englishRatio > 0.7) return 'en';
        if (chineseRatio > 0.2 && englishRatio > 0.2) return 'mixed';

        return 'unknown';
    }

    /**
     * 获取文本统计信息
     */
    getTextStats(text: string): {
        characterCount: number;
        wordCount: number;
        lineCount: number;
        language: string;
    } {
        if (!text) {
            return {
                characterCount: 0,
                wordCount: 0,
                lineCount: 0,
                language: 'unknown'
            };
        }

        const cleanedText = this.cleanText(text);

        return {
            characterCount: cleanedText.length,
            wordCount: cleanedText.split(/\s+/).filter(word => word.length > 0).length,
            lineCount: cleanedText.split('\n').length,
            language: this.detectLanguage(cleanedText)
        };
    }
}

// 导出单例实例
export const textExtractor = new TextExtractor();