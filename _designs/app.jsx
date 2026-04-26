// Main App — theme system + routing + tweaks
const { useState, useEffect, useCallback } = React;

// ── Theme definitions ─────────────────────────────────────
const THEMES = {
  'Console Dark': {
    '--bg':          '#0C0E12',
    '--surface':     '#111318',
    '--surface2':    '#1A1D24',
    '--card':        '#161921',
    '--sidebar':     '#0C0E12',
    '--border':      'rgba(255,255,255,0.07)',
    '--text':        '#EDF0F5',
    '--muted':       '#7A7F96',
    '--accent':      'oklch(0.52 0.19 15)',
    '--accent-muted':'rgba(192,57,43,0.12)',
    '--gain':        'oklch(0.62 0.14 160)',
    '--gain-bg':     'rgba(27,138,90,0.15)',
    '--loss':        'oklch(0.58 0.20 15)',
    '--loss-bg':     'rgba(192,57,43,0.15)',
    '--warn':        'oklch(0.72 0.14 75)',
    '--warn-bg':     'rgba(185,130,0,0.15)',
    '--info':        'oklch(0.64 0.14 248)',
    '--info-bg':     'rgba(37,99,200,0.15)',
  },
  'Pro Light': {
    '--bg':          '#F0F2F6',
    '--surface':     '#FFFFFF',
    '--surface2':    '#F5F6FA',
    '--card':        '#FFFFFF',
    '--sidebar':     '#FFFFFF',
    '--border':      '#E3E6EE',
    '--text':        '#0F1117',
    '--muted':       '#6B7280',
    '--accent':      'oklch(0.50 0.19 15)',
    '--accent-muted':'rgba(192,57,43,0.08)',
    '--gain':        'oklch(0.45 0.15 160)',
    '--gain-bg':     'rgba(22,101,52,0.08)',
    '--loss':        'oklch(0.50 0.19 15)',
    '--loss-bg':     'rgba(192,57,43,0.08)',
    '--warn':        'oklch(0.52 0.13 75)',
    '--warn-bg':     'rgba(130,90,0,0.08)',
    '--info':        'oklch(0.48 0.14 248)',
    '--info-bg':     'rgba(29,78,216,0.08)',
  },
  'Midnight': {
    '--bg':          '#060810',
    '--surface':     '#0A0D16',
    '--surface2':    '#131825',
    '--card':        '#0F1320',
    '--sidebar':     '#080B14',
    '--border':      'rgba(255,255,255,0.06)',
    '--text':        '#E8EBF2',
    '--muted':       '#606880',
    '--accent':      'oklch(0.58 0.22 12)',
    '--accent-muted':'rgba(220,38,38,0.14)',
    '--gain':        'oklch(0.64 0.16 155)',
    '--gain-bg':     'rgba(22,163,74,0.14)',
    '--loss':        'oklch(0.60 0.22 12)',
    '--loss-bg':     'rgba(220,38,38,0.14)',
    '--warn':        'oklch(0.74 0.16 72)',
    '--warn-bg':     'rgba(202,138,4,0.14)',
    '--info':        'oklch(0.66 0.16 245)',
    '--info-bg':     'rgba(59,130,246,0.14)',
  },
};

const SAVED_PAGE = localStorage.getItem('px-page') || 'dashboard';
const SAVED_THEME = localStorage.getItem('px-theme') || 'Console Dark';
const SAVED_COLLAPSED = localStorage.getItem('px-collapsed') === 'true';

function App() {
  const [page, setPage] = useState(SAVED_PAGE);
  const [themeName, setThemeName] = useState(SAVED_THEME);
  const [collapsed, setCollapsed] = useState(SAVED_COLLAPSED);
  const [searchQuery, setSearchQuery] = useState('');
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [density, setDensity] = useState('compact');

  const theme = THEMES[themeName];
  const isDark = themeName !== 'Pro Light';

  // Persist nav state
  useEffect(() => { localStorage.setItem('px-page', page); }, [page]);
  useEffect(() => { localStorage.setItem('px-theme', themeName); }, [themeName]);
  useEffect(() => { localStorage.setItem('px-collapsed', collapsed); }, [collapsed]);

  // Apply theme CSS vars to :root
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([k, v]) => root.style.setProperty(k, v));
    root.style.setProperty('color-scheme', isDark ? 'dark' : 'light');
  }, [themeName]);

  // Tweaks edit-mode protocol
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const data = window.phoenixData;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)', fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>

      {/* Sidebar */}
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar page={page} darkMode={isDark} setDarkMode={() => setThemeName(t => t === 'Pro Light' ? 'Console Dark' : 'Pro Light')} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Screen content */}
        <div style={{ flex: 1, overflowY: page === 'reports' ? 'hidden' : 'auto' }}>
          {page === 'dashboard' && <Dashboard      data={data} searchQuery={searchQuery} />}
          {page === 'portfolio' && <Portfolio      data={data} searchQuery={searchQuery} />}
          {page === 'compare'   && <Compare        data={data} />}
          {page === 'analysis'  && <Analysis       data={data} />}
          {page === 'reports'   && <Reports        data={data} searchQuery={searchQuery} />}
          {page === 'watchlist' && <Watchlist      data={data} />}
          {page === 'journal'   && <Journal        data={data} />}
          {page === 'tools'     && <Tools          data={data} />}
          {page === 'review'    && <QuarterlyReview data={data} />}
        </div>
      </div>

      {/* ── Tweaks Panel ──────────────────────────────────── */}
      {tweaksOpen && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, width: 280, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 12px 48px rgba(0,0,0,0.32)', zIndex: 1000, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.08em', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Tweaks
            <button onClick={() => setTweaksOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, lineHeight: 1 }}>×</button>
          </div>

          {/* Theme */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Theme</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.keys(THEMES).map(name => (
                <button key={name} onClick={() => { setThemeName(name); window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { theme: name } }, '*'); }}
                  style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${themeName === name ? 'var(--accent)' : 'var(--border)'}`,
                    background: themeName === name ? 'var(--accent-muted)' : 'var(--surface2)',
                    color: themeName === name ? 'var(--accent)' : 'var(--text)', cursor: 'pointer', fontSize: 13, fontWeight: themeName === name ? 700 : 400,
                    textAlign: 'left', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {name}
                  {themeName === name && <span style={{ fontSize: 10, opacity: .7 }}>ACTIVE</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Sidebar</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['Expanded', false], ['Collapsed', true]].map(([label, val]) => (
                <button key={label} onClick={() => setCollapsed(val)}
                  style={{ flex: 1, padding: '7px', borderRadius: 7, border: `1px solid ${collapsed === val ? 'var(--accent)' : 'var(--border)'}`,
                    background: collapsed === val ? 'var(--accent-muted)' : 'var(--surface2)',
                    color: collapsed === val ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', fontSize: 12, fontWeight: collapsed === val ? 700 : 400, transition: 'all .15s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation shortcuts */}
          <div style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Jump to screen</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {['dashboard','portfolio','compare','analysis','reports','watchlist','journal','tools','review'].map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ padding: '7px', borderRadius: 7, border: `1px solid ${page === p ? 'var(--accent)' : 'var(--border)'}`,
                    background: page === p ? 'var(--accent-muted)' : 'var(--surface2)',
                    color: page === p ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', fontSize: 12, fontWeight: page === p ? 700 : 400,
                    textTransform: 'capitalize', transition: 'all .15s' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
