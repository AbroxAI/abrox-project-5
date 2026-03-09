// history-loader-v11-live-full-synced.js — Fully synced hybrid loader + live + realism engine + identity + bubble renderer + joiners + multi-typing
(function(){
"use strict";

const SCROLL_BATCH_SIZE = 100;
let loading = false;
let liveInterval = null;

// Show multiple personas typing simultaneously
async function showTypingHeader(personas){
    if(!personas || !personas.length) return;
    for(const p of personas){
        if(window.TGRenderer?.showTyping) window.TGRenderer.showTyping(p);
    }
    const duration = 500 + Math.min(Math.max(...personas.map(p=>p.name.length*50)), 2000);
    await new Promise(r => setTimeout(r, duration));
    for(const p of personas){
        if(window.TGRenderer?.hideTyping) window.TGRenderer.hideTyping(p);
    }
}

// Pick a random historical message to reply to
function pickRandomReplyTarget(pool){
    if(!pool.length) return null;
    const recent = pool.slice(-50);
    return recent[Math.floor(Math.random()*recent.length)];
}

// Post a single message via realism engine
async function postRealismMessage(item, pool){
    const persona = item.persona || window.identity.getRandomPersona();

    // Randomly reply to a historical message
    if(!item.parentId && pool && pool.length && Math.random() < 0.5){
        const target = pickRandomReplyTarget(pool);
        if(target){
            item.parentId = target.id;
            item.replyToText = target.text;
        }
    }

    // Join sticker for joiners
    if(item.type === "joiner"){
        await window.TGRenderer.appendJoinSticker([persona]);
    }

    // Show typing header with multiple simultaneous typers
    await showTypingHeader([persona]);

    // Post message via realism engine
    await window.realism.postMessage({
        ...item,
        persona,
        timestamp: item.timestamp || new Date(),
        type: item.type || "incoming",
        parentId: item.parentId || null,
        replyToText: item.replyToText || null,
        disableImages: true
    });

    // Threaded replies for joiners
    if(item.type === "joiner"){
        await window.realism.generateThreadedJoinerReplies({...item, persona});
    }

    // Highlight joiner messages dynamically
    if(item.type === "joiner" && window.TGRenderer?.highlightMessage){
        window.TGRenderer.highlightMessage(item.id || `${Date.now()}_${Math.random()}`);
    }
}

// Load a batch progressively
async function loadBatch(batch, pool){
    // Randomly simulate multiple people typing simultaneously
    const simultaneousTypers = [];
    if(batch.length > 1){
        for(let i=0;i<Math.min(3,batch.length);i++){
            simultaneousTypers.push(batch[i].persona || window.identity.getRandomPersona());
        }
    }

    if(simultaneousTypers.length){
        await showTypingHeader(simultaneousTypers);
    }

    for(const item of batch){
        await postRealismMessage(item, pool);
        await new Promise(r=>setTimeout(r,50 + Math.random()*150));
    }
}

// Prepare historical pool
async function prepareHistory(totalCount = 15000){
    if(!window.realism?.POOL) return [];
    if(window.realism.ensurePool) window.realism.ensurePool(totalCount);

    const POOL = window.realism.POOL;
    POOL.sort((a,b)=>b.timestamp - a.timestamp); // recent-first
    return POOL.splice(0,totalCount);
}

// Inject live messages dynamically
function startLiveInjection(pool){
    if(liveInterval) clearInterval(liveInterval);
    liveInterval = setInterval(async ()=>{
        const item = window.realism.POOL.shift();
        if(item){
            await postRealismMessage(item,pool);
        }
    }, 3000 + Math.random()*4000);
}

// Progressive scroll + live + threaded realism + multi-typing
async function setupHybridLoader(totalCount = 15000){
    const history = await prepareHistory(totalCount);
    if(!history.length) return;

    const container = document.getElementById("tg-comments-container");
    if(!container) return;

    // Initial batch
    await loadBatch(history.splice(0,SCROLL_BATCH_SIZE), history);

    // Scroll progressive loading
    container.addEventListener("scroll", async ()=>{
        if(loading) return;
        const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
        if(distance < 300 && history.length){
            loading = true;
            const batch = history.splice(0,SCROLL_BATCH_SIZE);
            await loadBatch(batch, history);
            loading = false;
        }
    });

    // Start live message injection
    startLiveInjection(history);
}

// Wait for engines
async function waitForEngineReady(timeout = 30000){
    let waited=0;
    while((!window.realism?.postMessage || !window.TGRenderer?.appendMessage || !window.identity?.getRandomPersona) && waited<timeout){
        await new Promise(r=>setTimeout(r,50));
        waited+=50;
    }
    return true;
}

// Auto-init loader
async function initFullHistoryLoader(){
    await waitForEngineReady();
    setupHybridLoader(15000);
}

// PUBLIC API
window.historyLoader = {
    loadFullSyncedHistory: setupHybridLoader,
    initHybridLoader: initFullHistoryLoader
};

// Auto-init optional
// initFullHistoryLoader();

})();
