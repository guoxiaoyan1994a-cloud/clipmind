/**
 * ClipMind API 客户端
 * 封装所有后端 API 调用，统一处理请求头、错误和响应格式
 * 需要认证的请求会自动从 authStore 获取 Token
 */

// 后端 API 基础地址
// 开发环境使用 Vite 代理（空字符串 = 相对路径），生产环境使用环境变量
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 统一响应类型
interface ApiResponse<T = unknown> {
    success: boolean;
    data: T | null;
    message: string;
}

/**
 * 获取当前认证 Token
 * 优先从 Supabase session 获取，降级从 localStorage 读取
 * 避免循环依赖，不直接导入 authStore
 */
function getAuthToken(): string | null {
    try {
        // 优先从 Zustand 持久化中获取（兼容模拟模式和 Supabase 模式）
        const raw = localStorage.getItem('clipmind-auth');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.token || null;
    } catch {
        return null;
    }
}

/**
 * 通用请求函数
 * 自动添加 Authorization Header 和 Content-Type
 */
async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };

    // 自动注入认证头
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 非 FormData 请求自动设置 JSON Content-Type
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
        throw new Error(data.message || `请求失败 (${response.status})`);
    }

    return data;
}

// ─── 视频上传 ──────────────────────────────────────────
export async function uploadVideo(file: File) {
    const formData = new FormData();
    formData.append('video', file);

    return request<{ videoUrl: string }>('/api/upload-video', {
        method: 'POST',
        body: formData,
    });
}

// ─── 视频分析 ──────────────────────────────────────────
export async function analyzeVideo(projectId: string, videoUrl: string) {
    return request<{ taskId: string; status: string; message: string }>(
        '/api/analyze-video',
        {
            method: 'POST',
            body: JSON.stringify({ projectId, videoUrl }),
        }
    );
}

// ─── 分镜生成 ──────────────────────────────────────────
export interface SceneData {
    id: string;
    project_id: string;
    scene_index: number;
    start_time: number;
    end_time: number;
    subtitle: string | null;
    voice: string | null;
    volume: number;
    prompt: string | null;
}

export async function generateScenes(
    projectId: string,
    transcript: string,
    prompt: string
) {
    return request<SceneData[]>('/api/generate-scenes', {
        method: 'POST',
        body: JSON.stringify({ projectId, transcript, prompt }),
    });
}

// ─── 分镜更新 ──────────────────────────────────────────
export async function updateScene(
    sceneId: string,
    updates: {
        subtitle?: string;
        voice?: string;
        volume?: number;
        prompt?: string;
    }
) {
    return request<SceneData>('/api/update-scene', {
        method: 'POST',
        body: JSON.stringify({ sceneId, ...updates }),
    });
}

// ─── 视频导出 ──────────────────────────────────────────
export async function exportVideo(projectId: string) {
    return request<{ taskId: string; status: string; message: string }>(
        '/api/export-video',
        {
            method: 'POST',
            body: JSON.stringify({ projectId }),
        }
    );
}

// ─── 爆款公式类型 ────────────────────────────────────────
export interface FormulaScene {
    sceneIndex: number;
    duration: number;
    prompt: string;
    subtitle: string;
    visualStyle: string;
    cameraWork: string;
}

export interface HitFormula {
    background_music: string;
    sound_effects: string;
    role_setting: string;
    story_summary: string;
    subtitle_text: string;
    visual_style: string;
    language_text: string;
    scenes: FormulaScene[];
}

// ─── 视频生成（阶段二：Seedance） ────────────────────────
export async function generateVideo(projectId: string, hitFormula: HitFormula) {
    return request<{ taskId: string; status: string; message: string }>(
        '/api/generate-video',
        {
            method: 'POST',
            body: JSON.stringify({ projectId, hitFormula }),
        }
    );
}

// ─── 项目列表 ──────────────────────────────────────────
export interface ProjectData {
    id: string;
    user_id: string;
    title: string;
    video_url: string | null;
    status: string;
    created_at: string;
    result?: Record<string, any>; // 后台任务填充的模型结果
}

export async function getProjects() {
    return request<ProjectData[]>('/api/projects', { method: 'GET' });
}

export async function createProject(title: string, videoUrl?: string) {
    return request<ProjectData>('/api/project', {
        method: 'POST',
        body: JSON.stringify({ title, videoUrl }),
    });
}

// ─── 项目详情 ──────────────────────────────────────────
export interface ProjectDetail extends ProjectData {
    scenes: SceneData[];
    exports: Array<{
        id: string;
        project_id: string;
        video_url: string;
        created_at: string;
    }>;
}

export async function getProjectDetail(id: string) {
    return request<ProjectDetail>(`/api/project/${id}`, { method: 'GET' });
}

// ─── 任务状态 ──────────────────────────────────────────
export interface TaskStatusData {
    taskId: string;
    type: string;
    status: string;
    progress: number;
    result: Record<string, unknown> | null;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
}

export async function getTaskStatus(taskId: string) {
    return request<TaskStatusData>(`/api/task-status/${taskId}`, {
        method: 'GET',
    });
}

/**
 * 轮询任务状态直到完成或失败
 * @param taskId - 任务 ID
 * @param onProgress - 进度回调（可选）
 * @param intervalMs - 轮询间隔（毫秒，默认 2000）
 * @returns 最终任务数据
 */
export async function pollTaskStatus(
    taskId: string,
    onProgress?: (task: TaskStatusData) => void,
    intervalMs = 2000
): Promise<TaskStatusData> {
    return new Promise((resolve, reject) => {
        const timer = setInterval(async () => {
            try {
                const res = await getTaskStatus(taskId);
                const task = res.data!;

                if (onProgress) onProgress(task);

                if (task.status === 'completed') {
                    clearInterval(timer);
                    resolve(task);
                } else if (task.status === 'failed') {
                    clearInterval(timer);
                    reject(new Error(task.errorMessage || '任务处理失败'));
                }
            } catch (err) {
                clearInterval(timer);
                reject(err);
            }
        }, intervalMs);
    });
}
