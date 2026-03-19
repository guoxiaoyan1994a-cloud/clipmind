# 前端开发指南 (Frontend Guide)

本项目前端是一个基于 **React 19** 和 **Vite** 构建的移动端优先（Mobile-First） Web 应用，旨在提供类似原生 App 的视频剪辑体验。

## 📱 核心组件说明

组件位于 `src/components/` 目录下，采用功能性命名：

| 组件名 | 说明 |
| :--- | :--- |
| **CreatorCenter** | 创作者中心（首页），展示创作入口和推荐。 |
| **MyProjects** | 我的项目列表，管理已保存的剪辑工程。 |
| **SmartVideoStep[1-3]** | **爆款复刻三部曲**：1. 解析/分析 -> 2. 脚本生成 -> 3. 片段处理。 |
| **VideoEditor** | 核心视频编辑器，处理基础剪辑逻辑。 |
| **AdvancedEditor** | 高级编辑器，支持多轨道或更复杂的操作。 |
| **SubtitleEditor** | 专门用于字幕编辑和样式设置。 |
| **VoiceSelection** | 配音/音色选择界面。 |

## 路由方案

使用 `react-router-dom` (v7) 进行路由管理。主容器定义在 `src/App.tsx` 中，它被限制在一个模拟手机屏幕的容器内：

```tsx
<div className="w-full h-[100dvh] sm:w-[375px] sm:h-[812px] ...">
  <Router>
    {/* 路由配置 */}
  </Router>
</div>
```

## 状态管理 (Zustand)

项目使用 **Zustand** 进行轻量级状态管理：

- **`useAuthStore`** (`src/services/authStore.ts`):
  - 管理用户信息、Token 和登录状态。
  - 支持 Supabase Auth 自动监听状态变化。
  - 在未配置环境变量时具有 Mock 降级能力。

## 🎨 样式规范
- 采用 **Tailwind CSS** 进行原子化样式开发。
- 支持 **Dark Mode**（通过 `dark:` 类名前缀）。
- 使用 **Framer Motion** 实现组件切换时的平滑过渡动画。

## 开发建议
1. **单一职责**: 每个编辑器组件应专注于一个特定领域。
2. **移动端适配**: 所有 UI 设计必须在 375px 宽度下保持良好展示。
3. **API 调用**: 统一封装在 `src/services/` 下，建议配合 `useAuthStore` 获取 Token。
