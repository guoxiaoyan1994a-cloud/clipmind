import https from 'https';
import http from 'http';

function getRedirect(url: string): Promise<string> {
    return new Promise((resolve) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
            }
        }, (res) => {
            resolve(res.headers.location || res.url || '');
        }).on('error', () => resolve(''));
    });
}

(async () => {
    const loc = await getRedirect('https://v.douyin.com/iYJw4LwG/');
    console.log('Redirect location:', loc);
})();
