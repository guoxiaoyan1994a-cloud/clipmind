import axios from 'axios';

async function testApi() {
    console.log("Testing alternative free rapid/public API...");
    // Let's try api.aa1.cn API which is usually stable for Douyin parsing in CN
    const url = 'https://v.douyin.com/iYJw4LwG/';
    try {
        const apiUrl = `https://api.pearktrue.cn/api/video/douyin.php?url=${encodeURIComponent(url)}`;
        console.log("Requesting:", apiUrl);
        const res = await axios.get(apiUrl, { timeout: 10000 });
        console.log("Status:", res.status);
        console.log("Data:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error("Error:", (e as any).message);
    }
}
testApi();
