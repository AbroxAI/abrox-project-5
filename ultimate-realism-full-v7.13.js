// ultimate-realism-full-v7.14.js — FULL FINAL (STRUCTURE SAFE + FULL TEMPLATES + ALL PATCHES)
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

const RESULT_WORDS = ["green","red","profit","loss","win","missed entry","recovered","scalped nicely","small win","big win",
"moderate loss","loss recovered","double profit","consistent profit","partial win","micro win",
"entry late but profitable","stopped loss","hedged correctly","full green streak","partial loss",
"break-even","tight stop","wide stop","re-entry success","slippage hit","perfect exit",
"stop hunted","rolled over","swing profit","scalp win","gap fill","retest failed","trend follow"];

/* =====================================================
TOPICS
===================================================== */
const TOPICS = ["gold","crypto","scalping","risk","london","ny","breakout","trend","loss","profit"];
let CURRENT_TOPIC = TOPICS[Math.floor(Math.random()*TOPICS.length)];
function rotateTopic(){
  if(Math.random()<0.15){
    CURRENT_TOPIC = TOPICS[Math.floor(Math.random()*TOPICS.length)];
  }
}

/* =====================================================
FULL TEMPLATES (RESTORED)
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
"What’s your win rate looking like lately?","Do you guys journal your trades?"
];

const ADMIN_TEMPLATES = [
"Please contact admin for verification ✅","Follow the group rules before posting",
"Welcome! Make sure to read the pinned messages","Admins will approve your access shortly",
"Check announcements for updates 🔔","Verification is required before accessing signals",
"Please avoid spamming the chat","Only verified members can access full features"
];

const NEW_MEMBER_QUESTIONS = [
"How do I join the next signal?","Where can I find the trading guides?",
"Can someone explain this strategy?","How do I verify my account?",
"Is this beginner friendly?","How much capital do I need to start?"
];

const OLD_MEMBER_REPLIES = [
"You can check the pinned messages for that","I’ve been using this strategy for months — it works",
"Admin will approve you soon, don’t worry","Try this broker, it’s reliable",
"Start with small risk until you understand it","Consistency is key, don’t rush it"
];

const REPLY_TEMPLATES = [
"Yes, I agree!","Exactly 💯","Nice point 👍","I’ve been thinking the same.",
"Can you elaborate?","Interesting 🤔","😂 That’s funny!","Absolutely 🚀",
"Good catch!","Thanks for sharing 💡","Welcome aboard! 👋"
];

/* =====================================================
PERSONAS
===================================================== */
let LAST_PERSONA=null;
const PERSONAS=[
{name:"Alex",tone:"excited",memory:[],history:[],style:"casual"},
{name:"Jordan",tone:"analytical",memory:[],history:[],style:"professional"},
{name:"Sam",tone:"sarcastic",memory:[],history:[],style:"funny"},
{name:"Taylor",tone:"calm",memory:[],history:[],style:"supportive"},
{name:"Riley",tone:"optimistic",memory:[],history:[],style:"cheerful"}
];

function getRandomPersona(){
  let p;
  do{ p=PERSONAS[Math.floor(Math.random()*PERSONAS.length)]; }
  while(p===LAST_PERSONA && Math.random()<0.7);
  LAST_PERSONA=p;
  return p;
}

/* =====================================================
TIMING
===================================================== */
function randomDelay(min=1000,max=7000){
  return min+Math.random()*(max-min);
}

function humanTypingDelay(text,persona){
  let base=400, perChar=25;
  if(persona.tone==="analytical") perChar=30;
  if(persona.tone==="excited") perChar=18;
  return Math.min(base+perChar*text.length,5000);
}

/* =====================================================
SMART PICK
===================================================== */
function smartPick(arr,memory=[]){
  let filtered=arr.filter(x=>!memory.includes(x));
  if(filtered.length<5){
    memory.splice(0,Math.floor(memory.length/2));
    filtered=arr;
  }
  const pick=filtered[Math.floor(Math.random()*filtered.length)];
  memory.push(pick);
  if(memory.length>120) memory.shift();
  return pick;
}

/* =====================================================
COMMENT GENERATOR
===================================================== */
const GENERATED=new Set();

function mark(text){
  const fp=text.toLowerCase();
  if(GENERATED.has(fp)) return false;
  GENERATED.add(fp);
  return true;
}

function generateTimestamp(lastTimestamp=new Date()){
  return new Date(lastTimestamp.getTime()+5000+Math.random()*20000);
}

function generateComment(persona,lastTimestamp=new Date()){
  rotateTopic();

  const poolFuncs=[
    ()=>smartPick(TESTIMONIALS,persona.memory),
    ()=>smartPick(ADDITIONAL_TEMPLATES,persona.memory),
    ()=>smartPick(OLD_MEMBER_REPLIES,persona.memory),
    ()=>smartPick(NEW_MEMBER_QUESTIONS,persona.memory),
    ()=>smartPick(ADMIN_TEMPLATES,persona.memory),
    ()=>`Anyone trading ${smartPick(ASSETS,persona.memory)} on ${smartPick(BROKERS,persona.memory)}?`,
    ()=>`Result was ${smartPick(RESULT_WORDS,persona.memory)} on ${smartPick(ASSETS,persona.memory)}`
  ];

  const generator=poolFuncs[Math.floor(Math.random()*poolFuncs.length)];
  let baseText=generator();

  if(Math.random()<0.3){
    baseText+=` (${CURRENT_TOPIC})`;
  }

  let text;
  if(Math.random()<0.12){
    text=smartPick(REPLY_TEMPLATES,persona.memory)+" — "+baseText;
  }else{
    text=baseText;
  }

  if(persona.tone==="sarcastic") text="😂 "+text;
  if(persona.tone==="analytical") text+=" 📊";
  if(persona.tone==="excited") text+=" 🚀";

  if(Math.random()<0.25){
    text+=[""," 👍"," 🔥"," 💯"][Math.floor(Math.random()*4)];
  }

  persona.history.push(text);
  if(persona.history.length>200) persona.history.shift();

  let tries=0;
  while(!mark(text)&&tries<30){
    text+=" "+Math.floor(Math.random()*999);
    tries++;
  }

  let meta={};
  if(Math.random()<0.5){
    meta.reaction=["👍","❤️","😂","💯","🚀"][Math.floor(Math.random()*5)];
  }

  return { text, timestamp:generateTimestamp(lastTimestamp), persona, meta };
}

/* =====================================================
LURKER REACTIONS
===================================================== */
function simulateLurkerReaction(id){
  if(!window.TGRenderer?.addReaction||!id) return;
  const emojis=["👍","🔥","💯","😂","❤️"];
  const emoji=emojis[Math.floor(Math.random()*emojis.length)];
  setTimeout(()=>window.TGRenderer.addReaction(id,emoji),1000+Math.random()*4000);
}

/* =====================================================
QUEUE (UNCHANGED STRUCTURE)
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
    const inter=interactionQueue.shift();
    const {persona,text,parentText,parentId,meta}=inter;
    const opts={};

    if(parentText||parentId){
      opts.replyToId=parentId||null;
      let preview=(parentText||"").replace(/<[^>]+>/g,'');
      if(preview.length>60) preview=preview.substring(0,60)+"...";
      opts.replyToText=preview;
    }

    if(meta?.reaction){
      opts.reactions=[{emoji:meta.reaction,count:1+Math.floor(Math.random()*5)}];
    }

    if(window.TGRenderer?.appendMessage){
      const typing=humanTypingDelay(text,persona);
      await new Promise(r=>setTimeout(r,typing));
      const id=window.TGRenderer.appendMessage(persona,text,opts);
      inter.id=id;

      if(Math.random()<0.35){
        simulateLurkerReaction(id);
      }
    }
  }

  processingQueue=false;
}

/* =====================================================
SIMULATION LOOP
===================================================== */
function autoSimulate(lastTimestamp=new Date()){
  const persona=getRandomPersona();
  let msg=generateComment(persona,lastTimestamp);
  enqueueInteraction(msg);

  if(Math.random()<0.2){
    let reply=generateComment(getRandomPersona(),msg.timestamp);
    reply.parentText=msg.text;
    enqueueInteraction(reply);
  }

  setTimeout(()=>autoSimulate(msg.timestamp),randomDelay(1500,6000));
}

/* =====================================================
INIT
===================================================== */
setTimeout(()=>autoSimulate(),1200);
console.log("✅ FULL FINAL — templates restored + patches + wiring intact");

})();
