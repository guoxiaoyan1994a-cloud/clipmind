/**
 * 项目管理路由
 * GET /api/projects — 获取用户所有项目
 * GET /api/project/:id — 获取项目详情（含分镜和导出记录）
 */

import { Router, Request, Response, NextFunction } from 'express';
import { projectService } from '../services/projectService.js';

const router = Router();

/** 获取项目列表 */
router.get(
    '/projects',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const projects = await projectService.getProjects(req.userId!);
            res.sendSuccess(projects, '获取项目列表成功');
        } catch (err) {
            next(err);
        }
    }
);

/** 获取项目详情 */
router.get(
    '/project/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const project = await projectService.getProjectDetail(id, req.userId!);
            res.sendSuccess(project, '获取项目详情成功');
        } catch (err) {
            next(err);
        }
    }
);

/** 创建新项目 */
router.post(
    '/project',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { title, videoUrl } = req.body;
            const project = await projectService.createProject(req.userId!, title || '无标题复刻项目', videoUrl);
            res.sendSuccess(project, '创建项目成功', 201);
        } catch (err) {
            next(err);
        }
    }
);

export default router;
