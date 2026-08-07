import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { jobSchema } from '@/lib/validations'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Tenta buscar por ID ou por Slug (útil para landing page pública)
    const job = await db.job.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        _count: { select: { candidates: true } },
        assignedUsers: { select: { id: true, name: true, email: true } },
      },
    })

    if (!job) {
      return NextResponse.json({ error: 'Oportunidade não encontrada' }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar oportunidade' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const validation = jobSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, company, location, type, category, description, requirements, salary, benefits, active, assignedUserIds } = validation.data

    const updateData: any = {
      title,
      company,
      location,
      type,
      category,
      description,
      requirements,
      salary: salary || null,
      benefits: benefits || null,
      active,
    }

    if (assignedUserIds) {
      updateData.assignedUsers = {
        set: assignedUserIds.map((uId) => ({ id: uId })),
      }
    }

    const updatedJob = await db.job.update({
      where: { id },
      data: updateData,
      include: {
        assignedUsers: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Erro ao atualizar oportunidade:', error)
    return NextResponse.json({ error: 'Erro ao atualizar oportunidade' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    if (typeof body.active !== 'boolean') {
      return NextResponse.json({ error: 'Status ativo deve ser booleano' }, { status: 400 })
    }

    const updatedJob = await db.job.update({
      where: { id },
      data: { active: body.active },
    })

    return NextResponse.json(updatedJob)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar status da oportunidade' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem excluir oportunidades' }, { status: 403 })
    }

    const { id } = params
    await db.job.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Oportunidade excluída com sucesso' })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir oportunidade' }, { status: 500 })
  }
}
