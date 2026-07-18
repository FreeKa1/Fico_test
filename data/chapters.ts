import { Chapter } from '@/lib/types';

export const chapters: Chapter[] = [
  { id: 'ch01', name: '第一章 概述', description: '会计概念、职能、目标、基本假设、会计信息质量要求' },
  { id: 'ch02', name: '第二章 会计基础', description: '会计要素、会计科目、借贷记账法、会计凭证与账簿' },
  { id: 'ch03', name: '第三章 流动资产', description: '货币资金、应收及预付款项、交易性金融资产、存货' },
  { id: 'ch04', name: '第四章 非流动资产', description: '固定资产、无形资产、长期股权投资、投资性房地产' },
  { id: 'ch05', name: '第五章 负债', description: '短期借款、应付及预收款项、应付职工薪酬、应交税费' },
  { id: 'ch06', name: '第六章 所有者权益', description: '实收资本、资本公积、留存收益' },
  { id: 'ch07', name: '第七章 收入、费用和利润', description: '收入的确认与计量、费用、利润的构成与核算' },
  { id: 'ch08', name: '第八章 财务报告', description: '资产负债表、利润表、现金流量表、所有者权益变动表' },
];

export function getChapterById(id: string): Chapter | undefined {
  return chapters.find(ch => ch.id === id);
}
