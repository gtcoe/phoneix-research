// Shared UI components — exports to window
const { useState, useRef, useEffect, useMemo } = React;

// ─── Formatters ──────────────────────────────────────────
function fmt(n) {
  if (n >= 10000000) return '₹' + (n/10000000).toFixed(2) + 'Cr';
  if (n >= 100000)   return '₹' + (n/100000).toFixed(2) + 'L';
  if (n >= 1000)     return '₹' + (n/1000).toFixed(1) + 'K';
  return '₹' + n.toLocaleString('en-IN');
}
function fmtPct(n, decimals=1) {
  const sign = n >= 0 ? '+' : '';
  return sign + n.toFixed(decimals) + '%';
}
function fmtNum(n) { return n.toLocaleString('en-IN'); }

// ─── Badge ────────────────────────────────────────────────
function Badge({ rec, size='sm' }) {
  const cfg = {
    buy:   { label:'BUY',   bg:'var(--gain-bg)',    color:'var(--gain)' },
    hold:  { label:'HOLD',  bg:'var(--warn-bg)',    color:'var(--warn)' },
    watch: { label:'WATCH', bg:'var(--info-bg)',    color:'var(--info)' },
    sell:  { label:'SELL',  bg:'var(--loss-bg)',    color:'var(--loss)' },
  };
  const c = cfg[rec] || { label: rec.toUpperCase(), bg:'var(--surface2)', color:'var(--muted)' };
  const px = size === 'xs' ? '5px 8px' : '3px 10px';
  const fs = size === 'xs' ? '10px' : '11px';
  return (
    <span style={{ background: c.bg, color: c.color, padding: px, borderRadius: 99, fontSize: fs, fontWeight: 700, letterSpacing: '.04em', whiteSpace: 'nowrap' }}>
      {c.label}
    </span>
  );
}

// ─── ConvictionDot ────────────────────────────────────────
function ConvictionDot({ score }) {
  if (!score) return null;
  const color = score >= 8 ? 'var(--gain)' : score >= 6 ? 'var(--warn)' : 'var(--muted)';
  return (
    <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:22, height:22, borderRadius:'50%', background:'var(--surface2)', color, fontSize:11, fontWeight:700, fontFamily:'var(--font-mono)' }}>
      {score}
    </span>
  );
}

// ─── Gain/Loss display ────────────────────────────────────
function Gain({ value, pct, mono=true }) {
  const isPos = value >= 0;
  const color = isPos ? 'var(--gain)' : 'var(--loss)';
  return (
    <span style={{ color, fontFamily: mono ? 'var(--font-mono)' : 'inherit', fontSize: 'inherit' }}>
      {isPos ? '+' : ''}{fmt(value)}
      {pct !== undefined && <span style={{ color, opacity: .8, fontSize: '0.85em', marginLeft: 4 }}>({fmtPct(pct)})</span>}
    </span>
  );
}

// ─── Sparkline ───────────────────────────────────────────
function Sparkline({ data, width=80, height=32, color='var(--accent)' }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(' L ')}`;
  const areaD = `M 0,${height} L ${pts.join(' L ')} L ${width},${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display:'block' }}>
      <defs>
        <linearGradient id={`sg-${color.replace(/[^a-z]/gi,'')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${color.replace(/[^a-z]/gi,'')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Area / Line Chart ────────────────────────────────────
function AreaChart({ data, width=600, height=200, color='var(--accent)', labelKey='date', valueKey='value' }) {
  const [hovered, setHovered] = useState(null);
  const svgRef = useRef(null);
  const padL=48, padR=16, padT=12, padB=32;
  const W = width - padL - padR;
  const H = height - padT - padB;
  const vals = data.map(d => d[valueKey]);
  const min = Math.min(...vals) * 0.97;
  const max = Math.max(...vals) * 1.01;
  const range = max - min;
  const toX = i => padL + (i / (data.length - 1)) * W;
  const toY = v => padT + H - ((v - min) / range) * H;
  const pts = data.map((d, i) => [toX(i), toY(d[valueKey])]);
  const linePath = pts.map((p,i) => `${i===0?'M':'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L${pts[pts.length-1][0].toFixed(1)},${(padT+H).toFixed(1)} L${padL},${(padT+H).toFixed(1)} Z`;

  // Y-axis labels
  const yTicks = 4;
  const yLabels = Array.from({length: yTicks+1}, (_,i) => {
    const v = min + (range * i / yTicks);
    return { y: toY(v), label: fmt(v) };
  }).reverse();

  // X labels — show every 3rd
  const xLabels = data.filter((_,i) => i % 3 === 0 || i === data.length-1);

  const handleMouseMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left - padL;
    const idx = Math.round((mx / W) * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length-1, idx));
    setHovered(clamped);
  };

  return (
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display:'block', overflow:'visible' }}
      onMouseMove={handleMouseMove} onMouseLeave={() => setHovered(null)}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Y grid */}
      {yLabels.map((t,i) => (
        <g key={i}>
          <line x1={padL} y1={t.y} x2={padL+W} y2={t.y} stroke="var(--border)" strokeWidth="1" strokeDasharray="3,4" />
          <text x={padL-6} y={t.y+4} textAnchor="end" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">{t.label}</text>
        </g>
      ))}
      {/* X labels */}
      {xLabels.map((d,i) => {
        const idx = data.indexOf(d);
        return <text key={i} x={toX(idx)} y={padT+H+20} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">{d[labelKey]}</text>;
      })}
      {/* Area + Line */}
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Hover */}
      {hovered !== null && (
        <>
          <line x1={pts[hovered][0]} y1={padT} x2={pts[hovered][0]} y2={padT+H} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx={pts[hovered][0]} cy={pts[hovered][1]} r="4" fill={color} stroke="var(--surface)" strokeWidth="2" />
          <g transform={`translate(${Math.min(pts[hovered][0]+8, width-90)},${Math.max(pts[hovered][1]-36, padT)})`}>
            <rect x="0" y="0" width="86" height="30" rx="5" fill="var(--surface2)" stroke="var(--border)" strokeWidth="1" />
            <text x="8" y="12" fontSize="9" fill="var(--muted)" fontFamily="var(--font-mono)">{data[hovered][labelKey]}</text>
            <text x="8" y="24" fontSize="11" fill="var(--text)" fontWeight="600" fontFamily="var(--font-mono)">{fmt(data[hovered][valueKey])}</text>
          </g>
        </>
      )}
    </svg>
  );
}

// ─── Donut Chart ──────────────────────────────────────────
function DonutChart({ segments, size=180, strokeWidth=28 }) {
  const [active, setActive] = useState(null);
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const cx = size / 2, cy = size / 2;
  let offset = 0;
  const total = segments.reduce((s,sg) => s+sg.value, 0);
  const slices = segments.map((sg, i) => {
    const pct = sg.value / total;
    const dash = pct * circ;
    const gap = circ - dash;
    const slice = { ...sg, pct, dash, gap, offset, i };
    offset += dash;
    return slice;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:'block' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
      {slices.map((sl, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none"
          stroke={sl.color} strokeWidth={active===i ? strokeWidth+4 : strokeWidth}
          strokeDasharray={`${sl.dash - 2} ${sl.gap + 2}`}
          strokeDashoffset={circ/4 - sl.offset}
          style={{ cursor:'pointer', transition:'stroke-width .15s', transform:'rotate(-90deg)', transformOrigin:`${cx}px ${cy}px` }}
          onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
        />
      ))}
      {active !== null ? (
        <>
          <text x={cx} y={cy-6} textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--font-mono)">{slices[active].label}</text>
          <text x={cx} y={cy+12} textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)" fontFamily="var(--font-mono)">{(slices[active].pct*100).toFixed(1)}%</text>
        </>
      ) : (
        <>
          <text x={cx} y={cy-4} textAnchor="middle" fontSize="10" fill="var(--muted)">Net Worth</text>
          <text x={cx} y={cy+13} textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--text)" fontFamily="var(--font-mono)">{fmt(total)}</text>
        </>
      )}
    </svg>
  );
}

// ─── HBar Chart ──────────────────────────────────────────
function HBarChart({ data, height=20 }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ width:130, fontSize:12, color:'var(--muted)', textAlign:'right', flexShrink:0, fontFamily:'var(--font-mono)' }}>{d.label}</span>
          <div style={{ flex:1, background:'var(--border)', borderRadius:99, height:height, overflow:'hidden' }}>
            <div style={{ width:`${(d.value/max)*100}%`, height:'100%', background:d.color||'var(--accent)', borderRadius:99, transition:'width .4s ease', minWidth:4 }} />
          </div>
          <span style={{ width:56, fontSize:12, color:'var(--text)', fontWeight:600, fontFamily:'var(--font-mono)' }}>{d.pct?.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────
function StatCard({ label, value, sub, subColor, mono=true, accent=false, children }) {
  return (
    <div style={{ background: accent ? 'var(--accent)' : 'var(--card)', border: accent ? 'none' : '1px solid var(--border)', borderRadius:10, padding:'14px 18px', display:'flex', flexDirection:'column', gap:4 }}>
      <span style={{ fontSize:11, color: accent ? 'rgba(255,255,255,0.7)' : 'var(--muted)', letterSpacing:'.04em', textTransform:'uppercase' }}>{label}</span>
      <span style={{ fontSize:22, fontWeight:700, color: accent ? '#fff' : 'var(--text)', fontFamily: mono ? 'var(--font-mono)' : 'inherit', lineHeight:1.1 }}>{value}</span>
      {sub && <span style={{ fontSize:12, color: subColor || (accent ? 'rgba(255,255,255,0.75)' : 'var(--muted)') }}>{sub}</span>}
      {children}
    </div>
  );
}

// ─── Tab Bar ─────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display:'flex', gap:2, borderBottom:'1px solid var(--border)', marginBottom:20 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          style={{ padding:'8px 16px', fontSize:13, fontWeight:500, border:'none', background:'transparent', cursor:'pointer',
            color: active===t.id ? 'var(--accent)' : 'var(--muted)',
            borderBottom: active===t.id ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom:-1, transition:'color .15s', whiteSpace:'nowrap' }}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────
function EmptyState({ icon='📊', title, sub }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'60px 20px', color:'var(--muted)', gap:8 }}>
      <span style={{ fontSize:32 }}>{icon}</span>
      <span style={{ fontSize:15, fontWeight:600, color:'var(--text)' }}>{title}</span>
      {sub && <span style={{ fontSize:13 }}>{sub}</span>}
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────
function Skeleton({ width='100%', height=16, radius=6 }) {
  return <div style={{ width, height, borderRadius:radius, background:'var(--surface2)', animation:'pulse 1.5s ease infinite' }} />;
}

// ─── Icon (SVG icon system) ───────────────────────────────
const ICONS = {
  dashboard: <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>,
  portfolio: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="currentColor"/>,
  analysis: <><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M7 14l3-3 3 3 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  reports: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  search: <><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  sun: <><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  moon: <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
  menu: <><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></line></>,
  chevronRight: <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
  trend: <path d="M23 6l-9.5 9.5-5-5L1 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
  settings: <><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5" fill="none"/></>,
  arrowUp: <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
  arrowDown: <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
  external: <><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/><polyline points="15 3 21 3 21 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/><line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  watchlist: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none"/></>,
  tools: <><line x1="4" y1="21" x2="4" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="4" y1="10" x2="4" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="21" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="8" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="20" y1="21" x2="20" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="20" y1="12" x2="20" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="1" y1="14" x2="7" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="9" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="17" y1="16" x2="23" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  review: <><path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></>,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
  starFilled: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="1.5" fill="currentColor"/>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  trash: <><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/><path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="1.5" fill="none"/></>,
  download: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/><polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  upload: <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/><polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
  note: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>,
  alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></>,
  refresh: <><polyline points="23 4 23 10 17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></>,
};

function Icon({ name, size=18, color='currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display:'block', flexShrink:0, color }}>
      {ICONS[name]}
    </svg>
  );
}

Object.assign(window, { fmt, fmtPct, fmtNum, Badge, ConvictionDot, Gain, Sparkline, AreaChart, DonutChart, HBarChart, StatCard, TabBar, EmptyState, Skeleton, Icon });
