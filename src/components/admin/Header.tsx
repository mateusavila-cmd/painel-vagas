'use client'

import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon } from 'lucide-react'

interface HeaderProps {
  user: {
    name: string
    email: string
    role: 'ADMIN' | 'RECRUITER'
  }
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <img src="/logo-hd.png" alt="HD Serviços" className="h-8 w-auto" />
        <div className="border-l border-slate-200 pl-3">
          <h1 className="font-bold text-slate-800 text-base leading-tight">Gestor de Oportunidades</h1>
          <p className="text-xs text-slate-500">Painel Administrativo</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <UserIcon className="w-4 h-4 text-slate-500" />
          <span className="font-medium text-slate-700">{user.name}</span>
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
            user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'
          }`}>
            {user.role}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50 font-medium"
          title="Sair do Sistema"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </header>
  )
}
