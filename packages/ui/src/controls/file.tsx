"use client";

import React, { useRef, useState } from 'react';
import styled from 'styled-components';

interface FileUploadProps {
  onChange?: (file: File | null) => void;
  accept?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}

const FileContainer = styled.div`
  position: relative;
  width: 200px;
`;

const FileInput = styled.input`
  display: none;
`;

const FileButton = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 32px;
  
  &:hover {
    border-color: #40a9ff;
  }
`;

const FileName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
`;

const ClearButton = styled.span`
  margin-left: 8px;
  color: #999;
  cursor: pointer;
  
  &:hover {
    color: #666;
  }
`;

const ErrorText = styled.div`
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
`;

export const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  accept = '.pdf,.doc,.docx,.xls,.xlsx',
  placeholder = '请选择文件',
  style
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setError('');

    if (selectedFile) {
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        onChange?.(selectedFile);
      } else {
        setError('只支持PDF、Word和Excel文件');
        setFile(null);
        onChange?.(null);
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setError('');
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <FileContainer style={style}>
      <FileButton onClick={handleClick}>
        <FileName>{file ? file.name : placeholder}</FileName>
        {file && <ClearButton onClick={handleClear}>✕</ClearButton>}
      </FileButton>
      <FileInput
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </FileContainer>
  );
};