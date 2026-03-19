/**
 * 项目状态管理（Zustand Store）
 * 管理当前项目数据、分镜列表、任务状态
 */

import { create } from 'zustand';
import * as api from './api';
import type { ProjectData, SceneData, TaskStatusData, HitFormula } from './api';

interface ProjectState {
    // 项目列表
    projects: ProjectData[];
    isLoadingProjects: boolean;

    // 当前项目
    currentProject: ProjectData | null;
    currentScenes: SceneData[];

    // 任务状态
    currentTaskId: string | null;
    taskProgress: number;
    taskStatus: string;

    // 爆款公式（阶段一输出）
    hitFormula: HitFormula | null;

    // 操作
    fetchProjects: () => Promise<void>;
    fetchProjectDetail: (id: string) => Promise<void>;
    getProject: (id: string) => Promise<ProjectData | null>;
    setCurrentProject: (project: ProjectData | null) => void;

    // 项目创建
    createProject: (title: string, videoUrl?: string) => Promise<string>;

    // 视频上传
    uploadVideo: (file: File) => Promise<string>;

    // 视频分析
    analyzeVideo: (projectId: string, videoUrl: string) => Promise<string>;

    // 分镜操作
    generateScenes: (projectId: string, transcript: string, prompt: string) => Promise<SceneData[]>;
    updateScene: (sceneId: string, updates: Partial<Pick<SceneData, 'subtitle' | 'voice' | 'volume' | 'prompt'>>) => Promise<void>;

    // 视频导出
    exportVideo: (projectId: string) => Promise<string>;

    // 视频生成（阶段二：根据爆款公式生成）
    generateVideo: (projectId: string, hitFormula: HitFormula) => Promise<string>;

    // 设置爆款公式
    setHitFormula: (formula: HitFormula | null) => void;

    // 任务轮询
    pollTask: (taskId: string, onProgress?: (task: TaskStatusData) => void) => Promise<TaskStatusData>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    isLoadingProjects: false,
    currentProject: null,
    currentScenes: [],
    currentTaskId: null,
    taskProgress: 0,
    taskStatus: 'idle',
    hitFormula: null,

    /** 获取用户所有项目 */
    fetchProjects: async () => {
        set({ isLoadingProjects: true });
        try {
            const res = await api.getProjects();
            set({ projects: res.data || [], isLoadingProjects: false });
        } catch (err) {
            console.error('获取项目列表失败:', err);
            set({ isLoadingProjects: false });
        }
    },

    /** 获取项目详情 */
    fetchProjectDetail: async (id: string) => {
        try {
            const res = await api.getProjectDetail(id);
            if (res.data) {
                set({
                    currentProject: res.data,
                    currentScenes: res.data.scenes || [],
                });
            }
        } catch (err) {
            console.error('获取项目详情失败:', err);
        }
    },

    getProject: async (id: string) => {
        try {
            const res = await api.getProjectDetail(id);
            if (res.data) {
                set({
                    currentProject: res.data,
                    currentScenes: res.data.scenes || [],
                });
                return res.data;
            }
        } catch (err) {
            console.error('获取项目详情失败:', err);
        }
        return null;
    },

    setCurrentProject: (project) => set({ currentProject: project }),

    /** 创建新项目 */
    createProject: async (title: string, videoUrl?: string) => {
        const res = await api.createProject(title, videoUrl);
        if (res.data) {
            set({ currentProject: res.data });
            return res.data.id;
        }
        throw new Error("创建项目失败，未返回 ID");
    },

    /** 上传视频 */
    uploadVideo: async (file: File) => {
        const res = await api.uploadVideo(file);
        return res.data!.videoUrl;
    },

    /** 发起视频分析 */
    analyzeVideo: async (projectId: string, videoUrl: string) => {
        const res = await api.analyzeVideo(projectId, videoUrl);
        const taskId = res.data!.taskId;
        set({ currentTaskId: taskId, taskStatus: 'analyzing', taskProgress: 0 });
        return taskId;
    },

    /** 生成分镜 */
    generateScenes: async (projectId: string, transcript: string, prompt: string) => {
        const res = await api.generateScenes(projectId, transcript, prompt);
        const scenes = res.data || [];
        set({ currentScenes: scenes });
        return scenes;
    },

    /** 更新单个分镜 */
    updateScene: async (sceneId, updates) => {
        const res = await api.updateScene(sceneId, updates);
        if (res.data) {
            // 更新本地分镜列表中的对应项
            const scenes = get().currentScenes.map((s) =>
                s.id === sceneId ? { ...s, ...res.data } : s
            );
            set({ currentScenes: scenes });
        }
    },

    /** 发起视频导出 */
    exportVideo: async (projectId: string) => {
        const res = await api.exportVideo(projectId);
        const taskId = res.data!.taskId;
        set({ currentTaskId: taskId, taskStatus: 'exporting', taskProgress: 0 });
        return taskId;
    },

    /** 根据爆款公式生成新视频（阶段二） */
    generateVideo: async (projectId: string, hitFormula: HitFormula) => {
        const res = await api.generateVideo(projectId, hitFormula);
        const taskId = res.data!.taskId;
        set({ currentTaskId: taskId, taskStatus: 'generating', taskProgress: 0 });
        return taskId;
    },

    /** 设置/清除爆款公式 */
    setHitFormula: (formula) => set({ hitFormula: formula }),

    /** 轮询任务进度 */
    pollTask: async (taskId, onProgress) => {
        return api.pollTaskStatus(taskId, (task) => {
            set({ taskProgress: task.progress, taskStatus: task.status });
            onProgress?.(task);
        });
    },
}));
