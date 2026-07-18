// 题目类型
export type QuestionType = 'single' | 'multi' | 'truefalse' | 'indefinite';

// 选项
export interface Option {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

// 基础题目
export interface Question {
  id: string;
  type: QuestionType;
  chapter: string;
  stem: string;
  options: Option[];
  answers: string[];       // 单选/判断只有1个，多选/不定项有多个
  explanation: string;
  material?: string;       // 不定项选择题的案例材料
}

// 章节定义
export interface Chapter {
  id: string;
  name: string;
  description: string;
}

// 用户答题记录
export interface UserAnswer {
  questionId: string;
  selected: string[];
}
