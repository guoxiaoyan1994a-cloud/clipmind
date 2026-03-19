/**
 * 异步任务数据访问层
 * 封装 tasks 表的 CRUD 操作，用于追踪视频分析和导出等异步任务的状态
 */

import { supabaseAdmin } from '../config/supabase.js';
import type { Task, TaskType, TaskStatus } from '../types/index.js';

export class TaskRepository {
    /** 根据 ID 查询任务 */
    async findById(id: string): Promise<Task | null> {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`查询任务状态失败: ${error.message}`);
        }
        return data;
    }

    /** 创建新任务 */
    async create(task: {
        project_id: string;
        type: TaskType;
        status?: TaskStatus;
        progress?: number;
    }): Promise<Task> {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .insert({
                project_id: task.project_id,
                type: task.type,
                status: task.status || 'pending',
                progress: task.progress || 0,
                result: null,
                error_message: null,
            })
            .select()
            .single();

        if (error) throw new Error(`创建任务失败: ${error.message}`);
        return data;
    }

    /** 更新任务状态和进度 */
    async updateStatus(
        id: string,
        updates: {
            status?: TaskStatus;
            progress?: number;
            result?: Record<string, unknown> | null;
            error_message?: string | null;
        }
    ): Promise<Task> {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`更新任务状态失败: ${error.message}`);
        return data;
    }

    /** 查询项目下的所有任务 */
    async findByProjectId(projectId: string): Promise<Task[]> {
        const { data, error } = await supabaseAdmin
            .from('tasks')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`查询项目任务失败: ${error.message}`);
        return data || [];
    }
}

export const taskRepository = new TaskRepository();
