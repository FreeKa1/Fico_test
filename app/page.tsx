'use client';

import { useState } from 'react';
import { AuthGuard } from '@/context/AuthContext';
import { categories } from '@/data/categories';
import CountSelector from '@/components/CountSelector';

const CatIcon = ({ id }: { id: string }) => {
  const cls = "w-6 h-6";
  switch (id) {
    case 'asset':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    case 'liability':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    case 'pl':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
    case 'other':
      return <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 8h8M8 12h8M8 16h5" /></svg>;
  }
};

const CAT_BG: Record<string, string> = {
  asset: 'bg-emerald-100 text-emerald-600',
  liability: 'bg-blue-100 text-blue-600',
  pl: 'bg-orange-100 text-orange-600',
  other: 'bg-purple-100 text-purple-600',
};

export default function HomePage() {
  return <AuthGuard><HomeContent /></AuthGuard>;
}

function HomeContent() {
  const [modal, setModal] = useState<{ title: string; subtitle: string; icon: React.ReactNode; iconBg: string; href: string } | null>(null);

  const openRandom = () => setModal({
    title: '随机刷题', subtitle: '从题库随机抽题，综合练习',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    iconBg: 'bg-slate-100 text-slate-500',
    href: '/random',
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {modal && <CountSelector open={!!modal} onClose={() => setModal(null)} {...modal} />}

      <h1 className="text-xl font-bold text-slate-800 mb-1">初级会计实务</h1>
      <p className="text-sm text-slate-500 mb-8">在线分录练习平台</p>

      {/* Random */}
      <button onClick={openRandom}
        className="w-full text-left flex items-center justify-between bg-white border border-slate-200 rounded-xl p-5 mb-4 hover:border-blue-300 hover:shadow-md transition-all group">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">随机刷题</h2>
            <p className="text-sm text-slate-500">从题库随机抽题，综合练习</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat) => {
          return (
            <button key={cat.id} onClick={() => setModal({
              title: cat.name, subtitle: cat.description,
              icon: <CatIcon id={cat.id} />,
              iconBg: CAT_BG[cat.id],
              href: `/category/${cat.id}`,
            })}
              className="text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all group">
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${CAT_BG[cat.id]}`}>
                  <CatIcon id={cat.id} />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
