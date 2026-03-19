/**
 * 分镜数据访问层
 * 封装 scenes 表的所有 CRUD 操作
 */

import { supabaseAdmin } from '../config/supabase.js';
import type { Scene } from '../types/index.js';

export class SceneRepository {
    /** 查询项目下所有分镜，按 scene_index 升序 */
    async findByProjectId(projectId: string): Promise<Scene[]> {
        const { data, error } = await supabaseAdmin
            .from('scenes')
            .select('*')
            .eq('project_id', projectId)
            .order('scene_index', { ascending: true });

        if (error) throw new Error(`查询分镜列表失败: ${error.message}`);
        return data || [];
    }

    /** 根据 ID 查询单个分镜 */
    async findById(id: string): Promise<Scene | null> {
        const { data, error } = await supabaseAdmin
            .from('scenes')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new Error(`查询分镜详情失败: ${error.message}`);
        }
        return data;
    }

    /** 批量创建分镜 */
    async createMany(scenes: Omit<Scene, 'id'>[]): Promise<Scene[]> {
        const { data, error } = await supabaseAdmin
            .from('scenes')
            .insert(scenes)
            .select();

        if (error) throw new Error(`批量创建分镜失败: ${error.message}`);
        return data || [];
    }

    /** 更新单个分镜的可编辑字段 */
    async update(
        id: string,
        updates: Partial<Pick<Scene, 'subtitle' | 'voice' | 'volume' | 'prompt'>>
    ): Promise<Scene> {
        const { data, error } = await supabaseAdmin
            .from('scenes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(`更新分镜失败: ${error.message}`);
        return data;
    }

    /** 删除项目下所有分镜（用于重新生成） */
    async deleteByProjectId(projectId: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('scenes')
            .delete()
            .eq('project_id', projectId);

        if (error) throw new Error(`删除分镜失败: ${error.message}`);
    }
}

export const sceneRepository = new SceneRepository();
