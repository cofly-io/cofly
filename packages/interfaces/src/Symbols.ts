//创建一个IoC容器和符号定义文件
export const Symbols = {
  NodeRegistry: Symbol.for('NodeRegistry'),
  NodeType: Symbol.for('NodeType'),
  // Connect 相关符号
  ConnectType: Symbol.for('ConnectType'),
  ConnectRegistry: Symbol.for('ConnectRegistry'),
};