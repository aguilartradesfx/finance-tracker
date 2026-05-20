import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{
        background: 'var(--glass)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        boxShadow: 'var(--shadow-lifted)',
      }}
    >
      {/* Top highlight — gives 3D bevel effect */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: 100,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
          borderRadius: '24px 24px 0 0',
        }}
      />
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  dot?: 'solid' | 'ring' | 'dim'
  meta?: string
  children?: React.ReactNode
}

export function CardHeader({ title, dot = 'solid', meta, children }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-[22px] pt-[18px] pb-[14px]">
      <div className="flex items-center gap-[10px]">
        <DotIndicator variant={dot} />
        <span
          className="font-space text-[13px] font-medium text-[var(--text)]"
          style={{ letterSpacing: '-0.005em' }}
        >
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {meta && (
          <span className="font-space text-[11px] font-normal text-[var(--text-mute)]">
            {meta}
          </span>
        )}
        {children}
      </div>
    </div>
  )
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('px-[22px] pb-[22px] pt-[6px]', className)}>
      {children}
    </div>
  )
}

interface DotProps {
  variant?: 'solid' | 'ring' | 'dim'
  className?: string
}

export function DotIndicator({ variant = 'solid', className }: DotProps) {
  if (variant === 'solid') {
    return (
      <span
        className={cn('block size-[7px] rounded-full', className)}
        style={{
          background: 'var(--text)',
          boxShadow: '0 0 8px var(--glow-bright)',
        }}
      />
    )
  }

  if (variant === 'ring') {
    return (
      <span
        className={cn('animate-silver-pulse-ring block size-[7px] rounded-full', className)}
        style={{
          background: 'transparent',
          border: '1.5px solid var(--text)',
          boxShadow: '0 0 8px var(--glow-soft)',
        }}
      />
    )
  }

  return (
    <span
      className={cn('block size-[7px] rounded-full', className)}
      style={{
        background: 'var(--silver-dim)',
        boxShadow: '0 0 6px rgba(161,161,170,0.4)',
      }}
    />
  )
}
