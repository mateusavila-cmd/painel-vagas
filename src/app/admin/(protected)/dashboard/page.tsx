import Link from 'next/link'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { Briefcase, Users, CheckCircle, TrendingUp, Plus, ArrowRight, ExternalLink, Clock } from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) return null

  // Filtros por Nível de Acesso (ADMIN x RECRUITER)
  const jobWhere: any = {}
  if (user.role === 'RECRUITER') {
    jobWhere.OR = [
      { createdById: user.id },
      { assignedUsers: { some: { id: user.id } } },
    ]
  }

  const [totalJobs, activeJobsCount, pendingJobsCount, totalCandidatesCount, recentCandidates, activeJobs] = await Promise.all([
    db.job.count({ where: jobWhere }),
    db.job.count({ where: { ...jobWhere, active: true } }),
    db.job.count({ where: { ...jobWhere, approvalStatus: 'PENDENTE' } }),
    db.candidate.count({
      where: user.role === 'RECRUITER' ? { job: jobWhere } : undefined,
    }),
    db.candidate.findMany({
      where: user.role === 'RECRUITER' ? { job: jobWhere } : undefined,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { job: { select: { title: true, company: true } } },
    }),
    db.job.findMany({
      where: { ...jobWhere, active: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { candidates: true } } },
    }),
  ])

  const avgCandidatesPerJob = totalJobs > 0 ? (totalCandidatesCount / totalJobs).toFixed(1) : '0'

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Visão Geral do RH</h2>
          <p className="text-sm text-slate-500 mt-1">
            Acompanhe o desempenho das suas oportunidades e o fluxo de interessados
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

      {/* Cards de Métricas */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 ${(user.role === 'ADMIN' || pendingJobsCount > 0) ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        {(user.role === 'ADMIN' || pendingJobsCount > 0) && (
          <Link
            href="/admin/vagas"
            className={`p-6 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors ${
              pendingJobsCount > 0
                ? 'bg-amber-50 border-amber-200 hover:bg-amber-100'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="p-3.5 bg-amber-100 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pendentes de Aprovação</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{pendingJobsCount}</h3>
            </div>
          </Link>
        )}

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-brand-50 text-brand-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Oportunidades Ativas</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{activeJobsCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Candidatos</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalCandidatesCount}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Oportunidades</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalJobs}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Média p/ Oportunidade</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{avgCandidatesPerJob}</h3>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Oportunidades Ativas Recentes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base">Oportunidades Ativas em Destaque</h3>
            <Link href="/admin/vagas" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeJobs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Nenhuma oportunidade ativa no momento.</div>
          ) : (
            <div className="space-y-3">
              {activeJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-slate-900 text-sm truncate">{job.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{job.company} • {job.location}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full">
                      {job._count.candidates} inscritos
                    </span>
                    <a
                      href={`/oportunidade/${job.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
                      title="Ver Landing Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimas Candidaturas Recebidas */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base">Últimos Candidatos</h3>
            <Link href="/admin/candidatos" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Ver lista completa <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentCandidates.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Nenhum candidato cadastrado ainda.</div>
          ) : (
            <div className="space-y-3">
              {recentCandidates.map((candidate) => (
                <div key={candidate.id} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">{candidate.name}</h4>
                      <StatusBadge status={candidate.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Oportunidade: <span className="font-medium text-slate-700">{candidate.job.title}</span> • {formatDate(candidate.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
