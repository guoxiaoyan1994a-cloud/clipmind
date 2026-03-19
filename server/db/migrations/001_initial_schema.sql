-- ClipMind 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本以创建所需的表

-- ===============================================
-- 启用 UUID 生成扩展
-- ===============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===============================================
-- 项目表：存储用户创建的视频项目
-- ===============================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT '未命名项目',
  video_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'analyzing', 'editing', 'exporting', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 按用户查询项目的索引
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
-- 按状态过滤的索引
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ===============================================
-- 分镜表：存储视频分镜（场景片段）信息
-- ===============================================
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  scene_index INTEGER NOT NULL,
  start_time REAL NOT NULL DEFAULT 0,
  end_time REAL NOT NULL DEFAULT 0,
  subtitle TEXT,
  voice VARCHAR(50),
  volume INTEGER NOT NULL DEFAULT 100 CHECK (volume >= 0 AND volume <= 200),
  prompt TEXT
);

-- 按项目查询分镜的索引
CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);

-- ===============================================
-- 导出记录表：存储最终导出的视频信息
-- ===============================================
CREATE TABLE IF NOT EXISTS exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 按项目查询导出记录的索引
CREATE INDEX IF NOT EXISTS idx_exports_project_id ON exports(project_id);

-- ===============================================
-- 异步任务表：追踪视频分析、导出等异步处理任务
-- ===============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL
    CHECK (type IN ('analyze', 'generate_scenes', 'export')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 按项目查询任务的索引
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
-- 按状态过滤的索引
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- ===============================================
-- 行级安全策略（RLS）
-- 用户只能访问自己的数据
-- ===============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 项目表 RLS：用户只能操作自己创建的项目
CREATE POLICY "用户只能查看自己的项目" ON projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "用户只能创建自己的项目" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户只能更新自己的项目" ON projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "用户只能删除自己的项目" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- 分镜表 RLS：通过项目归属关系间接控制
CREATE POLICY "用户只能查看自己项目的分镜" ON scenes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = scenes.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "用户只能创建自己项目的分镜" ON scenes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = scenes.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "用户只能更新自己项目的分镜" ON scenes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = scenes.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "用户只能删除自己项目的分镜" ON scenes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = scenes.project_id AND projects.user_id = auth.uid())
  );

-- 导出表 RLS
CREATE POLICY "用户只能查看自己项目的导出" ON exports
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = exports.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "用户只能创建自己项目的导出" ON exports
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = exports.project_id AND projects.user_id = auth.uid())
  );

-- 任务表 RLS
CREATE POLICY "用户只能查看自己项目的任务" ON tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = tasks.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "用户只能创建自己项目的任务" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = tasks.project_id AND projects.user_id = auth.uid())
  );
CREATE POLICY "用户只能更新自己项目的任务" ON tasks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = tasks.project_id AND projects.user_id = auth.uid())
  );

-- ===============================================
-- Supabase Storage 桶配置
-- 在 Supabase Dashboard > Storage 中创建以下桶：
--   1. videos  (公开读取，认证上传)
--   2. exports (公开读取，认证上传)
-- ===============================================
