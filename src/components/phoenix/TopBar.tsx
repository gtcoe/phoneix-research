'use client';
import { useState, useRef } from 'react';
import { Icon } from './ui';
import type { PhoenixData } from '@/lib/data';

// ─── TopBar ───────────────────────────────────────────────────────────────────
export default function TopBar({ data, page, themeName, onThemeChange, themes }: {
  data: PhoenixData;
  page: string;
  themeName: string;
  onThemeChange: (name: string) => void;
  themes: string[];
}) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = data.convictionAlerts.filter(a => !a.read).length;
  const isDark = themeName !== 'Pro Light';
  const pageName: Record<string, string> = {
    dashboard: 'Dashboard', portfolio: 'Portfolio', analysis: 'Analysis',
    compare: 'Compare', watchlist: 'Watchlist', reports: 'Reports',
    journal: 'Journal', tools: 'Tools', review: 'Quarterly Review',
  };

  return (
    <header style={{
      height: 56, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0,
    }}>
      {/* Page title */}
      <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', marginRight: 8 }}>
        {pageName[page] || page}
      </span>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 340, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex', pointerEvents: 'none' }}>
          <Icon name="search" size={15} />
        </span>
        <input
          value={searchVal} onChange={e => setSearchVal(e.target.value)}
          placeholder="Search ticker, name…"
          style={{
            width: '100%', padding: '7px 12px 7px 34px', background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 8, fontSize: 13, color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Theme toggle */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setShowTheme(v => !v)}
          style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <Icon name={isDark ? 'moon' : 'sun'} size={15} />
          <span style={{ fontFamily: 'var(--font-mono)' }}>{themeName}</span>
        </button>
        {showTheme && (
          <div style={{ position: 'absolute', top: 38, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, minWidth: 160, zIndex: 999, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            {themes.map(t => (
              <button key={t} onClick={() => { onThemeChange(t); setShowTheme(false); }}
                style={{
                  width: '100%', padding: '10px 14px', textAlign: 'left', background: t === themeName ? 'var(--accent-dim)' : 'transparent',
                  border: 'none', cursor: 'pointer', color: t === themeName ? 'var(--accent)' : 'var(--text)', fontSize: 13, borderRadius: 4,
                }}>
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div style={{ position: 'relative' }} ref={notifRef}>
        <button onClick={() => setShowNotifs(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 6, display: 'flex', position: 'relative', borderRadius: 8 }}>
          <Icon name="bell" size={18} />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%',
              background: 'var(--loss)', border: '1.5px solid var(--surface)',
            }} />
          )}
        </button>
        {showNotifs && (
          <div style={{
            position: 'absolute', top: 38, right: 0, width: 320, background: 'var(--surface)',
            border: '1px solid var(--border)', borderRadius: 10, zIndex: 999, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
              Alerts ({unread} unread)
            </div>
            {data.convictionAlerts.map(a => (
              <div key={a.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', opacity: a.read ? 0.6 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                    background: a.severity === 'high' ? 'var(--loss)' : a.severity === 'medium' ? 'var(--warn)' : 'var(--info)',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{a.ticker} — {a.type}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{a.message}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, fontFamily: 'var(--font-mono)' }}>{a.date}</div>
                  </div>
                </div>
              </div>
            ))}
            {data.convictionAlerts.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>No alerts</div>
            )}
          </div>
        )}
      </div>

      {/* Day change */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: data.dayChange >= 0 ? 'var(--gain)' : 'var(--loss)', whiteSpace: 'nowrap' }}>
        {data.dayChange >= 0 ? '+' : ''}₹{Math.abs(data.dayChange).toLocaleString('en-IN')} ({data.dayChange >= 0 ? '+' : ''}{data.dayChangePct.toFixed(2)}%)
      </div>
    </header>
  );
}
