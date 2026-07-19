'use client';

import { Question, UserAnswer } from '@/lib/types';

interface Props {
  question: Question;
  index: number;
  total: number;
  userAnswer: UserAnswer | undefined;
  showExplanation: boolean;
  isSubmitted: boolean;
  onAnswerChange: (questionId: string, selected: string[]) => void;
}

const TYPE_LABELS: Record<string, string> = {
  single: '单选题',
  multi: '多选题',
  indefinite: '不定项选择题',
};

export default function QuestionCard({
  question, index, total, userAnswer, showExplanation, isSubmitted, onAnswerChange,
}: Props) {
  const selected = userAnswer?.selected || [];

  const handleSelect = (label: string) => {
    if (isSubmitted) return;
    if (question.type === 'single') {
      onAnswerChange(question.id, [label]);
    } else {
      if (selected.includes(label)) onAnswerChange(question.id, selected.filter((s) => s !== label));
      else onAnswerChange(question.id, [...selected, label]);
    }
  };

  const isCorrect = () => {
    if (!isSubmitted || !userAnswer) return null;
    return [...question.answers].sort().join(',') === [...userAnswer.selected].sort().join(',');
  };
  const correct = isCorrect();

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="font-medium">{index + 1}</span>
          <span className="text-slate-300">/</span>
          <span>{total}</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          question.type === 'single' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
          question.type === 'multi' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
          'bg-purple-50 text-purple-600 border border-purple-100'
        }`}>
          {TYPE_LABELS[question.type]}
        </span>
      </div>

      <div className="p-5">
        {/* Material */}
        {question.material && (
          <div className="bg-amber-50/50 border border-amber-100 rounded-lg p-4 mb-5 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 mb-1.5">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              材料
            </div>
            <p>{question.material}</p>
          </div>
        )}

        {/* Stem */}
        <p className="text-slate-800 leading-relaxed mb-6">{question.stem}</p>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isSelected = selected.includes(opt.label);
            let optClass = 'flex items-start gap-3 p-3 rounded-lg border transition-all duration-150 ';
            let badgeClass = 'inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-semibold shrink-0 transition-all ';

            if (isSubmitted) {
              const isCorrectOpt = question.answers.includes(opt.label);
              if (isCorrectOpt) {
                optClass += 'bg-emerald-50/50 border-emerald-200 ';
                badgeClass += 'bg-emerald-500 text-white';
              } else if (isSelected && !isCorrectOpt) {
                optClass += 'bg-red-50/50 border-red-200 ';
                badgeClass += 'bg-red-500 text-white';
              } else {
                optClass += 'border-slate-100 opacity-50 ';
                badgeClass += 'bg-slate-100 text-slate-400';
              }
            } else if (isSelected) {
              optClass += 'bg-blue-50/50 border-blue-300 cursor-pointer ';
              badgeClass += 'bg-blue-600 text-white';
            } else {
              optClass += 'border-slate-150 hover:border-slate-250 hover:bg-slate-50/50 cursor-pointer ';
              badgeClass += 'bg-slate-100 text-slate-500';
            }

            return (
              <div key={opt.label} className={optClass} onClick={() => handleSelect(opt.label)}>
                <span className={badgeClass}>{opt.label}</span>
                <span className="text-slate-700 leading-relaxed pt-0.5">{opt.text}</span>
              </div>
            );
          })}
        </div>

        {/* Result */}
        {isSubmitted && (
          <div className={`mt-5 p-4 rounded-lg text-sm font-medium flex items-center gap-2 ${
            correct ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {correct ? (
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
            {correct ? '回答正确' : `回答错误，正确答案：${question.answers.join('、')}`}
          </div>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-4 bg-amber-50/50 border border-amber-100 rounded-lg p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              答案解析
            </div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
