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
     * 实际生产环境调用 Seedance 2.0 T2V API
     */
    private async generateSingleClip(prompt: string, duration: number): Promise<string> {
        if (!this.apiKey) {
            console.warn('⚠️ SEEDANCE_API_KEY 未配置，使用 Mock 视频生成');
            return this.mockGenerateClip(prompt, duration);
        }

        // TODO: 接入真实 Seedance 2.0 API
        // const response = await fetch(`https://ark.cn-beijing.volces.com/api/v3/...`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${this.apiKey}`,
        //     },
        //     body: JSON.stringify({
        //         model: this.endpointId,
        //         content: [{ type: 'text', text: prompt }],
        //         duration,
        //     }),
        // });
        // return parsedResponse.videoUrl;

        console.log(`🎬 Seedance 生成中: "${prompt.slice(0, 30)}..." (${duration}s)`);
        return this.mockGenerateClip(prompt, duration);
    }

    /** Mock 单条分镜视频生成（模拟 1~2 秒延迟） */
    private async mockGenerateClip(_prompt: string, duration: number): Promise<string> {
        // 模拟 AI 生成耗时
        const delay = 1000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        // 返回模拟视频 URL
        const id = Math.random().toString(36).slice(2, 10);
        return `https://storage.example.com/seedance/clip_${id}_${duration}s.mp4`;
    }
}

export const seedanceService = new SeedanceService();
