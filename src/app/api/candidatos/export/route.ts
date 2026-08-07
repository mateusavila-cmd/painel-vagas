import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { generateCandidatesCSV } from '@/lib/utils'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const status = searchParams.get('status')

    const whereClause: any = {}
    if (jobId && jobId !== 'ALL') whereClause.jobId = jobId
    if (status && status !== 'ALL') whereClause.status = status

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
          select: { title: true, company: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const csvData = generateCandidatesCSV(
      candidates.map((c) => ({
        name: c.name,
        whatsapp: c.whatsapp,
        jobTitle: c.job.title,
        company: c.job.company,
        status: c.status,
        notes: c.notes || '',
        createdAt: c.createdAt,
      }))
    )

    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `candidatos-vagas-${dateStr}.csv`

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Erro ao exportar CSV:', error)
    return NextResponse.json({ error: 'Erro ao gerar exportação' }, { status: 500 })
  }
}
