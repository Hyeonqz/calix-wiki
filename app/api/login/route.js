import { NextResponse } from 'next/server'

const CREDENTIALS = { id: 'admin', pw: 'admin1234!@' }
const TOKEN = 'calix-til-auth-token'

export async function POST(req) {
  const { id, pw } = await req.json()

  if (id === CREDENTIALS.id && pw === CREDENTIALS.pw) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('til-auth', TOKEN, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return res
  }

  return NextResponse.json(
    { ok: false, message: '아이디 또는 비밀번호가 틀렸습니다.' },
    { status: 401 }
  )
}
