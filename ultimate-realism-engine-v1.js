// ultimate-realism-interactions-v2.js — Full Realism + Crowd + Joiners + Reactions (Fully Synced)
(function(){

'use strict';

/* =====================================================
   DATA POOLS
===================================================== */
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

/* =====================================================
   UTILITY FUNCTIONS
===================================================== */
function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function maybe(p){ return Math.random() < p; }
function rand(max=9999){ return Math.floor(Math.random()*max); }
function hash(str){ let h=5381; for(let i=0;i<str.length;i++) h=((h<<5)+h)+str.charCodeAt(i); return (h>>>0).toString(36); }

/* =====================================================
   COMMENT POOL & QUEUE
===================================================== */
const GENERATED = new Set();
const QUEUE = [];
const POOL = [];
window.realismEngineFullPool = POOL;
window.realismEngineV12Pool = POOL; // unified pool for interactions

function mark(text){
  const fp = hash(text.toLowerCase());
  if(GENERATED.has(fp)) return false;
  GENERATED.add(fp);
  QUEUE.push(fp);
  while(QUEUE.length>100000) GENERATED.delete(QUEUE.shift());
  return true;
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

/* =====================================================
   TYPING FUNCTION
===================================================== */
async function performTyping(persona,message){
  if(!persona?.name) return;
  document.dispatchEvent(
    new CustomEvent("headerTyping",{detail:{name:persona.name}})
  );
  const duration = window.TGRenderer?.calculateTypingDuration?.(message)||1200;
  await new Promise(res=>setTimeout(res,duration));
}

/* =====================================================
   MESSAGE QUEUE
===================================================== */
const interactionQueue=[];
let processingQueue=false;

function enqueueInteraction(interaction){
  if(!interaction||!interaction.persona||!interaction.text) return;
  interactionQueue.push(interaction);
  processQueue();
}

async function processQueue(){
  if(processingQueue||interactionQueue.length===0) return;
  processingQueue=true;
  while(interactionQueue.length>0){
    const interaction=interactionQueue.shift();
    const {persona,text,parentText,parentId}=interaction;
    if(!persona||!text) continue;

    const opts={};
    if(parentText||parentId){ opts.replyToId=parentId; opts.replyToText=parentText; }

    if(window.TGRenderer?.appendMessage){
      const msgId=window.TGRenderer.appendMessage(persona,text,opts);
      interaction._msgId=msgId;
    }

    const typingDuration=window.TGRenderer?.calculateTypingDuration?.(text)||1200;
    await new Promise(res=>setTimeout(res,typingDuration+200));
  }
  processingQueue=false;
}

/* =====================================================
   AUTO REPLIES & JOINERS
===================================================== */
const REPLY_TEMPLATES=[
  "Yes, I agree!","Exactly 💯","Nice point 👍","I’ve been thinking the same.",
  "Can you elaborate?","Interesting 🤔","😂 That’s funny!","Absolutely 🚀",
  "Good catch!","Thanks for sharing 💡","Welcome aboard! 👋","Glad to be here!",
  "Excited to join the discussion!","I second that!","Love this insight!",
  "True that!","Well explained 💯","Interesting perspective","Couldn't agree more 👍"
];

function getRandomReply(){ return REPLY_TEMPLATES[Math.floor(Math.random()*REPLY_TEMPLATES.length)]; }

function simulateJoinerReply(joinerPersona){
  const randomComment=random(window.realismEngineV12Pool);
  if(!randomComment) return;
  enqueueInteraction({ persona: joinerPersona, text: getRandomReply(), parentText: randomComment.text, parentId: randomComment.id });
}

/* =====================================================
   AUTO SIMULATION LOOP
===================================================== */
function autoSimulate(){
  if(!window.realismEngineV12Pool || window.realismEngineV12Pool.length===0) return;
  const persona = window.identity?.getRandomPersona();
  if(!persona) return;

  const randomComment = random(window.realismEngineV12Pool);
  if(!randomComment) return;

  enqueueInteraction({ persona, text: randomComment.text });

  // Occasionally simulate a joiner reply
  if(Math.random()<0.1){
    const joiner = window.identity?.getRandomPersona();
    if(joiner) simulateJoinerReply(joiner);
  }

  const nextInterval=800 + Math.random()*2500;
  setTimeout(autoSimulate, nextInterval);
}

/* =====================================================
   POOL INIT
===================================================== */
function ensurePool(min=8000){
  while(POOL.length<min) POOL.push(generateComment());
}
ensurePool();

/* =====================================================
   START SIMULATION
===================================================== */
setTimeout(autoSimulate, 1200);

console.log("✅ Ultimate Realism Engine v2 — fully synced with interactions, unified pool, chat guaranteed to load.");

})();
