import type { HitFormula } from '../types/index.js';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 设置 FFmpeg 和 FFprobe 二进制文件本地路径
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

// 火山引擎 chat/completions API 的响应类型
interface ArkChatResponse {
    id: string;
    choices: Array<{
        message: {
            content: string;
            role: string;
        };
        finish_reason: string;
    }>;
    error?: { message: string; code: string };
}

export class DoubaoService {
    private apiKey: string | undefined;
    private visualModelId: string | undefined;
    private audioModelId: string | undefined;
    // 火山引擎 Ark API 基础地址（使用 OpenAI 兼容的 chat/completions端点）
    private readonly baseUrl = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    constructor() {
        this.apiKey = process.env.ARK_API_KEY;
        this.visualModelId = process.env.ARK_VISUAL_MODEL_ID;
        this.audioModelId = process.env.ARK_AUDIO_MODEL_ID;
    }

    /**
     * 将视频抽帧并转换为 Base64 数组
     */
    async extractFramesAndConvertToBase64(videoUrl: string, frameCount: number = 5): Promise<string[]> {
        return new Promise((resolve, reject) => {
            console.log(`🎬 准备从视频中抽取 ${frameCount} 帧...`);
            const tempDir = '/tmp/clipmind-frames';
            
            // 确保临时目录存在
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const jobId = crypto.randomUUID();
            const outputPattern = path.join(tempDir, `${jobId}-%03d.jpg`);

            ffmpeg(videoUrl)
                .on('end', () => {
                    console.log('✅ 视频抽帧完成，准备读取文件...');
                    try {
                        const files = fs.readdirSync(tempDir)
                            .filter(f => f.startsWith(jobId))
                            .sort() // 确保按顺序读取
                            .map(f => path.join(tempDir, f));

                        const base64Images = files.map(file => {
                            const ext = path.extname(file).slice(1);
                            const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
                            const base64Str = fs.readFileSync(file, { encoding: 'base64' });
                            return `data:${mimeType};base64,${base64Str}`;
                        });

                        // 读取完毕后清理文件
                        files.forEach(file => {
                            try { fs.unlinkSync(file); } catch (e) { /* ignore */ }
                        });

                        resolve(base64Images);
                    } catch (error) {
                        reject(new Error(`读取抽帧文件失败: ${error}`));
                    }
                })
                .on('error', (err) => {
                    console.error('❌ FFmpeg 抽帧失败:', err);
                    reject(err);
                })
                // 指定输出帧数 (例如：获取总时长，均匀散布 5 帧，vframes 仅对某些协议有效。为了稳妥，这里使用 screenshot)
                .screenshots({
                    count: frameCount,
                    folder: tempDir,
                    filename: `${jobId}-%03d.jpg`,
                    size: '640x?' // 缩减尺寸以减小 base64 体积和 token 消耗
                });
        });
    }

    /**
     * 第一路：分析音频轨道与声效
     */
    async analyzeAudioTrack(images: string[]): Promise<any> {
        // 注：目前后端缺少直接的火山音频语音理解(ASR)端点。
        // 为了架构上完成双轨双馈，我们这里将用户的 Coze 语音 Prompt 发送给已有的多模态/文本模型，
        // 配合抽取的画面帧（代替真实的听觉），让它尽可能猜测或我们暂时返回占位，直到配置真实音频端点。
        const audioPrompt = `# 角色定义
你是一位专业的音频理解专家，擅长从多模态输入中分析视频的【背景音乐】、【音效特征】以及【人声/语音文案】。

# 任务目标
请分析提供的视频特征，提取以下三项内容：
1. 背景音乐：描述风格、情绪、节奏。
2. 音效：描述环境音、特殊效果音、转场音。
3. 语音文案：视频中人物所说的话（非字幕，而是人声语音内容）。

# 约束与规则
- 如果无法确定，标记为 "暂未识别到"
- 必须严格返回如下格式的纯 JSON 对象：
{
  "background_music": "...",
  "sound_effects": "...",
  "language_text": "..."
}`;

        const contentNodes: any[] = images.map(img => ({ type: 'input_image', image_url: img }));
        contentNodes.push({ type: 'input_text', text: audioPrompt });

        try {
            const data = await this.callApiDirectly(contentNodes, this.audioModelId || "doubao-seed-1-8-241215");
            return this.parseJsonFromText(data);
        } catch (e) {
            console.error("音频分支 (Seed-1.8) 分析失败，采用安全回退", e);
            return {
                background_music: "快节奏电子混音（推测）",
                sound_effects: "转场音效（推测）",
                language_text: "暂未识别到语音内容"
            };
        }
    }

    /**
     * 第二路：视觉多模态分析
     */
    async analyzeVisualFrames(images: string[]): Promise<any> {
        const visualPrompt = `# 角色定义
你是一位专业的视频视觉分析专家，擅长从画面中提取深层信息。

# 任务目标
请分析视频截图，提取以下四项视觉和内容要素：
1. 角色设定：视频中人物的外貌、性格、人设特征。
2. 故事梗概：视频所表达的核心故事情节描述。
3. 字幕文案：画面中出现的文本、标题、装饰性的字幕内容。
4. 画面风格：视频的色调、构图、美术风格。

# 约束与规则
- 如果无法确定，标记为 "暂未识别到"
- 必须严格返回如下格式的纯 JSON 对象：
{
  "role_setting": "...",
  "story_summary": "...",
  "subtitle_text": "...",
  "visual_style": "..."
}`;

        const contentNodes: any[] = images.map(img => ({ type: 'input_image', image_url: img }));
        contentNodes.push({ type: 'input_text', text: visualPrompt });

        try {
            // 视觉分析强力使用 1.6-Vision
            const data = await this.callApiDirectly(contentNodes, this.visualModelId || "doubao-seed-1-6-vision-250815");
            return this.parseJsonFromText(data);
        } catch (e) {
            console.error("画面分支 (1.6-Vision) 分析失败", e);
            throw e;
        }
    }

    /**
     * 第三路：综合汇总并生成翻拍二创脚本
     */
    async generateRemakeScenes(baseData: any): Promise<{ scenes: any[], subtitles: any[] }> {
        const scriptPrompt = `# 角色定义
你是一位专业的影视编剧和分镜脚本专家，擅长将视频内容改写成专业、生动的分镜脚本和字幕。

# 任务目标
你的任务是基于提供的视频分析和音频分析结果，生成专业的分镜脚本和对应字幕，**总时长严格控制在15秒以内**。

# 工作流上下文
- **Input**: 视频分析结果（角色、故事、画面风格等）和音频分析结果（背景音乐、音效等）
- **Process**:
  1. 理解视频的整体故故事内容划分 3-5 个关键镜头（不超过5个）
  2. 为每个镜头设计专业的描述，包含画面内容、镜头运动、音效、背景音乐等
  3. 为关键镜头生成对应的字幕文案
  4. **严格控制总时长在15秒以内**，每个镜头时长2-5秒
- **Output**: 结构化的分镜脚本和字幕列表

# 约束与规则
- **总时长必须控制在15秒以内**（包括所有镜头）
- **镜头数量限制在3-5个之间**，选择最关键、最具代表性的镜头
- 每个镜头时长2-5秒，避免过长
- **持续时间格式必须是MM:SS-MM:SS**（如0:00-0:03），不能使用其他格式
- **镜头编号必须是字符串格式**（如"1"、"2"、"3"），不能使用数字
- 分镜脚本必须包含：镜头编号、画面描述、镜头运动、音效、背景音乐、持续时间等要素
- 字幕要简洁明了，符合视频节奏和情感表达
- 镜头切换要流畅，符合叙事逻辑
- 音效和背景音乐要与画面内容相匹配
- 整体风格要统一，符合视频的视觉和听觉特征
- 确保输出格式严格符合JSON结构

# 分镜脚本格式要求
每个镜头包含以下字段：
- 镜头编号：按顺序编号（字符串格式，如"1"、"2"、"3"）
- 画面描述：详细描述画面内容、角色动作、场景等
- 镜头运动：描述镜头的移动方式（固定、推、拉、摇、移、跟、俯仰等）
- 持续时间：预估每个镜头的时长（字符串格式，MM:SS-MM:SS，如"0:00-0:03"）
- 音效：该镜头的音效描述
- 背景音乐：背景音乐的节奏和情绪描述

# 输出格式 (仅返回纯 JSON)
{
  "分镜脚本": [
    {
      "镜头编号": "1",
      "画面描述": "...",
      "镜头运动": "...",
      "持续时间": "0:00-0:03",
      "音效": "...",
      "背景音乐": "..."
    }
  ],
  "字幕列表": [
    {
      "字幕序号": "1",
      "开始时间": "0:00",
      "结束时间": "0:03",
      "字幕文本": "..."
    }
  ]
}

# 输入数据
${JSON.stringify(baseData, null, 2)}`;

        const contentNodes: any[] = [{ type: 'input_text', text: scriptPrompt }];
        try {
            // 使用音质更好的 1.8 模型进行创作
            const data = await this.callApiDirectly(contentNodes, this.audioModelId || "doubao-seed-1-8-241215");
            const rawJson = this.parseJsonFromText(data);
            
            // 映射到内部 FormulaScene 格式
            const scenes = (rawJson["分镜脚本"] || []).map((s: any) => ({
                sceneIndex: s["镜头编号"],
                prompt: s["画面描述"],
                cameraMovement: s["镜头运动"],
                timeRange: s["持续时间"],
                soundEffects: s["音效"],
                bgmDescription: s["背景音乐"],
                duration: this.parseDurationToSeconds(s["持续时间"])
            }));

            const subtitles = (rawJson["字幕列表"] || []).map((sub: any) => ({
                index: sub["字幕序号"],
                startTime: sub["开始时间"],
                endTime: sub["结束时间"],
                text: sub["字幕文本"]
            }));

            return { scenes, subtitles };
        } catch (e) {
            console.error("生成衍生分镜异常 (1.8)", e);
            return { scenes: [], subtitles: [] };
        }
    }

    /** 辅助函数：将 "0:00-0:03" 转换为秒数 */
    private parseDurationToSeconds(range: string): number {
        try {
            const parts = range.split('-');
            const start = parts[0].split(':').map(Number);
            const end = parts[1].split(':').map(Number);
            const startSec = start[0] * 60 + start[1];
            const endSec = end[0] * 60 + end[1];
            return Math.max(endSec - startSec, 1);
        } catch {
            return 3; // 默认保底 3 秒
        }
    }

    /**
     * 基础 HTTP 发送通道
     */
    private async callApiDirectly(contentNodes: any[], targetModelId: string): Promise<string> {
        const requestBody = {
            model: targetModelId,
            input: [ { role: 'user', content: contentNodes } ]
        };

        const responseUrl = 'https://ark.cn-beijing.volces.com/api/v3/responses';
        const response = await fetch(responseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API 返回 HTTP ${response.status}: ${errorText}`);
        }

        const data = (await response.json()) as any;
        if (data.error) throw new Error(`API 错误 [${data.error.code}]: ${data.error.message}`);

        let textContent = '';
        if (data.output && Array.isArray(data.output)) {
            for (const out of data.output) {
                if (out.role === 'assistant' && Array.isArray(out.content)) {
                    for (const c of out.content) {
                        if (c.type === 'output_text' && c.text) textContent = c.text;
                    }
                }
            }
        }
        
        if (!textContent) throw new Error('API 响应中未找到有效文本内容');
        return textContent;
    }

    /**
     * 分析视频并生成爆款公式 (对外主入口)
     * 架构升级：采用音视频双轨独立发起请求，再汇总
     */
    async analyzeHitVideo(videoUrl: string): Promise<HitFormula> {
        if (!this.apiKey) {
            console.warn('⚠️ ARK_API_KEY 未配置，使用 Mock 爆款公式');
            return this.getMockHitFormula(videoUrl);
        }

        console.log(`🧠 [双轨架构] 调用多模态大模型并行分析视频: ${videoUrl}`);

        try {
            const ext = videoUrl.split('?')[0].toLowerCase().split('.').pop();
            const isImage = ext && ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext);
            let imagesToAnalyze: string[] = isImage ? [videoUrl] : await this.extractFramesAndConvertToBase64(videoUrl, 5);

            if (imagesToAnalyze.length === 0) throw new Error('提取素材失败');

            console.log(`📡 并行发射：[音频提取] 与 [视觉提取] 双轨道...`);
            
            // 兵分两路：一路去听（模拟），一路去看
            const [audioResult, visualResult] = await Promise.all([
                this.analyzeAudioTrack(imagesToAnalyze),
                this.analyzeVisualFrames(imagesToAnalyze)
            ]);

            // 汇总两者的解构产出
            const combinedData = {
                background_music: audioResult.background_music || "暂未识别到",
                sound_effects: audioResult.sound_effects || "暂未识别到",
                language_text: audioResult.language_text || "暂未识别到", // 现在由音频(1.8)总结
                role_setting: visualResult.role_setting || "暂未识别到",
                story_summary: visualResult.story_summary || "暂未识别到",
                subtitle_text: visualResult.subtitle_text || "暂未识别到",
                visual_style: visualResult.visual_style || "暂未识别到"
            };

            console.log(`✅ 双轨提取完毕，开始利用 1.8 创作翻拍脚本...`);
            
            // 第三步：基于完全提取准确的要素，衍生并裂变出翻拍分镜
            const { scenes, subtitles } = await this.generateRemakeScenes(combinedData);

            return {
                ...combinedData,
                scenes: scenes.length > 0 ? scenes : [],
                subtitles: subtitles.length > 0 ? subtitles : []
            };

        } catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            console.error(`❌ 豆包双轨 API 管线完全崩塌: ${errMsg}，回退到 Mock 数据`);
            return this.getMockHitFormula(videoUrl);
        }
    }

    /**
     * 辅助解析器：安全剔除多余的 markdown 并转 JSON
     */
    private parseJsonFromText(text: string): any {
        let jsonStr = text.trim();
        const match = jsonStr.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
        if (match) jsonStr = match[1];

        try {
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('❌ JSON 解析失败。原始文本:', text);
            throw error;
        }
    }

    /**
     * Mock 数据 (用于未配置 API Key 时测试)
     */
    private getMockHitFormula(videoUrl: string): HitFormula {
        return {
            background_music: "轻快活泼的夏日电子节奏",
            sound_effects: "转场Swish音效、系统提示金币掉落音",
            role_setting: "一个对生活充满好奇的探店达人形象",
            story_summary: "通过一次意外迷路，发现了巷子里不为人知的百年老店",
            subtitle_text: "大字号悬念体：这是我吃过最便宜的米其林...",
            visual_style: "赛博朋克高对比度、快节奏剪辑",
            language_text: "亲切自然，带有一点惊喜与分享欲的语调",
            scenes: [
                {
                    sceneIndex: "1",
                    duration: 3,
                    timeRange: "0:00-0:03",
                    prompt: "【翻拍新脚本】中景：主角在杂乱的办公桌前焦头烂额，然后突然拿出一个神秘的工作利器。背景模糊。",
                    cameraMovement: "推至特写",
                    soundEffects: "快速打字声",
                    bgmDescription: "悬疑转欢快"
                },
                {
                    sceneIndex: "2",
                    duration: 4,
                    timeRange: "0:03-0:07",
                    prompt: "【翻拍新脚本】特写：手指快速在键盘和鼠标间移动，展示该利器如何行云流水般解决问题。",
                    cameraMovement: "固定",
                    soundEffects: "键盘机械声",
                    bgmDescription: "快节奏鼓点"
                }
            ],
            subtitles: [
                {
                    index: "1",
                    startTime: "0:00",
                    endTime: "0:03",
                    text: "还在为工作发愁吗？"
                }
            ]
        };
    }
}
export const doubaoService = new DoubaoService();
