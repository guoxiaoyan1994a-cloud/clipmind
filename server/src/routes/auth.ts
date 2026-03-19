import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'clipmind-secret-key-2026';

/**
 * 用户注册：直接存入 public.users 表
 */
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }

    try {
        // 1. 检查用户是否已存在
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('username', username)
            .single();

        if (existingUser) {
            return res.status(400).json({ success: false, message: '该用户名已被注册' });
        }

        // 2. 加密密码
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. 存入数据库
        const userId = uuidv4();
        const { error } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                username,
                password_hash: passwordHash,
                nickname: `用户_${username.substring(0, 4)}`,
            });

        if (error) throw error;

        // 4. 生成 JWT
        const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            data: {
                user: { id: userId, username, name: username },
                token
            },
            message: '注册成功'
        });
    } catch (err: any) {
        console.error('注册错误:', err);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

/**
 * 用户登录
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // 特殊逻辑：内置 admin 账号
    if (username === 'admin' && password === 'admin888') {
        const token = jwt.sign({ userId: '00000000-0000-0000-0000-000000000000' }, JWT_SECRET);
        return res.json({
            success: true,
            data: {
                user: { id: '00000000-0000-0000-0000-000000000000', username: 'admin', name: '管理员' },
                token
            }
        });
    }

    try {
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (error || !user) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            data: {
                user: { id: user.id, username: user.username, name: user.nickname || user.username },
                token
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
});

export default router;
