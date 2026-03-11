// ====================== REALISM ENGINE v32 FULLY SYNCED + LIVE FIX ======================
"use strict";

// ===== IMPORT / TEXT POOLS =====
const ASSETS = ["EUR/USD","USD/JPY","GBP/USD","AUD/USD","USD/CHF","USD/CAD","NZD/USD","EUR/JPY","EUR/GBP","EUR/AUD","EUR/CHF","GBP/JPY","GBP/AUD","GBP/CHF","AUD/JPY","CAD/JPY","CHF/JPY","AUD/NZD","BTC/USD","ETH/USD","SOL/USD","ADA/USD","DOT/USD","MATIC/USD","LINK/USD","AVAX/USD","DOGE/USD","XRP/USD","LTC/USD","BNB/USD","SHIB/USD","LUNA/USD","ATOM/USD","FIL/USD","TRX/USD","US30","NAS100","SPX500","US500","DAX40","FTSE100","CAC40","NIKKEI225","RUSSELL2000","HSI50","GOLD","SILVER","PLATINUM","PALLADIUM","WTI","BRENT","NATGAS","COPPER","ALUMINUM","SUGAR","COFFEE","SOYBEAN","CORN","OIL","RICE"];
const BROKERS = ["IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade","Binary.com","Quotex","ExpertOption","eToro","Plus500","IG","XM","FXTM","Pepperstone","IC Markets","Exness","Oanda","FXPro","Bybit","Binance","Kraken","OKX","KuCoin","Gate.io","Huobi","Bitfinex","Coinbase","Poloniex"];
const TIMEFRAMES = ["M1","M3","M5","M10","M15","M30","H1","H2","H4","H6","D1","W1"];
const RESULT_WORDS = ["green","red","profit","loss","win","missed entry","recovered","scalped nicely","small win","big win","moderate loss","loss recovered","double profit","consistent profit","partial win","micro win","entry late but profitable","stopped loss","hedged correctly","perfect breakout","strong rejection","clean entry","overextended","false breakout","retraced","partial loss","good trend","bad trend"];
const TESTIMONIALS = ["Made $450 in 2 hours using Abrox","Closed 3 trades all green today","Recovered a losing trade thanks to Abrox","7 days straight of consistent profit","Signal timing was perfect today","Scalped 5 trades successfully today","Account finally growing consistently","First time hitting $1k profit","Strategy working perfectly this week","Another winning day with Abrox signals","Doubled my account this month","Entries are incredibly accurate lately","Profits stacking nicely","Consistent gains daily","Finally mastering signals","Best trading week ever","Risk managed trades successful","Following signals paid off","Never losing with Abrox","Signals are precise","Trades executed flawlessly"];
const EMOJIS = ["💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑","🎯","🏆","🤖","🎉","🍀","📊","⚡","💎","📉","🛠️","🔔","🎵","💹","📊"];
const REACTIONS = ["👍","❤️","😂","😮","😢","👏","🔥","💯","😎","🎉"];
const JOINER_WELCOMES = ["Welcome {user}! 🎉 Glad to have you here!","Hey {user}, welcome to the chat! 👋","{user} joined! Make yourself at home ✨","Everyone say hi to {user}! 😎","{user} is here! Time for some action 💸","Cheers {user}, welcome aboard 🚀","Glad you joined, {user}! Let’s make some profits 💰","Hey {user}, feel free to ask questions 📝","{user} hopped in! Enjoy your stay 💎","Welcome {user}! Hope you enjoy the signals 🔥","{user} joined! Let's crush some trades together 📈","Say hello to {user}! 💯","{user} arrived! Time for green trades 💹","Welcome {user}, let's have a winning day 💎","Hey {user}, signals are ready! 🚀"];
const JOINER_REPLIES = ["Welcome aboard! 👍","Hey, great to see you here! 🎉","Let’s get some profits! 💰","Enjoy the signals! 🚀","You’ll love it here 😎","Make yourself at home ✨","Hi {user}, feel free to ask questions 📝","Glad you joined! 💎","Cheers! 🔥","Hello {user}, enjoy trading 💹","Hey {user}, stay green today! 💚","Welcome {user}! Watch the breakouts 💸","Hi {user}, signals are hot! 🔥","{user} is in! Let’s make it a winning week 💯"];
const ROLES = {
    ADMIN: ["New signal dropping soon","Hold entries until confirmation","Market volatility is high today","Signal confirmed — manage risk","VIP signal posted above","Attention: news impact incoming","Adjust stop loss for current trades"],
    SIGNAL: ["Signal: {asset} {tf} — CALL","Signal: {asset} {tf} — PUT","Watching {asset} breakout","Entry forming on {asset} {tf}","Possible reversal on {asset}","Target hit on {asset} {tf}","Missed entry on {asset} {tf}"],
    PRO: ["Took that trade — looks good","Confirmed on my chart","Entry was clean","Nice signal","That move was strong","Managed risk perfectly","Closed with profit"],
    BEGINNER: ["Is it safe to enter now?","New here how do I follow signals?","Anyone trading this?","Still learning this strategy","Can someone explain the entry?","Missed the entry, help!","How do I calculate risk?"],
    HYPE: ["🔥🔥🔥","Nice profit today","Another win","Abrox never disappoints","Green again today 💰","Profit stacking 💎","Excellent week 🚀","Feeling lucky today"]
};
const SLANG = {
  western:["bro","ngl","lowkey","fr","tbh","wild","solid move","bet","dope","lit","clutch","savage","meme","cheers","respect","hype","flex","mad","cap","no cap","real talk","yo","fam","legit","sick"],
  african:["my guy","omo","chai","no wahala","sharp move","gbam","yawa","sweet","jollof","palava","chop","fine boy","hustle","ehen","kolo","sisi","big man","on point","correct","naija","bros","guyz"],
  asian:["lah","brother","steady","respect","solid one","ok lah","si","good move","ganbatte","wa","neat","ke","nice one","yah","cool","aiyo","steady bro"],
  latin:["amigo","vamos","muy bueno","fuerte move","dale","epa","buenisimo","chevere","que pasa","vamo","oye","pura vida","mano","buena","vamos ya","olé"],
  eastern:["comrade","strong move","not bad","serious play","da","top","nu","excellent","good work","correct","bravo","fine","nice move","pro","cheers"]
};
const CRYPTO_ALIASES = ["BlockKing","PumpMaster","CryptoWolf","FomoKing","Hodler","TraderJoe","BitHunter","AltcoinAce","ChainGuru","DeFiLord","MetaWhale","CoinSniper","YieldFarmer","NFTDegen","ChartWizard","TokenShark","AirdropKing","WhaleHunter","BullRider","BearBuster","SatoshiFan","GasSaver","MoonChaser","RektRecover","Nodesman","LiquidityLord","OnChainOwl"];
const TITLES = ["Trader","Investor","HODLer","Analyst","Whale","Shark","Mooner","Scalper","SwingTrader","DeFi","Miner","Blockchain","NFT","Quant","Signals","Mentor","Founder","CTO","RiskMgr","Ops"];

// ===== UTILS =====
function random(arr){return arr[Math.floor(Math.random()*arr.length)];}
function maybe(p){return Math.random()<p;}
function rand(min,max){return Math.floor(Math.random()*(max-min)+min);}
function hash(str){let h=5381; for(let i=0;i<str.length;i++){h=((h<<5)+h)+str.charCodeAt(i);} return (h>>>0).toString(36);}

// ===== REALISM ENGINE OBJECT =====
window.realismEngineV32 = window.realismEngineV32 || {};
const engine = window.realismEngineV32;
engine.POOL = [];
engine.USAGE_TRACK = new Set();
engine.GENERATED = new Set();

// ===== FULL POOL MANAGEMENT =====
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
        () => `Guys, ${random(TESTIMONIALS)}`,
        () => `Anyone trading ${random(ASSETS)} on ${random(BROKERS)}?`,
        () => `Signal for ${random(ASSETS)} ${random(TIMEFRAMES)} is ${random(RESULT_WORDS)}`,
        () => `Closed ${random(ASSETS)} on ${random(TIMEFRAMES)} — ${random(RESULT_WORDS)}`,
        () => `Scalped ${random(ASSETS)} on ${random(BROKERS)}, result ${random(RESULT_WORDS)}`
    ])();
    if(maybe(0.6)) text += " " + random(EMOJIS);
    if(maybe(0.35)) text += " — "+random(["good execution","tight stop","wide stop","no slippage","perfect timing"]);
    
    if(SLANG[persona.region] && maybe(0.5)){
        text = random(SLANG[persona.region]) + " " + text;
    }

    let tries=0;
    while(this.GENERATED.has(text.toLowerCase()) && tries<60){ text+=" "+rand(999); tries++; }
    this.GENERATED.add(text.toLowerCase());

    return {persona,text,timestamp: timestampOverride || new Date(),reactions:{}};
};

// ===== REACTIONS =====
engine.addReaction = function(item,reaction,persona){
    if(!item.reactions) item.reactions={};
    if(!item.reactions[reaction]) item.reactions[reaction]={count:0,personas:[]};
    item.reactions[reaction].count++;
    if(persona) item.reactions[reaction].personas.push(persona.name||persona);
    if(window.TGRenderer?.updateReactionPill) window.TGRenderer.updateReactionPill(item.id,item.reactions);
};

// ===== POST MESSAGE =====
engine.postMessage = async function(item){
    item.persona = item.persona || await this.getNextPersona();
    const text = item.text || random(ROLES.PRO);
    const msgId = `realism_${item.type||"msg"}_${Date.now()}_${rand(9999)}`;
    item.id = msgId;
    item.reactions = item.reactions || {};
    if(window.TGRenderer?.appendMessage){
        window.TGRenderer.appendMessage(item.persona,text,{
            id: msgId,
            timestamp: item.timestamp||new Date(),
            type: item.type||"incoming",
            highlight: maybe(0.2),
            reactions: item.reactions,
            reactionPreview:true
        });
    }
};

// ===== JOINERS =====
engine.generateJoiner = function(){
    const persona = {name:"User"+rand(1000,9999)};
    const text = random(JOINER_WELCOMES).replace("{user}",persona.name);
    return {persona,text,timestamp:new Date(),type:"joiner",reactions:{}};
};
engine.postJoinSticker = async function(joinItem){
    if(window.TGRenderer?.appendJoinSticker) window.TGRenderer.appendJoinSticker([joinItem.persona]);
    joinItem.id = `join_${Date.now()}_${rand(9999)}`;
};
engine.generateThreadedJoinerReplies = async function(joinItem){
    const count = rand(2,5);
    for(let i=0;i<count;i++){
        const persona = await this.getNextPersona();
        const replyText = random(JOINER_REPLIES).replace("{user}",joinItem.persona.name);
        if(window.TGRenderer?.appendMessage){
            window.TGRenderer.appendMessage(persona,replyText,{
                id:`realism_reply_${Date.now()}_${rand(9999)}`,
                parentId: joinItem.id,
                type:"incoming",
                timestamp:new Date(),
                highlight:maybe(0.2),
                reactions:{},
                reactionPreview:true
            });
        }
    }
};

// ===== HISTORICAL BACKFILL + LIVE FIX =========
(async function(){
    const container = document.getElementById("tg-comments-container");
    if(!container) return;

    // 1️⃣ Backfill
    console.log("⏳ Injecting historical messages...");
    await engine.refillPool();
    let current = new Date("2026-08-14T09:00:00");
    const end = new Date();
    while(current < end){
        const msg = await engine.generateComment(current);
        await engine.postMessage(msg);
        current.setMinutes(current.getMinutes()+rand(5,15));
    }
    container.scrollTop = container.scrollHeight;
    console.log("✅ Historical messages injected");

    // 2️⃣ Live realism loop
    (async function liveLoop(){
        while(true){
            const msg = await engine.generateComment();
            await engine.postMessage(msg);
            if(Math.random() < 0.3) engine.addReaction(msg, random(REACTIons));
            await new Promise(r=>setTimeout(r, rand(2000,6000)));
        }
    })();

    // 3️⃣ Joiners
    (async function joinerLoop(){
        while(true){
            const joinItem = engine.generateJoiner();
            await engine.postJoinSticker(joinItem);
            await engine.generateThreadedJoinerReplies(joinItem);
            await new Promise(r=>setTimeout(r, rand(15000,45000)));
        }
    })();

    // 4️⃣ Typing simulation
    (async function typingLoop(){
        while(true){
            const persona = await engine.getNextPersona();
            document.dispatchEvent(new CustomEvent("headerTyping",{detail:{name:persona.name}}));
            await new Promise(r=>setTimeout(r, rand(1000,3000)));
        }
    })();

})();

console.log("✅ Realism Engine v32 fully synced + live loop enabled");
