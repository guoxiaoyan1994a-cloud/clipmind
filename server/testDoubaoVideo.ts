/**
 * 豆包 Doubao-Seed-1.8 API 视频分析能力测试
 * 测试视频下载 -> FFmpeg 抽帧 -> 组装 Base64 发给大模型的完整链路
 * 运行: npx tsx testDoubaoVideo.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

// 手动设置环境变量（以防 .env 加载有问题）
process.env.ARK_API_KEY = process.env.ARK_API_KEY || 'f06aacdf-d740-42d3-bbc7-59d12446871d';
process.env.ARK_MODEL_ID = process.env.ARK_MODEL_ID || 'doubao-seed-1-8-251228';

import { doubaoService } from './src/services/doubaoService.js';

async function main() {
    console.log('🚀 开始测试视频抽帧与大模型分析...');
    console.log(`   API Key: ${process.env.ARK_API_KEY?.substring(0, 8)}...`);
    
    // 使用一个测试用的 MP4 视频链接
    // (这是互联网公开的一个海洋样本视频)
    const testVideoUrl = 'https://vjs.zencdn.net/v/oceans.mp4';

    try {
        console.log(`🎬 测试视频: ${testVideoUrl}`);
        console.log('⏳ 提取关键帧并调用 AI 中（预计需要 15-45 秒）...');
        console.log('');

        const result = await doubaoService.analyzeHitVideo(testVideoUrl);

        console.log('');
        console.log('═══════════ 分析结果 ═══════════');
        console.log(JSON.stringify(result, null, 2));
        console.log('═══════════════════════════════');
        console.log('');
        console.log(`✅ 视频分析通过！成功转换为爆款公式`);
    } catch (error) {
        console.error('❌ 测试失败:', error);
        process.exit(1);
    }
}

main();
