import React, { useState, useCallback, useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import { FileUploadProps, UploadProgress, DocumentStatus } from './types';
import { APP_CONFIG, ERROR_MESSAGES } from './constants';
import { validateFile, formatFileSize, generateId } from './utils';

// Theme interface
interface Theme {
  mode: 'dark' | 'light';
}

// Styled Components with theme support
const Container = styled.div`
  width: 100%;
`;

const UploadArea = styled.div<{ $isDragOver: boolean; theme: Theme }>`
  border: 1px dashed ${props => props.$isDragOver
    ? '#3b82f6'
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#d1d5db')
  };
  border-radius: 0.5rem;
  // padding: 3rem 1.5rem;
  padding:12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: ${props => props.$isDragOver
    ? (props.theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff')
    : (props.theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f9fafb')
  };

  &:hover {
    border-color: #3b82f6;
    background-color: ${props => props.theme.mode === 'dark'
    ? 'rgba(59, 130, 246, 0.1)'
    : '#eff6ff'
  };
  }
`;

const UploadIcon = styled.div<{ theme: Theme }>`
  margin: 0 auto 1rem;
  width: 3rem;
  height: 3rem;
  color: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.6)'
    : '#6b7280'
  };

  svg {
    width: 100%;
    height: 100%;
  }
`;

const UploadText = styled.p<{ theme: Theme }>`
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#374151'};
  margin-bottom: 1rem;
`;

const UploadButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1rem;
`;

const UploadButton = styled.button<{ theme: Theme }>`
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;

  &:hover {
    background-color: #2563eb;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6, 0 0 0 4px rgba(59, 130, 246, 0.1);
  }
`;

const UploadHint = styled.p<{ theme: Theme }>`
  font-size: 0.875rem;
  color: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.7)'
    : '#6b7280'
  };
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ErrorContainer = styled.div<{ theme: Theme }>`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${props => props.theme.mode === 'dark'
    ? 'rgba(239, 68, 68, 0.1)'
    : '#fef2f2'
  };
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(239, 68, 68, 0.3)'
    : '#fecaca'
  };
  border-radius: 0.5rem;
`;

const ErrorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const ErrorTitle = styled.h4<{ theme: Theme }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#f87171' : '#991b1b'};
  margin-bottom: 0.5rem;
`;

const ErrorList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ErrorItem = styled.li<{ theme: Theme }>`
  font-size: 0.875rem;
  color: ${props => props.theme.mode === 'dark' ? '#f87171' : '#991b1b'};
  margin-bottom: 0.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ErrorCloseButton = styled.button<{ theme: Theme }>`
  color: ${props => props.theme.mode === 'dark' ? '#f87171' : '#991b1b'};
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.15s ease-in-out;

  &:hover {
    background-color: ${props => props.theme.mode === 'dark'
    ? 'rgba(239, 68, 68, 0.2)'
    : '#fecaca'
  };
  }
`;

const ProgressContainer = styled.div<{ theme: Theme }>`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.05)'
    : '#f9fafb'
  };
  border: 1px solid ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : '#e5e7eb'
  };
  border-radius: 0.5rem;
`;

const ProgressTitle = styled.h4<{ theme: Theme }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#374151'};
  margin-bottom: 0.75rem;
`;

const ProgressItem = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ProgressInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ProgressIcon = styled.div<{ theme: Theme }>`
  width: 1.25rem;
  height: 1.25rem;
  color: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.6)'
    : '#6b7280'
  };
  margin-right: 0.75rem;

  svg {
    width: 100%;
    height: 100%;
  }
`;

const ProgressDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProgressFileName = styled.span<{ theme: Theme }>`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.mode === 'dark' ? '#ffffff' : '#374151'};
`;

const ProgressStatus = styled.span<{ theme: Theme }>`
  font-size: 0.75rem;
  color: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.7)'
    : '#6b7280'
  };
`;

const ProgressStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.25rem;
`;

const ProgressStat = styled.span<{ theme: Theme }>`
  font-size: 0.75rem;
  color: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.6)'
    : '#9ca3af'
  };
`;

const ProgressCancelButton = styled.button<{ theme: Theme }>`
  color: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.6)'
    : '#6b7280'
  };
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.15s ease-in-out;

  &:hover {
    color: #ef4444;
    background-color: ${props => props.theme.mode === 'dark'
    ? 'rgba(239, 68, 68, 0.1)'
    : '#fee2e2'
  };
  }
`;

const ProgressBar = styled.div<{ theme: Theme }>`
  width: 100%;
  background-color: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : '#e5e7eb'
  };
  border-radius: 9999px;
  height: 0.5rem;
`;

const ProgressFill = styled.div<{ $progress: number; $status: DocumentStatus }>`
  height: 0.5rem;
  border-radius: 9999px;
  transition: width 0.2s ease-out, background-color 0.3s ease-in-out;
  width: ${props => props.$progress}%;
  background-color: ${props => {
    if (props.$status === DocumentStatus.FAILED) return '#ef4444';
    if (props.$status === DocumentStatus.COMPLETED) return '#10b981';
    return '#3b82f6';
  }};
  
  /* 添加一个微妙的动画效果 */
  ${props => props.$status === DocumentStatus.UPLOADING && props.$progress > 0 && props.$progress < 100 && `
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.1) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.1) 75%,
      transparent 75%,
      transparent
    );
    background-size: 1rem 1rem;
    animation: progress-animation 1s linear infinite;
  `}
  
  @keyframes progress-animation {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 1rem 0;
    }
  }
`;

const ProgressFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
`;

const ProgressPercent = styled.span<{ theme: Theme }>`
  font-size: 0.75rem;
  color: ${props => props.theme.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.7)'
    : '#6b7280'
  };
`;

const ProgressError = styled.span<{ theme: Theme }>`
  font-size: 0.75rem;
  color: ${props => props.theme.mode === 'dark' ? '#f87171' : '#dc2626'};
`;

interface FileUploadState {
  isDragOver: boolean;
  uploadProgress: Map<string, UploadProgress>;
  errors: string[];
}

export const FilesFileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  acceptedTypes = APP_CONFIG.SUPPORTED_FILE_TYPES,
  maxFileSize = APP_CONFIG.MAX_FILE_SIZE,
  multiple = true,
  knowledgeBaseId,
  onFileUpload
}) => {
  const theme = useTheme() as Theme;
  const [state, setState] = useState<FileUploadState>({
    isDragOver: false,
    uploadProgress: new Map(),
    errors: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const uploadAbortControllers = useRef<Map<string, AbortController>>(new Map());

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragOver: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragOver: false }));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState(prev => ({ ...prev, isDragOver: false }));

    const items = Array.from(e.dataTransfer.items);
    const files: File[] = [];

    // 处理拖拽的文件和文件夹
    const processItems = async () => {
      for (const item of items) {
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            await processEntry(entry, files);
          }
        }
      }
      if (files.length > 0) {
        handleFiles(files);
      }
    };

    processItems();
  }, []);

  // 递归处理文件夹条目
  const processEntry = async (entry: any, files: File[]): Promise<void> => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        entry.file((file: File) => {
          files.push(file);
          resolve();
        });
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        reader.readEntries(async (entries: any[]) => {
          for (const childEntry of entries) {
            await processEntry(childEntry, files);
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    // 重置输入值以允许选择相同文件
    if (e.target) {
      e.target.value = '';
    }
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    const fileId = generateId();
    const abortController = new AbortController();
    uploadAbortControllers.current.set(fileId, abortController);

    // 初始化进度
    const initialProgress: UploadProgress = {
      fileId,
      fileName: file.name,
      progress: 0,
      status: DocumentStatus.UPLOADING
    };

    setState(prev => ({
      ...prev,
      uploadProgress: new Map(prev.uploadProgress).set(fileId, initialProgress)
    }));

    try {
      // 调试信息
      console.log('🔧 [FileUpload] 开始上传文件:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        knowledgeBaseId: knowledgeBaseId
      });

      // 检查是否有知识库ID
      if (!knowledgeBaseId) {
        console.error('🔧 [FileUpload] 错误: 缺少知识库ID');
        throw new Error('缺少知识库ID，无法上传文件');
      }

      // 检查是否有上传函数
      if (!onFileUpload) {
        console.error('🔧 [FileUpload] 错误: 缺少上传函数');
        throw new Error('上传功能未配置，请联系管理员');
      }

      // 使用传递的上传函数
      const result = await onFileUpload(knowledgeBaseId, file, (progress) => {
        // 更新进度状态
        setState(prev => ({
          ...prev,
          uploadProgress: new Map(prev.uploadProgress).set(fileId, {
            fileId: progress.fileId,
            fileName: progress.fileName,
            progress: progress.progress,
            status: DocumentStatus.UPLOADING,
            uploadSpeed: progress.uploadSpeed,
            estimatedTimeRemaining: progress.estimatedTimeRemaining,
            uploadedBytes: progress.uploadedBytes,
            totalBytes: progress.totalBytes
          })
        }));
      });

      if (result.success) {
        // 更新为成功状态
        setState(prev => ({
          ...prev,
          uploadProgress: new Map(prev.uploadProgress).set(fileId, {
            ...initialProgress,
            progress: 100,
            status: DocumentStatus.COMPLETED
          })
        }));

        // 调用成功回调
        onUploadSuccess?.(result.fileId || fileId);

        // 3秒后移除进度条
        setTimeout(() => {
          setState(prev => {
            const newProgress = new Map(prev.uploadProgress);
            newProgress.delete(fileId);
            return { ...prev, uploadProgress: newProgress };
          });
        }, 3000);

        console.log('🔧 [FileUpload] 文件上传成功:', result);
      } else {
        throw new Error(result.error || '文件上传失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '文件上传失败';
      console.error('🔧 [FileUpload] 文件上传失败:', errorMessage);

      // 更新为失败状态
      setState(prev => ({
        ...prev,
        uploadProgress: new Map(prev.uploadProgress).set(fileId, {
          ...initialProgress,
          status: DocumentStatus.FAILED,
          error: errorMessage
        })
      }));

      // 调用错误回调
      onUploadError?.(errorMessage);

      throw error;
    } finally {
      // 清理 abort controller
      uploadAbortControllers.current.delete(fileId);
    }
  }, [knowledgeBaseId, onUploadSuccess, onUploadError, onFileUpload]);

  const handleFiles = useCallback(async (files: File[]) => {
    const newErrors: string[] = [];

    for (const file of files) {
      const validation = validateFile(file, acceptedTypes, maxFileSize);
      if (!validation.isValid) {
        newErrors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        await uploadFile(file);
      } catch (error) {
        // 错误已经在uploadFile中处理了，这里不需要额外处理
        console.error('Upload file error:', error);
      }
    }

    if (newErrors.length > 0) {
      setState(prev => ({ ...prev, errors: [...prev.errors, ...newErrors] }));
      onUploadError?.(newErrors.join('; '));
    }
  }, [acceptedTypes, maxFileSize, uploadFile, onUploadError]);

  const cancelUpload = useCallback((fileId: string) => {
    const controller = uploadAbortControllers.current.get(fileId);
    if (controller) {
      controller.abort();
      uploadAbortControllers.current.delete(fileId);
    }

    setState(prev => {
      const newProgress = new Map(prev.uploadProgress);
      newProgress.delete(fileId);
      return { ...prev, uploadProgress: newProgress };
    });
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, errors: [] }));
  }, []);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const openFolderDialog = useCallback(() => {
    folderInputRef.current?.click();
  }, []);

  const getAcceptString = useCallback(() => {
    return acceptedTypes.map(type => `.${type}`).join(',');
  }, [acceptedTypes]);

  return (
    <Container>
      {/* 上传区域 */}
      <UploadArea
        $isDragOver={state.isDragOver}
        theme={theme}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={getAcceptString()}
          onChange={handleFileSelect}
        />

        <HiddenFileInput
          ref={folderInputRef}
          type="file"
          multiple
          {...({ webkitdirectory: "" } as any)}
          onChange={handleFileSelect}
        />

        <UploadIcon theme={theme}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </UploadIcon>

        <UploadText theme={theme}>
          拖拽文件或文件夹到此处
        </UploadText>

        <UploadButtons>
          <UploadButton
            theme={theme}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openFileDialog();
            }}
          >
            选择文件
          </UploadButton>
          <UploadButton
            theme={theme}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openFolderDialog();
            }}
          >
            选择文件夹
          </UploadButton>
        </UploadButtons>

        <UploadHint theme={theme}>
          支持格式: {acceptedTypes.join(', ')} | 最大大小: {formatFileSize(maxFileSize)}
        </UploadHint>
      </UploadArea>

      {/* 错误信息 */}
      {state.errors.length > 0 && (
        <ErrorContainer theme={theme}>
          <ErrorHeader>
            <div>
              <ErrorTitle theme={theme}>上传错误</ErrorTitle>
              <ErrorList>
                {state.errors.map((error, index) => (
                  <ErrorItem key={index} theme={theme}>{error}</ErrorItem>
                ))}
              </ErrorList>
            </div>
            <ErrorCloseButton theme={theme} onClick={clearErrors}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </ErrorCloseButton>
          </ErrorHeader>
        </ErrorContainer>
      )}

      {/* 上传进度 */}
      {state.uploadProgress.size > 0 && (
        <ProgressContainer theme={theme}>
          <ProgressTitle theme={theme}>上传进度</ProgressTitle>
          {Array.from(state.uploadProgress.values()).map((progress) => (
            <UploadProgressItem
              key={progress.fileId}
              progress={progress}
              onCancel={cancelUpload}
              theme={theme}
            />
          ))}
        </ProgressContainer>
      )}
    </Container>
  );
};

// 格式化上传速度
const formatUploadSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond < 1024) {
    return `${Math.round(bytesPerSecond)} B/s`;
  } else if (bytesPerSecond < 1024 * 1024) {
    return `${Math.round(bytesPerSecond / 1024)} KB/s`;
  } else {
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  }
};

// 格式化剩余时间
const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}秒`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}分钟`;
  } else {
    return `${Math.round(seconds / 3600)}小时`;
  }
};

// 上传进度项组件
interface UploadProgressItemProps {
  progress: UploadProgress;
  onCancel: (fileId: string) => void;
  theme: Theme;
}

const UploadProgressItem: React.FC<UploadProgressItemProps> = ({
  progress,
  onCancel,
  theme
}) => {
  const canCancel = progress.status === DocumentStatus.UPLOADING;

  return (
    <ProgressItem>
      <ProgressHeader>
        <ProgressInfo>
          <ProgressIcon theme={theme}>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </ProgressIcon>
          <ProgressDetails>
            <ProgressFileName theme={theme}>{progress.fileName}</ProgressFileName>
            <ProgressStatus theme={theme}>
              {progress.status === DocumentStatus.UPLOADING && (
                progress.progress === 0 ? '准备上传...' : `上传中... ${Math.round(progress.progress)}%`
              )}
              {progress.status === DocumentStatus.PROCESSING && '处理中...'}
              {progress.status === DocumentStatus.COMPLETED && '上传完成'}
              {progress.status === DocumentStatus.FAILED && '上传失败'}
            </ProgressStatus>
            {progress.status === DocumentStatus.UPLOADING && (
              <ProgressStats>
                {progress.uploadSpeed && progress.uploadSpeed > 0 && (
                  <ProgressStat theme={theme}>
                    {formatUploadSpeed(progress.uploadSpeed)}
                  </ProgressStat>
                )}
                {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && progress.progress < 100 && (
                  <ProgressStat theme={theme}>
                    剩余 {formatTimeRemaining(progress.estimatedTimeRemaining)}
                  </ProgressStat>
                )}
                {progress.uploadedBytes && progress.totalBytes && (
                  <ProgressStat theme={theme}>
                    {formatFileSize(progress.uploadedBytes)} / {formatFileSize(progress.totalBytes)}
                  </ProgressStat>
                )}
              </ProgressStats>
            )}
          </ProgressDetails>
        </ProgressInfo>

        {canCancel && (
          <ProgressCancelButton
            theme={theme}
            onClick={() => onCancel(progress.fileId)}
            title="取消上传"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </ProgressCancelButton>
        )}
      </ProgressHeader>

      {/* 进度条 */}
      <ProgressBar theme={theme}>
        <ProgressFill
          $progress={progress.progress}
          $status={progress.status}
        />
      </ProgressBar>

      <ProgressFooter>
        <ProgressPercent theme={theme}>
          {Math.round(progress.progress)}%
        </ProgressPercent>
        {progress.error && (
          <ProgressError theme={theme}>
            {progress.error}
          </ProgressError>
        )}
      </ProgressFooter>
    </ProgressItem>
  );
};