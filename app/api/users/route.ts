import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export interface UserRecord {
  password: string;
  phone: string;
  createdAt: string;
  lastLogin: string;
  totalLoginSeconds: number;
  banned: boolean;
}

function readUsers(): Record<string, UserRecord> {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      // Seed admin
      const initial: Record<string, UserRecord> = {
        admin: { password: 'admin123', phone: '', createdAt: new Date().toISOString(), lastLogin: '', totalLoginSeconds: 0, banned: false },
      };
      fs.writeFileSync(USERS_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch { return {}; }
}

function writeUsers(users: Record<string, UserRecord>) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// GET /api/users — list all
// POST /api/users — login or register
export async function GET() {
  const users = readUsers();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { action, username, password, phone } = await req.json();
  const users = readUsers();

  if (action === 'register') {
    if (!username || username.length < 2) return NextResponse.json({ error: '用户名需 2-20 个字符' }, { status: 400 });
    if (users[username]) return NextResponse.json({ error: '用户名已存在' }, { status: 400 });
    if (password.length < 4) return NextResponse.json({ error: '密码至少 4 位' }, { status: 400 });
    if (!/^1[3-9]\d{9}$/.test(phone)) return NextResponse.json({ error: '手机号格式不正确' }, { status: 400 });
    const phoneUsed = Object.values(users).some((u) => u.phone === phone);
    if (phoneUsed) return NextResponse.json({ error: '该手机号已被注册' }, { status: 400 });

    users[username] = { password, phone, createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(), totalLoginSeconds: 0, banned: false };
    writeUsers(users);
    return NextResponse.json({ success: true, username, phone });
  }

  if (action === 'login') {
    const user = users[username];
    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 401 });
    if (user.banned) return NextResponse.json({ error: '该账号已被禁用' }, { status: 403 });
    if (user.password !== password) return NextResponse.json({ error: '密码错误' }, { status: 401 });
    user.lastLogin = new Date().toISOString();
    writeUsers(users);
    return NextResponse.json({ success: true, username, phone: user.phone || '' });
  }

  if (action === 'reset-password') {
    const user = users[username];
    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    if (!user.phone) return NextResponse.json({ error: '该账号未绑定手机号' }, { status: 400 });
    if (user.phone !== phone) return NextResponse.json({ error: '手机号不匹配' }, { status: 400 });
    if (password.length < 4) return NextResponse.json({ error: '新密码至少 4 位' }, { status: 400 });
    users[username].password = password;
    writeUsers(users);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: '未知操作' }, { status: 400 });
}
