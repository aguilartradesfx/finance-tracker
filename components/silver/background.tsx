const ORB_LAYER: React.CSSProperties = {
  transform: 'translateZ(0)',
  willChange: 'transform',
  contain: 'strict',
}

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

      {/* Orbs — promoted to its own compositor layer */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={ORB_LAYER}
      >
        {/* Top-left orb — brightest */}
        <div
          className="absolute rounded-full"
          style={{
            top: '-15%',
            left: '-5%',
            width: 700,
            height: 700,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
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
            filter: 'blur(80px)',
          }}
        />
      </div>
    </>
  )
}
