'use client'

import { useState } from 'react'
import { MapPin, Briefcase, DollarSign, ArrowRight, ShieldCheck, Clock, AlertTriangle, Gift, ChevronDown, Quote, Star } from 'lucide-react'
import { CandidateFormModal } from './CandidateFormModal'
import { fillTemplate, type LandingContentData } from '@/lib/landing-content'

interface JobData {
  id: string
  title: string
  company: string
  location: string
  type: string
  description: string
  requirements: string
  salary?: string | null
  benefits?: string | null
  active: boolean
}

export function PublicLandingCLT({ job, content }: { job: JobData; content: LandingContentData }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const vars = { empresa: job.company, cargo: job.title }
  const t = (value: string | null | undefined, fallback: string) => fillTemplate(value, vars) || fallback

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white">
      {/* Faixa de acento no topo, ecoando o gradiente do ícone da marca */}
      <div className="h-1 w-full bg-gradient-to-r from-sunset-400 via-brand-600 to-sunset-900 shrink-0" />

      {/* Top Banner / Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-hd.png" alt="HD Serviços" className="h-8 w-auto" />
            <span className="hidden sm:inline font-semibold text-slate-400 text-sm border-l border-slate-700 pl-3">{job.company}</span>
          </div>

          {job.active && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-brand-600/20"
            >
              {t(content.ctaHeaderLabel, 'Quero me candidatar')}
            </button>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full flex-1 space-y-8">
        {!job.active ? (
          /* Estado da Oportunidade Encerrada */
          <div className="bg-slate-900/80 border border-slate-800 p-8 sm:p-12 rounded-3xl text-center space-y-4 max-w-xl mx-auto my-12 shadow-2xl">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">{t(content.closedTitle, 'Oportunidade Encerrada')}</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t(content.closedMessage, `As candidaturas para a oportunidade de ${job.title} na empresa ${job.company} foram encerradas.`)}
            </p>
            <p className="text-xs text-slate-500 pt-2">
              {t(content.closedFooterNote, 'Agradecemos o interesse. Fique atento a novas oportunidades em nossos canais de recrutamento.')}
            </p>
          </div>
        ) : (
          /* Oportunidade Ativa */
          <>
            {/* Card de Apresentação Principal */}
            <div className="bg-slate-900/70 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-sunset-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="space-y-3 relative">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    <Briefcase className="w-3.5 h-3.5" />
                    {job.type}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                  {job.salary && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <DollarSign className="w-3.5 h-3.5" />
                      {job.salary}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {job.title}
                </h1>
                <p className="text-slate-400 text-sm font-medium">
                  {t(content.heroSubtitle, `Oportunidade CLT aberta em ${job.company}`)}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span>{t(content.safetyNote, 'Processo seletivo seguro e direto com o RH')}</span>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 text-base group"
                >
                  <span>{t(content.ctaPrimaryLabel, 'Quero me candidatar')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Descrição, Requisitos e Benefícios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              {/* Coluna Principal (2/3) */}
              <div className="md:col-span-2 space-y-8">
                {/* Sobre a oportunidade */}
                <section className="bg-slate-900/50 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                    {t(content.sectionSobreTitle, 'Sobre a Oportunidade')}
                  </h2>
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {job.description}
                  </div>
                </section>

                {/* Requisitos */}
                <section className="bg-slate-900/50 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                    {t(content.sectionRequisitosTitle, 'Requisitos e Desejáveis')}
                  </h2>
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </div>
                </section>

                {/* Benefícios */}
                {job.benefits && (
                  <section className="bg-slate-900/50 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Gift className="w-4 h-4 text-sunset-400" />
                      {t(content.sectionBeneficiosTitle, 'Benefícios Oferecidos')}
                    </h2>
                    <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                      {job.benefits}
                    </div>
                  </section>
                )}

                {/* Depoimentos (opcional, editável pelo admin) */}
                {content.testimonials.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-500" />
                      {t(content.depoimentosTitle, 'O que dizem nossos colaboradores')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {content.testimonials.map((d) => (
                        <div key={d.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-2">
                          <Quote className="w-4 h-4 text-brand-400" />
                          <p className="text-sm text-slate-300 leading-relaxed">"{d.text}"</p>
                          <div className="flex items-center gap-1 pt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <p className="text-xs font-semibold text-white">{d.name} <span className="text-slate-500 font-normal">— {d.role}</span></p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* FAQ (opcional, editável pelo admin) */}
                {content.faqs.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-500" />
                      {t(content.faqTitle, 'Perguntas Frequentes')}
                    </h2>
                    <div className="space-y-2">
                      {content.faqs.map((f) => (
                        <details key={f.id} className="group bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                          <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer font-semibold text-sm text-white list-none">
                            <span>{f.question}</span>
                            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed">
                            {f.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar Lateral (1/3) */}
              <div className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl space-y-4">
                  <h3 className="font-bold text-white text-sm">{t(content.resumoTitle, 'Resumo da Oportunidade')}</h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Modelo</span>
                      <span className="font-semibold text-slate-200 text-sm">{job.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Localização</span>
                      <span className="font-semibold text-slate-200 text-sm">{job.location}</span>
                    </div>
                    {job.salary && (
                      <div>
                        <span className="text-slate-500 block">Remuneração</span>
                        <span className="font-semibold text-brand-400 text-sm">{job.salary}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500 block">Empresa</span>
                      <span className="font-semibold text-slate-200 text-sm">{job.company}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 px-4 rounded-xl transition-all text-xs text-center shadow-md"
                  >
                    {t(content.ctaSecondaryLabel, 'Enviar Currículo / WhatsApp')}
                  </button>
                </div>

                {(content.responseTimeTitle || content.responseTimeText) && (
                  <div className="p-4 bg-brand-950/40 border border-brand-800/50 rounded-2xl text-xs text-brand-300/90 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-brand-300">
                      <Clock className="w-4 h-4 text-brand-400" />
                      <span>{t(content.responseTimeTitle, 'Retorno Rápido')}</span>
                    </div>
                    <p className="leading-normal">
                      {t(content.responseTimeText, 'Nossa equipe avalia todas as candidaturas e entra em contato via WhatsApp em até 24 horas úteis.')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-2">
          <img src="/logo-hd.png" alt="HD Serviços" className="h-5 w-auto opacity-60" />
          <p>© 2026 {job.company}. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Barra Fixa Mobile CTA */}
      {job.active && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 z-40">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-brand-600 active:scale-95 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
          >
            <span>{t(content.ctaPrimaryLabel, 'Quero me candidatar')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal de Formulário */}
      <CandidateFormModal
        jobId={job.id}
        jobTitle={job.title}
        company={job.company}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
