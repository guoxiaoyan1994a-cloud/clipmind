import axios from 'axios';
import * as cheerio from 'cheerio';

async function extractFromHtml(videoId: string) {
    const url = `https://www.douyin.com/video/${videoId}`;
    console.log("Fetching HTML for:", url);
    try {
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9',
            }
        });
        
        const html = res.data;
        // console.log("HTML length:", html.length);
        
        // Douyin injects application state into a script tag, usually id="RENDER_DATA"
        const $ = cheerio.load(html);
        const renderDataStr = $('#RENDER_DATA').html();
        if (!renderDataStr) {
            console.log("No #RENDER_DATA found.");
            return;
        }
        
        // decode URI component
        const decoded = decodeURIComponent(renderDataStr);
        const data = JSON.parse(decoded);
        
        // Try to navigate the massive JSON tree
        // The path is usually weird and subject to change, but let's search for "playAddr" or similar strings
        // Just print the root keys to understand the structure
        console.log("Root keys:", Object.keys(data));
        
        // recursive search for 'playUrl' or 'play_addr'
        let foundUrl = '';
        function searchObj(obj: any, level = 0) {
            if (level > 20) return;
            if (typeof obj === 'string') {
                if (obj.includes('.mp4') || obj.includes('video/tos')) {
                    if(!foundUrl) {
                        foundUrl = obj;
                        console.log("Found mp4 string:", obj.substring(0, 100));
                    }
                }
            } else if (Array.isArray(obj)) {
                obj.forEach(v => searchObj(v, level + 1));
            } else if (typeof obj === 'object' && obj !== null) {
                // watch out for specific keys
                if (obj.play_addr || obj.playAddr) {
                    console.log("Found play_addr object!");
                }
                Object.values(obj).forEach(v => searchObj(v, level + 1));
            }
        }
        searchObj(data);
        
        if (foundUrl) {
           console.log("Successfully extracted a video URL!"); 
        } else {
           console.log("Could not find video URL in RENDER_DATA."); 
        }

    } catch (e) {
        console.error("Error:", (e as any).message);
    }
}

// 7331575823123456789 might be invalid, let's use a known real one
extractFromHtml('7414771569033350435');
