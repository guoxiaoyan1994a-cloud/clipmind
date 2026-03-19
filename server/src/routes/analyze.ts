/**
 * 视频分析路由
 * POST /api/analyze-video — 提交视频分析任务
 */

import { Router, Request, Response, NextFunction } from 'express';
import { analyzeService } from '../services/analyzeService.js';
import { douyinParser } from '../utils/douyinParser.js';

const router = Router();

router.post(
    '/analyze-video',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { videoUrl, projectId } = req.body;

            if (!videoUrl || !projectId) {
                res.sendError('videoUrl 和 projectId 为必填字段', 400);
                return;
            }

            const result = await analyzeService.analyzeVideo(
                projectId,
                videoUrl,
                req.userId!
            );

            res.sendSuccess(result, '视频分析任务已提交');
        } catch (err) {
            next(err);
        }
    }
);

export default router;
