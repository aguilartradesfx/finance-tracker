'use client'

import { formatMoney, monthShortES } from '@/lib/silver/format'
import type { MonthlyGoal } from '@/lib/silver/types'

interface ProjectionChartProps {
  goals: MonthlyGoal[]
  breakEven: number
}

export function ProjectionChart({ goals, breakEven }: ProjectionChartProps) {
  if (goals.length < 2) return null

  const W = 900
  const H = 220
  const PAD = { t: 30, r: 60, b: 30, l: 20 }
  const chartW = W - PAD.l - PAD.r
  const chartH = H - PAD.t - PAD.b

  const values = goals.map((g) => g.mrr_target)
  const minVal = Math.min(breakEven * 0.85, ...values)
  const maxVal = Math.max(...values) * 1.05

  const toY = (v: number) =>
    PAD.t + chartH - ((v - minVal) / (maxVal - minVal)) * chartH
  const toX = (i: number) =>
    PAD.l + (i / (goals.length - 1)) * chartW

  const points = goals.map((g, i) => ({
    x: toX(i),
    y: toY(g.mrr_target),
    value: g.mrr_target,
    month: monthShortES(g.month),
  }))

  const breakY = toY(breakEven)
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')
  const fillD = `${pathD} L ${points[points.length - 1].x},${H - PAD.b} L ${points[0].x},${H - PAD.b} Z`

  return (
    <div
      className="relative mt-5 overflow-hidden rounded-2xl"
      style={{
        padding: 20,
        background: 'rgba(0,0,0,0.2)',
        border: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* inner grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', position: 'relative', zIndex: 1 }}>
        <defs>
          <linearGradient id="proj-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="proj-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#a1a1aa" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Break-even line */}
        <line
          x1={PAD.l}
          y1={breakY}
          x2={W - PAD.r + 10}
          y2={breakY}
          stroke="rgba(255,255,255,0.4)"
          strokeWidth={0.7}
          strokeDasharray="4,4"
        />
        <text
          x={W - PAD.r + 12}
          y={breakY - 5}
          fill="rgba(255,255,255,0.55)"
          fontFamily="Space Grotesk, sans-serif"
          fontSize={10}
          fontWeight={500}
        >
          ${formatMoney(breakEven)}
        </text>

        {/* Fill */}
        <path d={fillD} fill="url(#proj-fill)" />

        {/* Line */}
        <path
          d={pathD}
          stroke="url(#proj-stroke)"
          strokeWidth={2.5}
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))' }}
        />

        {/* Points + labels */}
        {points.map((p, i) => {
          const isFirst = i === 0
          const isLast = i === points.length - 1
          const r = isFirst || isLast ? 6 : 5
          const dotColor = isLast ? '#ffffff' : i === 1 ? '#d4d4d8' : i === 2 ? '#e4e4e7' : '#a1a1aa'

          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={r} fill="#08080a" stroke={dotColor} strokeWidth={2} />
              {(isFirst || isLast) && (
                <circle cx={p.x} cy={p.y} r={2.5} fill={dotColor} />
              )}

              {/* Value label (first + last) */}
              {(isFirst || isLast) && (
                <g transform={`translate(${p.x}, ${p.y - 10})`}>
                  <rect
                    x={-30}
                    y={-22}
                    width={60}
                    height={20}
                    rx={6}
                    fill={isLast ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)'}
                    stroke={isLast ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.18)'}
                    strokeWidth={0.5}
                  />
                  <text
                    x={0}
                    y={-8}
                    fill={isLast ? '#ffffff' : '#e4e4e7'}
                    fontFamily="Space Grotesk, sans-serif"
                    fontSize={10}
                    fontWeight={600}
                    textAnchor="middle"
                  >
                    ${formatMoney(p.value)}
                  </text>
                </g>
              )}

              {/* Month label */}
              <text
                x={p.x}
                y={H - 4}
                fill="rgba(255,255,255,0.35)"
                fontFamily="Space Grotesk, sans-serif"
                fontSize={11}
                fontWeight={500}
                textAnchor="middle"
                letterSpacing={1}
              >
                {p.month}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
