// full-hybrid-loader-v22-fixed.js — Fully synced + correct dates + live + joiners
(function(){
"use strict";

let liveInterval = null;
let joinerInterval = null;
const SCROLL_BATCH_SIZE = 100;
const BASE_DATE = new Date(2025,7,14,10,0,0); // Aug 14, 2025

async function waitForReady(timeout=60000){
    let waited = 0;
    while((!window.realism?.postMessage ||
           !window.realism?.generateComment ||
           !window.realism?.generateThreadedJoinerReplies ||
           !window.identity?.getRandomPersona ||
           !window.identity?.SyntheticPool ||
           !window.TGRenderer?.appendMessage ||
           !window.TGRenderer?.showTyping ||
           !window.TGRenderer?.appendJoinSticker ||
           !window.queuedTyping ||
           !document.getElementById("tg-comments-container")) &&
           waited < timeout){
        await new Promise(r=>setTimeout(r,50));
        waited += 50;
    }
    return !!document.getElementById("tg-comments-container");
}

// Multi-persona typing
async function showTypingHeader(personas){
    if(!personas.length) return;
    for(const p of personas) window.TGRenderer.showTyping?.(p);
    const duration = 500 + Math.min(Math.max(...personas.map(p=>p.name.length*50)),2000);
    await new Promise(r=>setTimeout(r,duration));
    for(const p of personas) window.TGRenderer.hideTyping?.(p);
}

// Pick random reply target
function pickRandomReplyTarget(pool){
    if(!pool.length) return null;
    const recent = pool.slice(-50);
    return recent[Math.floor(Math.random()*recent.length)];
}

// Post a single message safely
async function postRealismMessage(item, pool){
    const persona = item.persona || window.identity.getRandomPersona();
    item.persona = persona;

    if(!item.parentId && pool && pool.length && Math.random()<0.5){
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
    if(item.type==="joiner" && window.TGRenderer?.highlightMessage) window.TGRenderer.highlightMessage(item.id);
}

// Generate historical pool with synced personas and correct timestamps
async function generateFullHistory(totalCount=20000){
    if(!window.realism?.POOL) window.realism.POOL = [];
    const now = Date.now();

    while(window.realism.POOL.length < totalCount){
        const comment = window.realism.generateComment();
        comment.persona = window.identity.getRandomPersona();
        const offset = (window.realism.POOL.length / totalCount) * (now - BASE_DATE.getTime());
        comment.timestamp = new Date(BASE_DATE.getTime() + offset);
        window.realism.POOL.push(comment);
    }

    const poolClone = window.realism.POOL.slice().sort((a,b)=>a.timestamp-b.timestamp);
    return poolClone;
}

// Sequentially render all messages to avoid renderer overload
async function renderFullHistory(pool){
    for(const item of pool){
        await postRealismMessage(item,pool);
        await new Promise(r=>setTimeout(r,20)); // tiny delay for smooth rendering
    }
}

// Live injection
function startLiveInjection(pool){
    if(liveInterval) clearInterval(liveInterval);
    liveInterval = setInterval(async()=>{
        if(!pool.length) return;
        const item = pool[Math.floor(Math.random()*pool.length)];
        await postRealismMessage({...item, timestamp:new Date()}, pool);
    }, 3000 + Math.random()*4000);
}

// Joiners
function startJoinerInjection(){
    if(joinerInterval) clearInterval(joinerInterval);
    joinerInterval = setInterval(async()=>{
        const persona = window.identity.getRandomPersona();
        const joinerItem = {text:`${persona.name} joined the chat!`, type:"joiner", timestamp:new Date(), persona};
        window.realism.POOL.push(joinerItem);
        await postRealismMessage(joinerItem, window.realism.POOL);
    }, 20000 + Math.random()*10000);
}

// Full loader
async function setupFullHybridLoader(){
    const ready = await waitForReady();
    if(!ready) return console.error("Engines or container not ready");

    const container = document.getElementById("tg-comments-container");
    const history = await generateFullHistory();

    await renderFullHistory(history);

    startLiveInjection(history);
    startJoinerInjection();
}

// PUBLIC API
window.historyLoader = {
    loadFullSyncedHistory: setupFullHybridLoader,
    initHybridLoader: setupFullHybridLoader
};

// Uncomment to auto-init
// setupFullHybridLoader();

})();
