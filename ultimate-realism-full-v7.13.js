// ultimate-realism-full-v7.14.js — FULL ENGINE (PATCHED v8 LOGIC, SAME STRUCTURE)
// UPDATED: expanded ALL templates & pools (sent as a straight block)
(function(){
'use strict';

/* =====================================================
   DATA POOLS (INCREASED)
===================================================== */
const ASSETS = [
  // Forex majors & minors
  "EUR/USD","USD/JPY","GBP/USD","AUD/USD","USD/CHF","NZD/USD","EUR/GBP","GBP/JPY","EUR/JPY","AUD/JPY","CAD/JPY","CHF/JPY","USD/CAD","EUR/CAD","AUD/CAD","GBP/CAD",
  // Crypto pairs (USD quoted)
  "BTC/USD","ETH/USD","LTC/USD","XRP/USD","BCH/USD","ADA/USD","SOL/USD","DOGE/USD","DOT/USD","LINK/USD","MATIC/USD","AVAX/USD","ATOM/USD","UNI/USD","XLM/USD",
  // Stablecoins / alt USD
  "USDT/USD","USDC/USD","BUSD/USD",
  // Indices
  "US30","NAS100","SPX500","US500","RUS_50","DAX30","FTSE100","NIKKEI225","HANGSENG","SSEC",
  // Commodities & energies
  "GOLD","SILVER","PLATINUM","WTI","BRENT","NGAS",
  // Stocks (tickers generic)
  "AAPL","MSFT","TSLA","AMZN","GOOGL","META","NVDA","BABA","INTC",
  // Emerging & cross pairs
  "TRY/JPY","ZAR/USD","MXN/USD","SGD/USD","HKD/USD","SEK/USD","NOK/USD","PLN/USD",
  // Crypto crosses & exotic
  "ETH/BTC","SOL/USDT","AVAX/BTC","LUNC/USD","SHIB/USD",
  // Misc
  "VIX","COPPER","JPY/CHF","CAD/CHF"
];

const BROKERS = [
  "IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade","OlympTrade","Binary.com","eToro","Plus500","IG","XM",
  "FXTM","Pepperstone","IC Markets","Bybit","Binance","OKX","Kraken","Huobi","Bitstamp","Coinbase Pro","Gate.io",
  "Saxo Bank","Interactive Brokers","Thinkorswim","Tastyworks","Robinhood","TradeStation","OANDA","HotForex","Exness"
];

const TIMEFRAMES = [
  "S5","S10","S30","M1","M2","M3","M5","M10","M15","M30","H1","H2","H4","H8","D1","W1","MN1"
];

const RESULT_WORDS = [
  "green","red","profit","loss","win","missed entry","recovered","scalped nicely","small win","big win",
  "moderate loss","loss recovered","double profit","consistent profit","partial win","micro win",
  "entry late but profitable","stopped loss","hedged correctly","full green streak","partial loss",
  "break-even","tight stop","wide stop","re-entry success","slippage hit","perfect exit",
  "stop hunted","rolled over","swing profit","scalp win","gap fill","retest failed","trend follow",
  "mean reversion hit","liquidity grab","fakeout","nice tp hit","sloppy execution","overnight hold",
  "pips grabbed","overnight fee","funded by profit","safety hedge","adjusted TP","trailing stop hit",
  "limit filled","market order filled","partial fill","no liquidity","retest success","breakout confirmed",
  "false breakout","chop zone","range bound","breakout fail","pump and dump","news spike","earnings play",
  "pump reversed","volatility spike","session flip","session overlap play","liquidity sweep","order block hit",
  "smart money move","buy zone","sell zone","structural resistance","structural support","trend continuation",
  "trend exhaustion","momentum fade","retest success","retest fail"
];

/* =====================================================
   FULL TEMPLATES (FURTHER EXPANDED)
===================================================== */
const TESTIMONIALS = [
  "Made $450 in 2 hours using Abrox",
  "Closed 3 trades, all green today ✅",
  "Recovered a losing trade thanks to Abrox",
  "7 days straight of consistent profit 💹",
  "Abrox saved me from a $200 loss",
  "50% ROI in a single trading session 🚀",
  "Signal timing was perfect today",
  "Scalped 5 trades successfully today 🚀",
  "Missed entry but recovered",
  "Made $120 in micro trades this session",
  "Small wins add up over time, Abrox is legit",
  "Never had such accurate entries before",
  "This bot reduced stress, makes trading predictable 😌",
  "Entry was late but still profitable 💹",
  "Hedged correctly thanks to bot signals",
  "Altcoin signals were on point today",
  "Recovered yesterday’s loss in one trade",
  "Made $300 in under 3 hours",
  "Bot suggested perfect exit on USD/JPY",
  "Day trading made predictable thanks to Abrox",
  "Consistent 5–10% daily growth",
  "Doubled small account this week",
  "Low drawdown strategy works",
  "Finally profitable after months",
  "Swing trades hitting clean targets",
  "Abrox nailed the breakout entry",
  "Risk management improved massively",
  "Caught gold rally early",
  "Crypto volatility handled perfectly",
  "London session was smooth today",
  "NY open signals were sharp",
  "Good for swing entries into trend",
  "Saved my account from margin call",
  "Smart TP scaling preserved profits",
  "Perfect for small accounts",
  "Impressive backtest alignment",
  "Signals correlate with higher timeframe trend",
  "Great community support",
  "Entry precision is on another level",
  "Reduced overtrading",
  "Automated risk rules helped a lot",
  "Tried many bots, this one stands out",
  "Simple UI, powerful signals",
  "Excellent for scalpers and swing traders",
  "Set-and-forget signals worked overnight",
  "Paper trading matched live results",
  "Recovered 2 consecutive losing days",
  "Precision entries on EUR/USD and GBP/USD",
  "Saved me time and improved R:R",
  "Clean signals, easy to follow",
  "Good for diversifying strategies",
  "Short-term scalps consistently profitable",
  "Long trades held into larger moves",
  "Live support helped adjust sizing",
  "Strategy adaptations are solid",
  "Nice correlation filters",
  "Great for multiple account management",
  "Works across both crypto and FX",
  "Minimal configuration, great output",
  "Improved my overall P&L consistency"
];

const ADDITIONAL_TEMPLATES = [
  "Anyone else excited for the next signal?",
  "I’m learning so much from this group!",
  "Can’t wait to apply this strategy today!",
  "Does anyone track multiple signals at once?",
  "What’s your favorite broker for scalping?",
  "I’m curious how others are using these strategies",
  "Shared a screenshot of my setup — feedback welcome",
  "How are you sizing positions today?",
  "Who’s trading the London open?",
  "Any macro news to watch this session?",
  "Does the bot handle spread widening?",
  "How do you manage weekend risk?",
  "What stop size do you prefer on crypto?",
  "Anyone using the automated risk scaler?",
  "Which pairs have been the most consistent?",
  "Post your daily P&L if you're comfortable",
  "Any recommended indicators to pair with signals?",
  "Does anyone hedge across correlated pairs?",
  "How often do you adjust TPs manually?",
  "Do you use limit entries or market only?",
  "How do you journal these trades?",
  "What position sizing rules do you follow?",
  "Who runs a demo first before live?",
  "Tips for dealing with slippage?",
  "Shared template for risk management?",
  "Any restrictions on broker execution?",
  "How do you set alerts for signal times?",
  "Best practices for multiple-account execution?",
  "Do you combine this with discretionary checks?",
  "Which sessions work best for your style?",
  "Any beta features you recommend testing?",
  "Has anyone backtested for 1 year?",
  "What timeframe confirms the entry for you?",
  "Do you scalp or swing more with Abrox?",
  "Anyone use copy-trade setups with this?",
  "How do you handle news around entries?"
];

const ADMIN_TEMPLATES = [
  "Please contact admin for verification ✅",
  "Follow the group rules before posting",
  "Welcome! Make sure to read the pinned messages",
  "Admins will approve your access shortly",
  "Check announcements for updates 🔔",
  "Report suspicious links to admin",
  "Do not share private keys or account screenshots",
  "Check the signal timestamp before placing orders",
  "Use proper risk per trade — consult pinned rules",
  "No unsolicited promo or referral links",
  "Admin reserves the right to remove spam",
  "Contact admin for subscription issues",
  "Guides are pinned — read before asking basic Qs",
  "Use the template when reporting a bug",
  "Follow the naming convention for uploads",
  "Tag admin only for urgent matters",
  "Respect other members and their strategies",
  "Repost only if approved by admin",
  "Keep sensitive account info private",
  "Report impersonation to admin immediately",
  "Subscription cancellations go via admin panel",
  "Allow up to 24 hours for verification",
  "Check FAQs before raising tickets",
  "Admin posts official signals — trust those only",
  "Do not post personal contact information",
  "Use direct message for account-specific help",
  "Admins will not ask for passwords",
  "Follow dispute resolution procedure",
  "All official downloads are virus-scanned",
  "Any wallet address requests must be approved"
];

const NEW_MEMBER_QUESTIONS = [
  "How do I join the next signal?",
  "Where can I find the trading guides?",
  "Can someone explain this strategy?",
  "How do I verify my account?",
  "Which broker gives the best spreads?",
  "Are these signals automated or manual?",
  "Do you provide risk sizing recommendations?",
  "Is there a trial period for the bot?",
  "Can I run this on demo first?",
  "What leverage is recommended?",
  "Is VPS required for full automation?",
  "How often are signals published?",
  "Do you provide time-of-day filters?",
  "Can I run multiple pairs simultaneously?",
  "Is there a mobile-friendly dashboard?",
  "How to read the signal format?",
  "What timeframe is preferred for signals?",
  "Do you support copy-trade integrations?",
  "Is there a refund policy?",
  "Where are the changelogs posted?",
  "How do I update the bot?",
  "Does the bot work on MT4/MT5?",
  "Are there account size minimums?",
  "How to report performance discrepancies?",
  "Can I request a backtest on a pair?",
  "Are custom alerts available?",
  "Does it handle news events automatically?",
  "How do you recommend starting small?",
  "Is there a community strategy board?",
  "How do I set risk per trade?"
];

const OLD_MEMBER_REPLIES = [
  "You can check the pinned messages for that",
  "I’ve been using this strategy for months — it works",
  "Admin will approve you soon, don’t worry",
  "Try this broker, it’s reliable",
  "Start with small lot sizes and scale",
  "Backtest the pair on H4 first",
  "We post follow-ups after big events",
  "I prefer limit entries into structure",
  "Keep an eye on spread at session open",
  "I take half off at the first TP",
  "Use trailing stops for longer holds",
  "Avoid trading during major news",
  "Hedge correlated positions if unsure",
  "Use fixed risk % per trade",
  "Paper trade for a week before going live",
  "Check the community thread for examples",
  "We use SL tight on intraday trades",
  "Scale into positions during pullbacks",
  "Do not chase retracements",
  "If in doubt, skip the trade",
  "Use the session filter from settings",
  "I log all trades in a spreadsheet",
  "We have a weekly review channel",
  "Look for confluence on higher TF",
  "Use size caps if equity is small",
  "I prefer the NY open for volatile moves",
  "Avoid holding over major announcements",
  "We often wait for retest confirmation",
  "Trust the process, not every signal",
  "Rotate pairs based on volatility"
];

const REPLY_TEMPLATES = [
  "Yes, I agree!","Exactly 💯","Nice point 👍","I’ve been thinking the same.",
  "Can you elaborate?","Interesting 🤔","😂 That’s funny!","Absolutely 🚀",
  "Good catch!","Thanks for sharing 💡","Welcome aboard! 👋","Agree with the risk plan",
  "Screenshot please","Which TF are you using?","Trade size?","Love the clarity on that",
  "Solid reasoning","Can you post the chart?","What’s your stop loss level?","Any supporting indicators?",
  "That was a clean setup","How long did you hold?","Was it manual or auto-executed?",
  "Nice scalp","What broker did you use?","What spread did you get?","TP/SL levels please",
  "Nice recovery","Careful with overnight exposure","Follow the pinned risk doc",
  "Does this handle gap open?","Good discipline","I use similar sizing rules",
  "Agree with your take","Interesting tweak — try it on demo","Good journal entry"
];

/* =====================================================
   PERSONAS (EXPANDED)
===================================================== */
const PERSONAS = [
  {name:"Alex",tone:"excited",memory:[],style:"casual"},
  {name:"Jordan",tone:"analytical",memory:[],style:"professional"},
  {name:"Sam",tone:"sarcastic",memory:[],style:"funny"},
  {name:"Taylor",tone:"calm",memory:[],style:"supportive"},
  {name:"Riley",tone:"optimistic",memory:[],style:"cheerful"},
  {name:"Casey",tone:"direct",memory:[],style:"concise"},
  {name:"Morgan",tone:"methodical",memory:[],style:"technical"},
  {name:"Drew",tone:"practical",memory:[],style:"no-nonsense"},
  {name:"Parker",tone:"curious",memory:[],style:"inquiring"},
  {name:"Quinn",tone:"laidback",memory:[],style:"relaxed"},
  {name:"Harper",tone:"helpful",memory:[],style:"mentor"},
  {name:"Jordan2",tone:"data-driven",memory:[],style:"rigorous"}
];

function getRandomPersona(){ return PERSONAS[Math.floor(Math.random()*PERSONAS.length)]; }

/* =====================================================
   🔥 PATCH: CONTEXT + TOPICS (EXPANDED)
===================================================== */
const TOPICS = [
  "gold breakout","BTC pump","London session","NY open","risk management",
  "economic calendar","earnings play","crypto altseason","mean reversion","momentum fade",
  "gap strategy","trend continuation","liquidity sweep","session overlap","order block",
  "session bias","position scaling","overnight risk"
];
let currentTopic = TOPICS[Math.floor(Math.random()*TOPICS.length)];

function contextReply(parent){
  if(!parent) return REPLY_TEMPLATES[Math.floor(Math.random()*REPLY_TEMPLATES.length)];
  const p = parent.toLowerCase();
  if(p.includes("loss")||p.includes("stopped")||p.includes("stop")) return "Risk management matters here";
  if(p.includes("profit")||p.includes("green")||p.includes("tp")) return "Nice, what lot size?";
  if(p.includes("broker")) return "Spreads are key honestly";
  if(p.includes("strategy")) return "Works best on M5 timeframe";
  if(p.includes("gold")||p.includes("gld")) return "Watch correlation with USD strength";
  if(p.includes("crypto")||p.includes("btc")) return "Check for exchange liquidity and fees";
  return REPLY_TEMPLATES[Math.floor(Math.random()*REPLY_TEMPLATES.length)];
}

function injectTopic(text){
  if(Math.random()<0.35) return text+` (${currentTopic})`;
  return text;
}

function maybeTag(persona){
  if(Math.random()<0.2){
    const other = PERSONAS[Math.floor(Math.random()*PERSONAS.length)];
    if(other.name !== persona.name) return "@"+other.name+" ";
  }
  return "";
}

function avoidRepeat(persona,text){
  let tries=0;
  while(persona.memory.includes(text) && tries<12){
    text += " " + ["lol","fr","ngl","💪","✅"][Math.floor(Math.random()*5)];
    tries++;
  }
  persona.memory.push(text);
  return text;
}

function generateTradeMessage(){
  return `${ASSETS[Math.floor(Math.random()*ASSETS.length)]} ${TIMEFRAMES[Math.floor(Math.random()*TIMEFRAMES.length)]} — ${RESULT_WORDS[Math.floor(Math.random()*RESULT_WORDS.length)]} 💹`;
}

/* =====================================================
   🔥 PATCH: ACTIVITY MODE (UNCHANGED LOGIC)
===================================================== */
let activityMode = "normal";

function switchActivityMode(){
  const r = Math.random();
  if(r < 0.2) activityMode = "burst";
  else if(r < 0.4) activityMode = "slow";
  else activityMode = "normal";

  setTimeout(switchActivityMode, 15000 + Math.random()*20000);
}
switchActivityMode();

function randomDelay(min=1000,max=7000){
  if(activityMode==="burst") return 500 + Math.random()*1500;
  if(activityMode==="slow") return 5000 + Math.random()*10000;
  return min + Math.random()*(max-min);
}

function humanTypingDelay(text,persona){
  let base=400, perChar=25;
  if(persona.tone==="analytical") perChar=30;
  if(persona.tone==="excited") perChar=18;
  if(persona.tone==="sarcastic") perChar=22;
  if(persona.tone==="calm") perChar=20;
  if(persona.tone==="optimistic") perChar=19;
  if(persona.tone==="methodical") perChar=28;
  if(persona.tone==="data-driven") perChar=32;
  return Math.min(base+perChar*text.length,7000);
}

/* =====================================================
   COMMENT GENERATOR (PATCHED)
===================================================== */
const GENERATED = new Set();
const POOL = [];
window.realismEngineFullPool = POOL;
window.realismEngineV12Pool = POOL;

function mark(text){
 const fp=text.toLowerCase();
 if(GENERATED.has(fp)) return false;
 GENERATED.add(fp);
 return true;
}

function generateComment(persona,lastTimestamp=new Date()){

  let templates = [
    ()=>TESTIMONIALS[Math.floor(Math.random()*TESTIMONIALS.length)],
    ()=>ADDITIONAL_TEMPLATES[Math.floor(Math.random()*ADDITIONAL_TEMPLATES.length)],
    ()=>`Anyone trading ${ASSETS[Math.floor(Math.random()*ASSETS.length)]} on ${BROKERS[Math.floor(Math.random()*BROKERS.length)]}?`,
    ()=>OLD_MEMBER_REPLIES[Math.floor(Math.random()*OLD_MEMBER_REPLIES.length)],
    ()=>NEW_MEMBER_QUESTIONS[Math.floor(Math.random()*NEW_MEMBER_QUESTIONS.length)],
    ()=>ADMIN_TEMPLATES[Math.floor(Math.random()*ADMIN_TEMPLATES.length)]
  ];

  let text;

  if(Math.random()<0.28){
    text = generateTradeMessage();
  } else {
    text = templates[Math.floor(Math.random()*templates.length)]();
  }

  text = maybeTag(persona) + text;
  text = injectTopic(text);
  text = avoidRepeat(persona, text);

  let tries=0;
  while(!mark(text)&&tries<40){
    text+=" "+Math.floor(Math.random()*9999);
    tries++;
  }

  return { text, timestamp: new Date(), persona };
}

/* =====================================================
   (REST OF YOUR ORIGINAL CODE UNCHANGED)
===================================================== */

// 👉 EVERYTHING BELOW IS EXACTLY YOUR ORIGINAL LOGIC

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

    if(window.TGRenderer?.appendMessage){
      const typing=humanTypingDelay(text,persona);

      if(window.TGRenderer?.showTyping){
        window.TGRenderer.showTyping(persona.name);
      }

      await new Promise(r=>setTimeout(r,typing));

      if(window.TGRenderer?.hideTyping){
        window.TGRenderer.hideTyping(persona.name);
      }

      const id=window.TGRenderer.appendMessage(persona,text,opts);
      inter.id=id;
    }
  }
  processingQueue=false;
}

function simulateMultiTurnReply(joinerPersona,parentComment,depth=0){
 if(depth>3) return;

 let replyText = contextReply(parentComment.text);
 replyText = avoidRepeat(joinerPersona, replyText);

 const delay=randomDelay(2000,12000);

 setTimeout(()=>{
  enqueueInteraction({ persona:joinerPersona, text:replyText, parentText:parentComment.text, parentId:parentComment.id||null });

  if(Math.random()<0.3){
    const followUp=getRandomPersona();
    simulateMultiTurnReply(followUp,{ text:replyText, id:parentComment.id },depth+1);
  }
 },delay);
}

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
      let nextMsg=generateComment(persona,lastTimestamp);
      enqueueInteraction(nextMsg);
    }
  }

  if(Math.random()<0.15){
    const joiner=getRandomPersona();
    simulateMultiTurnReply(joiner,randomComment);
  }

  setTimeout(()=>autoSimulate(new Date()),randomDelay());
}

setTimeout(()=>autoSimulate(),1200);

console.log("🚀 FULL ENGINE v8 PATCH (EXPANDED TEMPLATES) ACTIVE");

})();
