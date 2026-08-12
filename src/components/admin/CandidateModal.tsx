'use client'

import { useState } from 'react'
import { X, Save, Calendar, Phone, Briefcase, FileText, Loader2, MessageCircle, CheckCircle2 } from 'lucide-react'
import { StatusBadge, CandidateStatusType } from './StatusBadge'
import { formatDate, getWhatsAppLink, buildRecruiterWhatsAppMessage } from '@/lib/utils'

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

interface CandidateModalProps {
  candidate: Candidate | null
  onClose: () => void
  onUpdate: (updatedCandidate: Candidate) => void
  whatsappTemplates?: Record<string, string>
}

export function CandidateModal({ candidate, onClose, onUpdate, whatsappTemplates = {} }: CandidateModalProps) {
  if (!candidate) return null

  const [notes, setNotes] = useState(candidate.notes || '')
  const [status, setStatus] = useState<CandidateStatusType>(candidate.status)
  const [loading, setLoading] = useState(false)
  const [whatsappContactedAt, setWhatsappContactedAt] = useState(candidate.whatsappContactedAt || null)

  const handleWhatsAppClick = async () => {
    const now = new Date().toISOString()
    setWhatsappContactedAt(now)

    try {
      await fetch(`/api/candidatos/${candidate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappContactedAt: now }),
      })
      onUpdate({ ...candidate, whatsappContactedAt: now })
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/candidatos/${candidate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, status }),
      })

      if (res.ok) {
        const updated = await res.json()
        onUpdate({ ...candidate, notes: updated.notes, status: updated.status, whatsappContactedAt })
        onClose()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-6 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900">{candidate.name}</h3>
            <StatusBadge status={status} />
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Candidatou-se em {formatDate(candidate.createdAt)}
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-sm">
          <div className="flex items-center gap-2 text-slate-700 font-medium">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <span>Oportunidade: {candidate.job.title} ({candidate.job.company})</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Phone className="w-4 h-4 text-brand-600" />
              <span className="font-mono">{candidate.whatsapp}</span>
            </div>
            <a
              href={getWhatsAppLink(
                candidate.whatsapp,
                buildRecruiterWhatsAppMessage(
                  candidate.name,
                  candidate.job.title,
                  candidate.job.company,
                  whatsappTemplates[candidate.job.category]
                )
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors border ${
                whatsappContactedAt
                  ? 'text-green-700 bg-green-50 border-green-300 hover:bg-green-100'
                  : 'text-green-700 bg-green-50 hover:bg-green-600 hover:text-white border-green-200 hover:border-green-600'
              }`}
            >
              {whatsappContactedAt ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <MessageCircle className="w-3.5 h-3.5" />
              )}
              Conversar
            </a>
          </div>
          {whatsappContactedAt && (
            <div className="flex items-center gap-1.5 text-xs text-green-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Contatado via WhatsApp em {formatDate(whatsappContactedAt)}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Status da Candidatura
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CandidateStatusType)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 text-slate-900"
          >
            <option value="NOVO">Novo</option>
            <option value="EM_ANALISE">Em Análise</option>
            <option value="ENTREVISTA">Entrevista Agendada</option>
            <option value="APROVADO">Aprovado</option>
            <option value="REJEITADO">Rejeitado</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Notas Internas do RH (Privado)
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione observações sobre o candidato, feedback da entrevista..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 text-slate-900 resize-y"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 font-medium text-sm hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
