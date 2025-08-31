/**
 * 数据库服务 - 处理数据库相关的API调用
 */

export interface TableOption {
  value: string;
  label: string;
}

export interface FetchTablesResponse {
  loading: boolean;
  error: string | null;
  tableOptions: TableOption[];
}

/**
 * 获取数据库表名列表
 * @param datasourceId 数据源ID
 * @param search 搜索关键词（可选）
 * @returns 包含loading、error和tableOptions的响应对象
 */
export async function fetchDatabaseTables(
  datasourceId: string,
  search?: string
): Promise<FetchTablesResponse> {
  try {
    // 构建API请求URL
    const url = new URL(`/api/database/tables/${datasourceId}`, window.location.origin);
    if (search) {
      url.searchParams.append('search', search);
    }

    // 发送API请求
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // 检查响应数据格式
    if (!result.success) {
      throw new Error(result.message || 'API request failed');
    }
    
    if (!result.data || !Array.isArray(result.data.tables)) {
      throw new Error('Invalid response format: expected data.tables array');
    }

    // 转换数据格式为TableOption数组
    const tableOptions: TableOption[] = result.data.tables.map((table: any) => ({
      value: table.value || table.name || String(table),
      label: table.label || table.name || String(table)
    }));

    return {
      loading: false,
      error: null,
      tableOptions
    };
  } catch (error) {
    console.error('Failed to fetch database tables:', error);
    
    return {
      loading: false,
      error: error instanceof Error ? error.message : 'Failed to fetch tables',
      tableOptions: []
    };
  }
}

/**
 * 创建一个兼容旧接口的包装函数
 * 这个函数返回简单的数组格式，用于向后兼容
 * @param datasourceId 数据源ID
 * @param search 搜索关键词（可选）
 * @returns TableOption数组
 */
export async function fetchDatabaseTablesLegacy(
  datasourceId: string,
  search?: string
): Promise<TableOption[]> {
  const response = await fetchDatabaseTables(datasourceId, search);
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.tableOptions;
}