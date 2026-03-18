// ultimate-realism-full-v9.2.js — Full Human-Like Multi-Turn Realism Engine (FINAL)

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
TEMPLATES
===================================================== */
const TESTIMONIALS = ["Made $450 in 2 hours using Abrox","Closed 3 trades, all green today ✅","Recovered a losing trade thanks to Abrox","7 days straight of consistent profit 💹","Abrox saved me from a $200 loss","50% ROI in a single trading session 🚀","Signal timing was perfect today","Scalped 5 trades successfully today 🚀","Missed entry but recovered","Made $120 in micro trades this session","Small wins add up over time, Abrox is legit","Never had such accurate entries before","This bot reduced stress, makes trading predictable 😌","Entry was late but still profitable 💹","Hedged correctly thanks to bot signals","Altcoin signals were on point today","Recovered yesterday’s loss in one trade","Made $300 in under 3 hours","Bot suggested perfect exit on USD/JPY","Day trading made predictable thanks to Abrox","Consistent 5–10% daily growth","Doubled small account this week","Low drawdown strategy works","Finally profitable after months","Swing trades hitting clean targets","Abrox nailed the breakout entry","Risk management improved massively","Caught gold rally early","Crypto volatility handled perfectly","London session was smooth today","NY open signals were sharp","Good for swing entries into trend","Made steady gains all week, no stress trading","Compounding slowly but it’s working","Took 2 losses but recovered everything later","Risk management really paying off now","Confidence is way higher trading with this setup","Even choppy markets are manageable now","Just hit my daily target, done for today ✅","Account growth finally consistent","Stopped overtrading and results improved instantly","Execution getting cleaner every day","Patience really made the difference this time","Missed one trade but caught the next move perfectly","Finally understanding market structure better","Entries are cleaner, exits even better now","Scaling up slowly, results still consistent","Low risk trades but still profitable","Consistency > big wins, this proves it","Trading feels way less emotional now","Small account growing steadily 📈","Keeping losses small made a huge difference"];

const ADDITIONAL_TEMPLATES = ["Anyone else excited for the next signal?","I’m learning so much from this group!","Can’t wait to apply this strategy today!","Does anyone track multiple signals at once?","What’s your favorite broker for scalping?","I’m curious how others are using these strategies","Who else is waiting for NY session?","Do you guys prefer scalping or swing trades?","Anyone trading gold today?","How many trades do you usually take per day?","Do you stick to one asset or multiple?","What risk % are you guys using?","Anyone here trading full time?","Do you guys follow news or just technicals?","Is anyone using higher timeframes here?","How do you handle losing streaks?","What’s your win rate looking like lately?","Do you guys journal your trades?","Anyone focusing on crypto today?","What’s your best performing pair recently?","Do you guys trade London session mostly?","Anyone else avoiding overtrading today?","How do you guys confirm entries?","Do you combine indicators or pure price action?"];

const ADMIN_TEMPLATES = ["Please contact admin for verification ✅","Follow the group rules before posting","Welcome! Make sure to read the pinned messages","Admins will approve your access shortly","Check announcements for updates 🔔","Verification is required before accessing signals","Please avoid spamming the chat","Only verified members can access full features","Check the pinned guide before asking questions","Admins are reviewing new members now","Stay respectful in the group","Signal updates will be posted shortly","Make sure notifications are turned on 🔔","Important update in pinned message","Please follow instructions carefully"];

const NEW_MEMBER_QUESTIONS = ["How do I join the next signal?","Where can I find the trading guides?","Can someone explain this strategy?","How do I verify my account?","Is this beginner friendly?","How much capital do I need to start?","Do I need prior trading experience?","Where do I see the signals?","How often are signals sent?","Is there a risk management guide?","Can someone explain how entries work?","Do I need to use a specific broker?","Are signals manual or automated?","Is there a demo option to test first?","How do I avoid losses?","What timeframe should I focus on?","Is this suitable for small accounts?","How long does verification take?","Can I trade part-time with this?"];

const OLD_MEMBER_REPLIES = ["You can check the pinned messages for that","I’ve been using this strategy for months — it works","Admin will approve you soon, don’t worry","Try this broker, it’s reliable","Start with small risk until you understand it","Consistency is key, don’t rush it","I was confused at first too, you’ll get it","Just follow the rules and you’ll be fine","Took me a week to fully understand everything","Stick to one strategy, don’t overcomplicate","It works if you stay disciplined","I’ve tested multiple brokers, this one is solid","Focus on risk management first","Don’t chase trades, wait for confirmation","Keep emotions out of it, that’s the trick","Patience matters more than anything here"];

const REPLY_TEMPLATES = ["Yes, I agree!","Exactly 💯","Nice point 👍","I’ve been thinking the same.","Can you elaborate?","Interesting 🤔","😂 That’s funny!","Absolutely 🚀","Good catch!","Thanks for sharing 💡","Welcome aboard! 👋","That actually makes sense","I noticed that too","Same experience here","Couldn’t agree more","That’s a solid point","Never thought about it that way","That’s interesting honestly","I’ll try that next time","Good insight 👍","Appreciate that","That helped a lot","Makes things clearer now","That’s useful info","Fair enough","True, very true","I see what you mean","That’s valid","Exactly what I was thinking","Nice explanation"];

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
UTILS
===================================================== */
function randomDelay(min=1000,max=7000){
return min + Math.random() * (max - min);
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

function applyPersonaStyle(text, persona){
switch(persona.style){
case "casual": return text.toLowerCase();
case "professional": return text.replace("Guys,", "Hello everyone,");
case "funny": return text + " 😂";
case "supportive": return "No worries — " + text;
case "cheerful": return "✨ " + text;
default: return text;
}
}

/* =====================================================
REALISM ENGINE v9.2 CORE
===================================================== */

const GENERATED = new Set();

function mark(text){
const fp=text.toLowerCase();
if(GENERATED.has(fp)) return false;
GENERATED.add(fp);
return true;
}

function generateTimestamp(last=new Date()){
return new Date(last.getTime()+5000+Math.random()*20000);
}

function smartPick(arr, mem=[]){
let f=arr.filter(x=>!mem.includes(x));
if(!f.length) f=arr;
let p=f[Math.floor(Math.random()*f.length)];
mem.push(p);
if(mem.length>40) mem.shift();
return p;
}

function humanize(t){
if(Math.random()>0.3) return t;
let w=t.split(" ");
let i=Math.floor(Math.random()*w.length);
if(w[i] && w[i].length>4){
w[i]=w[i].slice(0,-1)+w[i].slice(-1).toUpperCase();
}
return w.join(" ");
}

function emotion(p,t){
if(/loss|hit/.test(t)) return t+" 😤";
if(/profit|win|green/.test(t)) return t+" 😄";
return t;
}

function fused(persona){
let p=[];
if(Math.random()<0.7) p.push(smartPick(TESTIMONIALS,persona.memory));
if(Math.random()<0.5) p.push(smartPick(ADDITIONAL_TEMPLATES,persona.memory));
if(Math.random()<0.5) p.push(smartPick(OLD_MEMBER_REPLIES,persona.memory));
if(Math.random()<0.4) p.push(`Result was ${smartPick(RESULT_WORDS)} on ${smartPick(ASSETS)}`);
if(!p.length) p.push(smartPick(ADDITIONAL_TEMPLATES));
return p.join(" — ");
}

function generateComment(persona,last){
let text=fused(persona);

if(persona.tone==="sarcastic") text="😂 "+text;
if(persona.tone==="analytical") text+=" 📊";
if(persona.tone==="excited") text+=" 🚀";

text=applyPersonaStyle(text,persona);
text=humanize(text);
text=emotion(persona,text);

let tries=0;
while(!mark(text)&&tries<10){
text+=" "+Math.floor(Math.random()*999);
tries++;
}

return {text,timestamp:generateTimestamp(last),persona};
}

/* =====================================================
QUEUE + LOOP (UNCHANGED LOGIC)
===================================================== */
const queue=[];
let busy=false;

function enqueue(i){
queue.push(i);
process();
}

async function process(){
if(busy||!queue.length) return;
busy=true;

while(queue.length){
let m=queue.shift();
let t=humanTypingDelay(m.text,m.persona);
await new Promise(r=>setTimeout(r,t));

if(window.TGRenderer?.appendMessage){
window.TGRenderer.appendMessage(m.persona,m.text,{});
}
}
busy=false;
}

function simulate(){
let p=getRandomPersona();
let c=generateComment(p,new Date());

enqueue(c);

setTimeout(simulate, randomDelay(1500,5000));
}

setTimeout(simulate,1000);

console.log("🚀 v9.2 FULL ENGINE LOADED");

})();
