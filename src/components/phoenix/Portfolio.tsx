// @ts-nocheck
'use client';
import React, { useState } from 'react';
import { fmt, fmtPct, Badge, ConvictionDot, Gain, Sparkline, Icon } from './ui';
import type { PhoenixData } from '@/lib/data';

type Asset = PhoenixData['assets'][number];
type SortKey = 'name' | 'current' | 'gainPct' | 'xirr' | 'conviction' | 'holdingDays';

const CATEGORIES = ['All', 'NSE Stocks', 'US Stocks', 'NPS', 'FD', 'Cash'];

export default function Portfolio({ data }: { data: PhoenixData }) {
  const [sortKey, setSortKey] = useState<SortKey>('current');
  const [sortAsc, setSortAsc] = useState(false);
  const [category, setCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const filtered = data.assets.filter(a => category === 'All' || a.category === category);
  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] as number | string;
    const bv = b[sortKey] as number | string;
    const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
    return sortAsc ? cmp : -cmp;
  });

  // Category totals
  const catTotals = data.assets.reduce<Record<string, { invested: number; current: number }>>((acc, a) => {
    if (!acc[a.category]) acc[a.category] = { invested: 0, current: 0 };
    acc[a.category].invested += a.invested;
    acc[a.category].current += a.current;
    return acc;
  }, {});

  const SortIcon = ({ k }: { k: SortKey }) => (
    sortKey === k ? (
      <Icon name={sortAsc ? 'arrowUp' : 'arrowDown'} size={12} color="var(--accent)" />
    ) : (
      <Icon name="arrowDown" size={12} color="var(--border)" />
    )
  );

  const thStyle = (k: SortKey): React.CSSProperties => ({
    padding: '8px 10px', fontSize: 11, color: sortKey === k ? 'var(--accent)' : 'var(--muted)', fontWeight: 500, cursor: 'pointer',
    userSelect: 'none', whiteSpace: 'nowrap', letterSpacing: '.04em',
  });

  return (
    <div style={{ padding: 24 }}>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 }}>
        {CATEGORIES.slice(1).map(cat => {
          const t = catTotals[cat] || { invested: 0, current: 0 };
          const gain = t.current - t.invested;
          const pct = t.invested > 0 ? (gain / t.invested) * 100 : 0;
          return (
            <button key={cat} onClick={() => setCategory(cat === category ? 'All' : cat)}
              style={{
                background: category === cat ? 'var(--accent-dim)' : 'var(--card)', border: `1px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 10, padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
              }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{cat}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{fmt(t.current)}</div>
              <div style={{ fontSize: 12, color: gain >= 0 ? 'var(--gain)' : 'var(--loss)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                {gain >= 0 ? '+' : ''}{fmtPct(pct)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            style={{
              padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: category === c ? 'var(--accent)' : 'var(--surface)', border: '1px solid var(--border)',
              color: category === c ? '#fff' : 'var(--muted)', transition: 'all .15s',
            }}>
            {c}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          {sorted.length} holdings
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead style={{ background: 'var(--surface)' }}>
            <tr>
              <th style={{ ...thStyle('name'), textAlign: 'left', paddingLeft: 16 }} onClick={() => handleSort('name')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Company <SortIcon k="name" /></span>
              </th>
              <th style={{ ...thStyle('current'), textAlign: 'right' }} onClick={() => handleSort('current')}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>Value <SortIcon k="current" /></span>
              </th>
              <th style={{ ...thStyle('gainPct'), textAlign: 'right' }} onClick={() => handleSort('gainPct')}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>Gain <SortIcon k="gainPct" /></span>
              </th>
              <th style={{ ...thStyle('xirr'), textAlign: 'right' }} onClick={() => handleSort('xirr')}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>XIRR <SortIcon k="xirr" /></span>
              </th>
              <th style={{ padding: '8px 10px', fontSize: 11, color: 'var(--muted)', fontWeight: 500 }}>Rec</th>
              <th style={{ ...thStyle('conviction'), textAlign: 'right' }} onClick={() => handleSort('conviction')}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>Conv <SortIcon k="conviction" /></span>
              </th>
              <th style={{ ...thStyle('holdingDays'), textAlign: 'right' }} onClick={() => handleSort('holdingDays')}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>Holding <SortIcon k="holdingDays" /></span>
              </th>
              <th style={{ padding: '8px 10px', fontSize: 11, color: 'var(--muted)', fontWeight: 500, textAlign: 'right' }}>Target</th>
              <th style={{ padding: '8px 10px', fontSize: 11, color: 'var(--muted)', fontWeight: 500, textAlign: 'right', paddingRight: 16 }}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(a => {
              const expanded = expandedId === a.id;
              const cp = a.currentPrice ?? a.current;
              const ep = a.entryPrice ?? a.invested;
              const toTarget = a.targetPrice ? ((a.targetPrice - cp) / cp) * 100 : null;
              const sparkData = [ep, cp * 0.85, cp * 0.92, cp * 0.88, cp * 0.97, cp];
              return (
                <React.Fragment key={a.id}>
                  <tr
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .12s' }}
                    onClick={() => setExpandedId(expanded ? null : a.id)}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--surface)'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 10px 12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Icon name={expanded ? 'arrowDown' : 'chevronRight'} size={14} color="var(--muted)" />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{a.ticker ?? a.category}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.name.slice(0, 24)}{a.exchange ? ` · ${a.exchange}` : ''}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontFamily: 'var(--font-mono)' }}>
                      <div style={{ color: 'var(--text)' }}>{fmt(a.current)}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{fmt(a.invested)} in</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px' }}>
                      <Gain value={a.gain} pct={a.gainPct} />
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontFamily: 'var(--font-mono)', color: (a.xirr ?? 0) >= 15 ? 'var(--gain)' : (a.xirr ?? 0) >= 0 ? 'var(--warn)' : 'var(--loss)' }}>
                      {a.xirr != null ? `${a.xirr.toFixed(1)}%` : '—'}
                    </td>
                    <td style={{ padding: '12px 10px' }}><Badge rec={a.rec} /></td>
                    <td style={{ textAlign: 'right', padding: '12px 10px' }}><ConvictionDot score={a.conviction} /></td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 12 }}>
                      <div>{a.holdingDays != null ? `${a.holdingDays}d` : '—'}</div>
                      <div style={{ fontSize: 10 }}>{a.isLTCG ? 'LTCG' : 'STCG'}</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {a.targetPrice ? (
                        <>
                          <div style={{ color: 'var(--text)' }}>{fmt(a.targetPrice)}</div>
                          <div style={{ color: toTarget! >= 0 ? 'var(--gain)' : 'var(--loss)', fontSize: 11 }}>{toTarget! >= 0 ? '+' : ''}{toTarget!.toFixed(1)}%</div>
                        </>
                      ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 16px 12px 10px' }}>
                      <Sparkline data={sparkData} width={70} height={28} color={a.gainPct >= 0 ? 'var(--gain)' : 'var(--loss)'} />
                    </td>
                  </tr>
                  {expanded && (
                    <tr key={`${a.id}-expand`} style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                      <td colSpan={9} style={{ padding: '14px 24px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 5 }}>Entry Details</div>
                            <div style={{ fontSize: 12, color: 'var(--text)' }}>Entry: <span style={{ fontFamily: 'var(--font-mono)' }}>{fmt(a.entryPrice)} × {a.qty}</span></div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Date: {a.entryDate}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Sector: {a.sector}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 5 }}>Tax</div>
                            <div style={{ fontSize: 12, color: 'var(--text)' }}>Rate: <span style={{ fontFamily: 'var(--font-mono)' }}>{a.taxRate != null ? `${(a.taxRate * 100).toFixed(0)}%` : '—'}</span></div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Tax: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--loss)' }}>-{fmt(a.taxAmt ?? 0)}</span></div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>Post-tax: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gain)' }}>{fmt(a.postTaxGain)}</span></div>
                          </div>
                          <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 5 }}>Research Note</div>
                            <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6 }}>{a.targetNote || '—'}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No holdings in this category</div>
        )}
      </div>
    </div>
  );
}
