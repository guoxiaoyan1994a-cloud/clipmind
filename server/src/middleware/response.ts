/**
 * 统一响应格式中间件
 * 为 Express Response 添加 sendSuccess / sendError 辅助方法
 * 确保所有 API 返回 { success, data, message } 结构
 */

import { Request, Response, NextFunction } from 'express';

// 扩展 Express Response 的类型声明
declare global {
    namespace Express {
        interface Response {
            sendSuccess: <T>(data: T, message?: string, statusCode?: number) => void;
            sendError: (message: string, statusCode?: number) => void;
        }
    }
}

export function responseMiddleware(
    _req: Request,
    res: Response,
    next: NextFunction
): void {
    /**
     * 返回成功响应
     * @param data - 响应数据
     * @param message - 提示信息（默认：操作成功）
     * @param statusCode - HTTP 状态码（默认：200）
     */
    res.sendSuccess = <T>(data: T, message = '操作成功', statusCode = 200) => {
        res.status(statusCode).json({
            success: true,
            data,
            message,
        });
    };

    /**
     * 返回错误响应
     * @param message - 错误信息
     * @param statusCode - HTTP 状态码（默认：400）
     */
    res.sendError = (message: string, statusCode = 400) => {
        res.status(statusCode).json({
            success: false,
            data: null,
            message,
        });
    };

    next();
}
