import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PUT — update phone / change password / heartbeat
// DELETE — remove user
// PATCH — toggle ban
export async function PUT(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { action, phone, oldPassword, newPassword, loginSeconds } = await req.json();

  try {
    const rows = await query(`SELECT * FROM users WHERE username = @username`, { username });
    if (rows.length === 0) return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    const user = rows[0];

    if (action === 'update-phone') {
      await query(`UPDATE users SET phone = @phone WHERE username = @username`, { phone, username });
    } else if (action === 'change-password') {
      if (user.password !== oldPassword) return NextResponse.json({ error: '原密码错误' }, { status: 400 });
      if (newPassword.length < 4) return NextResponse.json({ error: '新密码至少 4 位' }, { status: 400 });
      await query(`UPDATE users SET password = @password WHERE username = @username`, { password: newPassword, username });
    } else if (action === 'heartbeat') {
      await query(
        `UPDATE users SET total_login_seconds = total_login_seconds + @seconds WHERE username = @username`,
        { seconds: loginSeconds || 30, username }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  try {
    await query(`DELETE FROM users WHERE username = @username`, { username });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  try {
    const rows = await query(`SELECT * FROM users WHERE username = @username`, { username });
    if (rows.length === 0) return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    const user = rows[0];
    const newBanned = !user.banned;
    await query(`UPDATE users SET banned = @banned WHERE username = @username`, { banned: newBanned, username });
    return NextResponse.json({ success: true, banned: newBanned });
  } catch (e) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
