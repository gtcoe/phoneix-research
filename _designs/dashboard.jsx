// Dashboard Screen
const { useState, useMemo } = React;

// ─── Health Score Ring ────────────────────────────────────
function HealthScoreRing({ score, components }) {
  const size = 110, sw = 12, r = (size - sw) / 2, circ = 2 * Math.PI * r;
  const color = score >= 75 ? 'var(--gain)' : score >= 50 ? 'var(--warn)' : 'var(--loss)';
  const label = score >= 75 ? 'Strong' : score >= 50 ? 'Good' : 'Needs Work';
  const bars = [
    { label: 'XIRR',         value: components.xirrScore,  color: 'var(--accent)' },
    { label: 'Alpha',        value: components.alphaScore, color: 'oklch(0.62 0.14 160)' },
    { label: 'Conviction',   value: components.convScore,  color: 'oklch(0.64 0.14 248)' },
    { label: 'Diversity',    value: components.diversScore,color: 'oklch(0.72 0.14 75)' },
    { label: 'Drawdown',     value: components.drawScore,  color: 'oklch(0.68 0.08 100)' },
  ];
  return (
    <div style={{ display:'flex', gap:16, alignItems:'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink:0 }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeDasharray={`${score/100*circ} ${circ}`} strokeDashoffset={circ/4}
          strokeLinecap="round" style={{ transition:'stroke-dasharray .6s ease' }} />
        <text x={size/2} y={size/2-6} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--text)" fontFamily="var(--font-mono)">{score}</text>
        <text x={size/2} y={size/2+12} textAnchor="middle" fontSize="10" fill={color} fontFamily="var(--font-sans)" fontWeight="600">{label}</text>
      </svg>
      <div style={{ display:'flex', flexDirection:'column', gap:6, flex:1 }}>
        {bars.map(b => (
          <div key={b.label} style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:10, color:'var(--muted)', width:60, textTransform:'uppercase', letterSpacing:'.04em' }}>{b.label}</span>
            <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
              <div style={{ width:`${b.value}%`, height:'100%', background:b.color, borderRadius:99, transition:'width .5s ease' }} />
            </div>
            <span style={{ fontSize:10, fontFamily:'var(--font-mono)', color:'var(--text)', width:28, textAlign:'right' }}>{Math.round(b.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ data, searchQuery }) {
  const { netWorth, totalInvested, totalGains, totalGainsPct, xirr, cagr, alpha, dayChange, dayChangePct, history, assets, reports, healthScore, healthComponents, convictionAlerts } = data;

  // Allocation segments for donut
  const categoryTotals = useMemo(() => {
    const map = {};
    assets.forEach(a => {
      map[a.category] = (map[a.category] || 0) + a.current;
    });
    return map;
  }, [assets]);

  const PALETTE = {
    'NPS':       'oklch(0.62 0.14 245)',
    'NSE Stocks':'var(--accent)',
    'US Stocks': 'oklch(0.62 0.14 200)',
    'Cash':      'oklch(0.70 0.04 100)',
    'FD':        'oklch(0.72 0.10 80)',
  };

  const donutSegments = Object.entries(categoryTotals).map(([label, value]) => ({
    label, value, color: PALETTE[label] || 'var(--muted)'
  }));

  // Top holdings by current value
  const topHoldings = [...assets].sort((a, b) => b.current - a.current).slice(0, 6);

  // Sector allocation
  const sectorMap = {};
  assets.filter(a => a.sector !== 'Govt Scheme' && a.sector !== 'Cash' && a.sector !== 'Fixed Income').forEach(a => {
    sectorMap[a.sector] = (sectorMap[a.sector] || 0) + a.current;
  });
  const totalEquity = Object.values(sectorMap).reduce((s, v) => s + v, 0);
  const sectorData = Object.entries(sectorMap)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({ label, value, pct: value / totalEquity * 100, color: 'var(--accent)' }));

  // Recent reports (last 4)
  const recentReports = reports.slice(0, 4);
  const unreadAlerts = (convictionAlerts || []).filter(a => !a.read && a.severity !== 'low');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: '20px 24px' }}>

      {/* ── Net Worth Hero ─────────────────────────────────── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Total Portfolio Value</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: 38, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-mono)', letterSpacing: '-1px', lineHeight: 1 }}>{fmt(netWorth)}</span>
              <span style={{ fontSize: 14, color: dayChange >= 0 ? 'var(--gain)' : 'var(--loss)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                {dayChange >= 0 ? '▲' : '▼'} {fmt(Math.abs(dayChange))} ({fmtPct(dayChangePct)}) today
              </span>
            </div>
            <div style={{ marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Invested <b style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{fmt(totalInvested)}</b></span>
              <span style={{ fontSize: 12, color: totalGains >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                P&amp;L <b style={{ fontFamily: 'var(--font-mono)' }}>{totalGains >= 0 ? '+' : ''}{fmt(totalGains)} ({fmtPct(totalGainsPct)})</b>
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'XIRR',  value: fmtPct(xirr, 1) },
              { label: 'CAGR',  value: fmtPct(cagr, 1) },
              { label: 'Alpha', value: fmtPct(alpha, 1) },
            ].map(m => (
              <div key={m.label} style={{ textAlign: 'center', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 16px' }}>
                <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{m.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gain)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance sparkline */}
        <div style={{ marginTop: 20, height: 120, position: 'relative' }}>
          <AreaChart data={history} width={900} height={120} />
        </div>
      </div>

      {/* ── Row: Allocation + Holdings ─────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
        {/* Donut */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Allocation</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DonutChart segments={donutSegments} size={160} strokeWidth={26} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {donutSegments.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{s.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{fmt(s.value)}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', minWidth: 40, textAlign: 'right' }}>{(s.value/netWorth*100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Holdings */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14 }}>Top Holdings</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Asset','Category','Current Value','P&L','XIRR',''].map(h => (
                  <th key={h} style={{ fontSize: 10, color: 'var(--muted)', textAlign: h === '' ? 'center' : 'left', padding: '0 0 8px', letterSpacing: '.04em', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border)', paddingRight: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topHoldings.map(a => {
                const gain = a.current - a.invested;
                const gainPct = gain / a.invested * 100;
                const xirrEst = a.xirr || gainPct * 0.7;
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '9px 10px 9px 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{a.name.length > 22 ? a.name.slice(0, 22) + '…' : a.name}</span>
                        {a.ticker && <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{a.exchange}:{a.ticker}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '9px 10px 9px 0', fontSize: 11, color: 'var(--muted)' }}>{a.category}</td>
                    <td style={{ padding: '9px 10px 9px 0', fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text)', fontWeight: 500 }}>{fmt(a.current)}</td>
                    <td style={{ padding: '9px 10px 9px 0' }}>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: gain >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                        {gain >= 0 ? '+' : ''}{fmt(gain)}<br/>
                        <span style={{ fontSize: 10 }}>{fmtPct(gainPct)}</span>
                      </span>
                    </td>
                    <td style={{ padding: '9px 10px 9px 0', fontSize: 12, fontFamily: 'var(--font-mono)', color: xirrEst >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                      {xirrEst >= 0 ? '+' : ''}{xirrEst.toFixed(1)}%
                    </td>
                    <td style={{ padding: '9px 0', textAlign: 'center' }}>
                      {a.rec && <Badge rec={a.rec} size="xs" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Row: Health Score + Sector + Alerts ────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: 16 }}>

        {/* Portfolio Health Score */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 14 }}>Portfolio Health</div>
          {healthScore && healthComponents
            ? <HealthScoreRing score={healthScore} components={healthComponents} />
            : <div style={{ color: 'var(--muted)', fontSize: 12 }}>Calculating…</div>}
        </div>

        {/* Sector */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Equity Sector Exposure</div>
          <HBarChart data={sectorData} height={14} />
        </div>

        {/* Conviction Drift Alerts */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Conviction Alerts</div>
            {unreadAlerts.length > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--loss-bg)', color: 'var(--loss)', padding: '2px 8px', borderRadius: 99 }}>{unreadAlerts.length} new</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
            {(convictionAlerts || []).slice(0, 5).map((a, i) => {
              const color = a.severity==='high' ? 'var(--loss)' : a.severity==='medium' ? 'var(--warn)' : 'var(--gain)';
              return (
                <div key={i} style={{ display: 'flex', gap: 9, padding: '8px 10px', borderRadius: 7,
                  background: a.read ? 'transparent' : 'var(--surface2)',
                  border: `1px solid ${a.read ? 'var(--border)' : color}`,
                  opacity: a.read ? 0.6 : 1 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{a.ticker}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.5, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{a.message}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Recent Reports ────────────────────────────────────── */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Recent Reports</div>
          <span style={{ fontSize: 11, color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}>View all →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 8 }}>
          {recentReports.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{r.sector} · {r.date}</div>
              </div>
              <Badge rec={r.rec} size="xs" />
              <ConvictionDot score={r.conviction} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
