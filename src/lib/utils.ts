import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte um título em um slug limpo e único com um sufixo curto
 */
export function slugify(text: string): string {
  const cleanText = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '') // remove caracteres especiais
    .replace(/\s+/g, '-') // substitui espaços por hifens
    .replace(/-+/g, '-') // remove hifens duplicados

  const randomHash = Math.random().toString(36).substring(2, 7)
  return `${cleanText}-${randomHash}`
}

/**
 * Formata um número de telefone com máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function formatWhatsApp(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  
  if (numbers.length <= 2) {
    return numbers ? `(${numbers}` : ''
  }
  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  }
  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

/**
 * Remove formatação mantendo apenas números
 */
export function unformatWhatsApp(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Valida se o número possui DDD + 8 ou 9 dígitos (total 10 ou 11 dígitos)
 */
export function isValidWhatsApp(value: string): boolean {
  const digits = unformatWhatsApp(value)
  return digits.length >= 10 && digits.length <= 11
}

/**
 * Monta o link do WhatsApp Web/App (wa.me) a partir de um telefone com DDD,
 * prefixando o código do Brasil (55). Aceita um texto inicial opcional.
 */
export function getWhatsAppLink(whatsapp: string, message?: string): string {
  const digits = unformatWhatsApp(whatsapp)
  const withCountryCode = digits.startsWith('55') ? digits : `55${digits}`
  const query = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${withCountryCode}${query}`
}

/**
 * Monta a mensagem padrão enviada ao candidato ao clicar no botão de WhatsApp do painel
 */
export function buildRecruiterWhatsAppMessage(candidateName: string, jobTitle: string, company: string): string {
  const firstName = candidateName.split(' ')[0]
  return `Olá ${firstName}, tudo bem? \n\nVi seu interesse na oportunidade de \n${jobTitle} aqui na ${company}\n\nFaça o seu cadastro em https://app.tarkis.com.br/\n\nAssim que terminar o seu cadastro me avisa aqui! Contamos com você!`
}

/**
 * Formata data em Português (Brasil)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Gera um arquivo CSV com cabeçalhos e BOM UTF-8 para compatibilidade perfeita com Excel
 */
export function generateCandidatesCSV(candidates: Array<{
  name: string
  whatsapp: string
  jobTitle: string
  company: string
  status: string
  notes: string
  createdAt: Date | string
}>): string {
  const BOM = '\uFEFF' // Byte Order Mark para UTF-8 no Excel
  const headers = ['Nome Completo', 'WhatsApp', 'Oportunidade de Interesse', 'Empresa', 'Status', 'Notas Internas', 'Data de Candidatura']
  
  const rows = candidates.map(c => [
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${(c.whatsapp || '').replace(/"/g, '""')}"`,
    `"${(c.jobTitle || '').replace(/"/g, '""')}"`,
    `"${(c.company || '').replace(/"/g, '""')}"`,
    `"${(c.status || '').replace(/"/g, '""')}"`,
    `"${(c.notes || '').replace(/"/g, '""')}"`,
    `"${formatDate(c.createdAt)}"`
  ])

  return BOM + [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n')
}
