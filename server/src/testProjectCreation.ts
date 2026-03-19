import { projectRepository } from './repositories/projectRepository.js';
import dotenv from 'dotenv';

dotenv.config();

async function testCreate() {
    const mockUserId = '00000000-0000-0000-0000-000000000000';
    console.log(`🚀 尝试使用 Mock User ID 创建项目: ${mockUserId}`);
    
    try {
        const project = await projectRepository.create({
            user_id: mockUserId,
            title: '测试项目 - UUID 修复验证',
            video_url: 'https://vjs.zencdn.net/v/oceans.mp4',
            status: 'draft'
        });
        console.log('✅ 项目创建成功:');
        console.dir(project);
    } catch (error) {
        console.error('❌ 项目创建失败:', error);
    }
}

testCreate();
