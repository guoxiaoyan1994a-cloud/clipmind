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

            let finalVideoUrl = videoUrl;

            // 识别抖音链接并解析为无水印直链
            if (videoUrl.includes('douyin.com')) {
                try {
                    const info = await douyinParser.parse(videoUrl);
                    finalVideoUrl = info.videoUrl;
                    console.log(`✅ 成功提取抖音直链: ${finalVideoUrl.substring(0, 50)}...`);
                } catch (error) {
                    const msg = error instanceof Error ? error.message : '未知错误';
                    res.sendError(`抖音链接解析失败: ${msg}`, 400);
                    return;
                }
            }

            const result = await analyzeService.analyzeVideo(
                projectId,
                finalVideoUrl,
                req.userId!
            );

            res.sendSuccess(result, '视频分析任务已提交');
        } catch (err) {
            next(err);
        }
    }
);

export default router;
