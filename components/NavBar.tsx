'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCategoryById } from '@/data/categories';
import { Category } from '@/lib/types';

function Chevron() {
  return (
    <svg className="w-4 h-4 mx-1 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

type Crumb = { label: string; href?: string };

function getBreadcrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: '初级会计实务', href: '/' }];
  if (pathname === '/') return crumbs;
  if (pathname === '/random') { crumbs.push({ label: '随机刷题' }); return crumbs; }
  if (pathname === '/profile') { crumbs.push({ label: '个人中心' }); return crumbs; }
  if (pathname.startsWith('/category/')) {
    const id = pathname.split('/')[2] as Category;
    const cat = getCategoryById(id);
    crumbs.push({ label: '分类练习', href: '/' });
    if (cat) crumbs.push({ label: cat.name });
    return crumbs;
  }
  return crumbs;
}

export default function NavBar() {
  const { isLoggedIn, username, logout } = useAuth();
  const pathname = usePathname();
  if (!isLoggedIn || pathname.startsWith('/admin')) return null;

  const crumbs = getBreadcrumbs(pathname);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm min-w-0">
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center min-w-0">
              {i > 0 && <Chevron />}
              {crumb.href ? (
                <Link href={crumb.href} className="text-slate-400 hover:text-blue-600 transition-colors truncate">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-800 font-semibold truncate">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>

        {/* User area - prominent */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Link href="/profile"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {username}
          </Link>
          <button onClick={logout}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
            退出
          </button>
        </div>
      </div>
    </nav>
  );
}
