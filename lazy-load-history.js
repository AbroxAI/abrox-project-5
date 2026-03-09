// history-loader-v13-full-synced.js — Fully synced hybrid loader + live + realism engine + identity + bubble renderer + joiners + multi-typing
(function(){
"use strict";

const SCROLL_BATCH_SIZE = 100;
let loading = false;
let liveInterval = null;

// Wait until engines + container ready
async function waitForReady(timeout=40000){
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

// Multi-persona typing
async function showTypingHeader(personas){
    if(!personas.length) return;
    for(const p of personas) if(window.TGRenderer?.showTyping) window.TGRenderer.showTyping(p);
    const duration = 500 + Math.min(Math.max(...personas.map(p=>p.name.length*50)), 2000);
    await new Promise(r=>setTimeout(r,duration));
    for(const p of personas) if(window.TGRenderer?.hideTyping) window.TGRenderer.hideTyping(p);
}

// Pick random reply target
function pickRandomReplyTarget(pool){
    if(!pool.length) return null;
    const recent = pool.slice(-50);
    return recent[Math.floor(Math.random()*recent.length)];
}

// Ensure pool has messages
function ensurePool(min=15000){
    if(!window.realism?.POOL) window.realism.POOL = [];
    while(window.realism.POOL.length < min){
        const item = window.realism.generateComment?.() || {text:"Hello!", type:"historical", timestamp:new Date(), persona:window.identity.getRandomPersona()};
        window.realism.POOL.push(item);
    }
}

// Post a single message fully synced
async function postRealismMessage(item, pool){
    const persona = item.persona || window.identity.getRandomPersona();

    // Random reply
    if(!item.parentId && pool && pool.length && Math.random()<0.5){
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

    // Typing header
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

    // Highlight joiner
    if(item.type==="joiner" && window.TGRenderer?.highlightMessage){
        window.TGRenderer.highlightMessage(item.id || `${Date.now()}_${Math.random()}`);
    }
}

// Load batch progressively
async function loadBatch(batch, pool){
    const simultaneousTypers=[];
    for(let i=0;i<Math.min(3,batch.length);i++){
        simultaneousTypers.push(batch[i].persona || window.identity.getRandomPersona());
    }
    if(simultaneousTypers.length) await showTypingHeader(simultaneousTypers);

    for(const item of batch){
        await postRealismMessage(item,pool);
        await new Promise(r=>setTimeout(r,50+Math.random()*150));
    }
}

// Prepare historical pool
async function prepareHistory(totalCount=15000){
    ensurePool(totalCount);
    const POOL = window.realism.POOL;
    POOL.sort((a,b)=>b.timestamp - a.timestamp);
    return POOL.splice(0,totalCount);
}

// Live injection
function startLiveInjection(pool){
    if(liveInterval) clearInterval(liveInterval);
    liveInterval = setInterval(async()=>{
        const item = window.realism.POOL.shift();
        if(item){
            await postRealismMessage(item,pool);
        }
    }, 3000 + Math.random()*4000);
}

// Full hybrid loader
async function setupHybridLoader(totalCount=15000){
    const ready = await waitForReady();
    if(!ready) return console.error("TGRenderer or container not ready");

    const history = await prepareHistory(totalCount);
    if(!history.length) return;

    const container = document.getElementById("tg-comments-container");

    // Initial batch
    await loadBatch(history.splice(0,SCROLL_BATCH_SIZE), history);

    // Progressive scroll
    container.addEventListener("scroll", async()=>{
        if(loading) return;
        const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
        if(distance < 300 && history.length){
            loading=true;
            const batch = history.splice(0,SCROLL_BATCH_SIZE);
            await loadBatch(batch, history);
            loading=false;
        }
    });

    // Start live
    startLiveInjection(history);
}

// Auto-init
async function initFullHistoryLoader(){
    await waitForReady();
    setupHybridLoader(15000);
}

// PUBLIC API
window.historyLoader={
    loadFullSyncedHistory: setupHybridLoader,
    initHybridLoader: initFullHistoryLoader
};

// Uncomment to auto-init
// initFullHistoryLoader();

})();
