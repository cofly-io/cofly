import { SupportedFileType } from './types';

export const APP_CONFIG = {
  SUPPORTED_FILE_TYPES: [
    SupportedFileType.TXT,
    SupportedFileType.DOC,
    SupportedFileType.DOCX,
    SupportedFileType.PDF,
    SupportedFileType.XLS,
    SupportedFileType.XLSX,
    SupportedFileType.PPT,
    SupportedFileType.PPTX,
    SupportedFileType.MD,
    SupportedFileType.JSON,
    SupportedFileType.CSV
  ],
  MAX_FILE_SIZE: 1024 * 1024 * 1024, // 1G
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for upload
  MAX_CONCURRENT_UPLOADS: 3
};

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: '文件大小超过限制',
  UNSUPPORTED_FORMAT: '不支持的文件格式',
  UPLOAD_FAILED: '文件上传失败',
  NETWORK_ERROR: '网络错误，请重试',
  PROCESSING_FAILED: '文件处理失败'
};

export const SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: '文件上传成功',
  DELETE_SUCCESS: '文件删除成功',
  BATCH_OPERATION_SUCCESS: '批量操作完成'
};

export const FILE_ICONS: Record<string, string> = {
  pdf: '📄',
  doc: '📝',
  docx: '📝',
  xls: '📊',
  xlsx: '📊',
  ppt: '📽️',
  pptx: '📽️',
  txt: '📄',
  md: '📝',
  json: '🔧',
  csv: '📊'
};

export const STATUS_COLORS = {
  uploading: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
};

export const STATUS_TEXT = {
  uploading: '上传中',
  processing: '处理中',
  completed: '已完成',
  failed: '失败'
};