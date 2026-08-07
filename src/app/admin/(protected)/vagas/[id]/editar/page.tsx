import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { JobForm } from '@/components/admin/JobForm'

export default async function EditarVagaPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()
  const { id } = params

  const job = await db.job.findUnique({
    where: { id },
    include: {
      assignedUsers: { select: { id: true } },
    },
  })

  if (!job) {
    notFound()
  }

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
      <JobForm
        isEditing
        initialData={{
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          type: job.type,
          category: job.category,
          description: job.description,
          requirements: job.requirements,
          salary: job.salary,
          benefits: job.benefits,
          active: job.active,
          assignedUserIds: job.assignedUsers.map((u) => u.id),
        }}
        recruiters={recruiters}
      />
    </div>
  )
}
