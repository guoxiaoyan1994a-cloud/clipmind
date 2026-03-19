/**
 * Seedance 2.0 视频生成服务（阶段二：内容重构）
 * 根据爆款公式逐分镜调用 Seedance T2V API 生成视频片段
 * 当 SEEDANCE_API_KEY 未配置时使用 Mock 模式
 */

import { taskRepository } from '../repositories/taskRepository.js';
import type { HitFormula } from '../types/index.js';

/** 单个分镜的生成结果 */
export interface GeneratedClip {
    sceneIndex: number;
    videoUrl: string;
    duration: number;
}

export class SeedanceService {
    private apiKey: string | undefined;
    private endpointId: string | undefined;

    constructor() {
        this.apiKey = process.env.SEEDANCE_API_KEY;
        this.endpointId = process.env.SEEDANCE_ENDPOINT_ID;
    }

    /**
     * 根据爆款公式逐分镜生成视频
     * 每完成一条分镜即更新任务进度，供前端轮询展示
     */
    async generateFromFormula(
        taskId: string,
        formula: HitFormula
    ): Promise<GeneratedClip[]> {
        const totalScenes = formula.scenes.length;
        const clips: GeneratedClip[] = [];

        // 标记任务开始处理
        await taskRepository.updateStatus(taskId, {
            status: 'processing',
            progress: 5,
        });

        for (let i = 0; i < totalScenes; i++) {
            const scene = formula.scenes[i];

            // 为每条分镜生成视频
            const videoUrl = await this.generateSingleClip(scene.prompt, scene.duration);

            clips.push({
                sceneIndex: scene.sceneIndex,
                videoUrl,
                duration: scene.duration,
            });

            // 更新进度（每完成一条分镜递增）
            const progress = Math.round(((i + 1) / totalScenes) * 90) + 5;
            await taskRepository.updateStatus(taskId, {
                status: 'processing',
                progress,
            });
        }

        return clips;
    }

    /**
     * 生成单条分镜的视频片段
     * 实际生产环境调用火山引擎方舟 Seedance 2.0 T2V API
     */
    private async generateSingleClip(prompt: string, duration: number): Promise<string> {
        if (!this.apiKey || !this.endpointId) {
            console.warn('⚠️ SEEDANCE_API_KEY 或 ENDPOINT_ID 未配置，使用 Mock 视频生成');
            return this.mockGenerateClip(prompt, duration);
        }

        try {
            console.log(`🎬 发起 Seedance 2.0 生成请求: "${prompt.slice(0, 30)}..." (${duration}s)`);
            
            // 1. 提交生成任务
            const submitResponse = await fetch('https://ark.cn-beijing.volces.com/api/v3/video_generation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.endpointId,
                    prompt: prompt,
                    render_config: {
                        duration: Math.min(Math.max(duration, 4), 15), // Seedance 支持 4-15s
                        fps: 30
                    }
                }),
            });

            if (!submitResponse.ok) {
                const errorData = await submitResponse.json();
                throw new Error(`Seedance 任务提交失败: ${JSON.stringify(errorData)}`);
            }

            const resData = await submitResponse.json() as any;
            const volcTaskId = resData.id;
            console.log(`📡 Seedance 任务已创建, ID: ${volcTaskId}`);

            // 2. 轮询任务状态 (最大等待 5 分钟)
            let attempts = 0;
            const maxAttempts = 60; // 60 * 5s = 5 min
            
            while (attempts < maxAttempts) {
                await new Promise(r => setTimeout(r, 5000)); // 每 5 秒查一次
                attempts++;

                const statusResponse = await fetch(`https://ark.cn-beijing.volces.com/api/v3/video_generation/tasks/${volcTaskId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                    },
                });

                if (!statusResponse.ok) continue;

                const taskInfo = await statusResponse.json() as any;
                const status = taskInfo.status;

                if (status === 'succeeded') {
                    const videoUrl = taskInfo.video_results?.[0]?.url;
                    console.log(`✅ Seedance 任务完成! URL: ${videoUrl}`);
                    return videoUrl;
                } else if (status === 'failed') {
                    throw new Error(`Seedance 生成失败: ${taskInfo.failure_reason || '未知原因'}`);
                }
                
                console.log(`⏳ Seedance 任务生成中 (${status})... [${attempts}/${maxAttempts}]`);
            }

            throw new Error('Seedance 生成任务超时');

        } catch (error) {
            console.error('❌ Seedance API 调用出错:', error);
            return this.mockGenerateClip(prompt, duration);
        }
    }

    /** Mock 单条分镜视频生成（作为后端兜底） */
    private async mockGenerateClip(_prompt: string, duration: number): Promise<string> {
        // 模拟 AI 生成随机耗时
        const delay = 1000 + Math.random() * 800;
        await new Promise((resolve) => setTimeout(resolve, delay));

        // 如果解析失败，返回一个真实可播放的占位视频（防止前端播放器报错）
        return `https://vjs.zencdn.net/v/oceans.mp4?t=${Math.random()}`;
    }
}

export const seedanceService = new SeedanceService();
