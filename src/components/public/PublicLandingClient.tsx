import { PublicLandingCLT } from './PublicLandingCLT'
import { PublicLandingPrestador } from './PublicLandingPrestador'
import type { LandingContentData } from '@/lib/landing-content'

interface JobData {
  id: string
  title: string
  company: string
  location: string
  type: string
  category: string
  description: string
  requirements: string
  salary?: string | null
  benefits?: string | null
  active: boolean
}

export function PublicLandingClient({ job, content }: { job: JobData; content: LandingContentData | null }) {
  if (!content) {
    // Salvaguarda: não deveria ocorrer em produção pois o conteúdo é semeado por categoria.
    notFoundFallback()
  }

  if (job.category === 'PRESTADOR') {
    return <PublicLandingPrestador job={job} content={content as LandingContentData} />
  }

  return <PublicLandingCLT job={job} content={content as LandingContentData} />
}

function notFoundFallback(): never {
  throw new Error('Conteúdo da landing page não configurado para esta categoria. Contate o administrador.')
}
