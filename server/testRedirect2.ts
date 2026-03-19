async function test() {
    console.log("Fetching...");
    try {
        const res = await fetch('https://v.douyin.com/iYJw4LwG/', {
            redirect: 'manual',
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
            }
        });
        console.log("Status:", res.status);
        console.log("Location:", res.headers.get('location'));
    } catch(e) {
        console.error(e);
    }
}
test();
