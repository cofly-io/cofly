
export const urlJoin = (baseUrl: string, ...paths: string[]) => {
  return [baseUrl, ...paths]
    .map((part, index) => {
      if (index === 0) {
        return part.replace(/\/+$/, ''); // 移除基础URL末尾斜杠
      }
      return part.replace(/^\/+/, '').replace(/\/+$/, ''); // 移除路径首尾斜杠
    })
    .join('/');
}