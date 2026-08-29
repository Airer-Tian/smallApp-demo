# SmallApp 前端演示版（纯前端 / 无后端）

这是一个**完全运行在浏览器内**的 SmallApp 管理后台演示版：所有接口都由前端内置的「伪后端」拦截，
数据保存在 `localStorage`，刷新后依然存在。无需任何服务端、数据库或 Redis，可直接部署为静态站点
（GitHub Pages、Render Static Site、Vercel、Nginx 静态目录等）。

## 默认账号

| 用户名 | 密码 | 角色 |
| --- | --- | --- |
| `admin` | `123456` | 超级管理员（全部菜单与按钮权限） |
| `zhangsan` | `123456` | 普通用户 |
| `zhaoliu` | `123456` | 审计员（仅首页 + 日志） |

> 演示版统一口令为 `123456`，仅用于体验；真实部署请使用后端版本并启用强密码策略。

## 本地运行

```bash
npm install
npm run dev        # 开发预览 http://localhost:5173
npm run build      # 产出 dist/ 静态资源
npm run preview    # 预览构建产物
```

## 部署为静态站点

构建产物在 `dist/`，任意静态托管直接托管该目录即可（使用 hash 路由，无需服务端 rewrite）。

- **GitHub Pages**：将 `dist/` 推到仓库并用 Pages 部署。
- **Render**：新建 Static Site，Build Command 填 `npm install && npm run build`，Publish 目录填 `dist`。
- **Vercel / Netlify**：框架选 Vite，输出目录 `dist`。

环境变量（默认即开启 mock，一般无需修改）：

- `VITE_USE_MOCK=true`：走前端伪后端（默认）。设为 `false` 可切回真实后端（需自行配置 `VITE_API_BASE`）。

## 数据重置

清空浏览器 `localStorage` 中键 `smallapp_demo_v1` 即可恢复初始种子数据。

## 与后端版的区别

- 无登录验证码 Redis 依赖：验证码在前端生成与校验（仅供演示）。
- 不校验密码强度，统一 `123456`。
- 所有增删改查写入 `localStorage`，仅当前浏览器可见。

源码位于 `src/mock/`：`data.js`（种子 + 持久化）、`server.js`（接口路由）。

## 许可证

- 本项目（含演示版）源码以 **Apache-2.0** 发布，详见仓库根目录 `LICENSE`。
- 演示版仅依赖 Vue、Element Plus、axios、Vite 等 **MIT / ISC / BSD / Apache-2.0** 组件，
  无任何 GPL / AGPL / LGPL 等 copyleft 依赖；第三方许可证详见根目录 `THIRD-PARTY-NOTICES.md`。
- 演示版不含后端、数据库驱动或任何 TLS/代码签名证书，部署时的 HTTPS 由托管平台提供。
