<div align="center">
<img width="1200" height="475" alt="ClipMind Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ClipMind - 智能视频 AI 创作平台

ClipMind 是一个利用大模型（如 Gemini, Doubao）能力的自动化视频创作与分析工具。支持抖音视频解析、智能脚本生成、自动配音及字幕编辑等。

## 🚀 主要功能
- **视频智能分析**：多模态理解视频内容。
- **抖音解析**：支持抖音短链接解析并获取无水印资源。
- **AI 剧本生成**：自动生成视频脚本方案。
- **全流程编辑器**：包含裁剪、配音、字幕和音乐添加。
- **跨平台集成**：集成了 Supabase 认证和存储。

## 🛠️ 技术栈
- **前端**：React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion (motion)
- **后端**：Express + TypeScript + Node.js
- **数据库**：SQLite (Better-SQLite3) + Supabase
- **AI 能力**：Google Gen AI (Gemini), Doubao (Seed-1.8)

## 📦 快速开始

### 1. 克隆与安装
```bash
git clone <repo-url>
cd project
npm install
cd server && npm install
```

### 2. 环境配置
- 在根目录创建 `.env.local`：
  ```env
  GEMINI_API_KEY=your_gemini_key
  ```
- 在 `server/` 目录配置 `.env`（参考 `.env.example`）。

### 3. 启动开发服务器
- **后端服务** (默认 3001 端口):
  ```bash
  cd server && npm run dev
  ```
- **前端应用** (默认 3000 端口):
  ```bash
  npm run dev
  ```

## 📖 详细文档
更多技术细节请参阅 [docs/](docs/) 目录：
- [项目架构](docs/Architecture.md)
- [API 开发指南](docs/API_Guide.md)
- [前端组件说明](docs/Frontend_Guide.md)
- [测试脚本手册](docs/Testing_Scripts.md)

---
View your app in AI Studio: [https://ai.studio/apps/5ca91373-3095-456e-9a17-facf2e6b1999](https://ai.studio/apps/5ca91373-3095-456e-9a17-facf2e6b1999)
