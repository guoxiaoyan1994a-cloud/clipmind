import puppeteer from 'puppeteer-core';

export interface ExtractedVideoInfo {
    videoUrl: string;
    title: string;
}

class VideoExtractor {
    private cache: Map<string, ExtractedVideoInfo> = new Map();

    /**
     * 从 greenvideo.cc 提取视频直链
     * @param url 原始短视频链接 (抖音/TikTok等)
     */
    async extract(url: string): Promise<ExtractedVideoInfo> {
        // 1. 检查缓存
        if (this.cache.has(url)) {
            console.log(`[VideoExtractor] 命中缓存: ${url}`);
            return this.cache.get(url)!;
        }

        console.log(`[VideoExtractor] 正在启动系统 Chrome 进行提取: ${url}`);
        
        const browser = await puppeteer.launch({
            // 使用系统安装的 Google Chrome 路径 (Mac)
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            
            // 设置 User-Agent 避免被简单识别
            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

            // 2. 访问首页
            await page.goto('https://greenvideo.cc/', { waitUntil: 'networkidle2' });

            // 3. 准备截获 API 响应
            let extractedData: any = null;
            const apiPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('等待 API 响应超时')), 45000);
                page.on('response', async (response) => {
                    if (response.url().includes('/api/video/cnSimpleExtract')) {
                        try {
                            const json = await response.json();
                            if (json.code === 200 && json.data?.videoItemVoList?.length > 0) {
                                extractedData = {
                                    title: json.data.title || '无标题视频',
                                    videoUrl: json.data.videoItemVoList[0].baseUrl
                                };
                                clearTimeout(timeout);
                                resolve(extractedData);
                            }
                        } catch (e) {
                            // 忽略非 JSON 响应或解析错误
                        }
                    }
                });
            });

            // 4. 输入链接并点击解析
            const inputSelector = '.n-input__input-el';
            await page.waitForSelector(inputSelector);
            await page.type(inputSelector, url);

            const btnSelector = '.button-1';
            await page.waitForSelector(btnSelector);
            await page.click(btnSelector);

            // 5. 等待截获结果
            console.log('[VideoExtractor] 正在拦截 API 响应...');
            const result = await apiPromise as any;

            console.log(`[VideoExtractor] 提取成功: ${result.videoUrl.substring(0, 50)}...`);

            // 6. 存入缓存并返回
            this.cache.set(url, result);
            return result;

        } catch (error) {
            console.error('[VideoExtractor] 提取失败:', error);
            throw error;
        } finally {
            await browser.close();
        }
    }
}

export const videoExtractor = new VideoExtractor();
