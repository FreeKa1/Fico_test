'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import QuestionCard from '@/components/QuestionCard';
import { questions } from '@/data/questions';
import { UserAnswer, Question } from '@/lib/types';
import { AuthGuard } from '@/context/AuthContext';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RandomPage() {
  return (
    <AuthGuard>
      <RandomContent />
    </AuthGuard>
  );
}

function RandomContent() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Shuffle and pick 20 — stable across re-renders until refresh
  const selected = useMemo(() => shuffle(questions).slice(0, 20), []);

  const currentQuestion = selected[currentIndex];

  const handleAnswerChange = useCallback((questionId: string, selected: string[]) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: { questionId, selected } }));
  }, []);

  const handleReroll = () => {
    window.location.reload();
  };

  const answeredCount = Object.values(userAnswers).filter((a) => a.selected.length > 0).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
          ← 返回首页
        </Link>
        <div className="text-sm text-slate-600 font-medium">
          随机刷题 · 20 题
        </div>
        <button
          onClick={handleReroll}
          className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
        >
          🔄 换一批
        </button>
      </div>

      <QuestionCard
        question={currentQuestion}
        index={currentIndex}
        total={20}
        userAnswer={userAnswers[currentQuestion.id]}
        showExplanation={showExplanation}
        isSubmitted={isSubmitted}
        onAnswerChange={handleAnswerChange}
      />

      {/* Bottom buttons */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          上一题
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowExplanation((v) => !v)}
            className={`px-5 py-2.5 text-sm font-medium rounded-lg border transition-all ${
              showExplanation
                ? 'border-amber-300 bg-amber-50 text-amber-700'
                : 'border-amber-200 bg-white text-amber-600 hover:bg-amber-50'
            }`}
          >
            {showExplanation ? '隐藏解析' : '答案解析'}
          </button>

          {!isSubmitted && (
            <button
              onClick={() => { setIsSubmitted(true); setShowExplanation(true); setCurrentIndex(0); }}
              className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
            >
              提交
            </button>
          )}

          {isSubmitted && (
            <button
              onClick={() => { setIsSubmitted(false); setShowExplanation(false); }}
              className="px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-all"
            >
              返回修改
            </button>
          )}
        </div>

        <button
          onClick={() => setCurrentIndex((i) => Math.min(19, i + 1))}
          disabled={currentIndex === 19}
          className="px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          下一题
        </button>
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <span>已答 {answeredCount}/20</span>
        <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / 20) * 100}%` }}
          />
        </div>
        <span>{currentIndex + 1}/20</span>
      </div>
    </div>
  );
}
