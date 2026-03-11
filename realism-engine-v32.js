// ====================== realism-engine-v32-full.js ======================
(function(){
"use strict";

// ====================== POOLS / DATA ======================
const ASSETS = ["EUR/USD","USD/JPY","GBP/USD","AUD/USD","USD/CHF","USD/CAD","NZD/USD",
                "EUR/JPY","EUR/GBP","EUR/AUD","EUR/CHF","GBP/JPY","GBP/AUD","GBP/CHF",
                "AUD/JPY","CAD/JPY","CHF/JPY","AUD/NZD","BTC/USD","ETH/USD","SOL/USD",
                "ADA/USD","DOT/USD","MATIC/USD","LINK/USD","AVAX/USD","DOGE/USD","XRP/USD",
                "LTC/USD","BNB/USD","SHIB/USD","LUNA/USD","ATOM/USD","FIL/USD","TRX/USD",
                "US30","NAS100","SPX500","US500","DAX40","FTSE100","CAC40","NIKKEI225",
                "RUSSELL2000","HSI50","GOLD","SILVER","PLATINUM","PALLADIUM","WTI","BRENT",
                "NATGAS","COPPER","ALUMINUM","SUGAR","COFFEE","SOYBEAN","CORN","OIL","RICE"];

const BROKERS = ["IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade","Binary.com",
                 "Quotex","ExpertOption","eToro","Plus500","IG","XM","FXTM","Pepperstone",
                 "IC Markets","Exness","Oanda","FXPro","Bybit","Binance","Kraken","OKX",
                 "KuCoin","Gate.io","Huobi","Bitfinex","Coinbase","Poloniex"];

const TIMEFRAMES = ["M1","M3","M5","M10","M15","M30","H1","H2","H4","H6","D1","W1"];

const RESULT_WORDS = ["green","red","profit","loss","win","missed entry","recovered",
                      "scalped nicely","small win","big win","moderate loss","loss recovered",
                      "double profit","consistent profit","partial win","micro win",
                      "entry late but profitable","stopped loss","hedged correctly",
                      "perfect breakout","strong rejection","clean entry","overextended",
                      "false breakout","retraced","partial loss","good trend","bad trend"];

const TESTIMONIALS = ["Made $450 in 2 hours using Abrox","Closed 3 trades all green today",
                      "Recovered a losing trade thanks to Abrox","7 days straight of consistent profit",
                      "Signal timing was perfect today","Scalped 5 trades successfully today",
                      "Account finally growing consistently","First time hitting $1k profit",
                      "Strategy working perfectly this week","Another winning day with Abrox signals",
                      "Doubled my account this month","Entries are incredibly accurate lately",
                      "Profits stacking nicely","Consistent gains daily","Finally mastering signals",
                      "Best trading week ever","Risk managed trades successful",
                      "Following signals paid off","Never losing with Abrox","Signals are precise",
                      "Trades executed flawlessly"];

const EMOJIS = ["💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑","🎯","🏆","🤖","🎉",
                "🍀","📊","⚡","💎","📉","🛠️","🔔","🎵","💹","📊"];

const JOINER_WELCOMES = ["Welcome {user}! 🎉 Glad to have you here!","Hey {user}, welcome to the chat! 👋",
                         "{user} joined! Make yourself at home ✨","Everyone say hi to {user}! 😎",
                         "{user} is here! Time for some action 💸","Cheers {user}, welcome aboard 🚀",
                         "Glad you joined, {user}! Let’s make some profits 💰","Hey {user}, feel free to ask questions 📝",
                         "{user} hopped in! Enjoy your stay 💎","Welcome {user}! Hope you enjoy the signals 🔥",
                         "{user} joined! Let's crush some trades together 📈","Say hello to {user}! 💯",
                         "{user} arrived! Time for green trades 💹","Welcome {user}, let's have a winning day 💎",
                         "Hey {user}, signals are ready! 🚀"];

const JOINER_REPLIES = ["Welcome aboard! 👍","Hey, great to see you here! 🎉","Let’s get some profits! 💰",
                        "Enjoy the signals! 🚀","You’ll love it here 😎","Make yourself at home ✨",
                        "Hi {user}, feel free to ask questions 📝","Glad you joined! 💎","Cheers! 🔥",
                        "Hello {user}, enjoy trading 💹","Hey {user}, stay green today! 💚",
                        "Welcome {user}! Watch the breakouts 💸","Hi {user}, signals are hot! 🔥",
                        "{user} is in! Let’s make it a winning week 💯"];

const ROLES = {
    ADMIN: ["New signal dropping soon","Hold entries until confirmation","Market volatility is high today",
            "Signal confirmed — manage risk","VIP signal posted above","Attention: news impact incoming",
            "Adjust stop loss for current trades"],
    SIGNAL: ["Signal: {asset} {tf} — CALL","Signal: {asset} {tf} — PUT","Watching {asset} breakout",
             "Entry forming on {asset} {tf}","Possible reversal on {asset}","Target hit on {asset} {tf}",
             "Missed entry on {asset} {tf}"],
    PRO: ["Took that trade — looks good","Confirmed on my chart","Entry was clean","Nice signal",
          "That move was strong","Managed risk perfectly","Closed with profit"],
    BEGINNER: ["Is it safe to enter now?","New here how do I follow signals?","Anyone trading this?",
               "Still learning this strategy","Can someone explain the entry?",
               "Missed the entry, help!","How do I calculate risk?"],
    HYPE: ["🔥🔥🔥","Nice profit today","Another win","Abrox never disappoints",
           "Green again today 💰","Profit stacking 💎","Excellent week 🚀","Feeling lucky today"]
};

// ====================== MEMORY & POOL ======================
const GENERATED = new Set();
const QUEUE = [];
const POOL = [];
window.realism = window.realism || {};
window.realism.POOL = POOL;

// ====================== DUPLICATE CHECK ======================
function mark(text){ const fp=text.toLowerCase().trim(); if(GENERATED.has(fp)) return false; GENERATED.add(fp); QUEUE.push(fp); while(QUEUE.length>150000) GENERATED.delete(QUEUE.shift()); return true; }

// ====================== API-DRIVEN COMMENT GENERATOR ======================
async function generateComment(timestamp){
    const resp = await fetch(`/api/realism/pool/comment`);
    const data = await resp.json();
    return { text: data.text, timestamp: timestamp || new Date(), reactions: {} };
}

// ====================== API-DRIVEN POST MESSAGE ======================
async function postMessage(item){
    const personaResp = await fetch(`/api/realism/pool/persona`);
    const persona = await personaResp.json();
    const text = item.text || (Math.random()<0.15 ? ROLES.PRO[Math.floor(Math.random()*ROLES.PRO.length)] : item.text);
    item.id = `realism_${Date.now()}_${Math.floor(Math.random()*9999)}`;
    item.reactions = item.reactions || {};
    await fetch(`/api/realism/pool/post`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({id:item.id,text,persona})
    });
    if(window.TGRenderer?.appendMessage) window.TGRenderer.appendMessage(persona,text,{id:item.id,timestamp:item.timestamp});
}

// ====================== API-DRIVEN JOINERS ======================
function generateJoiner(){
    return { persona: {name:`User${Math.floor(Math.random()*9999)}`}, text: JOINER_WELCOMES[Math.floor(Math.random()*JOINER_WELCOMES.length)] };
}
async function postJoinSticker(joinItem){
    await fetch(`/api/realism/pool/join`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(joinItem) });
    if(window.TGRenderer?.appendJoinSticker) window.TGRenderer.appendJoinSticker([joinItem.persona]);
}

// ====================== HISTORICAL BACKFILL ======================
async function injectHistorical(){
    const resp = await fetch(`/api/realism/pool/history?start=2026-08-14`);
    const history = await resp.json();
    for(const msg of history){
        await postMessage(msg);
    }
}

// ====================== PUBLIC API ======================
window.realism.postMessage = postMessage;
window.realism.generateComment = generateComment;
window.realism.generateJoiner = generateJoiner;
window.realism.postJoinSticker = postJoinSticker;
window.realism.injectHistorical = injectHistorical;
window.realism.addReaction = addReaction;

})();
