/**
 * 分镜管理路由
 * POST /api/generate-scenes — 生成分镜列表
 * POST /api/update-scene — 更新单个分镜
 */

import { Router, Request, Response, NextFunction } from 'express';
import { sceneService } from '../services/sceneService.js';

const router = Router();

/** 生成分镜列表 */
router.post(
    '/generate-scenes',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { projectId, transcript, prompt } = req.body;

            if (!projectId || !transcript || !prompt) {
                res.sendError('projectId、transcript 和 prompt 为必填字段', 400);
                return;
            }

            const scenes = await sceneService.generateScenes(
                projectId,
                transcript,
                prompt,
                req.userId!
            );

            res.sendSuccess(scenes, '分镜生成成功', 201);
        } catch (err) {
            next(err);
        }
    }
);

/** 更新单个分镜 */
router.post(
    '/update-scene',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { sceneId, subtitle, voice, volume, prompt } = req.body;

            if (!sceneId) {
                res.sendError('sceneId 为必填字段', 400);
                return;
            }

            // 过滤出非 undefined 的更新字段
            const updates: Record<string, unknown> = {};
            if (subtitle !== undefined) updates.subtitle = subtitle;
            if (voice !== undefined) updates.voice = voice;
            if (volume !== undefined) updates.volume = volume;
            if (prompt !== undefined) updates.prompt = prompt;

            if (Object.keys(updates).length === 0) {
                res.sendError('至少需要提供一个要更新的字段（subtitle/voice/volume/prompt）', 400);
                return;
            }

            const scene = await sceneService.updateScene(sceneId, updates);

            res.sendSuccess(scene, '分镜更新成功');
        } catch (err) {
            next(err);
        }
    }
);

export default router;
