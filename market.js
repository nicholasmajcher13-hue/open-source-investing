const symbols=['COST','SCHW','GOOGL','GEV','VOO'];
const details={
 COST:{name:'Costco',sector:'Consumer staples',allocation:25000,description:'Membership-based warehouse retail, built around value and recurring renewals.',holdUntil:'January 2027'},
 SCHW:{name:'Charles Schwab',sector:'Financials',allocation:15000,description:'Brokerage, banking, and investment services for individual investors.',holdUntil:'October 2027'},
 GOOGL:{name:'Alphabet / Google',sector:'Communication services',allocation:35000,description:'Search, digital advertising, YouTube, and cloud computing.',holdUntil:'September 2028'},
 GEV:{name:'GE Vernova',sector:'Industrials',allocation:8750,description:'Power generation, wind, and electrification infrastructure.',holdUntil:'April 2027'},
 VOO:{name:'Vanguard S&P 500 ETF',sector:'Multi-sector ETF',allocation:8750,description:'Broad exposure to large U.S. companies through the S&P 500.',holdUntil:'January 2027'}
};
export function extractQuote(chart){
 const m=chart.meta,times=chart.timestamp,quotes=chart.indicators?.quote?.[0];
 if(!m||!times?.length||!quotes)throw new Error('Incomplete chart');
 const date=t=>new Date(t*1000).toLocaleDateString('en-CA',{timeZone:'America/New_York'});
 const currentDate=date(m.regularMarketTime);
 let previousClose=null;
 for(let i=times.length-1;i>=0;i--){if(date(times[i])<currentDate&&Number.isFinite(quotes.close[i])&&quotes.close[i]>0){previousClose=quotes.close[i];break;}}
 if(![m.regularMarketPrice,m.regularMarketTime,previousClose].every(v=>Number.isFinite(v)&&v>0))throw new Error('Invalid market data');
 if(currentDate<'2026-11-10')throw new Error('Quote predates portfolio');
 return {price:m.regularMarketPrice,timestamp:m.regularMarketTime,previousClose};
}
let cached=null,inflight=null;
export function initialPortfolio(){return {positions:BASELINES.map(p=>({...p,...details[p.symbol],stale:true})),cash:7500,initialCapital:100000,purchaseDate:"2026-11-10",checkedAt:null,stale:true,source:"Yahoo Finance"};}
export async function portfolio(requestFn=fetch,force=false){
 if(cached&&Date.now()-cached.checkedAt<(force?3000:60000))return cached;
 if(inflight)return inflight;
 inflight=(async()=>{
  const results=await Promise.allSettled(symbols.map(async symbol=>{
   const response=await requestFn('https://query1.finance.yahoo.com/v8/finance/chart/'+symbol+'?interval=1d&range=5d',{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(6500)});
   if(!response.ok)throw new Error('Market data unavailable');
   const json=await response.json();return extractQuote(json.chart.result[0]);
  }));
  const positions=symbols.map((symbol,i)=>{const baseline=BASELINES.find(p=>p.symbol===symbol),previous=cached?.positions.find(p=>p.symbol===symbol);return {...baseline,...details[symbol],...(results[i].status==='fulfilled'?results[i].value:previous||{}),stale:results[i].status!=='fulfilled'};});
  cached={positions,cash:7500,initialCapital:100000,purchaseDate:'2026-11-10',checkedAt:Date.now(),stale:results.some(r=>r.status!=='fulfilled'),source:'Yahoo Finance'};
  return cached;
 })();
 try{return await inflight;}finally{inflight=null;}
}
export default {async fetch(request,env,ctx){
 const url=new URL(request.url);
 if(request.method!=='GET')return new Response('Method not allowed',{status:405});
 if(url.pathname==='/api/portfolio'){
  let data;
  try { data=await portfolio(fetch,url.searchParams.get('refresh')==='1'); }
  catch { data={...(cached||initialPortfolio()),stale:true,checkedAt:Date.now()}; }
  return new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
 }
 if(url.pathname==='/app.js')return new Response(CLIENT,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store'}});
 if(url.pathname!=='/')return new Response('Not found',{status:404});
 const initial=JSON.stringify(cached||initialPortfolio()).replaceAll('<','\\u003c');
 const html=PAGE.replace('<!--INITIAL_PORTFOLIO-->','<script type="application/json" id="initial-portfolio">'+initial+'</script>');
 return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
}};
