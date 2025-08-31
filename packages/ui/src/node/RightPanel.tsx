"use client";

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Panel,
  PanelTitle,
  OutputContainer,
  OutputContainerContent,
  NodeEmptyState,
  NodeEmptyStateText
} from './sharedStyles';
import { CoButton } from '../components/basic/Buttons';
import { RiFileEditLine } from "react-icons/ri";
import { JsonTree } from '../components/basic/JsonTree';


// Right panel for current node test output
const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.panel.nodeBg};
`;

const ActionContainer = styled.div`
  padding: 12px 20px 0px 0px;
  // display: flex;
  // gap: 8px;
  // align-items: center;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  background: ${({ theme, $variant }) =>
    $variant === 'primary'
      ? theme.colors.success || '#2ed573'
      : theme.panel.panelBg
  };
  color: ${({ theme, $variant }) =>
    $variant === 'primary'
      ? 'white'
      : theme.colors.textPrimary
  };
  border: 0px solid ${({ theme, $variant }) =>
    $variant === 'primary'
      ? 'transparent'
      : theme.colors.border
  };
  border-radius: 2px;
  padding: 0px 0px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    opacity: 0.8;
    // transform: translateY(-1px);
  }
`;

const SetMockButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.accent || '#4fc3f7'};
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 13px;
  text-decoration: underline;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.accentHover || '#29b6f6'};
    text-decoration: none;
  }
  
  &:focus {
    outline: none;
    text-decoration: none;
  }
`;

const CodeMirrorContainer = styled.div`
  height: 100%;
  
  .cm-editor {
    height: 100%;
    background: transparent;
    border: none;
  }
  
  .cm-focused {
    outline: none;
  }
  
  .cm-content {
    padding: 8px;
  }
  
  .cm-scroller {
    font-size: 12px;
  }
`;

const EditModeActions = styled.div`
  display: flex;
  gap: 10px;
  padding: 0px 12px 0px 0px;
  justify-content: right;
  margin-top: 12px;
`;

// 修复JSON格式：添加双引号到键名
const fixJsonFormat = (str: string) => {
  try {
    // 尝试直接解析
    const parsed = JSON.parse(str);
    return parsed;
  } catch (firstError) {
    // 自动修复：将 {a:1} 转换为 {"a":1}
    const fixed = str
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3')
      .replace(/'/g, '"') // 单引号转双引号
      .replace(/;\s*$/, ''); // 去掉末尾的分号
    try {
      const parsed = JSON.parse(fixed);
      return parsed;
    } catch (e) {
      return { error: '无效的JSON格式' };
    }
  }
};

interface RightPanelProps {
  width: number;
  onTest?: (nodeValues: Record<string, any>) => void;
  testOutput?: string;
  nodeWidth?: number;
  showSettings?: boolean;
  onMockDataChange?: (mockData: any) => void;
  onSaveMockData?: (mockData: any) => void;
  lastTestResult?: any;
  nodeId?: string;
  nodesTestResultsMap?: Record<string, any>;
  onUpdateNodesTestResultsMap?: (nodeId: string, data: any) => void;
  isNodeTesting?: boolean; // 节点是否正在测试
  nodeTestEventId?: string; // 节点测试事件ID
}

export const RightPanel: React.FC<RightPanelProps> = ({
  width,
  testOutput,
  nodeWidth,
  showSettings,
  onMockDataChange,
  onSaveMockData,
  nodeId,
  nodesTestResultsMap,
  onUpdateNodesTestResultsMap,
  isNodeTesting,
  nodeTestEventId
}) => {

  const [CodeMirror, setCodeMirror] = useState<any>(null);
  const [jsonExtension, setJsonExtension] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [mockData, setMockData] = useState<any>(null);
  const [editingJson, setEditingJson] = useState('');
  const [lastTestOutput, setLastTestOutput] = useState<string>('');
  const [, forceUpdate] = useState({});

  const getStoredData = () => {
    if (nodeId && nodesTestResultsMap) {
      // 🎯 直接从 nodesTestResultsMap 中获取 rundata
      // 格式：{nodeId: rundata}
      const rundata = nodesTestResultsMap[nodeId];

      return rundata;
    }

    return null;
  };

  const updateStoredData = (data: any) => {
    if (nodeId && onUpdateNodesTestResultsMap) {
      onUpdateNodesTestResultsMap(nodeId, data);
    }
  };

  useEffect(() => {
    setIsClient(true);

    // 添加全局键盘事件监听
    const globalKeyHandler = (event: KeyboardEvent) => {
      // console.log('🌍 全局按键事件:', {
      //   key: event.key,
      //   code: event.code,
      //   ctrlKey: event.ctrlKey,
      //   metaKey: event.metaKey,
      //   target: event.target,
      //   activeElement: document.activeElement
      // });
    };

    document.addEventListener('keydown', globalKeyHandler);
    // 使用 @uiw/react-codemirror 的正确方式
    import('@uiw/react-codemirror').then(module => {
      setCodeMirror(() => module.default);
    }).catch(error => {
      console.error('Failed to load CodeMirror:', error);
    });

    import('@codemirror/lang-json').then(jsonModule => {
      import('@codemirror/theme-one-dark').then(themeModule => {
        import('@codemirror/view').then(viewModule => {
          const keyHandler = viewModule.EditorView.domEventHandlers({
            keydown: (event: KeyboardEvent, view: any) => {
              // 检测 Ctrl+V (Windows/Linux) 或 Cmd+V (Mac)
              if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
                // 尝试手动触发粘贴
                setTimeout(async () => {
                  try {
                    // 使用 Clipboard API 获取剪贴板内容
                    if (navigator.clipboard && navigator.clipboard.readText) {
                      const clipboardText = await navigator.clipboard.readText();

                      if (clipboardText) {
                        const parsed = fixJsonFormat(clipboardText);

                        // 检查是否是fixJsonFormat返回的错误对象
                        const isFixJsonError = parsed && typeof parsed === 'object' &&
                          parsed.error && typeof parsed.error === 'string' &&
                          parsed.error.includes('无效的JSON格式');

                        if (parsed && typeof parsed === 'object' && !isFixJsonError) {
                          const formatted = JSON.stringify(parsed, null, 2);
                          console.log('✅ 手动粘贴 - JSON格式化成功');

                          // 替换编辑器内容
                          const transaction = view.state.update({
                            changes: {
                              from: 0,
                              to: view.state.doc.length,
                              insert: formatted
                            }
                          });
                          view.dispatch(transaction);
                          console.log('✅ 手动粘贴 - 编辑器内容已更新');

                          event.preventDefault();
                          return true;
                        }
                      }
                    } else {
                      console.log('⚠️ Clipboard API 不可用');
                    }
                  } catch (error) {
                    console.error('❌ 手动粘贴失败:', error);
                  }
                }, 0);
              }

              return false;
            },
            paste: (event: ClipboardEvent, view: any) => {
              const pasteData = event.clipboardData?.getData('text');
              if (pasteData) {
                try {
                  // 尝试解析并格式化粘贴的内容
                  const parsed = fixJsonFormat(pasteData);
                  // 检查是否是fixJsonFormat返回的错误对象
                  const isFixJsonError = parsed && typeof parsed === 'object' &&
                    parsed.error && typeof parsed.error === 'string' &&
                    parsed.error.includes('无效的JSON格式');

                  if (parsed && typeof parsed === 'object' && !isFixJsonError) {
                    const formatted = JSON.stringify(parsed, null, 2);

                    // 替换编辑器内容
                    const transaction = view.state.update({
                      changes: {
                        from: 0,
                        to: view.state.doc.length,
                        insert: formatted
                      }
                    });
                    view.dispatch(transaction);

                    event.preventDefault();
                    return true;
                  } else {
                    return false;
                  }
                } catch (error) {
                  console.error('❌ 粘贴处理失败:', error);
                  // 如果解析失败，使用默认粘贴行为
                  return false;
                }
              }
              console.log('⚠️ 没有粘贴数据');
              return false;
            }
          });

          setJsonExtension(() => [
            jsonModule.json(),
            themeModule.oneDark,
            keyHandler,
            viewModule.EditorView.lineWrapping,
          ]);
        });
      });
    }).catch(error => {
      console.error('Failed to load CodeMirror extensions:', error);
    });

    // 清理函数
    return () => {
      document.removeEventListener('keydown', globalKeyHandler);
    };
  }, []);

  // 监控 nodesTestResultsMap 变化，用于强制更新
  useEffect(() => {
    // 🎯 强制重新渲染以确保数据更新
    forceUpdate({});
  }, [nodeId, nodesTestResultsMap]);

  const handleSetMockData = () => {
    setIsEditMode(true);
    // 修复：使用当前的mockData，如果没有则使用testOutput或空对象
    const storedData = getStoredData();
    const currentData = storedData || mockData;

    if (currentData) {
      // 如果有现有数据，格式化显示
      setEditingJson(JSON.stringify(currentData, null, 2));
      console.log('✅ 使用现有数据编辑:', currentData);
    } else if (testOutput) {
      // 如果没有mock数据但有testOutput，使用testOutput
      setEditingJson(testOutput);
      console.log('✅ 使用testOutput编辑:', testOutput);
    } else {
      // 否则使用空对象
      setEditingJson('{}');
      console.log('✅ 使用空对象编辑');
    }
  };

  const handleCodeMirrorChange = (value: string) => {
    console.log('📝 CodeMirror 内容变化:', value?.substring(0, 50) + '...');
    setEditingJson(value);
  };



  const handleSaveMockData = () => {
    try {

      // 使用修复函数处理JSON格式
      const parsedData = fixJsonFormat(editingJson);

      // 检查是否是fixJsonFormat返回的错误对象
      const isFixJsonError = parsedData && typeof parsedData === 'object' &&
        parsedData.error && typeof parsedData.error === 'string' &&
        parsedData.error.includes('无效的JSON格式');

      if (parsedData && typeof parsedData === 'object' && !isFixJsonError) {
        const mockTestResult = {
          timestamp: new Date().toISOString(),
          success: true,
          runData: parsedData,
          inputs: {},
          source: 'mock',
          nodeKind: 'unknown'
        };

        // 保存到本地状态
        setMockData(parsedData);
        setIsEditMode(false);
        console.log('💾 [RightPanel] 本地状态已更新:', parsedData);

        // 🎯 更新到nodesTestResultsMap，直接存储 rundata
        updateStoredData(parsedData);
        console.log('✅ Mock数据已保存到nodesTestResultsMap (rundata):', parsedData);

        // 🎯 强制刷新数据显示
        setTimeout(() => {
          forceUpdate({});
          console.log('🔄 [RightPanel] 强制更新组件以显示新数据');
        }, 10);

        // 调用回调函数
        if (onSaveMockData) {
          onSaveMockData(mockTestResult);
        }

        if (onMockDataChange) {
          onMockDataChange(parsedData);
        }

      } else {
        console.error('❌ JSON格式修复失败:', parsedData);
        alert('JSON格式错误，无法自动修复，请检查输入');
      }
    } catch (error) {
      console.error('❌ 保存Mock数据时发生错误:', error);
      alert('保存失败，请检查输入格式');
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingJson('');
  };

  const getDisplayData = () => {
    // 🎯 统一从 nodesTestResultsMap 中获取数据
    const storedData = getStoredData();
    if (storedData) {
      // 检查是否是新格式 {data: outputData, success: true}
      if (storedData.success === true && storedData.data) {
        // 返回完整的格式，包含 data 和 success
        return JSON.stringify({
          data: storedData.data,
          success: storedData.success
        }, null, 2);
      }
      // 兼容旧格式，直接返回数据
      return JSON.stringify(storedData, null, 2);
    }

    // 如果没有存储数据，使用testOutput作为备用
    if (testOutput && testOutput.trim() !== '') {
      return testOutput;
    }

    return '';
  };

  // 🎯 简化：只监控 testOutput 的变化，用于调试
  useEffect(() => {
    if (testOutput && testOutput !== lastTestOutput) {
      setLastTestOutput(testOutput);
    }
  }, [testOutput, lastTestOutput, nodeId]);

  const parseJsonSafely = (jsonString: string) => {
    try {
      // 使用修复函数处理JSON格式
      const result = fixJsonFormat(jsonString);
      return result;
    } catch (error) {
      console.error('❌ parseJsonSafely 处理失败:', error);
      return null;
    }
  };

  const renderCurrentTab = () => {
    const displayData = getDisplayData();
    const hasData = displayData && displayData.trim() !== '';
    const storedData = getStoredData();
    // 🎯 修正模拟数据判断逻辑：如果有存储数据但没有testOutput，则可能是模拟数据
    const isMockData = !!storedData && (!testOutput || testOutput.trim() === '');

    if (isEditMode) {
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <EditModeActions>
            <CoButton variant="Glass" backgroundColor='#35B5EF80' onClick={handleSaveMockData}>
              保存
            </CoButton>
            <CoButton variant="Glass" onClick={handleCancelEdit}>
              取消
            </CoButton>
            {/* <ActionButton $variant="primary" onClick={handleSaveMockData}>
              保存
            </ActionButton>
            <ActionButton $variant="secondary" onClick={handleCancelEdit}>
              取消
            </ActionButton> */}
          </EditModeActions>
          <div style={{ flex: 1 }}>
            {isClient && CodeMirror && jsonExtension ? (
              <CodeMirrorContainer>
                <CodeMirror
                  value={editingJson}
                  onChange={handleCodeMirrorChange}
                  extensions={jsonExtension}
                  height="100%"
                  theme="dark"
                  style={{
                    fontSize: '12px',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  }}
                  placeholder="请输入JSON数据... 支持不完整格式如 {a:1,b:2}，系统会自动修复"
                  onFocus={() => console.log('🎯 CodeMirror 获得焦点')}
                  onBlur={() => console.log('🎯 CodeMirror 失去焦点')}
                />
              </CodeMirrorContainer>
            ) : (
              <textarea
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '8px',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  background: '#1e1e1e',
                  color: '#d4d4d4',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '12px',
                  resize: 'none',
                  outline: 'none'
                }}
                value={editingJson}
                onChange={(e) => setEditingJson(e.target.value)}
                placeholder="输入JSON数据..."
              />
            )}
          </div>
        </div>
      );
    }

    // 如果正在测试中，显示测试状态
    if (isNodeTesting) {
      return (
        <OutputContainerContent>
          <NodeEmptyState>
            <NodeEmptyStateText>
              🔄 节点正在执行中...
            </NodeEmptyStateText>
            {nodeTestEventId && (
              <div style={{
                fontSize: '12px',
                color: '#888',
                marginTop: '8px',
                fontFamily: 'monospace'
              }}>
                Event ID: {nodeTestEventId}
              </div>
            )}
          </NodeEmptyState>
        </OutputContainerContent>
      );
    }

    if (!hasData) {
      return (
        <OutputContainerContent>
          <NodeEmptyState>
            <NodeEmptyStateText>
              执行当前节点显示数据或者您可以
            </NodeEmptyStateText>
            <SetMockButton onClick={handleSetMockData}>
              设置模拟数据
            </SetMockButton>
          </NodeEmptyState>
        </OutputContainerContent>
      );
    }

    const parsedData = parseJsonSafely(displayData);

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <PanelHeader>
          <div style={{ fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* <span>{isMockData ? '模拟数据' : '测试结果'}</span> */}
            {isMockData && (
              <span style={{
                fontSize: '12px',
                color: '#ffa726',
                background: 'rgba(255, 167, 38, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 'normal'
              }}>
                {/* MOCK */}
              </span>
            )}
          </div>
          <ActionContainer>
            {/* {storedData && !testOutput && (
              <ActionButton $variant="secondary" onClick={() => {
                setMockData(null);
                updateStoredData(null);
                console.log('✅ 已清除模拟数据');
              }}>
                清除数据
              </ActionButton>
            )} */}
            {/* <CoButton variant='Glass' onClick={handleSetMockData}>
              {storedData ? <TiEdit size={16}/> : '设置模拟数据'}
            </CoButton> */}
            <ActionButton $variant="secondary" onClick={handleSetMockData}>
              {storedData ? <RiFileEditLine size={20} /> : '设置模拟数据'}
            </ActionButton>
          </ActionContainer>
        </PanelHeader>

        <OutputContainer style={{ flex: 1 }}>
          <OutputContainerContent>
            {parsedData && typeof parsedData === 'object' ? (
              <JsonTree
                data={parsedData}
                nodeId={nodeId || 'current'}
                initialExpandDepth={2}
                draggable={false}
              />
            ) : (
              <pre style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: '12px',
                color: '#d4d4d4'
              }}>
                {displayData}
              </pre>
            )}
          </OutputContainerContent>
        </OutputContainer>
      </div>
    );
  };

  return (
    <Panel $width={width}>
      <PanelTitle style={{ marginLeft: showSettings ? `${(nodeWidth || 500) / 2 - 10}px` : '0px' }}>当前节点输出</PanelTitle>
      {/* <OutputContainerTitle style={{ marginLeft: showSettings ? `${(nodeWidth || 500) / 2 - 15}px` : '0px' }}>
      </OutputContainerTitle> */}
      <OutputContainer style={{ marginLeft: showSettings ? `${(nodeWidth || 500) / 2 - 15}px` : '0px' }}>
        {renderCurrentTab()}
      </OutputContainer>
    </Panel>
  );
}; 