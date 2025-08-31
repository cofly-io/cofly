// 节点级状态管理工具

// 用于跟踪已添加的字段（按节点ID隔离）
export const getGlobalAddedFields = (nodeId?: string): Set<string> => {
  const key = nodeId ? `__addedFields_${nodeId}` : '__addedFields';
  if (!(window as any)[key]) {
    (window as any)[key] = new Set<string>();
  }
  return (window as any)[key];
};

// 用于跟踪已删除的字段（按节点ID隔离）
export const getGlobalDeletedFields = (nodeId?: string): Set<string> => {
  const key = nodeId ? `__deletedFields_${nodeId}` : '__deletedFields';
  if (!(window as any)[key]) {
    (window as any)[key] = new Set<string>();
  }
  return (window as any)[key];
};

// 添加字段到节点状态
export const addFieldToGlobal = (fieldName: string, nodeId?: string): Set<string> => {
  const globalFields = getGlobalAddedFields(nodeId);
  const deletedFields = getGlobalDeletedFields(nodeId);
  
  // 只有当字段不在已删除列表中且不在已添加列表中时才添加
  if (!deletedFields.has(fieldName) && !globalFields.has(fieldName)) {
    globalFields.add(fieldName);
    const key = nodeId ? `__addedFields_${nodeId}` : '__addedFields';
    (window as any)[key] = globalFields;
  }
  
  return globalFields;
};

// 批量添加字段到节点状态（用于 collection）
export const addFieldsToGlobal = (fieldNames: string[], nodeId?: string): Set<string> => {
  const globalFields = getGlobalAddedFields(nodeId);
  const deletedFields = getGlobalDeletedFields(nodeId);
  
  fieldNames.forEach(fieldName => {
    if (!deletedFields.has(fieldName) && !globalFields.has(fieldName)) {
      globalFields.add(fieldName);
    }
  });
  
  const key = nodeId ? `__addedFields_${nodeId}` : '__addedFields';
  (window as any)[key] = globalFields;
  return globalFields;
};

// 从节点状态删除字段
export const removeFieldFromGlobal = (fieldName: string, nodeId?: string): { addedFields: Set<string>; deletedFields: Set<string> } => {
  // 从已添加字段中移除
  const globalFields = getGlobalAddedFields(nodeId);
  globalFields.delete(fieldName);
  const addedKey = nodeId ? `__addedFields_${nodeId}` : '__addedFields';
  (window as any)[addedKey] = globalFields;

  // 添加到已删除字段中，防止重新添加
  const deletedFields = getGlobalDeletedFields(nodeId);
  deletedFields.add(fieldName);
  const deletedKey = nodeId ? `__deletedFields_${nodeId}` : '__deletedFields';
  (window as any)[deletedKey] = deletedFields;

  return {
    addedFields: globalFields,
    deletedFields: deletedFields
  };
};

// 批量从节点状态删除字段（用于 collection）
export const removeFieldsFromGlobal = (fieldNames: string[], nodeId?: string): { addedFields: Set<string>; deletedFields: Set<string> } => {
  // 从已添加字段中移除
  const globalFields = getGlobalAddedFields(nodeId);
  fieldNames.forEach(fieldName => {
    globalFields.delete(fieldName);
  });
  const addedKey = nodeId ? `__addedFields_${nodeId}` : '__addedFields';
  (window as any)[addedKey] = globalFields;

  // 添加到已删除字段中，防止重新添加
  const deletedFields = getGlobalDeletedFields(nodeId);
  fieldNames.forEach(fieldName => {
    deletedFields.add(fieldName);
  });
  const deletedKey = nodeId ? `__deletedFields_${nodeId}` : '__deletedFields';
  (window as any)[deletedKey] = deletedFields;

  return {
    addedFields: globalFields,
    deletedFields: deletedFields
  };
};

// 清空指定节点的状态（用于重置）
export const clearGlobalState = (nodeId?: string): void => {
  if (nodeId) {
    (window as any)[`__addedFields_${nodeId}`] = new Set<string>();
    (window as any)[`__deletedFields_${nodeId}`] = new Set<string>();
  } else {
    (window as any).__addedFields = new Set<string>();
    (window as any).__deletedFields = new Set<string>();
  }
};

// 清空所有节点的状态
export const clearAllNodeStates = (): void => {
  Object.keys(window as any).forEach(key => {
    if (key.startsWith('__addedFields_') || key.startsWith('__deletedFields_')) {
      delete (window as any)[key];
    }
  });
  // 也清空旧的全局状态
  clearGlobalState();
};