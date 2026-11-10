const publishedNotes = {"COST": "The consumer is addicted to Costco. The lines are long, and the diversity in consumer is deep. Costco Kirkland brand is a staple product in home. The most functional brokerage platform.", "SCHW": "Schwab is reliable and avoids the risk positions of Robinhood. Growth amongst investor count is positive.", "GOOGL": "The search is never going away. Recent drawbacks created a safer float to purchase. Google is the basic of the internet.", "GEV": "Investment and security is of essence. In an economy controlled by energy output, GE Vernova provides the input."};
function noteKey(symbol){return "folio-journal-"+symbol+(Object.hasOwn(publishedNotes,symbol)?"-published-20261110":"");}
const $ = selector => document.querySelector(selector);
const money = value => value.toLocaleString('en-US',{style:'currency',currency:'USD'});
const percent = value => (value >= 0 ? '+' : '−') + Math.abs(value).toFixed(2) + '%';
const dollars = value => (value >= 0 ? '+' : '−') + money(Math.abs(value));
const dateET = timestamp => new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(timestamp * 1000));
const timeET = timestamp => new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(new Date(timestamp * 1000));
let state = JSON.parse($('#initial-portfolio').textContent), period = 'purchase', busy = false, notesReady = false;
function noteRead(symbol){try{return localStorage.getItem(noteKey(symbol))??publishedNotes[symbol]??'';}catch{return publishedNotes[symbol]??'';}}
function periodBase(p){return period === 'purchase' || dateET(p.timestamp) === '2026-11-10' ? p.purchaseOpen : p.previousClose;}
function renderNotes(){
  const notes = $('#notes');
  for(const p of state.positions){
    const card = document.createElement('article');card.className='note';card.id='note-'+p.symbol;
    card.innerHTML='<div class="note-head"><span class="sector"></span><span class="weight"></span></div><h3></h3><p class="description"></p><label>Why I bought it<textarea placeholder="My thesis, the catalyst, and what would change my mind…"></textarea></label><div class="note-bottom"><span class="small">Planned holding end<b></b></span><span class="small">Purchased<b>Nov 10, 2026</b></span></div>';
    card.querySelector('.sector').textContent=p.sector;card.querySelector('.weight').textContent=(p.allocation/1000)+'% at open';card.querySelector('h3').textContent=p.name;card.querySelector('.description').textContent=p.description;card.querySelector('.note-bottom b').textContent=p.holdUntil||'Not yet set';
    const field=card.querySelector('textarea');field.setAttribute('aria-label',p.name+' investment reasoning');field.value=noteRead(p.symbol);field.addEventListener('input',()=>{try{localStorage.setItem(noteKey(p.symbol),field.value);$('#save-status').textContent='Saved in this browser';}catch{$('#save-status').textContent='Storage unavailable — notes are not saved';}});notes.append(card);
  }
  const cash=document.createElement('article');cash.className='note cash-note';cash.id='note-CASH';cash.innerHTML='<div><span class="sector">Cash reserve</span><h3>Room for the next idea.</h3><p>Your five allocations add up to 92.5%. The remaining 7.5% stays in cash.</p></div><div><div class="cash-amount">$7,500</div><p>No assumed interest. Included in total portfolio value.</p></div>';notes.append(cash);notesReady=true;
}
function tileLayout(items){
  const map=$('#heatmap');map.replaceChildren();
  // Binary partition produces exact proportional areas for every holding, including cash.
  const ordered=[...items].sort((a,b)=>b.value-a.value);
  function split(group,x,y,w,h){
    if(group.length===1){const p=group[0],a=document.createElement('a');a.href='#note-'+p.symbol;a.className='tile '+(p.symbol==='CASH'?'cash':p.return>0?'positive':p.return<0?'negative':'')+(p.value/items.reduce((s,v)=>s+v.value,0)<.17?' compact':'');Object.assign(a.style,{left:x+'%',top:y+'%',width:w+'%',height:h+'%'});a.innerHTML='<div><div class="tile-meta"><span></span><span></span></div><div class="ticker"></div><div class="company"></div></div><div><div class="tile-return"></div><div class="tile-value"></div></div>';a.querySelector('.tile-meta span').textContent=p.sector;a.querySelector('.tile-meta span:last-child').textContent=(p.weight*100).toFixed(1)+'%';a.querySelector('.ticker').textContent=p.symbol;a.querySelector('.company').textContent=p.name;a.querySelector('.tile-return').textContent=p.symbol==='CASH'?'0.00%':percent(p.return);a.querySelector('.tile-value').textContent=money(p.value)+' · '+(p.weight*100).toFixed(1)+'%';a.setAttribute('aria-label',p.name+', '+money(p.value)+', '+percent(p.return)+' '+(period==='today'?'today':'since purchase'));map.append(a);return;}
    const total=group.reduce((s,p)=>s+p.value,0);let sum=0,index=1,best=Infinity;for(let i=1;i<group.length;i++){sum+=group[i-1].value;const diff=Math.abs(total/2-sum);if(diff<best){best=diff;index=i;}}
    const first=group.slice(0,index),second=group.slice(index),fraction=first.reduce((s,p)=>s+p.value,0)/total;
    if(w*map.clientWidth>=h*map.clientHeight){split(first,x,y,w*fraction,h);split(second,x+w*fraction,y,w*(1-fraction),h);}else{split(first,x,y,w,h*fraction);split(second,x,y+h*fraction,w,h*(1-fraction));}
  }
  split(ordered,0,0,100,100);
}
function render(){
  if(!state)return;
  const positions=state.positions.map(p=>({...p,shares:p.allocation/p.purchaseOpen,value:p.allocation/p.purchaseOpen*p.price,return:(p.price/periodBase(p)-1)*100}));
  const total=7500+positions.reduce((sum,p)=>sum+p.value,0),base=7500+positions.reduce((sum,p)=>sum+p.shares*periodBase(p),0),gain=total-base;
  $('#total').textContent=money(total);$('#gain').textContent=dollars(gain);$('#gain').className='value num '+(gain<0?'negative-text':'positive-text');$('#gain-percent').textContent=percent(gain/base*100)+' including cash';$('#period-label').textContent=period==='purchase'?'Since purchase':'Today · while held';
  $('#period-explanation').textContent=period==='purchase'?'Price returns begin at each stock’s November 10, 2026 opening price. Fractional shares match your exact dollar allocations.':'Today measures gains while you held the stocks: from the opening price on November 10, and from the previous close on later trading days. On the purchase day, both views match.';
  const items=positions.map(p=>({...p,weight:p.value/total}));items.push({symbol:'CASH',name:'Cash reserve',sector:'Cash',value:7500,weight:7500/total,return:0});tileLayout(items);
  $('#return-heading').textContent='GAIN / LOSS %';$('#positions-period').textContent=period==='purchase'?'Since purchase':'Today · while held';
  const body=$('#positions-body');body.replaceChildren();
  for(const p of positions){
    const pl=p.value-p.shares*periodBase(p),tr=document.createElement('tr');
    tr.className=pl>0?'gain-row':pl<0?'loss-row':'';
    const values=[p.symbol,money(p.allocation),'$'+p.purchaseOpen.toFixed(4),p.shares.toFixed(6),money(p.price),money(p.value),dollars(pl),percent(p.return)];
    for(const v of values){const td=document.createElement('td');td.textContent=v;tr.append(td);}
    const name=document.createElement('span');name.className='position-name';name.textContent=p.name;tr.children[0].append(name);
    const stamp=document.createElement('span');stamp.className='quote-stamp';stamp.textContent=timeET(p.timestamp)+(p.stale?' · saved quote':'');tr.children[4].append(stamp);
    const color=pl<0?'negative-text':pl>0?'positive-text':'';
    tr.children[5].className='position-value '+color;tr.children[6].className=color;tr.children[7].className=color;body.append(tr);
  }
  const cashRow=document.createElement('tr');for(const v of ['CASH','$7,500.00','—','—','—','$7,500.00','$0.00','0.00%']){const td=document.createElement('td');td.textContent=v;cashRow.append(td);}body.append(cashRow);
  const totals=$('#positions-total');totals.replaceChildren();const totalRow=document.createElement('tr');for(const v of ['PORTFOLIO','$100,000.00','—','—','—',money(total),dollars(gain),percent(gain/base*100)]){const td=document.createElement('td');td.textContent=v;totalRow.append(td);}totalRow.children[6].className=gain<0?'negative-text':'positive-text';totalRow.children[7].className=totalRow.children[6].className;totals.append(totalRow);
  if(!notesReady)renderNotes();
  const oldest=Math.min(...positions.map(p=>p.timestamp));const age=Date.now()/1000-oldest;
  $('#market-status').textContent=(state.stale?'Saved quote snapshot · ':age>1200?'Latest available · market closed or quotes delayed · ':'Market quotes · ')+timeET(oldest)+(state.stale?' · Refresh unavailable':' · Checks every 60s');
}
async function refresh(force=false){
 if(busy)return;busy=true;$('#refresh').disabled=true;$('#refresh').textContent='Refreshing…';$('#refresh-detail').textContent='Requesting updated market prices…';
 try{
  const response=await fetch('/api/portfolio'+(force?'?refresh=1':''),{cache:'no-store',signal:AbortSignal.timeout(16000)});
  if(!response.ok)throw new Error('Quote connection unavailable');
  const data=await response.json();
  if(!Array.isArray(data.positions)||data.positions.length!==5||!data.positions.every(p=>[p.price,p.timestamp,p.purchaseOpen,p.allocation,p.previousClose].every(v=>Number.isFinite(v)&&v>0)))throw new Error('Incomplete quote response');
  state=data;render();
  $('#refresh-detail').textContent=(data.stale?'Refresh completed, but the provider could not update every quote. Last verified prices are retained.':'Prices checked successfully.')+' '+new Date().toLocaleTimeString();
 }catch{
  state.stale=true;state.positions.forEach(p=>p.stale=true);render();$('#refresh-detail').textContent='Refresh failed. Showing last verified prices; automatic retry in 60 seconds.';
 }finally{busy=false;$('#refresh').disabled=false;$('#refresh').textContent='↻ Refresh';}
}
 document.querySelectorAll('[data-period]').forEach(button=>button.addEventListener('click',()=>{period=button.dataset.period;document.querySelectorAll('[data-period]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();}));
 $('#refresh').addEventListener('click',()=>refresh(true));let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(render,100);});render();refresh();setInterval(()=>{if(!document.hidden)refresh();},60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
