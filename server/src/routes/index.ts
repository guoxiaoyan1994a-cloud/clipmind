/**
 * 路由聚合入口
 * 将所有路由模块统一注册到 Express 应用
 */

import { Router } from 'express';
import uploadRoutes from './upload.js';
import analyzeRoutes from './analyze.js';
import scenesRoutes from './scenes.js';
import exportRoutes from './export.js';
import generateRoutes from './generate.js';
import projectsRoutes from './projects.js';
import tasksRoutes from './tasks.js';
import authRoutes from './auth.js';

const router = Router();

// 健康检查端点（不需要认证）
router.get('/health', (_req, res) => {
    res.json({
        success: true,
        data: {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        },
        message: '服务运行正常',
    });
});

// 注册所有路由模块
router.use('/', uploadRoutes);
router.use('/', analyzeRoutes);
router.use('/', scenesRoutes);
router.use('/', exportRoutes);
router.use('/', generateRoutes);
router.use('/', projectsRoutes);
router.use('/', tasksRoutes);
router.use('/auth', authRoutes);

export default router;

