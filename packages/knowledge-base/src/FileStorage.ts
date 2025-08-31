import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * 文件存储服务
 * 处理文件的基本存储操作
 */
export class FileStorage {
  private uploadDir: string;
  private tempDir: string;

  constructor(uploadDir: string = './uploads') {
    this.uploadDir = uploadDir;
    this.tempDir = path.join(uploadDir, 'temp');
  }

  /**
   * 初始化存储目录
   */
  async initializeDirectories(): Promise<void> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    await fs.mkdir(this.tempDir, { recursive: true });
  }

  /**
   * 生成文件校验和
   */
  async generateChecksum(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * 保存文件到临时目录
   */
  async saveTemporaryFile(fileBuffer: Buffer, fileName: string): Promise<string> {
    await this.initializeDirectories();
    const tempFilePath = path.join(this.tempDir, fileName);
    await fs.writeFile(tempFilePath, fileBuffer);
    return tempFilePath;
  }

  /**
   * 移动文件到最终位置
   */
  async moveToFinalLocation(tempFilePath: string): Promise<string> {
    const fileName = path.basename(tempFilePath);
    const finalPath = path.join(this.uploadDir, fileName);
    await fs.rename(tempFilePath, finalPath);
    return finalPath;
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // 如果文件不存在，不抛出错误
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(filePath: string): Promise<{ size: number; mtime: Date }> {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      mtime: stats.mtime
    };
  }

  /**
   * 检查文件是否存在
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 清理过期的临时文件
   */
  async cleanupTemporaryFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await this.deleteFile(filePath);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup temporary files:', error);
    }
  }
}

// 导出单例实例
export const fileStorage = new FileStorage();