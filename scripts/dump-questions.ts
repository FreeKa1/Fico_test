/**
 * 预构建脚本：从 SQL Server 导出题库到 data/questions.json
 * 用法：npx tsx scripts/dump-questions.ts
 * 如果 DB 不可用，保留现有 questions.json 不变
 */

import { getPool, sql } from '../lib/db';
import fs from 'fs';
import path from 'path';

async function main() {
  const pool = await getPool();
  if (!pool) {
    console.warn('[dump-questions] DB 不可用，保留现有 questions.json');
    process.exit(0);
  }

  const questionsPath = path.join(process.cwd(), 'data', 'questions.json');

  try {
    const result = await pool.request().query(`
      SELECT id, type, category, chapter, stem, options, answers, explanation, material, source
      FROM questions ORDER BY id
    `);

    if (result.recordset.length === 0) {
      console.log('[dump-questions] 题库表为空，跳过');
      process.exit(0);
    }

    const questions = result.recordset.map((row: any) => ({
      id: row.id,
      type: row.type,
      chapter: row.chapter,
      stem: row.stem,
      options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers,
      explanation: row.explanation,
      category: row.category,
      material: row.material || undefined,
      source: row.source || undefined,
    }));

    // 去掉 undefined 字段
    const cleaned = questions.map((q: any) => {
      const obj: any = {};
      for (const [k, v] of Object.entries(q)) {
        if (v !== undefined) obj[k] = v;
      }
      return obj;
    });

    fs.mkdirSync(path.dirname(questionsPath), { recursive: true });
    fs.writeFileSync(questionsPath, JSON.stringify(cleaned, null, 2), 'utf-8');
    console.log(`[dump-questions] ✅ 已导出 ${cleaned.length} 道题到 data/questions.json`);
  } catch (e) {
    console.error('[dump-questions] 导出失败:', (e as Error).message);
    console.log('[dump-questions] 保留现有 questions.json');
  }

  process.exit(0);
}

main();
