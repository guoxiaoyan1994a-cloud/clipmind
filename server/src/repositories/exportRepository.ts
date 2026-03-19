/**
 * 导出记录数据访问层
 * 封装 exports 表的 CRUD 操作
 */

import { supabaseAdmin } from '../config/supabase.js';
import type { Export } from '../types/index.js';

export class ExportRepository {
    /** 查询项目的所有导出记录 */
    async findByProjectId(projectId: string): Promise<Export[]> {
        const { data, error } = await supabaseAdmin
            .from('exports')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(`查询导出记录失败: ${error.message}`);
        return data || [];
    }

    /** 创建导出记录 */
    async create(exportData: Omit<Export, 'id' | 'created_at'>): Promise<Export> {
        const { data, error } = await supabaseAdmin
            .from('exports')
            .insert(exportData)
            .select()
            .single();

        if (error) throw new Error(`创建导出记录失败: ${error.message}`);
        return data;
    }
}

export const exportRepository = new ExportRepository();
