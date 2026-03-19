/**
 * 前端 Supabase 客户端
 * 用于直接调用 Supabase Auth（注册/登录/登出）
 * 密钥从环境变量读取，避免硬编码
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 仅在环境变量配置后才创建有效客户端
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
