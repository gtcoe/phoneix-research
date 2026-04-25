// Portfolio + Analysis Screens
const { useState, useMemo } = React;

// ─── Portfolio ─────────────────────────────────────────────
function Portfolio({ data, searchQuery }) {
  const { assets } = data;
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortKey, setSortKey] = useState('current');
  const [sortDir, setSortDir] = useState('desc');
  const [expandedId, setExpandedId] = useState(null);
  const [notes, setNotes] = useState(() => { try { return JSON.parse(localStorage.getItem('px-notes')) || {}; } catch(e) { return {}; } });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');

  function saveNote(id) {
    const next = { ...notes, [id]: noteText };
    setNotes(next);
    localStorage.setItem('px-notes', JSON.stringify(next));
    setEditingNoteId(null);
  }

  const categories = ['All', ...Array.from(new Set(assets.map(a => a.category)))];

  const filtered = useMemo(() => {
    let list = assets;
    if (categoryFilter !== 'All') list = list.filter(a => a.category === categoryFilter);
    if (searchQuery) list = list.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || (a.ticker && a.ticker.toLowerCase().includes(searchQuery.toLowerCase())));
    return [...list].sort((a, b) => {
      const av = sortKey === 'gain' ? (a.current - a.invested) : sortKey === 'gainPct' ? (a.current - a.invested) / a.invested : a[sortKey] ?? 0;
      const bv = sortKey === 'gain' ? (b.current - b.invested) : sortKey === 'gainPct' ? (b.current - b.invested) / b.invested : b[sortKey] ?? 0;
      return sortDir === 'desc' ? bv - av : av - bv;
    });
  }, [assets, categoryFilter, sortKey, sortDir, searchQuery]);

  // Category summaries
  const catSummary = useMemo(() => {
    const map = {};
    assets.forEach(a => {
      if (!map[a.category]) map[a.category] = { invested: 0, current: 0 };
      map[a.category].invested += a.invested;
      map[a.category].current += a.current;
    });
    return map;
  }, [assets]);

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const SortIcon = ({ k }) => {
    if (sortKey !== k) return <span style={{ color: 'var(--border)', marginLeft: 3 }}>↕</span>;
    return <span style={{ color: 'var(--accent)', marginLeft: 3 }}>{sortDir === 'desc' ? '↓' : '↑'}</span>;
  };

  const totalInvested = filtered.reduce((s, a) => s + a.invested, 0);
  const totalCurrent = filtered.reduce((s, a) => s + a.current, 0);
  const totalGain = totalCurrent - totalInvested;
  const totalGainPct = totalGain / totalInvested * 100;

  const thStyle = { fontSize: 11, color: 'var(--muted)', padding: '10px 12px', textAlign: 'left', cursor: 'pointer', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', userSelect: 'none' };
  const tdStyle = { padding: '10px 12px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' };

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Invested', value: fmt(data.totalInvested), sub: null },
          { label: 'Current Value',  value: fmt(data.netWorth), sub: null },
          { label: 'Total P&L',      value: (data.totalGains >= 0 ? '+' : '') + fmt(data.totalGains), sub: fmtPct(data.totalGainsPct), subColor: data.totalGains >= 0 ? 'var(--gain)' : 'var(--loss)' },
          { label: 'XIRR',           value: fmtPct(data.xirr, 1), sub: 'annualised', subColor: 'var(--gain)' },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Filter:</span>
        {categories.map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)}
            style={{ padding: '5px 12px', fontSize: 12, borderRadius: 99, border: '1px solid',
              borderColor: categoryFilter === c ? 'var(--accent)' : 'var(--border)',
              background: categoryFilter === c ? 'var(--accent-muted)' : 'transparent',
              color: categoryFilter === c ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', fontWeight: categoryFilter === c ? 600 : 400, transition: 'all .15s' }}>
            {c}
            {c !== 'All' && catSummary[c] && (
              <span style={{ marginLeft: 5, opacity: .7 }}>
                {fmtPct((catSummary[c].current - catSummary[c].invested) / catSummary[c].invested * 100)}
              </span>
            )}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>{filtered.length} holdings</div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--surface2)', position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              <th style={{ ...thStyle, width: 24, paddingRight: 0 }}></th>
              <th style={thStyle} onClick={() => handleSort('name')}>Asset <SortIcon k="name" /></th>
              <th style={thStyle}>Category</th>
              <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('invested')}>Invested <SortIcon k="invested" /></th>
              <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('current')}>Current <SortIcon k="current" /></th>
              <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('gain')}>P&amp;L <SortIcon k="gain" /></th>
              <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('gainPct')}>Return %<SortIcon k="gainPct" /></th>
              <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('xirr')}>XIRR ⚡<SortIcon k="xirr" /></th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Signal</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => {
              const gain = a.current - a.invested;
              const gainPct = gain / a.invested * 100;
              const isExpanded = expandedId === a.id;
              return (
                <React.Fragment key={a.id}>
                  <tr style={{ cursor: 'pointer', transition: 'background .12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={() => setExpandedId(isExpanded ? null : a.id)}>
                    <td style={{ ...tdStyle, paddingRight: 0, paddingLeft: 12 }}>
                      <span style={{ color: 'var(--muted)', fontSize: 10, transform: isExpanded ? 'rotate(90deg)' : 'none', display: 'inline-block', transition: 'transform .15s' }}>▶</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{a.name}</div>
                      {a.ticker && <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{a.exchange}:{a.ticker}</div>}
                    </td>
                    <td style={{ ...tdStyle, fontSize: 11, color: 'var(--muted)' }}>{a.category}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmt(a.invested)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{fmt(a.current)}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)', color: gain >= 0 ? 'var(--gain)' : 'var(--loss)', fontWeight: 600 }}>
                      {gain >= 0 ? '+' : ''}{fmt(gain)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)', color: gainPct >= 0 ? 'var(--gain)' : 'var(--loss)', fontWeight: 600 }}>
                      {fmtPct(gainPct)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)', color: a.xirr != null ? (a.xirr >= 0 ? 'var(--gain)' : 'var(--loss)') : 'var(--muted)', fontWeight: 600 }}>
                      {a.xirr != null ? fmtPct(a.xirr, 1) : <span style={{ fontSize: 10, color: 'var(--border)' }}>—</span>}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      {a.rec ? <Badge rec={a.rec} size="xs" /> : <span style={{ fontSize: 10, color: 'var(--border)' }}>—</span>}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={8} style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)', padding: '12px 24px' }}>
                        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                          {[
                            { label: 'Sector',     value: a.sector || '—' },
                            { label: 'Entry Date', value: a.entryDate || '—' },
                            { label: 'Qty / Units', value: a.qty ? fmtNum(a.qty) : '—' },
                            { label: 'Exchange',   value: a.exchange || '—' },
                            { label: 'Conviction', value: a.conviction ? `${a.conviction}/10` : '—' },
                          ].map(f => (
                            <div key={f.label}>
                              <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>{f.label}</div>
                              <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{f.value}</div>
                            </div>
                          ))}
                          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ fontSize: 10, color: 'var(--muted)' }}>Allocation</div>
                            <div style={{ width: 80, height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                              <div style={{ width: `${(a.current / data.netWorth * 100).toFixed(1)}%`, height: '100%', background: 'var(--accent)' }} />
                            </div>
                            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{(a.current / data.netWorth * 100).toFixed(1)}%</div>
                          </div>
                        </div>
                        {/* Notes section */}
                        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>My Notes</span>
                            {editingNoteId !== a.id && (
                              <button onClick={() => { setEditingNoteId(a.id); setNoteText(notes[a.id] || ''); }}
                                style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                {notes[a.id] ? 'Edit' : '+ Add note'}
                              </button>
                            )}
                          </div>
                          {editingNoteId === a.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3}
                                placeholder="Thesis, key risks, quarterly reminders…"
                                style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--accent)', borderRadius: 6, padding: '7px 10px', fontSize: 12, color: 'var(--text)', resize: 'vertical', fontFamily: 'var(--font-sans)', outline: 'none' }} />
                              <div style={{ display: 'flex', gap: 7 }}>
                                <button onClick={() => saveNote(a.id)} style={{ padding: '4px 14px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                                <button onClick={() => setEditingNoteId(null)} style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                                {notes[a.id] && <button onClick={() => { const n={...notes}; delete n[a.id]; setNotes(n); localStorage.setItem('px-notes',JSON.stringify(n)); setEditingNoteId(null); }} style={{ padding:'4px 10px',background:'transparent',border:'1px solid var(--border)',borderRadius:6,color:'var(--loss)',fontSize:12,cursor:'pointer' }}>Delete</button>}
                              </div>
                            </div>
                          ) : notes[a.id] ? (
                            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{notes[a.id]}</p>
                          ) : (
                            <p style={{ fontSize: 12, color: 'var(--border)', fontStyle: 'italic' }}>No notes yet.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {/* Totals row */}
            <tr style={{ background: 'var(--surface2)', fontWeight: 700 }}>
              <td colSpan={2} style={{ ...tdStyle, fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>TOTAL ({filtered.length})</td>
              <td style={tdStyle} />
              <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmt(totalInvested)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{fmt(totalCurrent)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)', color: totalGain >= 0 ? 'var(--gain)' : 'var(--loss)' }}>{totalGain >= 0 ? '+' : ''}{fmt(totalGain)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)', color: totalGainPct >= 0 ? 'var(--gain)' : 'var(--loss)' }}>{fmtPct(totalGainPct)}</td>
              <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--gain)', fontWeight: 700 }}>{fmtPct(data.xirr, 1)}</td>
              <td style={tdStyle} />
            </tr>
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState icon="🔍" title="No holdings match" sub="Try adjusting your filter or search" />}
      </div>
    </div>
  );
}

// ─── Analysis ──────────────────────────────────────────────
function Analysis({ data }) {
  const [tab, setTab] = useState('performance');
  const { assets, history, netWorth } = data;

  // Sector breakdown (equity only)
  const sectorMap = {};
  assets.filter(a => !['Cash','FD','NPS'].includes(a.category)).forEach(a => {
    sectorMap[a.sector] = (sectorMap[a.sector] || 0) + a.current;
  });
  const equityTotal = Object.values(sectorMap).reduce((s, v) => s + v, 0);
  const SECTOR_COLORS = ['var(--accent)', 'oklch(0.62 0.14 245)', 'oklch(0.62 0.14 200)', 'oklch(0.60 0.12 80)', 'oklch(0.68 0.12 130)', 'oklch(0.58 0.14 300)', 'oklch(0.60 0.10 30)'];
  const sectorData = Object.entries(sectorMap)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], i) => ({ label, value, pct: value / equityTotal * 100, color: SECTOR_COLORS[i % SECTOR_COLORS.length] }));

  // Risk metrics
  const convictionDist = [9,9,8,8,8,7,6,5,5,4,3];
  const riskAssets = assets.filter(a => a.rec);

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <TabBar tabs={[
        { id:'performance', label:'Performance'      },
        { id:'sector',      label:'Sector'           },
        { id:'risk',        label:'Risk'             },
        { id:'correlation', label:'Correlation'      },
        { id:'drawdown',    label:'Drawdown'         },
        { id:'rebalance',   label:'Rebalancing'      },
        { id:'timeline',    label:'Timeline'         },
        { id:'holding',     label:'Holding Periods'  },
      ]} active={tab} onChange={setTab} />

      {/* Performance */}
      {tab === 'performance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Portfolio Performance</div>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text)', marginTop: 4 }}>{fmt(netWorth)}</div>
                <div style={{ fontSize: 12, color: 'var(--gain)', marginTop: 2 }}>+{fmt(data.totalGains)} ({fmtPct(data.totalGainsPct)}) all-time</div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                {[['XIRR', fmtPct(data.xirr,1)], ['CAGR', fmtPct(data.cagr,1)], ['Alpha vs Nifty', fmtPct(data.alpha,1)]].map(([l,v]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{l}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gain)', fontFamily: 'var(--font-mono)' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <AreaChart data={history} width={900} height={220} />
          </div>

          {/* Monthly returns heatmap-style */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14 }}>Monthly Returns</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {history.slice(1).map((d, i) => {
                const prev = history[i];
                const ret = (d.value - prev.value) / prev.value * 100;
                const intensity = Math.min(Math.abs(ret) / 5, 1);
                const bg = ret >= 0
                  ? `oklch(${0.75 - intensity * 0.2} ${0.1 + intensity * 0.1} 160)`
                  : `oklch(${0.75 - intensity * 0.2} ${0.1 + intensity * 0.1} 15)`;
                return (
                  <div key={i} title={`${d.date}: ${fmtPct(ret)}`}
                    style={{ width: 56, padding: '8px 4px', borderRadius: 6, background: bg, textAlign: 'center', cursor: 'default' }}>
                    <div style={{ fontSize: 9, color: 'rgba(0,0,0,0.5)', marginBottom: 2 }}>{d.date}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: ret >= 0 ? 'oklch(0.30 0.12 160)' : 'oklch(0.28 0.15 15)', fontFamily: 'var(--font-mono)' }}>{fmtPct(ret)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sector */}
      {tab === 'sector' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 20 }}>Equity Sector Allocation</div>
            <HBarChart data={sectorData} height={22} />
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {sectorData.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{s.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 24 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)', width: 80, textAlign: 'right' }}>{fmt(s.value)}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)', width: 50, textAlign: 'right' }}>{s.pct.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', alignSelf: 'flex-start' }}>Distribution</div>
            <DonutChart segments={sectorData.map((s,i) => ({ ...s, color: SECTOR_COLORS[i % SECTOR_COLORS.length] }))} size={200} strokeWidth={30} />
          </div>
        </div>
      )}

      {/* Risk */}
      {tab === 'risk' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Conviction distribution */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Conviction Score Distribution</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[9,8,7,6,5,4,3].map(score => {
                const count = convictionDist.filter(s => s === score).length;
                if (!count) return null;
                const color = score >= 8 ? 'var(--gain)' : score >= 6 ? 'var(--warn)' : 'var(--loss)';
                return (
                  <div key={score} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{score}</span>
                    <div style={{ flex: 1, background: 'var(--border)', borderRadius: 99, height: 16, overflow: 'hidden' }}>
                      <div style={{ width: `${count / convictionDist.length * 100}%`, height: '100%', background: color, borderRadius: 99, minWidth: 8 }} />
                    </div>
                    <span style={{ width: 80, fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{count} stock{count>1?'s':''}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 20, padding: '12px 14px', background: 'var(--surface2)', borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Average Conviction</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gain)', fontFamily: 'var(--font-mono)' }}>
                {(convictionDist.reduce((s,v)=>s+v,0)/convictionDist.length).toFixed(1)}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--muted)' }}>/10</span>
              </div>
            </div>
          </div>

          {/* Recommendation mix */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Signal Mix</div>
            {['buy','hold','watch'].map(rec => {
              const items = riskAssets.filter(a => a.rec === rec);
              const val = items.reduce((s,a) => s+a.current, 0);
              const pct = val / netWorth * 100;
              return (
                <div key={rec} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Badge rec={rec} size="xs" /><span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>{items.length} holdings</span></span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text)' }}>{fmt(val)} · {pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: rec==='buy'?'var(--gain)':rec==='hold'?'var(--warn)':'var(--info)', borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}

            {/* Risk flags */}
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Risk Flags</div>
              {[
                { label: 'High promoter pledge', asset: 'Indo Tech Transformers', severity: 'high' },
                { label: 'Guidance cut twice', asset: 'RBZ Jewellers', severity: 'medium' },
                { label: 'FCCB dilution risk', asset: 'Cellecor Gadgets', severity: 'medium' },
                { label: 'SME board liquidity', asset: 'Cellecor Gadgets', severity: 'low' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 7, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: f.severity==='high'?'var(--loss)':f.severity==='medium'?'var(--warn)':'var(--muted)', marginTop: 4, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{f.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)' }}>{f.asset}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Correlation Heatmap ───────────────────────────────── */}
      {tab === 'correlation' && (() => {
        const labels = data.corrLabels || [];
        const matrix = data.corrMatrix || [];
        const cellSize = 62;
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'20px 24px', overflowX:'auto' }}>
              <div style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>Return Correlation Matrix — Equity Holdings</div>
              <div style={{ fontSize:11, color:'var(--muted)', marginBottom:16 }}>Based on simulated weekly return patterns. Red = highly correlated, blue = uncorrelated.</div>
              <table style={{ borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ width:90 }} />
                    {labels.map(l => <th key={l} style={{ width:cellSize, fontSize:9, color:'var(--muted)', fontWeight:600, textAlign:'center', padding:'0 2px 8px', letterSpacing:'.03em', textTransform:'uppercase', fontFamily:'var(--font-mono)' }}>{l}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {labels.map((row, ri) => (
                    <tr key={row}>
                      <td style={{ fontSize:9, color:'var(--muted)', fontWeight:600, paddingRight:10, textAlign:'right', fontFamily:'var(--font-mono)', whiteSpace:'nowrap' }}>{row}</td>
                      {labels.map((col, ci) => {
                        const v = matrix[ri]?.[ci] ?? 0;
                        const isDiag = ri === ci;
                        const intensity = isDiag ? 1 : Math.abs(v);
                        const hue = isDiag ? 0 : v > 0.6 ? 15 : v > 0.3 ? 45 : 245;
                        const bg = isDiag ? 'var(--surface2)' : `oklch(${0.85 - intensity*0.28} ${isDiag?0:0.04+intensity*0.14} ${hue})`;
                        const textColor = isDiag ? 'var(--muted)' : intensity > 0.5 ? '#fff' : 'var(--text)';
                        return (
                          <td key={col} title={`${row} × ${col}: ${v.toFixed(2)}`}
                            style={{ width:cellSize, height:cellSize, textAlign:'center', background:bg, border:'2px solid var(--bg)', borderRadius:4, cursor:'default', transition:'transform .1s', fontSize:11, fontWeight:700, color:textColor, fontFamily:'var(--font-mono)' }}
                            onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.12)';e.currentTarget.style.zIndex=10;}}
                            onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.zIndex=1;}}>
                            {isDiag ? '—' : v.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* High correlation warnings */}
              <div style={{ marginTop:20, display:'flex', flexDirection:'column', gap:6 }}>
                <div style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>Notable Correlations</div>
                {[
                  {pair:'AAPL + MSFT',    corr:0.82, note:'Both US tech. Consider diversifying into other geographies or sectors.',          level:'high'},
                  {pair:'DEEDEV + WEBELSOLAR',corr:0.58,note:'Capex/industrial cycle plays. Both benefit from infra spend — concentrated risk.',level:'medium'},
                  {pair:'DEEDEV + SUBROS',corr:0.48, note:'Engineering + Auto — moderate cycle correlation. Acceptable at current weights.', level:'low'},
                ].map((w,i)=>(
                  <div key={i} style={{ display:'flex', gap:12, padding:'9px 12px', borderRadius:8, background:'var(--surface2)', border:'1px solid var(--border)', alignItems:'flex-start' }}>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, color: w.level==='high'?'var(--loss)':w.level==='medium'?'var(--warn)':'var(--info)', flexShrink:0, width:36 }}>{w.corr}</span>
                    <div>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{w.pair}</span>
                      <span style={{ fontSize:11, color:'var(--muted)', display:'block', marginTop:2 }}>{w.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Drawdown Tracker ──────────────────────────────────── */}
      {tab === 'drawdown' && (() => {
        const dd = data.drawdowns || [];
        const portMaxDD = -18.4;
        const niftyMaxDD = -13.2;
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {/* Summary cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
              {[
                {label:'Portfolio Max Drawdown', value:fmtPct(portMaxDD,1), color:'var(--loss)', sub:'Jun–Oct 2024 period'},
                {label:'Nifty 50 Max Drawdown',  value:fmtPct(niftyMaxDD,1), color:'var(--warn)', sub:'Same period'},
                {label:'Excess Drawdown',         value:fmtPct(portMaxDD-niftyMaxDD,1), color:'var(--loss)', sub:'vs benchmark'},
              ].map(s => <StatCard key={s.label} {...s} />)}
            </div>

            {/* Per-stock table */}
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', fontSize:12, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em' }}>Per-Holding Drawdown Analysis</div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead style={{ background:'var(--surface2)' }}>
                  <tr>
                    {['Stock','Entry','ATH','Current','From ATH','Recovery Needed','Max DD'].map(h=>(
                      <th key={h} style={{ fontSize:10, color:'var(--muted)', padding:'8px 12px', textAlign: h==='Stock'?'left':'right', textTransform:'uppercase', letterSpacing:'.04em', fontWeight:600, borderBottom:'1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dd.map((s,i)=>{
                    const fromATH = (s.current - s.ath) / s.ath * 100;
                    const isAtATH = s.current >= s.ath;
                    return (
                      <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'10px 12px', borderBottom:'1px solid var(--border)' }}>
                          <div style={{ fontWeight:600, fontSize:13, color:'var(--text)' }}>{s.name}</div>
                          <div style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--font-mono)' }}>{s.ticker}</div>
                        </td>
                        {[
                          {v:'₹'+s.entry,   c:'var(--muted)'},
                          {v:'₹'+s.ath,     c:'var(--gain)'},
                          {v:'₹'+s.current, c:'var(--text)'},
                          {v:fmtPct(fromATH,1), c: isAtATH?'var(--gain)':'var(--loss)'},
                          {v:isAtATH?'—':fmtPct(s.recoveryNeeded,1),c:'var(--warn)'},
                          {v:fmtPct(s.maxDD,1),c:'var(--loss)'},
                        ].map((m,mi)=>(
                          <td key={mi} style={{ padding:'10px 12px', textAlign:'right', fontFamily:'var(--font-mono)', fontSize:12, fontWeight:600, color:m.c, borderBottom:'1px solid var(--border)' }}>{m.v}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Drawdown bar viz */}
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px' }}>
              <div style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:16 }}>Current Drawdown from ATH — Visual</div>
              {dd.map((s,i)=>{
                const fromATH = Math.abs((s.current - s.ath) / s.ath * 100);
                const maxDD   = Math.abs(s.maxDD);
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                    <span style={{ width:100, fontSize:11, color:'var(--muted)', textAlign:'right', flexShrink:0, fontFamily:'var(--font-mono)' }}>{s.ticker}</span>
                    <div style={{ flex:1, position:'relative', height:20 }}>
                      <div style={{ position:'absolute', inset:0, background:'var(--border)', borderRadius:99 }} />
                      <div style={{ position:'absolute', left:0, top:0, height:'100%', width:`${Math.min(100,fromATH/maxDD*100)}%`, background:'var(--loss)', borderRadius:99, opacity:.8, transition:'width .4s' }} />
                    </div>
                    <span style={{ width:50, fontSize:11, fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--loss)', textAlign:'right' }}>{fmtPct(-fromATH,1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Rebalancing ───────────────────────────────────────── */}
      {tab === 'rebalance' && (() => {
        const STORAGE_KEY = 'px-target-alloc';
        const defaults = { 'NSE Stocks':40, 'US Stocks':25, 'NPS':20, 'FD':10, 'Cash':5 };
        const [targets, setTargets] = React.useState(()=>{ try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||defaults;}catch(e){return defaults;} });
        const totalTarget = Object.values(targets).reduce((s,v)=>s+v,0);

        const catMap = {};
        data.assets.forEach(a => { catMap[a.category] = (catMap[a.category]||0) + a.current; });
        const categories = Object.keys(defaults);
        const suggestions = categories.map(cat=>{
          const curVal   = catMap[cat] || 0;
          const curPct   = curVal / data.netWorth * 100;
          const tgtPct   = targets[cat] || 0;
          const diff     = tgtPct - curPct;
          const amtDiff  = diff / 100 * data.netWorth;
          return { cat, curVal, curPct, tgtPct, diff, amtDiff };
        });

        function setTarget(cat, val) {
          const next = {...targets, [cat]: +val};
          setTargets(next);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        }

        return (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {/* Target sliders */}
              <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <div style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em' }}>Target Allocation</div>
                  <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color: Math.abs(totalTarget-100)<0.5?'var(--gain)':'var(--loss)', fontWeight:700 }}>{totalTarget.toFixed(0)}% / 100%</span>
                </div>
                {categories.map(cat=>(
                  <div key={cat} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, color:'var(--text)', fontWeight:500 }}>{cat}</span>
                      <span style={{ fontSize:12, fontFamily:'var(--font-mono)', fontWeight:700, color:'var(--accent)' }}>{targets[cat]}%</span>
                    </div>
                    <input type="range" min={0} max={60} step={1} value={targets[cat]}
                      onChange={e=>setTarget(cat, e.target.value)}
                      style={{ width:'100%', accentColor:'var(--accent)', cursor:'pointer' }} />
                  </div>
                ))}
                <button onClick={()=>{setTargets(defaults);localStorage.setItem(STORAGE_KEY,JSON.stringify(defaults));}}
                  style={{ padding:'6px 14px', background:'transparent', border:'1px solid var(--border)', borderRadius:7, color:'var(--muted)', fontSize:12, cursor:'pointer', marginTop:4 }}>
                  Reset to defaults
                </button>
              </div>

              {/* Current vs Target */}
              <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px' }}>
                <div style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:16 }}>Current vs Target</div>
                {suggestions.map(s=>(
                  <div key={s.cat} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                      <span style={{ fontSize:12, color:'var(--text)' }}>{s.cat}</span>
                      <span style={{ fontSize:11, fontFamily:'var(--font-mono)', color: Math.abs(s.diff)<2?'var(--gain)':s.diff>0?'var(--info)':'var(--warn)' }}>
                        {s.curPct.toFixed(1)}% → {s.tgtPct}%
                      </span>
                    </div>
                    <div style={{ height:8, background:'var(--border)', borderRadius:99, overflow:'hidden', position:'relative' }}>
                      <div style={{ height:'100%', width:`${Math.min(100,s.curPct/Math.max(...suggestions.map(x=>x.tgtPct),1)*100)}%`, background:'var(--accent)', borderRadius:99, opacity:.6 }} />
                      <div style={{ position:'absolute', top:0, height:'100%', left:0, width:`${Math.min(100,s.tgtPct/Math.max(...suggestions.map(x=>x.tgtPct),1)*100)}%`, border:'2px solid var(--text)', borderRadius:99, background:'transparent' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trade suggestions */}
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px' }}>
              <div style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:14 }}>Suggested Rebalancing Trades</div>
              {suggestions.filter(s=>Math.abs(s.diff)>1).length === 0 && (
                <div style={{ padding:'20px', textAlign:'center', color:'var(--gain)', fontWeight:600, fontSize:14 }}>✓ Portfolio is within 1% of all targets — no rebalancing needed.</div>
              )}
              {suggestions.filter(s=>Math.abs(s.diff)>1).sort((a,b)=>Math.abs(b.diff)-Math.abs(a.diff)).map(s=>{
                const isBuy = s.diff > 0;
                return (
                  <div key={s.cat} style={{ display:'flex', alignItems:'center', gap:16, padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ width:12, height:12, borderRadius:'50%', background:isBuy?'var(--gain)':'var(--warn)', flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{isBuy ? 'Buy' : 'Reduce'} {s.cat}</span>
                      <span style={{ fontSize:11, color:'var(--muted)', display:'block', marginTop:1 }}>Current {s.curPct.toFixed(1)}% → Target {s.tgtPct}% ({s.diff>0?'+':''}{s.diff.toFixed(1)}pp)</span>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-mono)', color:isBuy?'var(--gain)':'var(--warn)' }}>{isBuy?'+':'-'}{fmt(Math.abs(s.amtDiff))}</div>
                      <div style={{ fontSize:10, color:'var(--muted)' }}>suggested amount</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Transaction Timeline ──────────────────────────────── */}
      {tab === 'timeline' && (() => {
        const txs = (data.transactions || []).slice().sort((a,b) => a.dateObj - b.dateObj);
        const CCAT_COLORS = { 'NSE Stocks':'var(--accent)', 'US Stocks':'oklch(0.64 0.14 248)', 'NPS':'oklch(0.72 0.10 80)', 'FD':'oklch(0.68 0.08 100)', 'Cash':'var(--muted)' };
        const years = [...new Set(txs.map(t => t.dateObj.getFullYear()))];
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 24px' }}>
              <div style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>Capital Deployment Timeline</div>
              <div style={{ fontSize:11, color:'var(--muted)', marginBottom:20 }}>Every investment decision plotted in sequence. Each dot is a transaction.</div>

              {years.map(yr => {
                const yearTxs = txs.filter(t => t.dateObj.getFullYear() === yr);
                const totalDeployed = yearTxs.filter(t=>t.type==='buy').reduce((s,t)=>s+t.amount,0);
                return (
                  <div key={yr} style={{ marginBottom:24 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                      <span style={{ fontSize:14, fontWeight:800, color:'var(--text)', fontFamily:'var(--font-mono)', minWidth:44 }}>{yr}</span>
                      <div style={{ flex:1, height:1, background:'var(--border)' }} />
                      <span style={{ fontSize:11, color:'var(--muted)', fontFamily:'var(--font-mono)' }}>{fmt(totalDeployed)} deployed</span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:0, paddingLeft:20, borderLeft:'2px solid var(--border)', marginLeft:22 }}>
                      {yearTxs.map((tx, i) => {
                        const cc = CCAT_COLORS[tx.category] || 'var(--muted)';
                        const d = tx.dateObj;
                        return (
                          <div key={tx.id} style={{ display:'flex', gap:14, paddingBottom:14, position:'relative' }}>
                            {/* Connector dot */}
                            <div style={{ position:'absolute', left:-26, top:4, width:10, height:10, borderRadius:'50%', background:cc, border:'2px solid var(--card)', flexShrink:0 }} />
                            <div style={{ width:70, flexShrink:0 }}>
                              <div style={{ fontSize:11, fontWeight:600, color:'var(--text)', fontFamily:'var(--font-mono)' }}>{d.getDate()} {d.toLocaleDateString('en-IN',{month:'short'})}</div>
                            </div>
                            <div style={{ flex:1, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 13px' }}>
                              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                                  <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px', borderRadius:99, background:tx.type==='buy'?'var(--gain-bg)':'var(--info-bg)', color:tx.type==='buy'?'var(--gain)':'var(--info)', letterSpacing:'.04em' }}>{tx.type.toUpperCase()}</span>
                                  <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{tx.asset}</span>
                                  {tx.ticker && <span style={{ fontSize:10, color:cc, fontFamily:'var(--font-mono)', flexShrink:0 }}>{tx.ticker}</span>}
                                </div>
                                {tx.amount > 0 && <span style={{ fontSize:13, fontWeight:700, fontFamily:'var(--font-mono)', color:'var(--text)', flexShrink:0 }}>{fmt(tx.amount)}</span>}
                              </div>
                              {tx.notes && <p style={{ fontSize:11, color:'var(--muted)', margin:'5px 0 0', lineHeight:1.55 }}>{tx.notes}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── Holding Period Distribution ──────────────────────── */}
      {tab === 'holding' && (() => {
        const equityAssets = assets.filter(a => a.holdingDays !== null && a.holdingDays !== undefined && a.invested > 0 && a.category !== 'Cash');
        const buckets = [
          { label:'< 3 months',  min:0,   max:90,   color:'var(--loss)' },
          { label:'3–6 months',  min:90,  max:180,  color:'var(--warn)' },
          { label:'6–12 months', min:180, max:365,  color:'oklch(0.72 0.14 75)' },
          { label:'1–2 years',   min:365, max:730,  color:'oklch(0.64 0.14 248)' },
          { label:'2–3 years',   min:730, max:1095, color:'var(--gain)' },
          { label:'3+ years',    min:1095,max:99999,color:'oklch(0.62 0.14 160)' },
        ];
        const bucketed = buckets.map(b => ({
          ...b,
          assets: equityAssets.filter(a => a.holdingDays >= b.min && a.holdingDays < b.max),
          value: equityAssets.filter(a => a.holdingDays >= b.min && a.holdingDays < b.max).reduce((s,a)=>s+a.current,0),
        }));
        const maxVal = Math.max(...bucketed.map(b=>b.value), 1);
        const avgHolding = equityAssets.length ? Math.round(equityAssets.reduce((s,a)=>s+(a.holdingDays||0),0)/equityAssets.length) : 0;
        const ltcgCount = equityAssets.filter(a=>a.isLTCG).length;
        const stcgCount = equityAssets.filter(a=>a.isLTCG===false).length;
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {/* Summary */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              {[
                {label:'Average Hold',   value: avgHolding+'d', sub:(avgHolding/365).toFixed(1)+' years'},
                {label:'LTCG Holdings',  value: ltcgCount,      sub:'held >1yr (10% tax)'},
                {label:'STCG Holdings',  value: stcgCount,      sub:'held <1yr (15% tax)'},
                {label:'Longest Hold',   value: Math.max(...equityAssets.map(a=>a.holdingDays||0))+'d', sub:''},
              ].map(s=><StatCard key={s.label} {...s} />)}
            </div>

            {/* Bar chart */}
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px' }}>
              <div style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:16 }}>Holdings by Holding Period (by value)</div>
              {bucketed.map((b, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                  <span style={{ width:110, fontSize:11, color:'var(--muted)', textAlign:'right', flexShrink:0 }}>{b.label}</span>
                  <div style={{ flex:1, height:22, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{ width:`${b.value/maxVal*100}%`, height:'100%', background:b.color, borderRadius:99, minWidth:b.value>0?8:0, transition:'width .4s' }} />
                  </div>
                  <span style={{ width:70, fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text)', fontWeight:600, textAlign:'right' }}>{b.value>0?fmt(b.value):'—'}</span>
                  <span style={{ width:28, fontSize:11, color:'var(--muted)', textAlign:'right' }}>{b.assets.length}</span>
                </div>
              ))}
            </div>

            {/* Per-holding table */}
            <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
              <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', fontSize:12, fontWeight:600, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em' }}>Per-Holding Detail</div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead style={{ background:'var(--surface2)' }}>
                  <tr>
                    {['Asset','Entry Date','Held','Tax Type','XIRR','Annualised Return'].map(h=>(
                      <th key={h} style={{ fontSize:10,color:'var(--muted)',padding:'8px 12px',textAlign:h==='Asset'?'left':'right',textTransform:'uppercase',letterSpacing:'.04em',fontWeight:600,borderBottom:'1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...equityAssets].sort((a,b)=>(b.holdingDays||0)-(a.holdingDays||0)).map((a,i) => {
                    const hStr = a.holdingDays >= 365 ? (a.holdingDays/365).toFixed(1)+'yr' : a.holdingDays+'d';
                    const taxLabel = a.isLTCG ? 'LTCG' : 'STCG';
                    const taxColor = a.isLTCG ? 'var(--gain)' : 'var(--warn)';
                    const annReturn = a.gainPct;
                    return (
                      <tr key={a.id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ padding:'9px 12px',borderBottom:'1px solid var(--border)' }}>
                          <div style={{ fontWeight:600,fontSize:13,color:'var(--text)' }}>{a.name}</div>
                          {a.ticker&&<div style={{ fontSize:10,color:'var(--muted)',fontFamily:'var(--font-mono)' }}>{a.exchange}:{a.ticker}</div>}
                        </td>
                        <td style={{ padding:'9px 12px',borderBottom:'1px solid var(--border)',textAlign:'right',fontSize:12,color:'var(--muted)' }}>{a.entryDate||'—'}</td>
                        <td style={{ padding:'9px 12px',borderBottom:'1px solid var(--border)',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:600,color:'var(--text)' }}>{hStr}</td>
                        <td style={{ padding:'9px 12px',borderBottom:'1px solid var(--border)',textAlign:'right' }}>
                          {a.isLTCG!==null&&a.isLTCG!==undefined?<span style={{ fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:99,background:a.isLTCG?'var(--gain-bg)':'var(--warn-bg)',color:taxColor }}>{taxLabel}</span>:'—'}
                        </td>
                        <td style={{ padding:'9px 12px',borderBottom:'1px solid var(--border)',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:600,color:a.xirr>=0?'var(--gain)':'var(--loss)' }}>{a.xirr!=null?fmtPct(a.xirr,1):'—'}</td>
                        <td style={{ padding:'9px 12px',borderBottom:'1px solid var(--border)',textAlign:'right',fontFamily:'var(--font-mono)',fontSize:12,fontWeight:600,color:annReturn>=0?'var(--gain)':'var(--loss)' }}>{fmtPct(annReturn,1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Insight */}
            <div style={{ background:'var(--surface2)', border:'1px solid var(--info)', borderRadius:10, padding:'12px 16px' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--info)', marginBottom:4 }}>💡 Holding Period Insight</div>
              <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>
                {ltcgCount} of your {equityAssets.length} equity holdings qualify for LTCG (10% tax). Average holding period is <b style={{color:'var(--text)'}}>{(avgHolding/365).toFixed(1)} years</b>. Letting STCG holdings cross the 1-year mark saves you 5% in taxes (15% → 10%). Next LTCG threshold: check DEEDEV &amp; Vintage Coffee.
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

Object.assign(window, { Portfolio, Analysis });
