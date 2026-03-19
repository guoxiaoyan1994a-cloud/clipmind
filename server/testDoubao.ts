/**
 * 豆包 Doubao-Seed-1.8 API 连通性测试
 * 使用用户示例中的图片来验证 API 是否正常工作
 * 运行: npx tsx testDoubao.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

// 手动设置环境变量（以防 .env 加载有问题）
process.env.ARK_API_KEY = process.env.ARK_API_KEY || 'f06aacdf-d740-42d3-bbc7-59d12446871d';
process.env.ARK_MODEL_ID = process.env.ARK_MODEL_ID || 'doubao-seed-1-8-251228';

import { doubaoService } from './src/services/doubaoService.js';

async function main() {
    console.log('🚀 开始测试豆包 Doubao-Seed-1.8 API...');
    console.log(`   API Key: ${process.env.ARK_API_KEY?.substring(0, 8)}...`);
    console.log(`   模型 ID: ${process.env.ARK_MODEL_ID}`);
    console.log('');

    // 使用用户示例中的测试图片
    const testImageUrl = 'https://ark-project.tos-cn-beijing.volces.com/doc_image/ark_demo_img_1.png';

    try {
        console.log(`📸 测试图片: ${testImageUrl}`);
        console.log('⏳ 正在调用 API（可能需要 10-30 秒）...');
        console.log('');

        const result = await doubaoService.analyzeHitVideo(testImageUrl);

        console.log('');
        console.log('═══════════ 分析结果 ═══════════');
        console.log(JSON.stringify(result, null, 2));
        console.log('═══════════════════════════════');
        console.log('');
        console.log(`✅ 测试通过！共生成 ${result.scenes.length} 个分镜`);
    } catch (error) {
        console.error('❌ 测试失败:', error);
        process.exit(1);
    }
}

main();
