import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic' // Garante dados sempre frescos sem gerar pgina esttica no build

export default async function RelatoriosPage() {
  const jobs = await db.job.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: true,
      assignedUsers: true,
      candidates: true,
    }
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Relatório por Oportunidade</h2>
        <p className="text-sm text-slate-500 mt-1">
          Acompanhe o volume de candidatos e o status de contato por cada oportunidade aberta.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Oportunidade</th>
                <th className="px-6 py-4">Criada em</th>
                <th className="px-6 py-4">Criador</th>
                <th className="px-6 py-4">Responsáveis (Recrutadores)</th>
                <th className="px-6 py-4 text-center">Total de Candidatos</th>
                <th className="px-6 py-4 text-center">Contatados</th>
                <th className="px-6 py-4 text-center">Não Contatados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => {
                const total = job.candidates.length
                const contatados = job.candidates.filter(c => c.whatsappContactedAt).length
                const naoContatados = total - contatados

                return (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{job.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(job.createdAt)}</td>
                    <td className="px-6 py-4">{job.createdBy?.name || 'Desconhecido'}</td>
                    <td className="px-6 py-4">
                      {job.assignedUsers.length > 0 
                        ? job.assignedUsers.map(u => u.name).join(', ') 
                        : <span className="text-slate-400 text-xs italic">Nenhum</span>}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">{total}</td>
                    <td className="px-6 py-4 text-center font-bold text-green-600">{contatados}</td>
                    <td className="px-6 py-4 text-center font-bold text-rose-600">{naoContatados}</td>
                  </tr>
                )
              })}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Nenhuma oportunidade encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
