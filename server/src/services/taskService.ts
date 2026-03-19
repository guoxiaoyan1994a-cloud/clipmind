/**
 * 任务状态查询服务
 * 提供异步任务的进度和结果查询
 */

import { taskRepository } from '../repositories/taskRepository.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Task } from '../types/index.js';

export class TaskService {
    /** 根据 ID 查询任务状态 */
    async getTaskStatus(taskId: string): Promise<Task> {
        const task = await taskRepository.findById(taskId);
        if (!task) {
            throw new AppError('任务不存在', 404);
        }
        return task;
    }
}

export const taskService = new TaskService();
