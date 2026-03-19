/**
 * Express 应用主入口
 * 初始化中间件、路由和错误处理
 * 同时作为本地开发时的启动入口
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 加载环境变量（需在所有其他 import 之前）
dotenv.config();

import { responseMiddleware } from './middleware/response.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// ─── 基础中间件 ───────────────────────────────────────
// 跨域：允许前端开发服务器访问
app.use(
    cors({
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// 解析 JSON 请求体（限制 50MB，适配视频元数据等大请求）
app.use(express.json({ limit: '50mb' }));

// 解析 URL-encoded 请求体
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 统一响应格式（为 res 添加 sendSuccess / sendError 方法）
app.use(responseMiddleware);

// ─── API 路由 ──────────────────────────────────────────
// 健康检查和认证接口不需要权限校验
app.use('/api', (req, res, next) => {
    // 免校验路径：健康检查 和 登录注册接口
    if (req.path === '/health' || req.path.startsWith('/auth/')) {
        return next();
    }
    return authMiddleware(req, res, next);
});

app.use('/api', routes);

// ─── 全局错误处理 ──────────────────────────────────────
app.use(errorHandler);

// ─── 本地开发启动 ──────────────────────────────────────
const PORT = process.env.PORT || 3001;

// 仅在非 Vercel 环境时启动本地服务器
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n🚀 ClipMind API 服务已启动`);
        console.log(`   地址: http://localhost:${PORT}`);
        console.log(`   健康检查: http://localhost:${PORT}/api/health`);
        console.log(`   环境: ${process.env.NODE_ENV || 'development'}\n`);
    });
}

export default app;
