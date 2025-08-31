import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  CloseButton,
  TabContent,
  FormButtonGroup,
  PremiumModalContainer,
  PremiumTitleDesc,
  PremiumFormSection,
  PremiumFormLabel,
  PremiumFormField,
  PremiumFormInput,
  PremiumFormTextArea,
  PremiumFormSelect,
  PremiumFormButton,
  // EnhancedFormButtonGroup
} from '../basic';
import { useToast, ToastManager } from '../basic/LiquidToast';

interface McpConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => Promise<boolean>;
  editMode?: boolean;
  editData?: any;
  mode?: 'quick' | 'json';
}

export const McpConfigModal: React.FC<McpConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editMode = false,
  editData,
  mode = 'quick'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'stdio',
    command: '',
    args: '',
    env: '',
    url: '',
    headers: ''
  });
  
  const [jsonValue, setJsonValue] = useState(`{
  "name": "example-mcp-server",
  "description": "示例MCP服务器",
  "command": "uvx",
  "args": ["mcp-server-git", "--repository", "path/to/git/repo"],
  "env": {
    "GIT_IGNORE_REVS": "true"
  }
}`);

  const [currentMode, setCurrentMode] = useState<'quick' | 'json'>(mode);
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // 当模态框打开或mode参数变化时，更新currentMode
  React.useEffect(() => {
    if (isOpen) {
      setCurrentMode(mode);
    }
  }, [isOpen, mode]);

  // 当模态框打开时，根据是否为编辑模式来初始化表单数据
  React.useEffect(() => {
    if (isOpen) {
      if (editData && editMode) {
        try {
          // 解析 mcpinfo JSON 字符串
          const mcpinfo = typeof editData.mcpinfo === 'string' 
            ? JSON.parse(editData.mcpinfo) 
            : editData.mcpinfo || {};
          
          const newFormData = {
            name: editData.name || mcpinfo.name || '',
            description: mcpinfo.description || '',
            type: editData.type || mcpinfo.type || 'stdio',
            command: mcpinfo.command || '',
            args: Array.isArray(mcpinfo.args) ? mcpinfo.args.join('\n') : '',
            env: mcpinfo.env ? Object.entries(mcpinfo.env).map(([k, v]) => `${k}=${v}`).join('\n') : '',
            url: mcpinfo.url || '',
            headers: mcpinfo.headers ? Object.entries(mcpinfo.headers).map(([k, v]) => `${k}=${v}`).join('\n') : ''
          };

          setFormData(newFormData);
          setJsonValue(JSON.stringify(mcpinfo, null, 2));
        } catch (error) {
          console.error('解析编辑数据失败:', error);
          // 如果解析失败，使用基本信息
          setFormData({
            name: editData.name || '',
            description: '',
            type: editData.type || 'stdio',
            command: '',
            args: '',
            env: '',
            url: '',
            headers: ''
          });
        }
      } else {
        // 重置为默认值（新建模式）
        setFormData({
          name: '',
          description: '',
          type: 'stdio',
          command: '',
          args: '',
          env: '',
          url: '',
          headers: ''
        });
        setJsonValue(`{
  "name": "example-mcp-server",
  "description": "示例MCP服务器",
  "command": "uvx",
  "args": ["mcp-server-git", "--repository", "path/to/git/repo"],
  "env": {
    "GIT_IGNORE_REVS": "true"
  }
}`);
      }
    }
  }, [isOpen, editData, editMode]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuickSave = async () => {
    try {
      // 验证必要字段
      if (!formData.name.trim()) {
        showError('错误', '请输入MCP服务器名称');
        return;
      }

      // 构建完整的 mcpinfo JSON 对象，包含所有表单信息
      let mcpinfo: any = {
        name: formData.name,
        description: formData.description,
        type: formData.type
      };

      if (formData.type === 'stdio') {
        mcpinfo = {
          ...mcpinfo,
        command: formData.command,
        args: formData.args.split('\n').filter((arg: string) => arg.trim()),
        env: formData.env ? Object.fromEntries(
          formData.env.split('\n')
            .filter(line => line.includes('='))
            .map(line => line.split('=', 2))
        ) : {}
      };
      } else if (formData.type === 'sse' || formData.type === 'ws') {
        mcpinfo = {
          ...mcpinfo,
          url: formData.url,
          headers: formData.headers ? Object.fromEntries(
            formData.headers.split('\n')
              .filter(line => line.includes('='))
              .map(line => line.split('=', 2))
          ) : {}
        };
      }

      // 构建要发送到API的数据
      const configData = {
        name: formData.name,        // 单独的name字段用于ai_mcp表的name字段
        type: formData.type,        // 单独的type字段用于ai_mcp表的type字段
        mcpinfo: JSON.stringify(mcpinfo)  // 完整的JSON对象用于ai_mcp表的mcpinfo字段
      };

      if (onSave) {
        const success = await onSave(configData);
        if (success) {
          showSuccess('成功', 'MCP 配置保存成功！');
        onClose();
      } else {
          showError('错误', '保存失败，请重试');
        }
      }
    } catch (error) {
      console.error('Error saving MCP config:', error);
      showError('错误', '保存失败，请重试');
    }
  };

  const handleJsonSave = async () => {
    try {
      const parsedJson = JSON.parse(jsonValue);

      // 根据内容自动检测类型
      let detectedType = 'stdio';
      if (parsedJson.url) {
        detectedType = parsedJson.url.startsWith('wss://') ? 'ws' : 'sse';
      }

      // 填充表单数据
      const newFormData = {
        name: parsedJson.name || '',
        description: parsedJson.description || '',
        type: detectedType,
        command: parsedJson.command || '',
        args: Array.isArray(parsedJson.args) ? parsedJson.args.join('\n') : '',
        env: parsedJson.env ? Object.entries(parsedJson.env).map(([k, v]) => `${k}=${v}`).join('\n') : '',
        url: parsedJson.url || '',
        headers: parsedJson.headers ? Object.entries(parsedJson.headers).map(([k, v]) => `${k}=${v}`).join('\n') : ''
      };

      setFormData(newFormData);
      setCurrentMode('quick');
      showSuccess('成功', 'JSON配置解析成功，已填充到表单中');
      
    } catch (error) {
      showError('错误', 'JSON格式错误，请检查配置');
    }
  };

  const renderQuickCreate = () => (
    <>
      <TabContent>
        <PremiumFormSection>
          <PremiumFormField>
            <PremiumFormLabel>
              <span className="required">* </span>名称
            </PremiumFormLabel>
            <PremiumFormInput
              type="text"
              placeholder="MCP服务器名称"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
            />
          </PremiumFormField>

          <PremiumFormField>
            <PremiumFormLabel>描述</PremiumFormLabel>
            <PremiumFormInput
              type="text"
              placeholder="MCP服务器描述"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('description', e.target.value)}
            />
          </PremiumFormField>

          <PremiumFormField>
            <PremiumFormLabel>
              <span className="required">* </span>类型
            </PremiumFormLabel>
            <PremiumFormSelect
              value={formData.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('type', e.target.value)}
            >
              <option value="stdio">标准输入/输出(stdio)</option>
              <option value="sse">服务器发送事件(sse)</option>
              <option value="ws">可流式传输的HTTP(streamableHttp)</option>
            </PremiumFormSelect>
          </PremiumFormField>
        </PremiumFormSection>

        {formData.type === 'stdio' && (
          <PremiumFormSection>
            <PremiumFormField>
              <PremiumFormLabel>
                <span className="required">* </span>命令
              </PremiumFormLabel>
              <PremiumFormInput
                type="text"
                placeholder="uvx or npx"
                value={formData.command}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('command', e.target.value)}
              />
            </PremiumFormField>

            <PremiumFormField>
              <PremiumFormLabel>参数 <span title="参数，每个参数占一行">ⓘ</span></PremiumFormLabel>
              <PremiumFormTextArea
                placeholder="arg1&#10;arg2"
                value={formData.args}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('args', e.target.value)}
                style={{ minHeight: '100px' }}
              />
            </PremiumFormField>

            <PremiumFormField>
              <PremiumFormLabel>环境变量 <span title="环境变量，每个变量占一行，格式为 KEY=value">ⓘ</span></PremiumFormLabel>
              <PremiumFormTextArea
                placeholder="KEY1=value1&#10;KEY2=value2"
                value={formData.env}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('env', e.target.value)}
              />
            </PremiumFormField>
          </PremiumFormSection>
        )}

        {(formData.type === 'sse' || formData.type === 'ws') && (
          <PremiumFormSection>
            <PremiumFormField>
              <PremiumFormLabel>
                <span className="required">* </span>URL
              </PremiumFormLabel>
              <PremiumFormInput
                type="text"
                placeholder={formData.type === 'sse' ? "https://example.com/sse" : "wss://example.com/ws"}
                value={formData.url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('url', e.target.value)}
              />
            </PremiumFormField>

            <PremiumFormField>
              <PremiumFormLabel>请求头 ⓘ</PremiumFormLabel>
              <PremiumFormTextArea
                placeholder="Authorization=Bearer token&#10;Content-Type=application/json&#10;X-API-Key=your-api-key"
                value={formData.headers}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('headers', e.target.value)}
                style={{ minHeight: '100px' }}
              />
            </PremiumFormField>
          </PremiumFormSection>
        )}
      </TabContent>

      <FormButtonGroup>
        <PremiumFormButton 
          $variant="primary" 
          onClick={handleQuickSave}
          style={{
            background: '#3b82f6',
            border: 'none',
            fontWeight: '600'
          }}
        >
          {editMode ? '更新配置' : '保存配置'}
        </PremiumFormButton>
        <PremiumFormButton $variant="secondary" onClick={onClose}>
          取消
        </PremiumFormButton>
      </FormButtonGroup>
    </>
  );

  const renderJsonImport = () => (
    <>
      <TabContent>
        <PremiumFormSection>
          <PremiumFormField>
            <PremiumFormLabel>请从 MCP Servers 的介绍页面复制配置JSON(优先使用NPX或UVX配置)，并粘贴到输入框中</PremiumFormLabel>
            <div style={{ border: `1px solid rgba(255, 255, 255, 0.3)`, borderRadius: '6px', overflow: 'hidden' }}>
              <CodeMirror
                value={jsonValue}
                height="400px"
                extensions={[json()]}
                theme={oneDark}
                onChange={(value) => setJsonValue(value)}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  dropCursor: false,
                  allowMultipleSelections: false,
                  indentOnInput: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightSelectionMatches: false
                }}
              />
            </div>
          </PremiumFormField>
        </PremiumFormSection>
      </TabContent>

      <FormButtonGroup>
        <PremiumFormButton 
          $variant="primary" 
          onClick={handleJsonSave}
          style={{
            background: '#3b82f6',
            border: 'none',
            fontWeight: '600'
          }}
        >
          解析并填充表单
        </PremiumFormButton>
        <PremiumFormButton $variant="secondary" onClick={() => {
          setJsonValue('');
        }}>
          重置
        </PremiumFormButton>
        <PremiumFormButton $variant="secondary" onClick={() => setCurrentMode('quick')}>
          返回表单
        </PremiumFormButton>
      </FormButtonGroup>
    </>
  );

  return (
    <>
      <ModalBackdrop>
        <PremiumModalContainer>
            <ModalHeader>
              <PremiumTitleDesc>
                <h3>{editMode ? '编辑MCP配置' : (currentMode === 'quick' ? '快速创建MCP配置' : 'JSON导入MCP配置')}</h3>
                <p>{currentMode === 'quick' ? '通过表单快速配置MCP服务器' : '通过JSON配置导入MCP服务器'}</p>
              </PremiumTitleDesc>
              <CloseButton onClick={onClose}>×</CloseButton>
            </ModalHeader>

            <ModalContent>
              {currentMode === 'quick' ? renderQuickCreate() : renderJsonImport()}
            </ModalContent>
          {/* </FixedLayoutModalContainer> */}
        </PremiumModalContainer>
      </ModalBackdrop>
      <ToastManager toasts={toasts} onRemove={removeToast} />
    </>
  );
};