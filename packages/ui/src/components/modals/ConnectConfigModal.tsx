import React, { useState, useEffect } from 'react';

import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ConnectPageModalContent,
  CloseButton,
  TabButton,
  TabContent,
  PremiumModalContainer,
  PremiumConnectPageModalContainer,
  PremiumTitleDesc,
  TruncatedDescription,
  TabNav,
  useFilter
} from '../basic';
import { ConnectDetailsView } from '../forms/connect/ConnectDetailsView';
import { LuLink2 } from "react-icons/lu";
import {
  ConnectIcon,
  ConnectInfo,
  ConnectName,
  ConnectGrid,
  ConnectCard,
  CategorySection,
  CategoryTitle,
  ConnectCategoriesContainer,
  ErrorState,
  LoadingState
} from './ConnectConfigStyles';

// 通用连接接口，适配从API返回的数据结构
interface ConnectBasicInfo {
  id: string;
  name: string;
  type: string;
  provider: string;
  icon: string;
  description: string;
  version: string;
  tags?: string[];
  validateConnection: boolean;
  connectionTimeout?: number;
}

interface ConnectWithOverview {
  overview: ConnectBasicInfo;
}

interface ConnectConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
  onTest?: (config: Record<string, any>, message?: string) => Promise<any>;
  onStreamTest?: (config: Record<string, any>, message: string, onChunk: (chunk: string) => void) => Promise<any>;
  editMode?: boolean;
  editData?: any;
  categories?: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
  }>;
  // 数据获取回调，由父组件提供
  onFetchConnects?: () => Promise<ConnectWithOverview[]>;
  onFetchConnectDetails?: (connectId: string) => Promise<any>;
}

export const ConnectConfigModal: React.FC<ConnectConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onTest,
  onStreamTest,
  editMode = false,
  editData,
  categories = [],
  onFetchConnects,
  onFetchConnectDetails
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [connects, setConnects] = useState<ConnectWithOverview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedConnect, setSelectedConnect] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Use filter hook for connect filtering
  const {
    query: filterQuery,
    setQuery: setFilterQuery,
    filteredItems: filteredConnects,
    isFiltering
  } = useFilter(
    connects,
    (connect, query) => {
      return (
        connect.overview.name.toLowerCase().includes(query) ||
        connect.overview.description.toLowerCase().includes(query) ||
        connect.overview.provider.toLowerCase().includes(query) ||
        (connect.overview.tags?.some(tag => tag.toLowerCase().includes(query)) ?? false)
      );
    },
    300
  );

  // 获取分类信息的辅助函数
  const getCategoryInfo = (type: string) => {
    const category = categories.find(cat => cat.type === type);
    return {
      name: category?.name || type,
      icon: <LuLink2 /> // 不使用icon 了，用统一的默认图标
    };
  };

  // 获取连接列表
  const fetchConnects = async () => {
    if (!onFetchConnects) {
      setError('未提供连接数据获取方法');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const connectsData = await onFetchConnects();
      setConnects(connectsData || []);
    } catch (err) {
      console.error('获取连接列表失败:', err);
      setError(err instanceof Error ? err.message : '获取连接列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !editMode) {
      fetchConnects();
      setSelectedConnect(null); // 重置选中的连接
      setActiveTab('all'); // 重置到全部标签
      setFilterQuery(''); // 重置搜索查询
    }
  }, [isOpen, editMode]);

  // 重置编辑模式状态
  useEffect(() => {
    if (editMode) {
      setSelectedConnect(null); // 重置选中的连接，等待编辑数据加载
    }
  }, [editMode]);

  const handleConnectSelect = async (connect: ConnectWithOverview) => {

    if (!onFetchConnectDetails) {
      setError('未提供连接详情获取方法');
      return;
    }

    try {
      // 获取连接详情
      const connectData = await onFetchConnectDetails(connect.overview.id);

      // 确保 connect 对象包含所有必需的属性
      const connectWithDefaults = {
        ...connectData,
        fields: connectData.fields || [], // 防止 fields 为undefined
        validateConnection: connectData.validateConnection ?? true,
        connectType: connect.overview.type // 添加连接类型信息
      };
      setSelectedConnect(connectWithDefaults);
    } catch (err) {
      console.error('获取连接详情失败:', err);
      setError(err instanceof Error ? err.message : '获取连接详情失败');
    }
  };

  const handleBackToList = () => {
    setSelectedConnect(null);
  };

  const handleConnectSave = async (connectData: any) => {
    if (onSave) {
      onSave(connectData);
    }
    onClose();
  };

  // Filtered connects are now handled by useFilter hook

  // 按类型分组连接
  const groupedConnects = filteredConnects.reduce((groups, connect) => {
    // 添加安全检查，确保 connect 和 connect.overview 存在
    if (!connect || !connect.overview || !connect.overview.type) {
      console.warn('无效的连接数据:', connect);
      return groups;
    }

    const connectType = connect.overview.type;
    if (!groups[connectType]) {
      groups[connectType] = [];
    }
    groups[connectType]!.push(connect);
    return groups;
  }, {} as Record<string, ConnectWithOverview[]>);

  // 根据当前选中的标签过滤分组
  const displayedGroups = activeTab === 'all'
    ? groupedConnects
    : { [activeTab]: groupedConnects[activeTab] || [] };

  const renderConnectsList = () => (
    <TabContent>
      {error && (
        <ErrorState>
          ⚠️ {error}
        </ErrorState>
      )}

      {loading ? (
        <LoadingState>
          🔄 正在加载连接类型...
        </LoadingState>
      ) : (
        <ConnectCategoriesContainer>
          {Object.entries(displayedGroups).map(([type, typeConnects]) => (
            <CategorySection key={type}>
              <CategoryTitle>
                <span>{getCategoryInfo(type).icon}</span>
                {getCategoryInfo(type).name}
                <span style={{
                  fontSize: '12px',
                  fontWeight: 'normal',
                  color: '#666',
                  marginLeft: '8px'
                }}>
                  ({typeConnects.length})
                </span>
              </CategoryTitle>
              <ConnectGrid>
                {typeConnects.map((connect) => (
                  <ConnectCard
                    key={connect.overview.id}
                    onClick={() => handleConnectSelect(connect)}
                  >
                    <ConnectIcon>
                      <img
                        src={`/connects/${connect.overview.type || 'other'}/${connect.overview.id}/${connect.overview.icon}`}
                        alt={connect.overview.name}
                        style={{ width: '32px', height: '32px' }}
                      />
                    </ConnectIcon>
                    <ConnectInfo>
                      <ConnectName>{connect.overview.name}</ConnectName>
                      <TruncatedDescription 
                        text={connect.overview.description}
                        style={{
                          margin: 0,
                          fontSize: '13px',
                          color: 'rgba(255, 255, 255, 0.7)',
                          lineHeight: 1.4
                        }}
                      />
                    </ConnectInfo>
                  </ConnectCard>
                ))}
              </ConnectGrid>
            </CategorySection>
          ))}

          {!loading && filteredConnects.length === 0 && connects.length > 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              没有找到匹配的连接类型
            </div>
          )}

          {!loading && connects.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              暂无可用的连接类型
            </div>
          )}
        </ConnectCategoriesContainer>
      )}
    </TabContent>
  );



  // Search and filter is now handled by EnhancedTabNav

  // 在编辑模式下处理传入的编辑数据
  useEffect(() => {
    if (editMode && editData && editData.connectDefinition) {
      // 构造符合 ConnectDetailsView 期望的数据结构
      const transformedEditData = {
        ...editData.connectDefinition,
        // 编辑相关信息
        editInfo: {
          id: editData.id,
          connectId: editData.ctype,
          name: editData.name,
          configInfo: editData.configInfo || {}
        }
      };
      
      console.log('📝 [ConnectConfigModal] 转换后的数据:', transformedEditData);
      setSelectedConnect(transformedEditData);
    }
  }, [editMode, editData]);

  // 渲染主要内容
  const renderContent = () => {
    // 如果是编辑模式
    if (editMode && editData) {

      // 如果正在加载连接定义
      if (loading) {
        return (
          <div style={{ textAlign: 'center', padding: '40px', fontSize: "13px" }}>
            <div>🔄 正在加载连接定义...</div>
          </div>
        );
      }

      // 如果加载失败
      if (error) {
        return (
          <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
            <div>❌ {error}</div>
          </div>
        );
      }

      // 如果还没有获取到连接定义
      if (!selectedConnect) {
        return (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>⏳ 准备编辑数据...</div>
          </div>
        );
      }

      // 根据类型选择视图--need to delete
      // if (editData.mtype === 'llm') {
      // return (
      //   <LLMCntDetailsView
      //     connect={selectedConnect}
      //     onClose={onClose}
      //     onSave={handleConnectSave}
      //     onTest={onTest}
      //     editMode={true}
      //     editData={selectedConnect.editInfo}
      //     showBackButton={false}
      //   />
      // );
      // } else {
      return (
        <ConnectDetailsView
          connect={selectedConnect}
          onClose={onClose}
          onSave={handleConnectSave}
          onTest={onTest}
          onStreamTest={onStreamTest}
          editMode={true}
          editData={selectedConnect.editInfo}
          showBackButton={true}
        />
      );
      // }
    }

    // 如果选择了某个连接，显示连接详情
    if (selectedConnect) {
      return (
        <ConnectDetailsView
          connect={selectedConnect}
          onClose={handleBackToList}
          onSave={handleConnectSave}
          onTest={onTest}
          onStreamTest={onStreamTest}
          showBackButton={true}
        />
      );
    }

    // 否则显示连接列表
    return (
      <>
        <TabNav
          filterValue={filterQuery}
          onFilterChange={setFilterQuery}
          filterPlaceholder="搜索连接名称、描述或标签..."
        >
          <TabButton
            $active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
          >
            全部
          </TabButton>
          {categories.map((category) => (
            <TabButton
              key={category.type}
              $active={activeTab === category.type}
              onClick={() => setActiveTab(category.type)}
            >
              {category.name}
            </TabButton>
          ))}
        </TabNav>

        {loading ? (
          <LoadingState>加载中...</LoadingState>
        ) : error ? (
          <ErrorState>{error}</ErrorState>
        ) : (
          renderConnectsList()
        )}
      </>
    );
  };

  if (!isOpen) return null;

  // 判断是否显示连接列表（使用固定高度）还是连接详情（使用自适应高度）
  const isShowingList = !selectedConnect && !editMode;
  const ModalContainer = isShowingList ? PremiumConnectPageModalContainer : PremiumModalContainer;
  const ModalContentComponent = isShowingList ? ConnectPageModalContent : ModalContent;

  return (
    <ModalBackdrop>
      <ModalContainer style={!isShowingList ? { width: '60vw', maxWidth: '80vw' } : undefined}>
        {isShowingList && (
          <ModalHeader>
            <PremiumTitleDesc>
              <h4>添加新连接</h4>
              <p>选择并配置一个新的连接</p>
            </PremiumTitleDesc>
            <CloseButton onClick={onClose}>×</CloseButton>
          </ModalHeader>
        )}
        <ModalContentComponent>
          {renderContent()}
        </ModalContentComponent>
      </ModalContainer>
    </ModalBackdrop>
  );
};
