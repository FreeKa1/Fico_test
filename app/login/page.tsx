'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Toast from '@/components/Toast';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { isLoggedIn, login, resetPassword } = useAuth();
  const router = useRouter();

  const [fpPhone, setFpPhone] = useState('');
  const [fpNewPw, setFpNewPw] = useState('');
  const [fpConfirmPw, setFpConfirmPw] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { if (isLoggedIn) router.replace('/'); }, [isLoggedIn, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setToast({ message: '请输入用户名和密码', type: 'error' }); return; }
    const err = await login(username.trim(), password);
    if (err) { setToast({ message: err, type: 'error' }); return; }
    setToast({ message: '登录成功！', type: 'success' });
    setTimeout(() => router.push('/'), 1500);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { setToast({ message: '请输入用户名', type: 'error' }); return; }
    if (!fpPhone.trim()) { setToast({ message: '请输入绑定的手机号', type: 'error' }); return; }
    if (!fpNewPw || fpNewPw.length < 4) { setToast({ message: '新密码至少4位', type: 'error' }); return; }
    if (fpNewPw !== fpConfirmPw) { setToast({ message: '两次输入的密码不一致', type: 'error' }); return; }
    const err = await resetPassword(username.trim(), fpPhone.trim(), fpNewPw);
    if (err) { setToast({ message: err, type: 'error' }); return; }
    setToast({ message: '密码重置成功！', type: 'success' });
    setPassword(fpNewPw); setFpPhone(''); setFpNewPw(''); setFpConfirmPw(''); setMode('login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800">初级会计实务</h1>
          <p className="text-sm text-slate-500 mt-1">{mode === 'login' ? '在线分录练习平台' : '找回密码'}</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">用户名</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名" autoComplete="username"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">密码</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码" autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
              </div>
              <button type="submit"
                className="w-full py-2.5 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-100">
                登录
              </button>
              <div className="flex items-center justify-between text-xs">
                <button type="button" onClick={() => { setMode('forgot'); setToast(null); }}
                  className="text-slate-400 hover:text-blue-600 transition-colors">忘记密码？</button>
                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">注册账号</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-xs text-slate-500">输入用户名和绑定的手机号即可重置密码</p>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">用户名</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">绑定手机号</label>
                <input type="tel" value={fpPhone} onChange={(e) => setFpPhone(e.target.value)}
                  placeholder="11位手机号"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">新密码</label>
                <input type="password" value={fpNewPw} onChange={(e) => setFpNewPw(e.target.value)}
                  placeholder="至少4位"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">确认新密码</label>
                <input type="password" value={fpConfirmPw} onChange={(e) => setFpConfirmPw(e.target.value)}
                  placeholder="再次输入新密码"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all" />
              </div>
              <button type="submit"
                className="w-full py-2.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors border border-amber-100">
                重置密码
              </button>
              <button type="button" onClick={() => { setMode('login'); setToast(null); }}
                className="w-full text-xs text-slate-400 hover:text-blue-600 transition-colors">
                ← 返回登录
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
