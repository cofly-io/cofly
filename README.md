# Cofly - AI工作流自动化平台

<div align="center">

![Cofly Logo](https://img.shields.io/badge/Cofly-AI%20Workflow%20Platform-blue?style=for-the-badge)

[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE.md)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black)](https://nextjs.org/)

一个强大的可视化AI工作流自动化平台，专为开发者和自动化爱好者设计。

[功能特性](#功能特性) • [快速开始](#快速开始) • [架构设计](#架构设计) • [开发指南](#开发指南) • [贡献指南](#贡献指南)

</div>

## 🚀 功能特性

### 🎨 可视化工作流编辑器
- **拖拽式界面**: 基于ReactFlow的直观可视化编辑器
- **实时预览**: 工作流执行状态实时监控
- **节点管理**: 丰富的预置节点库，支持自定义节点

### 🤖 AI集成能力
- **多模型支持**: 集成主流AI模型和服务
- **智能代理**: 支持自定义AI代理和路由
- **CopilotKit集成**: 内置AI助手功能

### 🔗 丰富的连接器
- **数据库**: MySQL、PostgreSQL、MongoDB、Redis、Oracle、SQL Server等
- **社交平台**: 钉钉、飞书、企业微信等
- **文件处理**: S3、FTP、文件转换、Markdown处理
- **通用工具**: HTTP请求、邮件发送、加密解密、正则表达式等

### 🛠 MCP协议支持
- **Model Context Protocol**: 支持外部工具集成
- **扩展性**: 通过MCP协议轻松扩展功能
- **标准化**: 遵循MCP标准，确保兼容性

### 👥 团队协作
- **用户管理**: 完整的用户认证和权限系统
- **团队功能**: 支持团队协作和工作流共享
- **版本控制**: 工作流版本管理和回滚

## 🏗 架构设计

### Monorepo结构
```
cofly/
├── apps/                    # 应用程序
│   ├── web/                # 主Web应用 (端口3000)
│   └── docs/               # 文档站点 (端口3001)
├── packages/               # 共享包
│   ├── common/             # 通用工具库
│   ├── database/           # 数据库层 (Prisma)
│   ├── engine/             # 工作流执行引擎
│   ├── interfaces/         # TypeScript接口定义
│   ├── mcp-workflow-tools/ # MCP协议工具
│   ├── node-set/           # 工作流节点定义
│   └── ui/                 # 共享UI组件
└── examples/               # 示例实现
```

### 技术栈
- **前端**: Next.js 15 + React 19 + TypeScript
- **后端**: Next.js API Routes + Express.js
- **数据库**: Prisma ORM + MySQL/SQLite
- **UI**: styled CSS + Styled Components
- **构建**: Turborepo + pnpm
- **认证**: NextAuth.js

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- pnpm >= 10.14.0
- MySQL (可选，默认使用SQLite)

### 安装步骤

1. **克隆仓库**
```bash
git clone https://github.com/your-org/cofly.git
cd cofly
```

2. **安装依赖**
```bash
pnpm install
```

3. **环境配置**
```bash
# 复制环境变量模板
cp apps/web/.env.example apps/web/.env.local

# 编辑环境变量
# DATABASE_URL="sqlite:./dev.db"  # 或使用MySQL
# NEXTAUTH_SECRET="your-secret-key"
# NEXTAUTH_URL="http://localhost:3000"
```

4. **数据库初始化**
```bash
pnpm db:generate
pnpm db:push
```

5. **启动开发服务器**
```bash
# 启动所有服务
pnpm dev

# 或单独启动Web应用
pnpm dev:web
```

6. **访问应用**
- Web应用: http://localhost:3000
- 文档站点: http://localhost:3001

## 📖 使用指南

### 创建第一个工作流

1. **登录系统**: 访问 http://localhost:3000 并注册/登录
2. **进入工作台**: 点击"工作台"进入主界面
3. **创建工作流**: 
   - 点击"流程"标签
   - 从左侧节点面板拖拽节点到画布
   - 连接节点创建工作流
4. **配置节点**: 双击节点进行详细配置
5. **测试运行**: 点击"运行"按钮测试工作流

### 节点类型

- **触发器**: 手动触发、定时任务、Webhook、事件监听
- **AI节点**: 自定义代理、系统代理、路由代理
- **数据库**: 各种数据库的增删改查操作
- **文件处理**: 文件读写、格式转换、云存储
- **流程控制**: 条件判断、循环、合并、开关
- **通用工具**: HTTP请求、邮件、加密、正则等
- **社交集成**: 钉钉、飞书、企业微信消息推送

## 🛠 开发指南

### 开发命令

```bash
# 开发
pnpm dev                    # 启动所有应用
pnpm dev:web               # 仅启动Web应用
pnpm dev:docs              # 仅启动文档站点

# 构建
pnpm build                 # 构建所有包和应用
pnpm start                 # 启动生产版本

# 数据库
pnpm db:generate           # 生成Prisma客户端
pnpm db:push              # 推送数据库变更
pnpm db:studio            # 打开Prisma Studio

# 代码质量
pnpm lint                 # 代码检查
pnpm format               # 代码格式化
pnpm check-types          # TypeScript类型检查

# 清理
pnpm clean                # 清理构建产物
```

### 添加新节点

1. 在 `packages/node-set/src/nodes/` 下创建节点目录
2. 实现节点逻辑和配置
3. 添加节点图标和描述
4. 在 `packages/node-set/src/nodes/index.ts` 中导出
5. 运行 `pnpm build` 重新构建

### MCP工具集成

1. 在 `packages/mcp-workflow-tools/` 中添加MCP工具
2. 实现MCP协议接口
3. 在工作流中通过MCP节点调用

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 贡献方式
- 🐛 报告Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- 🎨 设计改进

### 开发流程
1. Fork本仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交Pull Request

### 代码规范
- 使用TypeScript进行类型安全开发
- 遵循ESLint和Prettier配置
- 编写单元测试
- 更新相关文档

## 📄 许可证

本项目采用 [Apache 2.0 许可证](LICENSE.md)。

## 🙏 致谢

感谢所有为Cofly项目做出贡献的开发者和用户！

特别感谢以下开源项目：
- [ReactFlow](https://reactflow.dev/) - 强大的流程图库
- [Next.js](https://nextjs.org/) - React全栈框架
- [Prisma](https://www.prisma.io/) - 现代数据库工具包
- [Turborepo](https://turbo.build/) - 高性能构建系统

## 📞 联系我们

- 📧 邮箱: [your-email@example.com]
- 💬 讨论: [GitHub Discussions](https://github.com/your-org/cofly/discussions)
- 🐛 问题反馈: [GitHub Issues](https://github.com/your-org/cofly/issues)

---

<div align="center">

**[⬆ 回到顶部](#cofly---ai工作流自动化平台)**

Made with ❤️ by the Cofly Team

</div>
