import React, { useState, useMemo, useRef } from 'react';
import styled from 'styled-components';

// 使用液态玻璃样式
import {
  GlassListCards,
  ListCardButtons,
  ListCardIcons
} from '../../components/shared/ui-components';
import { useGlobalConfirm } from '../../components/basic/GlobalConfirmManager';
import { useToast } from '../../components/basic';
import { ToolbarControls } from '../chat/ToolbarControls';
import { FaTools } from "react-icons/fa";
import { McpConfig } from '@repo/common';

interface McpListProps {
  mcpConfigs: McpConfig[];
  activeTab: string;
  onMcpClick?: (mcpId: string) => void;
  onDeleteMcp?: (mcpId: string) => void;
  onEditMcp?: (mcp: McpConfig) => void;
  onDebugMcp?: (mcp: McpConfig) => void;
  toastHook?: any; // Toast hook实例
}

export const McpList: React.FC<McpListProps> = ({
  mcpConfigs,
  activeTab,
  onMcpClick,
  onDeleteMcp,
  onEditMcp,
  onDebugMcp,
  toastHook,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('last-updated');

  // 过滤和排序MCP 配置
  const filteredMcpConfigs = useMemo(() => {
    let filtered = mcpConfigs;

    // 根据搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(mcp =>
        mcp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mcp.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 排序
    if (sortBy === 'last-updated') {
      filtered = [...filtered].sort((a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [mcpConfigs, searchTerm, sortBy]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏区 */}
      <ToolbarControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="搜索MCP配置..."
        sortBy={sortBy}
        onSortChange={() => setSortBy(sortBy === 'last-updated' ? 'name' : 'last-updated')}
      />

      {/* MCP 配置卡片区域 */}
      <div style={{
        flex: 1,
        padding: '0 30px',
        overflowY: 'auto',
        marginBottom: '20px'
      }}>
        {(() => {
          if (filteredMcpConfigs.length === 0) {
            return (
              <EmptyStateText>
                暂无MCP配置
              </EmptyStateText>
            );
          } else {
            return filteredMcpConfigs.map((mcp, index) => {
              return (
                <McpCard
                  key={mcp.id}
                  mcp={mcp}
                  onMcpClick={onMcpClick}
                  onDeleteMcp={onDeleteMcp}
                  onEditMcp={onEditMcp}
                  onDebugMcp={onDebugMcp}
                  toastHook={toastHook}
                />
              );
            });
          }
        })()}
      </div>
    </div>
  );
};

// MCP 配置卡片组件
interface McpCardProps {
  mcp: McpConfig;
  onMcpClick?: (mcpId: string) => void;
  onDeleteMcp?: (mcpId: string) => void;
  onEditMcp?: (mcp: McpConfig) => void;
  onDebugMcp?: (mcp: McpConfig) => void;
  toastHook?: any; // Toast hook实例
}

const McpCard: React.FC<McpCardProps> = ({
  mcp,
  onMcpClick,
  onDeleteMcp,
  onEditMcp,
  onDebugMcp,
  toastHook,
}) => {
  const { showConfirm } = useGlobalConfirm();
  // 使用传递的toastHook或创建新的（向后兼容）
  const currentToastHook = toastHook || useToast();
  const { showSuccess, showError } = currentToastHook;
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🔍 [McpList] 开始删除MCP:', mcp.id, mcp.name);

    const confirmed = await showConfirm({
      title: '确认删除',
      message: `确定要删除MCP配置 "${mcp.name}" 吗？\n\n如果有智能体正在使用此MCP，将无法删除。`,
      confirmText: '删除',
      cancelText: '取消',
      triggerElement: deleteButtonRef.current,
      positioning: 'below-trigger'
    });

    console.log('🔍 [McpList] 用户确认删除:', confirmed);

    if (confirmed) {
      try {
        console.log('🔍 [McpList] 发送删除请求:', `/api/mcp-configs?id=${mcp.id}`);
        const response = await fetch(`/api/mcp-configs?id=${mcp.id}`, {
          method: 'DELETE',
        });

        console.log('🔍 [McpList] 收到响应:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        // 检查HTTP状态码
        if (!response.ok) {
          console.log('🔍 [McpList] 响应状态不OK，尝试解析错误');
          // 尝试解析错误响应
          try {
            const errorResult = await response.json();
            if (errorResult.referencedAgents) {
              showError('删除失败', `${errorResult.referencedAgents.join('、')}智能体引用这个MCP工具，不能删除，请解开引用`);
            } else {
              showError('删除失败', errorResult.error || `服务器错误 (${response.status})`);
            }
          } catch (parseError) {
            console.log('🔍 [McpList] 解析错误响应失败:', parseError);
            showError('删除失败', `服务器错误 (${response.status})`);
          }
          return;
        }

        const result = await response.json();

        if (result.success) {
           try {
             showSuccess('删除成功', 'MCP配置删除成功');
           } catch (toastError) {
             console.error('🔍 [McpList] showSuccess调用失败:', toastError);
           }
           // 调用父组件的删除回调来刷新列表
           onDeleteMcp?.(mcp.id);
         } else {
           // 处理引用错误
           if (result.referencedAgents) {
             showError('删除失败', `${result.referencedAgents.join('、')}智能体引用这个MCP工具，不能删除，请解开引用`);
           } else {
             showError('删除失败', result.error || '删除失败');
           }
         }
       } catch (error) {
         console.error('🔍 [McpList] 删除MCP配置异常:', error);
         showError('删除失败', '网络错误，请重试');
      }
    }
  };

  return (
    <GlassListCards>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '16px' }}>
          {/* MCP 图标 */}
          <ListCardIcons>
            <FaTools size={22}/>
          </ListCardIcons>

          {/* MCP 信息 */}
          <div style={{ flex: 1 }}>
            <McpTitle>
              {mcp.name}
            </McpTitle>
            <McpSecondaryText>
              类型：{mcp.type}
            </McpSecondaryText>
            <McpTertiaryText>
              创建时间：{new Date(mcp.createdAt).toLocaleDateString()}
            </McpTertiaryText>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <ListCardButtons onClick={(e) => {
            e.stopPropagation();
            onEditMcp?.(mcp);
          }}>
            ✏️ 编辑
          </ListCardButtons>
          <ListCardButtons
            ref={deleteButtonRef}
            onClick={handleDeleteClick}
          >
            🗑 删除
          </ListCardButtons>
        </div>
      </div>
    </GlassListCards>
  );
};
// Styled components for theme support
const EmptyStateText = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const McpTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const McpSecondaryText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 8px;
`;

const McpTertiaryText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textTertiary};
`;