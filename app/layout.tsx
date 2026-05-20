import type { Metadata } from 'next'
import { inter, spaceGrotesk } from '@/app/fonts'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Silver — Panel Financiero',
  description: 'Panel financiero privado de Bralto',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <body>
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            style: {
              background: 'rgba(15,15,20,0.96)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text, #ffffff)',
              backdropFilter: 'blur(20px)',
            },
          }}
        />
      </body>
    </html>
  )
}
