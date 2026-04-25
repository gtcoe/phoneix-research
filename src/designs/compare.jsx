// Compare Screen — Portfolio vs Benchmarks
const { useState, useMemo } = React;

function Compare({ data }) {
  const { history, netWorth, totalInvested, xirr, cagr, alpha, assets } = data;
  const benchmarks = data.benchmarks || {
    nifty50:   { label:'Nifty 50',         color:'oklch(0.64 0.14 248)', xirr:12.0, cagr:12.0, history: history },
    midcap150: { label:'Nifty Midcap 150', color:'oklch(0.72 0.14 75)',  xirr:18.2, cagr:18.2, history: history },
    fd:        { label:'Fixed Deposit',     color:'oklch(0.68 0.08 240)', xirr:7.2,  cagr:7.2,  history: history },
  };
  const [activeBenchmarks, setActiveBenchmarks] = useState(['nifty50', 'midcap150', 'fd']);
  const [hovered, setHovered] = useState(null);
  const [tab, setTab] = useState('growth');

  const toggleBenchmark = (key) => {
    setActiveBenchmarks(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // ── Combined chart data ──────────────────────────────────────────────────
  const chartLines = useMemo(() => {
    const lines = [
      { key: 'portfolio', label: 'My Portfolio', color: 'var(--accent)', data: history, xirr, cagr }
    ];
    Object.entries(benchmarks).forEach(([key, bm]) => {
      if (activeBenchmarks.includes(key)) {
        lines.push({ key, label: bm.label, color: bm.color, data: bm.history, xirr: bm.xirr, cagr: bm.cagr });
      }
    });
    return lines;
  }, [activeBenchmarks, history, benchmarks]);

  // ── Multi-line SVG chart ─────────────────────────────────────────────────
  const W = 860, H = 240, padL = 56, padR = 16, padT = 16, padB = 32;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const n = history.length;

  const allVals = chartLines.flatMap(l => l.data.map(d => d.value));
  const minV = Math.min(...allVals) * 0.97;
  const maxV = Math.max(...allVals) * 1.01;
  const range = maxV - minV;

  const toX = i => padL + (i / (n - 1)) * chartW;
  const toY = v => padT + chartH - ((v - minV) / range) * chartH;

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = minV + (range * i / yTicks);
    return { y: toY(v), label: fmt(v) };
  }).reverse();

  const xLabels = history.filter((_, i) => i % 3 === 0 || i === n - 1);

  // Per-holding excess return vs Nifty
  const equityAssets = assets.filter(a => a.rec && a.xirr !== null);
  const niftyXIRR = benchmarks.nifty50.xirr;
  const midcapXIRR = benchmarks.midcap150.xirr;

  // Simulated drawdown for portfolio vs Nifty
  const drawdowns = history.slice(1).map((d, i) => {
    const prev = history[i];
    const portRet = (d.value - prev.value) / prev.value * 100;
    const niftyD = benchmarks.nifty50.history;
    const niftyRet = (niftyD[i+1].value - niftyD[i].value) / niftyD[i].value * 100;
    return { date: d.date, portfolio: portRet, nifty: niftyRet, excess: portRet - niftyRet };
  });

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header metrics ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
        {[
          { label: 'Portfolio XIRR',    value: fmtPct(xirr, 2),   sub: 'real cashflow-weighted', subColor: 'var(--gain)', accent: true },
          { label: 'vs Nifty 50',       value: fmtPct(xirr - benchmarks.nifty50.xirr, 2),   sub: `Nifty: ${fmtPct(benchmarks.nifty50.xirr,1)}`,   subColor: (xirr - benchmarks.nifty50.xirr) >= 0 ? 'var(--gain)' : 'var(--loss)' },
          { label: 'vs Midcap 150',     value: fmtPct(xirr - benchmarks.midcap150.xirr, 2), sub: `Midcap: ${fmtPct(benchmarks.midcap150.xirr,1)}`, subColor: (xirr - benchmarks.midcap150.xirr) >= 0 ? 'var(--gain)' : 'var(--loss)' },
          { label: 'vs Fixed Deposit',  value: fmtPct(xirr - benchmarks.fd.xirr, 2),        sub: `FD: ${fmtPct(benchmarks.fd.xirr,1)}`,            subColor: (xirr - benchmarks.fd.xirr) >= 0 ? 'var(--gain)' : 'var(--loss)' },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Tab bar ───────────────────────────────────────────────── */}
      <TabBar
        tabs={[{ id: 'growth', label: 'Cumulative Growth' }, { id: 'monthly', label: 'Monthly Excess Returns' }, { id: 'holdings', label: 'Holding-level Alpha' }]}
        active={tab} onChange={setTab}
      />

      {/* ── Growth Chart ──────────────────────────────────────────── */}
      {tab === 'growth' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
          {/* Legend + toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            {/* Portfolio (always on) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 2, background: 'var(--accent)', display: 'inline-block', borderRadius: 1 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>My Portfolio</span>
              <span style={{ fontSize: 11, color: 'var(--gain)', fontFamily: 'var(--font-mono)', marginLeft: 2 }}>XIRR {fmtPct(xirr,1)}</span>
            </div>
            {Object.entries(benchmarks).map(([key, bm]) => {
              const active = activeBenchmarks.includes(key);
              return (
                <button key={key} onClick={() => toggleBenchmark(key)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 7,
                    border: `1px solid ${active ? bm.color : 'var(--border)'}`,
                    background: active ? `${bm.color}18` : 'transparent',
                    cursor: 'pointer', opacity: active ? 1 : 0.45, transition: 'all .15s' }}>
                  <span style={{ width: active ? 20 : 12, height: 2, background: bm.color, display: 'inline-block', borderRadius: 1, transition: 'width .2s' }} />
                  <span style={{ fontSize: 12, color: active ? 'var(--text)' : 'var(--muted)', fontWeight: active ? 600 : 400 }}>{bm.label}</span>
                  <span style={{ fontSize: 11, color: bm.color, fontFamily: 'var(--font-mono)' }}>{fmtPct(bm.xirr,1)}</span>
                </button>
              );
            })}
          </div>

          {/* SVG multi-line chart */}
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}
            onMouseMove={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const mx = (e.clientX - rect.left) * (W / rect.width) - padL;
              setHovered(Math.max(0, Math.min(n - 1, Math.round((mx / chartW) * (n - 1)))));
            }}
            onMouseLeave={() => setHovered(null)}>

            {/* Grid */}
            {yLabels.map((t, i) => (
              <g key={i}>
                <line x1={padL} y1={t.y} x2={padL + chartW} y2={t.y} stroke="var(--border)" strokeWidth="1" strokeDasharray="3,4" />
                <text x={padL - 6} y={t.y + 4} textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">{t.label}</text>
              </g>
            ))}
            {xLabels.map((d, i) => {
              const idx = history.indexOf(d);
              return <text key={i} x={toX(idx)} y={padT + chartH + 20} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">{d.date}</text>;
            })}

            {/* Lines */}
            {chartLines.map(line => {
              const pts = line.data.map((d, i) => [toX(i), toY(d.value)]);
              const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
              const area = path + ` L${pts[pts.length-1][0].toFixed(1)},${(padT+chartH).toFixed(1)} L${padL},${(padT+chartH).toFixed(1)} Z`;
              const isPortfolio = line.key === 'portfolio';
              return (
                <g key={line.key}>
                  {isPortfolio && <path d={area} fill={line.color} opacity="0.08" />}
                  <path d={path} fill="none" stroke={line.color} strokeWidth={isPortfolio ? 2.5 : 1.5}
                    strokeDasharray={isPortfolio ? 'none' : line.key === 'fd' ? '5,4' : 'none'}
                    strokeLinecap="round" strokeLinejoin="round" />
                </g>
              );
            })}

            {/* Hover crosshair */}
            {hovered !== null && (
              <g>
                <line x1={toX(hovered)} y1={padT} x2={toX(hovered)} y2={padT + chartH}
                  stroke="var(--muted)" strokeWidth="1" strokeDasharray="3,3" />
                {/* Tooltip */}
                <g transform={`translate(${Math.min(toX(hovered) + 10, W - 150)},${padT + 4})`}>
                  <rect x="0" y="0" width="140" height={14 + chartLines.length * 18} rx="6"
                    fill="var(--surface2)" stroke="var(--border)" strokeWidth="1" />
                  <text x="8" y="12" fontSize="9" fill="var(--muted)" fontFamily="var(--font-mono)">{history[hovered].date}</text>
                  {chartLines.map((line, li) => (
                    <g key={line.key} transform={`translate(0,${14 + li * 18})`}>
                      <circle cx="12" cy="8" r="3" fill={line.color} />
                      <text x="20" y="12" fontSize="10" fill="var(--text)" fontFamily="var(--font-mono)">{fmt(line.data[hovered]?.value ?? 0)}</text>
                    </g>
                  ))}
                </g>
                {/* Dots on lines */}
                {chartLines.map(line => (
                  <circle key={line.key} cx={toX(hovered)} cy={toY(line.data[hovered]?.value ?? minV)}
                    r="4" fill={line.color} stroke="var(--surface)" strokeWidth="2" />
                ))}
              </g>
            )}
          </svg>
        </div>
      )}

      {/* ── Monthly Excess Returns ─────────────────────────────────── */}
      {tab === 'monthly' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Monthly Alpha vs Nifty 50</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>Positive = outperformed Nifty that month</div>

            {/* Bar chart */}
            <svg width="100%" viewBox="0 0 860 180" style={{ display: 'block', overflow: 'visible' }}>
              {(() => {
                const barW = Math.floor(chartW / drawdowns.length) - 3;
                const maxAbs = Math.max(...drawdowns.map(d => Math.abs(d.excess)), 1);
                const midY = 80, scale = 60;
                return (
                  <g transform="translate(56,0)">
                    <line x1={0} y1={midY} x2={chartW} y2={midY} stroke="var(--border)" strokeWidth="1" />
                    <text x={-6} y={midY + 4} textAnchor="end" fontSize="9" fill="var(--muted)" fontFamily="var(--font-mono)">0%</text>
                    {drawdowns.map((d, i) => {
                      const h = Math.abs(d.excess) / maxAbs * scale;
                      const isPos = d.excess >= 0;
                      return (
                        <g key={i}>
                          <rect
                            x={i * (barW + 3)} y={isPos ? midY - h : midY}
                            width={barW} height={h}
                            fill={isPos ? 'var(--gain)' : 'var(--loss)'} opacity="0.85" rx="2"
                          />
                          {i % 3 === 0 && (
                            <text x={i * (barW + 3) + barW / 2} y={midY + 70} textAnchor="middle" fontSize="9" fill="var(--muted)" fontFamily="var(--font-mono)">{d.date}</text>
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })()}
            </svg>

            {/* Summary */}
            <div style={{ display: 'flex', gap: 24, marginTop: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Months outperformed', value: drawdowns.filter(d => d.excess > 0).length, color: 'var(--gain)' },
                { label: 'Months underperformed', value: drawdowns.filter(d => d.excess < 0).length, color: 'var(--loss)' },
                { label: 'Best month alpha', value: fmtPct(Math.max(...drawdowns.map(d => d.excess))), color: 'var(--gain)' },
                { label: 'Worst month alpha', value: fmtPct(Math.min(...drawdowns.map(d => d.excess))), color: 'var(--loss)' },
                { label: 'Avg monthly alpha', value: fmtPct(drawdowns.reduce((s,d)=>s+d.excess,0)/drawdowns.length), color: 'var(--text)' },
              ].map(m => (
                <div key={m.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: m.color, fontFamily: 'var(--font-mono)' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Holding-level alpha ────────────────────────────────────── */}
      {tab === 'holdings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>
              Individual Stock XIRR vs Benchmarks
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--surface2)' }}>
                  {['Stock','XIRR','vs Nifty','vs Midcap','Signal','Conviction'].map(h => (
                    <th key={h} style={{ fontSize: 10, color: 'var(--muted)', padding: '8px 12px', textAlign: h === 'Stock' ? 'left' : 'right', letterSpacing: '.04em', textTransform: 'uppercase', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...equityAssets].sort((a, b) => (b.xirr ?? 0) - (a.xirr ?? 0)).map(a => {
                  const vsNifty = (a.xirr ?? 0) - niftyXIRR;
                  const vsMid   = (a.xirr ?? 0) - midcapXIRR;
                  const td = (v, color) => (
                    <td style={{ padding: '10px 12px', fontSize: 13, textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color, borderBottom: '1px solid var(--border)' }}>{v}</td>
                  );
                  return (
                    <tr key={a.id}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{a.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{a.exchange}:{a.ticker}</div>
                      </td>
                      {td(fmtPct(a.xirr ?? 0, 1), a.xirr >= 0 ? 'var(--gain)' : 'var(--loss)')}
                      {td(fmtPct(vsNifty, 1), vsNifty >= 0 ? 'var(--gain)' : 'var(--loss)')}
                      {td(fmtPct(vsMid, 1),   vsMid   >= 0 ? 'var(--gain)' : 'var(--loss)')}
                      <td style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                        {a.rec && <Badge rec={a.rec} size="xs" />}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid var(--border)' }}>
                        <ConvictionDot score={a.conviction} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Alpha waterfall */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>XIRR vs Nifty 50 — Sorted</div>
            {[...equityAssets].sort((a, b) => ((b.xirr??0) - niftyXIRR) - ((a.xirr??0) - niftyXIRR)).map(a => {
              const excess = (a.xirr ?? 0) - niftyXIRR;
              const maxExcess = 40;
              const barPct = Math.min(Math.abs(excess) / maxExcess * 100, 100);
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ width: 140, fontSize: 12, color: 'var(--muted)', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.ticker}</span>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', height: 20 }}>
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--border)' }} />
                    {excess >= 0 ? (
                      <div style={{ marginLeft: '50%', width: `${barPct / 2}%`, height: '100%', background: 'var(--gain)', borderRadius: '0 4px 4px 0', minWidth: 4 }} />
                    ) : (
                      <div style={{ marginLeft: `calc(50% - ${barPct / 2}%)`, width: `${barPct / 2}%`, height: '100%', background: 'var(--loss)', borderRadius: '4px 0 0 4px', minWidth: 4 }} />
                    )}
                  </div>
                  <span style={{ width: 54, fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: excess >= 0 ? 'var(--gain)' : 'var(--loss)' }}>{excess >= 0 ? '+' : ''}{excess.toFixed(1)}%</span>
                </div>
              );
            })}
            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>Nifty 50 XIRR baseline: {fmtPct(niftyXIRR, 1)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Compare });
