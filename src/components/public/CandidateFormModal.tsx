'use client'

import { useState } from 'react'
import { X, Send, CheckCircle2, Phone, User, Loader2, AlertCircle } from 'lucide-react'
import { formatWhatsApp, isValidWhatsApp } from '@/lib/utils'

interface CandidateFormModalProps {
  jobId: string
  jobTitle: string
  company: string
  isOpen: boolean
  onClose: () => void
}

export function CandidateFormModal({
  jobId,
  jobTitle,
  company,
  isOpen,
  onClose,
}: CandidateFormModalProps) {
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value)
    setWhatsapp(formatted)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (name.trim().length < 3) {
      setError('Por favor, informe seu nome completo.')
      return
    }

    if (!isValidWhatsApp(whatsapp)) {
      setError('Por favor, informe um WhatsApp válido com DDD ex: (11) 99999-9999.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/candidatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          whatsapp,
          jobId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Não foi possível enviar sua candidatura.')
      }

      setIsSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsSuccess(false)
    setName('')
    setWhatsapp('')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/85 p-0 backdrop-blur-md transition-all sm:items-center sm:p-4">
      {/* Painel glass com hairline luminosa superior e halo azul profundo */}
      <div className="relative max-h-[90vh] w-full max-w-lg animate-modal-in overflow-y-auto rounded-t-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-[0_0_90px_-15px_rgba(59,130,246,0.45)] sm:rounded-3xl sm:p-8">
        <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_50%_at_50%_-10%,rgba(59,130,246,0.12),transparent_60%)]" />

        <button
          onClick={handleClose}
          className="absolute right-5 top-5 z-10 rounded-full border border-white/[0.06] bg-white/[0.04] p-2 text-slate-500 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-90"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="relative space-y-4 py-6 text-center">
            <div className="relative mx-auto h-16 w-16">
              <span aria-hidden className="absolute inset-0 animate-ping-slow rounded-full bg-emerald-400/25" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/30 shadow-[0_0_40px_-5px_rgba(52,211,153,0.5)]">
                <CheckCircle2 className="h-9 w-9" />
              </div>
            </div>
            <h3 className="font-display text-2xl font-bold tracking-tight text-white">Interesse Registrado!</h3>
            <p className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-base font-medium leading-relaxed text-emerald-100">
              Recebemos seu interesse! Nossa equipe entrará em contato pelo WhatsApp em até 24 horas.
            </p>
            <div className="pt-4">
              <button
                onClick={handleClose}
                className="w-full rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 px-6 py-3.5 font-display font-bold tracking-tight text-slate-950 shadow-cta transition-all hover:brightness-110 hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] active:scale-[0.99]"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <div className="relative space-y-6">
            <div>
              <span className="mb-2 inline-block rounded-full bg-gradient-to-r from-amber-400/15 to-orange-500/10 px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/25 shadow-[0_0_18px_-6px_rgba(251,191,36,0.5)]">
                Candidatura Rápida
              </span>
              <h3 className="font-display text-xl font-bold leading-snug tracking-tight text-white">{jobTitle}</h3>
              <p className="mt-1 text-xs text-slate-400">{company}</p>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-300 shadow-[0_0_30px_-12px_rgba(244,63,94,0.5)]">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 pl-11 pr-4 text-sm font-medium text-white placeholder:text-slate-500 transition-all focus:border-amber-400/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  WhatsApp com DDD *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={handlePhoneChange}
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 pl-11 pr-4 font-mono text-sm font-medium text-white placeholder:text-slate-500 transition-all focus:border-amber-400/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Usaremos este número apenas para entrar em contato sobre esta vaga.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 px-6 py-4 font-display text-base font-extrabold tracking-tight text-slate-950 shadow-cta animate-cta-glow transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-cta-lg active:translate-y-0 active:scale-[0.99] disabled:opacity-70"
                >
                  <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                  {loading ? (
                    <>
                      <Loader2 className="relative h-5 w-5 animate-spin" />
                      <span className="relative">Enviando interesse...</span>
                    </>
                  ) : (
                    <>
                      <Send className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      <span className="relative">Enviar Interesse</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
