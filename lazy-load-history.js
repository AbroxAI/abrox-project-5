(async function(){
"use strict";

// -----------------------------
// CONFIG
// -----------------------------
const START_DATE = new Date(2025,7,14);
const END_DATE = new Date(Date.now()-86400000);
const TOTAL_HISTORICAL = 50000;
const MINI_BATCH = 5;
const BATCH_DELAY = 20;

const container = document.getElementById('tg-comments-container');
const jumpIndicator = document.getElementById('tg-jump-indicator');
const jumpText = document.getElementById('tg-jump-text');
let unseenCount = 0;

// -----------------------------
// UTILS
// -----------------------------
function rand(a,b){ return Math.floor(Math.random()*(b-a)+a); }
function maybe(p){ return Math.random()<p; }

let lastTime = 0;
function timestamp(day){
    let t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), rand(7,22), rand(0,60), rand(0,60));
    if(t.getTime() <= lastTime) t = new Date(lastTime + rand(15000,90000));
    lastTime = t.getTime();
    return t;
}

function activity(){
    const r=Math.random();
    if(r<0.45) return rand(3,8);
    if(r<0.75) return rand(10,25);
    if(r<0.95) return rand(60,120);
    return rand(150,220);
}

// -----------------------------
// TIMELINE GENERATION
// -----------------------------
function generateTimeline(total){
    const items=[];
    let day = new Date(START_DATE);
    while(day <= END_DATE && items.length < total){
        const count = activity();
        for(let i=0;i<count;i++){
            const time = timestamp(day);
            if(maybe(0.12) && window.identity?.getRandomPersona){
                items.push({ type:"join", persona:window.identity.getRandomPersona(), timestamp:time });
            }else{
                items.push({ type:"chat", timestamp:time });
            }
            if(items.length >= total) break;
        }
        day.setDate(day.getDate()+1);
    }
    return items.sort((a,b)=>a.timestamp-b.timestamp);
}

// -----------------------------
// REALISM MESSAGE
// -----------------------------
function getRealismMessage(){
    window.realism.POOL = window.realism.POOL || [];
    let msg = window.realism.POOL.shift() 
            || window.realism.generateComment?.() 
            || window.realism.generateConversation?.()?.text;
    return msg?.text || msg?.message || msg;
}

// -----------------------------
// HISTORIC POST
// -----------------------------
async function postHistoric(item){
    const persona = item.persona || window.identity.getRandomPersona();
    let text = item.type==="join" ? `${persona.name} joined the group` : null;

    while(item.type==="chat" && !text){
        text = getRealismMessage();
        await new Promise(r=>setTimeout(r,1)); // tiny yield
    }

    const msgId = `hist_${Date.now()}_${rand(9999)}`;
    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 20;

    window.TGRenderer.prependMessage(persona, text, { timestamp:item.timestamp, type:"historic", id:msgId });

    if(atBottom) container.scrollTop = container.scrollHeight;

    item.id = msgId;
}

// -----------------------------
// HISTORIC LOADER (incremental)
// -----------------------------
async function loadHistoryIncremental(){
    const timeline = generateTimeline(TOTAL_HISTORICAL);
    for(let i=0;i<timeline.length;i+=MINI_BATCH){
        const miniBatch = timeline.slice(i,i+MINI_BATCH);
        for(const item of miniBatch){
            await postHistoric(item);
        }
        await new Promise(r=>setTimeout(r,BATCH_DELAY));
    }
    console.log(`✅ Historical chat loaded (${timeline.length} messages)`);
}

// -----------------------------
// LIVE MESSAGES
// -----------------------------
async function postLive(){
    const convo = window.realism.generateConversation?.() || { text:"", persona:window.identity.getRandomPersona() };
    await window.queuedTyping(convo.persona, convo.text);
    const now = new Date();

    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 80;

    window.TGRenderer.appendMessage(convo.persona, convo.text, { timestamp:now, type:"incoming" });

    if(atBottom){
        container.scrollTop = container.scrollHeight;
    }else{
        unseenCount++;
        updateJump();
        showJump();
    }
}

// -----------------------------
// JUMP INDICATOR
// -----------------------------
function updateJump(){
    if(!jumpText) return;
    jumpText.textContent = unseenCount>1 ? `New messages · ${unseenCount}` : 'New message';
}
function showJump(){ jumpIndicator?.classList.remove('hidden'); }
function hideJump(){ unseenCount=0; updateJump(); jumpIndicator?.classList.add('hidden'); }

jumpIndicator?.addEventListener('click', ()=>{
    container.scrollTop = container.scrollHeight;
    hideJump();
});

container?.addEventListener('scroll', ()=>{
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    if(distance < 80) hideJump();
});

// -----------------------------
// LIVE POOL & CROWD BURST
// -----------------------------
function ensureLivePool(min=10000){
    window.realism.POOL = window.realism.POOL || [];
    while(window.realism.POOL.length < min){
        const msg = window.realism.generateComment();
        msg.timestamp = new Date();
        window.realism.POOL.push(msg);
        if(window.realism.POOL.length > 50000) break;
    }
}

async function simulateCrowdBurst(total=150){
    ensureLivePool(total);
    while(total>0 && window.realism.POOL.length>0){
        const burstCount = rand(3,8);
        const burst = window.realism.POOL.splice(0,burstCount);
        await Promise.all(burst.map(item=>window.realism.postMessage(item)));
        await new Promise(r=>setTimeout(r, rand(100,500)));
    }
}

// -----------------------------
// INIT
// -----------------------------
async function init(){
    // wait for all deps
    while(!window.identity?.SyntheticPool?.length || !window.TGRenderer?.prependMessage || !window.TGRenderer?.appendMessage || !window.queuedTyping || !window.realism?.simulate){
        await new Promise(r=>setTimeout(r,50));
    }

    console.log("✅ All dependencies ready");

    // start live simulation
    window.realism.simulate();
    window.realism.simulateJoiner(45000,120000);
    setInterval(postLive, rand(12000,40000));

    // load historical chat
    await loadHistoryIncremental();

    // crowd bursts
    simulateCrowdBurst(200);

    console.log("✅ Live chat + historical messages + jump indicator running");
}

init();

})();
