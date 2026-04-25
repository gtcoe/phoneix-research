// @ts-nocheck
'use client';
import { useState } from 'react';
import { fmt, fmtPct, Badge, ConvictionDot, Gain, AreaChart, TabBar, Icon } from './ui';
import type { PhoenixData } from '@/lib/data';

type Asset = PhoenixData['assets'][number];

const TABS = [
  { id: 'performance', label: 'Performance' },
  { id: 'sector',      label: 'Sector' },
  { id: 'risk',        label: 'Risk' },
  { id: 'correlation', label: 'Correlation' },
  { id: 'drawdown',    label: 'Drawdown' },
  { id: 'rebalance',   label: 'Rebalance' },
  { id: 'timeline',    label: 'Timeline' },
  { id: 'holding',     label: 'Holding Period' },
];

// ─── Rebalance tab (extracted to avoid hook-in-IIFE problem) ──────────────────
function RebalanceTab({ data }: { data: PhoenixData }) {
  const [targets, setTargets] = useState<Record<string, number>>(() => {
    const t: Record<string, number> = {};
    data.assets.forEach(a => { t[a.id] = parseFloat(((a.current / data.netWorth) * 100).toFixed(1)); });
    return t;
  });

  const totalTarget = Object.values(targets).reduce((s, v) => s + v, 0);
  const isBalanced = Math.abs(totalTarget - 100) < 0.1;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Set target allocations. Total must equal 100%.</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: isBalanced ? 'var(--gain)' : 'var(--loss)' }}>
          Total: {totalTarget.toFixed(1)}%
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.assets.map(a => {
          const curPct = (a.current / data.netWorth) * 100;
          const targetPct = targets[a.id] || 0;
          const diff = targetPct - curPct;
          const diffAmt = (diff / 100) * data.netWorth;
          return (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 90px 100px', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface)', borderRadius: 8 }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)', marginRight: 8 }}>{a.ticker}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{a.category}</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                {curPct.toFixed(1)}%  now
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input type="number" min="0" max="100" step="0.1"
                  value={targetPct}
                  onChange={e => setTargets(prev => ({ ...prev, [a.id]: parseFloat(e.target.value) || 0 }))}
                  style={{ width: '100%', padding: '4px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize: 12 }}
                />
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>%</span>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: diff >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: diffAmt >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                {diffAmt >= 0 ? 'Buy ' : 'Sell '}{fmt(Math.abs(diffAmt))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Analysis component ──────────────────────────────────────────────────
export default function Analysis({ data }: { data: PhoenixData }) {
  const [tab, setTab] = useState('performance');

  // Sector data
  const sectorMap: Record<string, { current: number; invested: number; assets: Asset[] }> = {};
  data.assets.forEach(a => {
    if (!sectorMap[a.sector]) sectorMap[a.sector] = { current: 0, invested: 0, assets: [] };
    sectorMap[a.sector].current += a.current;
    sectorMap[a.sector].invested += a.invested;
    sectorMap[a.sector].assets.push(a);
  });
  const sectors = Object.entries(sectorMap).sort(([, a], [, b]) => b.current - a.current);

  return (
    <div style={{ padding: 24 }}>
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {/* ─── Performance ─────────────────────────────────────────────────── */}
      {tab === 'performance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Portfolio vs benchmarks */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Portfolio vs Benchmarks</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Portfolio XIRR', value: `${data.xirr.toFixed(1)}%`, color: 'var(--accent)' },
                { label: 'Nifty 50 XIRR',   value: `${data.benchmarks.nifty50.xirr.toFixed(1)}%`, color: '#6366f1' },
                { label: 'Midcap 150 XIRR', value: `${data.benchmarks.midcap150.xirr.toFixed(1)}%`, color: '#f59e0b' },
                { label: 'Fixed Deposit',   value: `${data.benchmarks.fd.xirr.toFixed(1)}%`, color: '#10b981' },
              ].map(b => (
                <div key={b.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{b.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: b.color, fontFamily: 'var(--font-mono)' }}>{b.value}</div>
                </div>
              ))}
            </div>
            <AreaChart data={data.history} width={860} height={180} color="var(--accent)" labelKey="date" valueKey="value" />
          </div>

          {/* Individual stock performance */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>Individual Stock Returns</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[...data.assets].sort((a, b) => b.gainPct - a.gainPct).map(a => {
                const w = Math.min(100, Math.max(0, (Math.abs(a.gainPct) / 200) * 100));
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 70, fontSize: 12, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{a.ticker}</div>
                    <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: '50%', display: 'flex', justifyContent: 'flex-end' }}>
                        {a.gainPct < 0 && <div style={{ width: `${w}%`, maxWidth: '100%', height: 20, background: 'var(--loss)', borderRadius: '4px 0 0 4px', opacity: 0.7 }} />}
                      </div>
                      <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
                      <div style={{ width: '50%' }}>
                        {a.gainPct >= 0 && <div style={{ width: `${w}%`, maxWidth: '100%', height: 20, background: 'var(--gain)', borderRadius: '0 4px 4px 0', opacity: 0.7 }} />}
                      </div>
                    </div>
                    <div style={{ width: 60, textAlign: 'right', fontSize: 12, fontFamily: 'var(--font-mono)', color: a.gainPct >= 0 ? 'var(--gain)' : 'var(--loss)' }}>
                      {a.gainPct >= 0 ? '+' : ''}{a.gainPct.toFixed(1)}%
                    </div>
                    <div style={{ width: 52, textAlign: 'right', fontSize: 11, fontFamily: 'var(--font-mono)', color: (a.xirr ?? 0) >= 15 ? 'var(--gain)' : (a.xirr ?? 0) >= 0 ? 'var(--warn)' : 'var(--loss)' }}>
                      {a.xirr != null ? `${a.xirr.toFixed(1)}% p` : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Sector ──────────────────────────────────────────────────────── */}
      {tab === 'sector' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sectors.map(([sector, info]) => {
            const gain = info.current - info.invested;
            const gainPct = info.invested > 0 ? (gain / info.invested) * 100 : 0;
            const weight = (info.current / data.netWorth) * 100;
            return (
              <div key={sector} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{sector}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>{weight.toFixed(1)}% of portfolio</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{fmt(info.current)}</div>
                    <Gain value={gain} pct={gainPct} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {info.assets.map(a => (
                    <div key={a.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{a.ticker}</div>
                      <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 2 }}>{fmt(a.current)}</div>
                      <Gain value={a.gain} pct={a.gainPct} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Risk ────────────────────────────────────────────────────────── */}
      {tab === 'risk' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Risk Metrics</div>
            {[
              { label: 'Portfolio Beta', value: '0.87', note: 'Lower than market' },
              { label: 'Portfolio XIRR', value: `${data.xirr.toFixed(1)}%`, note: 'Annualised return' },
              { label: 'Alpha vs Nifty50', value: `+${data.alpha.toFixed(1)}%`, note: 'Outperformance' },
              { label: 'Sharpe Ratio', value: '1.42', note: 'Risk-adjusted return' },
              { label: 'Max Drawdown', value: '-18.3%', note: 'Historical peak-to-trough' },
              { label: 'STCG Holdings', value: `${data.assets.filter(a => !a.isLTCG).length}`, note: `${data.assets.filter(a => !a.isLTCG).length} positions < 1yr` },
              { label: 'LTCG Holdings', value: `${data.assets.filter(a => a.isLTCG).length}`, note: `${data.assets.filter(a => a.isLTCG).length} positions ≥ 1yr` },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.note}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{m.value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Tax Summary</div>
            {[
              { label: 'Total Gains',    value: fmt(data.totalGains), color: 'var(--gain)' },
              { label: 'Total Tax',      value: fmt(data.totalTax),   color: 'var(--loss)' },
              { label: 'Post-tax Gains', value: fmt(data.postTaxGains), color: 'var(--accent)' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{r.label}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: r.color, fontFamily: 'var(--font-mono)' }}>{r.value}</span>
              </div>
            ))}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>Per-stock tax breakdown</div>
              {data.assets.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{a.ticker}</span>
                  <span style={{ color: 'var(--muted)' }}>{a.isLTCG ? 'LTCG 10%' : 'STCG 15%'}</span>
                  <span style={{ color: 'var(--loss)', fontFamily: 'var(--font-mono)' }}>-{fmt(a.taxAmt)}</span>
                  <span style={{ color: 'var(--gain)', fontFamily: 'var(--font-mono)' }}>{fmt(a.postTaxGain)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Correlation ─────────────────────────────────────────────────── */}
      {tab === 'correlation' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Correlation Matrix</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr>
                  <th style={{ width: 60 }} />
                  {data.corrLabels.map(l => (
                    <th key={l} style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--muted)', fontWeight: 500 }}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.corrMatrix.map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '6px 12px 6px 0', color: 'var(--muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{data.corrLabels[i]}</td>
                    {row.map((v, j) => {
                      const bg = v === 1 ? 'var(--surface)' : v > 0.7 ? 'rgba(239,68,68,.25)' : v > 0.4 ? 'rgba(245,158,11,.2)' : v < 0 ? 'rgba(16,185,129,.2)' : 'transparent';
                      return (
                        <td key={j} style={{ padding: '6px 10px', textAlign: 'center', background: bg, color: v === 1 ? 'var(--muted)' : v > 0.7 ? 'var(--loss)' : v < 0 ? 'var(--gain)' : 'var(--text)', borderRadius: 4 }}>
                          {v.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
            {[
              { color: 'rgba(239,68,68,.35)', label: '> 0.7 High correlation' },
              { color: 'rgba(245,158,11,.3)', label: '0.4–0.7 Medium' },
              { color: 'rgba(16,185,129,.3)', label: '< 0 Negative (diversifying)' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
                <span style={{ width: 14, height: 14, background: l.color, borderRadius: 3, flexShrink: 0 }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Drawdown ────────────────────────────────────────────────────── */}
      {tab === 'drawdown' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Drawdown Analysis</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Stock', 'Entry', 'ATH', 'Current', 'Max DD', 'Cur DD', 'Recovery Needed'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'right', fontSize: 11, color: 'var(--muted)', fontWeight: 500, ':first-child': { textAlign: 'left' } as any }}
                    style={{ padding: '8px 10px', textAlign: h === 'Stock' ? 'left' : 'right', fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.drawdowns.map(d => (
                <tr key={d.ticker} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 10px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{d.ticker}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 12 }}>{fmt(d.entry)}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text)', fontSize: 12 }}>{fmt(d.ath)}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text)', fontSize: 12 }}>{fmt(d.current)}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: d.maxDD < -20 ? 'var(--loss)' : 'var(--warn)', fontSize: 12 }}>
                    {d.maxDD.toFixed(1)}%
                  </td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: d.curDD < -10 ? 'var(--loss)' : d.curDD < 0 ? 'var(--warn)' : 'var(--gain)', fontSize: 12 }}>
                    {d.curDD.toFixed(1)}%
                  </td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: d.recoveryNeeded > 20 ? 'var(--loss)' : d.recoveryNeeded > 0 ? 'var(--warn)' : 'var(--gain)', fontSize: 12 }}>
                    {d.recoveryNeeded > 0 ? `+${d.recoveryNeeded.toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── Rebalance ───────────────────────────────────────────────────── */}
      {tab === 'rebalance' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Portfolio Rebalancer</div>
          <RebalanceTab data={data} />
        </div>
      )}

      {/* ─── Timeline ────────────────────────────────────────────────────── */}
      {tab === 'timeline' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Investment Timeline</div>
          <div style={{ position: 'relative', paddingLeft: 24 }}>
            <div style={{ position: 'absolute', left: 6, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
            {[...data.assets].sort((a, b) => (a.entryDate ? new Date(a.entryDate).getTime() : 0) - (b.entryDate ? new Date(b.entryDate).getTime() : 0)).map(a => (
              <div key={a.id} style={{ position: 'relative', marginBottom: 20 }}>
                <div style={{ position: 'absolute', left: -21, top: 4, width: 10, height: 10, borderRadius: '50%', background: a.gainPct >= 0 ? 'var(--gain)' : 'var(--loss)', border: '2px solid var(--surface)' }} />
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{a.ticker}</span>
                      <Badge rec={a.rec} size="xs" />
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{a.holdingDays != null ? `${a.holdingDays}d holding` : 'no entry date'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{a.entryDate ?? '—'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>Entry: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{fmt(a.entryPrice)}</span></span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>Current: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{fmt(a.currentPrice)}</span></span>
                    <Gain value={a.gain} pct={a.gainPct} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Holding Period ───────────────────────────────────────────────── */}
      {tab === 'holding' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>Holding Period Analysis</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'LTCG (≥ 1yr)', assets: data.assets.filter(a => a.isLTCG), color: 'var(--gain)' },
              { label: 'STCG (< 1yr)',  assets: data.assets.filter(a => !a.isLTCG), color: 'var(--warn)' },
            ].map(group => (
              <div key={group.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: group.color, marginBottom: 12 }}>{group.label} — {group.assets.length} stocks</div>
                {group.assets.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)', marginRight: 8 }}>{a.ticker}</span>
                      <span style={{ color: 'var(--muted)' }}>{a.holdingDays != null ? `${a.holdingDays}d` : '—'}</span>
                    </div>
                    <Gain value={a.gain} pct={a.gainPct} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
