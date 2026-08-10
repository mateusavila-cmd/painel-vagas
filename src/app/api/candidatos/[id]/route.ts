import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const { status, notes, whatsappContactedAt } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (whatsappContactedAt !== undefined) {
      updateData.whatsappContactedAt = whatsappContactedAt ? new Date(whatsappContactedAt) : null
    }

    const updatedCandidate = await db.candidate.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedCandidate)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar candidato' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { id } = params
    await db.candidate.delete({ where: { id } })

    return NextResponse.json({ success: true, message: 'Candidato excluído' })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir candidato' }, { status: 500 })
  }
}
