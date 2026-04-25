'use client';
import { fmt, fmtPct, Badge, ConvictionDot, Gain, AreaChart, DonutChart, HBarChart, StatCard, Icon } from './ui';
import type { PhoenixData } from '@/lib/data';

// ─── HealthScoreRing ───────────────────────────────────────────────────────────
function HealthScoreRing({ score, components }: { score: number; components: PhoenixData['healthComponents'] }) {
  const SIZE = 120, SW = 12;
  const r = (SIZE - SW) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 75 ? 'var(--gain)' : score >= 50 ? 'var(--warn)' : 'var(--loss)';
  const cx = SIZE / 2, cy = SIZE / 2;

  const compRows = [
    { label: 'XIRR', value: components.xirrScore },
    { label: 'Alpha', value: components.alphaScore },
    { label: 'Conviction', value: components.convScore },
    { label: 'Diversification', value: components.diversScore },
    { label: 'Drawdown', value: components.drawScore },
  ];

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={SW} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={SW}
            strokeDasharray={`${filled} ${circ - filled}`}
            strokeDashoffset={circ / 4}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="800" fill={color} fontFamily="var(--font-mono)">{score}</text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="var(--muted)" letterSpacing=".06em">HEALTH</text>
        </svg>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {compRows.map(c => {
          const c2 = c.value >= 75 ? 'var(--gain)' : c.value >= 50 ? 'var(--warn)' : 'var(--loss)';
          return (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', width: 90 }}>{c.label}</span>
              <div style={{ flex: 1, background: 'var(--border)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
                <div style={{ width: `${c.value}%`, height: '100%', background: c2, borderRadius: 99, transition: 'width .4s ease' }} />
              </div>
              <span style={{ fontSize: 11, color: c2, width: 28, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{c.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sector color map ─────────────────────────────────────────────────────────
const SECTOR_COLORS: Record<string, string> = {
  'Technology':    '#6366f1',
  'Manufacturing': '#f59e0b',
  'Finance':       '#10b981',
  'Infrastructure':'#3b82f6',
  'Consumer':      '#ec4899',
  'Energy':        '#f97316',
  'Healthcare':    '#14b8a6',
};
const CATEGORY_COLORS: Record<string, string> = {
  'Large Cap': '#6366f1',
  'Mid Cap':   '#f59e0b',
  'Small Cap': '#10b981',
  'Micro Cap': '#3b82f6',
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard({ data }: { data: PhoenixData }) {
  // Sector allocation
  const sectorMap: Record<string, number> = {};
  data.assets.forEach(a => { sectorMap[a.sector] = (sectorMap[a.sector] || 0) + a.current; });
  const sectorSegments = Object.entries(sectorMap).map(([label, value]) => ({ label, value, color: SECTOR_COLORS[label] || 'var(--muted)' }));

  // Category donut
  const catMap: Record<string, number> = {};
  data.assets.forEach(a => { catMap[a.category] = (catMap[a.category] || 0) + a.current; });
  const catSegments = Object.entries(catMap).map(([label, value]) => ({ label, value, color: CATEGORY_COLORS[label] || 'var(--muted)' }));

  // Top 5 holdings by current value
  const top5 = [...data.assets].sort((a, b) => b.current - a.current).slice(0, 5);

  // HBar for sector
  const sectorBars = Object.entries(sectorMap)
    .sort(([, a], [, b]) => b - a)
    .map(([label, value]) => ({ label, value, pct: (value / data.netWorth) * 100, color: SECTOR_COLORS[label] }));

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Net worth hero */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>Portfolio Value</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{fmt(data.netWorth)}</div>
            <div style={{ marginTop: 6, fontSize: 14 }}>
              <Gain value={data.totalGains} pct={data.totalGainsPct} />
              <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 12 }}>invested {fmt(data.totalInvested)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <StatCard label="XIRR" value={`${data.xirr.toFixed(1)}%`} sub={`α +${data.alpha.toFixed(1)}% vs Nifty50`} subColor="var(--gain)" />
            <StatCard label="CAGR" value={`${data.cagr.toFixed(1)}%`} sub="Since inception" />
            <StatCard label="Day P/L" value={`${data.dayChange >= 0 ? '+' : ''}₹${Math.abs(data.dayChange).toLocaleString('en-IN')}`}
              sub={`${data.dayChange >= 0 ? '+' : ''}${data.dayChangePct.toFixed(2)}%`}
              subColor={data.dayChange >= 0 ? 'var(--gain)' : 'var(--loss)'} />
          </div>
        </div>
      </div>

      {/* Area chart */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Portfolio Growth</div>
        <AreaChart data={data.history} width={860} height={200} color="var(--accent)" labelKey="date" valueKey="value" />
      </div>

      {/* Mid-row: donut + sector bars + health */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Allocation donut */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Allocation</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <DonutChart segments={catSegments} size={160} strokeWidth={26} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center' }}>
              {catSegments.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sector bars */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Sector Exposure</div>
          <HBarChart data={sectorBars} height={16} />
        </div>

        {/* Health score */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Portfolio Health</div>
          <HealthScoreRing score={data.healthScore} components={data.healthComponents} />
        </div>
      </div>

      {/* Top holdings + conviction alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        {/* Top holdings */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Top Holdings</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Company', 'Value', 'Gain/%', 'Conv'].map(h => (
                  <th key={h} style={{ textAlign: h === 'Company' ? 'left' : 'right', paddingBottom: 8, fontSize: 11, color: 'var(--muted)', fontWeight: 500, letterSpacing: '.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top5.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{a.ticker}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.name.slice(0, 22)}</div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{fmt(a.current)}</td>
                  <td style={{ textAlign: 'right' }}><Gain value={a.gain} pct={a.gainPct} /></td>
                  <td style={{ textAlign: 'right' }}><ConvictionDot score={a.conviction} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Conviction alerts */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Conviction Alerts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.convictionAlerts.slice(0, 6).map(a => (
              <div key={a.id} style={{ display: 'flex', gap: 10, opacity: a.read ? 0.55 : 1 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0,
                  background: a.severity === 'high' ? 'var(--loss)' : a.severity === 'medium' ? 'var(--warn)' : 'var(--info)',
                }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{a.ticker} — {a.type}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{a.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent reports */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Recent Reports</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {data.reports.slice(0, 4).map(r => (
            <a key={r.slug} href={`/analyses/${r.file?.replace(/^analyses\//, '')}`} target="_blank" rel="noreferrer"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', textDecoration: 'none', display: 'block', transition: 'border-color .15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{r.ticker}</span>
                <Badge rec={r.rec} size="xs" />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{r.date}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
