// full-hybrid-history-loader-fixed.js
(async function(){
"use strict";

const SCROLL_BATCH_SIZE = 50;
let loading = false;
let liveInterval = null;
let joinerInterval = null;
const BASE_DATE = new Date(2025,7,14,10,0,0);

async function waitForEngines(timeout=40000){
    let waited = 0;
    while((!window.realism?.postMessage || 
           !window.TGRenderer?.appendMessage || 
           !window.identity?.SyntheticPool?.length) && waited < timeout){
        await new Promise(r=>setTimeout(r,50));
        waited += 50;
    }
    return window.realism && window.TGRenderer && window.identity.SyntheticPool.length;
}

function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function maybe(p){ return Math.random()<p; }
function rand(max){ return Math.floor(Math.random()*max); }

async function showTypingHeader(personas){
    if(!personas?.length) return;
    for(const p of personas) window.TGRenderer.showTyping?.(p);
    const duration = 500 + Math.min(Math.max(...personas.map(p=>p.name.length*50)), 2000);
    await new Promise(r=>setTimeout(r,duration));
    for(const p of personas) window.TGRenderer.hideTyping?.(p);
}

function pickRandomReplyTarget(pool){
    if(!pool.length) return null;
    return pool.slice(-50)[rand(50)];
}

async function postMessage(item, pool){
    const persona = item.persona || window.identity.getRandomPersona();

    if(!item.parentId && pool.length && maybe(0.5)){
        const target = pickRandomReplyTarget(pool);
        if(target){ item.parentId = target.id; item.replyToText = target.text; }
    }

    if(item.type==="joiner") await window.TGRenderer.appendJoinSticker([persona]);

    await showTypingHeader([persona]);

    await window.realism.postMessage({
        ...item,
        persona,
        timestamp: item.timestamp || new Date(),
        type: item.type || "incoming",
        parentId: item.parentId || null,
        replyToText: item.replyToText || null,
        disableImages:true
    });

    if(item.type==="joiner") await window.realism.generateThreadedJoinerReplies({...item, persona});
}

async function generateFullHistory(count=10000){
    if(!window.realism.POOL) window.realism.POOL = [];
    while(window.realism.POOL.length<count){
        const comment = window.realism.generateComment();
        comment.timestamp = new Date(BASE_DATE.getTime() + window.realism.POOL.length*1000); // progressive
        window.realism.POOL.push(comment);
    }
    return window.realism.POOL.slice();
}

async function loadHistoryBatch(pool){
    for(let i=0;i<pool.length;i+=SCROLL_BATCH_SIZE){
        const batch = pool.slice(i,i+SCROLL_BATCH_SIZE);
        for(const item of batch) await postMessage(item,pool);
        await new Promise(r=>setTimeout(r,50));
    }
}

async function startLive(pool){
    liveInterval = setInterval(async ()=>{
        const item = pool[rand(pool.length)];
        await postMessage({...item, timestamp:new Date()}, pool);
    }, 2000 + rand(3000));
}

async function startJoiners(){
    joinerInterval = setInterval(async ()=>{
        const persona = window.identity.getRandomPersona();
        const joiner = { text:`${persona.name} joined!`, type:"joiner", timestamp:new Date(), persona };
        window.realism.POOL.push(joiner);
        await postMessage(joiner, window.realism.POOL);
    }, 25000 + rand(10000));
}

async function initFullHistoryLoader(){
    const ready = await waitForEngines();
    if(!ready) return console.error("Engines not ready");

    if(!window.realism.started){ 
        window.realism.simulate?.(); 
        window.realism.started = true; 
    }

    const container = document.getElementById("tg-comments-container");
    const history = await generateFullHistory(15000);

    await loadHistoryBatch(history);
    startLive(history);
    startJoiners();

    container.addEventListener("scroll", async ()=>{
        if(loading) return;
        const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
        if(distance<300 && history.length){
            loading = true;
            await loadHistoryBatch(history.splice(0,SCROLL_BATCH_SIZE));
            loading = false;
        }
    });
}

window.historyLoader = {
    initFullHistory: initFullHistoryLoader
};

// Auto-start
// initFullHistoryLoader();

})();
