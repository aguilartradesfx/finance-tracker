interface SkeletonProps {
  height?: number | string
  width?: number | string
  radius?: number
  className?: string
}

export function Skeleton({ height = 16, width = '100%', radius = 8, className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        height,
        width,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)',
        backgroundSize: '200% 100%',
        animation: 'silver-shimmer 1.6s ease-in-out infinite',
      }}
    />
  )
}

export function SkeletonCard({ height = 180 }: { height?: number }) {
  return (
    <div
      aria-hidden
      style={{
        height,
        borderRadius: 20,
        background: 'var(--glass)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lifted)',
        padding: 24,
      }}
    >
      <Skeleton width={120} height={10} radius={6} />
      <div style={{ height: 18 }} />
      <Skeleton width={'60%'} height={36} radius={10} />
      <div style={{ height: 14 }} />
      <Skeleton width={'40%'} height={10} radius={6} />
    </div>
  )
}
