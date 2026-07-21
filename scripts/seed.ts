/**
 * 一次性脚本：建表 + 导入现有 questions.json 和 users.json 到 SQL Server
 * 用法: npx tsx scripts/seed.ts
 * 幂等：已存在的表和数据不会重复创建
 */

import { getPool, sql } from '../lib/db';
import fs from 'fs';
import path from 'path';

async function main() {
  const pool = await getPool();
  if (!pool) {
    console.error('❌ 无法连接数据库，请检查环境变量 DB_HOST/DB_USER/DB_PASS/DB_NAME');
    process.exit(1);
  }
  console.log('✅ 已连接到 SQL Server');

  // 1. 建表
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='questions' AND xtype='U')
    CREATE TABLE questions (
      id          VARCHAR(20)     NOT NULL PRIMARY KEY,
      type        VARCHAR(20)     NOT NULL,
      category    VARCHAR(20)     NOT NULL,
      chapter     VARCHAR(10)     NOT NULL,
      stem        NVARCHAR(MAX)   NOT NULL,
      options     NVARCHAR(MAX)   NOT NULL,
      answers     NVARCHAR(MAX)   NOT NULL,
      explanation NVARCHAR(MAX)   NOT NULL,
      material    NVARCHAR(MAX)   NULL,
      source      VARCHAR(20)     NULL
    );
  `);
  console.log('✅ 题库表已就绪');

  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
    CREATE TABLE users (
      username            VARCHAR(50)     NOT NULL PRIMARY KEY,
      password            VARCHAR(100)    NOT NULL,
      phone               VARCHAR(20)     NOT NULL DEFAULT '',
      created_at          DATETIME2       DEFAULT GETDATE(),
      last_login          DATETIME2       NULL,
      total_login_seconds INT             DEFAULT 0,
      banned              BIT             DEFAULT 0
    );
  `);
  console.log('✅ 用户表已就绪');

  // 2. 导入题库
  const questionsPath = path.join(process.cwd(), 'data', 'questions.json');
  if (fs.existsSync(questionsPath)) {
    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
    console.log(`📥 正在导入 ${questions.length} 道题目...`);

    let imported = 0;
    for (const q of questions) {
      // 幂等：先检查是否存在
      const exists = await pool.request()
        .input('id', sql.VarChar, q.id)
        .query(`SELECT id FROM questions WHERE id = @id`);
      if (exists.recordset.length > 0) continue;

      await pool.request()
        .input('id', sql.VarChar, q.id)
        .input('type', sql.VarChar, q.type)
        .input('category', sql.VarChar, q.category)
        .input('chapter', sql.VarChar, q.chapter)
        .input('stem', sql.NVarChar, q.stem)
        .input('options', sql.NVarChar, JSON.stringify(q.options))
        .input('answers', sql.NVarChar, JSON.stringify(q.answers))
        .input('explanation', sql.NVarChar, q.explanation)
        .input('material', sql.NVarChar, q.material || null)
        .input('source', sql.VarChar, q.source || null)
        .query(`INSERT INTO questions (id,type,category,chapter,stem,options,answers,explanation,material,source)
                VALUES (@id,@type,@category,@chapter,@stem,@options,@answers,@explanation,@material,@source)`);
      imported++;
    }
    console.log(`✅ 题目导入完成 (新增 ${imported}，跳过 ${questions.length - imported})`);
  } else {
    console.log('⚠️  data/questions.json 不存在，跳过题库导入');
  }

  // 3. 导入用户
  const usersPath = path.join(process.cwd(), 'data', 'users.json');
  if (fs.existsSync(usersPath)) {
    const users: Record<string, any> = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    const names = Object.keys(users);
    console.log(`📥 正在导入 ${names.length} 个用户...`);

    let imported = 0;
    for (const username of names) {
      const u = users[username];
      const exists = await pool.request()
        .input('username', sql.VarChar, username)
        .query(`SELECT username FROM users WHERE username = @username`);
      if (exists.recordset.length > 0) continue;

      await pool.request()
        .input('username', sql.VarChar, username)
        .input('password', sql.VarChar, u.password)
        .input('phone', sql.VarChar, u.phone || '')
        .input('created_at', sql.DateTime2, u.createdAt ? new Date(u.createdAt) : new Date())
        .input('last_login', sql.DateTime2, u.lastLogin ? new Date(u.lastLogin) : null)
        .input('total_login_seconds', sql.Int, u.totalLoginSeconds || 0)
        .input('banned', sql.Bit, u.banned ? 1 : 0)
        .query(`INSERT INTO users (username,password,phone,created_at,last_login,total_login_seconds,banned)
                VALUES (@username,@password,@phone,@created_at,@last_login,@total_login_seconds,@banned)`);
      imported++;
    }
    console.log(`✅ 用户导入完成 (新增 ${imported}，跳过 ${names.length - imported})`);
  } else {
    console.log('⚠️  data/users.json 不存在，跳过用户导入');
  }

  console.log('🎉 数据导入全部完成！');
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ 错误:', e.message);
  process.exit(1);
});
