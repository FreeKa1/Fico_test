'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { questions } from '@/data/questions';
import { UserData } from '@/context/AuthContext';

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<Record<string, UserData>>({});
  const [showPw, setShowPw] = useState<Record<string, boolean>>({});

  const loadUsers = useCallback(() => {
    try { setUsers(JSON.parse(localStorage.getItem('fico_users') || '{}')); } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('fico_admin') !== '1') { router.replace('/admin/login'); return; }
    loadUsers();
  }, [router, loadUsers]);

  const saveAndReload = (data: Record<string, UserData>) => {
    localStorage.setItem('fico_users', JSON.stringify(data));
    loadUsers();
  };

  const handleDelete = (name: string) => {
    if (!confirm(`确定删除用户「${name}」？此操作不可恢复。`)) return;
    const updated = { ...users };
    delete updated[name];
    saveAndReload(updated);
  };

  const handleToggleBan = (name: string) => {
    const updated = { ...users };
    if (updated[name]) {
      updated[name] = { ...updated[name], banned: !updated[name].banned };
      saveAndReload(updated);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fico_admin');
    router.replace('/admin/login');
  };

  const togglePw = (u: string) => setShowPw((p) => ({ ...p, [u]: !p[u] }));
  const userList = Object.entries(users);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-white">管理后台</h1>
            <p className="text-sm text-slate-400 mt-1">题库与用户管理</p>
          </div>
          <button onClick={handleLogout}
            className="px-4 py-2 text-sm rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors">退出登录</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <p className="text-sm text-slate-400 mb-1">题库总量</p>
            <p className="text-3xl font-bold text-white">{questions.length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <p className="text-sm text-slate-400 mb-1">注册用户</p>
            <p className="text-3xl font-bold text-white">{userList.length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <p className="text-sm text-slate-400 mb-1">已禁用</p>
            <p className="text-3xl font-bold text-red-400">{userList.filter(([, u]) => u.banned).length}</p>
          </div>
        </div>

        {/* User table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">用户列表</h2>
            <button onClick={loadUsers} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">刷新</button>
          </div>
          {userList.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500 text-center">暂无用户数据</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="text-left px-4 py-3 font-medium">用户名</th>
                    <th className="text-left px-4 py-3 font-medium">密码</th>
                    <th className="text-left px-4 py-3 font-medium">手机号</th>
                    <th className="text-left px-4 py-3 font-medium">注册时间</th>
                    <th className="text-left px-4 py-3 font-medium">最后登录</th>
                    <th className="text-left px-4 py-3 font-medium">在线时长</th>
                    <th className="text-left px-4 py-3 font-medium">状态</th>
                    <th className="text-right px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {userList.map(([name, info]) => (
                    <tr key={name} className={`border-b border-slate-700/50 ${info.banned ? 'bg-red-900/20' : ''}`}>
                      <td className="px-4 py-3 font-medium text-white">{name}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs">{showPw[name] ? info.password : '••••••'}</span>
                        <button onClick={() => togglePw(name)}
                          className="ml-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                          {showPw[name] ? '隐藏' : '查看'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{info.phone || '-'}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{info.createdAt ? new Date(info.createdAt).toLocaleString('zh-CN') : '-'}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{info.lastLogin ? new Date(info.lastLogin).toLocaleString('zh-CN') : '从未登录'}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs font-mono">
                        {(() => {
                          const sec = info.totalLoginSeconds || 0;
                          if (sec < 60) return `${sec}秒`;
                          if (sec < 3600) return `${Math.floor(sec / 60)}分钟`;
                          const h = Math.floor(sec / 3600);
                          const m = Math.floor((sec % 3600) / 60);
                          return `${h}小时${m}分`;
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        {info.banned ? (
                          <span className="text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full">已禁用</span>
                        ) : (
                          <span className="text-xs bg-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full">正常</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleToggleBan(name)}
                            className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                              info.banned
                                ? 'bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50'
                                : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                            }`}>
                            {info.banned ? '解禁' : '禁用'}
                          </button>
                          <button onClick={() => handleDelete(name)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-slate-700 text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors">
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-xs text-slate-600 mt-4 text-center">密码明文存储，后续可接入加密</p>
      </div>
    </div>
  );
}
