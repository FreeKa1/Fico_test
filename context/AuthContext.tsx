'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  username: null,
  login: () => false,
  logout: () => {},
});

const VALID_USERS: Record<string, string> = {
  user: 'user123',
  admin: 'admin123',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      setIsLoggedIn(true);
      setUsername(stored);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    if (VALID_USERS[username] === password) {
      setIsLoggedIn(true);
      setUsername(username);
      localStorage.setItem('auth_user', username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400">加载中...</div>
      </div>
    );
  }

  return <>{children}</>;
}
