import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePassword, createJwtToken, type UserSessionPayload } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user || !user.active) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos, ou conta desativada.' },
        { status: 401 }
      )
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos.' },
        { status: 401 }
      )
    }

    const token = await createJwtToken({
      id: user.id,
      name: user.name,
      email: user.email,
      // Campo role é string no SQLite (sem enums); valores são restritos na criação de usuários
      role: user.role as UserSessionPayload['role'],
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    })

    return response
  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 })
  }
}
