import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';


const NAV = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/timeline', icon: '◷', label: 'Timeline' },
  { to: '/calendar', icon: '⊡', label: 'Calendar' },
  { to: '/locations', icon: '◎', label: 'Locations' },
  { to: '/insights', icon: '◈', label: 'AI Insights' },
  { to: '/settings', icon: '⊙', label: 'Settings' },
];

export default function Layout({ children }) {
  const { mode, changeMode, isTracking } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <nav className="sidebar" style={{
        width: collapsed ? 64 : 220, minHeight: '100vh',
        background: 'var(--bg2)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '20px 0',
        transition: 'width 0.2s ease', flexShrink: 0, position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent), #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, boxShadow: '0 2px 12px var(--accent-glow)',
          }}>⌛</div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>CHRONOS</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text2)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Time Intelligence</div>
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        {!collapsed && (
          <div style={{ padding: '0 16px 20px' }}>
            <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 4, display: 'flex', gap: 2 }}>
              {['individual', 'business'].map((m) => (
                <button key={m} onClick={() => changeMode(m)} style={{
                  flex: 1, padding: '6px 8px', borderRadius: 8, border: 'none',
                  cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'var(--font-display)',
                  fontWeight: 600, transition: 'all 0.15s',
                  background: mode === m ? 'var(--accent)' : 'transparent',
                  color: mode === m ? 'white' : 'var(--text2)',
                  textTransform: 'capitalize',
                }}>
                  {m === 'individual' ? '👤' : '🏢'} {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Nav Links */}
        <div style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '10px 14px' : '10px 16px',
              borderRadius: 10, textDecoration: 'none',
              fontSize: '0.875rem', fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--text)' : 'var(--text2)',
              background: isActive ? 'var(--surface)' : 'transparent',
              transition: 'all 0.12s',
              justifyContent: collapsed ? 'center' : 'flex-start',
            })}>
              <span style={{ fontSize: 16, opacity: 0.9, flexShrink: 0 }}>{icon}</span>
              {!collapsed && label}
            </NavLink>
          ))}
        </div>

        {/* Tracking indicator */}
        {isTracking && !collapsed && (
          <div style={{ padding: '0 16px 12px' }}>
            <div style={{
              background: 'var(--green-bg)', border: '1px solid rgba(52,211,153,0.2)',
              borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
              fontSize: '0.75rem', color: 'var(--green)',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--green)',
                animation: 'pulse-glow 2s infinite',
              }} />
              Tracking Active
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed((c) => !c)} style={{
          margin: '0 16px 8px', padding: '8px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {collapsed ? '›' : '‹'}
        </button>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '32px 40px', maxWidth: 'calc(100vw - 64px)' }}>
        {children}
      </main>
    </div>
  );
}
