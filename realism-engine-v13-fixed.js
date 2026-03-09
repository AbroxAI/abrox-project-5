// realism-engine-v29-full.js — Full realism + bubble-renderer + identity + reply preview + reactions + joiners + expanded joiner pool
(function(){
"use strict";

/* =====================================================
   DATA POOLS (fully expanded)
===================================================== */
const ASSETS = [
"EUR/USD","USD/JPY","GBP/USD","AUD/USD","USD/CHF","USD/CAD","NZD/USD",
"EUR/JPY","EUR/GBP","EUR/AUD","EUR/CHF","GBP/JPY","GBP/AUD","GBP/CHF",
"AUD/JPY","CAD/JPY","CHF/JPY","AUD/NZD","BTC/USD","ETH/USD","SOL/USD",
"ADA/USD","DOT/USD","MATIC/USD","LINK/USD","AVAX/USD","DOGE/USD","XRP/USD",
"LTC/USD","BNB/USD","SHIB/USD","LUNA/USD","ATOM/USD","FIL/USD","TRX/USD",
"US30","NAS100","SPX500","US500","DAX40","FTSE100","CAC40","NIKKEI225",
"RUSSELL2000","HSI50","GOLD","SILVER","PLATINUM","PALLADIUM","WTI","BRENT",
"NATGAS","COPPER","ALUMINUM","SUGAR","COFFEE","SOYBEAN","CORN","OIL","RICE"
];

const BROKERS = [
"IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade","Binary.com",
"Quotex","ExpertOption","eToro","Plus500","IG","XM","FXTM","Pepperstone",
"IC Markets","Exness","Oanda","FXPro","Bybit","Binance","Kraken","OKX",
"KuCoin","Gate.io","Huobi","Bitfinex","Coinbase","Poloniex"
];

const TIMEFRAMES = ["M1","M3","M5","M10","M15","M30","H1","H2","H4","H6","D1","W1"];

const RESULT_WORDS = [
"green","red","profit","loss","win","missed entry","recovered","scalped nicely",
"small win","big win","moderate loss","loss recovered","double profit","consistent profit",
"partial win","micro win","entry late but profitable","stopped loss","hedged correctly",
"perfect breakout","strong rejection","clean entry","overextended","false breakout",
"retraced","partial loss","good trend","bad trend"
];

const TESTIMONIALS = [
"Made $450 in 2 hours using Abrox","Closed 3 trades all green today","Recovered a losing trade thanks to Abrox",
"7 days straight of consistent profit","Signal timing was perfect today","Scalped 5 trades successfully today",
"Account finally growing consistently","First time hitting $1k profit","Strategy working perfectly this week",
"Another winning day with Abrox signals","Doubled my account this month","Entries are incredibly accurate lately",
"Profits stacking nicely","Consistent gains daily","Finally mastering signals","Best trading week ever",
"Risk managed trades successful","Following signals paid off","Never losing with Abrox","Signals are precise",
"Trades executed flawlessly"
];

const JOINER_WELCOMES = [
"Welcome {user}! 🎉 Glad to have you here!","Hey {user}, welcome to the chat! 👋",
"{user} joined! Make yourself at home ✨","Everyone say hi to {user}! 😎",
"{user} is here! Time for some action 💸","Cheers {user}, welcome aboard 🚀",
"Glad you joined, {user}! Let’s make some profits 💰","Hey {user}, feel free to ask questions 📝",
"{user} hopped in! Enjoy your stay 💎","Welcome {user}! Hope you enjoy the signals 🔥",
"{user} joined! Let's crush some trades together 📈","Say hello to {user}! 💯",
"{user} arrived! Time for green trades 💹","Welcome {user}, let's have a winning day 💎",
"Hey {user}, signals are ready! 🚀","{user} entered the room! Make yourself at home ✨",
"Hi {user}, glad you joined us! 😎","{user} is now part of the team! 🎯","Welcome {user}, enjoy your stay! 🍀",
"{user} is here! Time for some fun 💎","Hello {user}! Ready for the signals? 🔥"
];

const JOINER_REPLIES = [
"Welcome aboard! 👍","Hey, great to see you here! 🎉","Let’s get some profits! 💰",
"Enjoy the signals! 🚀","You’ll love it here 😎","Make yourself at home ✨","Hi {user}, feel free to ask questions 📝",
"Glad you joined! 💎","Cheers! 🔥","Hello {user}, enjoy trading 💹","Hey {user}, stay green today! 💚",
"Welcome {user}! Watch the breakouts 💸","Hi {user}, signals are hot! 🔥","{user} is in! Let’s make it a winning week 💯",
"Welcome {user}! Excited to have you here 🎯","Glad {user} joined! Let’s hit some green trades 💹",
"Hey {user}, don’t miss the signals! 🚀","Hello {user}! Let’s crush it today 💰","Welcome {user}, enjoy the group vibes ✨",
"{user} is here! Cheers! 🎉","Hi {user}, make yourself at home 💎"
];

const EMOJIS = [
"💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑",
"🎯","🏆","🤖","🎉","🍀","📊","⚡","💎","📉","🛠️","🔔","🎵","💹"
];

const REACTIONS = ["👍","❤️","😂","😮","😢","👏","🔥","💯","😎","🎉"];

/* =====================================================
   UTILS
===================================================== */
function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function maybe(p){ return Math.random()<p; }
function rand(min,max){ return Math.floor(Math.random()*(max-min)+min); }
function hash(str){ let h=5381; for(let i=0;i<str.length;i++){ h=((h<<5)+h)+str.charCodeAt(i); } return h>>>0; }

/* =====================================================
   MEMORY & POOL
===================================================== */
const GENERATED = new Set();
const QUEUE = [];
const POOL = [];
window.realism = window.realism || {};
window.realism.POOL = POOL;

function mark(text){
    const fp = hash(text.toLowerCase());
    if(GENERATED.has(fp)) return false;
    GENERATED.add(fp);
    QUEUE.push(fp);
    while(QUEUE.length>150000) GENERATED.delete(QUEUE.shift());
    return true;
}

/* =====================================================
   HISTORICAL COMMENT GENERATOR
===================================================== */
const BASE_DATE = new Date(2025,7,14,10,0,0);

function generateTimestamp(daysBack=120){
    return new Date(BASE_DATE.getTime() - Math.random()*daysBack*86400000);
}

function generateComment(){
    const templates = [
        ()=>`Guys, ${random(TESTIMONIALS)}`,
        ()=>`Anyone trading ${random(ASSETS)} on ${random(BROKERS)}?`,
        ()=>`Signal for ${random(ASSETS)} ${random(TIMEFRAMES)} is ${random(RESULT_WORDS)}`,
        ()=>`Closed ${random(ASSETS)} on ${random(TIMEFRAMES)} — ${random(RESULT_WORDS)}`,
        ()=>`Scalped ${random(ASSETS)} on ${random(BROKERS)}, result ${random(RESULT_WORDS)}`,
        ()=>`${random(JOINER_WELCOMES).replace("{user}", "User"+rand(1000,9999))}`,
        ()=>`${random(JOINER_REPLIES).replace("{user}", "User"+rand(1000,9999))}`
    ];
    let text = random(templates)();
    if(maybe(0.35)) text+=" — "+random(["good execution","tight stop","wide stop","no slippage","perfect timing"]);
    if(maybe(0.60)) text+=" "+random(EMOJIS);
    let tries=0; while(!mark(text)&&tries<60){ text+=" "+rand(999); tries++; }
    return { text, timestamp: generateTimestamp(), type:"historical" };
}

/* =====================================================
   JOINERS + THREADS + REACTIONS + REPLY PREVIEW
===================================================== */
function generateJoiner(){
    const persona = window.identity?.getRandomPersona() || {name:"User"+rand(1000,9999)};
    const welcomeText = random(JOINER_WELCOMES).replace("{user}", persona.name);
    return { persona, text: welcomeText, timestamp: new Date(BASE_DATE), type:"joiner" };
}

async function postMessage(item){
    if(!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage) return;

    const persona = item.persona || window.identity.getRandomPersona();
    const text = item.text || generateComment().text;
    const timestamp = item.timestamp || new Date(BASE_DATE);
    const msgId = `realism_${item.type||"msg"}_${Date.now()}_${rand(9999)}`;

    const reactions = maybe(0.3) ? Array.from({length: rand(1,3)},()=>({emoji: random(REACTIONS), count: rand(1,5)})) : [];

    await window.queuedTyping(persona, text);

    window.TGRenderer.appendMessage(persona,text,{
        timestamp,
        type:item.type || "incoming",
        id:msgId,
        parentId: item.parentId || null,
        replyToText: item.replyToText || null,
        reactions
    });

    item.id = msgId;
}

async function generateThreadedJoinerReplies(joinItem){
    const replyCount = rand(2,5);
    for(let i=0;i<replyCount;i++){
        const persona = window.identity.getRandomPersona();
        const replyText = random(JOINER_REPLIES).replace("{user}",joinItem.persona.name);
        await window.queuedTyping(persona,replyText);
        const msgId = `realism_reply_${Date.now()}_${rand(9999)}`;
        window.TGRenderer.appendMessage(persona,replyText,{
            timestamp: new Date(BASE_DATE),
            type:"incoming",
            id:msgId,
            parentId: joinItem.id,
            replyToText: joinItem.text,
            reactions: maybe(0.5) ? Array.from({length: rand(1,3)},()=>({emoji: random(REACTIONS), count: rand(1,5)})) : []
        });
        await new Promise(r=>setTimeout(r,rand(400,1200)));
    }
}

async function simulateJoiner(minInterval=30000,maxInterval=120000){
    while(true){
        const joinItem = generateJoiner();
        await window.TGRenderer.appendJoinSticker([joinItem.persona]);
        await postMessage(joinItem);
        await generateThreadedJoinerReplies(joinItem);
        await new Promise(r=>setTimeout(r,rand(minInterval,maxInterval)));
    }
}

/* =====================================================
   HISTORICAL POOL MANAGEMENT
===================================================== */
function ensurePool(min=20000){
    while(POOL.length < min){
        POOL.push(generateComment());
        if(POOL.length>100000) break;
    }
}

function injectHistoricalPool(oldPool){
    if(!Array.isArray(oldPool)) return;
    for(const item of oldPool){
        if(item.text) POOL.push(item);
    }
    POOL.sort((a,b)=>a.timestamp-b.timestamp);
}

/* =====================================================
   CROWD SIMULATION
===================================================== */
async function simulateCrowd(count=120,minDelay=150,maxDelay=600){
    ensurePool(count);
    for(let i=0;i<count;i++){
        const item = POOL.shift();
        if(!item) break;
        await postMessage(item);
        await new Promise(r=>setTimeout(r,minDelay+Math.random()*(maxDelay-minDelay)));
    }
}

/* =====================================================
   INIT
===================================================== */
async function init(){
    await waitForReady();
    if(window.realism?.OLD_POOL) injectHistoricalPool(window.realism.OLD_POOL);
    ensurePool(20000);
    simulateJoiner(30000,90000);
    simulateCrowd(120,150,600);
    schedule();
}

function schedule(){
    const min=8000,max=45000;
    setTimeout(async()=>{
        await simulateCrowd(1);
        schedule();
    }, min+Math.random()*(max-min));
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
window.realism.postMessage = postMessage;
window.realism.simulateCrowd = simulateCrowd;
window.realism.simulateJoiner = simulateJoiner;
window.realism.generateThreadedJoinerReplies = generateThreadedJoinerReplies;
window.realism.simulateReactions = simulateReactions;
window.realism.injectHistoricalPool = injectHistoricalPool;
window.realism.init = init;

init();

})();
