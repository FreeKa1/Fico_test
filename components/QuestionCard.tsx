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
  indefinite: '不定项选择',
};

export default function QuestionCard({
  question,
  index,
  total,
  userAnswer,
  showExplanation,
  isSubmitted,
  onAnswerChange,
}: Props) {
  const selected = userAnswer?.selected || [];
  const isMulti = question.type === 'multi' || question.type === 'indefinite';

  const handleSelect = (label: string) => {
    if (isSubmitted) return;
    if (question.type === 'single') {
      onAnswerChange(question.id, [label]);
    } else {
      if (selected.includes(label)) {
        onAnswerChange(question.id, selected.filter((s) => s !== label));
      } else {
        onAnswerChange(question.id, [...selected, label]);
      }
    }
  };

  const isCorrect = () => {
    if (!isSubmitted || !userAnswer) return null;
    const correct = [...question.answers].sort().join(',');
    const user = [...userAnswer.selected].sort().join(',');
    return correct === user;
  };

  const correct = isCorrect();

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
        <span className="text-sm font-medium text-slate-600">
          第 {index + 1}/{total} 题
        </span>
        <span className="text-xs font-medium bg-white border border-slate-200 text-slate-500 px-2.5 py-0.5 rounded-full">
          {TYPE_LABELS[question.type]}
        </span>
      </div>

      <div className="p-6">
        {/* Material */}
        {question.material && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-5 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">材料</span>
            <p className="mt-1">{question.material}</p>
          </div>
        )}

        {/* Stem */}
        <p className="text-slate-800 text-base leading-relaxed mb-6">{question.stem}</p>

        {/* Options */}
        <div className="space-y-2">
          {question.options.map((opt) => {
            const isSelected = selected.includes(opt.label);
            let optClass = 'flex items-start gap-3.5 p-3.5 rounded-lg border transition-all duration-150 ';

            if (isSubmitted) {
              const isCorrectOpt = question.answers.includes(opt.label);
              if (isCorrectOpt) {
                optClass += 'bg-emerald-50 border-emerald-300 ';
              } else if (isSelected && !isCorrectOpt) {
                optClass += 'bg-red-50 border-red-300 ';
              } else {
                optClass += 'border-slate-200 opacity-50 ';
              }
            } else if (isSelected) {
              optClass += 'bg-blue-50 border-blue-400 cursor-pointer ';
            } else {
              optClass += 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer ';
            }

            return (
              <div
                key={opt.label}
                className={optClass}
                onClick={() => handleSelect(opt.label)}
              >
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-semibold shrink-0 transition-all ${
                    isSelected && !isSubmitted
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isSubmitted && question.answers.includes(opt.label)
                      ? 'bg-emerald-500 text-white'
                      : isSubmitted && isSelected && !question.answers.includes(opt.label)
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {opt.label}
                </span>
                <span className="text-slate-700 leading-relaxed pt-0.5">{opt.text}</span>
              </div>
            );
          })}
        </div>

        {/* Result after submit */}
        {isSubmitted && (
          <div
            className={`mt-5 p-4 rounded-lg text-sm font-medium ${
              correct
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {correct
              ? '✓ 回答正确'
              : `✗ 回答错误，正确答案：${question.answers.join('、')}`}
          </div>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className="mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1.5">📖 答案解析</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{question.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
