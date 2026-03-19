/**
 * 视频导出路由
 * POST /api/export-video — 提交视频导出任务
 */

import { Router, Request, Response, NextFunction } from 'express';
import { exportService } from '../services/exportService.js';

const router = Router();

router.post(
    '/export-video',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { projectId } = req.body;

            if (!projectId) {
                res.sendError('projectId 为必填字段', 400);
                return;
            }

            const result = await exportService.exportVideo(projectId, req.userId!);

            res.sendSuccess(result, '视频导出任务已提交');
        } catch (err) {
            next(err);
        }
    }
);

export default router;
