'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QuestionCard from '@/components/QuestionCard';
import { getCategoryById, getQuestionsByCategory } from '@/data/categories';
import { UserAnswer, Category } from '@/lib/types';
import { AuthGuard } from '@/context/AuthContext';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function CategoryPage() {
  return <AuthGuard><CategoryContent /></AuthGuard>;
}

function CategoryContent() {
  const params = useParams();
  const categoryId = params.id as Category;
  const category = getCategoryById(categoryId);
  const allQuestions = useMemo(() => getQuestionsByCategory(categoryId), [categoryId]);
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const c = parseInt(sp.get('count') || '0');
    if (c > 0) setCount(Math.min(c, allQuestions.length));
    setReady(true);
  }, [allQuestions.length]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = useMemo(
    () => (count > 0 ? shuffle(allQuestions).slice(0, count) : []),
    [count, allQuestions]
  );

  const handleAnswerChange = useCallback((questionId: string, selected: string[]) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: { questionId, selected } }));
  }, []);

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-400">加载中...</p></div>;
  }

  if (count <= 0 || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">练习参数无效，请从首页重新进入</p>
          <Link href="/" className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 transition-all">← 返回首页</Link>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.values(userAnswers).filter((a) => a.selected.length > 0).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <Link href="/"
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          返回
        </Link>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
          categoryId === 'asset' ? 'bg-emerald-50 text-emerald-600' :
          categoryId === 'liability' ? 'bg-blue-50 text-blue-600' :
          categoryId === 'pl' ? 'bg-orange-50 text-orange-600' :
          'bg-purple-50 text-purple-600'
        }`}>{category?.name}</span>
        <span className="text-xs text-slate-400">已答 {answeredCount}/{questions.length}</span>
      </div>

      <QuestionCard question={currentQuestion} index={currentIndex} total={questions.length}
        userAnswer={userAnswers[currentQuestion.id]} showExplanation={showExplanation}
        isSubmitted={isSubmitted} onAnswerChange={handleAnswerChange} />

      <div className="flex items-center justify-between mt-4 gap-1.5">
        <button onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}
          className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          <span className="hidden sm:inline">上一题</span>
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={() => setShowExplanation((v) => !v)}
            className={`inline-flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
              showExplanation
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-amber-100 bg-white text-amber-600 hover:bg-amber-50'
            }`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            <span className="hidden sm:inline">{showExplanation ? '隐藏解析' : '解析'}</span>
          </button>
          {!isSubmitted ? (
            <button onClick={() => { setIsSubmitted(true); setShowExplanation(true); setCurrentIndex(0); }}
              className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              <span className="hidden sm:inline">提交</span>
            </button>
          ) : (
            <button onClick={() => { setIsSubmitted(false); setShowExplanation(false); }}
              className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-700 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            <span className="hidden sm:inline">修改</span>
          </button>
          )}
        </div>
        <button onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))} disabled={currentIndex === questions.length - 1}
          className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <span className="hidden sm:inline">下一题</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
      <div className="mt-4 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} /></div>
    </div>
  );
}
