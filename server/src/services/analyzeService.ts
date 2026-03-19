/**
 * 视频分析服务
 * 创建异步分析任务，实际分析工作委托给外部 Worker 处理
 * 避免在 Serverless 函数中执行耗时操作
 */

import { projectRepository } from '../repositories/projectRepository.js';
import { taskRepository } from '../repositories/taskRepository.js';
import { doubaoService } from './doubaoService.js';
import { douyinParser } from '../utils/douyinParser.js';
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

        // 本地执行 AI 分析流（内部包含抽帧、音视频解析等）
        this.analyzeWithDoubao(task.id, videoUrl).catch((err) => {
            console.error('❌ 启动异步分析任务失败:', err);
            // 将任务标记为失败
            taskRepository.updateStatus(task.id, {
                status: 'failed',
                error_message: '系统繁忙，分析请求未进入队列',
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
        let finalVideoUrl = videoUrl;
        let currentResult: any = {};

        // 阶段 0/4：解析短链接/提取直链（针对抖音等）
        if (videoUrl.includes('douyin.com')) {
            console.log(`[TASKOPS] Task ${taskId}: Handling Douyin link extraction...`);
            await taskRepository.updateStatus(taskId, {
                status: 'processing',
                progress: 5,
            });
            try {
                const info = await douyinParser.parse(videoUrl);
                finalVideoUrl = info.videoUrl;
                console.log(`[TASKOPS] Task ${taskId}: Douyin link extracted.`);
            } catch (err) {
                console.warn('⚠️ 抖音解析失败，尝试使用原链接继续:', err);
            }
        }

        try {
            // 如果未配置 API Key，直接走 Mock 流程
            if (!process.env.ARK_API_KEY) {
                console.log(`[TASKOPS] Task ${taskId}: No ARK_API_KEY, entering MOCK flow.`);
                
                // 模拟音频解析
                await taskRepository.updateStatus(taskId, { status: 'processing', progress: 20 });
                console.log(`[TASKOPS] Task ${taskId}: Mock Audio stage starting...`);
                await new Promise(r => setTimeout(r, 1000));
                currentResult = {
                    background_music: "轻快活泼的夏日电子节奏 (Mock)",
                    sound_effects: "转场Swish音效、系统提示金币掉落音 (Mock)"
                };
                await taskRepository.updateStatus(taskId, { status: 'processing', progress: 40, result: currentResult });
                console.log(`[TASKOPS] Task ${taskId}: Mock Audio stage updated.`);

                // 模拟视觉解析
                console.log(`[TASKOPS] Task ${taskId}: Mock Visual stage starting...`);
                await taskRepository.updateStatus(taskId, { status: 'processing', progress: 60 });
                await new Promise(r => setTimeout(r, 1500));
                currentResult = {
                    ...currentResult,
                    role_setting: "一个对生活充满好奇的探店达人形象 (Mock)",
                    story_summary: "通过一次意外迷路，发现了巷子里不为人知的百年老店 (Mock)",
                    subtitle_text: "大字号悬念体：这是我吃过最便宜的米其林... (Mock)",
                    visual_style: "赛博朋克高对比度、快节奏剪辑 (Mock)",
                    language_text: "亲切自然，带有一点惊喜与分享欲的语调 (Mock)"
                };
                await taskRepository.updateStatus(taskId, { status: 'processing', progress: 80, result: currentResult });
                console.log(`[TASKOPS] Task ${taskId}: Mock Visual stage updated.`);

                // 模拟生成
                await new Promise(r => setTimeout(r, 1000));
                console.log(`[TASKOPS] Task ${taskId}: Completing Mock task.`);
                await taskRepository.updateStatus(taskId, {
                    status: 'completed',
                    progress: 100,
                    result: {
                        ...currentResult,
                        scenes: [
                            { sceneIndex: 1, duration: 3, prompt: "【翻拍新脚本】中景：主角在办公桌前...", subtitle: "【翻拍新脚本】你是不是也遇到这种情况？" }
                        ]
                    },
                });
                return;
            }

            // 真实 API 分步流程
            console.log(`[TASKOPS] Task ${taskId}: Starting REAL analysis flow.`);
            // 1. 抽帧
            await taskRepository.updateStatus(taskId, { status: 'processing', progress: 10 });
            const ext = finalVideoUrl.split('?')[0].toLowerCase().split('.').pop();
            const isImage = ext && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);
            let imagesToAnalyze: string[] = isImage ? [finalVideoUrl] : await doubaoService.extractFramesAndConvertToBase64(finalVideoUrl, 5);

            // 2. 音频解析
            console.log(`[TASKOPS] Task ${taskId}: Audio analysis starting...`);
            await taskRepository.updateStatus(taskId, { status: 'processing', progress: 20 });
            const audioResult = await doubaoService.analyzeAudioTrack(imagesToAnalyze);
            currentResult = { ...currentResult, ...audioResult };
            await taskRepository.updateStatus(taskId, { status: 'processing', progress: 40, result: currentResult });
            console.log(`[TASKOPS] Task ${taskId}: Audio analysis updated.`);

            // 3. 视觉解析
            console.log(`[TASKOPS] Task ${taskId}: Visual analysis starting...`);
            await taskRepository.updateStatus(taskId, { status: 'processing', progress: 50 });
            const visualResult = await doubaoService.analyzeVisualFrames(imagesToAnalyze);
            currentResult = { ...currentResult, ...visualResult };
            await taskRepository.updateStatus(taskId, { status: 'processing', progress: 75, result: currentResult });
            console.log(`[TASKOPS] Task ${taskId}: Visual analysis updated.`);

            // 4. 生成分镜
            console.log(`[TASKOPS] Task ${taskId}: Scene generation starting...`);
            await taskRepository.updateStatus(taskId, { status: 'processing', progress: 85 });
            const finalScenes = await doubaoService.generateRemakeScenes(currentResult);

            // 5. 完成
            await taskRepository.updateStatus(taskId, {
                status: 'completed',
                progress: 100,
                result: {
                    ...currentResult,
                    scenes: finalScenes
                },
            });
            console.log(`[TASKOPS] Task ${taskId}: Successfully completed.`);
        } catch (err) {
            console.error(`[TASKOPS] Error in task ${taskId}:`, err);
            try {
                await taskRepository.updateStatus(taskId, {
                    status: 'failed',
                    error_message: err instanceof Error ? err.message : '视频分析失败，请重试',
                });
            } catch (updateErr) {
                console.error(`[TASKOPS] CRITICAL: Failed to update failure status for task ${taskId}:`, updateErr);
            }
        }
    }
}

export const analyzeService = new AnalyzeService();

