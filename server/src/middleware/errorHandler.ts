/**
 * 全局错误处理中间件
 * 捕获所有未处理的异常，返回统一格式的错误响应
 * 生产环境下不暴露错误详情，防止信息泄露
 */

import { Request, Response, NextFunction } from 'express';

// 自定义应用错误类，支持自定义 HTTP 状态码
export class AppError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    console.error('❌ 服务器错误:', err);

    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const isProduction = process.env.NODE_ENV === 'production';

    res.status(statusCode).json({
        success: false,
        data: null,
        message: isProduction && statusCode === 500
            ? '服务器内部错误，请稍后重试'
            : err.message || '未知错误',
    });
}
