/**
 * 视频生成路由（阶段二）
 * POST /api/generate-video — 根据爆款公式生成新视频
 */

import { Router, Request, Response, NextFunction } from 'express';
import { projectRepository } from '../repositories/projectRepository.js';
import { taskRepository } from '../repositories/taskRepository.js';
import { seedanceService } from '../services/seedanceService.js';
import { AppError } from '../middleware/errorHandler.js';
import type { HitFormula } from '../types/index.js';

const router = Router();

router.post(
    '/generate-video',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { projectId, hitFormula } = req.body as {
                projectId: string;
                hitFormula: HitFormula;
            };

            if (!projectId || !hitFormula) {
                res.sendError('projectId 和 hitFormula 为必填字段', 400);
                return;
            }

            // 验证项目归属
            const project = await projectRepository.findById(projectId, req.userId!);
            if (!project) {
                throw new AppError('项目不存在或无权访问', 404);
            }

            // 创建视频生成任务
            const task = await taskRepository.create({
                project_id: projectId,
                type: 'generate',
                status: 'pending',
                progress: 0,
            });

            // 异步执行视频生成（不阻塞请求）
            (async () => {
                try {
                    const clips = await seedanceService.generateFromFormula(
                        task.id,
                        hitFormula
                    );

                    // 生成完成，将所有片段 URL 存入结果
                    await taskRepository.updateStatus(task.id, {
                        status: 'completed',
                        progress: 100,
                        result: {
                            clips,
                            totalDuration: clips.reduce((sum, c) => sum + c.duration, 0),
                            message: '视频片段已生成，可进行拼接导出',
                        },
                    });
                } catch (err) {
                    console.error('❌ Seedance 视频生成失败:', err);
                    await taskRepository.updateStatus(task.id, {
                        status: 'failed',
                        error_message:
                            err instanceof Error ? err.message : '视频生成失败',
                    });
                }
            })();

            res.sendSuccess(
                {
                    taskId: task.id,
                    status: 'pending',
                    message: '视频生成任务已创建，请通过 /api/task-status/:id 查询进度',
                },
                '视频生成任务已提交'
            );
        } catch (err) {
            next(err);
        }
    }
);

export default router;
