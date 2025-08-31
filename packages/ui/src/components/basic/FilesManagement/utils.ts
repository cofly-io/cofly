import React from 'react';
import { SupportedFileType, DocumentStatus } from './types';
import { APP_CONFIG, ERROR_MESSAGES } from './constants';
// Import file type icons from react-icons
import { 
  FaFilePdf, 
  FaFileWord, 
  FaFileExcel, 
  FaFilePowerpoint, 
  FaFileAlt, 
  FaFileCode,
  FaFileImage,
  FaFileVideo,
  FaFileAudio,
  FaFileArchive,
  FaFile
} from 'react-icons/fa';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// 验证文件
export const validateFile = (
  file: File,
  acceptedTypes: SupportedFileType[] = APP_CONFIG.SUPPORTED_FILE_TYPES,
  maxFileSize: number = APP_CONFIG.MAX_FILE_SIZE
): ValidationResult => {
  // 检查文件大小
  if (file.size > maxFileSize) {
    return {
      isValid: false,
      error: `${ERROR_MESSAGES.FILE_TOO_LARGE} (最大 ${formatFileSize(maxFileSize)})`
    };
  }

  // 检查文件类型
  const fileExtension = getFileExtension(file.name);
  if (!acceptedTypes.includes(fileExtension as SupportedFileType)) {
    return {
      isValid: false,
      error: `${ERROR_MESSAGES.UNSUPPORTED_FORMAT} (支持: ${acceptedTypes.join(', ')})`
    };
  }

  return { isValid: true };
};

// 获取文件扩展名
export const getFileExtension = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  return fileName.substring(lastDotIndex + 1).toLowerCase();
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 格式化日期
export const formatFilesDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

// 获取状态样式
export const getStatusStyle = (status: DocumentStatus): string => {
  const styles = {
    [DocumentStatus.UPLOADING]: 'bg-blue-100 text-blue-800',
    [DocumentStatus.PROCESSING]: 'bg-yellow-100 text-yellow-800',
    [DocumentStatus.COMPLETED]: 'bg-green-100 text-green-800',
    [DocumentStatus.FAILED]: 'bg-red-100 text-red-800'
  };
  return styles[status] || 'bg-gray-100 text-gray-800';
};

// 获取状态文本
export const getStatusText = (status: DocumentStatus): string => {
  const texts = {
    [DocumentStatus.UPLOADING]: '上传中',
    [DocumentStatus.PROCESSING]: '处理中',
    [DocumentStatus.COMPLETED]: '已完成',
    [DocumentStatus.FAILED]: '失败'
  };
  return texts[status] || status;
};

// 获取文件图标
export const getFileIcon = (fileType: string): React.ReactElement => {
  const type = fileType.toLowerCase();
  
  // PDF files
  if (type === 'pdf') {
    return React.createElement(FaFilePdf, { style: { color: '#e53e3e' } });
  }
  
  // Word documents
  if (['doc', 'docx'].includes(type)) {
    return React.createElement(FaFileWord, { style: { color: '#2b6cb0' } });
  }
  
  // Excel files
  if (['xls', 'xlsx', 'csv'].includes(type)) {
    return React.createElement(FaFileExcel, { style: { color: '#38a169' } });
  }
  
  // PowerPoint files
  if (['ppt', 'pptx'].includes(type)) {
    return React.createElement(FaFilePowerpoint, { style: { color: '#d69e2e' } });
  }
  
  // Text files
  if (['txt', 'md', 'rtf'].includes(type)) {
    return React.createElement(FaFileAlt, { style: { color: '#718096' } });
  }
  
  // Code files
  if (['json', 'xml', 'html', 'css', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'php'].includes(type)) {
    return React.createElement(FaFileCode, { style: { color: '#805ad5' } });
  }
  
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(type)) {
    return React.createElement(FaFileImage, { style: { color: '#ed8936' } });
  }
  
  // Video files
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(type)) {
    return React.createElement(FaFileVideo, { style: { color: '#e53e3e' } });
  }
  
  // Audio files
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(type)) {
    return React.createElement(FaFileAudio, { style: { color: '#38b2ac' } });
  }
  
  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(type)) {
    return React.createElement(FaFileArchive, { style: { color: '#a0aec0' } });
  }
  
  // Default file icon
  return React.createElement(FaFile, { style: { color: '#718096' } });
};

// 生成唯一ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};