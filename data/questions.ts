import { Question } from '@/lib/types';

let _cache: Question[] | null = null;

/** 获取所有题目（带内存缓存） */
export async function fetchQuestions(): Promise<Question[]> {
  if (_cache) return _cache;
  const res = await fetch('/api/questions');
  if (!res.ok) throw new Error('Failed to fetch questions');
  _cache = await res.json();
  return _cache!;
}

/** 清空缓存（管理后台刷新时用） */
export function clearQuestionsCache() {
  _cache = null;
}

/** 按章节获取题目 */
export async function fetchQuestionsByChapter(chapterId: string): Promise<Question[]> {
  const res = await fetch(`/api/questions?chapter=${encodeURIComponent(chapterId)}`);
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
}

/** 按分类获取题目 */
export async function fetchQuestionsByCategory(categoryId: string): Promise<Question[]> {
  const res = await fetch(`/api/questions?category=${encodeURIComponent(categoryId)}`);
  if (!res.ok) throw new Error('Failed to fetch questions');
  return res.json();
}

/** 同步版本 — 兼容旧代码，从缓存读取 */
export function getQuestionsByChapter(chapterId: string): Question[] {
  if (!_cache) return [];
  return _cache.filter((q) => q.chapter === chapterId);
}

/** 获取题目总数（从缓存） */
export function getQuestionCount(): number {
  return _cache?.length || 0;
}
