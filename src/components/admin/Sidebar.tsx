'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, Users, ShieldCheck, LayoutTemplate } from 'lucide-react'

interface SidebarProps {
  userRole: 'ADMIN' | 'RECRUITER'
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Oportunidades',
      href: '/admin/vagas',
      icon: Briefcase,
    },
    {
      name: 'Candidatos',
      href: '/admin/candidatos',
      icon: Users,
    },
  ]

  if (userRole === 'ADMIN') {
    navItems.push({
      name: 'Conteúdo das Landing Pages',
      href: '/admin/conteudo',
      icon: LayoutTemplate,
    })
    navItems.push({
      name: 'Usuários (Admin)',
      href: '/admin/usuarios',
      icon: ShieldCheck,
    })
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Navegação
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
        <img src="/logo-hd.png" alt="HD Serviços" className="h-5 w-auto opacity-90" />
        <p>Painel seguro com gestão simplificada de candidaturas.</p>
      </div>
    </aside>
  )
}
