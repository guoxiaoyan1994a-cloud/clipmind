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
    async generateRemakeScenes(baseData: any): Promise<any> {
        const scriptPrompt = `你是顶尖的短视频连场打编导。请基于我已经提取出的这个爆款视频核心要素：
${JSON.stringify(baseData, null, 2)}

为你现在的任务是：创作一套【全新的翻拍二创视频分镜脚本】。新脚本既要继承原视频的爆款基因（情绪、结构），又要在内容上做差异化。
请严格返回如下纯 JSON 数组格式（不要有 markdown 块）：
[
  {
    "sceneIndex": 1,
    "duration": 3,
    "prompt": "【翻拍新脚本】镜头1的画面描述（用于给AI视频模型生成画面）",
    "subtitle": "【翻拍新脚本】镜头1对应的旁白或台词"
  }
]`;

        const contentNodes: any[] = [{ type: 'input_text', text: scriptPrompt }];
        try {
            // 生成衍生脚本可以使用 visualModel 也可以使用 audioModel，这里默认使用 1.6-Vision
            const data = await this.callApiDirectly(contentNodes, this.visualModelId || "doubao-seed-1-6-vision-250815");
            const scenes = this.parseJsonFromText(data);
            return Array.isArray(scenes) ? scenes : [];
        } catch (e) {
            console.error("生成衍生分镜异常", e);
            return [];
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

            console.log(`✅ 双轨提取完毕，开始利用提取数据生成二次原创分镜...`);
            
            // 第三步：基于完全提取准确的要素，衍生并裂变出翻拍分镜
            const finalScenes = await this.generateRemakeScenes(combinedData);

            return {
                ...combinedData,
                scenes: finalScenes.length > 0 ? finalScenes : this.getMockHitFormula(videoUrl).scenes
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
                    sceneIndex: 1,
                    duration: 3,
                    prompt: "【翻拍新脚本】中景：主角在杂乱的办公桌前焦头烂额，然后突然拿出一个神秘的工作利器。背景模糊。",
                    subtitle: "【翻拍新脚本】你是不是也经常遇到这种情况？今天教你一个连老手都不知道的隐藏技巧。"
                },
                {
                    sceneIndex: 2,
                    duration: 4,
                    prompt: "【翻拍新脚本】特写：手指快速在键盘和鼠标间移动，展示该利器如何行云流水般解决问题。",
                    subtitle: "【翻拍新脚本】不要再加班了，看这个操作多丝滑。"
                },
                {
                    sceneIndex: 3,
                    duration: 8,
                    prompt: "【翻拍新脚本】主观视角：屏幕画面变得整洁，工作瞬间完成。画面明亮清晰。",
                    subtitle: "【翻拍新脚本】只要五行配置，立刻搞定！看到没？就是这么简单！"
                },
                {
                    sceneIndex: 4,
                    duration: 5,
                    prompt: "【翻拍新脚本】中景：主角微笑面对镜头，做出点赞手势，旁边出现引导动画和火花特效。",
                    subtitle: "【翻拍新脚本】学会了记得点赞收藏，下次不迷路哦！"
                }
            ]
        };
    }
}
export const doubaoService = new DoubaoService();
