// realism-engine-v15-fixed-extended.js — FINAL + AUTO-REPLY & PINNED CAPTIONS
(function(){
"use strict";

/* =====================================================
   CONFIG
===================================================== */
const CFG = window.REALISM_CONFIG || {};
const MIN_INTERVAL = CFG.MIN_INTERVAL_MS || 20000;
const MAX_INTERVAL = CFG.MAX_INTERVAL_MS || 60000;
const REACTION_PROB = CFG.REACTION_PROB || 0.35;
const TREND_PROB = CFG.TREND_SPIKE_PROB || 0.02;
const AUTO_REPLY_PROB = CFG.AUTO_REPLY_PROB || 0.25;
const PINNED_PROB = CFG.PINNED_PROB || 0.05;

/* =====================================================
   DATA POOLS
===================================================== */
const ASSETS=[
"EUR/USD","USD/JPY","GBP/USD","AUD/USD","BTC/USD","ETH/USD","USD/CHF","EUR/JPY","NZD/USD",
"US30","NAS100","SPX500","DAX30","FTSE100","GOLD","SILVER","WTI","BRENT",
"ADA/USD","SOL/USD","DOGE/USD","DOT/USD","LINK/USD","MATIC/USD","LUNC/USD","AVAX/USD",
"XRP/USD","ATOM/USD","BNB/USD","DOGE/BTC","ETH/BTC","SOL/BTC"
];

const BROKERS=[
"IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade","Binary.com","eToro","Plus500",
"IG","XM","FXTM","Pepperstone","IC Markets","Bybit","Binance","OKX","Kraken",
"Coinbase","Huobi","Bitfinex","Kraken Futures"
];

const TIMEFRAMES=["M1","M5","M15","M30","H1","H4","D1","W1"];

const RESULT_WORDS=[
"green","red","profit","loss","win","missed entry","recovered","scalped nicely","small win",
"big win","moderate loss","loss recovered","double profit","micro win","stopped loss","hedged correctly"
];

const TESTIMONIALS=[
"Made $450 in 2 hours using Abrox","Closed 3 trades, all green today",
"Recovered a losing trade thanks to Abrox","7 days straight of consistent profit",
"Signal timing was perfect today","Scalped 5 trades successfully","Entry late but profitable",
"Big win on NAS100 today","Missed entry but recovered","Consistent profit every day",
"Small win but solid","Double profit today","Hedged correctly for safe trade","Micro win achieved"
];

const EMOJIS=["💸","🔥","💯","✨","📈","🚀","💰","🎯","🏆","😎","👀","🤖","🎉","🍀","📊","📉","💹"];

/* =====================================================
   UTIL
===================================================== */
function random(arr){return arr[Math.floor(Math.random()*arr.length)];}
function maybe(p){return Math.random()<p;}
function rand(max=9999){return Math.floor(Math.random()*max);}

/* =====================================================
   MEMORY
===================================================== */
const GENERATED=new Set();
const QUEUE=[];
function hash(str){let h=5381;for(let i=0;i<str.length;i++){h=((h<<5)+h)+str.charCodeAt(i);}return (h>>>0).toString(36);}
function mark(text){const fp=hash(text.toLowerCase());if(GENERATED.has(fp)) return false;GENERATED.add(fp);QUEUE.push(fp);while(QUEUE.length>50000){GENERATED.delete(QUEUE.shift());}return true;}

/* =====================================================
   COMMENT GENERATOR WITH AUTO-REPLY & PINNED CAPTION
===================================================== */
function generateComment(previousMessages=[]) {
    const templates=[
        ()=>`Guys ${random(TESTIMONIALS)}`,
        ()=>`Anyone trading ${random(ASSETS)} on ${random(BROKERS)}?`,
        ()=>`Signal for ${random(ASSETS)} ${random(TIMEFRAMES)} is ${random(RESULT_WORDS)}`,
        ()=>`Closed ${random(ASSETS)} on ${random(TIMEFRAMES)} — ${random(RESULT_WORDS)}`,
        ()=>`Scalped ${random(ASSETS)} on ${random(BROKERS)} result ${random(RESULT_WORDS)}`
    ];
    
    let text=random(templates)();

    // Auto reply: 25% chance
    let replyToId = null;
    if (previousMessages.length && maybe(AUTO_REPLY_PROB)) {
        const target = random(previousMessages);
        replyToId = target.id;
        text = `@${target.persona?.name||'User'} ${text}`;
    }

    // Optional extra commentary
    if(maybe(0.35)) text+=" "+random(["good execution","perfect timing","tight stop","no slippage","wide stop"]);
    if(maybe(0.45)) text+=" "+random(EMOJIS);

    // Deduplicate
    let tries=0;
    while(!mark(text) && tries<20){text+=" "+rand(999);tries++;}

    // Reactions
    let reactions=[];
    if(maybe(REACTION_PROB)){
        const count=1+Math.floor(Math.random()*3);
        reactions=Array.from({length:count},()=>({emoji: random(EMOJIS), count: 1+Math.floor(Math.random()*5)}));
    }

    // Trend flag
    const trending = maybe(TREND_PROB);

    // Optional pinned caption
    let caption = null;
    if(maybe(PINNED_PROB)) {
        caption = text + " (Pinned message)";
    }

    return {text, reactions, trending, replyToId, caption};
}

/* =====================================================
   WAIT FOR SYSTEM
===================================================== */
async function waitForReady(){
    while(!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage || !window.queuedTyping){
        await new Promise(r=>setTimeout(r,50));
    }
}

/* =====================================================
   POST MESSAGE
===================================================== */
async function postMessage(item){
    await waitForReady();
    const persona=window.identity.getRandomPersona();
    if(!persona) return;
    await window.queuedTyping(persona,item.text);

    window.TGRenderer.appendMessage(
        persona,
        item.text,
        {
            timestamp:new Date(),
            type:"incoming",
            id:`real_${Date.now()}_${rand(9999)}`,
            reactions:item.reactions,
            trending:item.trending,
            replyToId:item.replyToId,
            caption:item.caption
        }
    );
}

/* =====================================================
   CROWD SIM
===================================================== */
async function simulateCrowd(count=5){
    const prevMessages = [];
    for(let i=0;i<count;i++){
        const item = generateComment(prevMessages);
        const msgId = await postMessage(item);
        prevMessages.push({...item, id: msgId, persona: window.identity.getRandomPersona()});
        await new Promise(r=>setTimeout(r,400+Math.random()*800));
    }
}

/* =====================================================
   SCHEDULER
===================================================== */
let started=false;
function schedule(){
    const delay=MIN_INTERVAL+Math.random()*(MAX_INTERVAL-MIN_INTERVAL);
    setTimeout(async()=>{
        await simulateCrowd(1);
        schedule();
    },delay);
}

/* =====================================================
   MAIN
===================================================== */
function simulate(){
    if(started) return;
    started=true;
    simulateCrowd(10);
    schedule();
}

/* =====================================================
   PUBLIC API
===================================================== */
window.realism=window.realism||{};
window.realism.simulate=simulate;
window.realism.simulateCrowd=simulateCrowd;
window.realism.generateReply=function(prevMessages){return generateComment(prevMessages).text;};
window.realism.postFallbackReply=async function(){
    const text=random(["Nice one 🔥","Interesting","Exactly","Good point","Agreed"]);
    await postMessage({text,reactions:[],trending:false});
};

})();
