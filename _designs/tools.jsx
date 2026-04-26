// Tools Screen — Target Price, What-if Simulator, CSV Import, Export PDF
const { useState, useMemo, useRef } = React;

// ─── Target Price Calculator ────────────────────────────────────────────────
function TargetPriceCalc({ data }) {
  const equityAssets = data.assets.filter(a => a.targetPrice && a.currentPrice);
  const [targets, setTargets] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('px-targets')) || {};
      const out = {};
      equityAssets.forEach(a => { out[a.id] = saved[a.id] !== undefined ? saved[a.id] : a.targetPrice; });
      return out;
    } catch(e) {
      const out = {};
      equityAssets.forEach(a => { out[a.id] = a.targetPrice; });
      return out;
    }
  });

  function setTarget(id, val) {
    const next = { ...targets, [id]: +val };
    setTargets(next);
    localStorage.setItem('px-targets', JSON.stringify(next));
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:13, color:'var(--muted)', marginBottom:4 }}>
        Set target prices for each holding. The app calculates implied upside, required CAGR, and estimated time to target.
      </div>
      {equityAssets.map(a => {
        const cur   = a.currentPrice;
        const entry = a.entryPrice;
        const tgt   = targets[a.id] || a.targetPrice;
        const upside = (tgt - cur) / cur * 100;
        const totalReturn = (tgt - entry) / entry * 100;
        // Time to target at current XIRR (if positive)
        const xirrRate = (a.xirr || 15) / 100;
        const yearsToTarget = xirrRate > 0 ? Math.log(tgt / cur) / Math.log(1 + xirrRate) : null;
        const pctProgress = Math.min(100, Math.max(0, (cur - entry) / (tgt - entry) * 100));

        return (
          <div key={a.id} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:11, padding:'14px 18px' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, flexWrap:'wrap', marginBottom:12 }}>
              <div style={{ minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{a.name}</span>
                  <Badge rec={a.rec || 'buy'} size="xs" />
                </div>
                <div style={{ fontSize:10, color:'var(--muted)', fontFamily:'var(--font-mono)', marginTop:2 }}>{a.exchange}:{a.ticker}</div>
                {a.targetNote && <div style={{ fontSize:11, color:'var(--muted)', marginTop:4, fontStyle:'italic' }}>{a.targetNote}</div>}
              </div>
              <div style={{ display:'flex', gap:16, flexWrap:'wrap', flexShrink:0 }}>
                {[
                  { label:'Entry',  val:'₹'+entry, color:'var(--muted)' },
                  { label:'CMP',    val:'₹'+cur,   color:'var(--text)' },
                  { label:'Target', val:'₹'+tgt,   color: upside > 0 ? 'var(--gain)' : 'var(--loss)' },
                  { label:'Upside', val:(upside>0?'+':'')+upside.toFixed(1)+'%', color: upside>0?'var(--gain)':'var(--loss)' },
                  { label:'Total Return', val:(totalReturn>0?'+':'')+totalReturn.toFixed(1)+'%', color: totalReturn>0?'var(--gain)':'var(--loss)' },
                ].map(m => (
                  <div key={m.label} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:'.06em', textTransform:'uppercase' }}>{m.label}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:m.color, fontFamily:'var(--font-mono)' }}>{m.val}</div>
                  </div>
                ))}
                {yearsToTarget !== null && yearsToTarget > 0 && (
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:'.06em', textTransform:'uppercase' }}>ETA @ XIRR</div>
                    <div style={{ fontSize:14, fontWeight:700, color:'var(--info)', fontFamily:'var(--font-mono)' }}>{yearsToTarget.toFixed(1)}yr</div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar: entry → current → target */}
            <div style={{ position:'relative', marginBottom:8 }}>
              <div style={{ height:8, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                <div style={{ width:`${pctProgress}%`, height:'100%', background: pctProgress >= 100 ? 'var(--warn)' : 'var(--gain)', borderRadius:99, transition:'width .4s' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                <span style={{ fontSize:9, color:'var(--muted)' }}>Entry ₹{entry}</span>
                <span style={{ fontSize:9, color:'var(--gain)', fontWeight:600 }}>{pctProgress.toFixed(0)}% to target</span>
                <span style={{ fontSize:9, color:'var(--muted)' }}>Target ₹{tgt}</span>
              </div>
            </div>

            {/* Target input */}
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:12, color:'var(--muted)' }}>Adjust target:</span>
              <input type="number" value={tgt} onChange={e => setTarget(a.id, e.target.value)}
                style={{ width:100, background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, padding:'4px 8px', fontSize:13, fontWeight:600, color:'var(--text)', fontFamily:'var(--font-mono)', outline:'none' }} />
              <input type="range" min={entry} max={entry*5} step={Math.max(1,Math.round(entry*0.01))} value={tgt}
                onChange={e => setTarget(a.id, e.target.value)}
                style={{ flex:1, accentColor:'var(--accent)', cursor:'pointer' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── What-if Simulator ──────────────────────────────────────────────────────
function WhatIfSimulator({ data }) {
  const equityAssets = data.assets.filter(a => a.entryDate && a.xirr !== null && a.invested > 0);
  const [selectedId, setSelectedId] = useState(equityAssets[0]?.id || null);
  const [extraAmount, setExtraAmount] = useState(100000);
  const [extraDate, setExtraDate] = useState('same'); // 'same' | specific month offset

  const selected = equityAssets.find(a => a.id === selectedId);

  const result = useMemo(() => {
    if (!selected || !window.calcXIRR) return null;
    const MONTHS = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
    const parts = (selected.entryDate || 'Jan 2024').split(' ');
    const entryD = new Date(parseInt(parts[1],10), MONTHS[parts[0]]||0, 15);
    const TODAY = new Date(2026,3,22);

    // Current XIRR
    const origCFs = [{ amount: -selected.invested, date: entryD }, { amount: selected.current, date: TODAY }];
    const origXIRR = window.calcXIRR(origCFs) || selected.xirr;

    // Return rate from original investment
    const returnRate = selected.current / selected.invested;

    // Extra investment — at entry date, same return rate applies
    const extraCurrent = Math.round(extraAmount * returnRate);
    const newTotal = selected.current + extraCurrent;
    const newInvested = selected.invested + extraAmount;

    // New XIRR with extra
    const newCFs = [{ amount: -selected.invested, date: entryD }, { amount: -extraAmount, date: entryD }, { amount: newTotal, date: TODAY }];
    const newXIRR = window.calcXIRR(newCFs) || origXIRR;

    return {
      origXIRR, newXIRR, origCurrent: selected.current, newCurrent: newTotal,
      origInvested: selected.invested, newInvested, extraCurrent,
      gain: newTotal - newInvested, origGain: selected.current - selected.invested,
      extraGain: extraCurrent - extraAmount,
    };
  }, [selected, extraAmount]);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:13, color:'var(--muted)' }}>
        Simulate "what if I had invested more" in any holding at the original entry price. See the impact on portfolio value and XIRR.
      </div>

      {/* Controls */}
      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px', display:'flex', flexDirection:'column', gap:14 }}>
        <div>
          <div style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:7 }}>Choose a holding</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {equityAssets.map(a => (
              <button key={a.id} onClick={() => setSelectedId(a.id)}
                style={{ padding:'6px 12px', borderRadius:7, fontSize:12, fontWeight: selectedId===a.id ? 700:400, border:'1px solid',
                  borderColor: selectedId===a.id ? 'var(--accent)':'var(--border)',
                  background: selectedId===a.id ? 'var(--accent-muted)':'transparent',
                  color: selectedId===a.id ? 'var(--accent)':'var(--muted)', cursor:'pointer', transition:'all .15s' }}>
                {a.ticker || a.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em' }}>Additional Investment</span>
            <span style={{ fontSize:14, fontWeight:700, color:'var(--text)', fontFamily:'var(--font-mono)' }}>{fmt(extraAmount)}</span>
          </div>
          <input type="range" min={10000} max={1000000} step={10000} value={extraAmount}
            onChange={e => setExtraAmount(+e.target.value)}
            style={{ width:'100%', accentColor:'var(--accent)', cursor:'pointer' }} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
            <span style={{ fontSize:10, color:'var(--muted)' }}>₹10K</span>
            <span style={{ fontSize:10, color:'var(--muted)' }}>₹10L</span>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && selected && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {/* Before */}
          <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'18px 20px' }}>
            <div style={{ fontSize:11, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Current Scenario</div>
            {[
              {label:'Invested',       val:fmt(result.origInvested)},
              {label:'Current Value',  val:fmt(result.origCurrent),  color:'var(--text)'},
              {label:'Gain',           val:'+'+fmt(result.origGain), color:'var(--gain)'},
              {label:'XIRR',           val:fmtPct(result.origXIRR,1),color:'var(--gain)'},
            ].map(m => (
              <div key={m.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:12, color:'var(--muted)' }}>{m.label}</span>
                <span style={{ fontSize:13, fontWeight:600, fontFamily:'var(--font-mono)', color:m.color||'var(--text)' }}>{m.val}</span>
              </div>
            ))}
          </div>

          {/* After */}
          <div style={{ background:'var(--card)', border:'1px solid var(--accent)', borderRadius:12, padding:'18px 20px' }}>
            <div style={{ fontSize:11, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>What-if Scenario (+{fmt(extraAmount)})</div>
            {[
              {label:'Invested',       val:fmt(result.newInvested)},
              {label:'Current Value',  val:fmt(result.newCurrent),   color:'var(--text)'},
              {label:'Extra gain',     val:'+'+fmt(result.extraGain),color:'var(--gain)'},
              {label:'New XIRR',       val:fmtPct(result.newXIRR,1), color:'var(--gain)'},
            ].map(m => (
              <div key={m.label} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:12, color:'var(--muted)' }}>{m.label}</span>
                <span style={{ fontSize:13, fontWeight:700, fontFamily:'var(--font-mono)', color:m.color||'var(--text)' }}>{m.val}</span>
              </div>
            ))}
          </div>

          {/* Impact summary */}
          <div style={{ gridColumn:'1/-1', background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'12px 16px', display:'flex', gap:24, flexWrap:'wrap' }}>
            <div>
              <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em' }}>Extra Value Created</div>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--gain)', fontFamily:'var(--font-mono)' }}>{fmt(result.newCurrent - result.origCurrent)}</div>
            </div>
            <div>
              <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em' }}>XIRR Delta</div>
              <div style={{ fontSize:22, fontWeight:800, color: (result.newXIRR-result.origXIRR) >= 0 ? 'var(--gain)' : 'var(--loss)', fontFamily:'var(--font-mono)' }}>
                {(result.newXIRR-result.origXIRR) >= 0 ? '+' : ''}{(result.newXIRR - result.origXIRR).toFixed(2)}%
              </div>
            </div>
            <div style={{ flex:1, display:'flex', alignItems:'center' }}>
              <p style={{ fontSize:12, color:'var(--muted)', lineHeight:1.6 }}>
                If you had invested an extra <b style={{color:'var(--text)'}}>{fmt(extraAmount)}</b> in <b style={{color:'var(--text)'}}>{selected.name}</b> at entry (₹{selected.entryPrice}), your portfolio would be <b style={{color:'var(--gain)'}}>{fmt(result.newCurrent - result.origCurrent)}</b> richer today.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CSV Import ──────────────────────────────────────────────────────────────
function CSVImport({ data }) {
  const [csv, setCsv]         = useState('');
  const [parsed, setParsed]   = useState(null);
  const [error, setError]     = useState('');

  const SAMPLE = `Symbol,Quantity,Average Price,Current Price,Invested,Current Value
SKYGOLD,814,344,423,280016,344202
DEEDEV,437,412,449,179944,196213
EFCIL,562,374,477,210188,268074
WEBELSOLAR,986,325,302,320450,297772
SUBROS,321,436,489,139956,156969`;

  function parse() {
    setError('');
    setParsed(null);
    if (!csv.trim()) { setError('Paste CSV data above first.'); return; }
    try {
      const lines = csv.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((h, i) => { row[h] = vals[i]; });
        return row;
      }).filter(r => r.symbol || r.ticker);

      const result = rows.map(r => {
        const ticker   = (r.symbol || r.ticker || '').toUpperCase();
        const qty      = parseFloat(r.quantity || r.qty || 0);
        const avgPrice = parseFloat(r['average price'] || r['avg price'] || r.avgprice || 0);
        const curPrice = parseFloat(r['current price'] || r.curprice || 0);
        const invested = parseFloat(r.invested || r['invested value'] || 0) || qty * avgPrice;
        const current  = parseFloat(r['current value'] || r.currentvalue || 0) || qty * curPrice;
        const gain = current - invested;
        const gainPct = invested > 0 ? gain / invested * 100 : 0;
        const match = data.assets.find(a => a.ticker === ticker);
        return { ticker, qty, avgPrice, curPrice, invested, current, gain, gainPct, matched: !!match, matchName: match?.name };
      });
      setParsed(result);
    } catch(e) {
      setError('Could not parse CSV. Check the format matches the sample below.');
    }
  }

  const tdS = { padding:'8px 12px', fontSize:12, borderBottom:'1px solid var(--border)', fontFamily:'var(--font-mono)' };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ fontSize:13, color:'var(--muted)' }}>
        Paste a CSV export from Zerodha Console, Groww, or any broker. The parser detects Symbol, Quantity, Average Price, and Current Price columns automatically.
      </div>

      <textarea value={csv} onChange={e => setCsv(e.target.value)} rows={8} placeholder="Paste CSV here…"
        style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 12px', fontSize:12, color:'var(--text)', fontFamily:'var(--font-mono)', resize:'vertical', outline:'none', width:'100%' }} />

      <div style={{ display:'flex', gap:8 }}>
        <button onClick={parse} style={{ padding:'8px 18px', background:'var(--accent)', border:'none', borderRadius:8, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          Parse CSV
        </button>
        <button onClick={() => setCsv(SAMPLE)} style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', fontSize:13, cursor:'pointer' }}>
          Load sample
        </button>
        {(csv || parsed) && (
          <button onClick={() => { setCsv(''); setParsed(null); setError(''); }} style={{ padding:'8px 14px', background:'transparent', border:'1px solid var(--border)', borderRadius:8, color:'var(--muted)', fontSize:13, cursor:'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {error && <div style={{ padding:'10px 14px', background:'var(--loss-bg)', border:'1px solid var(--loss)', borderRadius:8, fontSize:12, color:'var(--loss)' }}>{error}</div>}

      {parsed && (
        <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>Parsed {parsed.length} holdings</span>
            <span style={{ fontSize:11, color:'var(--muted)' }}>{parsed.filter(r=>r.matched).length} matched to portfolio · {parsed.filter(r=>!r.matched).length} new</span>
          </div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'var(--surface2)' }}>
                {['Ticker','Qty','Avg Price','CMP','Invested','Current','P&L','Status'].map(h=>(
                  <th key={h} style={{ ...tdS, fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.04em', fontWeight:600, textAlign: ['Invested','Current','P&L'].includes(h)?'right':'left', borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsed.map((r,i) => (
                <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ ...tdS, fontWeight:700, color:'var(--text)' }}>{r.ticker}</td>
                  <td style={tdS}>{r.qty || '—'}</td>
                  <td style={tdS}>₹{r.avgPrice || '—'}</td>
                  <td style={tdS}>₹{r.curPrice || '—'}</td>
                  <td style={{ ...tdS, textAlign:'right' }}>{r.invested ? fmt(r.invested) : '—'}</td>
                  <td style={{ ...tdS, textAlign:'right' }}>{r.current ? fmt(r.current) : '—'}</td>
                  <td style={{ ...tdS, textAlign:'right', color: r.gain >= 0 ? 'var(--gain)':'var(--loss)', fontWeight:600 }}>
                    {r.invested ? `${r.gain>=0?'+':''}${fmt(r.gain)} (${fmtPct(r.gainPct)})` : '—'}
                  </td>
                  <td style={tdS}>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99,
                      background: r.matched ? 'var(--gain-bg)' : 'var(--info-bg)',
                      color: r.matched ? 'var(--gain)' : 'var(--info)' }}>
                      {r.matched ? `✓ ${r.matchName?.split(' ')[0]}` : 'NEW'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Format guide */}
      <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:8, padding:'12px 16px' }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Supported Formats</div>
        <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
          {[
            { broker:'Zerodha Console', cols:'Symbol, ISIN, Qty, Avg cost, LTP, P&L' },
            { broker:'Groww',           cols:'Symbol, Quantity, Average Price, Current Price' },
            { broker:'Paytm Money',     cols:'Scrip Name, Qty, Buy Avg, CMP' },
            { broker:'Generic',         cols:'Any CSV with Symbol/Ticker + Quantity + Price columns' },
          ].map(b => (
            <div key={b.broker}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{b.broker}</div>
              <div style={{ fontSize:11, color:'var(--muted)' }}>{b.cols}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Export PDF ───────────────────────────────────────────────────────────────
function ExportPDF({ data }) {
  function doExport() {
    const { netWorth, totalInvested, totalGains, totalGainsPct, xirr, cagr, alpha, assets } = data;
    const topHoldings = [...assets].sort((a,b)=>b.current-a.current).slice(0,8);
    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Phoenix Research — Portfolio Snapshot</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,sans-serif;color:#111;background:#fff;padding:32px;font-size:12px}
  h1{font-size:22px;font-weight:800;letter-spacing:-.5px;color:#111;margin-bottom:2px}
  .sub{font-size:11px;color:#888;margin-bottom:24px}
  .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:24px}
  .mc{border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px}
  .ml{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px}
  .mv{font-size:20px;font-weight:800;color:#111;font-variant-numeric:tabular-nums}
  .mv.g{color:#15803d}.mv.r{color:#b91c1c}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  th{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.06em;padding:6px 8px;border-bottom:2px solid #e5e7eb;text-align:left;font-weight:600}
  td{padding:7px 8px;border-bottom:1px solid #f3f4f6;font-size:11px;font-variant-numeric:tabular-nums}
  .badge{display:inline-block;padding:1px 7px;border-radius:99px;font-size:9px;font-weight:700}
  .buy{background:#dcfce7;color:#15803d}.hold{background:#fef9c3;color:#a16207}.watch{background:#dbeafe;color:#1d4ed8}
  .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:9px;color:#aaa;display:flex;justify-content:space-between}
  @media print{body{padding:16px}@page{margin:1cm}}
</style></head><body>
<h1>🔥 Phoenix Research</h1>
<div class="sub">Portfolio Snapshot · Generated ${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
<div class="metrics">
  <div class="mc"><div class="ml">Net Worth</div><div class="mv">${fmt(netWorth)}</div></div>
  <div class="mc"><div class="ml">Total P&L</div><div class="mv g">${totalGains>=0?'+':''}${fmt(totalGains)} (${fmtPct(totalGainsPct)})</div></div>
  <div class="mc"><div class="ml">XIRR</div><div class="mv g">${fmtPct(xirr,1)}</div></div>
  <div class="mc"><div class="ml">Alpha vs Nifty</div><div class="mv g">+${alpha}%</div></div>
</div>
<table>
  <thead><tr><th>Asset</th><th>Category</th><th>Invested</th><th>Current</th><th>P&L</th><th>Return %</th><th>XIRR</th><th>Signal</th></tr></thead>
  <tbody>
    ${topHoldings.map(a=>{
      const g=a.current-a.invested, gp=g/a.invested*100;
      return `<tr>
        <td><b>${a.name}</b>${a.ticker?`<br><small style="color:#888;font-family:monospace">${a.exchange}:${a.ticker}</small>`:''}
        </td><td>${a.category}</td>
        <td>${fmt(a.invested)}</td><td>${fmt(a.current)}</td>
        <td style="color:${g>=0?'#15803d':'#b91c1c'};font-weight:600">${g>=0?'+':''}${fmt(g)}</td>
        <td style="color:${gp>=0?'#15803d':'#b91c1c'};font-weight:600">${fmtPct(gp)}</td>
        <td style="color:${(a.xirr||0)>=0?'#15803d':'#b91c1c'};font-weight:600">${a.xirr!=null?fmtPct(a.xirr,1):'—'}</td>
        <td>${a.rec?`<span class="badge ${a.rec}">${a.rec.toUpperCase()}</span>`:''}</td>
      </tr>`;
    }).join('')}
  </tbody>
</table>
<div class="footer">
  <span>Phoenix Research · Private & Confidential</span>
  <span>XIRR calculated on actual cashflow dates · Not investment advice</span>
</div>
</body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:13, color:'var(--muted)' }}>
        Generate a clean one-page PDF snapshot of your portfolio — suitable for records, CA review, or sharing with a financial advisor. Opens a print-ready page in a new tab.
      </div>

      <div style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:12, padding:'20px 24px', display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:220 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', marginBottom:12 }}>What's included</div>
          {[
            '✓ Net worth, P&L, XIRR, Alpha metrics',
            '✓ All holdings with XIRR per asset',
            '✓ Buy / Hold / Watch signals',
            '✓ Entry, current, gain values',
            '✓ Allocation category breakdown',
            '✓ Print date + disclaimer footer',
          ].map(item => (
            <div key={item} style={{ fontSize:12, color:'var(--muted)', padding:'4px 0', borderBottom:'1px solid var(--border)' }}>{item}</div>
          ))}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, minWidth:180 }}>
          <button onClick={doExport}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 24px', background:'var(--accent)', border:'none', borderRadius:9, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', transition:'opacity .15s' }}
            onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <Icon name="download" size={16} color="#fff" />
            Export to PDF
          </button>
          <div style={{ fontSize:11, color:'var(--muted)', textAlign:'center' }}>Opens in new tab → Cmd/Ctrl+P → Save as PDF</div>
        </div>
      </div>
    </div>
  );
}

// ─── Tax P&L Calculator ───────────────────────────────────────────────────────
function TaxPL({ data }) {
  const { assets, totalTax, postTaxGains, totalGains } = data;
  const LTCG_EXEMPTION = 100000;
  const taxableAssets = assets.filter(a => a.taxAmt !== null && a.taxAmt !== undefined && a.gain !== 0);
  const totalLTCG = taxableAssets.filter(a => a.isLTCG && a.gain > 0).reduce((s, a) => s + a.gain, 0);
  const totalSTCG = taxableAssets.filter(a => a.isLTCG === false && a.gain > 0).reduce((s, a) => s + a.gain, 0);
  const netTax = Math.round(totalTax || 0);
  const postTax = Math.round(totalGains - netTax);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 13, color: 'var(--muted)' }}>
        Tax is estimated based on Indian rules: <b style={{ color: 'var(--text)' }}>LTCG 10%</b> (equity held &gt;1yr, above ₹1L exemption) and <b style={{ color: 'var(--text)' }}>STCG 15%</b> (equity held &lt;1yr). FD income taxed at <b style={{ color: 'var(--text)' }}>30%</b>. NPS is exempt.
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[
          { label: 'Total Gains (Pre-tax)',  value: fmt(totalGains),  sub: null,                     color: 'var(--gain)' },
          { label: 'Estimated Tax',          value: fmt(netTax),      sub: 'across all holdings',    color: 'var(--loss)' },
          { label: 'Post-Tax Gains',         value: fmt(postTax),     sub: 'what you keep',          color: 'var(--gain)' },
          { label: 'Effective Tax Rate',     value: totalGains > 0 ? (netTax/totalGains*100).toFixed(1)+'%' : '0%', sub: 'on total gains', color: 'var(--warn)' },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--card)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 16px' }}>
            <div style={{ fontSize:10, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.04em', marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:20, fontWeight:800, color:s.color, fontFamily:'var(--font-mono)' }}>{s.value}</div>
            {s.sub && <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* LTCG vs STCG summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--gain)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>LTCG (held &gt;1 year)</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--gain)', fontFamily: 'var(--font-mono)' }}>{fmt(totalLTCG)}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
            Exempt: {fmt(LTCG_EXEMPTION)} · Taxable: {fmt(Math.max(0, totalLTCG - LTCG_EXEMPTION))} · Tax @ 10%: {fmt(Math.max(0, totalLTCG - LTCG_EXEMPTION) * 0.1)}
          </div>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: 'var(--warn)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>STCG (held &lt;1 year)</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--warn)', fontFamily: 'var(--font-mono)' }}>{fmt(totalSTCG)}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Taxed at flat 15% · Tax: {fmt(totalSTCG * 0.15)}</div>
        </div>
      </div>

      {/* Per-holding table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Per-Holding Tax Breakdown</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--surface2)' }}>
            <tr>
              {['Asset', 'Holding Period', 'Tax Type', 'Gain', 'Tax Rate', 'Tax Amount', 'Post-Tax Gain'].map(h => (
                <th key={h} style={{ fontSize: 10, color: 'var(--muted)', padding: '8px 12px', textAlign: h === 'Asset' ? 'left' : 'right', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {taxableAssets.map((a, i) => {
              const holdingStr = a.holdingDays ? (a.holdingDays >= 365 ? (a.holdingDays/365).toFixed(1)+'yr' : a.holdingDays+'d') : '—';
              const taxTypeLabel = a.isLTCG ? 'LTCG' : a.isLTCG === false ? 'STCG' : a.category === 'FD' ? 'Income' : a.category === 'NPS' ? 'Exempt' : '—';
              const taxColor = a.isLTCG ? 'var(--gain)' : a.isLTCG === false ? 'var(--warn)' : 'var(--muted)';
              return (
                <tr key={a.id} onMouseEnter={e=>e.currentTarget.style.background='var(--surface2)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{a.name}</div>
                    {a.ticker && <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{a.exchange}:{a.ticker}</div>}
                  </td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>{holdingStr}</td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: a.isLTCG ? 'var(--gain-bg)' : a.isLTCG === false ? 'var(--warn-bg)' : 'var(--surface2)', color: taxColor }}>{taxTypeLabel}</span>
                  </td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: a.gain >= 0 ? 'var(--gain)' : 'var(--loss)', fontWeight: 600 }}>{a.gain >= 0 ? '+' : ''}{fmt(a.gain)}</td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{a.taxRate !== null ? (a.taxRate * 100).toFixed(0) + '%' : '—'}</td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--loss)', fontWeight: 600 }}>{a.taxAmt > 0 ? '-' + fmt(a.taxAmt) : '—'}</td>
                  <td style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12, color: a.postTaxGain >= 0 ? 'var(--gain)' : 'var(--loss)', fontWeight: 700 }}>{a.postTaxGain >= 0 ? '+' : ''}{fmt(a.postTaxGain)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Harvesting tip */}
      <div style={{ background: 'var(--surface2)', border: '1px solid var(--warn)', borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--warn)', marginBottom: 4 }}>💡 Tax Harvesting Opportunity</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          Websol Energy has an unrealised loss of <b style={{ color: 'var(--loss)' }}>-{fmt(298000 - 320000)}</b>. Booking this loss before year-end can offset STCG from other positions, saving ~{fmt(Math.abs(298000 - 320000) * 0.15)} in taxes. Re-enter after 31 days to avoid wash-sale concerns.
        </div>
      </div>
    </div>
  );
}

// ─── Goal Based Planning ──────────────────────────────────────────────────────
function GoalPlanning({ data }) {
  const { netWorth, xirr } = data;
  const [goals, setGoals] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('px-goals')) || data.goals || []; } catch(e) { return data.goals || []; }
  });
  const [editId, setEditId] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);
  const [newGoal, setNewGoal] = React.useState({ name:'', targetAmount:'', targetYear:'', monthlyAddition:'', icon:'🎯' });

  function saveGoals(g) { setGoals(g); localStorage.setItem('px-goals', JSON.stringify(g)); }
  function deleteGoal(id) { saveGoals(goals.filter(g => g.id !== id)); }
  function addGoal() {
    if (!newGoal.name || !newGoal.targetAmount) return;
    const g = { ...newGoal, id:'g'+Date.now(), targetAmount:+newGoal.targetAmount, targetYear:+newGoal.targetYear||2030, monthlyAddition:+newGoal.monthlyAddition||0, currentAmount:0 };
    saveGoals([...goals, g]);
    setNewGoal({ name:'', targetAmount:'', targetYear:'', monthlyAddition:'', icon:'🎯' });
    setShowAdd(false);
  }

  const TODAY_YEAR = 2026;
  const assumedXIRR = (xirr || 18) / 100;
  const inp = (s={}) => ({ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:6, padding:'5px 9px', fontSize:12, color:'var(--text)', outline:'none', fontFamily:'var(--font-sans)', ...s });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>
          Projections use your portfolio XIRR of <b style={{ color: 'var(--gain)' }}>{xirr?.toFixed(1)}%</b> + monthly SIP additions.
        </div>
        <button onClick={() => setShowAdd(v=>!v)}
          style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'var(--accent)', border:'none', color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
          <Icon name="plus" size={14} color="#fff" /> Add Goal
        </button>
      </div>

      {showAdd && (
        <div style={{ background:'var(--card)', border:'1px solid var(--accent)', borderRadius:12, padding:'16px 20px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', gap:10, marginBottom:10 }}>
            <input value={newGoal.name} onChange={e=>setNewGoal(p=>({...p,name:e.target.value}))} placeholder="Goal name *" style={inp({})} />
            <input type="number" value={newGoal.targetAmount} onChange={e=>setNewGoal(p=>({...p,targetAmount:e.target.value}))} placeholder="Target ₹ *" style={inp({fontFamily:'var(--font-mono)'})} />
            <input type="number" value={newGoal.targetYear} onChange={e=>setNewGoal(p=>({...p,targetYear:e.target.value}))} placeholder="Year" style={inp({fontFamily:'var(--font-mono)'})} min="2026" max="2050" />
            <input type="number" value={newGoal.monthlyAddition} onChange={e=>setNewGoal(p=>({...p,monthlyAddition:e.target.value}))} placeholder="Monthly SIP ₹" style={inp({fontFamily:'var(--font-mono)'})} />
            <input value={newGoal.icon} onChange={e=>setNewGoal(p=>({...p,icon:e.target.value}))} placeholder="Icon" style={inp({width:60})} />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={addGoal} style={{ padding:'7px 16px', background:'var(--accent)', border:'none', borderRadius:7, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>Save</button>
            <button onClick={()=>setShowAdd(false)} style={{ padding:'7px 14px', background:'transparent', border:'1px solid var(--border)', borderRadius:7, color:'var(--muted)', fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {goals.map(g => {
          const yearsLeft = g.targetYear - TODAY_YEAR;
          const current = g.currentAmount || (g.id === 'g1' ? netWorth : g.currentAmount || 0);

          // FV of current corpus + monthly SIPs at XIRR
          const r = assumedXIRR / 12;
          const n = yearsLeft * 12;
          const fvCorpus = current * Math.pow(1 + assumedXIRR, yearsLeft);
          const fvSIP    = n > 0 && r > 0 ? g.monthlyAddition * ((Math.pow(1+r, n) - 1) / r) : 0;
          const projected = Math.round(fvCorpus + fvSIP);
          const shortfall = g.targetAmount - projected;
          const onTrack   = projected >= g.targetAmount;
          const progress  = Math.min(100, current / g.targetAmount * 100);

          // Required monthly SIP to bridge shortfall
          const reqSIP = shortfall > 0 && n > 0 && r > 0
            ? Math.round(shortfall * r / (Math.pow(1+r,n) - 1))
            : 0;

          return (
            <div key={g.id} style={{ background:'var(--card)', border:`1px solid ${onTrack?'var(--gain)':'var(--border)'}`, borderRadius:12, padding:'18px 20px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:14 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <span style={{ fontSize:28 }}>{g.icon}</span>
                  <div>
                    <div style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>{g.name}</div>
                    <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>Target: {fmt(g.targetAmount)} by {g.targetYear} · {yearsLeft} years left</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <span style={{ fontSize:11, padding:'4px 10px', borderRadius:99, fontWeight:700,
                    background:onTrack?'var(--gain-bg)':'var(--warn-bg)', color:onTrack?'var(--gain)':'var(--warn)' }}>
                    {onTrack ? '✓ On Track' : '⚠ Needs attention'}
                  </span>
                  <button onClick={()=>deleteGoal(g.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--muted)', padding:3 }}
                    onMouseEnter={e=>e.currentTarget.style.color='var(--loss)'} onMouseLeave={e=>e.currentTarget.style.color='var(--muted)'}>
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>

              {/* Metrics row */}
              <div style={{ display:'flex', gap:20, flexWrap:'wrap', marginBottom:14 }}>
                {[
                  { label:'Current Corpus',   value:fmt(current),    color:'var(--text)' },
                  { label:'Projected by '+g.targetYear, value:fmt(projected), color:onTrack?'var(--gain)':'var(--warn)' },
                  { label:'Target',            value:fmt(g.targetAmount), color:'var(--text)' },
                  { label:onTrack?'Surplus':'Shortfall', value:fmt(Math.abs(shortfall)), color:onTrack?'var(--gain)':'var(--loss)' },
                  { label:'Monthly SIP',       value:fmt(g.monthlyAddition), color:'var(--muted)' },
                  reqSIP > 0 && { label:'SIP needed to bridge', value:fmt(reqSIP), color:'var(--warn)' },
                ].filter(Boolean).map(m => (
                  <div key={m.label}>
                    <div style={{ fontSize:9, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:2 }}>{m.label}</div>
                    <div style={{ fontSize:15, fontWeight:700, color:m.color, fontFamily:'var(--font-mono)' }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:10, color:'var(--muted)' }}>Today: {fmt(current)} ({progress.toFixed(1)}%)</span>
                  <span style={{ fontSize:10, color:'var(--muted)' }}>Target: {fmt(g.targetAmount)}</span>
                </div>
                <div style={{ height:10, background:'var(--border)', borderRadius:99, overflow:'hidden' }}>
                  <div style={{ width:`${progress}%`, height:'100%', background:onTrack?'var(--gain)':'var(--accent)', borderRadius:99, transition:'width .5s' }} />
                </div>
                {/* Projected marker */}
                <div style={{ position:'relative', height:6, marginTop:3 }}>
                  <div style={{ position:'absolute', left:`${Math.min(100, projected/g.targetAmount*100)}%`, top:0, transform:'translateX(-50%)',
                    width:2, height:6, background:'var(--text)', borderRadius:1 }} title={`Projected: ${fmt(projected)}`} />
                </div>
                <div style={{ fontSize:10, color:'var(--muted)', marginTop:1 }}>
                  <span style={{ marginLeft:`${Math.min(96, projected/g.targetAmount*100)}%` }}>↑ proj.</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tools Main ───────────────────────────────────────────────────────────────
function Tools({ data }) {
  const [tab, setTab] = useState('targets');
  return (
    <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:0 }}>
      <TabBar
        tabs={[
          { id:'targets', label:'🎯 Target Prices'    },
          { id:'tax',     label:'🧾 Tax P&L'          },
          { id:'goals',   label:'🏆 Goal Planning'    },
          { id:'whatif',  label:'⚡ What-if Simulator' },
          { id:'csv',     label:'📥 CSV Import'        },
          { id:'export',  label:'📄 Export PDF'        },
        ]}
        active={tab} onChange={setTab}
      />
      {tab === 'targets' && <TargetPriceCalc data={data} />}
      {tab === 'tax'     && <TaxPL           data={data} />}
      {tab === 'goals'   && <GoalPlanning    data={data} />}
      {tab === 'whatif'  && <WhatIfSimulator data={data} />}
      {tab === 'csv'     && <CSVImport       data={data} />}
      {tab === 'export'  && <ExportPDF       data={data} />}
    </div>
  );
}

Object.assign(window, { Tools });
