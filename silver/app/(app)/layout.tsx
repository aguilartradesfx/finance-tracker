import { Background } from '@/components/silver/background'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <Background />
      <div
        className="relative mx-auto px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-6 lg:px-8"
        style={{ maxWidth: 1380, zIndex: 2 }}
      >
        {children}
      </div>
    </div>
  )
}
