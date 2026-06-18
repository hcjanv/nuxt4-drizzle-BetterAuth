## Nuxt 4 SaaS 管理系统模板

这是一个面向 SaaS 或内部管理系统的 Nuxt 4 项目模板，内置登录注册、多组织、MySQL、Drizzle ORM、邮件模板、本地文件上传和 AI 问答能力。项目结构尽量简洁，适合在此基础上继续扩展业务功能。

## 核心功能

- Nuxt 4 + Nitro，支持服务端渲染。
- Nuxt UI v4 组件体系，默认中文界面。
- Better Auth 登录认证，支持邮箱密码、双因素认证、管理员和组织插件。
- MySQL + Drizzle ORM，包含类型化数据表结构。
- h3-zod 请求参数校验。
- Vue Email 邮件模板，默认集成 Resend 邮件服务。
- `nuxt-file-storage` 本地文件上传。
- TypeScript 与 ESLint 已配置。
- AI 问答接口，默认按 OpenAI-compatible 方式接入国内模型服务。

## 技术栈

- Nuxt 4、Nitro、Vite
- Nuxt UI v4、VueUse
- Better Auth
- Drizzle ORM、drizzle-kit、mysql2
- h3-zod、Vue Email、Resend
- AI SDK、OpenAI-compatible provider

## 项目结构

```text
app/                页面、组件、布局和前端资源
modules/            项目模块：auth、email、helper
server/             Nitro API、数据库结构、服务端工具和任务
shared/             共享类型与枚举
public/storage/     本地上传文件目录
```

重点模块：

- `modules/auth`：认证接口、`useAuth()` 组合式函数、全局路由中间件。
- `modules/email`：`sendEmail()` 邮件发送工具，支持 `resend` 和 `smtp` 配置。
- `server/api/chat.ts`：AI 对话接口，并限制数据库工具只能执行只读 `SELECT` 查询。

## 环境要求

- Node.js 20+
- pnpm 10+
- MySQL 8+ 或兼容数据库

## 快速启动

1. 安装依赖：

```bash
pnpm install
```

2. 复制环境变量文件：

```bash
cp .env.example .env
```

3. 推送数据库结构：

```bash
pnpm db:push
```

4. 启动开发服务器：

```bash
pnpm dev
```

5. 打开本地地址：

```text
http://localhost:3699
```

## 常用环境变量

- `DATABASE_URL`：MySQL 连接地址，例如 `mysql://user:pass@host:3306/dbname`。
- `NUXT_SITE_URL`：站点访问地址，默认 `http://localhost:3699`。
- `NUXT_SITE_NAME`：展示在页面和邮件中的站点名称。
- `BETTER_AUTH_SECRET`：Better Auth 使用的密钥。

AI 配置：

- `AI_PROVIDER_NAME`：AI 服务商名称，默认 `siliconflow`。
- `AI_API_KEY`：AI 服务商 API Key。
- `AI_BASE_URL`：OpenAI-compatible 接口地址。
- `AI_MODEL`：使用的模型名称。

邮件配置：

- `MAIL_PROVIDER=resend`
- `MAIL_RESEND_KEY=<key>`
- `MAIL_FROM="Nuxt SaaS 系统 <noreply@example.com>"`

可选 SMTP 配置：

- `MAIL_PROVIDER=smtp`
- `MAIL_SMTP_HOST`
- `MAIL_SMTP_PORT`
- `MAIL_SMTP_USERNAME`
- `MAIL_SMTP_PASSWORD`
- `MAIL_SMTP_SECURE=true|false`

## 数据库与 Drizzle

- 数据表结构：`server/database/schema/*`
- 推送结构：`pnpm db:push`
- 写入演示数据：`pnpm db:seed`
- 打开 Drizzle Studio：`pnpm db:studio`
- 重新生成 Better Auth 数据表：`pnpm auth:db`

## 认证与组织

- 认证接口位于 `/api/auth/**`。
- 前端通过 `useAuth()` 获取会话、组织列表、当前组织和切换组织方法。
- 全局中间件会拦截未登录用户，并跳转到登录页。
- 已登录但没有组织时，会跳转到组织创建页。
- 开发环境登录页会自动填充演示账号：`test@example.com / password`。

## AI 问答

- 页面地址：`/ai`
- 服务端接口：`server/api/chat.ts`
- 默认使用中文回答。
- 只有用户询问数据库数据时才会调用 SQL 工具。
- SQL 工具只允许只读 `SELECT`，会拦截写入、删除、建表和多语句 SQL。

## 邮件

- 邮件模板：`server/emails/templates.ts`
- 发送工具：`sendEmail({ to, subject, html })`
- 默认服务商：Resend
- SMTP 服务当前是预留实现，需要接入真实 SMTP 客户端后才能使用。

## 上传与存储

- 上传接口：`POST /api/upload`
- 请求体：`{ files: File[] }`
- 返回公开访问地址：`/storage/...`
- 默认存储目录：`public/storage`

## 常用脚本

```jsonc
{
    "build": "nuxt build",
    "dev": "nuxt dev --port 3699",
    "preview": "nuxt preview --port 3699",
    "typecheck": "nuxt typecheck",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "db:push": "drizzle-kit push",
    "db:seed": "node ./scripts/seed-dev.mjs",
    "db:studio": "drizzle-kit studio",
    "auth:db": "npx @better-auth/cli@latest generate ..."
}
```

## 部署

构建项目：

```bash
pnpm build
```

本地预览：

```bash
pnpm preview
```

使用 PM2 启动：

```bash
pm2 start ecosystem.config.cjs
```

Nitro 服务入口是 `./.output/server/index.mjs`，生产端口已在 `ecosystem.config.cjs` 中配置为 `3699`。

## 开发约定

- 页面数据请求优先使用 `useFetch('/api/<resource>')`。
- 表单错误统一交给 `handleError(error, form)` 处理。
- 需要租户隔离的数据必须从服务端会话里获取 `organizationId`，不要信任客户端传入的组织 ID。
- Drizzle 查询必须按组织过滤，避免跨组织数据泄露。
- 新增 ID 使用 `ulid()`，更新数据时同步维护更新时间字段。

## 备注

- Nitro Tasks 已启用，可查看 `server/tasks/*`。
