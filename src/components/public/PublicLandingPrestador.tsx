'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Sora } from 'next/font/google'
import {
  MapPin,
  ArrowRight,
  AlertTriangle,
  Wallet,
  CalendarCheck,
  Building2,
  Handshake,
  MessageCircle,
  CheckCircle2,
  Quote,
  Star,
  ChevronDown,
  Zap,
  ClipboardList,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Banknote,
  User,
  BadgeCheck,
} from 'lucide-react'
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
  active: boolean
}

/* Tipografia de display (Sora) — injetada como variável CSS para uso seletivo
   em títulos e CTAs, mantendo Inter como fonte de leitura corrente. */
const sora = Sora({ subsets: ['latin'], variable: '--font-display', display: 'swap' })

/* Ícones fixos por posição para as Vantagens (1º a 4º item cadastrado) */
const VANTAGEM_ICONS = [Wallet, CalendarCheck, Building2, Handshake]

/* Acentos por posição para os cards de Vantagens (borda + glow colorido no hover) */
const VANTAGEM_CARD_ACCENTS = [
  'hover:border-sky-400/50 hover:shadow-[0_22px_60px_-14px_rgba(56,189,248,0.4)]',
  'hover:border-violet-400/50 hover:shadow-[0_22px_60px_-14px_rgba(167,139,250,0.4)]',
  'hover:border-emerald-400/50 hover:shadow-[0_22px_60px_-14px_rgba(52,211,153,0.4)]',
  'hover:border-amber-400/50 hover:shadow-[0_22px_60px_-14px_rgba(251,191,36,0.4)]',
]

/* Tiles de ícone em gradiente glass, com glow no hover do card */
const VANTAGEM_ICON_ACCENTS = [
  'bg-gradient-to-br from-sky-400/25 to-sky-400/5 text-sky-300 ring-sky-400/30 group-hover:shadow-[0_0_28px_-2px_rgba(56,189,248,0.55)]',
  'bg-gradient-to-br from-violet-400/25 to-violet-400/5 text-violet-300 ring-violet-400/30 group-hover:shadow-[0_0_28px_-2px_rgba(167,139,250,0.55)]',
  'bg-gradient-to-br from-emerald-400/25 to-emerald-400/5 text-emerald-300 ring-emerald-400/30 group-hover:shadow-[0_0_28px_-2px_rgba(52,211,153,0.55)]',
  'bg-gradient-to-br from-amber-400/25 to-amber-400/5 text-amber-300 ring-amber-400/30 group-hover:shadow-[0_0_28px_-2px_rgba(251,191,36,0.55)]',
]

/* Orbe de luz revelado no canto do card durante o hover (mesma ordem dos acentos) */
const VANTAGEM_ORB_ACCENTS = ['bg-sky-400/25', 'bg-violet-400/25', 'bg-emerald-400/25', 'bg-amber-400/25']

/* Ícones ilustrativos fixos por posição para os passos do "Como funciona" */
const STEP_ICONS = [UserPlus, MessageCircle, Banknote]

/* Cor de acento do ícone de cada passo (ciclo âmbar → azul → esmeralda) */
const STEP_ICON_ACCENTS = [
  'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.55)]',
  'text-sky-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.55)]',
  'text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.55)]',
]

/* Estilo compartilhado dos CTAs principais (âmbar fundido, glow pulsante e sheen) */
const PRIMARY_CTA_CLASSES =
  'group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 px-8 py-4 font-display text-base font-extrabold tracking-tight text-slate-950 shadow-cta animate-cta-glow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cta-lg hover:brightness-110 active:translate-y-0 active:scale-[0.98] sm:w-auto'

function formatRequisitos(raw: string): string[] {
  return raw
    .split('\n')
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
}

/* Scroll-reveal: observa a entrada do elemento na viewport e aplica a classe
   de visibilidade uma única vez (animação 100% em CSS, JS apenas no gatilho). */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'reveal-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

/* Ornamento decorativo dos títulos de seção (hairlines + losango luminoso) */
function SectionOrnament() {
  return (
    <div aria-hidden className="mt-5 flex items-center justify-center gap-2.5">
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400/70 sm:w-16" />
      <span className="h-1.5 w-1.5 rotate-45 rounded-[2px] bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_0_14px_rgba(251,191,36,0.9)]" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400/70 sm:w-16" />
    </div>
  )
}

export function PublicLandingPrestador({ job, content }: { job: JobData; content: LandingContentData }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const requisitos = formatRequisitos(job.requirements)
  const vars = { empresa: job.company, cargo: job.title }
  const t = (value: string | null | undefined, fallback: string) => fillTemplate(value, vars) || fallback

  return (
    <div
      className={`${sora.variable} relative flex min-h-screen flex-col overflow-x-clip bg-slate-950 font-sans text-slate-300 selection:bg-amber-400/30 selection:text-white`}
    >
      {/* ══════════════════════════ HEADER (navbar glass sticky com hairline luminosa) ══════════════════════════ */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl">
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent" />
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <img
            src="/logo-hd.png"
            alt="HD Serviços"
            className="h-9 w-auto drop-shadow-[0_2px_12px_rgba(196,49,122,0.45)]"
          />
          {job.active && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl bg-gradient-to-b from-amber-300 to-amber-500 px-4 py-3 font-display text-xs font-bold tracking-tight text-slate-950 shadow-cta transition-all duration-300 hover:-translate-y-px hover:brightness-110 hover:shadow-[0_0_28px_rgba(251,191,36,0.55)] active:scale-95 sm:py-2.5 sm:text-sm"
            >
              {t(content.ctaHeaderLabel, 'Cadastrar meu perfil')}
            </button>
          )}
        </div>
      </header>

      {!job.active ? (
        /* ══════════════════════════ ESTADO: CADASTRO ENCERRADO ══════════════════════════ */
        <main className="relative z-10 flex flex-1 items-center justify-center bg-slate-950 px-4 py-16">
          <div className="card-sheen w-full max-w-xl space-y-4 rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-8 text-center shadow-[0_25px_80px_-20px_rgba(0,0,0,0.8)] sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/30 shadow-[0_0_35px_-5px_rgba(251,191,36,0.4)]">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">
              {t(content.closedTitle, 'Cadastro Encerrado')}
            </h1>
            <p className="text-sm leading-relaxed text-slate-400">
              {t(content.closedMessage, `As oportunidades de diária para ${job.title} na ${job.company} foram encerradas por enquanto.`)}
            </p>
            <p className="pt-2 text-xs text-slate-500">
              {t(content.closedFooterNote, 'Fique de olho em nossos canais para novas oportunidades de diária em breve.')}
            </p>
          </div>
        </main>
      ) : (
        <main className="relative z-10 flex-1 bg-slate-950">
          {/* ══════════════════════════ ATMOSFERA (auroras + grid tecnológico + grain) ══════════════════════════
              Absoluta dentro do main (mesmo contexto de composição do conteúdo): o fundo escuro
              nunca depende de um layer fixo externo, que alguns navegadores/GPUs não amostram
              corretamente por trás de seções transparentes. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            {/* Banho de luz navy no topo e sopro magenta da marca no horizonte inferior */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_90%_at_50%_-20%,rgba(30,58,138,0.42),transparent_62%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_92%_112%,rgba(195,44,148,0.14),transparent_55%)]" />
            <div className="absolute inset-0 bg-grid-tech" />

            {/* Auroras em deriva lenta (wrappers posicionais + blobs animados) */}
            <div className="absolute -top-44 left-1/2 -translate-x-1/2">
              <div className="h-[560px] w-[820px] animate-drift-a rounded-full bg-blue-600/20 blur-[110px]" />
            </div>
            <div className="absolute -left-48 top-[30%]">
              <div className="h-[460px] w-[460px] animate-drift-b rounded-full bg-indigo-600/15 blur-[100px]" />
            </div>
            <div className="absolute -right-48 top-[64%]">
              <div className="h-[480px] w-[480px] animate-drift-a rounded-full bg-brand-500/10 blur-[110px] [animation-delay:-9s]" />
            </div>

            {/* Grain cinematográfico sutil */}
            <div className="absolute inset-0 bg-noise opacity-[0.05]" />
          </div>

          {/* ══════════════════════════ HERO (spotlight, badges, headline e CTA com halo pulsante) ══════════════════════════ */}
          <section className="relative overflow-hidden">
            {/* Orbes de luz locais do hero (acompanham o scroll) */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -top-44 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-blue-600/25 blur-3xl" />
              <div className="absolute top-24 -right-28 h-80 w-80 animate-float-slow rounded-full bg-brand-500/15 blur-3xl" />
              <div className="absolute bottom-0 -left-24 h-72 w-72 animate-float-slow rounded-full bg-cyan-500/10 blur-3xl [animation-delay:-4s]" />
            </div>

            <div className="relative mx-auto max-w-4xl px-4 pb-16 pt-12 text-center sm:pb-24 sm:pt-20">
              {/* Badges de contexto (localização, pagamento, valor) */}
              <div className="flex animate-fade-up flex-wrap justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-400/10 px-3.5 py-1.5 text-xs font-semibold text-sky-300 shadow-[0_0_24px_-8px_rgba(56,189,248,0.5)] transition-transform duration-300 hover:scale-105">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-400/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300 shadow-[0_0_24px_-8px_rgba(251,191,36,0.5)] transition-transform duration-300 hover:scale-105">
                  <Wallet className="h-3.5 w-3.5" />
                  {t(content.heroBadgeLabel, 'Pagamento por diária')}
                </span>
                {job.salary && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-transform duration-300 hover:scale-105">
                    {job.salary}
                  </span>
                )}
              </div>

              {/* Headline com destaque em gradiente no nome da empresa */}
              <h1 className="mt-7 animate-fade-up font-display text-[2.5rem] font-extrabold leading-[1.06] tracking-[-0.02em] text-white text-balance [animation-delay:100ms] sm:text-5xl lg:text-6xl">
                {(() => {
                  const title = t(content.heroTitle, `Aumente sua renda prestando serviços em ${job.company}`)
                  const idx = title.indexOf(job.company)
                  if (idx === -1) return title
                  return (
                    <>
                      {title.slice(0, idx)}
                      <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(251,191,36,0.35)]">
                        {job.company}
                      </span>
                      {title.slice(idx + job.company.length)}
                    </>
                  )
                })()}
              </h1>

              <p className="mx-auto mt-5 max-w-2xl animate-fade-up text-base leading-relaxed text-slate-400 text-pretty [animation-delay:200ms] sm:text-lg">
                {t(content.heroSubtitle, `${job.title} com liberdade para escolher seus turnos. Cadastro simples, sem burocracia, com oportunidades de diária direto no seu WhatsApp.`)}
              </p>

              {/* CTA primário com halo pulsante + shimmer no hover */}
              <div className="mt-9 flex animate-fade-up flex-col items-center gap-5 [animation-delay:300ms]">
                <div className="relative w-full sm:w-auto">
                  <span aria-hidden className="absolute inset-0 animate-ping-slow rounded-2xl bg-amber-400/30 blur-md" />
                  <button onClick={() => setIsModalOpen(true)} className={PRIMARY_CTA_CLASSES}>
                    <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                    <span className="relative">{t(content.ctaPrimaryLabel, 'Quero receber diárias no WhatsApp')}</span>
                    <ArrowRight className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>

                {/* Selos de confiança em chips glass */}
                {(content.trustBadge1 || content.trustBadge2) && (
                  <div className="flex flex-wrap justify-center gap-2.5 text-xs font-medium text-slate-300">
                    {content.trustBadge1 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                        {content.trustBadge1}
                      </span>
                    )}
                    {content.trustBadge2 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-2">
                        <Zap className="h-4 w-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                        {content.trustBadge2}
                      </span>
                    )}
                  </div>
                )}

                {/* Indicador decorativo de scroll */}
                <div aria-hidden className="mt-8 flex justify-center sm:mt-10">
                  <ChevronDown className="h-5 w-5 animate-bounce text-slate-600" />
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════ VANTAGENS DO PARCEIRO (cards glass com sheen, orbe e glow por cor) ══════════════════════════ */}
          {content.features.length > 0 && (
            <section className="relative border-y border-white/[0.05] bg-slate-900/40 py-16 sm:py-20">
              <div className="mx-auto max-w-5xl px-4">
                <Reveal>
                  <h2 className="font-display text-center text-[1.7rem] font-bold leading-tight tracking-tight text-white text-balance sm:text-3xl">
                    {t(content.vantagensTitle, 'Por que se cadastrar como parceiro?')}
                  </h2>
                  <SectionOrnament />
                </Reveal>

                <div className="mt-11 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                  {content.features.map((v, i) => {
                    const Icon = VANTAGEM_ICONS[i % VANTAGEM_ICONS.length]
                    const cardAccent = VANTAGEM_CARD_ACCENTS[i % VANTAGEM_CARD_ACCENTS.length]
                    const iconAccent = VANTAGEM_ICON_ACCENTS[i % VANTAGEM_ICON_ACCENTS.length]
                    const orbAccent = VANTAGEM_ORB_ACCENTS[i % VANTAGEM_ORB_ACCENTS.length]
                    return (
                      <Reveal key={v.id} delay={i * 90} className="h-full">
                        <div
                          className={`card-sheen group relative h-full rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.06] ${cardAccent}`}
                        >
                          {/* Orbe de cor revelado no canto durante o hover */}
                          <div aria-hidden className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${orbAccent}`} />
                          {/* Linha de luz superior revelada no hover */}
                          <div aria-hidden className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                          <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ring-1 transition-all duration-500 group-hover:-rotate-6 group-hover:scale-110 ${iconAccent}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="relative mt-4 font-display text-sm font-bold tracking-tight text-white">{v.title}</h3>
                          <p className="relative mt-2 text-xs leading-relaxed text-slate-400">{v.description}</p>
                        </div>
                      </Reveal>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════ COMO FUNCIONA (timeline mobile vertical + linha conectora no desktop) ══════════════════════════ */}
          {content.steps.length > 0 && (
            <section className="relative py-16 sm:py-20">
              <div className="mx-auto max-w-4xl px-4">
                <Reveal>
                  <h2 className="font-display text-center text-[1.7rem] font-bold leading-tight tracking-tight text-white text-balance sm:text-3xl">
                    {t(content.comoFuncionaTitle, 'Como funciona a parceria')}
                  </h2>
                  <SectionOrnament />
                </Reveal>

                <div className="mt-12 grid grid-cols-1 gap-9 sm:grid-cols-3 sm:gap-6">
                  {content.steps.map((p, i) => {
                    const StepIcon = STEP_ICONS[i % STEP_ICONS.length]
                    const iconAccent = STEP_ICON_ACCENTS[i % STEP_ICON_ACCENTS.length]
                    const isLast = i === content.steps.length - 1
                    return (
                      <Reveal key={p.id} delay={i * 130}>
                        <div className="group relative flex items-start gap-5 sm:block sm:text-center">
                          {/* Conector vertical (mobile): atravessa o gap até o próximo passo */}
                          {!isLast && (
                            <div aria-hidden className="absolute -bottom-9 left-[27px] top-16 w-px bg-gradient-to-b from-amber-400/50 via-white/15 to-transparent sm:hidden" />
                          )}
                          {/* Conector horizontal entre os passos (somente desktop) */}
                          {!isLast && (
                            <div aria-hidden className="absolute left-[calc(50%+40px)] top-7 hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-amber-400/50 via-white/20 to-amber-400/50 sm:block" />
                          )}

                          {/* Nó numerado com halo pulsante */}
                          <div className="relative shrink-0">
                            <span aria-hidden className="absolute inset-0 animate-ping-slow rounded-2xl bg-amber-400/25" />
                            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 font-display text-lg font-extrabold text-slate-950 shadow-cta ring-4 ring-amber-400/10 transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110">
                              {i + 1}
                            </div>
                          </div>

                          <div className="pt-0.5 sm:pt-0">
                            <h3 className="flex items-center gap-2 font-display text-sm font-bold tracking-tight text-white sm:justify-center">
                              <StepIcon className={`h-4 w-4 shrink-0 ${iconAccent}`} />
                              {p.title}
                            </h3>
                            <p className="mt-2 max-w-[280px] text-xs leading-relaxed text-slate-400 sm:mx-auto sm:max-w-[240px]">{p.description}</p>
                          </div>
                        </div>
                      </Reveal>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════ SOBRE A ROTINA + PRÉ-REQUISITOS (painéis glass com hairline de cor) ══════════════════════════ */}
          <section className="relative border-y border-white/[0.05] bg-slate-900/40 py-16 sm:py-20">
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 px-4 md:grid-cols-2">
              <Reveal className="h-full">
                <div className="card-sheen group relative h-full rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-sky-400/30 hover:shadow-[0_22px_60px_-22px_rgba(56,189,248,0.3)] sm:p-8">
                  <div aria-hidden className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent opacity-70" />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/25 to-sky-400/5 text-sky-300 ring-1 ring-sky-400/30 transition-transform duration-500 group-hover:scale-110">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-lg font-bold tracking-tight text-white">{t(content.sobreTitle, 'Sobre a Rotina Operacional')}</h2>
                  </div>
                  <p className="relative mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-300/90">{job.description}</p>
                </div>
              </Reveal>

              <Reveal delay={120} className="h-full">
                <div className="card-sheen group relative h-full rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-[0_22px_60px_-22px_rgba(52,211,153,0.3)] sm:p-8">
                  <div aria-hidden className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-70" />
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-400/5 text-emerald-300 ring-1 ring-emerald-400/30 transition-transform duration-500 group-hover:scale-110">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-lg font-bold tracking-tight text-white">{t(content.preRequisitosTitle, 'Pré-requisitos para ativação')}</h2>
                  </div>
                  <ul className="relative mt-5 space-y-1.5">
                    {(requisitos.length > 0 ? requisitos : [
                      'Maior de 18 anos',
                      'Documentos pessoais em dia',
                      'Disponibilidade para rotinas operacionais',
                    ]).map((item, i) => (
                      <li key={i} className="-mx-2 flex items-start gap-3 rounded-xl px-2 py-2 text-sm text-slate-300 transition-colors duration-300 hover:bg-white/[0.04]">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 ring-1 ring-emerald-400/30 shadow-[0_0_14px_-2px_rgba(52,211,153,0.5)]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ══════════════════════════ DEPOIMENTOS (cards glass com marca d'água de aspas e avatar medalhão) ══════════════════════════ */}
          {content.testimonials.length > 0 && (
            <section className="relative py-16 sm:py-20">
              <div className="mx-auto max-w-5xl px-4">
                <Reveal>
                  <h2 className="font-display text-center text-[1.7rem] font-bold leading-tight tracking-tight text-white text-balance sm:text-3xl">
                    {t(content.depoimentosTitle, 'Quem já é parceiro conta como é')}
                  </h2>
                  <SectionOrnament />
                </Reveal>

                <div className="mt-11 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
                  {content.testimonials.map((d, i) => (
                    <Reveal key={d.id} delay={i * 110} className="h-full">
                      <figure
                        className="card-sheen group relative flex h-full flex-col rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 transition-all duration-500 hover:-translate-y-1.5 hover:border-amber-400/30 hover:shadow-[0_22px_60px_-18px_rgba(251,191,36,0.35)]"
                      >
                        {/* Marca d'água decorativa de aspas */}
                        <Quote aria-hidden className="pointer-events-none absolute right-5 top-4 h-14 w-14 rotate-6 text-white/[0.04] transition-colors duration-500 group-hover:text-amber-400/10" />
                        <Quote className="relative h-6 w-6 text-amber-400/60 transition-all duration-500 group-hover:scale-110 group-hover:text-amber-400" />
                        <blockquote className="relative mt-3 flex-1 text-sm leading-relaxed text-slate-300">"{d.text}"</blockquote>
                        <figcaption className="relative mt-5 flex items-center gap-3 border-t border-white/[0.06] pt-4">
                          {/* Avatar medalhão em gradiente (identidade neutra) */}
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/25 via-brand-500/20 to-sky-400/25 ring-2 ring-white/10 shadow-[0_0_22px_-6px_rgba(251,191,36,0.45)] transition-transform duration-500 group-hover:scale-105">
                            <User className="h-5 w-5 text-white/80" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate font-display text-sm font-bold tracking-tight text-white">{d.name}</span>
                              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                            </span>
                            <span className="mt-0.5 block text-xs text-slate-500">{d.role}</span>
                          </span>
                          <span className="flex shrink-0 gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                            ))}
                          </span>
                        </figcaption>
                      </figure>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════ FAQ (acordeão glass com barra de acento e animação fluida) ══════════════════════════ */}
          {content.faqs.length > 0 && (
            <section className="relative border-y border-white/[0.05] bg-slate-900/40 py-16 sm:py-20">
              <div className="mx-auto max-w-3xl px-4">
                <Reveal>
                  <h2 className="font-display text-center text-[1.7rem] font-bold leading-tight tracking-tight text-white text-balance sm:text-3xl">
                    {t(content.faqTitle, 'Perguntas frequentes')}
                  </h2>
                  <SectionOrnament />
                </Reveal>

                <div className="mt-11 space-y-3">
                  {content.faqs.map((f, i) => {
                    const isOpen = openFaq === i
                    return (
                      <Reveal key={f.id} delay={i * 70}>
                        <div
                          className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                            isOpen
                              ? 'border-amber-400/35 bg-white/[0.06] shadow-glow-amber'
                              : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]'
                          }`}
                        >
                          {/* Barra de acento âmbar quando o item está aberto */}
                          <span aria-hidden className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-300 to-orange-500 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />
                          <button
                            type="button"
                            onClick={() => setOpenFaq(isOpen ? null : i)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
                          >
                            <span className={`font-display text-sm font-semibold tracking-tight transition-colors duration-300 sm:text-[0.95rem] ${isOpen ? 'text-amber-300' : 'text-white'}`}>
                              {f.question}
                            </span>
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                                isOpen
                                  ? 'rotate-180 border-amber-400/40 bg-amber-400/10 text-amber-300 shadow-[0_0_16px_-2px_rgba(251,191,36,0.5)]'
                                  : 'border-white/10 bg-white/[0.04] text-slate-400'
                              }`}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </span>
                          </button>
                          {/* Animação de abrir/fechar via grid-rows (CSS puro) */}
                          <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden">
                              <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400 sm:px-6">{f.answer}</p>
                            </div>
                          </div>
                        </div>
                      </Reveal>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ══════════════════════════ CTA FINAL (painel com borda de luz rotativa, spotlight e sparkles) ══════════════════════════ */}
          <section className="relative overflow-hidden py-20 sm:py-28">
            <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/20 blur-[100px]" />
            <Sparkles aria-hidden className="pointer-events-none absolute left-[10%] top-16 h-5 w-5 animate-float-gentle text-amber-300/50" />
            <Sparkles aria-hidden className="pointer-events-none absolute bottom-20 right-[8%] h-4 w-4 animate-float-gentle text-sky-300/50 [animation-delay:-3s]" />

            <div className="relative mx-auto max-w-2xl px-4">
              <Reveal>
                <div className="border-beam rounded-[2rem] bg-slate-950/85 px-6 py-12 text-center shadow-glow-blue backdrop-blur-2xl sm:px-12 sm:py-16">
                  {/* Realce interno suave no topo do painel */}
                  <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(59,130,246,0.16),transparent_60%)]" />

                  <h2 className="relative font-display text-[1.75rem] font-extrabold leading-tight tracking-tight text-white text-balance sm:text-3xl">
                    {t(content.ctaFinalTitle, 'Cadastro simples e rápido')}
                  </h2>
                  <p className="relative mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
                    {t(content.ctaFinalSubtitle, `Garanta seu perfil ativo para as próximas oportunidades de diária em ${job.company}.`)}
                  </p>
                  <div className="relative mt-9 flex justify-center">
                    <div className="relative w-full sm:w-auto">
                      <span aria-hidden className="absolute inset-0 animate-ping-slow rounded-2xl bg-amber-400/25 blur-sm" />
                      <button onClick={() => setIsModalOpen(true)} className={PRIMARY_CTA_CLASSES}>
                        <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                        <MessageCircle className="relative h-5 w-5" />
                        <span className="relative">{t(content.ctaSecondaryLabel, 'Cadastrar meu perfil para diárias')}</span>
                        <ArrowRight className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        </main>
      )}

      {/* ══════════════════════════ FOOTER ══════════════════════════ */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-slate-950/90 py-10 pb-28 text-center backdrop-blur-xl sm:pb-10">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4">
          <img src="/logo-hd.png" alt="HD Serviços" className="h-7 w-auto opacity-90 drop-shadow-[0_2px_12px_rgba(196,49,122,0.35)]" />
          <p className="text-xs text-slate-500">© 2026 {job.company}. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* ══════════════════════════ BARRA FIXA MOBILE CTA (touch target generoso + safe-area) ══════════════════════════ */}
      {job.active && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/90 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:hidden">
          <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 px-4 py-4 font-display text-sm font-extrabold tracking-tight text-slate-950 shadow-cta animate-cta-glow transition-transform active:scale-[0.97]"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{t(content.ctaPrimaryLabel, 'Quero receber diárias no WhatsApp')}</span>
          </button>
        </div>
      )}

      {/* ══════════════════════════ MODAL DE FORMULÁRIO ══════════════════════════ */}
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
