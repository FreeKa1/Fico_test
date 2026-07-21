import { NextRequest, NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';

export interface UserRecord {
  password: string;
  phone: string;
  createdAt: string;
  lastLogin: string;
  totalLoginSeconds: number;
  banned: boolean;
}

function mapRow(row: any): UserRecord {
  return {
    password: row.password,
    phone: row.phone || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : '',
    lastLogin: row.last_login ? new Date(row.last_login).toISOString() : '',
    totalLoginSeconds: row.total_login_seconds || 0,
    banned: !!row.banned,
  };
}

// GET /api/users — list all
export async function GET() {
  try {
    const rows = await query(`SELECT * FROM users ORDER BY username`);
    const users: Record<string, UserRecord> = {};
    for (const row of rows) {
      users[row.username] = mapRow(row);
    }
    return NextResponse.json(users);
  } catch (e) {
    return NextResponse.json({ error: '数据库不可用' }, { status: 500 });
  }
}

// POST /api/users — register / login / reset-password
export async function POST(req: NextRequest) {
  const { action, username, password, phone } = await req.json();

  try {
    if (action === 'register') {
      if (!username || username.length < 2) return NextResponse.json({ error: '用户名需 2-20 个字符' }, { status: 400 });
      if (password.length < 4) return NextResponse.json({ error: '密码至少 4 位' }, { status: 400 });
      if (!/^1[3-9]\d{9}$/.test(phone)) return NextResponse.json({ error: '手机号格式不正确' }, { status: 400 });

      const existing = await query(`SELECT username FROM users WHERE username = @username OR phone = @phone`, {
        username, phone,
      });
      const nameTaken = existing.some((r: any) => r.username === username);
      const phoneTaken = existing.some((r: any) => r.phone === phone);
      if (nameTaken) return NextResponse.json({ error: '用户名已存在' }, { status: 400 });
      if (phoneTaken) return NextResponse.json({ error: '该手机号已被注册' }, { status: 400 });

      const now = new Date();
      await query(
        `INSERT INTO users (username, password, phone, created_at, last_login, total_login_seconds, banned)
         VALUES (@username, @password, @phone, @created_at, @last_login, 0, 0)`,
        { username, password, phone, created_at: now, last_login: now }
      );
      return NextResponse.json({ success: true, username, phone });
    }

    if (action === 'login') {
      const rows = await query(`SELECT * FROM users WHERE username = @username`, { username });
      if (rows.length === 0) return NextResponse.json({ error: '用户不存在' }, { status: 401 });
      const user = rows[0];
      if (user.banned) return NextResponse.json({ error: '该账号已被禁用' }, { status: 403 });
      if (user.password !== password) return NextResponse.json({ error: '密码错误' }, { status: 401 });

      await query(`UPDATE users SET last_login = @last_login WHERE username = @username`, {
        last_login: new Date(), username,
      });
      return NextResponse.json({ success: true, username, phone: user.phone || '' });
    }

    if (action === 'reset-password') {
      const rows = await query(`SELECT * FROM users WHERE username = @username`, { username });
      if (rows.length === 0) return NextResponse.json({ error: '用户不存在' }, { status: 404 });
      const user = rows[0];
      if (!user.phone) return NextResponse.json({ error: '该账号未绑定手机号' }, { status: 400 });
      if (user.phone !== phone) return NextResponse.json({ error: '手机号不匹配' }, { status: 400 });
      if (password.length < 4) return NextResponse.json({ error: '新密码至少 4 位' }, { status: 400 });

      await query(`UPDATE users SET password = @password WHERE username = @username`, { password, username });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
