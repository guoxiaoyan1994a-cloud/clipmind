/**
 * 分镜生成与管理服务
 * 基于视频转录和创意提示词生成分镜，支持单场景编辑
 */

import { sceneRepository } from '../repositories/sceneRepository.js';
import { projectRepository } from '../repositories/projectRepository.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Scene } from '../types/index.js';

export class SceneService {
    /**
     * 根据 transcript 和 prompt 生成分镜列表
     * 实际生产中应接入 AI API 生成，此处提供模板逻辑
     */
    async generateScenes(
        projectId: string,
        transcript: string,
        prompt: string,
        userId: string
    ): Promise<Scene[]> {
        // 验证项目归属
        const project = await projectRepository.findById(projectId, userId);
        if (!project) {
            throw new AppError('项目不存在或无权访问', 404);
        }

        // 删除已有分镜（支持重新生成）
        await sceneRepository.deleteByProjectId(projectId);

        // 调用 AI 生成分镜（此处为模拟实现，生产环境应替换为真实 AI 调用）
        const generatedScenes = await this.callAiGenerateScenes(transcript, prompt);

        // 将生成结果写入数据库
        const scenesToCreate = generatedScenes.map((scene, index) => ({
            project_id: projectId,
            scene_index: index + 1,
            start_time: scene.startTime,
            end_time: scene.endTime,
            subtitle: scene.subtitle,
            voice: scene.voice || 'default',
            volume: 100,
            prompt: scene.prompt || prompt,
        }));

        const scenes = await sceneRepository.createMany(scenesToCreate);

        // 更新项目状态为"编辑中"
        await projectRepository.updateStatus(projectId, 'editing');

        return scenes;
    }

    /** 更新单个分镜的可编辑字段 */
    async updateScene(
        sceneId: string,
        updates: Partial<Pick<Scene, 'subtitle' | 'voice' | 'volume' | 'prompt'>>
    ): Promise<Scene> {
        const existingScene = await sceneRepository.findById(sceneId);
        if (!existingScene) {
            throw new AppError('分镜不存在', 404);
        }

        return sceneRepository.update(sceneId, updates);
    }

    /** 获取项目下所有分镜 */
    async getScenesByProjectId(projectId: string): Promise<Scene[]> {
        return sceneRepository.findByProjectId(projectId);
    }

    /**
     * 调用 AI 生成分镜内容
     * 生产环境应接入真实 AI API（如 Gemini、GPT 等）
     */
    private async callAiGenerateScenes(
        transcript: string,
        prompt: string
    ): Promise<
        Array<{
            startTime: number;
            endTime: number;
            subtitle: string;
            voice: string;
            prompt: string;
        }>
    > {
        const aiApiKey = process.env.AI_API_KEY;

        if (!aiApiKey) {
            // 未配置 AI API Key 时返回模拟数据
            console.warn('⚠️ AI_API_KEY 未配置，使用模拟分镜数据');
            return [
                {
                    startTime: 0,
                    endTime: 3,
                    subtitle: '开场引入，吸引观众注意力',
                    voice: 'energetic',
                    prompt,
                },
                {
                    startTime: 3,
                    endTime: 7,
                    subtitle: '展开核心内容，制造悬念',
                    voice: 'narrative',
                    prompt,
                },
                {
                    startTime: 7,
                    endTime: 11,
                    subtitle: '场景高潮，情感递进',
                    voice: 'dramatic',
                    prompt,
                },
                {
                    startTime: 11,
                    endTime: 15,
                    subtitle: '完美收尾，引导互动',
                    voice: 'warm',
                    prompt,
                },
            ];
        }

        // TODO: 接入真实 AI API 生成分镜
        // 此处应将 transcript 和 prompt 发送给 AI 服务
        // 并解析返回的结构化分镜数据
        console.log(`AI 分镜生成 - transcript长度: ${transcript.length}, prompt: ${prompt}`);

        return [
            {
                startTime: 0,
                endTime: 3,
                subtitle: '开场引入，吸引观众注意力',
                voice: 'energetic',
                prompt,
            },
            {
                startTime: 3,
                endTime: 7,
                subtitle: '展开核心内容，制造悬念',
                voice: 'narrative',
                prompt,
            },
            {
                startTime: 7,
                endTime: 11,
                subtitle: '场景高潮，情感递进',
                voice: 'dramatic',
                prompt,
            },
            {
                startTime: 11,
                endTime: 15,
                subtitle: '完美收尾，引导互动',
                voice: 'warm',
                prompt,
            },
        ];
    }
}

export const sceneService = new SceneService();
