import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { PublicLandingClient } from '@/components/public/PublicLandingClient'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const job = await db.job.findUnique({
    where: { slug: params.slug },
  })

  if (!job || job.approvalStatus !== 'APROVADA') {
    return {
      title: 'Oportunidade não encontrada',
    }
  }

  const title = `${job.title} - ${job.company}`
  const description = `${job.type} em ${job.location}. Inscreva-se agora para a oportunidade de ${job.title} na ${job.company}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

export default async function OportunidadeLandingPage({ params }: PageProps) {
  const job = await db.job.findUnique({
    where: { slug: params.slug },
  })

  // Vagas ainda não aprovadas por um admin (ou rejeitadas) não ficam públicas
  if (!job || job.approvalStatus !== 'APROVADA') {
    notFound()
  }

  const content = await db.landingContent.findUnique({
    where: { category: job.category },
    include: {
      features: { orderBy: { order: 'asc' } },
      steps: { orderBy: { order: 'asc' } },
      testimonials: { orderBy: { order: 'asc' } },
      faqs: { orderBy: { order: 'asc' } },
    },
  })

  // Incrementa contador de visualizações
  try {
    await db.job.update({
      where: { id: job.id },
      data: { viewsCount: { increment: 1 } },
    })
  } catch (err) {
    // Ignora erro estatístico não-bloqueante
  }

  return <PublicLandingClient job={job} content={content} />
}
