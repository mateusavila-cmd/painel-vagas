'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Copy, Edit, Trash2, ExternalLink, Power, Users, Check, X, Filter } from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { useToast } from '@/components/ui/Toast'

type ApprovalStatus = 'PENDENTE' | 'APROVADA' | 'REJEITADA'

interface Job {
  id: string
  title: string
  slug: string
  company: string
  location: string
  type: string
  category: string
  salary?: string | null
  active: boolean
  approvalStatus: ApprovalStatus
  createdAt: string
  _count: { candidates: number }
  assignedUsers: Array<{ id: string; name: string }>
}

export default function VagasPage() {
  const { showToast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [approvalFilter, setApprovalFilter] = useState<'ALL' | ApprovalStatus>('ALL')

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/vagas')
      if (res.ok) {
        const data = await res.json()
        setJobs(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setIsAdmin(data.user?.role === 'ADMIN')
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchJobs()
    fetchCurrentUser()
  }, [])

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/vagas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus }),
      })

      if (res.ok) {
        showToast(
          `Oportunidade ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`
        )
        setJobs((prev) =>
          prev.map((j) => (j.id === id ? { ...j, active: !currentStatus } : j))
        )
      }
    } catch (err) {
      showToast('Erro ao alterar status da oportunidade', 'error')
    }
  }

  const handleApprovalDecision = async (id: string, decision: 'APROVADA' | 'REJEITADA') => {
    try {
      const res = await fetch(`/api/vagas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: decision }),
      })

      if (res.ok) {
        showToast(
          decision === 'APROVADA' ? 'Oportunidade aprovada e publicada!' : 'Oportunidade rejeitada.'
        )
        setJobs((prev) =>
          prev.map((j) => (j.id === id ? { ...j, approvalStatus: decision } : j))
        )
      } else {
        const data = await res.json()
        showToast(data.error || 'Erro ao atualizar aprovação', 'error')
      }
    } catch (err) {
      showToast('Erro ao atualizar aprovação', 'error')
    }
  }

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const fullUrl = `${origin}/oportunidade/${slug}`
    navigator.clipboard.writeText(fullUrl)
    showToast('Link da landing page copiado para a área de transferência!')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta oportunidade? Esta ação não pode ser desfeita.')) return

    try {
      const res = await fetch(`/api/vagas/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Oportunidade excluída com sucesso!')
        setJobs((prev) => prev.filter((j) => j.id !== id))
      } else {
        const data = await res.json()
        showToast(data.error || 'Erro ao excluir oportunidade', 'error')
      }
    } catch (err) {
      showToast('Erro ao excluir oportunidade', 'error')
    }
  }

  const filteredJobs = jobs.filter(
    (j) =>
      (approvalFilter === 'ALL' || j.approvalStatus === approvalFilter) &&
      (j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company.toLowerCase().includes(search.toLowerCase()) ||
        j.location.toLowerCase().includes(search.toLowerCase()))
  )

  const pendingCount = jobs.filter((j) => j.approvalStatus === 'PENDENTE').length

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Oportunidades</h2>
          <p className="text-sm text-slate-500 mt-1">
            Crie, edite e ative/desative oportunidades com landing pages dinâmicas
          </p>
        </div>

        <Link
          href="/admin/vagas/nova"
          className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Oportunidade</span>
        </Link>
      </div>

      {isAdmin && pendingCount > 0 && (
        <button
          onClick={() => setApprovalFilter('PENDENTE')}
          className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-2xl text-sm font-medium hover:bg-amber-100 transition-colors text-left"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span>
            {pendingCount} {pendingCount === 1 ? 'oportunidade aguardando' : 'oportunidades aguardando'} sua aprovação
          </span>
        </button>
      )}

      {/* Filtro de Busca */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, empresa ou localização..."
            className="w-full text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 sm:border-l sm:border-slate-200 sm:pl-3">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value as 'ALL' | ApprovalStatus)}
            className="text-sm outline-none bg-transparent text-slate-900 font-medium cursor-pointer"
          >
            <option value="ALL">Todos os Status</option>
            <option value="PENDENTE">Pendentes de Aprovação</option>
            <option value="APROVADA">Aprovadas</option>
            <option value="REJEITADA">Rejeitadas</option>
          </select>
        </div>
      </div>

      {/* Lista de Oportunidades */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Carregando oportunidades...
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Nenhuma oportunidade encontrada.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Oportunidade & Empresa</th>
                  <th className="px-6 py-4">Tipo / Local</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Inscritos</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-slate-900 text-base">{job.title}</div>
                        <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          job.category === 'PRESTADOR'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-brand-100 text-brand-700'
                        }`}>
                          {job.category === 'PRESTADOR' ? 'Prestador' : 'CLT'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{job.company}</div>
                      {job.salary && (
                        <div className="text-xs text-brand-700 font-medium mt-1">{job.salary}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-700">{job.location}</div>
                      <div className="text-xs text-slate-500">{job.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-y-1">
                      {job.approvalStatus !== 'APROVADA' ? (
                        <StatusBadge status={job.approvalStatus} />
                      ) : (
                        <StatusBadge status={job.active ? 'ACTIVE' : 'INACTIVE'} />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/candidatos?jobId=${job.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{job._count.candidates} candidatos</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      {/* Aprovar / Rejeitar (somente admin, somente vagas pendentes) */}
                      {isAdmin && job.approvalStatus === 'PENDENTE' && (
                        <>
                          <button
                            onClick={() => handleApprovalDecision(job.id, 'APROVADA')}
                            className="p-2 text-brand-600 hover:text-white hover:bg-brand-600 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium border border-brand-200 hover:border-brand-600"
                            title="Aprovar oportunidade"
                          >
                            <Check className="w-4 h-4" />
                            <span className="hidden lg:inline">Aprovar</span>
                          </button>
                          <button
                            onClick={() => handleApprovalDecision(job.id, 'REJEITADA')}
                            className="p-2 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium border border-rose-200 hover:border-rose-600"
                            title="Rejeitar oportunidade"
                          >
                            <X className="w-4 h-4" />
                            <span className="hidden lg:inline">Rejeitar</span>
                          </button>
                        </>
                      )}

                      {/* Copiar URL */}
                      <button
                        onClick={() => handleCopyLink(job.slug)}
                        className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                        title="Copiar link da Landing Page"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="hidden lg:inline">Copiar Link</span>
                      </button>

                      {/* Ver LP */}
                      {job.approvalStatus === 'APROVADA' ? (
                        <a
                          href={`/oportunidade/${job.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                          title="Visualizar Landing Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span
                          className="p-2 text-slate-300 inline-flex items-center cursor-not-allowed"
                          title="Disponível após aprovação do admin"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </span>
                      )}

                      {/* Editar */}
                      <Link
                        href={`/admin/vagas/${job.id}/editar`}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center"
                        title="Editar oportunidade"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      {/* Alternar Ativa/Desativada */}
                      {job.approvalStatus === 'APROVADA' && (
                        <button
                          onClick={() => handleToggleActive(job.id, job.active)}
                          className={`p-2 rounded-lg transition-colors inline-flex items-center ${
                            job.active
                              ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-brand-600 hover:bg-brand-50'
                          }`}
                          title={job.active ? 'Desativar oportunidade' : 'Ativar oportunidade'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      )}

                      {/* Excluir */}
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                        title="Excluir oportunidade"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
