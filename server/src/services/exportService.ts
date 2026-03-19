/**
 * 视频导出服务
 * 创建导出任务并委托外部 Worker 处理
 * 合并分镜、添加字幕和音乐、输出最终 MP4
 */

import { projectRepository } from '../repositories/projectRepository.js';
import { sceneRepository } from '../repositories/sceneRepository.js';
import { taskRepository } from '../repositories/taskRepository.js';
import { exportRepository } from '../repositories/exportRepository.js';
import { AppError } from '../middleware/errorHandler.js';

export class ExportService {
    /**
     * 发起视频导出请求
     * @returns 任务 ID 和状态
     */
    async exportVideo(projectId: string, userId: string) {
        // 验证项目归属
        const project = await projectRepository.findById(projectId, userId);
        if (!project) {
            throw new AppError('项目不存在或无权访问', 404);
        }

        // 获取项目的所有分镜
        const scenes = await sceneRepository.findByProjectId(projectId);
        if (scenes.length === 0) {
            throw new AppError('项目尚无分镜数据，请先生成分镜', 400);
        }

        // 更新项目状态为"导出中"
        await projectRepository.updateStatus(projectId, 'exporting');

        // 创建导出任务
        const task = await taskRepository.create({
            project_id: projectId,
            type: 'export',
            status: 'pending',
            progress: 0,
        });

        // 向 Worker 发送导出请求
        this.sendExportToWorker(task.id, project, scenes).catch((err) => {
            console.error('❌ 发送导出任务到 Worker 失败:', err);
            taskRepository.updateStatus(task.id, {
                status: 'failed',
                error_message: '无法连接到视频处理服务',
            });
            projectRepository.updateStatus(projectId, 'failed');
        });

        return {
            taskId: task.id,
            status: 'pending',
            message: '视频导出任务已创建，请通过 /api/task-status/:id 查询进度',
        };
    }

    /**
     * 导出完成回调处理
     * Worker 完成导出后调用此方法保存结果
     */
    async onExportComplete(
        taskId: string,
        videoUrl: string
    ): Promise<void> {
        const task = await taskRepository.findById(taskId);
        if (!task) {
            throw new AppError('任务不存在', 404);
        }

        // 保存导出记录
        await exportRepository.create({
            project_id: task.project_id,
            video_url: videoUrl,
        });

        // 更新任务状态
        await taskRepository.updateStatus(taskId, {
            status: 'completed',
            progress: 100,
            result: { videoUrl },
        });

        // 更新项目状态
        await projectRepository.updateStatus(task.project_id, 'completed');
    }

    /** 向外部 Worker 发送导出任务 */
    private async sendExportToWorker(
        taskId: string,
        project: { id: string; video_url: string | null },
        scenes: Array<{
            scene_index: number;
            start_time: number;
            end_time: number;
            subtitle: string | null;
            voice: string | null;
            volume: number;
        }>
    ): Promise<void> {
        const workerBaseUrl = process.env.WORKER_BASE_URL;
        const webhookBaseUrl = process.env.WEBHOOK_BASE_URL;

        if (!workerBaseUrl) {
            console.warn('⚠️ WORKER_BASE_URL 未配置，使用模拟导出模式');
            await this.simulateExport(taskId, project.id);
            return;
        }

        await fetch(`${workerBaseUrl}/export`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                taskId,
                projectId: project.id,
                videoUrl: project.video_url,
                scenes,
                callbackUrl: `${webhookBaseUrl}/api/webhook/export-complete`,
            }),
        });
    }

    /** 开发环境模拟导出过程 */
    private async simulateExport(taskId: string, projectId: string): Promise<void> {
        await taskRepository.updateStatus(taskId, {
            status: 'processing',
            progress: 20,
        });

        // 模拟分阶段进度
        const stages = [
            { progress: 40, delay: 1000 },
            { progress: 70, delay: 2000 },
            { progress: 90, delay: 1500 },
        ];

        for (const stage of stages) {
            await new Promise(resolve => setTimeout(resolve, stage.delay));
            await taskRepository.updateStatus(taskId, {
                status: 'processing',
                progress: stage.progress,
            });
        }

        // 模拟完成
        setTimeout(async () => {
            try {
                const mockExportUrl = `https://storage.example.com/exports/${projectId}/final.mp4`;

                await exportRepository.create({
                    project_id: projectId,
                    video_url: mockExportUrl,
                });

                await taskRepository.updateStatus(taskId, {
                    status: 'completed',
                    progress: 100,
                    result: { videoUrl: mockExportUrl },
                });

                await projectRepository.updateStatus(projectId, 'completed');
            } catch (err) {
                console.error('模拟导出更新失败:', err);
            }
        }, 1500);
    }
}

export const exportService = new ExportService();
