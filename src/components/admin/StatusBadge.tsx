import React from 'react'

export type CandidateStatusType = 'NOVO' | 'EM_ANALISE' | 'ENTREVISTA' | 'APROVADO' | 'REJEITADO'

interface StatusBadgeProps {
  // Aceita string ampla pois o SQLite não tem enums (campo vem como string do Prisma);
  // casos não mapeados caem no default (null) sem alterar comportamento.
  status: CandidateStatusType | 'ACTIVE' | 'INACTIVE' | (string & {})
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold'

  switch (status) {
    case 'NOVO':
      return (
        <span className={`inline-flex items-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
          Novo
        </span>
      )
    case 'EM_ANALISE':
      return (
        <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 ${sizeClasses}`}>
          Em análise
        </span>
      )
    case 'ENTREVISTA':
      return (
        <span className={`inline-flex items-center rounded-full bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10 ${sizeClasses}`}>
          Entrevista Agendada
        </span>
      )
    case 'APROVADO':
      return (
        <span className={`inline-flex items-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/20 ${sizeClasses}`}>
          Aprovado
        </span>
      )
    case 'REJEITADO':
      return (
        <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/10 ${sizeClasses}`}>
          Rejeitado
        </span>
      )
    case 'ACTIVE':
      return (
        <span className={`inline-flex items-center rounded-full bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/20 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mr-1.5" />
          Ativa
        </span>
      )
    case 'INACTIVE':
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10 ${sizeClasses}`}>
          Encerrada
        </span>
      )
    default:
      return null
  }
}
