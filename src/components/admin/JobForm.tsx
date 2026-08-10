'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Loader2, Briefcase, HardHat, Clock } from 'lucide-react'
import Link from 'next/link'
import { StatusBadge } from './StatusBadge'

interface Recruiter {
  id: string
  name: string
  email: string
}

type Category = 'CLT' | 'PRESTADOR'

const TYPE_OPTIONS: Record<Category, string[]> = {
  CLT: ['CLT', 'Temporário', 'Estágio'],
  PRESTADOR: ['Diária', 'Freelance', 'PJ'],
}

interface JobFormProps {
  initialData?: {
    id?: string
    title: string
    company: string
    location: string
    type: string
    category?: string
    description: string
    requirements: string
    salary?: string | null
    benefits?: string | null
    active: boolean
    approvalStatus?: string
    assignedUserIds?: string[]
  }
  recruiters?: Recruiter[]
  isEditing?: boolean
  isAdmin?: boolean
}

export function JobForm({ initialData, recruiters = [], isEditing = false, isAdmin = false }: JobFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [title, setTitle] = useState(initialData?.title || '')
  const [company, setCompany] = useState(initialData?.company || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [category, setCategory] = useState<Category>((initialData?.category as Category) || 'CLT')
  const [type, setType] = useState(initialData?.type || 'CLT')
  const [description, setDescription] = useState(initialData?.description || '')
  const [requirements, setRequirements] = useState(initialData?.requirements || '')
  const [salary, setSalary] = useState(initialData?.salary || '')
  const [benefits, setBenefits] = useState(initialData?.benefits || '')
  const [active, setActive] = useState(initialData?.active !== undefined ? initialData.active : true)
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(initialData?.assignedUserIds || [])

  const handleCategoryChange = (next: Category) => {
    setCategory(next)
    // Ajusta o tipo automaticamente para a primeira opção compatível com a nova categoria
    if (!TYPE_OPTIONS[next].includes(type)) {
      setType(TYPE_OPTIONS[next][0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isEditing ? `/api/vagas/${initialData?.id}` : '/api/vagas'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          company,
          location,
          type,
          category,
          description,
          requirements,
          salary,
          benefits: category === 'CLT' ? benefits : '',
          active,
          assignedUserIds,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar oportunidade')
      }

      router.push('/admin/vagas')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleRecruiter = (recruiterId: string) => {
    setAssignedUserIds((prev) =>
      prev.includes(recruiterId)
        ? prev.filter((id) => id !== recruiterId)
        : [...prev, recruiterId]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/vagas"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-xl font-bold text-slate-900">
            {isEditing ? 'Editar Oportunidade' : 'Criar Nova Oportunidade'}
          </h2>
        </div>
        {isEditing && initialData?.approvalStatus && initialData.approvalStatus !== 'APROVADA' && (
          <StatusBadge status={initialData.approvalStatus} />
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {!isAdmin && (!isEditing || initialData?.approvalStatus === 'REJEITADA') && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            {initialData?.approvalStatus === 'REJEITADA'
              ? 'Esta oportunidade foi rejeitada. Ao salvar, ela voltará para a fila de aprovação de um administrador.'
              : 'Esta oportunidade ficará pendente até que um administrador aprove a publicação. Ela não ficará visível na landing page pública até lá.'}
          </p>
        </div>
      )}

      {/* Seletor de Categoria - define qual landing page pública será exibida */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Categoria da Oportunidade *
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleCategoryChange('CLT')}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              category === 'CLT'
                ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }`}
          >
            <Briefcase className={`w-5 h-5 mt-0.5 shrink-0 ${category === 'CLT' ? 'text-brand-600' : 'text-slate-400'}`} />
            <div>
              <p className="text-sm font-bold text-slate-900">Funcionário (CLT)</p>
              <p className="text-xs text-slate-500 mt-0.5">Landing page formal com faixa salarial e benefícios</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleCategoryChange('PRESTADOR')}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
              category === 'PRESTADOR'
                ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }`}
          >
            <HardHat className={`w-5 h-5 mt-0.5 shrink-0 ${category === 'PRESTADOR' ? 'text-brand-600' : 'text-slate-400'}`} />
            <div>
              <p className="text-sm font-bold text-slate-900">Prestador de Serviço / Freelancer</p>
              <p className="text-xs text-slate-500 mt-0.5">Landing page de cadastro para diárias, sem vínculo CLT</p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Título da Oportunidade *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={category === 'CLT' ? 'ex: Desenvolvedor Frontend React' : 'ex: Operador de Pavilhão Logístico'}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Empresa / Cliente *
          </label>
          <input
            type="text"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="ex: Tech Solutions Brasil"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Localização *
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="ex: Remoto ou São Paulo - SP"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            {category === 'CLT' ? 'Tipo de Contratação *' : 'Modalidade *'}
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900"
          >
            {TYPE_OPTIONS[category].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className={category === 'CLT' ? '' : 'md:col-span-2'}>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            {category === 'CLT' ? 'Salário / Faixa Salarial (Opcional)' : 'Valor de Referência por Diária (Opcional)'}
          </label>
          <input
            type="text"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder={category === 'CLT' ? 'ex: R$ 5.000,00 - R$ 7.000,00 ou A combinar' : 'ex: R$ 150,00 - R$ 200,00 por diária'}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900"
          />
        </div>

        {category === 'CLT' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Benefícios (Opcional)
            </label>
            <input
              type="text"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="ex: Vale-refeição, Vale-transporte, Plano de saúde"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900"
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            {category === 'CLT' ? 'Descrição da Oportunidade *' : 'Descrição da Rotina Operacional *'}
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva as principais atribuições e o dia a dia da posição..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900 resize-y"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            {category === 'CLT' ? 'Requisitos e Qualificações *' : 'Pré-requisitos para Ativação do Cadastro *'}
          </label>
          <textarea
            required
            rows={4}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder={category === 'CLT'
              ? 'Liste os conhecimentos técnicos e experiências necessárias...'
              : 'ex: Maior de 18 anos\nDocumentos pessoais em dia\nDisponibilidade para rotinas operacionais'}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900 resize-y"
          />
        </div>

        {recruiters.length > 0 && (
          <div className="md:col-span-2 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Recrutadores Atribuídos (Acesso aos Candidatos)
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {recruiters.map((r) => {
                const isSelected = assignedUserIds.includes(r.id)
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleRecruiter(r.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 text-brand-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {r.name} ({r.email})
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="md:col-span-2 flex items-center gap-3 pt-2">
          <input
            type="checkbox"
            id="active-toggle"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
          />
          <label htmlFor="active-toggle" className="text-sm font-medium text-slate-700 cursor-pointer">
            Oportunidade Ativa (Exibir na Landing Page Pública)
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
        <Link
          href="/admin/vagas"
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Atualizar Oportunidade' : 'Criar Oportunidade'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
