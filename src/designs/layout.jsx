// Sidebar + TopBar layout components
const { useState, useEffect } = React;

// ─── Phoenix Logo ─────────────────────────────────────────
function PhoenixLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" fill="var(--accent)" opacity="0.12"/>
      <path d="M16 9c-1.5 0-5-2.2-8.5-1.5C5.5 8 4 9 3.5 10.5c2.5-.7 5.2-.2 7.2 1.5-.5-1.2-.2-2.7 2.7-3.3.7.1 1.5.6 2.6.7 1.1-.1 1.9-.6 2.6-.7 3 .6 3.2 2.1 2.7 3.3 2-1.7 4.7-2.2 7.2-1.5C28 9 26.5 8 24.5 7.5 21 6.8 17.5 9 16 9z" fill="var(--accent)"/>
      <path d="M10.8 12c-.7 2.2 0 4.8 5.2 6.5 5.2-1.7 5.9-4.3 5.2-6.5-.8 1.2-2.3 2.2-5.2 2.2s-4.4-1-5.2-2.2z" fill="var(--accent)"/>
      <path d="M16 18.5l-2.5 5.5 2.5-2.5 2.5 2.5-2.5-5.5z" fill="var(--accent)"/>
    </svg>
  );
}

// ─── Sidebar ──────────────────────────────────────────────
function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  const nav = [
    { id: 'dashboard', label: 'Dashboard',  icon: 'dashboard' },
    { id: 'portfolio', label: 'Portfolio',  icon: 'portfolio' },
    { id: 'compare',   label: 'Compare',    icon: 'trend'     },
    { id: 'analysis',  label: 'Analysis',   icon: 'analysis'  },
    { id: 'reports',   label: 'Reports',    icon: 'reports'   },
    { id: '__divider', label: null, icon: null },
    { id: 'watchlist', label: 'Watchlist',  icon: 'watchlist' },
    { id: 'journal',   label: 'Journal',    icon: 'note'      },
    { id: 'tools',     label: 'Tools',      icon: 'tools'     },
    { id: 'review',    label: 'Review',     icon: 'review'    },
  ];

  const W = collapsed ? 56 : 220;

  return (
    <aside style={{
      width: W, minWidth: W, height: '100vh', position: 'sticky', top: 0,
      background: 'var(--sidebar)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', transition: 'width .22s cubic-bezier(.4,0,.2,1)',
      overflow: 'hidden', zIndex: 50, flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', padding: collapsed ? '0 14px' : '0 16px', gap: 10, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <PhoenixLogo />
        {!collapsed && (
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', letterSpacing: '-.01em' }}>Phoenix</div>
            <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', marginTop: -1 }}>Research</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(item => {
          if (item.id === '__divider') return (
            <div key="divider" style={{ height: 1, background: 'var(--border)', margin: '6px 12px' }} />
          );
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: collapsed ? '10px 0' : '10px 16px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? 'var(--accent-muted)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--muted)',
                border: 'none', cursor: 'pointer', width: '100%',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all .15s',
                fontSize: 13, fontWeight: active ? 600 : 400,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--muted)'; }}
            >
              <Icon name={item.icon} size={17} />
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(c => !c)}
        style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-end',
          padding: collapsed ? 0 : '0 18px', background: 'transparent', border: 'none', borderTop: '1px solid var(--border)',
          cursor: 'pointer', color: 'var(--muted)', transition: 'color .15s' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform .22s' }}>
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </aside>
  );
}

// ─── TopBar ───────────────────────────────────────────────
function TopBar({ page, darkMode, setDarkMode, searchQuery, setSearchQuery }) {
  const titles = { dashboard: 'Dashboard', portfolio: 'Portfolio', compare: 'Compare', analysis: 'Analysis', reports: 'Research Reports', watchlist: 'Watchlist', journal: 'Trade Journal', tools: 'Tools', review: 'Quarterly Review' };
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { text: 'SKYGOLD up 4.2% today', time: '2m ago', dot: 'var(--gain)' },
    { text: 'New report: DEE Development', time: '1h ago', dot: 'var(--accent)' },
    { text: 'WEBELSOLAR down 2.1%', time: '3h ago', dot: 'var(--loss)' },
  ];

  return (
    <header style={{
      height: 56, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, flexShrink: 0, position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{titles[page]}</span>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Icon name="search" size={14} color="var(--muted)" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search…"
          style={{ marginLeft: 8, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 12px', fontSize: 13, color: 'var(--text)', outline: 'none', width: 180, fontFamily: 'var(--font-sans)' }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, lineHeight: 1 }}>×</button>
        )}
      </div>

      {/* Dark mode */}
      <button onClick={() => setDarkMode(d => !d)}
        style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center' }}
        title="Toggle theme">
        <Icon name={darkMode ? 'sun' : 'moon'} size={15} />
      </button>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button onClick={() => setNotifOpen(o => !o)}
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <Icon name="bell" size={15} />
          <span style={{ position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
        </button>
        {notifOpen && (
          <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, width: 260, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,.18)', zIndex: 100 }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase' }}>Alerts</div>
            {notifications.map((n, i) => (
              <div key={i} style={{ padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10, borderBottom: i < notifications.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: n.dot, marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text)' }}>{n.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar */}
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', flexShrink: 0 }}>
        P
      </div>
    </header>
  );
}

Object.assign(window, { Sidebar, TopBar, PhoenixLogo });
