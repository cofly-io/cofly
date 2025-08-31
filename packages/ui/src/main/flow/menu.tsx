"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from '../../context/ThemeProvider';
import { getThemeIcon } from '@repo/ui/utils/themeIcon';
import { FaLongArrowAltLeft } from "react-icons/fa";

import {
  MenuContainer,
  MenuHeader,
  SubMenuHeader,
  CollapseFlag,
  SearchContainer,
  NodeMenuSearch,
  MenuContent,
  CatalogHeader,
  CatalogHeaderContent,
  CatalogContent,
  CatalogIcon,
  CatalogTitle,
  EmptyState,
  CatalogText,
  CatalogDescription,
  ExpandIcon,
  NodeItem,
  NodeContent,
  NodeIconContainer,
  NodeIcon,
  NodeTextContent,
  NodeTitle,
  NodeDescription,
} from './nodes';

import { ICatalog, INodeBasic } from '@repo/common';

export interface ICatalogAndNode extends Omit<ICatalog, 'id'> {
  id: string; // Allow any string as id to avoid duplicate key issues
  nodes: INodeBasic[];
}

export interface IWorkflowMenuProps {
  dataSource: ICatalogAndNode[];
  onMenuCollapseChange?: (collapsed: boolean) => void;
}


// N8N风格的 Workflow menu 组件
export const WorkflowMenu: React.FC<IWorkflowMenuProps> = React.memo(({
  dataSource,
  onMenuCollapseChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null);
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const { themeMode } = useTheme();
  
  // 使用公共的主题图标工具函数

  // 优化：使用 useCallback 避免不必要的重新渲染
  const handleMenuCollapse = useCallback((collapsed: boolean) => {
    setMenuCollapsed(collapsed);
    onMenuCollapseChange?.(collapsed);
  }, [onMenuCollapseChange]);

  const selectCatalog = useCallback((catalogId: string) => {
    setSelectedCatalog(catalogId);
  }, []);

  const goBack = useCallback(() => {
    setSelectedCatalog(null);
  }, []);

  // 优化：缓存转换后的数据
  const catalogs = useMemo((): ICatalogAndNode[] => {
    if (!dataSource) return [];
    return dataSource.map(cata => ({
      id: cata.id,
      name: cata.name,
      description: cata.description,
      icon: cata.icon,
      nodes: cata.nodes.map(node => ({
        kind: node.kind,
        name: node.name,
        description: node.description,
        icon: node.icon, // 使用传递过来的图标路径，而不是硬编码
        catalog: node.catalog,
        nodeWidth: node.nodeWidth,
        version: node.version,
        nodeMode: node.nodeMode,
        link: node.link, // 添加 link 信息
      }))
    }));
  }, [dataSource]);

  // 优化：缓存拖拽处理函数
  const handleDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, nodeData: INodeBasic) => {
    try {
      const serializableNodeData = {
        id: nodeData.kind,
        name: nodeData.name,
        description: nodeData.description,
        catalog: nodeData.catalog || 'default',
        icon: nodeData.icon || '',
        version: nodeData.version,
        kind: nodeData.kind,
        nodeWidth: nodeData.nodeWidth,
        link: nodeData.link, // 添加 link 信息
        type: nodeData.catalog === 'trigger' ? 'triggerNode' :
          nodeData.catalog === 'AI' && nodeData.nodeMode === 'agent' ? 'agentNode' : 'actionNode'
      };

      // 设置拖拽数据
      const dataString = JSON.stringify(serializableNodeData);
      event.dataTransfer.setData('application/reactflow', dataString);
      event.dataTransfer.effectAllowed = 'move';

      // 创建拖拽预览
      const dragPreview = document.createElement('div');
      dragPreview.style.cssText = `
        position: absolute;
        top: -1000px;
        left: -1000px;
        padding: 12px 16px;
        background: white;
        border: 2px solid #33C2EE;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        font-weight: 500;
        color: #333;
        z-index: 9999;
      `;

      const iconSrc = getThemeIcon(nodeData.icon, themeMode, nodeData.kind, nodeData.catalog) || '/nodes/default/default.svg';
      console.log('拖拽图标地址:', iconSrc, '节点数据:', { kind: nodeData.kind, catalog: nodeData.catalog });

      dragPreview.innerHTML = `
        <img src="${iconSrc}" style="width: 20px; height: 20px;" alt="${nodeData.name}" />
        <span>${nodeData.name}</span>
      `;

      document.body.appendChild(dragPreview);

      // 设置拖拽图像
      event.dataTransfer.setDragImage(dragPreview, 50, 20);

      // 延迟移除，确保拖拽图像设置完成
      setTimeout(() => {
        if (document.body.contains(dragPreview)) {
          document.body.removeChild(dragPreview);
        }
      }, 100);
    } catch (err) {
      console.error('❌ 拖拽初始化错误:', err);
    }
  }, []);

  // 定义扩展的节点类型
  type ExtendedNodeType = INodeBasic & { catalogId: string; catalogName: string };

  // 搜索过滤逻辑
  const filteredData = useMemo((): ICatalogAndNode[] | ExtendedNodeType[] => {
    if (!searchTerm) {
      if (selectedCatalog) {
        const catalogNodes = catalogs.find(cat => cat.id === selectedCatalog)?.nodes || [];
        return catalogNodes as ExtendedNodeType[];
      }
      return catalogs;
    }

    // 当有搜索词时，直接返回匹配的节点列表（不分类别）
    const allNodes: ExtendedNodeType[] = [];
    catalogs.forEach(catalog => {
      catalog.nodes.forEach(node => {
        if (node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.description.toLowerCase().includes(searchTerm.toLowerCase())) {
          allNodes.push({
            ...node,
            catalogId: catalog.id,
            catalogName: catalog.name
          });
        }
      });
    });

    return allNodes;
  }, [catalogs, searchTerm, selectedCatalog]);

  // 折叠状态
  if (menuCollapsed) {
    return (
      <div style={{width:0}}>
        <MenuHeader onClick={() => handleMenuCollapse(false)} $collapsed={false}>
          <CollapseFlag>⛊⛊⛊⛊⛊⛊⛊⛊⛊⛊⛊⛊</CollapseFlag>
        </MenuHeader>
        <MenuContainer $collapsed={true} />
      </div>
    );
  }

  // 空状态处理
  if (!dataSource) {
    return (
      <MenuContainer $collapsed={false}>
        <EmptyState>正在加载节点数据...</EmptyState>
      </MenuContainer>
    );
  }

  if (catalogs.length === 0) {
    return (
      <MenuContainer $collapsed={false}>
        <EmptyState>正在加载节点分类...</EmptyState>
      </MenuContainer>
    );
  }

  return (
    <div>
      <MenuHeader onClick={() => handleMenuCollapse(true)} $collapsed={true}>
        <CollapseFlag>•••••••</CollapseFlag>
      </MenuHeader>
      <MenuContainer $collapsed={false}>
        <SubMenuHeader>
          {/* 主标题视图 */}
          {/* <div style={{
            transform: (selectedCatalog || searchTerm) ? 'translateX(-100%)' : 'translateX(0)',
            position: (selectedCatalog || searchTerm) ? 'absolute' : 'relative',
            width: '100%',
            opacity: (selectedCatalog || searchTerm) ? 0 : 1,
            transition: (selectedCatalog || searchTerm) ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease 0.1s'
          }}>
            <div style={{ 
              color: '#f1f5f9', 
              fontSize: '16px', 
              fontWeight: '600',
              marginBottom: '2px'
            }}>
              使用节点来完成你的流程
            </div>
          </div> */}

          {/* 分类详情/搜索结果视图 */}
          <div style={{
            // transform: (selectedCatalog || searchTerm) ? 'translateX(0)' : 'translateX(100%)',
            position: (selectedCatalog || searchTerm) ? 'relative' : 'absolute',
            width: '100%',
            top: (selectedCatalog || searchTerm) ? 0 : '16px',
            left: (selectedCatalog || searchTerm) ? 0 : '16px',
            opacity: (selectedCatalog || searchTerm) ? 1 : 0,
            // transition: (selectedCatalog || searchTerm) ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease 0.1s' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease'
          }}>
            {(selectedCatalog || searchTerm) && (
              <div style={{ display: 'flex', alignItems: 'center',justifyItems:'center'}}>
                <button 
                  onClick={() => {
                    if (searchTerm) {
                      setSearchTerm('');
                    } else {
                      goBack();
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0px 14px',
                    // transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = '#f1f5f9'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#94a3b8'}
                >
                  <FaLongArrowAltLeft />
                </button>
                <div>
                  <div style={{ 
                    color: '#f1f5f9', 
                    fontSize: '14px',
                    padding :'8px 0px', 
                    fontWeight: '600',
                    marginBottom: '2px'
                  }}>
                    {searchTerm ? '搜索结果' : catalogs.find(cat => cat.id === selectedCatalog)?.name}
                  </div>
                  {/* <div style={{ 
                    color: '#64748b', 
                    fontSize: '12px'
                  }}>
                    {searchTerm 
                      ? `找到 ${Array.isArray(filteredData) ? filteredData.length : 0} 个匹配的节点`
                      : `Select a ${catalogs.find(cat => cat.id === selectedCatalog)?.name} Node to add to your workflow`
                    }
                  </div> */}
                </div>
              </div>
            )}
          </div>
        </SubMenuHeader>
        <MenuContent
          onContextMenu={(e) => {
            if (selectedCatalog || searchTerm) {
              e.preventDefault();
              if (searchTerm) {
                setSearchTerm('');
              } else {
                goBack();
              }
            }
          }}
        >
          <div style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden'
          }}>
            {/* 分类列表视图 */}
            <div style={{
              // transform: (selectedCatalog || searchTerm) ? 'translateX(-100%)' : 'translateX(0)',
              // transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              width: '100%',
              position: (selectedCatalog || searchTerm) ? 'absolute' : 'relative',
              top: 0,
              left: 0
            }}>
              {/* 分类页面的搜索框 */}
              <SearchContainer>
                <NodeMenuSearch
                  type="text"
                  placeholder="🔍 搜索节点..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchContainer>
              
              {Array.isArray(filteredData) && !selectedCatalog && !searchTerm && (filteredData as ICatalogAndNode[]).map((catalog) => (
                <CatalogHeader
                  key={catalog.id}
                  $expanded={false}
                  onClick={() => selectCatalog(catalog.id)}
                  // style={{
                  //   margin: '8px 12px',
                  //   borderRadius: '8px',
                  //   border: '1px solid rgba(255,255,255,0.1)',
                  //   background: 'rgba(0,0,0,0.2)',
                  //   cursor: 'pointer'
                  // }}
                >
                  <CatalogHeaderContent>
                    <CatalogIcon
                      dangerouslySetInnerHTML={{ __html: catalog.icon }}
                    />
                    <CatalogText>
                      <CatalogTitle>{catalog.name}</CatalogTitle>
                      <CatalogDescription>{catalog.description}</CatalogDescription>
                    </CatalogText>
                  </CatalogHeaderContent>
                  <ExpandIcon $expanded={false}>
                  ➧
                  </ExpandIcon>
                </CatalogHeader>
              ))}
            </div>

            {/* 节点列表视图（包括搜索结果和分类节点） */}
            <div 
              style={{
                // transform: (selectedCatalog || searchTerm) ? 'translateX(0)' : 'translateX(100%)',
                // transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                width: '100%',
                position: (selectedCatalog || searchTerm) ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                cursor: (selectedCatalog || searchTerm) ? 'context-menu' : 'default'
              }}
              title={(selectedCatalog || searchTerm) ? '右键返回' : ''}
            >
              {/* 节点页面的搜索框 */}
              {(selectedCatalog || searchTerm) && (
                <SearchContainer>
                  <NodeMenuSearch
                    type="text"
                    placeholder={searchTerm ? "🔍 搜索节点..." : `🔍 搜索 ${catalogs.find(cat => cat.id === selectedCatalog)?.name} 的节点...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchContainer>
              )}
              
              {/* 显示节点列表 */}
              {(selectedCatalog || searchTerm) && Array.isArray(filteredData) && (filteredData as (INodeBasic | ExtendedNodeType)[]).map((node, index) => {
                const extendedNode = node as ExtendedNodeType;
                const basicNode = node as INodeBasic;
                return (
                  <NodeItem
                    key={`${searchTerm ? extendedNode.catalogId : selectedCatalog}-${basicNode.kind}-${basicNode.name}-${index}`}
                    draggable
                    onDragStart={(event) => handleDragStart(event, basicNode)}
                    title="拖拽到画布添加节点"
                    style={{
                      margin: '0 12px 8px 12px',
                      opacity: (selectedCatalog || searchTerm) ? 1 : 0,
                      // transition: 'opacity 0.3s ease 0.1s'
                    }}
                  >
                    <NodeContent>
                      <NodeIconContainer>
                        <NodeIcon src={getThemeIcon(basicNode.icon, themeMode, basicNode.kind, searchTerm ? extendedNode.catalogId : (selectedCatalog || undefined)) || '/nodes/default/default.svg'} alt={basicNode.name} />
                      </NodeIconContainer>
                      <NodeTextContent>
                        <NodeTitle>
                          {basicNode.name}
                          {searchTerm && extendedNode.catalogName && (
                            <span style={{ 
                              fontSize: '10px', 
                              color: '#64748b', 
                              marginLeft: '8px',
                              fontWeight: 'normal'
                            }}>
                              ({extendedNode.catalogName})
                            </span>
                          )}
                        </NodeTitle>
                        <NodeDescription title={basicNode.description}>{basicNode.description}</NodeDescription>
                      </NodeTextContent>
                    </NodeContent>
                  </NodeItem>
                );
              })}
              
              {/* 搜索无结果提示 */}
              {searchTerm && Array.isArray(filteredData) && filteredData.length === 0 && (
                <div style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '14px'
                }}>
                  未找到匹配的节点
                </div>
              )}
            </div>
          </div>
        </MenuContent>
      </MenuContainer>
    </div>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数 - 深度比较dataSource数组
  if (prevProps.onMenuCollapseChange !== nextProps.onMenuCollapseChange) {
    return false;
  }

  // 比较dataSource数组长度
  if (prevProps.dataSource?.length !== nextProps.dataSource?.length) {
    return false;
  }

  // 如果都为空或null，认为相等
  if (!prevProps.dataSource && !nextProps.dataSource) {
    return true;
  }

  // 如果其中一个为空，认为不相等
  if (!prevProps.dataSource || !nextProps.dataSource) {
    return false;
  }

  // 深度比较每个catalog
  for (let i = 0; i < prevProps.dataSource.length; i++) {
    const prevCatalog = prevProps.dataSource[i];
    const nextCatalog = nextProps.dataSource[i];

    // 添加安全检查
    if (!prevCatalog || !nextCatalog) {
      return false;
    }

    if (prevCatalog.id !== nextCatalog.id ||
      prevCatalog.name !== nextCatalog.name ||
      prevCatalog.description !== nextCatalog.description ||
      prevCatalog.icon !== nextCatalog.icon ||
      prevCatalog.nodes?.length !== nextCatalog.nodes?.length) {
      return false;
    }

    // 比较nodes数组
    if (prevCatalog.nodes && nextCatalog.nodes) {
      for (let j = 0; j < prevCatalog.nodes.length; j++) {
        const prevNode = prevCatalog.nodes[j];
        const nextNode = nextCatalog.nodes[j];

        // 添加安全检查
        if (!prevNode || !nextNode) {
          return false;
        }

        if (prevNode.kind !== nextNode.kind ||
          prevNode.name !== nextNode.name ||
          prevNode.description !== nextNode.description ||
          prevNode.icon !== nextNode.icon ||
          prevNode.version !== nextNode.version) {
          return false;
        }
      }
    }
  }

  return true;
});

// 设置displayName以便调试
WorkflowMenu.displayName = 'WorkflowMenu'