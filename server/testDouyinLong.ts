import { douyinParser } from './src/utils/douyinParser.js';

async function test() {
    // 这是一个常见的长链接格式
    const longLink = 'https://www.douyin.com/video/7331575823123456789';
    console.log('正在解析长链接:', longLink);
    try {
        const info = await douyinParser.parse(longLink);
        console.log('解析成功:', JSON.stringify(info, null, 2));
    } catch (err) {
        console.error('解析失败:', err);
    }
}
test();
