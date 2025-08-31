"use client";

import React, { useState } from 'react';
import styled from 'styled-components';
import { SettingsCard } from './SettingsCard';
import { Toggle, Input } from './SharedStyles';

const ToolGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const ToolCard = styled.div<{ $enabled?: boolean }>`
  background: ${({ theme }) => theme.mode === 'dark'
    ? 'rgba(66, 75, 97, 0.3)'
    : 'rgba(248, 250, 252, 0.6)'
  };
  border: 1px solid ${({ $enabled, theme }) => $enabled
    ? theme.colors.accent
    : (theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.2)'
      : 'rgba(59, 130, 246, 0.15)')
  };
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-2px);
  }
`;

const ToolHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ToolTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToolIcon = styled.div`
  font-size: 18px;
`;

const ToolDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  margin: 0 0 12px 0;
  line-height: 1.4;
`;

const ToolStatus = styled.div<{ $status: 'enabled' | 'disabled' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  
  color: ${({ $status }) => {
    switch ($status) {
      case 'enabled':
        return '#22c55e';
      case 'disabled':
        return '#6b7280';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }};
`;

const StatusDot = styled.div<{ $status: 'enabled' | 'disabled' | 'error' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $status }) => {
    switch ($status) {
      case 'enabled':
        return '#22c55e';
      case 'disabled':
        return '#6b7280';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }};
`;



const ToolActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
`;

const ConfigButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark'
      ? 'rgba(59, 130, 246, 0.1)'
      : 'rgba(59, 130, 246, 0.05)'
    };
    color: ${({ theme }) => theme.colors.textPrimary};
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const SearchInput = styled(Input)`
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;
`;

const CategoryFilter = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  background: ${({ $active, theme }) => $active
    ? theme.colors.accent
    : 'transparent'
  };
  color: ${({ $active, theme }) => $active
    ? 'white'
    : theme.colors.textSecondary
  };
  border: 1px solid ${({ $active, theme }) => $active
    ? theme.colors.accent
    : theme.colors.border
  };
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ $active, theme }) => $active
      ? theme.colors.accentHover
      : (theme.mode === 'dark'
        ? 'rgba(59, 130, 246, 0.1)'
        : 'rgba(59, 130, 246, 0.05)')
    };
    color: ${({ $active, theme }) => $active
      ? 'white'
      : theme.colors.textPrimary
    };
  }
`;

interface McpTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  enabled: boolean;
  status: 'enabled' | 'disabled' | 'error';
  version?: string;
  author?: string;
}

const mockMcpTools: McpTool[] = [
  {
    id: 'file-system',
    name: 'File System',
    description: '提供文件系统操作功能，包括读取、写入、删除文件和目录管理',
    icon: '📁',
    category: 'system',
    enabled: true,
    status: 'enabled',
    version: '1.0.0',
    author: 'Cofly Team'
  },
  {
    id: 'database',
    name: 'Database Tools',
    description: '数据库连接和查询工具，支持MySQL、PostgreSQL、SQLite等',
    icon: '🗄️',
    category: 'database',
    enabled: true,
    status: 'enabled',
    version: '1.2.0',
    author: 'Cofly Team'
  },
  {
    id: 'web-scraper',
    name: 'Web Scraper',
    description: '网页抓取工具，可以提取网页内容和数据',
    icon: '🕷️',
    category: 'web',
    enabled: false,
    status: 'disabled',
    version: '0.9.0',
    author: 'Community'
  },
  {
    id: 'email-sender',
    name: 'Email Sender',
    description: '邮件发送工具，支持SMTP和各种邮件服务提供商',
    icon: '📧',
    category: 'communication',
    enabled: true,
    status: 'enabled',
    version: '1.1.0',
    author: 'Cofly Team'
  },
  {
    id: 'image-processor',
    name: 'Image Processor',
    description: '图像处理工具，支持格式转换、缩放、滤镜等功能',
    icon: '🖼️',
    category: 'media',
    enabled: false,
    status: 'disabled',
    version: '1.0.0',
    author: 'Community'
  },
  {
    id: 'api-client',
    name: 'API Client',
    description: 'HTTP API客户端，支持REST和GraphQL接口调用',
    icon: '🔌',
    category: 'web',
    enabled: true,
    status: 'error',
    version: '1.3.0',
    author: 'Cofly Team'
  },
  {
    id: 'text-processor',
    name: 'Text Processor',
    description: '文本处理工具，支持格式转换、正则表达式、文本分析',
    icon: '📝',
    category: 'utility',
    enabled: true,
    status: 'enabled',
    version: '1.0.0',
    author: 'Cofly Team'
  },
  {
    id: 'scheduler',
    name: 'Task Scheduler',
    description: '任务调度工具，支持定时任务和事件触发',
    icon: '⏰',
    category: 'system',
    enabled: false,
    status: 'disabled',
    version: '0.8.0',
    author: 'Community'
  }
];

const categories = [
  { id: 'all', label: '全部' },
  { id: 'system', label: '系统工具' },
  { id: 'database', label: '数据库' },
  { id: 'web', label: '网络工具' },
  { id: 'communication', label: '通信工具' },
  { id: 'media', label: '媒体处理' },
  { id: 'utility', label: '实用工具' }
];

export const McpSettings: React.FC = () => {
  const [tools, setTools] = useState<McpTool[]>(mockMcpTools);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const handleToggleTool = (toolId: string) => {
    setTools(prev => prev.map(tool => 
      tool.id === toolId 
        ? { 
            ...tool, 
            enabled: !tool.enabled,
            status: !tool.enabled ? 'enabled' : 'disabled'
          }
        : tool
    ));
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const enabledCount = tools.filter(tool => tool.enabled).length;
  const totalCount = tools.length;

  return (
    <>
      <SettingsCard
        title="MCP工具管理"
        description={`管理Cofly提供的MCP工具和扩展 (${enabledCount}/${totalCount} 已启用)`}
      >
        <SearchInput
          type="text"
          placeholder="搜索MCP工具..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <CategoryFilter>
          {categories.map(category => (
            <FilterButton
              key={category.id}
              $active={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </FilterButton>
          ))}
        </CategoryFilter>
        
        <ToolGrid>
          {filteredTools.map(tool => (
            <ToolCard key={tool.id} $enabled={tool.enabled}>
              <ToolHeader>
                <ToolTitle>
                  <ToolIcon>{tool.icon}</ToolIcon>
                  {tool.name}
                </ToolTitle>
                <Toggle
                  $active={tool.enabled}
                  onClick={() => handleToggleTool(tool.id)}
                />
              </ToolHeader>
              
              <ToolDescription>
                {tool.description}
              </ToolDescription>
              
              <ToolActions>
                <ToolStatus $status={tool.status}>
                  <StatusDot $status={tool.status} />
                  {tool.status === 'enabled' && '已启用'}
                  {tool.status === 'disabled' && '已禁用'}
                  {tool.status === 'error' && '错误'}
                </ToolStatus>
                
                <ConfigButton>
                  配置
                </ConfigButton>
              </ToolActions>
              
              {tool.version && (
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  marginTop: '8px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>v{tool.version}</span>
                  <span>{tool.author}</span>
                </div>
              )}
            </ToolCard>
          ))}
        </ToolGrid>
        
        {filteredTools.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
          }}>
            没有找到匹配的MCP工具
          </div>
        )}
      </SettingsCard>
    </>
  );
};

export default McpSettings;