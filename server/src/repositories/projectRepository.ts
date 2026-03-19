/**
 * 项目数据访问层
 * 封装 projects 表的所有 CRUD 操作，禁止在路由层直接操作数据库
 */

import { supabaseAdmin } from '../config/supabase.js';
import type { Project, ProjectStatus } from '../types/index.js';

export class ProjectRepository {
    /** 获取用户所有项目，按创建时间倒序 */
    async findByUserId(userId: string): Promise<Project[]> {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`查询项目列表失败: ${error.message}`);
        return data || [];
    }

    /** 根据 ID 查询单个项目（需验证所属用户） */
    async findById(id: string, userId: string): Promise<Project | null> {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`查询项目详情失败: ${error.message}`);
        }
        return data;
    }

    /** 创建新项目 */
    async create(project: Omit<Project, 'id' | 'created_at'>): Promise<Project> {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .insert(project)
            .select()
            .single();

        if (error) throw new Error(`创建项目失败: ${error.message}`);
        return data;
    }

    /** 更新项目状态 */
    async updateStatus(id: string, status: ProjectStatus): Promise<Project> {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`更新项目状态失败: ${error.message}`);
        return data;
    }

    /** 更新项目视频 URL */
    async updateVideoUrl(id: string, videoUrl: string): Promise<Project> {
        const { data, error } = await supabaseAdmin
            .from('projects')
            .update({ video_url: videoUrl })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`更新项目视频 URL 失败: ${error.message}`);
        return data;
    }
}

export const projectRepository = new ProjectRepository();
