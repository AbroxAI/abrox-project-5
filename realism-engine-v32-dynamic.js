// ====================== REALISM ENGINE v32 FULL + JOINER & AUTHORITY ======================
"use strict";

const ASSETS = ["EUR/USD","USD/JPY","GBP/USD","AUD/USD","USD/CHF","USD/CAD","NZD/USD","EUR/JPY","EUR/GBP","EUR/AUD","EUR/CHF","GBP/JPY","GBP/AUD","GBP/CHF","AUD/JPY","CAD/JPY","CHF/JPY","AUD/NZD","BTC/USD","ETH/USD","SOL/USD","ADA/USD","DOT/USD","MATIC/USD","LINK/USD","AVAX/USD","DOGE/USD","XRP/USD","LTC/USD","BNB/USD","SHIB/USD","LUNA/USD","ATOM/USD","FIL/USD","TRX/USD","US30","NAS100","SPX500","US500","DAX40","FTSE100","CAC40","NIKKEI225","RUSSELL2000","HSI50","GOLD","SILVER","PLATINUM","PALLADIUM","WTI","BRENT","NATGAS","COPPER","ALUMINUM","SUGAR","COFFEE","SOYBEAN","CORN","OIL","RICE"];
const BROKERS = ["IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade","Binary.com","Quotex","ExpertOption","eToro","Plus500","IG","XM","FXTM","Pepperstone","IC Markets","Exness","Oanda","FXPro","Bybit","Binance","Kraken","OKX","KuCoin","Gate.io","Huobi","Bitfinex","Coinbase","Poloniex"];
const TIMEFRAMES = ["M1","M3","M5","M10","M15","M30","H1","H2","H4","H6","D1","W1"];
const RESULT_WORDS = ["green","red","profit","loss","win","missed entry","recovered","scalped nicely","small win","big win","moderate loss","loss recovered","double profit","consistent profit","partial win","micro win","entry late but profitable","stopped loss","hedged correctly","perfect breakout","strong rejection","clean entry","overextended","false breakout","retraced","partial loss","good trend","bad trend"];
const TESTIMONIALS = ["Made $450 in 2 hours using Abrox","Closed 3 trades all green today","Recovered a losing trade thanks to Abrox","7 days straight of consistent profit","Signal timing was perfect today","Scalped 5 trades successfully today","Account finally growing consistently","First time hitting $1k profit","Strategy working perfectly this week","Another winning day with Abrox signals","Doubled my account this month","Entries are incredibly accurate lately","Profits stacking nicely","Consistent gains daily","Finally mastering signals","Best trading week ever","Risk managed trades successful","Following signals paid off","Never losing with Abrox","Signals are precise","Trades executed flawlessly"];
const EMOJIS = ["💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑","🎯","🏆","🤖","🎉","🍀","📊","⚡","💎","📉","🛠️","🔔","🎵","💹","📊"];
const REACTIONS = ["👍","❤️","😂","😮","😢","👏","🔥","💯","😎","🎉"];

// ===== JOINER & AUTHORITY POOLS =====
const JOINER_WELCOME = [
    "Welcome to the chat! 🎉",
    "Glad to have you here! 👋",
    "Hey there, enjoy trading with us! 💹",
    "New member alert! Let's go! 🚀",
    "Welcome aboard, happy trading! 💸"
];
const THREAD_REPLY_POOL = [
    "Nice to meet you! 😎",
    "Good luck with your trades! 🍀",
    "Make sure to check the latest signals! 🔔",
    "We usually discuss top strategies here 📈",
    "Welcome! Watch the trends closely! 👀"
];
const AUTHORITY_MESSAGES = [
    "Reminder: Only follow verified signals. ✅",
    "Admins are monitoring the chat for quality trades. ⚡",
    "Stay alert and manage your risk! 💎",
    "Official announcement: Market update incoming. 📊",
    "Please keep discussions on-topic. 🛠️"
];

window.realismEngineV32 = window.realismEngineV32 || {};
const engine = window.realismEngineV32;

// ===== INTERNAL STATE =====
engine.POOL = [];
engine.USAGE_TRACK = new Set();
engine.GENERATED = new Set();
engine.HISTORY = [];
engine.REACTIONS = REACTIONS;

// ===== UTILS =====
function random(arr){return arr[Math.floor(Math.random()*arr.length)];}
function maybe(p){return Math.random()<p;}
function rand(min,max){return Math.floor(Math.random()*(max-min)+min);}

// ===== POOL MANAGEMENT =====
engine.refillPool = async function(){
    while(this.POOL.length < (window.REALISM_CONFIG?.TOTAL_PERSONAS || 1200)){
        const p = await window.identity.getRandomPersona();
        if(!this.USAGE_TRACK.has(p.name)) this.POOL.push(p);
    }
};
engine.getNextPersona = async function(){
    if(this.POOL.length===0) await this.refillPool();
    const idx = Math.floor(Math.random()*this.POOL.length);
    const persona = this.POOL[idx];
    this.USAGE_TRACK.add(persona.name);
    this.POOL.splice(idx,1);
    return persona;
};

// ===== COMMENT GENERATOR =====
engine.generateComment = async function(timestampOverride){
    let persona = await this.getNextPersona();
    let text = random([
        ()=>`Guys, ${random(TESTIMONIALS)}`,
        ()=>`Anyone trading ${random(ASSETS)} on ${random(BROKERS)}?`,
        ()=>`Signal for ${random(ASSETS)} ${random(TIMEFRAMES)} is ${random(RESULT_WORDS)}`,
        ()=>`Closed ${random(ASSETS)} on ${random(TIMEFRAMES)} — ${random(RESULT_WORDS)}`,
        ()=>`Scalped ${random(ASSETS)} on ${random(BROKERS)}, result ${random(RESULT_WORDS)}`
    ])();
    if(maybe(0.6)) text += " "+random(EMOJIS);
    let tries=0;
    while(this.GENERATED.has(text.toLowerCase()) && tries<60){ text+=" "+rand(999); tries++; }
    this.GENERATED.add(text.toLowerCase());
    return {persona,text,timestamp: timestampOverride || new Date(),reactions:{}};
};

// ===== POST MESSAGE =====
engine.postMessage = async function(item){
    item.persona = item.persona || await this.getNextPersona();
    this.HISTORY.push(item); 
    const msgId = `realism_${Date.now()}_${rand(9999)}`;
    item.id = msgId;
    item.reactions = item.reactions || {};
    if(window.TGRenderer?.appendMessage){
        window.TGRenderer.appendMessage(item.persona,item.text,{
            id: msgId,
            timestamp: item.timestamp,
            type:"incoming",
            highlight:maybe(0.2),
            reactions:item.reactions,
            reactionPreview:true
        });
    }
};

// ===== REACTIONS =====
engine.addReaction = function(msg, reaction){
    msg.reactions[reaction] = (msg.reactions[reaction]||0)+1;
    if(window.TGRenderer?.updateReactions) window.TGRenderer.updateReactions(msg.id, msg.reactions);
};

// ===== MULTI-STEP THINKING + BURST TYPING =====
engine.multiStepTypingLoop = async function(){
    while(true){
        const activeTypersCount = rand(1,5);
        const activeTypers = [];
        for(let i=0;i<activeTypersCount;i++) activeTypers.push(await this.getNextPersona());

        document.dispatchEvent(new CustomEvent("headerTyping",{detail:{name:activeTypers.map(p=>p.name).join(", ")}}));

        for(const persona of activeTypers){
            const burstCount = maybe(0.4)? rand(2,4):1;
            for(let i=0;i<burstCount;i++){
                const finalMsg = await this.generateComment();
                finalMsg.persona = persona;

                const words = finalMsg.text.split(" "); let idx=0;
                let interval = setInterval(()=>{
                    idx++;
                    const previewText = words.slice(0, idx).join(" ");
                    if(window.updateTypingPreview) window.updateTypingPreview(persona.name, previewText);
                    if(idx>=words.length) clearInterval(interval);
                }, 150+Math.random()*100);

                setTimeout(async ()=>{
                    await engine.postMessage(finalMsg);
                    if(Math.random()<0.3) engine.addReaction(finalMsg, random(REAC TIONS));
                }, words.length*150 + rand(200,500));
            }
        }
        await new Promise(r=>setTimeout(r, rand(800,3000)));
    }
};

// ===== HISTORICAL BACKFILL =====
engine.injectHistorical = async function(startDate){
    let current = startDate || new Date("2025-08-14T09:00:00");
    const end = new Date();
    await this.refillPool();
    while(current<end){
        const msg = await this.generateComment(current);
        await this.postMessage(msg);
        current.setMinutes(current.getMinutes() + rand(5,15));
    }
};

// ===== JOINERS =====
engine.generateJoiner = function(){
    const persona = {name:"👤 "+Math.random().toString(36).substring(2,8)};
    const welcomeText = random(JOINER_WELCOME);
    return {persona,type:"join",text:welcomeText};
};
engine.postJoinSticker = async function(joinItem){
    if(window.TGRenderer?.appendJoinSticker) window.TGRenderer.appendJoinSticker(joinItem);
};
engine.generateThreadedJoinerReplies = async function(joinItem){
    const repliesCount = rand(1,3);
    for(let i=0;i<repliesCount;i++){
        const reply = {persona: await this.getNextPersona(), text: random(THREAD_REPLY_POOL)};
        await this.postMessage(reply);
    }
};
engine.postAuthorityMessage = async function(){
    const msg = {persona: {name:"🛡️ Admin"}, text: random(AUTHORITY_MESSAGES)};
    await this.postMessage(msg);
};

// ===== INIT ENGINE =====
engine.start = async function(){
    if(this.started) return;
    this.started = true;
    await this.injectHistorical();
    this.multiStepTypingLoop();
    // Launch authority messages occasionally
    setInterval(()=>this.postAuthorityMessage(), rand(45000,90000));
};

console.log("✅ Realism Engine v32 FULL with Joiner Welcome, Thread Replies & Authority Pool ready!");
