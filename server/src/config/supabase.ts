/**
 * Supabase 客户端配置
 * 提供两个客户端实例：普通客户端（受 RLS 限制）和管理客户端（绕过 RLS）
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ SUPABASE_URL 或 SUPABASE_ANON_KEY 未配置，数据库功能将不可用'
    );
}

// 普通客户端 — 用于需要遵守行级安全策略（RLS）的场景
export const supabase: SupabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

// 管理客户端 — 使用 service_role key，绕过 RLS，仅在后端服务内部使用
export const supabaseAdmin: SupabaseClient = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseServiceKey || supabaseAnonKey || 'placeholder-key'
);

export default supabase;
