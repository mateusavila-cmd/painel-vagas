import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hashPassword } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { name, email, password, role, active, assignedJobIds } = body

    const updateData: any = {
      name,
      email: email?.toLowerCase(),
      role,
      active,
    }

    if (password && password.trim().length >= 6) {
      updateData.passwordHash = await hashPassword(password)
    }

    if (Array.isArray(assignedJobIds)) {
      updateData.assignedJobs = {
        set: assignedJobIds.map((jId: string) => ({ id: jId })),
      }
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()

    if (typeof body.active !== 'boolean') {
      return NextResponse.json({ error: 'Status ativo deve ser booleano' }, { status: 400 })
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: { active: body.active },
      select: { id: true, name: true, active: true },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao alterar status' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { id } = params

    // Impede que o próprio admin logado se exclua
    if (id === currentUser.id) {
      return NextResponse.json({ error: 'Você não pode excluir sua própria conta.' }, { status: 400 })
    }

    await db.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Usuário excluído com sucesso' })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 })
  }
}
