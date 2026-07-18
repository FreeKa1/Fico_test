'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function NavBar() {
  const { isLoggedIn, username, logout } = useAuth();
  const pathname = usePathname();

  if (pathname === '/login' || !isLoggedIn) return null;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/" className="text-base font-bold text-slate-800 hover:text-blue-600 transition-colors">
            初级会计实务
          </Link>
          <Link
            href="/"
            className={`text-sm transition-colors ${
              pathname === '/' ? 'text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            章节练习
          </Link>
          <Link
            href="/random"
            className={`text-sm transition-colors ${
              pathname === '/random' ? 'text-blue-600 font-medium' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            随机刷题
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{username}</span>
          <button
            onClick={logout}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            退出
          </button>
        </div>
      </div>
    </nav>
  );
}
