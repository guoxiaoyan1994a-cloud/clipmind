/**
 * 视频分析服务
 * 创建异步分析任务，实际分析工作委托给外部 Worker 处理
 * 避免在 Serverless 函数中执行耗时操作
 */

import { projectRepository } from '../repositories/projectRepository.js';
import { taskRepository } from '../repositories/taskRepository.js';
import { doubaoService } from './doubaoService.js';
import { AppError } from '../middleware/errorHandler.js';

export class AnalyzeService {
    /**
     * 发起视频分析请求
     * @param projectId - 项目 ID
     * @param videoUrl - 待分析的视频 URL
     * @param userId - 当前用户 ID（用于权限校验）
     * @returns 任务 ID 和当前任务状态
     */
    async analyzeVideo(projectId: string, videoUrl: string, userId: string) {
        // 验证项目归属
        const project = await projectRepository.findById(projectId, userId);
        if (!project) {
            throw new AppError('项目不存在或无权访问', 404);
        }

        // 更新项目状态为"分析中"
        await projectRepository.updateStatus(projectId, 'analyzing');

        // 创建分析任务记录
        const task = await taskRepository.create({
            project_id: projectId,
            type: 'analyze',
            status: 'pending',
            progress: 0,
        });

        // 向外部 Worker 发送分析请求（异步，不等待结果）
        this.sendToWorker(task.id, videoUrl).catch((err) => {
            console.error('❌ 发送分析任务到 Worker 失败:', err);
            // 将任务标记为失败
            taskRepository.updateStatus(task.id, {
                status: 'failed',
                error_message: '无法连接到视频处理服务',
            });
        });

        return {
            taskId: task.id,
            status: 'pending',
            message: '视频分析任务已创建，请通过 /api/task-status/:id 查询进度',
        };
    }

    /**
     * 向外部 Worker 发送分析任务
     * Worker 完成后通过 Webhook 回调更新任务状态
     */
    private async sendToWorker(taskId: string, videoUrl: string): Promise<void> {
        const workerBaseUrl = process.env.WORKER_BASE_URL;
        const webhookBaseUrl = process.env.WEBHOOK_BASE_URL;

        if (!workerBaseUrl) {
            // 如果未配置 Worker，使用豆包大模型（或 Mock）进行分析
            console.warn('⚠️ WORKER_BASE_URL 未配置，使用豆包大模型分析模式');
            await this.analyzeWithDoubao(taskId, videoUrl);
            return;
        }

        await fetch(`${workerBaseUrl}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                taskId,
                videoUrl,
                callbackUrl: `${webhookBaseUrl}/api/webhook/analyze-complete`,
            }),
        });
    }

    /**
     * 使用豆包大模型进行视频分析
     * 分阶段推进进度，最终输出包含"爆款公式"的完整结果
     */
    private async analyzeWithDoubao(taskId: string, videoUrl: string): Promise<void> {
        // 阶段 1/3：提取音频与台词（模拟）
        await taskRepository.updateStatus(taskId, {
            status: 'processing',
            progress: 20,
        });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // 阶段 2/3：分析视觉风格与卡点（模拟）
        await taskRepository.updateStatus(taskId, {
            status: 'processing',
            progress: 50,
        });

        await new Promise(resolve => setTimeout(resolve, 1500));

        // 阶段 3/3：调用豆包大模型生成爆款公式
        await taskRepository.updateStatus(taskId, {
            status: 'processing',
            progress: 80,
        });

        try {
            const hitFormula = await doubaoService.analyzeHitVideo(videoUrl);

            // 成功后，将从大模型获取到的全量公式（六要素+翻拍分镜）存入 task result 中
            await taskRepository.updateStatus(taskId, {
                status: 'completed',
                progress: 100,
                result: {
                    ...hitFormula, // 平铺 music, characters, plot 等
                    scenes: hitFormula.scenes // 翻拍的新分镜
                },
            });
        } catch (err) {
            console.error('豆包大模型分析失败:', err);
            await taskRepository.updateStatus(taskId, {
                status: 'failed',
                error_message: '视频分析失败，请重试',
            });
        }
    }
}

export const analyzeService = new AnalyzeService();

