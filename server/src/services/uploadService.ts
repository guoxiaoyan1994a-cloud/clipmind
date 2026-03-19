/**
 * 视频上传服务
 * 负责将视频文件上传至 Supabase Storage 的 videos 桶
 */

import { supabaseAdmin } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../middleware/errorHandler.js';

// 允许上传的视频 MIME 类型
const ALLOWED_MIME_TYPES = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/x-matroska',
];

// 最大文件大小：500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;

export class UploadService {
    /**
     * 上传视频文件到 Supabase Storage
     * @param file - Multer 解析后的文件对象
     * @returns 上传后的公开访问 URL
     */
    async uploadVideo(file: Express.Multer.File): Promise<string> {
        // 验证文件类型
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            throw new AppError(
                `不支持的文件格式 ${file.mimetype}，仅支持 MP4、MOV、AVI、WebM、MKV`,
                400
            );
        }

        // 验证文件大小
        if (file.size > MAX_FILE_SIZE) {
            throw new AppError('文件大小超过限制（最大 500MB）', 400);
        }

        // 生成唯一文件路径，避免命名冲突
        const fileExt = file.originalname.split('.').pop() || 'mp4';
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error } = await supabaseAdmin.storage
            .from('videos')
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            throw new AppError(`视频上传失败: ${error.message}`, 500);
        }

        // 获取公开访问 URL
        const { data: urlData } = supabaseAdmin.storage
            .from('videos')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    }
}

export const uploadService = new UploadService();
