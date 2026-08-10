import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { JobForm } from '@/components/admin/JobForm'

export default async function NovaVagaPage() {
  const user = await getCurrentUser()

  // Se for admin, carrega lista de recrutadores para seleção
  let recruiters: Array<{ id: string; name: string; email: string }> = []
  if (user?.role === 'ADMIN') {
    recruiters = await db.user.findMany({
      where: { active: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <JobForm recruiters={recruiters} isAdmin={user?.role === 'ADMIN'} />
    </div>
  )
}
