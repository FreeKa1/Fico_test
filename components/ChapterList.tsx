'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { chapters } from '@/data/chapters';

export default function ChapterList() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch('/api/questions')
      .then((r) => r.json())
      .then((questions: any[]) => {
        const c: Record<string, number> = {};
        questions.forEach((q: any) => {
          c[q.chapter] = (c[q.chapter] || 0) + 1;
        });
        setCounts(c);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="grid gap-3">
      {chapters.map((ch) => {
        const count = counts[ch.id] || 0;
        return (
          <Link
            key={ch.id}
            href={`/chapter/${ch.id}`}
            className="group block bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                {ch.name}
              </h2>
              <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full">
                {count} 题
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">{ch.description}</p>
          </Link>
        );
      })}
    </div>
  );
}
