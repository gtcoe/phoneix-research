// Quarterly Review Screen — per-holding checklist with localStorage persistence
const { useState, useMemo } = React;

const RESULT_OPTIONS = [
  { value:'beat',    label:'Beat',    color:'var(--gain)',  bg:'var(--gain-bg)'  },
  { value:'inline',  label:'In-line', color:'var(--info)',  bg:'var(--info-bg)'  },
  { value:'miss',    label:'Miss',    color:'var(--loss)',  bg:'var(--loss-bg)'  },
  { value:'pending', label:'Pending', color:'var(--muted)', bg:'var(--surface2)' },
];
const CONVICTION_DELTA = [
  { value:'up',   label:'▲ Up',   color:'var(--gain)' },
  { value:'same', label:'= Same', color:'var(--muted)' },
  { value:'down', label:'▼ Down', color:'var(--loss)'  },
];
const ACTIONS = [
  { value:'hold',   label:'Hold',   color:'var(--info)'  },
  { value:'add',    label:'Add',    color:'var(--gain)'  },
  { value:'reduce', label:'Reduce', color:'var(--warn)'  },
  { value:'exit',   label:'Exit',   color:'var(--loss)'  },
  { value:'watch',  label:'Watch',  color:'var(--muted)' },
];

const QUARTERS = ['Q1 FY26 (Apr–Jun 25)', 'Q2 FY26 (Jul–Sep 25)', 'Q3 FY26 (Oct–Dec 25)', 'Q4 FY26 (Jan–Mar 26)'];

function ReviewCard({ asset, review, onChange }) {
  const gain    = asset.current - asset.invested;
  const gainPct = gain / asset.invested * 100;
  const [open, setOpen] = useState(false);

  const completionCount = [review.thesisIntact!==undefined, review.result, review.convictionDelta, review.action].filter(Boolean).length;
  const completionPct   = completionCount / 4 * 100;
  const isComplete      = completionCount === 4;

  function update(key, val) { onChange({ ...review, [key]: val, lastUpdated: new Date().toISOString().split('T')[0] }); }

  const borderColor = isComplete ? 'var(--gain)' : completionCount > 0 ? 'var(--warn)' : 'var(--border)';

  return (
    <div style={{ background:'var(--card)', border:`1px solid ${borderColor}`, borderRadius:12, overflow:'hidden', transition:'border-color .2s' }}>
      {/* Header row — always visible */}
      <div style={{ padding:'12px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:12 }}
        onClick={() => setOpen(o => !o)}>
        {/* Completion ring */}
        <svg width={32} height={32} viewBox="0 0 32 32" style={{ flexShrink:0 }}>
          <circle cx="16" cy="16" r="13" fill="none" stroke="var(--border)" strokeWidth="3"/>
          <circle cx="16" cy="16" r="13" fill="none" stroke={isComplete ? 'var(--gain)' : 'var(--accent)'}
            strokeWidth="3" strokeDasharray={`${completionPct * 0.817} 100`}
            strokeLinecap="round" transform="rotate(-90 16 16)"
            style={{ transition:'stroke-dasharray .3s' }} />
          <text x="16" y="20" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--text)" fontFamily="var(--font-mono)">{completionCount}/4</text>
        </svg>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{asset.name}</span>
            {asset.rec && <Badge rec={asset.rec} size="xs" />}
            {asset.conviction && <ConvictionDot score={asset.conviction} />}
            {isComplete && <span style={{ fontSize:10, color:'var(--gain)', fontWeight:700, background:'var(--gain-bg)', padding:'1px 7px', borderRadius:99 }}>✓ REVIEWED</span>}
          </div>
          <div style={{ fontSize:10, color:'var(--muted)', marginTop:2, fontFamily:'var(--font-mono)' }}>
            {asset.ticker && `${asset.exchange}:${asset.ticker} · `}
            Invested {fmt(asset.invested)} · Current {fmt(asset.current)} ·
            <span style={{ color: gain >= 0 ? 'var(--gain)' : 'var(--loss)', fontWeight:600 }}> {gain>=0?'+':''}{fmt(gain)} ({fmtPct(gainPct)})</span>
          </div>
        </div>

        {/* Quick chips — completed fields */}
        <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'flex-end', maxWidth:220 }}>
          {review.result && (() => { const c = RESULT_OPTIONS.find(r=>r.value===review.result); return c ? <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:c.bg, color:c.color }}>{c.label}</span> : null; })()}
          {review.action && (() => { const c = ACTIONS.find(a=>a.value===review.action); return c ? <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:'var(--surface2)', color:c.color, border:`1px solid ${c.color}` }}>{c.label}</span> : null; })()}
          {review.lastUpdated && <span style={{ fontSize:10, color:'var(--muted)' }}>{review.lastUpdated}</span>}
        </div>

        <span style={{ color:'var(--muted)', fontSize:12, flexShrink:0, transform: open ? 'rotate(90deg)' : 'none', transition:'transform .15s' }}>▶</span>
      </div>

      {/* Expanded review form */}
      {open && (
        <div style={{ borderTop:'1px solid var(--border)', padding:'16px 20px', display:'flex', flexDirection:'column', gap:16, background:'var(--surface2)' }}>

          {/* Thesis intact */}
          <div>
            <div style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>1. Thesis still intact?</div>
            <div style={{ display:'flex', gap:8 }}>
              {[{val:true,label:'✓ Yes',color:'var(--gain)',bg:'var(--gain-bg)'},{val:false,label:'✗ No',color:'var(--loss)',bg:'var(--loss-bg)'}].map(opt => (
                <button key={String(opt.val)} onClick={() => update('thesisIntact', opt.val)}
                  style={{ padding:'7px 18px', borderRadius:7, fontSize:12, fontWeight:600, border:'1px solid',
                    borderColor: review.thesisIntact===opt.val ? opt.color : 'var(--border)',
                    background: review.thesisIntact===opt.val ? opt.bg : 'transparent',
                    color: review.thesisIntact===opt.val ? opt.color : 'var(--muted)', cursor:'pointer', transition:'all .15s' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quarterly result */}
          <div>
            <div style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>2. Last quarterly result</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {RESULT_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => update('result', opt.value)}
                  style={{ padding:'7px 16px', borderRadius:7, fontSize:12, fontWeight:600, border:'1px solid',
                    borderColor: review.result===opt.value ? opt.color : 'var(--border)',
                    background: review.result===opt.value ? opt.bg : 'transparent',
                    color: review.result===opt.value ? opt.color : 'var(--muted)', cursor:'pointer', transition:'all .15s' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conviction delta */}
          <div>
            <div style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>3. Conviction change</div>
            <div style={{ display:'flex', gap:8 }}>
              {CONVICTION_DELTA.map(opt => (
                <button key={opt.value} onClick={() => update('convictionDelta', opt.value)}
                  style={{ padding:'7px 16px', borderRadius:7, fontSize:12, fontWeight:600, border:'1px solid',
                    borderColor: review.convictionDelta===opt.value ? opt.color : 'var(--border)',
                    background: review.convictionDelta===opt.value ? 'var(--surface2)' : 'transparent',
                    color: review.convictionDelta===opt.value ? opt.color : 'var(--muted)', cursor:'pointer', transition:'all .15s' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action */}
          <div>
            <div style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>4. Action this quarter</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {ACTIONS.map(opt => (
                <button key={opt.value} onClick={() => update('action', opt.value)}
                  style={{ padding:'7px 16px', borderRadius:7, fontSize:12, fontWeight:600, border:'1px solid',
                    borderColor: review.action===opt.value ? opt.color : 'var(--border)',
                    background: review.action===opt.value ? 'var(--surface2)' : 'transparent',
                    color: review.action===opt.value ? opt.color : 'var(--muted)', cursor:'pointer', transition:'all .15s' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:6 }}>Notes for this quarter</div>
            <textarea value={review.notes || ''} rows={3}
              onChange={e => update('notes', e.target.value)}
              placeholder="Key observations, management comments, triggers to watch…"
              style={{ width:'100%', background:'var(--card)', border:'1px solid var(--border)', borderRadius:7, padding:'8px 10px', fontSize:12, color:'var(--text)', resize:'vertical', fontFamily:'var(--font-sans)', outline:'none' }} />
          </div>

          {/* Reset */}
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button onClick={() => onChange({})}
              style={{ padding:'6px 12px', background:'transparent', border:'1px solid var(--border)', borderRadius:7, color:'var(--muted)', fontSize:12, cursor:'pointer' }}>
              Reset review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuarterlyReview({ data }) {
  const reviewableAssets = data.assets.filter(a => a.invested > 0 && a.category !== 'Cash');
  const [quarter, setQuarter] = useState(QUARTERS[QUARTERS.length - 1]);
  const [reviews, setReviews] = useState(() => {
    try { return JSON.parse(localStorage.getItem('px-reviews')) || {}; } catch(e) { return {}; }
  });

  function updateReview(assetId, review) {
    const next = { ...reviews, [assetId]: review };
    setReviews(next);
    localStorage.setItem('px-reviews', JSON.stringify(next));
  }

  const completedCount = reviewableAssets.filter(a => {
    const r = reviews[a.id] || {};
    return r.thesisIntact !== undefined && r.result && r.convictionDelta && r.action;
  }).length;

  const actionSummary = ACTIONS.map(opt => ({
    ...opt, count: reviewableAssets.filter(a => (reviews[a.id]||{}).action === opt.value).length
  })).filter(o => o.count > 0);

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

      {/* Quarter selector + progress */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {QUARTERS.map(q => (
            <button key={q} onClick={() => setQuarter(q)}
              style={{ padding:'5px 12px', borderRadius:99, fontSize:11, fontWeight: quarter===q?700:400, border:'1px solid',
                borderColor: quarter===q ? 'var(--accent)' : 'var(--border)',
                background: quarter===q ? 'var(--accent-muted)' : 'transparent',
                color: quarter===q ? 'var(--accent)' : 'var(--muted)', cursor:'pointer', transition:'all .15s' }}>
              {q}
            </button>
          ))}
        </div>
        <div style={{ fontSize:13, color:'var(--muted)' }}>
          <span style={{ color:'var(--gain)', fontWeight:700 }}>{completedCount}</span>/{reviewableAssets.length} reviewed
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 18px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>Review Progress — {quarter}</span>
          <span style={{ fontSize:12, color:'var(--muted)' }}>{Math.round(completedCount/reviewableAssets.length*100)}% complete</span>
        </div>
        <div style={{ height:8, background:'var(--border)', borderRadius:99, overflow:'hidden', marginBottom:12 }}>
          <div style={{ width:`${completedCount/reviewableAssets.length*100}%`, height:'100%', background:'var(--gain)', borderRadius:99, transition:'width .4s' }} />
        </div>
        {actionSummary.length > 0 && (
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {actionSummary.map(a => (
              <span key={a.value} style={{ fontSize:11, padding:'3px 10px', borderRadius:99, background:'var(--surface2)', border:`1px solid ${a.color}`, color:a.color, fontWeight:600 }}>
                {a.label} × {a.count}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Review cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {reviewableAssets.map(a => (
          <ReviewCard key={a.id} asset={a} review={reviews[a.id] || {}} onChange={rev => updateReview(a.id, rev)} />
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { QuarterlyReview });
