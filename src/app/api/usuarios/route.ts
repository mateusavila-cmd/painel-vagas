import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hashPassword } from '@/lib/auth'
import { userSchema } from '@/lib/validations'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem gerenciar usuários' }, { status: 403 })
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        assignedJobs: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem criar usuários' }, { status: 403 })
    }

    const body = await request.json()
    const validation = userSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, role, active, assignedJobIds } = validation.data

    if (!password) {
      return NextResponse.json({ error: 'A senha é obrigatória para novos usuários.' }, { status: 400 })
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    const newUser = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        active: active !== undefined ? active : true,
        assignedJobs: assignedJobIds && assignedJobIds.length > 0
          ? { connect: assignedJobIds.map((id) => ({ id })) }
          : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro interno ao criar usuário' }, { status: 500 })
  }
}
