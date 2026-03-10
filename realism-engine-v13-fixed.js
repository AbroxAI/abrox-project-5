// realism-engine-v25-fixed.js — Full realism + historical backfill + joiners + reactions + threaded replies + fixes
(function(){
"use strict";

/* =====================================================
MASSIVE DATA POOLS
===================================================== */
const ASSETS=[
"EUR/USD","USD/JPY","GBP/USD","AUD/USD","USD/CHF","USD/CAD","NZD/USD",
"EUR/JPY","EUR/GBP","EUR/AUD","EUR/CHF","GBP/JPY","GBP/AUD","GBP/CHF",
"AUD/JPY","CAD/JPY","CHF/JPY","AUD/NZD","BTC/USD","ETH/USD","SOL/USD",
"ADA/USD","DOT/USD","MATIC/USD","LINK/USD","AVAX/USD","DOGE/USD","XRP/USD",
"LTC/USD","BNB/USD","SHIB/USD","LUNA/USD","ATOM/USD","FIL/USD","TRX/USD",
"US30","NAS100","SPX500","US500","DAX40","FTSE100","CAC40","NIKKEI225",
"RUSSELL2000","HSI50","GOLD","SILVER","PLATINUM","PALLADIUM","WTI","BRENT",
"NATGAS","COPPER","ALUMINUM","SUGAR","COFFEE","SOYBEAN","CORN","OIL","RICE"
];

const BROKERS=[
"IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade","Binary.com",
"Quotex","ExpertOption","eToro","Plus500","IG","XM","FXTM","Pepperstone",
"IC Markets","Exness","Oanda","FXPro","Bybit","Binance","Kraken","OKX",
"KuCoin","Gate.io","Huobi","Bitfinex","Coinbase","Poloniex"
];

const TIMEFRAMES=["M1","M3","M5","M10","M15","M30","H1","H2","H4","H6","D1","W1"];

const RESULT_WORDS=[
"green","red","profit","loss","win","missed entry","recovered","scalped nicely",
"small win","big win","moderate loss","loss recovered","double profit",
"consistent profit","partial win","micro win","entry late but profitable",
"stopped loss","hedged correctly","perfect breakout","strong rejection",
"clean entry","overextended","false breakout","retraced","partial loss","good trend","bad trend"
];

const TESTIMONIALS=[
"Made $450 in 2 hours using Abrox","Closed 3 trades all green today",
"Recovered a losing trade thanks to Abrox","7 days straight of consistent profit",
"Signal timing was perfect today","Scalped 5 trades successfully today",
"Account finally growing consistently","First time hitting $1k profit",
"Strategy working perfectly this week","Another winning day with Abrox signals",
"Doubled my account this month","Entries are incredibly accurate lately",
"Profits stacking nicely","Consistent gains daily","Finally mastering signals",
"Best trading week ever","Risk managed trades successful","Following signals paid off",
"Never losing with Abrox","Signals are precise","Trades executed flawlessly"
];

const EMOJIS=[
"💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑",
"🎯","🏆","🤖","🎉","🍀","📊","⚡","💎","📉","🛠️","🔔","🎵","💹","📊"
];

const REACTIONS=["👍","❤️","😂","😮","😢","👏","🔥","💯","😎","🎉"];

/* =====================================================
JOINER WELCOMES & REPLIES
===================================================== */
const JOINER_WELCOMES=[
"Welcome {user}! 🎉 Glad to have you here!",
"Hey {user}, welcome to the chat! 👋",
"{user} joined! Make yourself at home ✨",
"Everyone say hi to {user}! 😎",
"{user} is here! Time for some action 💸",
"Cheers {user}, welcome aboard 🚀",
"Glad you joined, {user}! Let’s make some profits 💰",
"Hey {user}, feel free to ask questions 📝",
"{user} hopped in! Enjoy your stay 💎",
"Welcome {user}! Hope you enjoy the signals 🔥",
"{user} joined! Let's crush some trades together 📈",
"Say hello to {user}! 💯","{user} arrived! Time for green trades 💹",
"Welcome {user}, let's have a winning day 💎","Hey {user}, signals are ready! 🚀"
];

const JOINER_REPLIES=[
"Welcome aboard! 👍","Hey, great to see you here! 🎉","Let’s get some profits! 💰",
"Enjoy the signals! 🚀","You’ll love it here 😎","Make yourself at home ✨",
"Hi {user}, feel free to ask questions 📝","Glad you joined! 💎","Cheers! 🔥",
"Hello {user}, enjoy trading 💹","Hey {user}, stay green today! 💚",
"Welcome {user}! Watch the breakouts 💸","Hi {user}, signals are hot! 🔥",
"{user} is in! Let’s make it a winning week 💯"
];

/* =====================================================
AUTHORITY ROLES
===================================================== */
const ROLES={
ADMIN:["New signal dropping soon","Hold entries until confirmation","Market volatility is high today","Signal confirmed — manage risk","VIP signal posted above","Attention: news impact incoming","Adjust stop loss for current trades"],
SIGNAL:["Signal: {asset} {tf} — CALL","Signal: {asset} {tf} — PUT","Watching {asset} breakout","Entry forming on {asset} {tf}","Possible reversal on {asset}","Target hit on {asset} {tf}","Missed entry on {asset} {tf}"],
PRO:["Took that trade — looks good","Confirmed on my chart","Entry was clean","Nice signal","That move was strong","Managed risk perfectly","Closed with profit"],
BEGINNER:["Is it safe to enter now?","New here how do I follow signals?","Anyone trading this?","Still learning this strategy","Can someone explain the entry?","Missed the entry, help!","How do I calculate risk?"],
HYPE:["🔥🔥🔥","Nice profit today","Another win","Abrox never disappoints","Green again today 💰","Profit stacking 💎","Excellent week 🚀","Feeling lucky today"]
};

/* =====================================================
UTILS
===================================================== */
function random(arr){return arr[Math.floor(Math.random()*arr.length)];}
function maybe(p){return Math.random()<p;}
function rand(min,max){return Math.floor(Math.random()*(max-min)+min);}
function hash(str){let h=5381; for(let i=0;i<str.length;i++){h=((h<<5)+h)+str.charCodeAt(i);} return (h>>>0).toString(36);}

/* =====================================================
MEMORY & POOL
===================================================== */
const GENERATED=new Set();
const QUEUE=[];
const POOL=[];
window.realism=window.realism||{};
window.realism.POOL=POOL;

/* =====================================================
MARK / DUPLICATE CHECK
===================================================== */
function mark(text){
const fp=hash(text.toLowerCase());
if(GENERATED.has(fp)) return false;
GENERATED.add(fp);
QUEUE.push(fp);
while(QUEUE.length>150000) GENERATED.delete(QUEUE.shift());
return true;
}

/* =====================================================
HISTORICAL POOL INJECTION
===================================================== */
function injectHistoricalPool(oldPool){
if(!Array.isArray(oldPool)) return;
for(const item of oldPool){
if(item.text && mark(item.text)){
POOL.push(item);
}
}
}

/* =====================================================
COMMENT GENERATOR
===================================================== */
const BASE_DATE = new Date(2025,7,14,10,0,0);
function generateTimestamp(daysBack=120){
const offset = Math.random()*daysBack*86400000;
return new Date(BASE_DATE.getTime() - offset);
}

function generateComment(){
const templates=[
()=>`Guys, ${random(TESTIMONIALS)}`,
()=>`Anyone trading ${random(ASSETS)} on ${random(BROKERS)}?`,
()=>`Signal for ${random(ASSETS)} ${random(TIMEFRAMES)} is ${random(RESULT_WORDS)}`,
()=>`Closed ${random(ASSETS)} on ${random(TIMEFRAMES)} — ${random(RESULT_WORDS)}`,
()=>`Scalped ${random(ASSETS)} on ${random(BROKERS)}, result ${random(RESULT_WORDS)}`
];
let text=random(templates)();
if(maybe(0.35)) text+=" — "+random(["good execution","tight stop","wide stop","no slippage","perfect timing"]);
if(maybe(0.60)) text+=" "+random(EMOJIS);
let tries=0; while(!mark(text)&&tries<60){ text+=" "+rand(999); tries++; }
return { text, timestamp: generateTimestamp() };
}

/* =====================================================
JOINER + REPLIES + INLINE REACTIONS
===================================================== */
function generateJoiner(){
const persona={ name:"User"+rand(1000,9999) };
const welcomeText=random(JOINER_WELCOMES).replace("{user}",persona.name);
return { persona, text: welcomeText, timestamp:new Date(BASE_DATE), type:"joiner" };
}

/* =====================================================
SIMULATE JOINER WITH FIXES
===================================================== */
async function simulateJoiner(minInterval=45000,maxInterval=120000){
while(true){
if(maybe(0.4)) { // low chance to not spam joiners
const joinItem=generateJoiner();
await postJoinSticker(joinItem);
await generateThreadedJoinerReplies(joinItem);
await simulateReactions(joinItem,rand(1,2));
}
await new Promise(r=>setTimeout(r,rand(minInterval,maxInterval)));
}
}

/* =====================================================
THREAD REPLIES
===================================================== */
async function generateThreadedJoinerReplies(joinItem){
const replyCount=rand(2,5);
for(let i=0;i<replyCount;i++){
const persona=window.identity.getRandomPersona();
const replyText=random(JOINER_REPLIES).replace("{user}",joinItem.persona.name);
// realistic typing per char
await window.queuedTyping(persona,replyText, {speed:rand(30,75)});
const msgId=`realism_reply_${Date.now()}_${rand(9999)}`;
window.TGRenderer.appendMessage(persona,replyText,{
timestamp:new Date(), // current date for live replies
type:"incoming",
id:msgId,
parentId: joinItem.id
});
if(maybe(0.2)) await simulateInlineReactions(msgId, rand(1,2));
await new Promise(r=>setTimeout(r,rand(400,1200)));
}
}

/* =====================================================
REACTIONS
===================================================== */
async function simulateInlineReactions(messageId,count=1){
for(let i=0;i<count;i++){
const reaction=random(REACTIONS);
window.TGRenderer?.appendReaction?.(messageId, reaction);
await new Promise(r=>setTimeout(r,rand(150,800)));
}
}

async function simulateReactions(message,count=1){
for(let i=0;i<count;i++){
const reaction=random(REACTIONS);
window.TGRenderer?.appendReaction?.(message.id || `realism_${Date.now()}_${rand(9999)}`, reaction);
await new Promise(r=>setTimeout(r,rand(200,1000)));
}
}

/* =====================================================
POST MESSAGE WITH FIXES
===================================================== */
async function postMessage(item){
if(!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage) return;
const persona=item.persona||window.identity.getRandomPersona();
if(!persona) return;
let text=item.type==="joiner"?item.text:(Math.random()<0.15 ? generateRoleMessage(persona) : item.text);
await window.queuedTyping(persona,text,{speed:rand(25,70)});
const msgId=`realism_${item.type||"msg"}_${Date.now()}_${rand(9999)}`;
window.TGRenderer.appendMessage(persona,text,{
timestamp:item.timestamp||new Date(),
type:item.type||"incoming",
id:msgId
});
item.id = msgId;
if(maybe(0.2)) await simulateReactions({id: msgId}, rand(1,2));
}

/* =====================================================
JOIN STICKER FIX
===================================================== */
async function postJoinSticker(joinItem){
window.TGRenderer.appendJoinSticker([joinItem.persona]);
joinItem.id=`join_${Date.now()}_${rand(9999)}`;
}

/* =====================================================
CROWD SIMULATION
===================================================== */
async function simulateCrowd(count=120,minDelay=150,maxDelay=600){
ensurePool(count);
for(let i=0;i<count;i++){
const item=POOL.shift();
if(!item) break;
await postMessage(item);
await new Promise(r=>setTimeout(r,minDelay+Math.random()*(maxDelay-minDelay)));
}
}

/* =====================================================
POOL MANAGEMENT
===================================================== */
function ensurePool(min=10000){
while(POOL.length<min){
POOL.push(generateComment());
if(POOL.length>50000) break;
}
}

/* =====================================================
INIT & AUTO SCHEDULER
===================================================== */
let started=false;
function simulate(){
if(started) return;
started=true;
simulateCrowd(120,150,600);
schedule();
}
function schedule(){
const min=8000, max=45000;
setTimeout(async()=>{
await simulateCrowd(1);
schedule();
}, min+Math.random()*(max-min));
}

async function init(){
await waitForReady();
if(window.realism?.OLD_POOL) injectHistoricalPool(window.realism.OLD_POOL);
ensurePool(10000);
simulateJoiner(45000,120000);
simulate();
}

async function waitForReady(timeout=30000){
let waited=0;
while((!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage || !window.queuedTyping) && waited<timeout){
await new Promise(r=>setTimeout(r,50));
waited+=50;
}
return true;
}

/* =====================================================
PUBLIC API
===================================================== */
window.realism.simulateCrowd=simulateCrowd;
window.realism.postMessage=postMessage;
window.realism.simulate=simulate;
window.realism.simulateJoiner=simulateJoiner;
window.realism.simulateReactions=simulateReactions;
window.realism.generateThreadedJoinerReplies=generateThreadedJoinerReplies;
window.realism.simulateInlineReactions=simulateInlineReactions;
window.realism.injectHistoricalPool=injectHistoricalPool;
window.realism.postJoinSticker=postJoinSticker;

init();
})();
