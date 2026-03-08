// realism-engine-full-v18.js — Fully synced + ultra realism + dayflow + persona typing + historical backfill
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

/* =====================================================
   AUTHORITY ROLES
===================================================== */
const ROLES={
ADMIN:[
"New signal dropping soon","Hold entries until confirmation","Market volatility is high today",
"Signal confirmed — manage risk","VIP signal posted above","Attention: news impact incoming",
"Adjust stop loss for current trades"
],
SIGNAL:[
"Signal: {asset} {tf} — CALL","Signal: {asset} {tf} — PUT",
"Watching {asset} breakout","Entry forming on {asset} {tf}",
"Possible reversal on {asset}","Target hit on {asset} {tf}","Missed entry on {asset} {tf}"
],
PRO:[
"Took that trade — looks good","Confirmed on my chart","Entry was clean",
"Nice signal","That move was strong","Managed risk perfectly","Closed with profit"
],
BEGINNER:[
"Is it safe to enter now?","New here how do I follow signals?","Anyone trading this?",
"Still learning this strategy","Can someone explain the entry?","Missed the entry, help!",
"How do I calculate risk?"
],
HYPE:[
"🔥🔥🔥","Nice profit today","Another win","Abrox never disappoints",
"Green again today 💰","Profit stacking 💎","Excellent week 🚀","Feeling lucky today"
]
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

function mark(text){
    const fp=hash(text.toLowerCase());
    if(GENERATED.has(fp)) return false;
    GENERATED.add(fp);
    QUEUE.push(fp);
    while(QUEUE.length>150000) GENERATED.delete(QUEUE.shift());
    return true;
}

/* =====================================================
   ROLE SYSTEM
===================================================== */
const PERSONA_ROLES=new Map();
function assignRole(persona){
    if(PERSONA_ROLES.has(persona.name)) return PERSONA_ROLES.get(persona.name);
    const r=Math.random();
    let role;
    if(r<0.03) role="ADMIN";
    else if(r<0.10) role="SIGNAL";
    else if(r<0.35) role="PRO";
    else if(r<0.65) role="BEGINNER";
    else role="HYPE";
    PERSONA_ROLES.set(persona.name,role);
    return role;
}
function generateRoleMessage(persona){
    const role=assignRole(persona);
    let template=random(ROLES[role]);
    template=template.replace("{asset}",random(ASSETS)).replace("{tf}",random(TIMEFRAMES));
    return template;
}

/* =====================================================
   TIMESTAMP
===================================================== */
function generateTimestamp(daysBack=120){return new Date(Date.now()-Math.random()*daysBack*86400000);}

/* =====================================================
   COMMENT GENERATOR
===================================================== */
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
   DAYFLOW & HISTORICAL SIMULATION
===================================================== */
function splitDayPeriods(messages){
    const periods={morning:[],afternoon:[],evening:[]};
    messages.forEach(msg=>{
        const hour=new Date(msg.timestamp).getHours();
        if(hour<12) periods.morning.push(msg);
        else if(hour<18) periods.afternoon.push(msg);
        else periods.evening.push(msg);
    });
    return periods;
}
function pickPeriodMessages(periodMsgs){
    const maxCount=periodMsgs.length>15? rand(40,Math.min(100,periodMsgs.length)) : rand(1,Math.min(5,periodMsgs.length));
    return periodMsgs.slice(0,maxCount);
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
   WAIT SYSTEM
===================================================== */
async function waitForReady(timeout=30000){
    let waited=0;
    while((!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage || !window.queuedTyping) && waited<timeout){
        await new Promise(r=>setTimeout(r,50));
        waited+=50;
    }
    return true;
}

/* =====================================================
   TYPING + PERSONA VARIATION
===================================================== */
async function performTyping(persona,message){
    if(!persona?.name) return;
    if(!persona.typingSpeed) persona.typingSpeed=rand(80,250);
    await window.queuedTyping(persona,message);
}

/* =====================================================
   POST MESSAGE
===================================================== */
async function postMessage(item){
    if(!await waitForReady()) return;
    const persona=item.persona||window.identity.getRandomPersona();
    if(!persona) return;
    let text=Math.random()<0.45 ? generateRoleMessage(persona) : item.text;
    await performTyping(persona,text);
    window.TGRenderer.appendMessage(persona,text,{ timestamp:item.timestamp||new Date(), type:"incoming", id:`realism_${Date.now()}_${rand(9999)}` });
}

/* =====================================================
   HISTORICAL SIMULATION
===================================================== */
async function simulateHistory(days=30){
    ensurePool(days*100);
    const sortedPool=POOL.slice().sort((a,b)=>a.timestamp-b.timestamp);
    const groupedByDay={};
    sortedPool.forEach(msg=>{
        const d=`${new Date(msg.timestamp).getFullYear()}-${new Date(msg.timestamp).getMonth()}-${new Date(msg.timestamp).getDate()}`;
        if(!groupedByDay[d]) groupedByDay[d]=[];
        groupedByDay[d].push(msg);
    });
    for(const day in groupedByDay){
        const periods=splitDayPeriods(groupedByDay[day]);
        const activityLevel=Math.random();
        for(const p of ["morning","afternoon","evening"]){
            let msgs=pickPeriodMessages(periods[p]);
            if(activityLevel<0.3) msgs=msgs.slice(0,Math.floor(msgs.length*0.3));
            else if(activityLevel<0.7) msgs=msgs.slice(0,Math.floor(msgs.length*0.6));
            for(const m of msgs) await postMessage(m);
        }
    }
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
   AUTO SCHEDULER
===================================================== */
let started=false;
function schedule(){
    const min=8000; const max=45000;
    setTimeout(async()=>{
        await simulateCrowd(1);
        schedule();
    },min+Math.random()*(max-min));
}

/* =====================================================
   INIT
===================================================== */
async function init(){
    await waitForReady();
    ensurePool(10000);
    await simulateHistory(30);
    simulate();
}
function simulate(){
    if(started) return;
    started=true;
    simulateCrowd(120,150,600);
    schedule();
}

/* =====================================================
   PUBLIC API
===================================================== */
window.realism.simulateCrowd=simulateCrowd;
window.realism.postMessage=postMessage;
window.realism.simulate=simulate;
window.realism.simulateHistory=simulateHistory;

init();

})();
