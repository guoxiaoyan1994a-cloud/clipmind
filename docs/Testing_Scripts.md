# 测试脚本手册 (Testing Scripts)

在 `server/` 根目录下存有大量的测试脚本（`.ts` 文件），用于在开发阶段单独验证核心逻辑。可以使用 `tsx` 直接运行这些脚本。

## 🧪 核心测试脚本说明

### 抖音解析测试
- **`testDouyin.ts`**: 基础抖音链接解析验证。
- **`testDouyinApi.ts` / `testDouyinPublicApi.ts`**: 尝试通过不同的 API 端点获取数据。
- **`testDouyinScrape.ts`**: 针对防爬措施的爬虫逻辑测试。
- **`testRedirect.ts` [1-4]**: 验证抖音短链接的多级重定向跳转逻辑。

### AI 服务测试
- **`testDoubao.ts`**: 火山引擎豆包 (Doubao) 文本/通用模型测试。
- **`testDoubaoVideo.ts`**: 豆包视频理解模型专项测试。
- **`testRapidApi.ts`**: 第三方 API 集成验证。

### 系统功能测试
- **`test.py`**: 基础环境或快速逻辑验证脚本。

## 如何运行

确保你位于 `server/` 目录下，并已安装依赖：

```bash
cd server
# 使用 npx 运行特定的 ts 脚本
npx tsx testDouyin.ts

# 或者如果你安装了全局 tsx
tsx testDoubao.ts
```

> [!IMPORTANT]
> 运行大模型相关测试脚本前，请确保 `server/.env` 中已配置正确的 API Key。

## 注意事项
这些脚本主要用于 **功能验证** 而非自动化单元测试。在将新逻辑集成到 `Service` 层之前，请务必先通过对应脚本进行冒烟测试。
