/**
 * Supabase JWT 认证中间件
 * 从 Authorization Header 中提取 Bearer Token，验证用户身份
 * 验证通过后将 userId 注入 req 对象供后续使用
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'clipmind-secret-key-2026';

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
                message: '缺少认证凭据',
            });
            return;
        }

        const token = authHeader.replace('Bearer ', '');

        // 1. 兼容内置 Mock Token
        if (token.startsWith('mock-jwt-token')) {
            req.userId = '00000000-0000-0000-0000-000000000000';
            return next();
        }

        // 2. 尝试验证自定义 JWT (Simple Auth)
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            if (decoded && decoded.userId) {
                req.userId = decoded.userId;
                return next();
            }
        } catch (jwtErr) {
            // JWT 验证失败，可能是 Supabase Token，继续尝试下一种方式
        }

        // 3. 回退：尝试 Supabase 原生验证 (兼容存量活跃用户)
        const isSupabaseConfigured = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY;
        if (isSupabaseConfigured) {
            const { data, error } = await supabase.auth.getUser(token);
            if (!error && data.user) {
                req.userId = data.user.id;
                return next();
            }
        }

        res.status(401).json({
            success: false,
            data: null,
            message: '认证失败：无效或过期的 Token',
        });
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(500).json({
            success: false,
            data: null,
            message: '认证异常',
        });
    }
}
