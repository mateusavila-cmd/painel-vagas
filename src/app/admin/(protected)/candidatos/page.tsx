'use client'

import { useState, useEffect } from 'react'
import { Download, Search, Filter, Phone, MessageSquare, MessageCircle, CheckCircle2, Eye, Trash2, Copy } from 'lucide-react'
import { StatusBadge, CandidateStatusType } from '@/components/admin/StatusBadge'
import { CandidateModal } from '@/components/admin/CandidateModal'
import { formatDate, getWhatsAppLink, buildRecruiterWhatsAppMessage } from '@/lib/utils'
import { useToast } from '@/components/ui/Toast'

interface JobOption {
  id: string
  title: string
  company: string
}

interface Candidate {
  id: string
  name: string
  whatsapp: string
  notes?: string | null
  status: CandidateStatusType
  whatsappContactedAt?: string | null
  createdAt: string
  job: {
    id: string
    title: string
    company: string
    category: string
  }
}

function maskPhone(phone: string) { if (!phone) return ''; return phone.slice(0, -3) + '***'; }

export default function CandidatosPage() {
  const { showToast } = useToast()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<JobOption[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedJob, setSelectedJob] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [search, setSearch] = useState('')
  const [activeModalCandidate, setActiveModalCandidate] = useState<Candidate | null>(null)
  const [whatsappTemplates, setWhatsappTemplates] = useState<Record<string, string>>({})

  // Carrega os templates de mensagem de WhatsApp (editáveis em Conteúdo das Landing Pages), uma vez
  useEffect(() => {
    Promise.all([
      fetch('/api/landing-content/CLT').then((res) => (res.ok ? res.json() : null)),
      fetch('/api/landing-content/PRESTADOR').then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([clt, prestador]) => {
        setWhatsappTemplates({
          CLT: clt?.whatsappMessageTemplate || '',
          PRESTADOR: prestador?.whatsappMessageTemplate || '',
        })
      })
      .catch(() => {})
  }, [])

  const getWhatsAppMessage = (candidate: Candidate) =>
    buildRecruiterWhatsAppMessage(
      candidate.name,
      candidate.job.title,
      candidate.job.company,
      whatsappTemplates[candidate.job.category]
    )

  // Carrega opções de oportunidades e lista de candidatos
  const fetchData = async () => {
    try {
      const [jobsRes, candidatesRes] = await Promise.all([
        fetch('/api/vagas'),
        fetch(`/api/candidatos?jobId=${selectedJob}&status=${selectedStatus}`),
      ])

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        setJobs(jobsData)
      }

      if (candidatesRes.ok) {
        const candidatesData = await candidatesRes.json()
        setCandidates(candidatesData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedJob, selectedStatus])

  const handleInlineStatusChange = async (id: string, newStatus: CandidateStatusType) => {
    try {
      const res = await fetch(`/api/candidatos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        showToast('Status do candidato atualizado!')
        setCandidates((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        )
      }
    } catch (err) {
      showToast('Erro ao atualizar status', 'error')
    }
  }

  const handleDeleteCandidate = async (id: string) => {
    if (!confirm('Tem certeza que deseja mudar o status deste candidato para Rejeitado?')) return

    try {
      const res = await fetch(`/api/candidatos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJEITADO' }),
      })
      if (res.ok) {
        showToast('Candidato rejeitado!')
        setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'REJEITADO' as CandidateStatusType } : c)))
      }
    } catch (err) {
      showToast('Erro ao rejeitar candidato', 'error')
    }
  }

  const handleCopyPhone = async (phone: string, id: string) => {
    try {
      await navigator.clipboard.writeText(phone)
      showToast('Telefone copiado para a área de transferência!')
      handleWhatsAppClick(id)
    } catch (err) {
      showToast('Erro ao copiar telefone', 'error')
    }
  }

  const handleWhatsAppClick = async (id: string) => {
    const now = new Date().toISOString()
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, whatsappContactedAt: now } : c))
    )

    try {
      await fetch(`/api/candidatos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappContactedAt: now }),
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleExportCSV = () => {
    const url = `/api/candidatos/export?jobId=${selectedJob}&status=${selectedStatus}`
    window.open(url, '_blank')
    showToast('Download do arquivo CSV iniciado!')
  }

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.whatsapp.includes(search)
    const matchesRejeitado = selectedStatus === 'REJEITADO' ? c.status === 'REJEITADO' : c.status !== 'REJEITADO'
    return matchesSearch && matchesRejeitado
  })

  const totalContatados = filteredCandidates.filter(c => c.whatsappContactedAt).length
  const totalFaltam = filteredCandidates.length - totalContatados

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Candidatos</h2>
          <p className="text-sm text-slate-500 mt-1">
            Visualize os interessados, gerencie etapas do processo seletivo e adicione notas internas
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Exportar para CSV/Excel</span>
          </button>
        </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col">
          <span className="text-sm font-medium text-slate-500">Total de Candidatos</span>
          <span className="text-2xl font-bold text-slate-900 mt-1">{filteredCandidates.length}</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col">
          <span className="text-sm font-medium text-amber-600">Faltam Contatar</span>
          <span className="text-2xl font-bold text-amber-600 mt-1">{totalFaltam}</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col">
          <span className="text-sm font-medium text-green-600">Já Contatados</span>
          <span className="text-2xl font-bold text-green-600 mt-1">{totalContatados}</span>
        </div>
      </div>


      {/* Barra de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Busca por Nome/WhatsApp */}
        <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nome ou telefone..."
            className="w-full text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Filtro por Oportunidade */}
        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="w-full text-sm outline-none bg-transparent text-slate-900 font-medium"
          >
            <option value="ALL">Todas as Oportunidades</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Status */}
        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full text-sm outline-none bg-transparent text-slate-900 font-medium"
          >
            <option value="ALL">Todos os Status</option>
            <option value="NOVO">Novo</option>
            <option value="EM_ANALISE">Em Análise</option>
            <option value="ENTREVISTA">Entrevista Agendada</option>
            <option value="APROVADO">Aprovado</option>
            <option value="REJEITADO">Rejeitado</option>
          </select>
        </div>
      </div>

      {/* Tabela de Candidatos */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Carregando candidatos...
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Nenhum candidato encontrado para os filtros selecionados.
        </div>
      ) : (
        <>
          {/* Lista em Cards (mobile) */}
          <div className="md:hidden space-y-3">
            {filteredCandidates.map((candidate) => (
              <div key={candidate.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{candidate.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {candidate.job.title} · {candidate.job.company}
                    </p>
                  </div>
                  <StatusBadge status={candidate.status} size="sm" />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {candidate.notes && (
                    <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md inline-flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>Com nota</span>
                    </div>
                  )}
                  {candidate.whatsappContactedAt && (
                    <div
                      className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md inline-flex items-center gap-1"
                      title={`Último contato: ${formatDate(candidate.whatsappContactedAt)}`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Contatado em {formatDate(candidate.whatsappContactedAt)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-mono text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{maskPhone(candidate.whatsapp)}</span>
                      <button
                        onClick={() => handleCopyPhone(candidate.whatsapp, candidate.id)}
                        className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                        title="Copiar telefone completo e marcar como contatado"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                  </div>
                  <span>{formatDate(candidate.createdAt)}</span>
                </div>

                <select
                  value={candidate.status}
                  onChange={(e) =>
                    handleInlineStatusChange(candidate.id, e.target.value as CandidateStatusType)
                  }
                  className="w-full text-xs font-semibold rounded-lg border border-slate-200 px-2.5 py-2 bg-slate-50 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="NOVO">Novo</option>
                  <option value="EM_ANALISE">Em Análise</option>
                  <option value="ENTREVISTA">Entrevista Agendada</option>
                  <option value="APROVADO">Aprovado</option>
                  <option value="REJEITADO">Rejeitado</option>
                </select>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={getWhatsAppLink(
                      candidate.whatsapp,
                      getWhatsAppMessage(candidate)
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleWhatsAppClick(candidate.id)}
                    title={
                      candidate.whatsappContactedAt
                        ? `Último contato: ${formatDate(candidate.whatsappContactedAt)}`
                        : 'Conversar no WhatsApp'
                    }
                    className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-lg transition-colors ${
                      candidate.whatsappContactedAt
                        ? 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {candidate.whatsappContactedAt ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                    <span>{candidate.whatsappContactedAt ? 'Contatado' : 'WhatsApp'}</span>
                  </a>
                  <button
                    onClick={() => setActiveModalCandidate(candidate)}
                    className="p-2.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors border border-slate-200"
                    title="Ver / Notas"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCandidate(candidate.id)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                    title="Excluir candidato"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tabela (tablet/desktop) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Candidato</th>
                    <th className="px-6 py-4">WhatsApp / DDD</th>
                    <th className="px-6 py-4">Oportunidade de Interesse</th>
                    <th className="px-6 py-4">Status Atual</th>
                    <th className="px-6 py-4">Data Inscrição</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div>{candidate.name}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.notes && (
                            <div className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>Com nota</span>
                            </div>
                          )}
                          {candidate.whatsappContactedAt && (
                            <div
                              className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-md mt-1 inline-flex items-center gap-1"
                              title={`Último contato: ${formatDate(candidate.whatsappContactedAt)}`}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Contatado</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-brand-600" />
                            <span>{maskPhone(candidate.whatsapp)}</span>
                            <button
                              onClick={() => handleCopyPhone(candidate.whatsapp, candidate.id)}
                              className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                              title="Copiar telefone completo e marcar como contatado"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{candidate.job.title}</div>
                        <div className="text-xs text-slate-500">{candidate.job.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={candidate.status}
                          onChange={(e) =>
                            handleInlineStatusChange(candidate.id, e.target.value as CandidateStatusType)
                          }
                          className="text-xs font-semibold rounded-lg border border-slate-200 px-2.5 py-1.5 bg-slate-50 focus:ring-2 focus:ring-brand-500 cursor-pointer"
                        >
                          <option value="NOVO">Novo</option>
                          <option value="EM_ANALISE">Em Análise</option>
                          <option value="ENTREVISTA">Entrevista Agendada</option>
                          <option value="APROVADO">Aprovado</option>
                          <option value="REJEITADO">Rejeitado</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                        {formatDate(candidate.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <a
                          href={getWhatsAppLink(
                            candidate.whatsapp,
                            getWhatsAppMessage(candidate)
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleWhatsAppClick(candidate.id)}
                          className={`p-2 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium border ${
                            candidate.whatsappContactedAt
                              ? 'text-green-700 bg-green-50 border-green-300 hover:bg-green-100'
                              : 'text-green-600 hover:text-white hover:bg-green-600 border-green-200 hover:border-green-600'
                          }`}
                          title={
                            candidate.whatsappContactedAt
                              ? `Último contato: ${formatDate(candidate.whatsappContactedAt)}`
                              : 'Conversar no WhatsApp'
                          }
                        >
                          {candidate.whatsappContactedAt ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <MessageCircle className="w-4 h-4" />
                          )}
                          <span>{candidate.whatsappContactedAt ? 'Contatado' : 'WhatsApp'}</span>
                        </a>
                        <button
                          onClick={() => setActiveModalCandidate(candidate)}
                          className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver / Notas</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCandidate(candidate.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                          title="Excluir candidato"
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
        </>
      )}

      {/* Modal de Notas e Detalhes */}
      <CandidateModal
        candidate={activeModalCandidate}
        whatsappTemplates={whatsappTemplates}
        onClose={() => setActiveModalCandidate(null)}
        onUpdate={(updatedCandidate) => {
          setCandidates((prev) =>
            prev.map((c) => (c.id === updatedCandidate.id ? updatedCandidate : c))
          )
        }}
      />
    </div>
  )
}
