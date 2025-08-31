'use client';
import React from 'react';
import AceEditor from 'react-ace';

// 引入SQL语法高亮支持
import 'ace-builds/src-noconflict/mode-sql';
// 引入编辑器主题
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/ext-language_tools';

interface SQLEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
  width?: string;
}

// SQL编辑器组件
export const SQLText: React.FC<SQLEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  height = '200px',
  width = '100%'
}) => {
  return (
    <AceEditor
      mode="sql"
      theme="github"
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      fontSize={14}
      showPrintMargin={false}
      showGutter={true}
      highlightActiveLine={true}
      width={width}
      height={height}
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
      }}
    />
  );
};

export default SQLText;
