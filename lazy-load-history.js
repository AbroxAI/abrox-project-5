(async function(){
"use strict";

const START_DATE = new Date(2025,7,14);
const END_DATE = new Date(Date.now()-86400000);
const TOTAL_HISTORICAL = 50000;
const CHUNK_SIZE = 200;
const CHUNK_DELAY = 50;

let container = document.getElementById('tg-comments-container');
let jumpIndicator = document.getElementById('tg-jump-indicator');
let jumpText = document.getElementById('tg-jump-text');
let unseenCount = 0;

function rand(a,b){ return Math.floor(Math.random()*(b-a)+a); }
function maybe(p){ return Math.random()<p; }
function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

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

// --- generate timeline
function generateTimeline(total){
    const items=[];
    let day = new Date(START_DATE);
    while(day <= END_DATE && items.length < total){
        const count = activity();
        for(let i=0;i<count;i++){
            const time = timestamp(day);
            if(maybe(0.12) && window.identity?.getRandomPersona){
                items.push({type:"join", persona:window.identity.getRandomPersona(), timestamp:time});
            } else {
                items.push({type:"chat", timestamp:time});
            }
            if(items.length >= total) break;
        }
        day.setDate(day.getDate()+1);
    }
    return items.sort((a,b)=>a.timestamp-b.timestamp);
}

// --- post historic
async function postHistoric(item){
    const persona = item.persona || window.identity.getRandomPersona();
    const text = item.type === "join" 
        ? `${persona.name} joined the group` 
        : window.realism.generateConversation?.()?.text || "Historic message";

    window.realism.POOL = window.realism.POOL || [];
    window.realism.POOL.push({ text, timestamp: item.timestamp, persona });

    // prepend as historic type
    const msgId = `hist_${Date.now()}_${rand(9999)}`;
    window.TGRenderer.prependMessage(persona, text, { timestamp: item.timestamp, type:"historic", id: msgId });
    item.id = msgId;

    if(item.type === "join" && window.realism.generateThreadedJoinerReplies){
        await window.realism.generateThreadedJoinerReplies({ persona, id: msgId });
    }
}

// --- load history in chunks
async function loadHistoryInChunks(){
    const timeline = generateTimeline(TOTAL_HISTORICAL);
    for(let i=0; i<timeline.length; i+=CHUNK_SIZE){
        const chunk = timeline.slice(i, i+CHUNK_SIZE);
        await Promise.all(chunk.map(postHistoric));
        await new Promise(r=>setTimeout(r, CHUNK_DELAY));
    }
    container.scrollTop = 0; // oldest at top
    console.log(`✅ Full historical chat loaded (${timeline.length} messages)`);
}

// --- live messages
async function liveMessage(){
    const convo = window.realism.generateConversation?.() || {text:"", persona:window.identity.getRandomPersona()};
    await window.queuedTyping(convo.persona, convo.text);

    const scrollAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 80;
    window.TGRenderer.appendMessage(convo.persona, convo.text, {timestamp:new Date(), type:"incoming", bubblePreview:true});
    if(scrollAtBottom){ container.scrollTop = container.scrollHeight; }
    else { unseenCount++; updateJump(); showJump(); }
}

// --- ensure pool
function ensurePool(min=10000){
    window.realism.POOL = window.realism.POOL || [];
    while(window.realism.POOL.length < min){
        window.realism.POOL.push(window.realism.generateComment());
        if(window.realism.POOL.length>50000) break;
    }
}

// --- burst crowd
async function simulateCrowdBurst(total=150){
    ensurePool(total);
    while(total>0 && window.realism.POOL.length>0){
        const burstCount = rand(3,8);
        const burst = window.realism.POOL.splice(0,burstCount);
        await Promise.all(burst.map(item=>window.realism.postMessage(item)));
        await new Promise(r=>setTimeout(r,rand(100,500)));
    }
}

// --- init
async function init(){
    // wait for core systems
    while(!window.identity?.SyntheticPool?.length || !window.TGRenderer?.prependMessage || !window.TGRenderer?.appendMessage || !window.queuedTyping || !window.realism?.simulate){
        await new Promise(r=>setTimeout(r,50));
    }

    if(window.realism?.OLD_POOL) window.realism.injectHistoricalPool(window.realism.OLD_POOL);

    // --- load historical first
    await loadHistoryInChunks();

    // --- then start realism live
    ensurePool(20000);
    simulateCrowdBurst(200);
    setInterval(liveMessage, rand(12000,40000));
    window.realism.simulate();
    window.realism.simulateJoiner(45000,120000);

    console.log("✅ Fully synced: historical + full realism pool + live + burst + threaded replies");
}

init();
})();
