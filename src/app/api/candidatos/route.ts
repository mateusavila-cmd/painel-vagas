import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { candidateSchema } from '@/lib/validations'
import { formatWhatsApp } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const recruiterId = searchParams.get('recruiterId')

    const whereClause: any = {}

    if (jobId && jobId !== 'ALL') {
      whereClause.jobId = jobId
    }

    if (status && status !== 'ALL') {
      whereClause.status = status
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { whatsapp: { contains: search } },
      ]
    }

    if (user.role === 'ADMIN' && recruiterId && recruiterId !== 'ALL') {
      whereClause.job = {
        ...whereClause.job,
        OR: [
          { createdById: recruiterId },
          { assignedUsers: { some: { id: recruiterId } } },
        ],
      }
    }

    // Se for RECRUITER, garante acesso apenas a candidatos de suas oportunidades
    if (user.role === 'RECRUITER') {
      whereClause.job = {
        OR: [
          { createdById: user.id },
          { assignedUsers: { some: { id: user.id } } },
        ],
      }
    }

    const candidates = await db.candidate.findMany({
      where: whereClause,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(candidates)
  } catch (error) {
    console.error('Erro ao buscar candidatos:', error)
    return NextResponse.json({ error: 'Erro ao listar candidatos' }, { status: 500 })
  }
}

// POST Público - Envio de formulário pela Landing Page
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validation = candidateSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, whatsapp, jobId } = validation.data

    // Verifica se a oportunidade existe e está ativa
    const job = await db.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      return NextResponse.json({ error: 'Oportunidade não encontrada.' }, { status: 404 })
    }

    if (!job.active) {
      return NextResponse.json(
        { error: 'Esta oportunidade foi encerrada e não aceita mais candidaturas.' },
        { status: 400 }
      )
    }

    const formattedPhone = formatWhatsApp(whatsapp)

    const candidate = await db.candidate.create({
      data: {
        name,
        whatsapp: formattedPhone,
        jobId: job.id,
        status: 'NOVO',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Recebemos seu interesse! Nossa equipe entrará em contato pelo WhatsApp em até 24 horas.',
        candidateId: candidate.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Erro ao salvar candidatura:', error)
    return NextResponse.json(
      { error: 'Não foi possível enviar sua candidatura. Tente novamente.' },
      { status: 500 }
    )
  }
}
