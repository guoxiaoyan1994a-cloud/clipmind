import axios from 'axios';

async function test() {
    console.log("Fetching with Axios...");
    try {
        const res = await axios.get('https://v.douyin.com/iYJw4LwG/', {
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400,
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
            }
        });
        console.log("Status:", res.status);
        console.log("Location:", res.headers.location);
    } catch(e) {
        console.error("Error:", (e as any).message);
    }
}
test();
