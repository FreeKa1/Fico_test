import Link from 'next/link';
import ChapterList from '@/components/ChapterList';
import { AuthGuard } from '@/context/AuthContext';
import { questions } from '@/data/questions';

export default function HomePage() {
  return (
    <AuthGuard>
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Random mode card */}
        <Link
          href="/random"
          className="block bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 mb-8 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md shadow-blue-200 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">🎯 随机刷题</h2>
              <p className="text-blue-100 text-sm mt-0.5">从题库随机抽取 20 题，不分章节</p>
            </div>
            <div className="text-2xl">→</div>
          </div>
        </Link>

        {/* Chapter list */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-1">📚 章节练习</h2>
          <p className="text-sm text-slate-500">共 {questions.length} 题，选择章节开始练习</p>
        </div>
        <ChapterList />
      </div>
    </AuthGuard>
  );
}
