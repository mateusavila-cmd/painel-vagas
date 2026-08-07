import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Header } from '@/components/admin/Header'
import { Sidebar } from '@/components/admin/Sidebar'
import { ToastProvider } from '@/components/ui/Toast'

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header user={user} />
        <div className="flex flex-1">
          <Sidebar userRole={user.role} />
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
