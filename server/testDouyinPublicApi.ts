import axios from 'axios';

async function test() {
    console.log("Testing public Douyin parsing API...");
    // There are many free APIs, e.g., tenapi, uapis, api.aa1.cn
    // Here we test one commonly used free API for TikTok/Douyin parsing
    try {
        const url = 'https://v.douyin.com/iYJw4LwG/';
        // Testing a public free API (e.g., tenapi)
        // https://docs.tenapi.cn/video/douyin.html
        const apiUrl = `https://tenapi.cn/v2/douyin?url=${encodeURIComponent(url)}`;
        console.log("Requesting:", apiUrl);
        const res = await axios.get(apiUrl, { timeout: 10000 });
        console.log("Result:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error("Error:", (e as any).message);
    }
}
test();
