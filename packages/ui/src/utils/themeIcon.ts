/**
 * 主题图标工具函数
 * 根据主题模式和图标数据返回正确的图标路径
 */

export interface ThemeIconData {
  light: string;
  dark: string;
}

/**
 * 根据主题选择正确的图标
 * @param iconData 图标数据，可以是字符串或包含 light/dark 属性的对象
 * @param themeMode 主题模式，'light' 或 'dark'
 * @param nodeKind 节点类型，用于构建完整路径
 * @param catalog 节点分类，用于构建完整路径
 * @param category 节点分类的备选字段（向后兼容）
 * @returns 图标路径字符串，如果无法确定图标则返回 null
 */
export function getThemeIcon(iconData: string | ThemeIconData, themeMode: 'light' | 'dark', nodeKind?: string, catalog?: string): string | null {
  let iconFileName: string;

  // 处理 undefined 或 null 的情况
  if (!iconData) {
    return null;
  }

  if (typeof iconData === 'string') {
    iconFileName = iconData; // 如果是字符串，直接使用
  } else if (typeof iconData === 'object' && iconData !== null) {
    // 如果是对象，根据主题选择对应的图标
    iconFileName = themeMode === 'dark' ? iconData.dark : iconData.light;
  } else {
    iconFileName = iconData as string; // 兜底返回原值
  }

  // 确保 iconFileName 不是 undefined 或 null
  if (!iconFileName) {
    return null;
  }

  // 如果已经是完整路径（包含 /nodes/、/connects/ 或 http），直接返回
  if (iconFileName.includes('/nodes/') || iconFileName.includes('/connects/') || iconFileName.startsWith('/')) {
    return iconFileName;
  }

  // 如果提供了 nodeKind，构建完整路径
  if (nodeKind) {
    // 优先使用 catalog，如果没有则使用 category 作为备选
    const catalogName = catalog;
    
    // 如果提供了分类信息，使用新的分类路径结构
    if (catalogName) {
      const fullPath = `/nodes/${catalogName}/${nodeKind}/${iconFileName}`;
      return fullPath;
    }

    // 如果没有分类信息，使用旧的路径结构（向后兼容）
    const fallbackPath = `/nodes/${nodeKind}/${iconFileName}`;
    return fallbackPath;
  }

  // 如果没有提供 nodeKind 但 iconData 是对象且有 iconName，使用 iconName 构建路径
  if (typeof iconData === 'object' && iconData !== null && 'iconName' in iconData &&
    iconFileName && !iconFileName.startsWith('/') && !iconFileName.startsWith('http')) {
    return `/nodes/${(iconData as any).iconName}/${iconFileName}`;
  }

  // 否则返回原始文件名
  return iconFileName || null;
}
