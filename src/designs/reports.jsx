// Reports Screen — sidebar list + iframe viewer
const { useState, useMemo } = React;

function Reports({ data, searchQuery }) {
  const { reports } = data;
  const [selected, setSelected] = useState(reports[0]);
  const [recFilter, setRecFilter] = useState('all');

  const filtered = useMemo(() => {
    let list = reports;
    if (recFilter !== 'all') list = list.filter(r => r.rec === recFilter);
    if (searchQuery) list = list.filter(r =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.sector.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return list;
  }, [reports, recFilter, searchQuery]);

  const recColors = { buy: 'var(--gain)', hold: 'var(--warn)', watch: 'var(--info)' };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ── Left: Report list ─────────────────────────────── */}
      <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--surface)', overflow: 'hidden' }}>
        {/* Filter pills */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all','buy','hold','watch'].map(r => (
            <button key={r} onClick={() => setRecFilter(r)}
              style={{ padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 99, border: '1px solid',
                borderColor: recFilter === r ? (r==='all' ? 'var(--accent)' : recColors[r]||'var(--accent)') : 'var(--border)',
                background: recFilter === r ? (r==='all' ? 'var(--accent-muted)' : r==='buy' ? 'var(--gain-bg)' : r==='hold' ? 'var(--warn-bg)' : 'var(--info-bg)') : 'transparent',
                color: recFilter === r ? (r==='all' ? 'var(--accent)' : recColors[r]||'var(--accent)') : 'var(--muted)',
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.04em', transition: 'all .15s' }}>
              {r}
            </button>
          ))}
        </div>

        {/* Count */}
        <div style={{ padding: '8px 14px', fontSize: 11, color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
          {filtered.length} report{filtered.length !== 1 ? 's' : ''}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filtered.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No reports match</div>
          )}
          {filtered.map((r, i) => {
            const isActive = selected?.slug === r.slug;
            return (
              <div key={r.slug} onClick={() => setSelected(r)}
                style={{
                  padding: '12px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                  background: isActive ? 'var(--accent-muted)' : 'transparent',
                  borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                  transition: 'background .15s',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface2)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 600, color: isActive ? 'var(--accent)' : 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{r.ticker} · {r.date}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{r.sector}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <Badge rec={r.rec} size="xs" />
                    <ConvictionDot score={r.conviction} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Viewer ─────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
        {selected ? (
          <>
            {/* Report header bar */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{selected.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px' }}>{selected.ticker}</span>
                  <Badge rec={selected.rec} />
                  <ConvictionDot score={selected.conviction} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{selected.sector} · Analyzed {selected.date}</div>
              </div>
              <a href={selected.file} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent)', textDecoration: 'none', padding: '5px 12px', border: '1px solid var(--accent)', borderRadius: 7, flexShrink: 0, fontWeight: 500, transition: 'background .15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-muted)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Icon name="external" size={13} /> Open full
              </a>
            </div>

            {/* iframe */}
            <iframe
              key={selected.slug}
              src={selected.file}
              title={selected.name}
              style={{ flex: 1, border: 'none', background: '#fff', display: 'block' }}
              sandbox="allow-scripts allow-same-origin"
            />
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, color: 'var(--muted)' }}>
            <Icon name="reports" size={40} color="var(--border)" />
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Select a report</div>
            <div style={{ fontSize: 13 }}>Choose from the list on the left</div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { Reports });
