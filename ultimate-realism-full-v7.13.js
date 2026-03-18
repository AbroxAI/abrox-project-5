// ultimate-realism-full-v9.1-merged.js — Full Human-Like Multi-Turn Realism Engine (FULL PATCHED + FULL TEMPLATES)
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
FULL TEMPLATES (v9.1)
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
"Made steady gains all week, no stress trading","Compounding slowly but it’s working",
"Took 2 losses but recovered everything later","Risk management really paying off now",
"Confidence is way higher trading with this setup","Even choppy markets are manageable now",
"Just hit my daily target, done for today ✅","Account growth finally consistent",
"Stopped overtrading and results improved instantly","Execution getting cleaner every day",
"Patience really made the difference this time","Missed one trade but caught the next move perfectly",
"Finally understanding market structure better","Entries are cleaner, exits even better now",
"Scaling up slowly, results still consistent","Low risk trades but still profitable",
"Consistency > big wins, this proves it","Trading feels way less emotional now",
"Small account growing steadily 📈","Keeping losses small made a huge difference"
];

const ADDITIONAL_TEMPLATES = [
"Anyone else excited for the next signal?","I’m learning so much from this group!",
"Can’t wait to apply this strategy today!","Does anyone track multiple signals at once?",
"What’s your favorite broker for scalping?","I’m curious how others are using these strategies",
"Who else is waiting for NY session?","Do you guys prefer scalping or swing trades?",
"Anyone trading gold today?","How many trades do you usually take per day?",
"Do you stick to one asset or multiple?","What risk % are you guys using?",
"Anyone here trading full time?","Do you guys follow news or just technicals?",
"Is anyone using higher timeframes here?","How do you handle losing streaks?",
"What’s your win rate looking like lately?","Do you guys journal your trades?",
"Anyone focusing on crypto today?","What’s your best performing pair recently?",
"Do you guys trade London session mostly?","Anyone else avoiding overtrading today?",
"How do you guys confirm entries?","Do you combine indicators or pure price action?"
];

const ADMIN_TEMPLATES = [
"Please contact admin for verification ✅","Follow the group rules before posting",
"Welcome! Make sure to read the pinned messages","Admins will approve your access shortly",
"Check announcements for updates 🔔","Verification is required before accessing signals",
"Please avoid spamming the chat","Only verified members can access full features",
"Check the pinned guide before asking questions","Admins are reviewing new members now",
"Stay respectful in the group","Signal updates will be posted shortly",
"Make sure notifications are turned on 🔔","Important update in pinned message",
"Please follow instructions carefully"
];

const NEW_MEMBER_QUESTIONS = [
"How do I join the next signal?","Where can I find the trading guides?",
"Can someone explain this strategy?","How do I verify my account?",
"Is this beginner friendly?","How much capital do I need to start?",
"Do I need prior trading experience?","Where do I see the signals?",
"How often are signals sent?","Is there a risk management guide?",
"Can someone explain how entries work?","Do I need to use a specific broker?",
"Are signals manual or automated?","Is there a demo option to test first?",
"How do I avoid losses?","What timeframe should I focus on?",
"Is this suitable for small accounts?","How long does verification take?",
"Can I trade part-time with this?"
];

const OLD_MEMBER_REPLIES = [
"You can check the pinned messages for that","I’ve been using this strategy for months — it works",
"Admin will approve you soon, don’t worry","Try this broker, it’s reliable",
"Start with small risk until you understand it","Consistency is key, don’t rush it",
"I was confused at first too, you’ll get it","Just follow the rules and you’ll be fine",
"Took me a week to fully understand everything","Stick to one strategy, don’t overcomplicate",
"It works if you stay disciplined","I’ve tested multiple brokers, this one is solid",
"Focus on risk management first","Don’t chase trades, wait for confirmation",
"Keep emotions out of it, that’s the trick","Patience matters more than anything here"
];

const REPLY_TEMPLATES = [
"Yes, I agree!","Exactly 💯","Nice point 👍","I’ve been thinking the same.",
"Can you elaborate?","Interesting 🤔","😂 That’s funny!","Absolutely 🚀",
"Good catch!","Thanks for sharing 💡","Welcome aboard! 👋",
"That actually makes sense","I noticed that too","Same experience here",
"Couldn’t agree more","That’s a solid point","Never thought about it that way",
"That’s interesting honestly","I’ll try that next time","Good insight 👍",
"Appreciate that","That helped a lot","Makes things clearer now",
"That’s useful info","Fair enough","True, very true",
"I see what you mean","That’s valid","Exactly what I was thinking","Nice explanation"
];

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
HUMAN TIMING & DELAYS + TYPING
===================================================== */
function randomDelay(min=800,max=5000){
  let delay = min + Math.random()*(max-min);
  if(window.currentPersona && window.currentPersona.tone){
    switch(window.currentPersona.tone){
      case "excited": delay*=0.8; break;
      case "sarcastic": delay*=1.1; break;
      case "analytical": delay*=1.2; break;
      case "calm": delay*=1.0; break;
      case "optimistic": delay*=0.9; break;
    }
  }
  delay += Math.random()*300;
  return Math.round(delay);
}

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

function mark(text){
  const fp=text.toLowerCase();
  if(GENERATED.has(fp)) return false;
  GENERATED.add(fp);
  if(GENERATED.size>5000) GENERATED.delete(GENERATED.values().next().value);
  return true;
}

function generateTimestamp(lastTimestamp=new Date()){
  return new Date(lastTimestamp.getTime()+5000+Math.random()*20000);
}

function generateComment(persona,lastTimestamp=new Date()){
  let poolFuncs = [
    ()=>smartPick(TESTIMONIALS,persona.memory),
    ()=>smartPick(ADDITIONAL_TEMPLATES,persona.memory),
    ()=>smartPick(OLD_MEMBER_REPLIES,persona.memory),
    ()=>smartPick(NEW_MEMBER_QUESTIONS,persona.memory),
    ()=>smartPick(ADMIN_TEMPLATES,persona.memory),
    ()=>`Anyone trading ${smartPick(ASSETS,persona.memory)} on ${smartPick(BROKERS,persona.memory)}?`,
    ()=>`Result was ${smartPick(RESULT_WORDS,persona.memory)} on ${smartPick(ASSETS,persona.memory)}`
  ];

  let text;
  if(Math.random()<0.2){
    text = smartPick(REPLY_TEMPLATES, persona.memory) + " — " + smartPick(poolFuncs.map(f=>f()), persona.memory);
  } else {
    text = smartPick(poolFuncs.map(f=>f()), persona.memory);
  }

  if(persona.tone==="sarcastic") text="😂 "+text;
  if(persona.tone==="analytical") text+=" 📊";
  if(persona.tone==="excited") text+=" 🚀";

  persona.memory.push(text);
  if(persona.memory.length>150) persona.memory.shift();

  let tries=0;
  while(!mark(text)&&tries<50){ text+=" "+Math.floor(Math.random()*9999); tries++; }

  let meta={};
  if(Math.random()<0.6){ meta.reaction=["👍","❤️","😂","💯","🔥","🚀"][Math.floor(Math.random()*6)]; }

  return { text, timestamp: generateTimestamp(lastTimestamp), persona, meta };
}

function smartPick(arr, memory=[]){
  let filtered = arr.filter(x=>!memory.includes(x));
  if(!filtered.length) filtered = arr;
  let pick = filtered[Math.floor(Math.random()*filtered.length)];
  memory.push(pick);
  if(memory.length>50) memory.shift();
  return pick;
}

/* =====================================================
MERGED JOINERS QUEUE & QUEUE LOGIC
===================================================== */
let pendingJoiners = [];
let joinerTimeout;
function queueJoiner(joinerPersona) {
  if (!joinerPersona?.name) return;
  pendingJoiners.push(joinerPersona.name);
  if (joinerTimeout) clearTimeout(joinerTimeout);
  joinerTimeout = setTimeout(() => {
    if (window.TGRenderer?.appendJoinSticker) {
      window.TGRenderer.appendJoinSticker(pendingJoiners);
      const container = document.getElementById('tg-comments-container');  
      if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });  
    }  
    pendingJoiners = [];
  }, 1200);
}

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
    const inter=interactionQueue.shift();
    const {persona,text,parentText,parentId,meta}=inter;
    const opts={};
    if(parentText||parentId){
      opts.replyToId=parentId||null;
      opts.replyToText=parentText||null;
    }
    if(meta && meta.reaction){
      opts.reactions=[{ emoji:meta.reaction, count:1+Math.floor(Math.random()*5) }];
    }
    if(window.TGRenderer?.appendMessage){
      const typing=humanTypingDelay(text,persona);
      await new Promise(r=>setTimeout(r,typing));
      const id=window.TGRenderer.appendMessage(persona,text,opts);
      inter.id=id;
    }
  }
  processingQueue=false;
}

/* =====================================================
MULTI-TURN REPLIES
===================================================== */
function simulateMultiTurnReply(joinerPersona,parentComment,depth=0){
  if(depth>3) return;
  let replyText=REPLY_TEMPLATES[Math.floor(Math.random()*REPLY_TEMPLATES.length)];
  const delay=randomDelay(2000,12000);
  setTimeout(()=>{
    enqueueInteraction({ persona:joinerPersona, text:replyText, parentText:parentComment.text, parentId:parentComment.id||null });
    joinerPersona.memory.push(replyText);
    if(Math.random()<0.3){
      const followUp=getRandomPersona();
      simulateMultiTurnReply(followUp,{ text:replyText, id:parentComment.id },depth+1);
    }
  },delay);
}

/* =====================================================
AUTO SIMULATION LOOP
===================================================== */
function autoSimulate(lastTimestamp=new Date()){
  const persona=getRandomPersona();
  let randomComment=generateComment(persona,lastTimestamp);
  enqueueInteraction(randomComment);

  if(Math.random()<0.08){
    const joinCount=1+Math.floor(Math.random()*3);
    for(let i=0;i<joinCount;i++){
      queueJoiner(getRandomPersona());
    }
  }

  if(Math.random()<0.25){
    let clusterSize=1+Math.floor(Math.random()*3);
    for(let i=1;i<clusterSize;i++){
      let nextMsg=generateComment(persona,randomComment.timestamp);
      if(Math.random()<0.4){ nextMsg.parentText=randomComment.text; nextMsg.parentId=randomComment.id; }
      nextMsg.timestamp=new Date(randomComment.timestamp.getTime()+500+Math.random()*1500);
      enqueueInteraction(nextMsg);
      randomComment=nextMsg;
    }
  }

  if(Math.random()<0.15){
    const joiner=getRandomPersona();
    simulateMultiTurnReply(joiner,randomComment);
  }

  const nextDelay=randomDelay(1500,6000);
  setTimeout(()=>autoSimulate(randomComment.timestamp),nextDelay);
}

/* =====================================================
POOL INIT
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
console.log("✅ Ultimate Realism Engine FULL PATCHED + FULL TEMPLATES — MERGED joiners, smooth scrolling, multi-turn replies, typing, reactions ready.");
})();
