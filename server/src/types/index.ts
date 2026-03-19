/**
 * 统一类型导出入口
 */

export * from './database.js';

// API 请求类型
export interface UploadVideoRequest {
    file: Express.Multer.File;
}

export interface AnalyzeVideoRequest {
    videoUrl: string;
    projectId: string;
}

export interface GenerateScenesRequest {
    projectId: string;
    transcript: string;
    prompt: string;
}

export interface UpdateSceneRequest {
    sceneId: string;
    subtitle?: string;
    voice?: string;
    volume?: number;
    prompt?: string;
}

export interface ExportVideoRequest {
    projectId: string;
}

// ─── 爆款公式相关类型 ────────────────────────────────────

/** 单条分镜描述（由豆包大模型输出全新的翻拍内容） */
export interface FormulaScene {
    sceneIndex: string;       // 镜头编号，如 "1"
    prompt: string;          // 画面描述
    cameraMovement: string;   // 镜头运动
    timeRange: string;       // 持续时间，如 "0:00-0:03"
    duration: number;        // 解析后的秒数
    soundEffects: string;    // 该镜头音效
    bgmDescription: string;  // 该镜头背景音乐
}

/** 字幕条目 */
export interface FormulaSubtitle {
    index: string;           // 字幕序号
    startTime: string;       // 开始时间，如 "0:00"
    endTime: string;         // 结束时间，如 "0:03"
    text: string;            // 字幕文本
}

/** 爆款公式（包含了原视频六要素分析 + 新的翻拍脚本分镜） */
export interface HitFormula {
    // ------------------ 原视频分析多维度（双轨提取） ------------------
    background_music: string;  // 背景音乐描述
    sound_effects: string;     // 音效描述
    role_setting: string;      // 角色设定
    story_summary: string;     // 故事梗概
    subtitle_text: string;     // 字幕文案
    visual_style: string;      // 画面风格
    language_text: string;     // 语言文案
    
    // ------------------ 基于以上生成的全新脚本 ------------------
    scenes: FormulaScene[];    // 新的翻拍分镜列表
    subtitles: FormulaSubtitle[]; // 新的字幕列表
}

export interface GenerateVideoRequest {
    projectId: string;
    hitFormula: HitFormula;
}

// 统一 API 响应格式
export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T | null;
    message: string;
}

// 扩展 Express Request，注入认证用户信息
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}
