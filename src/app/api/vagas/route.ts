import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { jobSchema } from '@/lib/validations'
import { slugify } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const whereClause: any = {}
    if (activeOnly) {
      whereClause.active = true
    }

    // Se for RECRUITER, filtra apenas vagas atribuídas ou criadas por ele
    if (user.role === 'RECRUITER') {
      whereClause.OR = [
        { createdById: user.id },
        { assignedUsers: { some: { id: user.id } } },
      ]
    }

    const jobs = await db.job.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { candidates: true },
        },
        assignedUsers: {
          select: { id: true, name: true, email: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Erro ao buscar vagas:', error)
    return NextResponse.json({ error: 'Erro ao buscar vagas.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validation = jobSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, company, location, type, category, description, requirements, salary, benefits, active, assignedUserIds } = validation.data

    const slug = slugify(title)

    // Se admin especificou recrutadores atribuídos
    const assignedConnect = (assignedUserIds && assignedUserIds.length > 0)
      ? assignedUserIds.map((id) => ({ id }))
      : [{ id: user.id }]

    // Vagas criadas por recrutadores nascem pendentes de aprovação de um admin;
    // vagas criadas por admin já entram aprovadas.
    const approvalStatus = user.role === 'RECRUITER' ? 'PENDENTE' : 'APROVADA'

    const job = await db.job.create({
      data: {
        title,
        slug,
        company,
        location,
        type,
        category,
        description,
        requirements,
        salary: salary || null,
        benefits: benefits || null,
        active: active !== undefined ? active : true,
        approvalStatus,
        createdById: user.id,
        assignedUsers: {
          connect: assignedConnect,
        },
      },
      include: {
        assignedUsers: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar vaga:', error)
    return NextResponse.json({ error: 'Erro interno ao criar vaga.' }, { status: 500 })
  }
}
