import { Question } from '@/lib/types';
import questionsData from '@/data/questions.json';

export const questions: Question[] = questionsData as Question[];

export function getQuestionsByChapter(chapterId: string): Question[] {
  return questions.filter((q) => q.chapter === chapterId);
}

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}
