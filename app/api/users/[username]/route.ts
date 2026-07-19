import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

function readUsers(): Record<string, any> {
  try {
    if (!fs.existsSync(USERS_FILE)) return {};
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch { return {}; }
}

function writeUsers(users: Record<string, any>) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// PUT — update phone / change password / heartbeat
// DELETE — remove user
// PATCH — toggle ban
export async function PUT(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { action, phone, oldPassword, newPassword, loginSeconds } = await req.json();
  const users = readUsers();

  if (!users[username]) return NextResponse.json({ error: '用户不存在' }, { status: 404 });

  if (action === 'update-phone') {
    users[username].phone = phone;
  } else if (action === 'change-password') {
    if (users[username].password !== oldPassword) return NextResponse.json({ error: '原密码错误' }, { status: 400 });
    if (newPassword.length < 4) return NextResponse.json({ error: '新密码至少 4 位' }, { status: 400 });
    users[username].password = newPassword;
  } else if (action === 'heartbeat') {
    users[username].totalLoginSeconds = (users[username].totalLoginSeconds || 0) + (loginSeconds || 30);
  }

  writeUsers(users);
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const users = readUsers();
  delete users[username];
  writeUsers(users);
  return NextResponse.json({ success: true });
}

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const users = readUsers();
  if (users[username]) {
    users[username].banned = !users[username].banned;
  }
  writeUsers(users);
  return NextResponse.json({ success: true, banned: users[username]?.banned });
}
