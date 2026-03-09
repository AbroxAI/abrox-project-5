// history-loader-v16-full-synced.js — Fully synced hybrid loader + live + joiners + multi-typing
(function(){
"use strict";

const SCROLL_BATCH_SIZE = 100;
let loading = false;
let liveInterval = null;
let joinerInterval = null;

// Wait until all engines + container ready
async function waitForReady(timeout = 40000){
    let waited = 0;
    while((!window.realism?.postMessage ||
           !window.identity?.getRandomPersona ||
           !window.TGRenderer?.appendMessage ||
           !document.getElementById("tg-comments-container")) &&
           waited < timeout){
        await new Promise(r=>setTimeout(r,50));
        waited += 50;
    }
    return !!document.getElementById("tg-comments-container");
}

// Show multiple personas typing simultaneously
async function showTypingHeader(personas){
    if(!personas.length) return;
    for(const p of personas) if(window.TGRenderer?.showTyping) window.TGRenderer.showTyping(p);
    const duration = 500 + Math.min(Math.max(...personas.map(p=>p.name.length*50)), 2000);
    await new Promise(r=>setTimeout(r,duration));
    for(const p of personas) if(window.TGRenderer?.hideTyping) window.TGRenderer.hideTyping(p);
}

// Pick a random historical message to reply to
function pickRandomReplyTarget(pool){
    if(!pool.length) return null;
    const recent = pool.slice(-50);
    return recent[Math.floor(Math.random()*recent.length)];
}

// Ensure pool has enough messages
function ensurePool(min=15000){
    if(!window.realism?.POOL) window.realism.POOL = [];
    while(window.realism.POOL.length < min){
        let item;
        if(Math.random() < 0.05){
            // Joiner
            const persona = window.identity.getRandomPersona();
            item = {text:`${persona.name} joined the chat!`, type:"joiner", timestamp:new Date(), persona};
        } else {
            // Historical comment
            item = window.realism.generateComment?.() || 
                   {text:"Hello!", type:"historical", timestamp:new Date(), persona:window.identity.getRandomPersona()};
        }
        item.id = `msg_${Date.now()}_${Math.floor(Math.random()*100000)}`;
        window.realism.POOL.push(item);
    }
}

// Post a single message via realism engine
async function postRealismMessage(item, pool){
    const persona = item.persona || window.identity.getRandomPersona();

    // Random reply preview
    if(!item.parentId && pool && pool.length && Math.random() < 0.5){
        const target = pickRandomReplyTarget(pool);
        if(target){
            item.parentId = target.id;
            item.replyToText = target.text;
        }
    }

    // Join sticker for joiners
    if(item.type==="joiner"){
        await window.TGRenderer.appendJoinSticker([persona]);
    }

    // Show typing header
    await showTypingHeader([persona]);

    // Post via realism engine
    await window.realism.postMessage({
        ...item,
        persona,
        timestamp:item.timestamp||new Date(),
        type:item.type||"incoming",
        parentId:item.parentId||null,
        replyToText:item.replyToText||null,
        disableImages:true
    });

    // Threaded replies for joiners
    if(item.type==="joiner"){
        await window.realism.generateThreadedJoinerReplies({...item, persona});
    }

    // Highlight joiner messages
    if(item.type==="joiner" && window.TGRenderer?.highlightMessage){
        window.TGRenderer.highlightMessage(item.id);
    }
}

// Load batch progressively
async function loadBatch(batch, pool){
    // Show 2–3 simultaneous typers
    const simultaneousTypers = [];
    for(let i=0;i<Math.min(3,batch.length);i++){
        simultaneousTypers.push(batch[i].persona || window.identity.getRandomPersona());
    }
    if(simultaneousTypers.length) await showTypingHeader(simultaneousTypers);

    for(const item of batch){
        await postRealismMessage(item, pool);
        await new Promise(r=>setTimeout(r,50+Math.random()*150));
    }
}

// Prepare historical pool without removing items
async function prepareHistory(totalCount=15000){
    ensurePool(totalCount);
    const POOL = window.realism.POOL.slice();
    POOL.sort((a,b)=>b.timestamp - a.timestamp);
    return POOL.slice(0,totalCount);
}

// Inject live messages dynamically
function startLiveInjection(pool){
    if(liveInterval) clearInterval(liveInterval);
    liveInterval = setInterval(async()=>{
        if(!window.realism?.POOL || !window.realism.POOL.length) return;
        const item = window.realism.POOL[Math.floor(Math.random()*window.realism.POOL.length)];
        await postRealismMessage({...item, timestamp:new Date()}, pool);
    }, 3000 + Math.random()*4000);
}

// Inject new joiners periodically
function startJoinerInjection(pool){
    if(joinerInterval) clearInterval(joinerInterval);
    joinerInterval = setInterval(async()=>{
        const persona = window.identity.getRandomPersona();
        const joinerItem = {text:`${persona.name} joined the chat!`, type:"joiner", timestamp:new Date(), persona};
        window.realism.POOL.push(joinerItem);
        await postRealismMessage(joinerItem, pool);
    }, 20000 + Math.random()*10000);
}

// Full hybrid loader
async function setupHybridLoader(totalCount=15000){
    const ready = await waitForReady();
    if(!ready) return console.error("TGRenderer or container not ready");

    const history = await prepareHistory(totalCount);
    if(!history.length) return;

    const container = document.getElementById("tg-comments-container");

    // Load initial batch
    await loadBatch(history.splice(0, SCROLL_BATCH_SIZE), history);

    // Progressive scroll loading
    container.addEventListener("scroll", async()=>{
        if(loading) return;
        const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
        if(distance < 300 && history.length){
            loading = true;
            const batch = history.splice(0, SCROLL_BATCH_SIZE);
            await loadBatch(batch, history);
            loading = false;
        }
    });

    // Start live + joiners
    startLiveInjection(history);
    startJoinerInjection(history);
}

// Auto-init loader
async function initFullHistoryLoader(){
    await waitForReady();
    setupHybridLoader(15000);
}

// PUBLIC API
window.historyLoader={
    loadFullSyncedHistory: setupHybridLoader,
    initHybridLoader: initFullHistoryLoader
};

// Auto-init optional
// initFullHistoryLoader();

})();
