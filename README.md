# S3 Manager

简洁高效的个人对象存储文件管理系统，支持所有 S3 兼容存储服务（Cloudflare R2、AWS S3、MinIO 等）。

A simple and efficient personal object storage file management system, supporting all S3-compatible storage services (Cloudflare R2, AWS S3, MinIO, etc.).

## 功能特性

- **多存储桶管理** — 同时配置和管理多个 S3 兼容存储桶，支持 AWS S3、Cloudflare R2、MinIO 等
- **文件操作** — 上传（拖拽 + 点击）、下载、删除、重命名、移动、复制
- **文件预览** — 图片（缩放/旋转）、视频、音频、代码（语法高亮）、Markdown、纯文本
- **文件夹导航** — 面包屑路径导航，新建文件夹
- **批量操作** — 框选/多选文件，批量删除、移动、复制、下载
- **视图切换** — 网格视图 / 列表视图
- **文件搜索** — 按文件名实时搜索过滤
- **右键菜单** — 快捷操作菜单
- **主题切换** — 亮色 / 暗色 / 跟随系统，支持平滑过渡动画
- **国际化** — 中文 / 英文双语支持
- **安装向导** — 引导式数据库配置和管理员账户创建
- **安全认证** — 基于 NextAuth.js 的用户名密码登录
- **预签名 URL** — 安全的文件访问链接生成
- **缩略图生成** — 基于 Sharp 的图片缩略图
- **响应式设计** — 适配桌面和移动端

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 前端 | React 19, Tailwind CSS 4 |
| 状态管理 | Zustand |
| 数据请求 | TanStack React Query |
| 数据库 | SQLite (libSQL) + Drizzle ORM |
| 认证 | NextAuth.js v4 |
| 对象存储 | AWS S3 SDK |
| 图标 | Lucide React |
| 图片处理 | Sharp |
| 代码高亮 | react-syntax-highlighter |
| Markdown | react-markdown + remark-gfm |

## 快速开始

### 环境要求

- Node.js 18+
- npm 或其他包管理器

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd r2

# 安装依赖
npm install
```

### 配置

复制环境变量示例文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入以下配置：

```env
# 数据库配置（JSON 格式）
DATABASE_CONFIG={"driver":"sqlite","url":"file:.data/local.db"}

# NextAuth 密钥（生产环境请使用随机字符串）
NEXTAUTH_SECRET=your_nextauth_secret_here

# 应用地址
NEXTAUTH_URL=http://localhost:3000
```

### 启动

```bash
# 开发模式
npm run dev

# 生产构建
npm run build
npm run start
```

首次访问 `http://localhost:3000` 时，系统会自动跳转到安装向导页面，引导你完成数据库配置和管理员账户创建。

## 项目结构

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # API 路由
│   │   ├── auth/               # 认证接口 (NextAuth)
│   │   ├── buckets/            # 存储桶 CRUD
│   │   ├── files/              # 文件操作
│   │   │   ├── delete/         # 删除
│   │   │   ├── folder/         # 新建文件夹
│   │   │   ├── link/           # 获取预签名链接
│   │   │   ├── move/           # 移动/复制
│   │   │   ├── rename/         # 重命名
│   │   │   ├── thumbnail/      # 缩略图
│   │   │   ├── upload/         # 上传
│   │   │   └── route.ts        # 文件列表
│   │   ├── setup/              # 系统初始化
│   │   └── system/status/      # 系统状态
│   ├── auth/signin/            # 登录页
│   ├── setup/                  # 安装向导页
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 主页
├── components/                 # 组件
│   ├── dialogs/                # 对话框组件
│   │   ├── delete-progress-dialog.tsx
│   │   ├── move-copy-dialog.tsx
│   │   ├── new-folder-dialog.tsx
│   │   └── rename-dialog.tsx
│   ├── ui/                     # 基础 UI 组件
│   ├── bucket-selector.tsx     # 存储桶选择器
│   ├── context-menu.tsx        # 右键菜单
│   ├── drop-zone.tsx           # 拖拽上传区域
│   ├── file-card.tsx           # 文件卡片（网格视图）
│   ├── file-icon.tsx           # 文件图标
│   ├── file-list-item.tsx      # 文件列表项（列表视图）
│   ├── file-manager.tsx        # 文件管理器主组件
│   ├── file-preview.tsx        # 文件预览
│   ├── file-table.tsx          # 文件表格（核心组件）
│   ├── navbar.tsx              # 导航栏
│   ├── theme-menu.tsx          # 主题切换菜单
│   ├── theme-provider.tsx      # 主题 Provider
│   └── thumbnail.tsx           # 缩略图组件
├── hooks/                      # 自定义 Hooks
│   ├── use-files.ts            # 文件操作 Hook
│   ├── use-selection-box.ts    # 框选 Hook
│   ├── use-thumbnail.ts        # 缩略图 Hook
│   ├── use-translation.tsx     # 国际化 Hook
│   └── use-upload.ts           # 上传 Hook
├── lib/                        # 工具库
│   ├── db/                     # 数据库
│   │   ├── adapter.ts          # 数据库适配器
│   │   ├── index.ts            # 导出
│   │   └── schema.ts           # 表结构定义
│   ├── auth.ts                 # 认证配置
│   ├── s3.ts                   # S3 操作封装
│   ├── system.ts               # 系统设置
│   ├── translations.ts         # 翻译文本
│   └── utils.ts                # 工具函数
└── store/
    └── file-store.ts           # Zustand 状态管理
```

## 数据库

项目使用 SQLite（通过 libSQL）作为数据库，Drizzle ORM 作为查询构建器。

### 数据表

| 表名 | 说明 |
|------|------|
| `users` | 用户账户 |
| `buckets` | 存储桶配置 |
| `system_settings` | 系统设置 |

### 数据库命令

```bash
# 生成迁移文件
npm run db:generate

# 执行迁移
npm run db:migrate

# 推送 Schema 到数据库
npm run db:push

# 打开 Drizzle Studio 可视化管理
npm run db:studio
```

## 存储桶配置

支持所有 S3 兼容的对象存储服务，配置项包括：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| Display Name | 显示名称 | My R2 Storage |
| Endpoint | S3 端点 | `https://<account>.r2.cloudflarestorage.com` |
| Region | 区域 | `auto` |
| Bucket Name | 存储桶名称 | `my-bucket` |
| Access Key ID | 访问密钥 ID | — |
| Secret Access Key | 访问密钥 | — |
| Public URL | 公共访问 URL（可选） | `https://cdn.example.com` |

### 常见存储服务 Endpoint

- **Cloudflare R2**: `https://<account_id>.r2.cloudflarestorage.com`
- **AWS S3**: `https://s3.<region>.amazonaws.com`
- **MinIO**: `http://localhost:9000`

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/files` | 获取文件列表 |
| `POST` | `/api/files/upload` | 上传文件 |
| `DELETE` | `/api/files/delete` | 删除文件 |
| `POST` | `/api/files/folder` | 创建文件夹 |
| `GET` | `/api/files/link` | 获取预签名下载链接 |
| `PATCH` | `/api/files/move` | 移动文件 |
| `POST` | `/api/files/move` | 复制文件 |
| `POST` | `/api/files/rename` | 重命名文件 |
| `GET` | `/api/files/thumbnail` | 获取缩略图 |
| `GET` | `/api/buckets` | 获取存储桶列表 |
| `POST` | `/api/buckets` | 创建/测试存储桶 |
| `GET` | `/api/buckets/[id]` | 获取存储桶详情 |
| `PUT` | `/api/buckets/[id]` | 更新存储桶 |
| `DELETE` | `/api/buckets/[id]` | 删除存储桶 |
| `PATCH` | `/api/buckets/[id]` | 设置默认存储桶 |
| `GET` | `/api/setup` | 检查安装状态 |
| `POST` | `/api/setup` | 执行安装步骤 |
| `GET` | `/api/system/status` | 获取系统状态 |

## 开发

```bash
# 开发模式启动
npm run dev

# 代码检查
npm run lint

# 构建生产版本
npm run build
```

## License

Private
