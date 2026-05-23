import { SkeletonCard } from '@/components/silver/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <div style={{ height: 56 }} />
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr' }}
      >
        <SkeletonCard height={240} />
        <SkeletonCard height={240} />
        <SkeletonCard height={240} />
        <SkeletonCard height={240} />
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <SkeletonCard height={120} />
        <SkeletonCard height={120} />
        <SkeletonCard height={120} />
        <SkeletonCard height={120} />
      </div>
      <SkeletonCard height={280} />
    </div>
  )
}
