# API 开发指南 (API Guide)

所有 API 均以 `/api` 为前缀。除了 `/api/health` 之外，所有接口通常需要 `Authorization` 请求头。

## 📍 核心接口汇总

### 1. 视频分析与解析
- **POST `/api/analyze-video`**
  - **描述**: 提交视频分析任务。支持自动识别并解析抖音短链接。
  - **参数**: `{ "videoUrl": "...", "projectId": "..." }`
  - **逻辑**: 如果是抖音链接，先通过 `douyinParser` 获取无水印直链，再调用 AI 分析。

### 2. 项目管理
- **GET `/api/projects`**: 获取当前用户的所有项目。
- **GET `/api/project/:id`**: 获取项目详情，包括分镜信息（Scenes）。
- **POST `/api/project`**: 创建新项目。参数: `{ "title": "...", "videoUrl": "..." }`

### 3. AI 视频生成
- **POST `/api/generate-video`**
  - **描述**: 根据爆款公式异步生成视频片段。
  - **参数**: `{ "projectId": "...", "hitFormula": { ... } }`
  - **响应**: 返回 `taskId`。需通过 `/api/task-status/:id` 查询进度。

### 4. 任务状态查询
- **GET `/api/task-status/:id`**
  - **描述**: 查询异步任务（如视频分析、生成）的执行进度和结果。

### 5. 资源管理
- **POST `/api/upload`**: 上传本地素材到服务器或存储服务。
- **GET `/api/scenes/:projectId`**: 获取项目所属的所有分镜数据。

---

## 🛠️ 开发说明

### 统一响应格式
所有接口通过中间件统一返回以下结构：
```json
{
  "success": true,
  "data": { ... },
  "message": "可选描述信息"
}
```

### 错误处理
- 400: 参数错误
- 401: 未授权（Token 失效或缺失）
- 404: 资源不存在
- 500: 服务器内部错误
