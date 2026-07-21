'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QuestionCard from '@/components/QuestionCard';
import { getChapterById } from '@/data/chapters';
import { fetchQuestionsByChapter } from '@/data/questions';
import { UserAnswer } from '@/lib/types';
import { AuthGuard } from '@/context/AuthContext';
import type { Question } from '@/lib/types';

export default function ChapterPage() {
  return (
    <AuthGuard>
      <ChapterContent />
    </AuthGuard>
  );
}

function ChapterContent() {
  const params = useParams();
  const chapterId = params.id as string;
  const chapter = getChapterById(chapterId);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestionsByChapter(chapterId).then((q) => { setQuestions(q); setLoading(false); }).catch(() => setLoading(false));
  }, [chapterId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const hasAnsweredCurrent = currentQuestion && userAnswers[currentQuestion.id]?.selected.length > 0;

  const handleAnswerChange = useCallback((questionId: string, selected: string[]) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, selected },
    }));
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-slate-400">加载中...</p></div>;
  }

  if (!chapter || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">该章节暂无题目</p>
          <Link href="/" className="text-blue-600 hover:underline text-sm">返回章节列表</Link>
        </div>
      </div>
    );
  }

  const answeredCount = Object.values(userAnswers).filter((a) => a.selected.length > 0).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
            ← 章节列表
          </Link>
          <div className="text-sm text-slate-600 font-medium">{chapter.name}</div>
          <span className="text-xs text-slate-400">
            已答 {answeredCount}/{questions.length}
          </span>
        </div>

        {/* Question card */}
        <QuestionCard
          question={currentQuestion}
          index={currentIndex}
          total={questions.length}
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
                onClick={() => {
                  setIsSubmitted(true);
                  setShowExplanation(true);
                  setCurrentIndex(0);
                }}
                className="px-6 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm shadow-blue-200"
              >
                提交
              </button>
            )}

            {isSubmitted && (
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setShowExplanation(false);
                }}
                className="px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition-all"
              >
                返回修改
              </button>
            )}
          </div>

          <button
            onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
            disabled={currentIndex === questions.length - 1}
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            下一题
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
