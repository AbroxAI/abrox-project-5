// ultimate-realism-full-v7.13.js — Full Human-Like Multi-Turn Realism Engine
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

/* =====================================================
   FULL TEMPLATES
===================================================== */
const TESTIMONIALS = [
"Made $450 in 2 hours using Abrox","Closed 3 trades, all green today ✅",
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
"London session was smooth today","NY open signals were sharp","Good for swing entries into trend",
"Banked $600 this morning, Abrox is insane! 🚀",
"I never miss a signal now, really smooth entries",
"Just hit a clean scalp on BTC/USD, amazing bot!",
"My small account doubled in 3 weeks using these signals",
"Day trading stress is gone, I can finally plan my day",
"Made consistent 2–5% gains every session this week",
"Abrox bot never misses a trend, incredible accuracy!","My profits soared thanks to Abrox signals",
"Abrox predicted a breakout perfectly today!","This bot makes trading feel effortless","Best bot I've used in years",
"Abrox alerts saved me from multiple losses","I trust Abrox for every session now","My account growth accelerated with Abrox",
"Abrox nailed the exact entry and exit points","Using Abrox is like having a personal trading mentor",
"Every trade I made following Abrox was spot-on","Abrox turned my small account into consistent profits"
];

const ADDITIONAL_TEMPLATES = [
"Anyone else excited for the next signal?","I’m learning so much from this group!",
"Can’t wait to apply this strategy today!","Does anyone track multiple signals at once?",
"What’s your favorite broker for scalping?","I’m curious how others are using these strategies",
"Does anyone do swing trades with Abrox?","Can someone share risk management tips?",
"Watching gold closely today, any thoughts?","Thinking of hedging USD/JPY, any suggestions?"
];

const ADMIN_TEMPLATES = [
"Please contact admin for verification ✅","Follow the group rules before posting",
"Welcome! Make sure to read the pinned messages","Admins will approve your access shortly",
"Check announcements for updates 🔔","Reminder: only post verified signals ⚠️",
"Keep discussions relevant, please!","Use the correct channels for trading questions"
];

const NEW_MEMBER_QUESTIONS = [
"How do I join the next signal?","Where can I find the trading guides?",
"Can someone explain this strategy?","How do I verify my account?",
"Which broker is recommended?","Do you provide a trading plan?",
"How often are signals updated?","Is there a beginner-friendly guide?",
"What’s the best way to start with a small account?","Are there crypto-only signals available?"
];

const OLD_MEMBER_REPLIES = [
"You can check the pinned messages for that","I’ve been using this strategy for months — it works",
"Admin will approve you soon, don’t worry","Try this broker, it’s reliable",
"Check the FAQ channel, everything is explained there","Check the daily signal channel for updates",
"I recommend starting with small trades first","Follow the guide in the pinned messages",
"The bot alerts are very reliable","Stick to the strategy for at least a week to see results"
];

const REPLY_TEMPLATES = [
"Yes, I agree!","Exactly 💯","Nice point 👍","I’ve been thinking the same.",
"Can you elaborate?","Interesting 🤔","😂 That’s funny!","Absolutely 🚀",
"Good catch!","Thanks for sharing 💡","Welcome aboard! 👋","Glad to be here!",
"Excited to join the discussion!","I second that!","Love this insight!","True that!","Well explained 💯",
"Interesting perspective","Couldn't agree more 👍","Spot on! 👌","I was just thinking the same",
"Haha 😂 that’s true","Couldn’t agree more!","Nice execution today","Following this closely",
"Great insight! 💡","Exactly what I needed","Thanks for sharing your results",
...TESTIMONIALS, ...ADDITIONAL_TEMPLATES, ...ADMIN_TEMPLATES, ...NEW_MEMBER_QUESTIONS, ...OLD_MEMBER_REPLIES
];

const EMOJIS = ["💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑","🎯","🏆","🤖","🎉","🍀","📊","⚡","💎","👑","🦄",
"🧠","🔮","🪙","🥂","💡","🛸","📉","📱","💬","🙌","👏","👍","❤️","😂","😅","🤞","✌️","😴","🤩",
"😬","🤝","🧾","📌","🔔","⚠️","✅","❌","📎","🧩","🔗","🔒","🌕","🌑","🌟","🏁","💹","🏦","🧭","🧯",
"🧨","📣","💤","🕐","🕒","🕘","🕛","🕓","🧿","🎚️","📬","🎲","📡","🪄","🧰","🔭","🌊","🌪️","🌤️","🛰️"];

/* =====================================================
   PERSONAS
===================================================== */
const PERSONAS = [
{name:"Alex",tone:"excited",memory:[],style:"casual"},
{name:"Jordan",tone:"analytical",memory:[],style:"professional"},
{name:"Sam",tone:"sarcastic",memory:[],style:"funny"},
{name:"Taylor",tone:"calm",memory:[],style:"supportive"},
{name:"Riley",tone:"optimistic",memory:[],style:"cheerful"}
];

function getRandomPersona(){ return PERSONAS[Math.floor(Math.random()*PERSONAS.length)]; }

/* =====================================================
   HUMAN-TIMING
===================================================== */
function randomDelay(min=1000,max=7000){ return min+Math.random()*(max-min); }
function humanTypingDelay(text,persona){
  let base=400, perChar=25;
  if(persona.tone==="analytical") perChar=30;
  if(persona.tone==="excited") perChar=18;
  if(persona.tone==="sarcastic") perChar=22;
  if(persona.tone==="calm") perChar=20;
  if(persona.tone==="optimistic") perChar=19;
  return Math.min(base+perChar*text.length,5000);
}

/* =====================================================
   COMMENT GENERATOR
===================================================== */
const GENERATED = new Set();
const POOL = [];
window.realismEngineFullPool = POOL;
window.realismEngineV12Pool = POOL;

function mark(text){ const fp=text.toLowerCase(); if(GENERATED.has(fp)) return false; GENERATED.add(fp); return true; }
function generateTimestamp(lastTimestamp=new Date()){ return new Date(lastTimestamp.getTime()+5000+Math.random()*20000); }

function generateComment(persona,lastTimestamp=new Date()){
  let templates = [
    ()=>`Guys, ${REPLY_TEMPLATES[Math.floor(Math.random()*REPLY_TEMPLATES.length)]}`,
    ()=>`Anyone trading ${ASSETS[Math.floor(Math.random()*ASSETS.length)]} on ${BROKERS[Math.floor(Math.random()*BROKERS.length)]}?`,
    ()=>`Signal for ${ASSETS[Math.floor(Math.random()*ASSETS.length)]} ${TIMEFRAMES[Math.floor(Math.random()*TIMEFRAMES.length)]} is ${RESULT_WORDS[Math.floor(Math.random()*RESULT_WORDS.length)]}`,
    ()=>`${ADMIN_TEMPLATES[Math.floor(Math.random()*ADMIN_TEMPLATES.length)]}`,
    ()=>`${NEW_MEMBER_QUESTIONS[Math.floor(Math.random()*NEW_MEMBER_QUESTIONS.length)]}`,
    ()=>`${OLD_MEMBER_REPLIES[Math.floor(Math.random()*OLD_MEMBER_REPLIES.length)]}`
  ];
  let text = templates[Math.floor(Math.random()*templates.length)]();
  if(persona.tone==="sarcastic") text="😂 "+text;
  if(persona.tone==="analytical") text+=" 📊";
  if(persona.tone==="excited") text+=" 🚀";
  if(Math.random()<0.35) text+=" — "+["good execution","tight stop","wide stop","no slippage","perfect timing","partial TP hit"][Math.floor(Math.random()*6)];
  if(Math.random()<0.45) text+=" "+EMOJIS[Math.floor(Math.random()*EMOJIS.length)];

  // Reactions, pills, jumpers, stickers
  let meta={};
  if(Math.random()<0.5) meta.reaction=["👍","❤️","😂","💯","🚀"][Math.floor(Math.random()*5)];
  if(Math.random()<0.3) meta.pill=["Admin","Bot Signal","Crypto Tip"][Math.floor(Math.random()*3)];
  if(Math.random()<0.2) meta.jumper=["Jump to USD/JPY chart","Jump to BTC/USD signal"][Math.floor(Math.random()*2)];
  if(Math.random()<0.15) meta.sticker=["🎯","🔥","💎","🚀"][Math.floor(Math.random()*4)];

  persona.memory.push(text);
  let tries=0; while(!mark(text)&&tries<30){ text+=" "+Math.floor(Math.random()*999); tries++; }
  return { text, timestamp: generateTimestamp(lastTimestamp), persona, meta };
}

/* =====================================================
   SESSION TRACKING
===================================================== */
const SESSIONS = PERSONAS.map(p=>({
  persona:p,
  active: Math.random()<0.7,
  nextAction: Date.now()+randomDelay(5000,15000),
  idleChance: 0.3+Math.random()*0.4
}));

function updateSessions(){
  const now=Date.now();
  SESSIONS.forEach(s=>{
    if(now>=s.nextAction){
      if(s.active){
        const burst=1+Math.floor(Math.random()*3);
        let lastTs=new Date();
        for(let i=0;i<burst;i++){
          const comment=generateComment(s.persona,lastTs);
          enqueueInteraction(comment);
          lastTs=comment.timestamp;
        }
        if(Math.random()<s.idleChance) s.active=false;
        s.nextAction=now+randomDelay(20000,90000);
      } else {
        if(Math.random()<0.25) s.active=true;
        s.nextAction=now+randomDelay(30000,120000);
      }
    }
  });
  setTimeout(updateSessions,1000);
}
setTimeout(updateSessions,1000);

/* =====================================================
   QUEUE + SIMULATION
===================================================== */
const interactionQueue=[];
let processingQueue=false;
function enqueueInteraction(interaction){ if(!interaction||!interaction.persona||!interaction.text) return; interactionQueue.push(interaction); processQueue(); }
async function processQueue(){
  if(processingQueue||interactionQueue.length===0) return;
  processingQueue=true;
  while(interactionQueue.length>0){
    const inter=interactionQueue.shift();
    const {persona,text,parentText,parentId,meta}=inter;
    if(!persona||!text) continue;
    const opts={};
    if(parentText||parentId){ opts.replyToId=parentId; opts.replyToText=parentText; }
    if(meta){
      if(meta.reaction) opts.reaction=meta.reaction;
      if(meta.pill) opts.pill=meta.pill;
      if(meta.jumper) opts.jumper=meta.jumper;
      if(meta.sticker) opts.sticker=meta.sticker;
    }
    if(window.TGRenderer?.appendMessage){
      const typing=humanTypingDelay(text,persona);
      await new Promise(r=>setTimeout(r,typing));
      window.TGRenderer.appendMessage(persona,text,opts);
    }
  }
  processingQueue=false;
}

function autoSimulate(lastTimestamp=new Date()){
  if(!window.realismEngineV12Pool||window.realismEngineV12Pool.length===0) return;
  const persona=getRandomPersona();
  let randomComment=generateComment(persona,lastTimestamp);
  enqueueInteraction(randomComment);

  if(Math.random()<0.25){
    let clusterSize=1+Math.floor(Math.random()*3);
    for(let i=1;i<clusterSize;i++){
      let nextMsg=generateComment(persona,randomComment.timestamp);
      nextMsg.timestamp=new Date(randomComment.timestamp.getTime()+500+Math.random()*1500);
      enqueueInteraction(nextMsg);
      randomComment.timestamp=nextMsg.timestamp;
    }
  }

  if(Math.random()<0.15){ const joiner=getRandomPersona(); simulateMultiTurnReply(joiner,randomComment); }

  const nextDelay=randomDelay(1500,6000);
  setTimeout(()=>autoSimulate(randomComment.timestamp),nextDelay);
}

/* =====================================================
   MULTI-TURN REPLIES
===================================================== */
function simulateMultiTurnReply(joinerPersona,parentComment,depth=0){
  if(depth>3) return;
  let recent=joinerPersona.memory.slice(-5);
  let replyText=NEW_MEMBER_QUESTIONS.some(q=>parentComment.text.includes(q))?
    OLD_MEMBER_REPLIES.concat(ADMIN_TEMPLATES)[Math.floor(Math.random()* (OLD_MEMBER_REPLIES.length+ADMIN_TEMPLATES.length))]:
    REPLY_TEMPLATES.concat(recent)[Math.floor(Math.random()* (REPLY_TEMPLATES.length+recent.length))];

  const delay=randomDelay(2000,12000);
  setTimeout(()=>{
    enqueueInteraction({ persona: joinerPersona, text: replyText, parentText: parentComment.text, parentId: parentComment.id });
    joinerPersona.memory.push(replyText);
    if(Math.random()<0.3){ const followUp=getRandomPersona(); simulateMultiTurnReply(followUp,{ text: replyText, id: parentComment.id },depth+1); }
  }, delay);
}

/* =====================================================
   INIT POOL & START
===================================================== */
function ensurePool(min=15000){
  let ts=new Date();
  while(POOL.length<min){
    let persona=getRandomPersona();
    let comment=generateComment(persona,ts);
    POOL.push(comment);
    ts=comment.timestamp;
  }
}
ensurePool();
setTimeout(()=>autoSimulate(),1200);

console.log("✅ Ultimate Realism Engine Full v7.13 — multi-turn, clusters, reactions, pills, jumpers, stickers, active/idle, full templates.");
})();
