(function(){
"use strict";

const SCROLL_BATCH_SIZE = 100;
let loading = false;
let liveInterval = null;

// Simulate typing for a persona
async function simulateTyping(persona, text){
    if(window.queuedTyping) return window.queuedTyping(persona, text);
    return new Promise(r => setTimeout(r, Math.min(300 + text.length*20, 1200)));
}

// Pick a random historical message to reply to (for realism)
function pickRandomReplyTarget(pool){
    if(!pool.length) return null;
    const recent = pool.slice(-50); // limit to recent 50 for relevance
    return recent[Math.floor(Math.random()*recent.length)];
}

// Post a single message with full realism
async function postRealismMessage(item, pool){
    // 50% chance live messages reply to a historical one
    if(!item.parentId && pool && pool.length && Math.random()<0.5){
        const target = pickRandomReplyTarget(pool);
        if(target){
            item.parentId = target.id;
            item.replyToText = target.text;
        }
    }

    if(item.type === "joiner"){
        await window.TGRenderer.appendJoinSticker([item.persona]);
    }

    await simulateTyping(item.persona || window.identity.getRandomPersona(), item.text);
    await window.realism.postMessage(item);
    if(item.type === "joiner"){
        await window.realism.generateThreadedJoinerReplies(item);
    }
}

// Load a batch of messages progressively
async function loadBatch(batch, pool){
    for(const item of batch){
        await postRealismMessage(item, pool);
        await new Promise(r => setTimeout(r, 50 + Math.random()*150));
    }
}

// Prepare full history pool
async function prepareHistory(totalCount = 15000){
    if(!window.realism?.POOL) return [];
    if(window.realism.ensurePool) window.realism.ensurePool(totalCount);

    const POOL = window.realism.POOL;
    POOL.sort((a,b)=>b.timestamp - a.timestamp); // recent-first
    return POOL.splice(0, totalCount);
}

// Inject live messages dynamically
function startLiveInjection(pool){
    if(liveInterval) clearInterval(liveInterval);
    liveInterval = setInterval(async ()=>{
        const item = window.realism.POOL.shift();
        if(item){
            await postRealismMessage(item, pool);
        }
    }, 5000 + Math.random()*5000); // every 5–10s
}

// Progressive scroll + auto-load + live simulation
async function setupThreadedHybridLoader(totalCount = 15000){
    const history = await prepareHistory(totalCount);
    if(!history.length) return;

    const container = document.getElementById("tg-comments-container");
    if(!container) return;

    // Initial batch
    await loadBatch(history.splice(0, SCROLL_BATCH_SIZE), history);

    // Scroll-based progressive loading
    container.addEventListener("scroll", async ()=>{
        if(loading) return;
        const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
        if(distance < 300 && history.length){
            loading = true;
            const batch = history.splice(0, SCROLL_BATCH_SIZE);
            await loadBatch(batch, history);
            loading = false;
        }
    });

    // Start live message injection
    startLiveInjection(history);
}

// Wait for all engines ready
async function waitForEngineReady(timeout = 30000){
    let waited = 0;
    while((!window.realism?.postMessage || !window.TGRenderer?.appendMessage || !window.identity?.getRandomPersona) && waited < timeout){
        await new Promise(r => setTimeout(r,50));
        waited += 50;
    }
    return true;
}

// Auto-init threaded hybrid loader
async function initThreadedHybridLoader(){
    await waitForEngineReady();
    setupThreadedHybridLoader(15000);
}

// PUBLIC API
window.historyLoader = {
    loadFullSyncedHistory: setupThreadedHybridLoader,
    initHybridLoader: initThreadedHybridLoader
};

// Auto-init (optional)
// initThreadedHybridLoader();

})();
