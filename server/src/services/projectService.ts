/**
 * 项目管理服务
 * 处理项目的查询和创建逻辑
 */

import { projectRepository } from '../repositories/projectRepository.js';
import { sceneRepository } from '../repositories/sceneRepository.js';
import { exportRepository } from '../repositories/exportRepository.js';
import { AppError } from '../middleware/errorHandler.js';
import type { Project, Scene, Export } from '../types/index.js';

// 项目详情（包含关联的分镜和导出记录）
interface ProjectDetail extends Project {
    scenes: Scene[];
    exports: Export[];
}

export class ProjectService {
    /** 获取用户所有项目 */
    async getProjects(userId: string): Promise<Project[]> {
        return projectRepository.findByUserId(userId);
    }

    /** 获取项目详情（含分镜和导出记录） */
    async getProjectDetail(id: string, userId: string): Promise<ProjectDetail> {
        const project = await projectRepository.findById(id, userId);
        if (!project) {
            throw new AppError('项目不存在或无权访问', 404);
        }

        // 并行查询关联数据以提升性能
        const [scenes, exports] = await Promise.all([
            sceneRepository.findByProjectId(id),
            exportRepository.findByProjectId(id),
        ]);

        return { ...project, scenes, exports };
    }

    /** 创建新项目 */
    async createProject(userId: string, title: string, videoUrl?: string): Promise<Project> {
        return projectRepository.create({
            user_id: userId,
            title,
            video_url: videoUrl || null,
            status: 'draft',
        });
    }
}

export const projectService = new ProjectService();
