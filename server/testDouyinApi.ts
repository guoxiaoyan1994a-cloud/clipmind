import axios from 'axios';

async function testApi() {
    // 真实有效的 ID
    const videoId = '7331575823123456789'; // a dummy but test string
    // 换一个热门视频ID测试一下: 7414771569033350435
    const realVideoId = '7414771569033350435';
    
    // 尝试不同的 endpoint
    const urls = [
        `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${realVideoId}`,
        `https://www.iesdouyin.com/aweme/v1/web/aweme/detail/?aweme_id=${realVideoId}`
    ];
    
    for (const url of urls) {
        console.log(`\nTesting: ${url}`);
        try {
            const res = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            console.log("Status:", res.status);
            console.log("Data keys:", Object.keys(res.data));
            if (res.data.item_list) {
                console.log("Found item_list!");
            }
            if (res.data.aweme_detail) {
                console.log("Found aweme_detail!");
            }
        } catch (e) {
            console.error("Error:", (e as any).message);
        }
    }
}
testApi();
