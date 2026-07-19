'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface UserInfo {
  username: string;
  phone: string;
  createdAt: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  phone: string | null;
  login: (username: string, password: string) => string | null;
  register: (username: string, password: string, phone: string) => string | null;
  updateProfile: (phone: string) => void;
  changePassword: (oldPassword: string, newPassword: string) => string | null;
  resetPassword: (username: string, phone: string, newPassword: string) => string | null;
  logout: () => void;
  getUsers: () => Record<string, UserData>;
  deleteUser: (username: string) => void;
  toggleBan: (username: string) => void;
}

export interface UserData {
  password: string;
  phone: string;
  createdAt: string;
  lastLogin: string;
  totalLoginSeconds: number;
  banned: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false, username: null, phone: null,
  login: () => null, register: () => null, updateProfile: () => {}, changePassword: () => null, resetPassword: () => null, logout: () => {},
  getUsers: () => ({}), deleteUser: () => {}, toggleBan: () => {},
});

const USERS_KEY = 'fico_users';
const CURRENT_USER_KEY = 'auth_user';
const CURRENT_PHONE_KEY = 'auth_phone';

function getUsers(): Record<string, UserData> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch { return {}; }
}

function saveUsers(users: Record<string, UserData>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Seed default admin if no users exist
function ensureAdmin() {
  const users = getUsers();
  if (Object.keys(users).length === 0) {
    users['admin'] = { password: 'admin123', phone: '', createdAt: new Date().toISOString(), lastLogin: '', totalLoginSeconds: 0, banned: false };
    saveUsers(users);
  }
}

function getInitialAuth() {
  if (typeof window === 'undefined') return { isLoggedIn: false, username: null as string | null, phone: null as string | null };
  ensureAdmin();
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (stored) {
    const users = getUsers();
    const user = users[stored];
    return { isLoggedIn: true, username: stored, phone: user?.phone || null };
  }
  return { isLoggedIn: false, username: null, phone: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState(getInitialAuth);
  const router = useRouter();

  // Heartbeat: accumulate login time every 30s
  useEffect(() => {
    if (!auth.isLoggedIn || !auth.username) return;
    const interval = setInterval(() => {
      const users = getUsers();
      if (users[auth.username!]) {
        users[auth.username!].totalLoginSeconds = (users[auth.username!].totalLoginSeconds || 0) + 30;
        saveUsers(users);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [auth.isLoggedIn, auth.username]);

  const login = (username: string, password: string): string | null => {
    const users = getUsers();
    const user = users[username];
    if (!user) return '用户不存在';
    if (user.banned) return '该账号已被禁用';
    if (user.password !== password) return '密码错误';
    user.lastLogin = new Date().toISOString();
    saveUsers(users);
    setAuth({ isLoggedIn: true, username, phone: user.phone || null });
    localStorage.setItem(CURRENT_USER_KEY, username);
    return null;
  };

  const register = (username: string, password: string, phone: string): string | null => {
    if (!username.trim()) return '用户名不能为空';
    if (username.length < 2 || username.length > 20) return '用户名需 2-20 个字符';
    if (!/^[a-zA-Z0-9_一-龥]+$/.test(username)) return '用户名只能包含中英文、数字、下划线';
    if (password.length < 4) return '密码至少 4 位';
    if (!/^1[3-9]\d{9}$/.test(phone)) return '请输入正确的 11 位手机号';

    const users = getUsers();
    if (users[username]) return '用户名已存在';
    const phoneUsed = Object.values(users).some((u: UserData) => u.phone === phone);
    if (phoneUsed) return '该手机号已被注册';

    users[username] = { password, phone, createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(), totalLoginSeconds: 0, banned: false };
    saveUsers(users);
    setAuth({ isLoggedIn: true, username, phone });
    localStorage.setItem(CURRENT_USER_KEY, username);
    return null; // success
  };

  const updateProfile = (phone: string) => {
    if (!auth.username) return;
    const users = getUsers();
    if (users[auth.username]) {
      users[auth.username].phone = phone;
      saveUsers(users);
      setAuth({ ...auth, phone });
    }
  };

  const changePassword = (oldPassword: string, newPassword: string): string | null => {
    if (!auth.username) return '未登录';
    const users = getUsers();
    const user = users[auth.username];
    if (!user) return '用户不存在';
    if (user.password !== oldPassword) return '原密码错误';
    if (newPassword.length < 4) return '新密码至少 4 位';
    if (oldPassword === newPassword) return '新密码不能与原密码相同';
    users[auth.username].password = newPassword;
    saveUsers(users);
    return null;
  };

  const resetPassword = (username: string, phone: string, newPassword: string): string | null => {
    const users = getUsers();
    const user = users[username];
    if (!user) return '用户不存在';
    if (!user.phone) return '该账号未绑定手机号，无法找回';
    if (user.phone !== phone) return '手机号不匹配';
    if (newPassword.length < 4) return '新密码至少 4 位';
    users[username].password = newPassword;
    saveUsers(users);
    return null;
  };

  const deleteUser = (username: string) => {
    const users = getUsers();
    delete users[username];
    saveUsers(users);
  };

  const toggleBan = (username: string) => {
    const users = getUsers();
    if (users[username]) {
      users[username].banned = !users[username].banned;
      saveUsers(users);
    }
  };

  const logout = () => {
    setAuth({ isLoggedIn: false, username: null, phone: null });
    localStorage.removeItem(CURRENT_USER_KEY);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, updateProfile, changePassword, resetPassword, deleteUser, toggleBan, logout, getUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) router.replace('/login');
  }, [isLoggedIn, router]);

  if (!isLoggedIn) return null;
  return <>{children}</>;
}
