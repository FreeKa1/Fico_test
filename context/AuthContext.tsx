'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface UserData {
  password: string;
  phone: string;
  createdAt: string;
  lastLogin: string;
  totalLoginSeconds: number;
  banned: boolean;
}

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  phone: string | null;
  login: (username: string, password: string) => Promise<string | null>;
  register: (username: string, password: string, phone: string) => Promise<string | null>;
  updateProfile: (phone: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<string | null>;
  resetPassword: (username: string, phone: string, newPassword: string) => Promise<string | null>;
  deleteUser: (username: string) => Promise<void>;
  toggleBan: (username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false, username: null, phone: null,
  login: async () => null, register: async () => null, updateProfile: async () => {},
  changePassword: async () => null, resetPassword: async () => null,
  deleteUser: async () => {}, toggleBan: async () => {}, logout: () => {},
});

function getInitialAuth() {
  if (typeof window === 'undefined') return { isLoggedIn: false, username: null as string | null, phone: null as string | null };
  const stored = localStorage.getItem('auth_user');
  if (stored) {
    const phone = localStorage.getItem('auth_phone') || null;
    return { isLoggedIn: true, username: stored, phone };
  }
  return { isLoggedIn: false, username: null, phone: null };
}

async function api(url: string, options?: RequestInit) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  return res.json();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState(getInitialAuth);
  const router = useRouter();

  // Heartbeat: send 30s every 30s
  useEffect(() => {
    if (!auth.isLoggedIn || !auth.username) return;
    const interval = setInterval(() => {
      api(`/api/users/${auth.username}`, {
        method: 'PUT', body: JSON.stringify({ action: 'heartbeat', loginSeconds: 30 }),
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [auth.isLoggedIn, auth.username]);

  const login = async (username: string, password: string): Promise<string | null> => {
    const data = await api('/api/users', {
      method: 'POST', body: JSON.stringify({ action: 'login', username, password }),
    });
    if (data.error) return data.error;
    setAuth({ isLoggedIn: true, username: data.username, phone: data.phone || null });
    localStorage.setItem('auth_user', data.username);
    document.cookie = `auth_user=${data.username}; path=/; max-age=86400; SameSite=Lax`;
    if (data.phone) localStorage.setItem('auth_phone', data.phone);
    return null;
  };

  const register = async (username: string, password: string, phone: string): Promise<string | null> => {
    const data = await api('/api/users', {
      method: 'POST', body: JSON.stringify({ action: 'register', username, password, phone }),
    });
    if (data.error) return data.error;
    setAuth({ isLoggedIn: true, username: data.username, phone: data.phone || null });
    localStorage.setItem('auth_user', data.username);
    document.cookie = `auth_user=${data.username}; path=/; max-age=86400; SameSite=Lax`;
    if (data.phone) localStorage.setItem('auth_phone', data.phone);
    return null;
  };

  const updateProfile = async (phone: string) => {
    if (!auth.username) return;
    await api(`/api/users/${auth.username}`, {
      method: 'PUT', body: JSON.stringify({ action: 'update-phone', phone }),
    });
    setAuth({ ...auth, phone });
    localStorage.setItem('auth_phone', phone);
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<string | null> => {
    if (!auth.username) return '未登录';
    const data = await api(`/api/users/${auth.username}`, {
      method: 'PUT', body: JSON.stringify({ action: 'change-password', oldPassword, newPassword }),
    });
    return data.error || null;
  };

  const resetPassword = async (username: string, phone: string, newPassword: string): Promise<string | null> => {
    const data = await api('/api/users', {
      method: 'POST', body: JSON.stringify({ action: 'reset-password', username, password: newPassword, phone }),
    });
    return data.error || null;
  };

  const deleteUser = async (username: string) => {
    await api(`/api/users/${username}`, { method: 'DELETE' });
  };

  const toggleBan = async (username: string) => {
    await api(`/api/users/${username}`, { method: 'PATCH' });
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, username: null, phone: null });
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_phone');
    document.cookie = 'auth_user=; path=/; max-age=0';
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, updateProfile, changePassword, resetPassword, deleteUser, toggleBan, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!isLoggedIn) router.replace('/login'); }, [isLoggedIn, router]);
  if (!isLoggedIn) return null;
  return <>{children}</>;
}
