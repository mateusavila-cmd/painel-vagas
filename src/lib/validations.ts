import { z } from 'zod'
import { isValidWhatsApp } from './utils'

export const loginSchema = z.object({
  email: z.string().email('Digite um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

export const jobSchema = z.object({
  title: z.string().min(3, 'O título da oportunidade deve ter no mínimo 3 caracteres'),
  company: z.string().min(2, 'O nome da empresa é obrigatório'),
  location: z.string().min(2, 'A localização é obrigatória (ex: Remoto ou Cidade/UF)'),
  type: z.string().min(2, 'O tipo de contratação é obrigatório'),
  category: z.enum(['CLT', 'PRESTADOR']).default('CLT'),
  description: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres'),
  requirements: z.string().min(5, 'Os requisitos são obrigatórios'),
  salary: z.string().optional(),
  benefits: z.string().optional(),
  active: z.boolean().default(true),
  assignedUserIds: z.array(z.string()).optional(),
})

export const candidateSchema = z.object({
  name: z.string().min(3, 'Digite seu nome completo (mínimo 3 caracteres)'),
  whatsapp: z.string().refine((val) => isValidWhatsApp(val), {
    message: 'Digite um número de WhatsApp válido com DDD (ex: (11) 99999-9999)',
  }),
  jobId: z.string().min(1, 'Oportunidade inválida'),
})

export const userSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'RECRUITER']),
  active: z.boolean().default(true),
  assignedJobIds: z.array(z.string()).optional(),
})

const optionalText = z.string().optional().nullable()

export const landingContentSchema = z.object({
  heroTitle: optionalText,
  heroSubtitle: optionalText,
  heroBadgeLabel: optionalText,
  trustBadge1: optionalText,
  trustBadge2: optionalText,
  ctaHeaderLabel: z.string().min(1, 'O texto do botão de cabeçalho é obrigatório'),
  ctaPrimaryLabel: z.string().min(1, 'O texto do botão principal é obrigatório'),
  ctaSecondaryLabel: z.string().min(1, 'O texto do botão secundário é obrigatório'),
  sectionSobreTitle: optionalText,
  sectionRequisitosTitle: optionalText,
  sectionBeneficiosTitle: optionalText,
  resumoTitle: optionalText,
  sobreTitle: optionalText,
  preRequisitosTitle: optionalText,
  vantagensTitle: optionalText,
  comoFuncionaTitle: optionalText,
  depoimentosTitle: optionalText,
  faqTitle: optionalText,
  safetyNote: optionalText,
  responseTimeTitle: optionalText,
  responseTimeText: optionalText,
  ctaFinalTitle: optionalText,
  ctaFinalSubtitle: optionalText,
  closedTitle: z.string().min(1, 'O título de encerrado é obrigatório'),
  closedMessage: z.string().min(1, 'A mensagem de encerrado é obrigatória'),
  closedFooterNote: z.string().min(1, 'A nota de rodapé é obrigatória'),
  features: z.array(z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
  })).default([]),
  steps: z.array(z.object({
    title: z.string().min(1, 'Título é obrigatório'),
    description: z.string().min(1, 'Descrição é obrigatória'),
  })).default([]),
  testimonials: z.array(z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    role: z.string().min(1, 'Cargo/papel é obrigatório'),
    text: z.string().min(1, 'Texto do depoimento é obrigatório'),
  })).default([]),
  faqs: z.array(z.object({
    question: z.string().min(1, 'Pergunta é obrigatória'),
    answer: z.string().min(1, 'Resposta é obrigatória'),
  })).default([]),
})
