/**
 * 数据库表类型定义
 * 与 Supabase PostgreSQL 表结构一一对应
 */

// 项目状态枚举
export type ProjectStatus = 'draft' | 'analyzing' | 'editing' | 'exporting' | 'completed' | 'failed';

// 任务类型枚举
export type TaskType = 'analyze' | 'generate_scenes' | 'generate' | 'export';

// 任务状态枚举
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

// projects 表
export interface Project {
    id: string;
    user_id: string;
    title: string;
    video_url: string | null;
    status: ProjectStatus;
    created_at: string;
}

// scenes 表
export interface Scene {
    id: string;
    project_id: string;
    scene_index: number;
    start_time: number;
    end_time: number;
    subtitle: string | null;
    voice: string | null;
    volume: number;
    prompt: string | null;
}

// exports 表
export interface Export {
    id: string;
    project_id: string;
    video_url: string;
    created_at: string;
}

// tasks 表（追踪异步处理任务）
export interface Task {
    id: string;
    project_id: string;
    type: TaskType;
    status: TaskStatus;
    progress: number;
    result: Record<string, unknown> | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
}
