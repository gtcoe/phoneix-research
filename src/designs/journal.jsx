// Trade Journal Screen
const { useState, useMemo } = React;

const TYPE_CFG = {
  buy:  { label:'BUY',  color:'var(--gain)', bg:'var(--gain-bg)'  },
  sell: { label:'SELL', color:'var(--loss)', bg:'var(--loss-bg)'  },
  note: { label:'NOTE', color:'var(--info)', bg:'var(--info-bg)'  },
};

const CATEGORY_COLORS = {
  'NSE Stocks': 'var(--accent)',
  'US Stocks':  'oklch(0.64 0.14 248)',
  'NPS':        'oklch(0.72 0.10 80)',
  'FD':         'oklch(0.68 0.08 100)',
  'Cash':       'var(--muted)',
};

function Journal({ data }) {
  const storedTx = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('px-journal-extra')) || []; } catch(e) { return []; }
  }, []);

  const [extraTx, setExtraTx] = useState(storedTx);
  const [showAdd, setShowAdd]  = useState(false);
  const [filter, setFilter]    = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch]    = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [newTx, setNewTx]      = useState({ date:'', type:'buy', asset:'', ticker:'', amount:'', qty:'', price:'', category:'NSE Stocks', notes:'' });

  const allTx = useMemo(() => {
    const combined = [...(data.transactions || []), ...extraTx];
    return combined.sort(function(a,b){ return (b.dateObj||new Date(b.date)) - (a.dateObj||new Date(a.date)); });
  }, [data.transactions, extraTx]);

  const categories = ['all', ...Array.from(new Set(allTx.map(t => t.category).filter(Boolean)))];

  const filtered = useMemo(() => {
    return allTx.filter(t => {
      if (filter !== 'all' && t.type !== filter) return false;
      if (catFilter !== 'all' && t.category !== catFilter) return false;
      if (search && !(t.asset||'').toLowerCase().includes(search.toLowerCase()) && !(t.ticker||'').toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allTx, filter, catFilter, search]);

  function addTx() {
    if (!newTx.date || !newTx.asset) return;
    const tx = {
      ...newTx, id: 'j' + Date.now(),
      amount: +newTx.amount || 0, qty: +newTx.qty || null, price: +newTx.price || null,
      dateObj: new Date(newTx.date),
    };
    const next = [...extraTx, tx];
    setExtraTx(next);
    localStorage.setItem('px-journal-extra', JSON.stringify(next.map(t => ({...t, dateObj: undefined}))));
    setNewTx({ date:'', type:'buy', asset:'', ticker:'', amount:'', qty:'', price:'', category:'NSE Stocks', notes:'' });
    setShowAdd(false);
  }

  function deleteTx(id) {
    const next = extraTx.filter(t => t.id !== id);
    setExtraTx(next);
    localStorage.setItem('px-journal-extra', JSON.stringify(next));
  }

  // Summary stats
  const totalDeployed = allTx.filter(t=>t.type==='buy').reduce((s,t)=>s+t.amount,0);
  const buyCount = allTx.filter(t=>t.type==='buy').length;

  // Monthly summary
  const monthlyMap = {};
  allTx.filter(t=>t.type==='buy').forEach(t => {
    const d = t.dateObj || new Date(t.date);
    const key = d.toLocaleDateString('en-IN',{month:'short',year:'2-digit'});
    monthlyMap[key] = (monthlyMap[key]||0) + t.amount;
  });
  const monthly = Object.entries(monthlyMap).slice(-12);
  const maxMonthly = Math.max(...monthly.map(m=>m[1]));

  const inp = (extra) => ({ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, padding:'5px 9px', fontSize:12, color:'var(--text)', outline:'none', fontFamily:'var(--font-sans)', ...extra });

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { label:'Total Transactions',   value: allTx.length,          sub:null },
          { label:'Total Deployed',        value: fmt(totalDeployed),    sub:`${buyCount} buy orders` },
          { label:'Avg Ticket Size',       value: fmt(Math.round(totalDeployed/buyCount)), sub:'per buy' },
          { label:'Active Since',          value: '3.3 yrs',             sub:'Jan 2021' },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Monthly deployment bar chart */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 20px' }}>
        <div style={{ fontSize:12, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:14 }}>Monthly Capital Deployment</div>
        <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:80 }}>
          {monthly.map(([month, amt], i) => (
            <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <div style={{ width:'100%', background:'var(--accent)', borderRadius:'4px 4px 0 0', opacity:.85,
                height: `${Math.round(amt/maxMonthly*72)}px`, minHeight:4, transition:'height .3s',
                cursor:'default', position:'relative' }} title={`${month}: ${fmt(amt)}`} />
              <span style={{ fontSize:8, color:'var(--muted)', fontFamily:'var(--font-mono)', transform:'rotate(-35deg)', transformOrigin:'center', whiteSpace:'nowrap', marginTop:4 }}>{month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters + Add */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:6 }}>
          {['all','buy','sell','note'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding:'5px 12px', borderRadius:99, fontSize:11, fontWeight:filter===f?700:400, border:'1px solid',
                borderColor:filter===f?'var(--accent)':'var(--border)', background:filter===f?'var(--accent-muted)':'transparent',
                color:filter===f?'var(--accent)':'var(--muted)', cursor:'pointer', transition:'all .15s', textTransform:'uppercase', letterSpacing:'.04em' }}>
              {f}
            </button>
          ))}
        </div>
        <select value={catFilter} onChange={e=>setCatFilter(e.target.value)}
          style={{ ...inp({}), cursor:'pointer' }}>
          {categories.map(c => <option key={c} value={c}>{c==='all'?'All categories':c}</option>)}
        </select>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search asset…"
          style={{ ...inp({width:160}) }} />
        <div style={{ flex:1 }} />
        <span style={{ fontSize:12, color:'var(--muted)' }}>{filtered.length} entries</span>
        <button onClick={() => setShowAdd(v=>!v)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'var(--accent)', border:'none', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <Icon name="plus" size={14} color="#fff" /> Log Trade
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background:'var(--card)', border:'1px solid var(--accent)', borderRadius:12, padding:'16px 20px' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:12 }}>Log New Trade / Note</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr 1fr 1fr', gap:10, marginBottom:10 }}>
            <input type="date" value={newTx.date} onChange={e=>setNewTx(p=>({...p,date:e.target.value}))} style={inp({})} />
            <select value={newTx.type} onChange={e=>setNewTx(p=>({...p,type:e.target.value}))} style={{ ...inp({}), cursor:'pointer' }}>
              <option value="buy">BUY</option><option value="sell">SELL</option><option value="note">NOTE</option>
            </select>
            <input value={newTx.asset}  onChange={e=>setNewTx(p=>({...p,asset:e.target.value}))}  placeholder="Asset name *" style={inp({})} />
            <input value={newTx.ticker} onChange={e=>setNewTx(p=>({...p,ticker:e.target.value.toUpperCase()}))} placeholder="Ticker" style={inp({fontFamily:'var(--font-mono)'})} />
            <input type="number" value={newTx.amount} onChange={e=>setNewTx(p=>({...p,amount:e.target.value}))} placeholder="Amount ₹" style={inp({fontFamily:'var(--font-mono)'})} />
            <select value={newTx.category} onChange={e=>setNewTx(p=>({...p,category:e.target.value}))} style={{ ...inp({}), cursor:'pointer' }}>
              {['NSE Stocks','US Stocks','NPS','FD','Cash','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 4fr', gap:10, marginBottom:10 }}>
            <input type="number" value={newTx.qty}   onChange={e=>setNewTx(p=>({...p,qty:e.target.value}))}   placeholder="Qty" style={inp({fontFamily:'var(--font-mono)'})} />
            <input type="number" value={newTx.price} onChange={e=>setNewTx(p=>({...p,price:e.target.value}))} placeholder="Price ₹" style={inp({fontFamily:'var(--font-mono)'})} />
            <input value={newTx.notes} onChange={e=>setNewTx(p=>({...p,notes:e.target.value}))} placeholder="Your reasoning / notes…" style={inp({})} />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={addTx} style={{ padding:'7px 16px', background:'var(--accent)', border:'none', borderRadius:7, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Save</button>
            <button onClick={() => setShowAdd(false)} style={{ padding:'7px 14px', background:'transparent', border:'1px solid var(--border)', borderRadius:7, color:'var(--muted)', fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Transaction list */}
      <div style={{ display:'flex', flexDirection:'column', gap:0, background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        {filtered.length === 0 && <EmptyState icon="📋" title="No transactions" sub="Log your first trade above" />}
        {filtered.map((tx, i) => {
          const tc = TYPE_CFG[tx.type] || TYPE_CFG.buy;
          const cc = CATEGORY_COLORS[tx.category] || 'var(--muted)';
          const isExtra = String(tx.id).startsWith('j');
          const isExpanded = expandedId === tx.id;
          const d = tx.dateObj || new Date(tx.date);
          const dateStr = d.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });

          return (
            <div key={tx.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid var(--border)' : 'none' }}>
              {/* Main row */}
              <div style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 18px', cursor:'pointer', transition:'background .12s' }}
                onMouseEnter={e => e.currentTarget.style.background='var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
                onClick={() => setExpandedId(isExpanded ? null : tx.id)}>

                {/* Date */}
                <div style={{ width:72, flexShrink:0, textAlign:'right' }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', fontFamily:'var(--font-mono)' }}>{d.getDate()} {d.toLocaleDateString('en-IN',{month:'short'})}</div>
                  <div style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--font-mono)' }}>{d.getFullYear()}</div>
                </div>

                {/* Vertical line */}
                <div style={{ width:2, height:36, background:'var(--border)', borderRadius:99, flexShrink:0, position:'relative' }}>
                  <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:10, height:10, borderRadius:'50%', background:tc.color, border:'2px solid var(--card)' }} />
                </div>

                {/* Type badge */}
                <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:tc.bg, color:tc.color, flexShrink:0, letterSpacing:'.04em' }}>{tc.label}</span>

                {/* Asset */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{tx.asset}</span>
                    {tx.ticker && <span style={{ fontSize:10, color:cc, fontFamily:'var(--font-mono)', background:'var(--surface2)', padding:'1px 6px', borderRadius:4 }}>{tx.ticker}</span>}
                    <span style={{ fontSize:10, color:'var(--muted)', background:'var(--surface2)', padding:'1px 7px', borderRadius:4 }}>{tx.category}</span>
                  </div>
                  {tx.notes && <div style={{ fontSize:11, color:'var(--muted)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:500 }}>{tx.notes}</div>}
                </div>

                {/* Amount */}
                {tx.amount > 0 && (
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, fontFamily:'var(--font-mono)', color: tx.type==='sell'?'var(--gain)':'var(--text)' }}>{tx.type==='sell'?'+':'-'}{fmt(tx.amount)}</div>
                    {tx.qty && tx.price && <div style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--font-mono)' }}>{tx.qty} × ₹{tx.price.toLocaleString('en-IN')}</div>}
                  </div>
                )}

                {isExtra && (
                  <button onClick={e => { e.stopPropagation(); deleteTx(tx.id); }}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', padding:4, flexShrink:0 }}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--loss)'}
                    onMouseLeave={e=>e.currentTarget.style.color='var(--muted)'}>
                    <Icon name="trash" size={13} />
                  </button>
                )}

                <span style={{ color:'var(--muted)', fontSize:10, flexShrink:0, transform: isExpanded?'rotate(90deg)':'none', transition:'transform .15s' }}>▶</span>
              </div>

              {/* Expanded reasoning */}
              {isExpanded && tx.notes && (
                <div style={{ padding:'12px 18px 14px 106px', background:'var(--surface2)', borderTop:'1px solid var(--border)' }}>
                  <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:5 }}>My reasoning at the time</div>
                  <p style={{ fontSize:13, color:'var(--text)', lineHeight:1.7 }}>{tx.notes}</p>
                  <div style={{ display:'flex', gap:20, marginTop:10, flexWrap:'wrap' }}>
                    {tx.qty && <div><span style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase' }}>Quantity</span><div style={{ fontSize:13, fontWeight:600, fontFamily:'var(--font-mono)', color:'var(--text)' }}>{tx.qty.toLocaleString('en-IN')}</div></div>}
                    {tx.price && <div><span style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase' }}>Price</span><div style={{ fontSize:13, fontWeight:600, fontFamily:'var(--font-mono)', color:'var(--text)' }}>₹{tx.price.toLocaleString('en-IN')}</div></div>}
                    {tx.amount > 0 && <div><span style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase' }}>Amount</span><div style={{ fontSize:13, fontWeight:600, fontFamily:'var(--font-mono)', color:'var(--text)' }}>{fmt(tx.amount)}</div></div>}
                    <div><span style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase' }}>Date</span><div style={{ fontSize:13, fontWeight:600, color:'var(--text)' }}>{dateStr}</div></div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { Journal });
