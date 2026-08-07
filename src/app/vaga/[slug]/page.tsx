import { redirect } from 'next/navigation'

export default function VagaRedirectPage({ params }: { params: { slug: string } }) {
  redirect(`/oportunidade/${params.slug}`)
}
