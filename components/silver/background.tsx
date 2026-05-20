export function Background() {
  return (
    <>
      {/* Main 48px grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          backgroundPosition: '-1px -1px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 80%)',
        }}
      />

      {/* Fine 12px grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.012) 1px, transparent 1px)
          `,
          backgroundSize: '12px 12px',
          maskImage: 'radial-gradient(ellipse 60% 40% at 50% 30%, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 40% at 50% 30%, black 0%, transparent 70%)',
        }}
      />

      {/* Orbs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top-left orb — brightest */}
        <div
          className="absolute rounded-full"
          style={{
            top: '-15%',
            left: '-5%',
            width: 700,
            height: 700,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
            filter: 'blur(110px)',
          }}
        />
        {/* Top-right orb */}
        <div
          className="absolute rounded-full"
          style={{
            top: '5%',
            right: '-10%',
            width: 600,
            height: 600,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%)',
            filter: 'blur(110px)',
          }}
        />
        {/* Bottom-center orb — largest */}
        <div
          className="absolute rounded-full"
          style={{
            bottom: '-25%',
            left: '25%',
            width: 900,
            height: 900,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%)',
            filter: 'blur(110px)',
          }}
        />
        {/* Bottom-right orb */}
        <div
          className="absolute rounded-full"
          style={{
            bottom: '15%',
            right: '10%',
            width: 500,
            height: 500,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%)',
            filter: 'blur(110px)',
          }}
        />
      </div>

      {/* Grain overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`,
          opacity: 0.06,
          mixBlendMode: 'overlay',
        }}
      />
    </>
  )
}
