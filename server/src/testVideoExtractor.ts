import { videoExtractor } from './services/videoExtractor.js';

async function testExtraction() {
    const testUrl = 'https://www.douyin.com/video/7562100769530875162/search/%E4%BC%9A%E5%81%9A%E9%A5%AD%E7%9A%84%E7%8C%AB?modal_id=7527299654858853632&type=general'; // 用户提供的长链接
    console.log(`🚀 开始测试提取: ${testUrl}`);
    
    try {
        const result = await videoExtractor.extract(testUrl);
        console.log('✅ 提取成功:');
        console.log(`标题: ${result.title}`);
        console.log(`URL: ${result.videoUrl}`);
    } catch (error) {
        console.error('❌ 提取失败:', error);
    }
}

testExtraction();
