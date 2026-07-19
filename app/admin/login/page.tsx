'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

const ADMIN_ACCOUNT = { username: 'admin', password: 'admin123' };

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() !== ADMIN_ACCOUNT.username || password !== ADMIN_ACCOUNT.password) {
      setToast({ message: '账号或密码错误', type: 'error' }); return;
    }
    localStorage.setItem('fico_admin', '1');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-700 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">管理后台</h1>
          <p className="text-sm text-slate-400 mt-1">初级会计实务练习平台</p>
        </div>
        <form onSubmit={handleLogin} className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">管理员账号</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="admin" autoComplete="off"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder-slate-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">密码</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="off"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder-slate-600" />
          </div>
          <button type="submit"
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
            登录管理后台
          </button>
        </form>
      </div>
    </div>
  );
}
