'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, Info, Eye, Briefcase, HardHat } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import { ListEditor } from './ListEditor'

type Category = 'CLT' | 'PRESTADOR'

interface FeatureDraft { title: string; description: string }
interface TestimonialDraft { name: string; role: string; text: string }
interface FaqDraft { question: string; answer: string }

interface ContentDraft {
  heroTitle: string
  heroSubtitle: string
  heroBadgeLabel: string
  trustBadge1: string
  trustBadge2: string
  ctaHeaderLabel: string
  ctaPrimaryLabel: string
  ctaSecondaryLabel: string
  sectionSobreTitle: string
  sectionRequisitosTitle: string
  sectionBeneficiosTitle: string
  resumoTitle: string
  sobreTitle: string
  preRequisitosTitle: string
  vantagensTitle: string
  comoFuncionaTitle: string
  depoimentosTitle: string
  faqTitle: string
  safetyNote: string
  responseTimeTitle: string
  responseTimeText: string
  ctaFinalTitle: string
  ctaFinalSubtitle: string
  whatsappMessageTemplate: string
  closedTitle: string
  closedMessage: string
  closedFooterNote: string
  features: FeatureDraft[]
  steps: FeatureDraft[]
  testimonials: TestimonialDraft[]
  faqs: FaqDraft[]
}

const EMPTY_DRAFT: ContentDraft = {
  heroTitle: '', heroSubtitle: '', heroBadgeLabel: '', trustBadge1: '', trustBadge2: '',
  ctaHeaderLabel: '', ctaPrimaryLabel: '', ctaSecondaryLabel: '',
  sectionSobreTitle: '', sectionRequisitosTitle: '', sectionBeneficiosTitle: '', resumoTitle: '',
  sobreTitle: '', preRequisitosTitle: '', vantagensTitle: '', comoFuncionaTitle: '',
  depoimentosTitle: '', faqTitle: '', safetyNote: '', responseTimeTitle: '', responseTimeText: '',
  ctaFinalTitle: '', ctaFinalSubtitle: '', whatsappMessageTemplate: '', closedTitle: '', closedMessage: '', closedFooterNote: '',
  features: [], steps: [], testimonials: [], faqs: [],
}

function toDraft(raw: any): ContentDraft {
  const draft = { ...EMPTY_DRAFT }
  for (const key of Object.keys(draft) as (keyof ContentDraft)[]) {
    if (key === 'features' || key === 'steps' || key === 'testimonials' || key === 'faqs') continue
    ;(draft as any)[key] = raw?.[key] ?? ''
  }
  draft.features = (raw?.features ?? []).map((f: any) => ({ title: f.title, description: f.description }))
  draft.steps = (raw?.steps ?? []).map((s: any) => ({ title: s.title, description: s.description }))
  draft.testimonials = (raw?.testimonials ?? []).map((t: any) => ({ name: t.name, role: t.role, text: t.text }))
  draft.faqs = (raw?.faqs ?? []).map((f: any) => ({ question: f.question, answer: f.answer }))
  return draft
}

function PlaceholderHint() {
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
      <Info className="w-3 h-3 shrink-0" />
      Use <code className="bg-slate-100 px-1 rounded">{'{empresa}'}</code> e <code className="bg-slate-100 px-1 rounded">{'{cargo}'}</code> para inserir dinamicamente os dados da oportunidade.
    </p>
  )
}

export function LandingContentEditor() {
  const { showToast } = useToast()
  const [category, setCategory] = useState<Category>('CLT')
  const [draft, setDraft] = useState<ContentDraft>(EMPTY_DRAFT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/landing-content/${category}`)
      .then((res) => res.json())
      .then((data) => setDraft(toDraft(data)))
      .catch(() => showToast('Erro ao carregar conteúdo', 'error'))
      .finally(() => setLoading(false))
  }, [category])

  const set = <K extends keyof ContentDraft>(key: K, value: ContentDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/landing-content/${category}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao salvar conteúdo')
      setDraft(toDraft(data))
      showToast('Conteúdo da landing page atualizado com sucesso!')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Conteúdo das Landing Pages</h2>
          <p className="text-sm text-slate-500 mt-1">
            Edite textos, botões, perguntas frequentes e depoimentos exibidos nas páginas públicas
          </p>
        </div>
      </div>

      {/* Abas de categoria */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setCategory('CLT')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            category === 'CLT' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Funcionário (CLT)
        </button>
        <button
          onClick={() => setCategory('PRESTADOR')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
            category === 'PRESTADOR' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <HardHat className="w-4 h-4" />
          Prestador de Serviço
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Carregando conteúdo...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hero (somente Prestador tem título/subtítulo de marketing dedicados) */}
          {category === 'PRESTADOR' && (
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Cabeçalho Principal (Hero)</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Título Principal</label>
                <input value={draft.heroTitle} onChange={(e) => set('heroTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                <PlaceholderHint />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subtítulo</label>
                <textarea rows={2} value={draft.heroSubtitle} onChange={(e) => set('heroSubtitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900 resize-y" />
                <PlaceholderHint />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Selo de Pagamento</label>
                  <input value={draft.heroBadgeLabel} onChange={(e) => set('heroBadgeLabel', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Selo de Confiança 1</label>
                  <input value={draft.trustBadge1} onChange={(e) => set('trustBadge1', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Selo de Confiança 2</label>
                  <input value={draft.trustBadge2} onChange={(e) => set('trustBadge2', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
              </div>
            </section>
          )}

          {category === 'CLT' && (
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Cabeçalho Principal</h3>
              <p className="text-xs text-slate-400">O título principal desta página usa sempre o nome da oportunidade cadastrada. Aqui você edita apenas o texto de apoio.</p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subtítulo (abaixo do título)</label>
                <input value={draft.heroSubtitle} onChange={(e) => set('heroSubtitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                <PlaceholderHint />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Aviso de segurança (ícone de escudo)</label>
                <input value={draft.safetyNote} onChange={(e) => set('safetyNote', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
              </div>
            </section>
          )}

          {/* Botões */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Botões (Chamadas para Ação)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Botão do Cabeçalho</label>
                <input value={draft.ctaHeaderLabel} onChange={(e) => set('ctaHeaderLabel', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Botão Principal</label>
                <input value={draft.ctaPrimaryLabel} onChange={(e) => set('ctaPrimaryLabel', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {category === 'CLT' ? 'Botão da Lateral' : 'Botão Final da Página'}
                </label>
                <input value={draft.ctaSecondaryLabel} onChange={(e) => set('ctaSecondaryLabel', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
              </div>
            </div>
          </section>

          {/* Seções - CLT */}
          {category === 'CLT' && (
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Títulos das Seções</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Seção "Sobre"</label>
                  <input value={draft.sectionSobreTitle} onChange={(e) => set('sectionSobreTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Seção "Requisitos"</label>
                  <input value={draft.sectionRequisitosTitle} onChange={(e) => set('sectionRequisitosTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Seção "Benefícios"</label>
                  <input value={draft.sectionBeneficiosTitle} onChange={(e) => set('sectionBeneficiosTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Caixa "Resumo"</label>
                  <input value={draft.resumoTitle} onChange={(e) => set('resumoTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Título da caixa "Retorno Rápido"</label>
                  <input value={draft.responseTimeTitle} onChange={(e) => set('responseTimeTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Texto da caixa "Retorno Rápido"</label>
                  <input value={draft.responseTimeText} onChange={(e) => set('responseTimeText', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
              </div>
            </section>
          )}

          {/* Seções - Prestador */}
          {category === 'PRESTADOR' && (
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Títulos das Seções</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Seção "Vantagens"</label>
                  <input value={draft.vantagensTitle} onChange={(e) => set('vantagensTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Seção "Como Funciona"</label>
                  <input value={draft.comoFuncionaTitle} onChange={(e) => set('comoFuncionaTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Seção "Sobre a Rotina"</label>
                  <input value={draft.sobreTitle} onChange={(e) => set('sobreTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Seção "Pré-requisitos"</label>
                  <input value={draft.preRequisitosTitle} onChange={(e) => set('preRequisitosTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider pt-2">Chamada Final da Página</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Título</label>
                  <input value={draft.ctaFinalTitle} onChange={(e) => set('ctaFinalTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subtítulo</label>
                  <input value={draft.ctaFinalSubtitle} onChange={(e) => set('ctaFinalSubtitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
                  <PlaceholderHint />
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Vantagens (cards com ícone)</h4>
                <ListEditor
                  items={draft.features}
                  onChange={(items) => set('features', items)}
                  fields={[
                    { key: 'title', label: 'Título' },
                    { key: 'description', label: 'Descrição', multiline: true },
                  ]}
                  emptyItem={{ title: '', description: '' }}
                  addLabel="Adicionar vantagem"
                  emptyMessage="Nenhuma vantagem cadastrada — esta seção não aparecerá na página."
                />
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-semibold text-slate-700 mb-2">Passos (Como Funciona)</h4>
                <ListEditor
                  items={draft.steps}
                  onChange={(items) => set('steps', items)}
                  fields={[
                    { key: 'title', label: 'Título' },
                    { key: 'description', label: 'Descrição', multiline: true },
                  ]}
                  emptyItem={{ title: '', description: '' }}
                  addLabel="Adicionar passo"
                  emptyMessage="Nenhum passo cadastrado — esta seção não aparecerá na página."
                />
              </div>
            </section>
          )}

          {/* Depoimentos - ambas categorias */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Depoimentos</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Título da Seção</label>
              <input value={draft.depoimentosTitle} onChange={(e) => set('depoimentosTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
            </div>
            <ListEditor
              items={draft.testimonials}
              onChange={(items) => set('testimonials', items)}
              fields={[
                { key: 'name', label: 'Nome' },
                { key: 'role', label: 'Cargo / Papel' },
                { key: 'text', label: 'Depoimento', multiline: true },
              ]}
              emptyItem={{ name: '', role: '', text: '' }}
              addLabel="Adicionar depoimento"
              emptyMessage="Nenhum depoimento cadastrado — esta seção não aparecerá na página."
            />
          </section>

          {/* FAQ - ambas categorias */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Perguntas Frequentes (FAQ)</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Título da Seção</label>
              <input value={draft.faqTitle} onChange={(e) => set('faqTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
            </div>
            <ListEditor
              items={draft.faqs}
              onChange={(items) => set('faqs', items)}
              fields={[
                { key: 'question', label: 'Pergunta' },
                { key: 'answer', label: 'Resposta', multiline: true },
              ]}
              emptyItem={{ question: '', answer: '' }}
              addLabel="Adicionar pergunta"
              emptyMessage="Nenhuma pergunta cadastrada — esta seção não aparecerá na página."
            />
          </section>

          {/* Mensagem de WhatsApp enviada pelo recrutador (painel admin, não a página pública) */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Mensagem de WhatsApp do Recrutador</h3>
              <p className="text-xs text-slate-500 mt-1">
                Texto usado quando um recrutador clica no botão de WhatsApp em Candidatos para chamar esta oportunidade
                ({category === 'CLT' ? 'Funcionário CLT' : 'Prestador de Serviço'}). Não aparece na landing page pública.
              </p>
            </div>
            <div>
              <textarea
                rows={5}
                value={draft.whatsappMessageTemplate}
                onChange={(e) => set('whatsappMessageTemplate', e.target.value)}
                placeholder={'Olá {nome}, tudo bem?\n\nVi seu interesse na oportunidade de {cargo} aqui na {empresa}...'}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900 resize-y font-mono"
              />
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <Info className="w-3 h-3 shrink-0" />
                Use <code className="bg-slate-100 px-1 rounded">{'{nome}'}</code>, <code className="bg-slate-100 px-1 rounded">{'{cargo}'}</code> e{' '}
                <code className="bg-slate-100 px-1 rounded">{'{empresa}'}</code> para inserir dinamicamente o primeiro nome do candidato, o título da vaga e a empresa. Deixe em branco para usar a mensagem padrão do sistema.
              </p>
            </div>
          </section>

          {/* Estado Encerrado */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Quando a Oportunidade está Encerrada</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Título</label>
                <input value={draft.closedTitle} onChange={(e) => set('closedTitle', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nota de rodapé</label>
                <input value={draft.closedFooterNote} onChange={(e) => set('closedFooterNote', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mensagem principal</label>
              <textarea rows={2} value={draft.closedMessage} onChange={(e) => set('closedMessage', e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 focus:bg-white text-slate-900 resize-y" />
              <PlaceholderHint />
            </div>
          </section>

          {/* Salvar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky bottom-4">
            <a
              href={category === 'CLT'
                ? '/oportunidade/desenvolvedor-frontend-react-nextjs-sp-01'
                : '/oportunidade/operador-de-pavilhao-logistico-guarulhos-03'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Ver exemplo desta categoria
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm disabled:opacity-70"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Conteúdo</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
