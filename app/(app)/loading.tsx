import { SkeletonCard } from '@/components/silver/skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <div style={{ height: 56 }} />
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr' }}
      >
        <SkeletonCard height={220} />
        <SkeletonCard height={220} />
        <SkeletonCard height={220} />
        <SkeletonCard height={220} />
      </div>
      <SkeletonCard height={260} />
      <SkeletonCard height={200} />
    </div>
  )
}
