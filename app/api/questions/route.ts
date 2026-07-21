import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/questions
// ?chapter=ch01 — 按章节筛选
// ?category=asset — 按分类筛选
// 无参数返回全部
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chapter = searchParams.get('chapter');
    const category = searchParams.get('category');

    let sql = `SELECT id, type, category, chapter, stem, options, answers, explanation, material, source FROM questions`;
    const conditions: string[] = [];
    const params: Record<string, any> = {};

    if (chapter) {
      conditions.push(`chapter = @chapter`);
      params.chapter = chapter;
    }
    if (category) {
      conditions.push(`category = @category`);
      params.category = category;
    }
    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }
    sql += ` ORDER BY id`;

    const rows = await query(sql, params);
    const questions = rows.map((row: any) => ({
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

    // Clean undefined fields
    const cleaned = questions.map((q: any) => {
      const obj: any = {};
      for (const [k, v] of Object.entries(q)) {
        if (v !== undefined) obj[k] = v;
      }
      return obj;
    });

    return NextResponse.json(cleaned);
  } catch (e) {
    console.error('[API] GET /api/questions error:', e);
    return NextResponse.json({ error: '数据库不可用' }, { status: 500 });
  }
}
