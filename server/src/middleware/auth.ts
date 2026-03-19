/**
 * Supabase JWT 认证中间件
 * 从 Authorization Header 中提取 Bearer Token，验证用户身份
 * 验证通过后将 userId 注入 req 对象供后续使用
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase.js';

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                data: null,
                message: '缺少认证凭据，请在 Authorization Header 中提供 Bearer Token',
            });
            return;
        }

        const token = authHeader.replace('Bearer ', '');

        // 兼容降级模式：如果未配置 Supabase 或接收到前端的模拟 token，直接放行
        const isSupabaseConfigured = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY;
        if (!isSupabaseConfigured || token.startsWith('mock-jwt-token')) {
            req.userId = '00000000-0000-0000-0000-000000000000';
            next();
            return;
        }

        // 使用 Supabase 验证 JWT Token 并获取用户信息
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            res.status(401).json({
                success: false,
                data: null,
                message: '认证失败：无效或过期的 Token',
            });
            return;
        }

        // 将用户 ID 注入请求对象
        req.userId = data.user.id;
        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            data: null,
            message: '认证过程中发生内部错误',
        });
    }
}
