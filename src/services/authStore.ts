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
             * 登录操作
             * Supabase 已配置时使用真实认证，否则降级为模拟模式
             */
            login: async (phone: string, password: string) => {
                set({ isLoading: true });

                try {
                        // 特色：内置测试账号判断
                        if (phone === 'admin' && password === 'admin888') {
                            await new Promise((resolve) => setTimeout(resolve, 500));
                            set({
                                user: {
                                    id: '00000000-0000-0000-0000-000000000000',
                                    phone: 'admin',
                                    name: '测试管理员',
                                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin&backgroundColor=ffdfbf',
                                },
                                token: 'mock-jwt-token-admin',
                                isAuthenticated: true,
                                isLoading: false,
                            });
                            return;
                        }

                    if (isSupabaseConfigured && supabase) {
                        // 真实 Supabase Auth 登录（使用邮箱模式，phone 作为邮箱）
                        const email = phone.includes('@') ? phone : `${phone}@clipmind.app`;
                        const { data, error } = await supabase.auth.signInWithPassword({
                            email,
                            password,
                        });

                        if (error) throw new Error(error.message);

                        const supaUser = data.user;
                        const session = data.session;

                        set({
                            user: {
                                id: supaUser.id,
                                phone,
                                name: supaUser.user_metadata?.name || '用户',
                                avatar: supaUser.user_metadata?.avatar_url ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${supaUser.id}&backgroundColor=ffdfbf`,
                            },
                            token: session?.access_token || null,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    } else {
                        // 降级：模拟登录（未配置 Supabase 时使用）
                        await new Promise((resolve) => setTimeout(resolve, 800));

                        const mockUser: User = {
                            id: 'user-' + Date.now(),
                            phone,
                            name: '陈小明',
                            avatar:
                                'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=ffdfbf',
                        };
                        const mockToken = 'mock-jwt-token-' + Date.now();

                        set({
                            user: mockUser,
                            token: mockToken,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    }
                } catch (err) {
                    set({ isLoading: false });
                    throw err;
                }
            },

            /**
             * 注册操作
             * Supabase 已配置时使用真实注册，否则降级为模拟模式
             */
            register: async (phone: string, password: string) => {
                set({ isLoading: true });

                try {
                    if (isSupabaseConfigured && supabase) {
                        // 真实 Supabase Auth 注册
                        const email = phone.includes('@') ? phone : `${phone}@clipmind.app`;
                        const { data, error } = await supabase.auth.signUp({
                            email,
                            password,
                            options: {
                                data: {
                                    name: '新用户',
                                    phone,
                                },
                            },
                        });

                        if (error) throw new Error(error.message);

                        const supaUser = data.user;
                        const session = data.session;

                        set({
                            user: {
                                id: supaUser?.id || '',
                                phone,
                                name: '新用户',
                                avatar:
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${supaUser?.id || 'new'}&backgroundColor=b6e3f4`,
                            },
                            token: session?.access_token || null,
                            isAuthenticated: !!session,
                            isLoading: false,
                        });
                    } else {
                        // 降级：模拟注册
                        await new Promise((resolve) => setTimeout(resolve, 800));

                        const mockUser: User = {
                            id: 'user-' + Date.now(),
                            phone,
                            name: '新用户',
                            avatar:
                                'https://api.dicebear.com/7.x/avataaars/svg?seed=NewUser&backgroundColor=b6e3f4',
                        };
                        const mockToken = 'mock-jwt-token-' + Date.now();

                        set({
                            user: mockUser,
                            token: mockToken,
                            isAuthenticated: true,
                            isLoading: false,
                        });
                    }
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

                supabase.auth.onAuthStateChange((event, session) => {
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
                        set({
                            user: null,
                            token: null,
                            isAuthenticated: false,
                        });
                    } else if (event === 'TOKEN_REFRESHED' && session) {
                        // Token 自动刷新时更新本地缓存
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
