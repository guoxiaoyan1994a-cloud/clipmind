import { douyinParser } from './src/utils/douyinParser.js';

async function test() {
    const shareLink = 'https://v.douyin.com/iYJw4LwG/';
    console.log('正在解析:', shareLink);
    try {
        const info = await douyinParser.parse(shareLink);
        console.log('解析成功:', JSON.stringify(info, null, 2));
    } catch (err) {
        console.error('解析失败:', err);
    }
}
test();
