import { Category } from '@/lib/types';

export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const categories: CategoryInfo[] = [
  {
    id: 'asset',
    name: '资产类',
    description: '货币资金、应收款项、存货、固定资产、无形资产、投资性房地产',
    icon: '',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    id: 'liability',
    name: '负债类',
    description: '短期/长期借款、应付账款、应付票据、应付职工薪酬、应交税费',
    icon: '',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 'pl',
    name: '损益类',
    description: '收入确认、成本结转、期间费用、利润形成与分配',
    icon: '',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    id: 'other',
    name: '其他',
    description: '所有者权益、财务报告、会计基础概念',
    icon: '',
    color: 'bg-purple-100 text-purple-600',
  },
];

export function getCategoryById(id: Category): CategoryInfo | undefined {
  return categories.find((c) => c.id === id);
}
