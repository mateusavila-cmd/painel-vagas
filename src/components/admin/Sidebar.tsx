'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Briefcase, Users, ShieldCheck, LayoutTemplate, BarChart2, PanelLeftOpen, PanelLeftClose } from 'lucide-react'

interface SidebarProps {
  userRole: 'ADMIN' | 'RECRUITER'
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(true)

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
      name: 'Relatórios',
      href: '/admin/relatorios',
      icon: BarChart2,
    })
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
    <aside
      className={`${collapsed ? 'w-[72px]' : 'w-64'} bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] p-3 flex flex-col justify-between shrink-0 transition-all duration-200`}
    >
      <div className="space-y-4">
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        {!collapsed && (
          <div className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Navegação
          </div>
        )}

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {!collapsed && (
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
          <img src="/logo-hd.png" alt="HD Serviços" className="h-5 w-auto opacity-90" />
          <p>Painel seguro com gestão simplificada de candidaturas.</p>
        </div>
      )}
    </aside>
  )
}
