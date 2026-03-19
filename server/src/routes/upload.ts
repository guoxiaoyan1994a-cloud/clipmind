/**
 * 视频上传路由
 * POST /api/upload-video — 上传视频至 Supabase Storage
 */

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadService } from '../services/uploadService.js';

const router = Router();

// 使用内存存储，文件直接以 Buffer 形式传递（适合 Serverless 环境）
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 500 * 1024 * 1024, // 500MB 上限
    },
});

router.post(
    '/upload-video',
    upload.single('video'),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                res.sendError('请上传视频文件（字段名：video）', 400);
                return;
            }

            const videoUrl = await uploadService.uploadVideo(req.file);

            res.sendSuccess(
                { videoUrl },
                '视频上传成功',
                201
            );
        } catch (err) {
            next(err);
        }
    }
);

export default router;
