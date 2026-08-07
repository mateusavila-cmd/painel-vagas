import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Painel de Vagas & Recrutamento',
  description: 'Sistema completo de gerenciamento de vagas e candidatura rápida',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} h-full min-h-screen bg-slate-50 flex flex-col`}>
        {children}
      </body>
    </html>
  )
}
