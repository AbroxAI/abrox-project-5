// ====================== REALISM ENGINE v32 ======================
(function(){
"use strict";

// ===== POOLS / DATA =====
const ASSETS=["EUR/USD","USD/JPY","GBP/USD","AUD/USD","USD/CHF","USD/CAD","NZD/USD","EUR/JPY","EUR/GBP","EUR/AUD","EUR/CHF","GBP/JPY","GBP/AUD","GBP/CHF","AUD/JPY","CAD/JPY","CHF/JPY","AUD/NZD","BTC/USD","ETH/USD","SOL/USD","ADA/USD","DOT/USD","MATIC/USD","LINK/USD","AVAX/USD","DOGE/USD","XRP/USD","LTC/USD","BNB/USD","SHIB/USD","LUNA/USD","ATOM/USD","FIL/USD","TRX/USD","US30","NAS100","SPX500","US500","DAX40","FTSE100","CAC40","NIKKEI225","RUSSELL2000","HSI50","GOLD","SILVER","PLATINUM","PALLADIUM","WTI","BRENT","NATGAS","COPPER","ALUMINUM","SUGAR","COFFEE","SOYBEAN","CORN","OIL","RICE"];
const BROKERS=["IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade","Binary.com","Quotex","ExpertOption","eToro","Plus500","IG","XM","FXTM","Pepperstone","IC Markets","Exness","Oanda","FXPro","Bybit","Binance","Kraken","OKX","KuCoin","Gate.io","Huobi","Bitfinex","Coinbase","Poloniex"];
const TIMEFRAMES=["M1","M3","M5","M10","M15","M30","H1","H2","H4","H6","D1","W1"];
const RESULT_WORDS=["green","red","profit","loss","win","missed entry","recovered","scalped nicely","small win","big win","moderate loss","loss recovered","double profit","consistent profit","partial win","micro win","entry late but profitable","stopped loss","hedged correctly","perfect breakout","strong rejection","clean entry","overextended","false breakout","retraced","partial loss","good trend","bad trend"];
const TESTIMONIALS=["Made $450 in 2 hours using Abrox","Closed 3 trades all green today","Recovered a losing trade thanks to Abrox","7 days straight of consistent profit","Signal timing was perfect today","Scalped 5 trades successfully today","Account finally growing consistently","First time hitting $1k profit","Strategy working perfectly this week","Another winning day with Abrox signals","Doubled my account this month","Entries are incredibly accurate lately","Profits stacking nicely","Consistent gains daily","Finally mastering signals","Best trading week ever","Risk managed trades successful","Following signals paid off","Never losing with Abrox","Signals are precise","Trades executed flawlessly"];
const EMOJIS=["💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑","🎯","🏆","🤖","🎉","🍀","📊","⚡","💎","📉","🛠️","🔔","🎵","💹","📊"];
const REACTIONS=["👍","❤️","😂","😮","😢","👏","🔥","💯","😎","🎉"];
const JOINER_WELCOMES=["Welcome {user}! 🎉 Glad to have you here!","Hey {user}, welcome to the chat! 👋","{user} joined! Make yourself at home ✨","Everyone say hi to {user}! 😎","{user} is here! Time for some action 💸","Cheers {user}, welcome aboard 🚀","Glad you joined, {user}! Let’s make some profits 💰","Hey {user}, feel free to ask questions 📝","{user} hopped in! Enjoy your stay 💎","Welcome {user}! Hope you enjoy the signals 🔥","{user} joined! Let's crush some trades together 📈","Say hello to {user}! 💯","{user} arrived! Time for green trades 💹","Welcome {user}, let's have a winning day 💎","Hey {user}, signals are ready! 🚀"];
const JOINER_REPLIES=["Welcome aboard! 👍","Hey, great to see you here! 🎉","Let’s get some profits! 💰","Enjoy the signals! 🚀","You’ll love it here 😎","Make yourself at home ✨","Hi {user}, feel free to ask questions 📝","Glad you joined! 💎","Cheers! 🔥","Hello {user}, enjoy trading 💹","Hey {user}, stay green today! 💚","Welcome {user}! Watch the breakouts 💸","Hi {user}, signals are hot! 🔥","{user} is in! Let’s make it a winning week 💯"];
const ROLES={ADMIN:["New signal dropping soon","Hold entries until confirmation","Market volatility is high today","Signal confirmed — manage risk","VIP signal posted above","Attention: news impact incoming","Adjust stop loss for current trades"],SIGNAL:["Signal: {asset} {tf} — CALL","Signal: {asset} {tf} — PUT","Watching {asset} breakout","Entry forming on {asset} {tf}","Possible reversal on {asset}","Target hit on {asset} {tf}","Missed entry on {asset} {tf}"],PRO:["Took that trade — looks good","Confirmed on my chart","Entry was clean","Nice signal","That move was strong","Managed risk perfectly","Closed with profit"],BEGINNER:["Is it safe to enter now?","New here how do I follow signals?","Anyone trading this?","Still learning this strategy","Can someone explain the entry?","Missed the entry, help!","How do I calculate risk?"],HYPE:["🔥🔥🔥","Nice profit today","Another win","Abrox never disappoints","Green again today 💰","Profit stacking 💎","Excellent week 🚀","Feeling lucky today"]};

// ===== UTILS =====
function random(arr){return arr[Math.floor(Math.random()*arr.length)];}
function maybe(p){return Math.random()<p;}
function rand(min,max){return Math.floor(Math.random()*(max-min)+min);}
function hash(str){let h=5381; for(let i=0;i<str.length;i++){h=((h<<5)+h)+str.charCodeAt(i);} return (h>>>0).toString(36);}

// ===== MEMORY & POOL =====
const GENERATED=new Set();
const QUEUE=[];
const POOL=[];
window.realism=window.realism||{};
window.realism.POOL=POOL;

// ===== DUPLICATE CHECK =====
function mark(text){const fp=hash(text.toLowerCase()); if(GENERATED.has(fp)) return false; GENERATED.add(fp); QUEUE.push(fp); while(QUEUE.length>150000) GENERATED.delete(QUEUE.shift()); return true;}

// ===== COMMENT GENERATOR (API) =====
async function generateComment(timestampOverride){
    try {
        const resp = await fetch("/api/get-comment");
        const data = await resp.json();
        data.timestamp = timestampOverride || new Date(data.timestamp || Date.now());
        data.reactions = {};
        return data;
    } catch(e) {
        const text = "Fallback comment at "+new Date().toLocaleTimeString();
        return { text, timestamp: timestampOverride || new Date(), reactions:{} };
    }
}

// ===== REACTIONS =====
function addReaction(item,reaction,persona){
    if(!item.reactions) item.reactions={};
    if(!item.reactions[reaction]) item.reactions[reaction]={count:0, personas:[]};
    item.reactions[reaction].count++;
    if(persona) item.reactions[reaction].personas.push(persona.name||persona);
    if(window.TGRenderer?.updateReactionPill) window.TGRenderer.updateReactionPill(item.id,item.reactions);
}
const REACTION_MENU_EMOJIS = ["👍","❤️","😂","😮","😢","👏","🔥","💯","😎","🎉"];
function showReactionMenu(targetItem){
    const existingMenu = document.getElementById("reaction-menu");
    if(existingMenu) existingMenu.remove();
    const menu = document.createElement("div");
    menu.id = "reaction-menu";
    menu.style.position = "absolute";
    menu.style.background = "#fff";
    menu.style.border = "1px solid #ccc";
    menu.style.borderRadius = "24px";
    menu.style.padding = "6px 8px";
    menu.style.display = "flex";
    menu.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    menu.style.zIndex = 9999;
    REACTION_MENU_EMOJIS.forEach(emoji=>{
        const btn=document.createElement("div");
        btn.innerText=emoji;
        btn.style.fontSize="20px";
        btn.style.margin="0 4px";
        btn.style.cursor="pointer";
        btn.style.transition="transform 0.15s";
        btn.addEventListener("mouseenter",()=>btn.style.transform="scale(1.3)");
        btn.addEventListener("mouseleave",()=>btn.style.transform="scale(1)");
        btn.addEventListener("click",()=>{addReaction(targetItem,emoji,window.identity.getRandomPersona());menu.remove();});
        menu.appendChild(btn);
    });
    document.body.appendChild(menu);
    const rect = targetItem.getBoundingClientRect();
    menu.style.top=(rect.top-40)+"px";
    menu.style.left=(rect.left+rect.width/2-menu.offsetWidth/2)+"px";
    const handleOutside=(e)=>{if(!menu.contains(e.target)){menu.remove();document.removeEventListener("click",handleOutside);}};
    setTimeout(()=>document.addEventListener("click",handleOutside),50);
}
function attachReactionMenu(msgId){
    const message=document.getElementById(msgId);
    if(!message) return;
    message.querySelectorAll(".reaction-pill").forEach(pill=>{
        let pressTimer;
        pill.addEventListener("mousedown",()=>pressTimer=setTimeout(()=>showReactionMenu(pill.dataset.item),600));
        pill.addEventListener("mouseup",()=>clearTimeout(pressTimer));
        pill.addEventListener("mouseleave",()=>clearTimeout(pressTimer));
        pill.addEventListener("touchstart",()=>pressTimer=setTimeout(()=>showReactionMenu(pill.dataset.item),600));
        pill.addEventListener("touchend",()=>clearTimeout(pressTimer));
    });
}

// ===== POST MESSAGE =====
async function postMessage(item){
    const persona= item.persona || await window.identity.getRandomPersona();
    const text=item.text || item.text || "Message";
    await new Promise(r=>setTimeout(r,Math.random()*600+200));
    const msgId=`realism_${item.type||"msg"}_${Date.now()}_${Math.floor(Math.random()*9999)}`;
    item.id=msgId;
    if(!item.reactions) item.reactions={};
    if(window.TGRenderer?.appendMessage) window.TGRenderer.appendMessage(persona,text,{
        timestamp:item.timestamp || new Date(),
        type:item.type||"incoming",
        id:msgId,
        highlight:item.highlighted||false,
        reactions:item.reactions,
        reactionPreview:true
    });
    attachReactionMenu(msgId);
}

// ===== JOINERS =====
function generateJoiner(timestampOverride){
    const persona={name:"User"+Math.floor(Math.random()*9000+1000)};
    const text="Welcome "+persona.name+" to the chat 🎉";
    return {persona,text,timestamp:timestampOverride||new Date(),type:"joiner",reactions:{}};
}
async function postJoinSticker(joinItem){
    if(window.TGRenderer?.appendJoinSticker) window.TGRenderer.appendJoinSticker([joinItem.persona]);
    joinItem.id=`join_${Date.now()}_${Math.floor(Math.random()*9999)}`;
}
async function generateThreadedJoinerReplies(joinItem){
    const replyCount=Math.floor(Math.random()*4)+2;
    for(let i=0;i<replyCount;i++){
        const persona= await window.identity.getRandomPersona();
        const replyText="Hi "+joinItem.persona.name+"!";
        await new Promise(r=>setTimeout(r,Math.random()*700+300));
        const msgId=`realism_reply_${Date.now()}_${Math.floor(Math.random()*9999)}`;
        const reply={id:msgId,parentId:joinItem.id,reactions:{}};
        if(window.TGRenderer?.appendMessage) window.TGRenderer.appendMessage(persona,replyText,{
            timestamp:new Date(),
            type:"incoming",
            id:msgId,
            parentId:joinItem.id,
            highlight:Math.random()<0.2,
            reactions:reply.reactions,
            reactionPreview:true
        });
    }
}

// ===== HISTORICAL BACKFILL (API) =====
async function injectHistorical(){
    try {
        const resp = await fetch("/api/history?start=2026-08-14");
        const history = await resp.json();
        for(const msg of history){
            await postMessage(await generateComment(new Date(msg.timestamp)));
        }
    } catch(e){
        const start = new Date("2026-08-14T09:00:00");
        const end = new Date();
        let current = new Date(start);
        while(current<end){
            const msg = await generateComment(current);
            await postMessage(msg);
            current.setMinutes(current.getMinutes()+Math.floor(Math.random()*10+5));
        }
    }
}

// ===== PUBLIC API =====
window.realism.postMessage=postMessage;
window.realism.generateComment=generateComment;
window.realism.generateJoiner=generateJoiner;
window.realism.postJoinSticker=postJoinSticker;
window.realism.generateThreadedJoinerReplies=generateThreadedJoinerReplies;
window.realism.injectHistorical=injectHistorical;
window.realism.addReaction=addReaction;
window.realism.showReactionMenu=showReactionMenu;
window.realism.attachReactionMenu=attachReactionMenu;
