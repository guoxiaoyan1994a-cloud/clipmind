/**
 * 任务状态查询路由
 * GET /api/task-status/:id — 查询异步任务的进度和结果
 */

import { Router, Request, Response, NextFunction } from 'express';
import { taskService } from '../services/taskService.js';

const router = Router();

router.get(
    '/task-status/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const task = await taskService.getTaskStatus(id);

            res.sendSuccess(
                {
                    taskId: task.id,
                    type: task.type,
                    status: task.status,
                    progress: task.progress,
                    result: task.result,
                    errorMessage: task.error_message,
                    createdAt: task.created_at,
                    updatedAt: task.updated_at,
                },
                '获取任务状态成功'
            );
        } catch (err) {
            next(err);
        }
    }
);

export default router;
