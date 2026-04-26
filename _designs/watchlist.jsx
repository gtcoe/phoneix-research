// Watchlist Screen v2 — with price-at-add tracking + since-added performance
const { useState, useMemo } = React;

const STATUS_CFG = {
  watching:   { label:'Watching',   color:'var(--info)',  bg:'var(--info-bg)'  },
  interested: { label:'Interested', color:'var(--warn)',  bg:'var(--warn-bg)'  },
  passed:     { label:'Passed',     color:'var(--muted)', bg:'var(--surface2)' },
};

function Watchlist({ data }) {
  const initList = (data.watchlist || []).map(w => ({
    ...w,
    alertHit: w.currentPrice >= w.alertPrice,
    sinceAdded: w.priceAtAdd ? (w.currentPrice - w.priceAtAdd) / w.priceAtAdd * 100 : null,
  }));

  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('px-watchlist'));
      if (saved && saved.length > 0) {
        // Merge saved overrides (status, thesis, alertPrice) with fresh seed data
        return initList.map(w => {
          const s = saved.find(x => x.id === w.id);
          return s ? { ...w, status: s.status || w.status, thesis: s.thesis || w.thesis, alertPrice: s.alertPrice || w.alertPrice } : w;
        });
      }
      return initList;
    } catch(e) { return initList; }
  });
  const [filter, setFilter] = useState('all');
  const [editId, setEditId] = useState(null);
  const [editNote, setEditNote] = useState('');
  const [editAlert, setEditAlert] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [sortKey, setSortKey] = useState('sinceAdded');
  const [newItem, setNewItem] = useState({ ticker:'', name:'', sector:'', thesis:'', alertPrice:'', currentPrice:'' });

  function save(list) { setItems(list); localStorage.setItem('px-watchlist', JSON.stringify(list)); }
  function updateStatus(id, status) { save(items.map(w => w.id===id ? {...w, status} : w)); }
  function startEdit(w) { setEditId(w.id); setEditNote(w.thesis); setEditAlert(w.alertPrice); }
  function commitEdit(id) {
    save(items.map(w => w.id===id ? {...w, thesis:editNote, alertPrice:+editAlert, alertHit:w.currentPrice>=+editAlert} : w));
    setEditId(null);
  }
  function removeItem(id) { save(items.filter(w => w.id !== id)); }
  function addItem() {
    if (!newItem.ticker || !newItem.name) return;
    const now = new Date();
    const addedDate = now.toLocaleDateString('en-IN',{month:'short', day:'numeric', year:'numeric'});
    const curP = +newItem.currentPrice || 0;
    const item = { id:'w'+Date.now(), ...newItem,
      alertPrice:+newItem.alertPrice||0, currentPrice:curP, priceAtAdd:curP,
      addedDate, sinceAdded:0, rec:null, conviction:null, status:'watching', file:null,
      alertHit: curP >= (+newItem.alertPrice||0),
    };
    save([...items, item]);
    setNewItem({ ticker:'', name:'', sector:'', thesis:'', alertPrice:'', currentPrice:'' });
    setShowAdd(false);
  }

  const filtered = useMemo(() => {
    let list = items;
    if (filter === 'alerts') list = list.filter(w => w.alertHit && w.status !== 'passed');
    else if (filter !== 'all') list = list.filter(w => w.status === filter);
    return [...list].sort((a,b) => {
      if (sortKey === 'sinceAdded') return (b.sinceAdded||0) - (a.sinceAdded||0);
      if (sortKey === 'conviction') return (b.conviction||0) - (a.conviction||0);
      if (sortKey === 'addedDate') return new Date(b.addedDate||0) - new Date(a.addedDate||0);
      return 0;
    });
  }, [items, filter, sortKey]);

  const alertCount = items.filter(w => w.alertHit && w.status !== 'passed').length;
  const inp = (s) => ({ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, padding:'5px 9px', fontSize:12, color:'var(--text)', outline:'none', fontFamily:'var(--font-sans)', ...s });

  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

      {/* Controls */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
          {[
            {id:'all',label:`All (${items.length})`},
            {id:'watching',label:'Watching'},
            {id:'interested',label:'Interested'},
            {id:'passed',label:'Passed'},
            {id:'alerts',label:`🔔 Alerts (${alertCount})`, highlight:alertCount>0},
          ].map(f=>(
            <button key={f.id} onClick={()=>setFilter(f.id)}
              style={{padding:'5px 13px',borderRadius:99,fontSize:12,fontWeight:filter===f.id?700:400,border:'1px solid',
                borderColor:filter===f.id?'var(--accent)':'var(--border)',
                background:filter===f.id?'var(--accent-muted)':f.highlight?'var(--warn-bg)':'transparent',
                color:filter===f.id?'var(--accent)':f.highlight?'var(--warn)':'var(--muted)',cursor:'pointer',transition:'all .15s'}}>
              {f.label}
            </button>
          ))}
          <select value={sortKey} onChange={e=>setSortKey(e.target.value)} style={inp({cursor:'pointer'})}>
            <option value="sinceAdded">Sort: Since Added</option>
            <option value="conviction">Sort: Conviction</option>
            <option value="addedDate">Sort: Date Added</option>
          </select>
        </div>
        <button onClick={()=>setShowAdd(v=>!v)}
          style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,background:'var(--accent)',border:'none',color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>
          <Icon name="plus" size={14} color="#fff" /> Add to Watchlist
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{background:'var(--card)',border:'1px solid var(--accent)',borderRadius:12,padding:'16px 20px'}}>
          <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:12}}>Add New Stock to Watchlist</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr 1fr 1fr 1fr',gap:10,marginBottom:10}}>
            <input value={newItem.ticker} onChange={e=>setNewItem(p=>({...p,ticker:e.target.value.toUpperCase()}))} placeholder="Ticker *" style={inp({})} />
            <input value={newItem.name}   onChange={e=>setNewItem(p=>({...p,name:e.target.value}))}   placeholder="Company name *" style={inp({})} />
            <input value={newItem.sector} onChange={e=>setNewItem(p=>({...p,sector:e.target.value}))} placeholder="Sector" style={inp({})} />
            <input type="number" value={newItem.currentPrice} onChange={e=>setNewItem(p=>({...p,currentPrice:e.target.value}))} placeholder="CMP ₹ (sets baseline)" style={inp({fontFamily:'var(--font-mono)'})} />
            <input type="number" value={newItem.alertPrice}   onChange={e=>setNewItem(p=>({...p,alertPrice:e.target.value}))}   placeholder="Alert price ₹" style={inp({fontFamily:'var(--font-mono)'})} />
          </div>
          <textarea value={newItem.thesis} onChange={e=>setNewItem(p=>({...p,thesis:e.target.value}))} placeholder="Investment thesis…" rows={2}
            style={{...inp({width:'100%',resize:'vertical',padding:'7px 9px',marginBottom:10})}} />
          <div style={{display:'flex',gap:8}}>
            <button onClick={addItem} style={{padding:'7px 16px',background:'var(--accent)',border:'none',borderRadius:7,color:'#fff',fontSize:13,fontWeight:600,cursor:'pointer'}}>Add</button>
            <button onClick={()=>setShowAdd(false)} style={{padding:'7px 14px',background:'transparent',border:'1px solid var(--border)',borderRadius:7,color:'var(--muted)',fontSize:13,cursor:'pointer'}}>Cancel</button>
          </div>
        </div>
      )}

      {/* Cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(330px,1fr))',gap:12}}>
        {filtered.map(w => {
          const sc = STATUS_CFG[w.status]||STATUS_CFG.watching;
          const alertHit = w.currentPrice >= w.alertPrice && w.alertPrice > 0;
          const upside = w.alertPrice > 0 ? (w.alertPrice - w.currentPrice) / w.currentPrice * 100 : null;
          const since = w.sinceAdded;
          const isEditing = editId === w.id;

          return (
            <div key={w.id} style={{background:'var(--card)',border:`1px solid ${alertHit&&w.status!=='passed'?'var(--warn)':'var(--border)'}`,borderRadius:12,padding:'14px 16px',display:'flex',flexDirection:'column',gap:10,position:'relative'}}>
              {alertHit && w.status!=='passed' && (
                <div style={{position:'absolute',top:10,right:10,fontSize:10,fontWeight:700,color:'var(--warn)',background:'var(--warn-bg)',padding:'2px 8px',borderRadius:99}}>🔔 AT ALERT</div>
              )}

              {/* Header */}
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}}>
                <div style={{minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:7,flexWrap:'wrap'}}>
                    <span style={{fontSize:14,fontWeight:700,color:'var(--text)'}}>{w.name}</span>
                    {w.rec && <Badge rec={w.rec} size="xs" />}
                    {w.conviction && <ConvictionDot score={w.conviction} />}
                  </div>
                  <div style={{fontSize:10,color:'var(--muted)',fontFamily:'var(--font-mono)',marginTop:2}}>
                    {w.exchange}:{w.ticker} · {w.sector} · {w.mcap}
                  </div>
                </div>
                <div style={{display:'flex',gap:5,flexShrink:0}}>
                  <button onClick={()=>startEdit(w)} title="Edit" style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:2}}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--text)'} onMouseLeave={e=>e.currentTarget.style.color='var(--muted)'}>
                    <Icon name="note" size={14} />
                  </button>
                  <button onClick={()=>removeItem(w.id)} title="Remove" style={{background:'none',border:'none',cursor:'pointer',color:'var(--muted)',padding:2}}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--loss)'} onMouseLeave={e=>e.currentTarget.style.color='var(--muted)'}>
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>

              {/* Price metrics */}
              <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
                {/* Added date + price */}
                {w.addedDate && (
                  <div style={{display:'flex',flexDirection:'column',gap:1}}>
                    <span style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em'}}>Added</span>
                    <span style={{fontSize:11,color:'var(--muted)'}}>{w.addedDate}</span>
                    {w.priceAtAdd > 0 && <span style={{fontSize:11,fontFamily:'var(--font-mono)',color:'var(--muted)'}}>@ ₹{w.priceAtAdd}</span>}
                  </div>
                )}
                <div>
                  <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em'}}>CMP</div>
                  <div style={{fontSize:18,fontWeight:700,color:'var(--text)',fontFamily:'var(--font-mono)'}}>₹{w.currentPrice}</div>
                </div>
                {since !== null && (
                  <div>
                    <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em'}}>Since Added</div>
                    <div style={{fontSize:18,fontWeight:700,color:since>=0?'var(--gain)':'var(--loss)',fontFamily:'var(--font-mono)'}}>{since>=0?'+':''}{since.toFixed(1)}%</div>
                  </div>
                )}
                {w.alertPrice > 0 && (
                  <div>
                    <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em'}}>Alert</div>
                    <div style={{fontSize:18,fontWeight:700,color:alertHit?'var(--warn)':'var(--info)',fontFamily:'var(--font-mono)'}}>₹{w.alertPrice}</div>
                  </div>
                )}
                {upside !== null && (
                  <div>
                    <div style={{fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.06em'}}>To Alert</div>
                    <div style={{fontSize:18,fontWeight:700,color:upside>0?'var(--gain)':'var(--loss)',fontFamily:'var(--font-mono)'}}>{upside>0?'+':''}{upside.toFixed(1)}%</div>
                  </div>
                )}
              </div>

              {/* Since-added progress bar */}
              {w.priceAtAdd > 0 && w.currentPrice > 0 && (
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                    <span style={{fontSize:9,color:'var(--muted)'}}>Added @ ₹{w.priceAtAdd}</span>
                    <span style={{fontSize:9,color:'var(--muted)'}}>Alert @ ₹{w.alertPrice||'—'}</span>
                  </div>
                  <div style={{height:5,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
                    <div style={{
                      width:`${Math.min(100,w.alertPrice>0?w.currentPrice/w.alertPrice*100:50)}%`,
                      height:'100%',
                      background:alertHit?'var(--warn)':since>=0?'var(--gain)':'var(--loss)',
                      borderRadius:99,transition:'width .4s'}} />
                  </div>
                </div>
              )}

              {/* Thesis / edit */}
              {isEditing ? (
                <div style={{display:'flex',flexDirection:'column',gap:7}}>
                  <textarea value={editNote} onChange={e=>setEditNote(e.target.value)} rows={3}
                    style={{background:'var(--surface2)',border:'1px solid var(--accent)',borderRadius:6,padding:'6px 8px',fontSize:12,color:'var(--text)',resize:'vertical',fontFamily:'var(--font-sans)',outline:'none'}} />
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <span style={{fontSize:11,color:'var(--muted)'}}>Alert ₹</span>
                    <input type="number" value={editAlert} onChange={e=>setEditAlert(e.target.value)}
                      style={{width:80,background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:6,padding:'4px 7px',fontSize:12,color:'var(--text)',fontFamily:'var(--font-mono)',outline:'none'}} />
                    <button onClick={()=>commitEdit(w.id)} style={{padding:'4px 12px',background:'var(--accent)',border:'none',borderRadius:6,color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>Save</button>
                    <button onClick={()=>setEditId(null)} style={{padding:'4px 10px',background:'transparent',border:'1px solid var(--border)',borderRadius:6,color:'var(--muted)',fontSize:12,cursor:'pointer'}}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p style={{fontSize:12,color:'var(--muted)',lineHeight:1.6,margin:0}}>{w.thesis||'No thesis added yet.'}</p>
              )}

              {/* Status + report */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:2}}>
                <div style={{display:'flex',gap:5}}>
                  {Object.keys(STATUS_CFG).map(s=>(
                    <button key={s} onClick={()=>updateStatus(w.id,s)}
                      style={{padding:'3px 9px',borderRadius:99,fontSize:10,fontWeight:600,border:'1px solid',
                        borderColor:w.status===s?sc.color:'var(--border)',
                        background:w.status===s?sc.bg:'transparent',
                        color:w.status===s?sc.color:'var(--muted)',cursor:'pointer',transition:'all .12s'}}>
                      {STATUS_CFG[s].label}
                    </button>
                  ))}
                </div>
                {w.file && (
                  <a href={w.file} target="_blank" rel="noopener noreferrer"
                    style={{fontSize:11,color:'var(--accent)',textDecoration:'none',display:'flex',alignItems:'center',gap:4,fontWeight:500}}>
                    Read report <Icon name="external" size={11} color="var(--accent)" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length===0 && <EmptyState icon="👁️" title="Nothing here" sub="Adjust filter or add a stock" />}
      </div>
    </div>
  );
}

Object.assign(window, { Watchlist });
