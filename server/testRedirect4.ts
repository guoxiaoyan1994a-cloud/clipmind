import axios from 'axios';

async function test() {
    console.log("Fetching HTML with Axios...");
    try {
        const res = await axios.get('https://v.douyin.com/iYJw4LwG/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
            }
        });
        
        // Let's check if the HTML contains the item_id directly.
        const html = res.data;
        const match = html.match(/\/video\/(\d+)/) || html.match(/itemId(:\s*|")(\d+)/i) || html.match(/item_id=(\d+)/);
        if (match) {
             console.log("Found ID:", match[match.length - 1]);
        } else {
             console.log("HTML doesn't contain obvious ID. Length:", html.length);
             // console.log(html.substring(0, 1000));
        }

        console.log("Final URL:", res.request?.res?.responseUrl || res.request?.res?.responseURL);
    } catch(e) {
        console.error("Error:", (e as any).message);
    }
}
test();
