'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatDateES } from '@/lib/silver/format'
import { Nav } from './nav'
import { SlidePanel } from './slide-panel'

const iconBtnStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 12,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--text-soft)',
  flexShrink: 0,
  textDecoration: 'none',
}

export function Topbar() {
  const dateStr = formatDateES(new Date())
  const pathname = usePathname()
  const [bellOpen, setBellOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Close mobile menu on navigation
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      {/* Responsive CSS — style tag, works without Tailwind scanner */}
      <style>{`
        .tb-nav    { display: flex; align-items: center; }
        .tb-search { display: flex; flex: 1; min-width: 0; }
        .tb-acts   { display: flex; align-items: center; gap: 8px; }
        .tb-burger { display: none; align-items: center; justify-content: center; }
        @media (max-width: 767px) {
          .tb-nav    { display: none; }
          .tb-search { display: none; }
          .tb-acts   { display: none; }
          .tb-burger { display: flex; }
        }
      `}</style>

      {/* Bell notification panel */}
      <SlidePanel
        open={bellOpen}
        onClose={() => setBellOpen(false)}
        title="Notificaciones"
        subtitle="Alertas del sistema"
        width={400}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', textAlign: 'center', color: 'var(--text-mute)' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 12, opacity: 0.4 }}>
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p style={{ fontSize: 13 }}>Sin notificaciones pendientes</p>
          <p style={{ marginTop: 4, fontSize: 11, opacity: 0.6 }}>Las alertas de concentración y churn aparecen aquí</p>
        </div>
      </SlidePanel>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(8,8,10,0.97)', backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-space)', fontSize: 15, fontWeight: 700, color: '#0a0a0c', background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)' }}>
                $
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-space)', fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.015em' }}>Finanzas</div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 1 }}>{dateStr}</div>
              </div>
            </div>
            <button
              onClick={() => setMenuOpen(false)}
              style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-mute)', cursor: 'pointer', flexShrink: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Nav links — vertical */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px' }}>
            <Nav vertical onNavigate={() => setMenuOpen(false)} />
          </div>

          {/* Bottom actions */}
          <div style={{ padding: '12px 12px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <Link
              href="/configuracion"
              onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 14, color: 'var(--text-soft)', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', fontSize: 14, fontWeight: 500 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ opacity: 0.5 }}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Configuración
            </Link>
            <Link
              href="/clientes"
              onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 16px', borderRadius: 14, color: 'var(--text)', textDecoration: 'none', fontSize: 14, fontWeight: 600, background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo cliente
            </Link>
          </div>
        </div>
      )}

      {/* ── Topbar card ── */}
      <div
        style={{
          background: 'var(--glass)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '12px 16px',
          boxShadow: 'var(--shadow-lifted)',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* Logo */}
          <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-space)', fontSize: 15, fontWeight: 700, color: '#0a0a0c', background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 4px 12px rgba(255,255,255,0.15)' }}>
            $
          </div>

          {/* Title */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-space)', fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.015em' }}>Finanzas</div>
            <div style={{ marginTop: 1, fontSize: 11, color: 'var(--text-mute)' }}>{dateStr}</div>
          </div>

          {/* Desktop nav */}
          <div className="tb-nav" style={{ marginLeft: 4 }}>
            <Nav />
          </div>

          {/* Search bar */}
          <div
            className="tb-search"
            style={{ cursor: 'pointer', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-mute)', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '9px 14px' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5, flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Buscar...</span>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-space)', fontSize: 11, fontWeight: 500, color: 'var(--text-faint)', padding: '2px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, flexShrink: 0 }}>⌘K</span>
          </div>

          {/* Desktop actions */}
          <div className="tb-acts">
            <button style={{ ...iconBtnStyle, position: 'relative' }} onClick={() => setBellOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span
                className="animate-silver-pulse"
                style={{ position: 'absolute', right: 6, top: 6, width: 7, height: 7, borderRadius: '50%', background: 'var(--text)', boxShadow: '0 0 8px var(--glow-bright)' }}
              />
            </button>

            <Link href="/configuracion" style={iconBtnStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Link>

            <Link
              href="/clientes"
              style={{ height: 38, display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px', fontSize: 13, fontWeight: 500, color: 'var(--text)', textDecoration: 'none', background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 12, flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo cliente
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="tb-burger"
            style={{ ...iconBtnStyle, marginLeft: 'auto' }}
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

        </div>
      </div>
    </>
  )
}
