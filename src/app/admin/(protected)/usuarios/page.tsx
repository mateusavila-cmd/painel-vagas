'use client'

import { useState, useEffect } from 'react'
import { Plus, UserCheck, UserX, ShieldCheck, Trash2, Edit, Save, X, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface Job {
  id: string
  title: string
}

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'RECRUITER'
  active: boolean
  createdAt: string
  assignedJobs: Job[]
}

export default function UsuariosPage() {
  const { showToast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [availableJobs, setAvailableJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'RECRUITER'>('RECRUITER')
  const [active, setActive] = useState(true)
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])
  const [formLoading, setFormLoading] = useState(false)

  const fetchData = async () => {
    try {
      const [usersRes, jobsRes] = await Promise.all([
        fetch('/api/usuarios'),
        fetch('/api/vagas'),
      ])

      if (usersRes.ok) setUsers(await usersRes.json())
      if (jobsRes.ok) setAvailableJobs(await jobsRes.json())
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openCreateModal = () => {
    setEditingUserId(null)
    setName('')
    setEmail('')
    setPassword('')
    setRole('RECRUITER')
    setActive(true)
    setSelectedJobIds([])
    setIsModalOpen(true)
  }

  const openEditModal = (user: User) => {
    setEditingUserId(user.id)
    setName(user.name)
    setEmail(user.email)
    setPassword('')
    setRole(user.role)
    setActive(user.active)
    setSelectedJobIds(user.assignedJobs ? user.assignedJobs.map((j) => j.id) : [])
    setIsModalOpen(true)
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const isEdit = !!editingUserId
      const url = isEdit ? `/api/usuarios/${editingUserId}` : '/api/usuarios'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password: password || undefined,
          role,
          active,
          assignedJobIds: selectedJobIds,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar usuário')
      }

      showToast(`Usuário ${isEdit ? 'atualizado' : 'criado'} com sucesso!`)
      setIsModalOpen(false)
      fetchData()
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleUserActive = async (user: User) => {
    try {
      const res = await fetch(`/api/usuarios/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !user.active }),
      })

      if (res.ok) {
        showToast(`Usuário ${!user.active ? 'ativado' : 'desativado'}!`)
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, active: !user.active } : u))
        )
      }
    } catch (err) {
      showToast('Erro ao alterar status', 'error')
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Deseja realmente excluir este usuário?')) return

    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
      if (res.ok) {
        showToast('Usuário excluído com sucesso!')
        setUsers((prev) => prev.filter((u) => u.id !== id))
      } else {
        const data = await res.json()
        showToast(data.error || 'Erro ao excluir usuário', 'error')
      }
    } catch (err) {
      showToast('Erro ao excluir usuário', 'error')
    }
  }

  const toggleJobSelection = (jobId: string) => {
    setSelectedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gerenciamento de Usuários (Admin)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Cadastre novos recrutadores e controle atribuição de oportunidades e permissões de acesso
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-brand-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Usuário</span>
        </button>
      </div>

      {/* Lista de Usuários */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Carregando usuários...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nome & E-mail</th>
                  <th className="px-6 py-4">Nível de Acesso</th>
                  <th className="px-6 py-4">Oportunidades Atribuídas</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-700/10'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.role === 'ADMIN' ? (
                        <span className="text-xs text-slate-400 font-medium">Acesso total a todas as oportunidades</span>
                      ) : u.assignedJobs && u.assignedJobs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.assignedJobs.map((j) => (
                            <span key={j.id} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                              {j.title}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Nenhuma oportunidade vinculada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
                          <UserCheck className="w-3.5 h-3.5" /> Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                          <UserX className="w-3.5 h-3.5" /> Desativado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors inline-flex items-center"
                        title="Editar usuário"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleUserActive(u)}
                        className={`p-2 rounded-lg transition-colors inline-flex items-center ${
                          u.active ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-brand-600 hover:bg-brand-50'
                        }`}
                        title={u.active ? 'Desativar acesso' : 'Reativar acesso'}
                      >
                        {u.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center"
                        title="Excluir usuário"
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

      {/* Modal de Cadastro / Edição de Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-6 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-900">
              {editingUserId ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Mariana Silva"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mariana@empresa.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  {editingUserId ? 'Nova Senha (deixe em branco para manter a atual)' : 'Senha de Acesso *'}
                </label>
                <input
                  type="password"
                  required={!editingUserId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nível de Permissão (Role) *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'ADMIN' | 'RECRUITER')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50 text-slate-900"
                >
                  <option value="RECRUITER">Recrutador (Vê apenas suas oportunidades atribuídas)</option>
                  <option value="ADMIN">Administrador (Acesso total)</option>
                </select>
              </div>

              {role === 'RECRUITER' && availableJobs.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Atribuir Oportunidades ao Recrutador
                  </label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {availableJobs.map((job) => {
                      const isChecked = selectedJobIds.includes(job.id)
                      return (
                        <label key={job.id} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:bg-slate-100 p-1.5 rounded-lg">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleJobSelection(job.id)}
                            className="w-4 h-4 text-brand-600 rounded border-slate-300"
                          />
                          <span>{job.title}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="user-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300"
                />
                <label htmlFor="user-active" className="text-sm font-medium text-slate-700 cursor-pointer">
                  Conta Ativa
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 text-sm hover:bg-slate-100 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2 text-sm disabled:opacity-70"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingUserId ? 'Atualizar Usuário' : 'Cadastrar'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
