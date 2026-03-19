/**
 * 认证状态管理（Zustand Store）
 * 管理用户登录状态、Token 持久化
 * 优先使用 Supabase Auth 进行认证，未配置时降级为模拟模式
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, isSupabaseConfigured } from './supabaseClient';

interface User {
    id: string;
    phone: string;
    name: string;
    avatar: string;
}

interface AuthState {
    // 状态
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // 操作
    login: (phone: string, password: string) => Promise<void>;
    register: (phone: string, password: string) => Promise<void>;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    initAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            /**
             * 登录操作：调用自定义后端 API
             */
            login: async (phone: string, password: string) => {
                set({ isLoading: true });

                try {
                    // 1. 调用自定义后端登录接口
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: phone, password }),
                    });

                    const res = await response.json();
                    if (!res.success) throw new Error(res.message || '登录失败');

                    const { user, token } = res.data;

                    set({
                        user: {
                            id: user.id,
                            phone: user.username,
                            name: user.name,
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}&backgroundColor=ffdfbf`,
                        },
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (err) {
                    set({ isLoading: false });
                    throw err;
                }
            },

            /**
             * 注册操作：调用自定义后端 API
             */
            register: async (phone: string, password: string) => {
                set({ isLoading: true });

                try {
                    // 1. 调用自定义后端注册接口
                    const response = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: phone, password }),
                    });

                    const res = await response.json();
                    if (!res.success) throw new Error(res.message || '注册失败');

                    const { user, token } = res.data;

                    set({
                        user: {
                            id: user.id,
                            phone: user.username,
                            name: user.name,
                            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}&backgroundColor=b6e3f4`,
                        },
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (err) {
                    set({ isLoading: false });
                    throw err;
                }
            },

            /** 退出登录 */
            logout: () => {
                // 如果 Supabase 已配置，同步登出
                if (isSupabaseConfigured && supabase) {
                    supabase.auth.signOut();
                }
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });
            },

            setLoading: (loading: boolean) => set({ isLoading: loading }),

            /**
             * 初始化认证状态监听
             * 在应用启动时调用，监听 Supabase Auth 状态变化
             */
            initAuth: () => {
                if (!isSupabaseConfigured || !supabase) return;

                console.log('[AUTH] 🚀 Initializing Auth listeners...');
                supabase.auth.onAuthStateChange((event, session) => {
                    console.log(`[AUTH] 🔔 Auth Event: ${event}`, session ? 'Session exists' : 'No session');
                    
                    if (event === 'SIGNED_IN' && session) {
                        const supaUser = session.user;
                        set({
                            user: {
                                id: supaUser.id,
                                phone: supaUser.user_metadata?.phone || supaUser.email || '',
                                name: supaUser.user_metadata?.name || '用户',
                                avatar: supaUser.user_metadata?.avatar_url ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${supaUser.id}&backgroundColor=ffdfbf`,
                            },
                            token: session.access_token,
                            isAuthenticated: true,
                        });
                    } else if (event === 'SIGNED_OUT') {
                        // 防御性检查：如果是内置管理员账号，忽略 Supabase 的 SIGNED_OUT 事件
                        // 因为管理员账号并不存在于真实的 Supabase Auth 中
                        const currentState = useAuthStore.getState();
                        if (currentState.user?.phone === 'admin') {
                            console.log('[AUTH] 🛡️ Ignoring SIGNED_OUT event for built-in admin.');
                            return;
                        }

                        set({
                            user: null,
                            token: null,
                            isAuthenticated: false,
                        });
                    } else if (event === 'TOKEN_REFRESHED' && session) {
                        set({ token: session.access_token });
                    }
                });
            },
        }),
        {
            name: 'clipmind-auth', // localStorage key
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
