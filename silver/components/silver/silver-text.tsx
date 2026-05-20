import { cn } from '@/lib/utils'

interface SilverTextProps {
  children: React.ReactNode
  variant?: 'default' | 'bright'
  className?: string
}

export function SilverText({ children, variant = 'default', className }: SilverTextProps) {
  return (
    <span
      className={cn(variant === 'bright' ? 'silver-text-bright' : 'silver-text', className)}
    >
      {children}
    </span>
  )
}
