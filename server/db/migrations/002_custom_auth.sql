-- 1. 创建自定义用户表（在 public 模式下，不受 Supabase Auth 限制）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  nickname VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 修改项目表，解除对 auth.users 的强依赖，改为引用我们自己的 users 表
-- 注意：如果表中已有数据，这可能会报错。如果是全新开发可以直接执行。
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_user_id_fkey;
ALTER TABLE projects ADD CONSTRAINT projects_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. 关闭 RLS（既然用户想要极简，我们就在开发阶段完全放开）
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE scenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE exports DISABLE ROW LEVEL SECURITY;
