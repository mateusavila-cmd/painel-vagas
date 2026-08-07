import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { LandingContentEditor } from '@/components/admin/LandingContentEditor'

export default async function ConteudoLandingPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'ADMIN') {
    redirect('/admin/dashboard')
  }

  return <LandingContentEditor />
}
