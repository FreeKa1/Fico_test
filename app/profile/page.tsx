'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthGuard, useAuth } from '@/context/AuthContext';
import Toast from '@/components/Toast';

export default function ProfilePage() {
  return <AuthGuard><ProfileContent /></AuthGuard>;
}

function ProfileContent() {
  const { username, phone, updateProfile, changePassword } = useAuth();
  const [newPhone, setNewPhone] = useState(phone || '');
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSavePhone = () => {
    if (!/^1[3-9]\d{9}$/.test(newPhone.trim())) {
      setToast({ message: '请输入正确的11位手机号', type: 'error' }); return;
    }
    updateProfile(newPhone.trim());
    setToast({ message: '手机号已更新', type: 'success' });
  };

  const handleChangePw = () => {
    if (newPw !== confirmPw) {
      setToast({ message: '两次输入的新密码不一致', type: 'error' }); return;
    }
    const err = changePassword(oldPw, newPw);
    if (err) { setToast({ message: err, type: 'error' }); return; }
    setOldPw(''); setNewPw(''); setConfirmPw('');
    setToast({ message: '密码修改成功', type: 'success' });
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-slate-800">个人中心</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">← 返回首页</Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 mb-4">
        <h2 className="text-sm font-semibold text-slate-700">手机号</h2>
        <div className="text-sm text-slate-500">用户名：{username}</div>
        <input type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
          placeholder="请输入11位手机号"
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        <button onClick={handleSavePhone}
          className="px-4 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm font-medium border border-slate-200 hover:bg-slate-100 transition-colors">保存手机号</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">修改密码</h2>
        <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)}
          placeholder="原密码"
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
          placeholder="新密码（至少4位）"
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
          placeholder="确认新密码"
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        <button onClick={handleChangePw}
          className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors">修改密码</button>
      </div>
    </div>
  );
}
