import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { landingContentSchema } from '@/lib/validations'

function normalizeCategory(raw: string) {
  const upper = raw.toUpperCase()
  return upper === 'PRESTADOR' ? 'PRESTADOR' : 'CLT'
}

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const category = normalizeCategory(params.category)

    const content = await db.landingContent.findUnique({
      where: { category },
      include: {
        features: { orderBy: { order: 'asc' } },
        steps: { orderBy: { order: 'asc' } },
        testimonials: { orderBy: { order: 'asc' } },
        faqs: { orderBy: { order: 'asc' } },
      },
    })

    if (!content) {
      return NextResponse.json({ error: 'Conteúdo não encontrado para esta categoria' }, { status: 404 })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error('Erro ao buscar conteúdo da landing page:', error)
    return NextResponse.json({ error: 'Erro ao buscar conteúdo da landing page' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores podem editar o conteúdo das landing pages' }, { status: 403 })
    }

    const category = normalizeCategory(params.category)
    const body = await request.json()
    const validation = landingContentSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { features, steps, testimonials, faqs, ...flatFields } = validation.data

    const existing = await db.landingContent.findUnique({ where: { category } })
    if (!existing) {
      return NextResponse.json({ error: 'Conteúdo não encontrado para esta categoria' }, { status: 404 })
    }

    const updated = await db.$transaction(async (tx) => {
      await tx.landingContent.update({
        where: { category },
        data: flatFields,
      })

      await tx.landingFeature.deleteMany({ where: { contentId: existing.id } })
      await tx.landingStep.deleteMany({ where: { contentId: existing.id } })
      await tx.landingTestimonial.deleteMany({ where: { contentId: existing.id } })
      await tx.landingFaq.deleteMany({ where: { contentId: existing.id } })

      if (features.length > 0) {
        await tx.landingFeature.createMany({
          data: features.map((f, i) => ({ ...f, contentId: existing.id, order: i })),
        })
      }
      if (steps.length > 0) {
        await tx.landingStep.createMany({
          data: steps.map((s, i) => ({ ...s, contentId: existing.id, order: i })),
        })
      }
      if (testimonials.length > 0) {
        await tx.landingTestimonial.createMany({
          data: testimonials.map((t, i) => ({ ...t, contentId: existing.id, order: i })),
        })
      }
      if (faqs.length > 0) {
        await tx.landingFaq.createMany({
          data: faqs.map((f, i) => ({ ...f, contentId: existing.id, order: i })),
        })
      }

      return tx.landingContent.findUnique({
        where: { category },
        include: {
          features: { orderBy: { order: 'asc' } },
          steps: { orderBy: { order: 'asc' } },
          testimonials: { orderBy: { order: 'asc' } },
          faqs: { orderBy: { order: 'asc' } },
        },
      })
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Erro ao atualizar conteúdo da landing page:', error)
    return NextResponse.json({ error: 'Erro ao atualizar conteúdo da landing page' }, { status: 500 })
  }
}
