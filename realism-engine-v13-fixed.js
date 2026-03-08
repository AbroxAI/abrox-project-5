// realism-engine-v13-fixed.js — Full realism engine (stable + synced)
(function(){
"use strict";

/* =====================================================
   DATA POOLS
===================================================== */
const ASSETS=["EUR/USD","USD/JPY","GBP/USD","AUD/USD","BTC/USD","ETH/USD","USD/CHF","EUR/JPY","NZD/USD",
"US30","NAS100","SPX500","DAX30","FTSE100","GOLD","SILVER","WTI","BRENT",
"ADA/USD","SOL/USD","DOGE/USD","DOT/USD","LINK/USD","MATIC/USD","LUNC/USD","AVAX/USD",
"JPY/CHF","GBP/JPY","EUR/GBP","AUD/JPY","CAD/JPY","US500","RUS_50"];

const BROKERS=["IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade","Binary.com",
"eToro","Plus500","IG","XM","FXTM","Pepperstone","IC Markets","Bybit","Binance","OKX","Kraken"];

const TIMEFRAMES=["M1","M5","M15","M30","H1","H4","D1"];

const RESULT_WORDS=["green","red","profit","loss","win","missed entry","recovered","scalped nicely",
"small win","big win","moderate loss","loss recovered","double profit","consistent profit",
"partial win","micro win","entry late but profitable","stopped loss","hedged correctly"];

const TESTIMONIALS=[
"Made $450 in 2 hours using Abrox",
"Closed 3 trades, all green today",
"Recovered a losing trade thanks to Abrox",
"7 days straight of consistent profit",
"Signal timing was perfect today",
"Scalped 5 trades successfully today"
];

const EMOJIS=["💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑","🎯","🏆","🤖","🎉","🍀","📊"];

/* =====================================================
   UTIL
===================================================== */
function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function maybe(p){ return Math.random()<p; }
function rand(max=9999){ return Math.floor(Math.random()*max); }
function hash(str){
    let h=5381;
    for(let i=0;i<str.length;i++){ h=((h<<5)+h)+str.charCodeAt(i); }
    return (h>>>0).toString(36);
}

/* =====================================================
   MEMORY SYSTEM
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
    while(QUEUE.length>50000) GENERATED.delete(QUEUE.shift());
    return true;
}

/* =====================================================
   POOL GENERATOR
===================================================== */
function ensurePool(min=2000){
    while(POOL.length<min){
        const c=generateComment();
        POOL.push(c);
        if(POOL.length>10000) break;
    }
}

/* =====================================================
   TIMESTAMP
===================================================== */
function generateTimestamp(days=120){
    return new Date(Date.now() - Math.random()*days*86400000);
}

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
    if(maybe(0.45)) text+=" "+random(EMOJIS);

    let tries=0;
    while(!mark(text) && tries<30){ text+=" "+rand(999); tries++; }

    return { text, timestamp: generateTimestamp() };
}

/* =====================================================
   WAIT FOR SYSTEM
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
   TYPING
===================================================== */
async function performTyping(persona,message){
    if(!persona?.name) return;
    await window.queuedTyping(persona,message);
}

/* =====================================================
   POST MESSAGE
===================================================== */
async function postMessage(item){
    if(!await waitForReady()) return;
    const persona=item.persona || window.identity?.getRandomPersona?.();
    if(!persona) return;
    await performTyping(persona,item.text);
    window.TGRenderer.appendMessage(persona,item.text,{
        timestamp:item.timestamp,
        type:"incoming",
        id:`realism_${Date.now()}_${rand(9999)}`
    });
}

/* =====================================================
   FALLBACK REPLY
===================================================== */
async function postFallbackReply(userText){
    if(!await waitForReady()) return;
    const persona=window.identity.getRandomPersona();
    if(!persona) return;

    const responses=["Nice one 🔥","Interesting take","Facts.","Can you explain more?","Agreed.","Exactly"];
    const text=random(responses);
    await performTyping(persona,text);
    window.TGRenderer.appendMessage(persona,text,{timestamp:new Date(),type:"incoming"});
}

/* =====================================================
   CROWD SIMULATION
===================================================== */
async function simulateCrowd(count=60,minDelay=400,maxDelay=1200){
    ensurePool(count);
    for(let i=0;i<count;i++){
        const item=POOL.shift();
        if(!item) break;
        await postMessage(item);
        const pause=minDelay+Math.random()*(maxDelay-minDelay);
        await new Promise(r=>setTimeout(r,pause));
    }
}

/* =====================================================
   AUTO SCHEDULER
===================================================== */
let started=false;
function schedule(){
    const min=20000;
    const max=90000;
    setTimeout(async()=>{
        await simulateCrowd(1);
        schedule();
    }, min+Math.random()*(max-min));
}

/* =====================================================
   MAIN SIM
===================================================== */
function simulate(){
    if(started) return;
    started=true;
    simulateCrowd(60,400,1200);
    schedule();
}

/* =====================================================
   REPLY GENERATOR
===================================================== */
window.realism.generateReply=function(userText){
    const base=generateComment();
    return `${base.text}`;
};

/* =====================================================
   INIT
===================================================== */
(async function init(){
    await waitForReady();
    ensurePool(2000);
    simulate();
})();

window.realism.simulateCrowd=simulateCrowd;
window.realism.postMessage=postMessage;
window.realism.simulate=simulate;
window.realism.postFallbackReply=postFallbackReply;

})();
