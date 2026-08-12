export interface LandingListItem {
  id: string
  title: string
  description: string
  order: number
}

export interface LandingTestimonialItem {
  id: string
  name: string
  role: string
  text: string
  order: number
}

export interface LandingFaqItem {
  id: string
  question: string
  answer: string
  order: number
}

export interface LandingContentData {
  id: string
  category: string
  heroTitle: string | null
  heroSubtitle: string | null
  heroBadgeLabel: string | null
  trustBadge1: string | null
  trustBadge2: string | null
  ctaHeaderLabel: string
  ctaPrimaryLabel: string
  ctaSecondaryLabel: string
  sectionSobreTitle: string | null
  sectionRequisitosTitle: string | null
  sectionBeneficiosTitle: string | null
  resumoTitle: string | null
  sobreTitle: string | null
  preRequisitosTitle: string | null
  vantagensTitle: string | null
  comoFuncionaTitle: string | null
  depoimentosTitle: string | null
  faqTitle: string | null
  safetyNote: string | null
  responseTimeTitle: string | null
  responseTimeText: string | null
  ctaFinalTitle: string | null
  ctaFinalSubtitle: string | null
  whatsappMessageTemplate: string | null
  closedTitle: string
  closedMessage: string
  closedFooterNote: string
  features: LandingListItem[]
  steps: LandingListItem[]
  testimonials: LandingTestimonialItem[]
  faqs: LandingFaqItem[]
}

/**
 * Substitui os placeholders {empresa}, {cargo} e {nome} pelo dado real da oportunidade/candidato.
 */
export function fillTemplate(
  text: string | null | undefined,
  vars: { empresa: string; cargo: string; nome?: string }
): string {
  if (!text) return ''
  return text
    .replace(/\{empresa\}/g, vars.empresa)
    .replace(/\{cargo\}/g, vars.cargo)
    .replace(/\{nome\}/g, vars.nome ?? '')
}
