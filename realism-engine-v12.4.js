// realism-engine-v12.4.js — Admin signals + auto-reactions + multi-cluster nested replies
(function(){

/* =====================================================
DATA POOLS (HIGH-VOLUME)
==================================================== */
const ASSETS = ["EUR/USD","USD/JPY","GBP/USD","AUD/USD","BTC/USD","ETH/USD","USD/CHF","EUR/JPY","NZD/USD",
"US30","NAS100","SPX500","DAX30","FTSE100","GOLD","SILVER","WTI","BRENT",
"ADA/USD","SOL/USD","DOGE/USD","DOT/USD","LINK/USD","MATIC/USD","LUNC/USD","AVAX/USD",
"JPY/CHF","GBP/JPY","EUR/GBP","AUD/JPY","CAD/JPY","US500","RUS_50"];

const BROKERS = ["IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade","OlympTrade","Binary.com",
"eToro","Plus500","IG","XM","FXTM","Pepperstone","IC Markets","Bybit","Binance","OKX","Kraken"];

const TIMEFRAMES = ["M1","M5","M15","M30","H1","H4","D1","W1","MN1"];

const RESULT_WORDS = ["green","red","profit","loss","win","missed entry","recovered","scalped nicely","small win","big win",
"moderate loss","loss recovered","double profit","consistent profit","partial win","micro win",
"entry late but profitable","stopped loss","hedged correctly","full green streak","partial loss",
"break-even","tight stop","wide stop","re-entry success","slippage hit","perfect exit",
"stop hunted","rolled over","swing profit","scalp win","gap fill","retest failed","trend follow",
"mean reversion hit","liquidity grab","fakeout","nice tp hit","sloppy execution"];

const TESTIMONIALS = ["Made $450 in 2 hours using Abrox","Closed 3 trades, all green today ✅",
"Recovered a losing trade thanks to Abrox","7 days straight of consistent profit 💹",
"Abrox saved me from a $200 loss","50% ROI in a single trading session 🚀",
"Signal timing was perfect today","Scalped 5 trades successfully today 🚀",
"Missed entry but recovered","Made $120 in micro trades this session",
"Small wins add up over time, Abrox is legit","Never had such accurate entries before",
"This bot reduced stress, makes trading predictable 😌","Entry was late but still profitable 💹",
"Hedged correctly thanks to bot signals","Altcoin signals were on point today",
"Recovered yesterday’s loss in one trade","Made $300 in under 3 hours",
"Bot suggested perfect exit on USD/JPY","Day trading made predictable thanks to Abrox",
"Consistent 5–10% daily growth","Doubled small account this week","Low drawdown strategy works",
"Finally profitable after months","Swing trades hitting clean targets","Abrox nailed the breakout entry",
"Risk management improved massively","Caught gold rally early","Crypto volatility handled perfectly",
"London session was smooth today","NY open signals were sharp","Good for swing entries into trend"];

const EMOJIS = ["💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑","🎯","🏆","🤖","🎉","🍀","📊","⚡","💎","👑","🦄",
"🧠","🔮","🪙","🥂","💡","🛸","📉","📱","💬","🙌","👏","👍","❤️","😂","😅","🤞","✌️","😴","🤩",
"😬","🤝","🧾","📌","🔔","⚠️","✅","❌","📎","🧩","🔗","🔒","🌕","🌑","🌟","🏁","💹","🏦","🧭","🧯",
"🧨","📣","💤","🕐","🕒","🕘","🕛","🕓","🧿","🎚️","📬","🎲","📡","🪄","🧰","🔭","🌊","🌪️","🌤️","🛰️"];

// =====================================================
// UTILITIES
// =====================================================
function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function maybe(p){ return Math.random() < p; }
function rand(max=9999){ return Math.floor(Math.random()*max); }
function hash(str){ let h=5381; for(let i=0;i<str.length;i++) h=((h<<5)+h)+str.charCodeAt(i); return (h>>>0).toString(36); }

const GENERATED = new Set();
const QUEUE = [];
const POOL = [];
window.realismEngineV12Pool = POOL;

function mark(text){
  const fp = hash(text.toLowerCase());
  if(GENERATED.has(fp)) return false;
  GENERATED.add(fp);
  QUEUE.push(fp);
  while(QUEUE.length>100000) GENERATED.delete(QUEUE.shift());
  return true;
}

function ensurePool(min=5000){
  while(POOL.length<min){
    POOL.push(generateComment());
    if(POOL.length>20000) break;
  }
}

function generateTimestamp(days=120){
  return new Date(Date.now() - Math.random()*days*86400000);
}

function generateComment(){
  const templates = [
    ()=>`Guys, ${random(TESTIMONIALS)}`,
    ()=>`Anyone trading ${random(ASSETS)} on ${random(BROKERS)}?`,
    ()=>`Signal for ${random(ASSETS)} ${random(TIMEFRAMES)} is ${random(RESULT_WORDS)}`,
    ()=>`Abrox alerted ${random(ASSETS)} ${random(TIMEFRAMES)} — ${random(RESULT_WORDS)}`,
    ()=>`Closed ${random(ASSETS)} on ${random(TIMEFRAMES)} — ${random(RESULT_WORDS)}`,
    ()=>`Scalped ${random(ASSETS)} on ${random(BROKERS)}, result ${random(RESULT_WORDS)}`,
    ()=>`Testimonial: ${random(TESTIMONIALS)}`,
    ()=>`Just entered ${random(ASSETS)} ${random(TIMEFRAMES)}, let's see how this plays out`,
    ()=>`Anyone else catch that ${random(ASSETS)} move?`,
    ()=>`Watching ${random(ASSETS)} closely today`
  ];

  let text = random(templates)();  
  if(maybe(0.35)) text += " — " + random(["good execution","tight stop","wide stop","no slippage","perfect timing","partial TP hit"]);  
  if(maybe(0.45)) text += " " + random(EMOJIS);  

  let tries=0;  
  while(!mark(text)&&tries<30){  
    text+=" "+rand(999);  
    tries++;  
  }  

  return { text, timestamp: generateTimestamp() };
}

// =====================================================
// DYNAMIC TYPING
// =====================================================
async function performTyping(persona,message){
  if(!persona?.name) return;
  document.dispatchEvent(
    new CustomEvent("headerTyping", { detail: { name: persona.name } })
  );
  const duration = window.TGRenderer?.calculateTypingDuration?.(message) || 1200;
  await new Promise(resolve => setTimeout(resolve, duration));
}

// =====================================================
// MULTI-CLUSTER POSTING + AUTO-REACTIONS
// =====================================================
async function postMessage(item, parent=null){
  const persona = parent?.persona || window.identity.getRandomPersona();
  let replyData={};
  if(maybe(0.28) && parent){
    replyData = { replyToId: parent.id, replyToText: parent.text.slice(0,120) };
  }

  await performTyping(persona,item.text);  

  const autoReactions = Array.from({length:2+rand(3)},()=>({ emoji: random(EMOJIS), count: rand(9)+1 }));  

  if(window.TGRenderer?.appendMessage){  
    window.TGRenderer.appendMessage(persona,item.text,{  
      timestamp:item.timestamp,  
      type:"incoming",  
      id:`realism_${Date.now()}_${rand(9999)}`,  
      ...replyData,  
      reactions:autoReactions  
    });  
  }  

  if(maybe(0.3)){  
    const nestedCount = rand(2)+1;  
    for(let i=0;i<nestedCount;i++){  
      const delay = 400 + Math.random()*1600;  
      setTimeout(()=>postMessage(generateComment(), { persona, id:`nested_${Date.now()}_${i}`, text:item.text }), delay);  
    }  
  }
}

// =====================================================
// ADMIN SIGNAL REPLY CLUSTER + AUTO-REACTIONS
// =====================================================
async function postAdminSignal(signalText){
  const admin = window.identity.Admin;

  window.TGRenderer?.appendMessage(admin, signalText, { type:"incoming", id:`signal_${Date.now()}` });  

  const replies = rand(5)+3;  
  for(let i=0;i<replies;i++){  
    setTimeout(()=>postMessage(generateComment(), { persona: window.identity.getRandomPersona(), id:`reply_${i}`, text: signalText }), 500 + Math.random()*1200);  
  }  

  setTimeout(()=>{  
    const nestedReplies = rand(3)+2;  
    for(let i=0;i<nestedReplies;i++){  
      const parentComment = { persona: window.identity.getRandomPersona(), text: "Following up on signal" };  
      postMessage(generateComment(), parentComment);  
    }  
  },1500+Math.random()*1000);
}

// =====================================================
// SIMULATE CROWD & JOINERS
// =====================================================
async function simulateCrowd(count=80,minDelay=300,maxDelay=1400){
  ensurePool(count);
  for(let i=0;i<count;i++){
    const item=POOL.shift();
    if(!item) break;
    await postMessage(item);
    const pause = minDelay + Math.random()*(maxDelay-minDelay);
    await new Promise(res=>setTimeout(res,pause));
  }
}

function simulateJoiners(count=3){
  const joiners = [];
  for(let i=0;i<count;i++) joiners.push(window.identity.getRandomPersona());
  window.TGRenderer?.appendJoinSticker(joiners);
}

// =====================================================
// SCHEDULER
// =====================================================
let started=false;
function schedule(){
  const min=15000,max=80000;
  const interval=min+Math.random()*(max-min);
  setTimeout(async ()=>{
    await simulateCrowd(rand(3)+1);
    if(maybe(0.05)) simulateJoiners(rand(2)+1);
    schedule();
  },interval);
}

function simulate(){
  if(started) return;
  started=true;
  simulateCrowd(100,300,1200);
  schedule();
}

setTimeout(async ()=>{
  ensurePool(5000);
  await simulateCrowd(100,300,1200);
  simulate();
  console.log("✅ Realism Engine V12.4 — Admin signals + multi-cluster nested replies + auto-reactions fully synced.");
},900);

window.realism = { simulateCrowd, postMessage, simulate, simulateJoiners, postAdminSignal };

})();
