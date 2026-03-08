// lazy-load-history.js — Full historical replay + v25 Ultra Live integration
(function(){
"use strict";

/* =====================================================
   SETTINGS
===================================================== */
const HISTORY_SPEED_MIN = 30;   // min delay between messages in ms
const HISTORY_SPEED_MAX = 120;  // max delay between messages in ms
const MAX_HISTORY = 50000;      // max messages to replay
const USE_REAL_TIMESTAMPS = true;

/* =====================================================
   UTILS
===================================================== */
function rand(min,max){return Math.floor(Math.random()*(max-min)+min);}
function maybe(p){return Math.random()<p;}
function random(arr){return arr[Math.floor(Math.random()*arr.length)];}
function delay(ms){return new Promise(r=>setTimeout(r,ms));}
function hash(str){let h=5381; for(let i=0;i<str.length;i++){h=((h<<5)+h)+str.charCodeAt(i);} return (h>>>0).toString(36);}

/* =====================================================
   DUPLICATE CHECK
===================================================== */
const GENERATED = new Set();
const QUEUE = [];
function mark(text){
    const fp = hash(text.toLowerCase());
    if(GENERATED.has(fp)) return false;
    GENERATED.add(fp);
    QUEUE.push(fp);
    while(QUEUE.length>150000) GENERATED.delete(QUEUE.shift());
    return true;
}

/* =====================================================
   HISTORICAL REPLAY ENGINE
===================================================== */
async function replayHistoricalPool(oldPool){
    if(!Array.isArray(oldPool) || oldPool.length===0) return;

    // Sort by timestamp to preserve order
    const poolCopy = oldPool.slice(0, MAX_HISTORY)
        .sort((a,b)=> new Date(a.timestamp)-new Date(b.timestamp));

    console.log(`[Realism] Replaying historical pool: ${poolCopy.length} messages`);

    let lastTime = Date.now();
    for(const item of poolCopy){
        if(!item.text || !mark(item.text)) continue;

        // Determine delay
        const itemTime = USE_REAL_TIMESTAMPS ? new Date(item.timestamp).getTime() : Date.now();
        let delayMs = Math.max(HISTORY_SPEED_MIN, Math.min(HISTORY_SPEED_MAX, itemTime - lastTime));
        await delay(delayMs);
        lastTime = itemTime;

        await postHistoricalMessage(item);
    }
    console.log("[Realism] Historical replay finished");
}

/* =====================================================
   POST HISTORICAL MESSAGE
===================================================== */
async function postHistoricalMessage(item){
    if(!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage) return;

    const persona = item.persona || window.identity.getRandomPersona();
    const text = item.text;
    const timestamp = USE_REAL_TIMESTAMPS ? (item.timestamp || new Date()) : new Date();
    const msgId = `history_${Date.now()}_${rand(9999)}`;

    // Show typing before posting
    await window.queuedTyping(persona, text);

    // Post message
    window.TGRenderer.appendMessage(persona, text, {
        timestamp: timestamp,
        type: item.type || "incoming",
        id: msgId
    });

    item.id = msgId;

    // Inline reactions
    if(maybe(0.4)) simulateReactions(msgId, rand(1,3));

    // Threaded joiner replies if message is a joiner
    if(item.type==="joiner" && window.realism?.generateThreadedJoinerReplies){
        window.realism.generateThreadedJoinerReplies({id: msgId, persona: persona});
    }
}

/* =====================================================
   REACTIONS
===================================================== */
async function simulateReactions(messageId, count=1){
    if(!window.TGRenderer?.appendReaction) return;
    for(let i=0;i<count;i++){
        const reaction = random(window.realism?.REACTIONS || ["👍","❤️","😂","😮"]);
        window.TGRenderer.appendReaction(messageId, reaction);
        await delay(rand(150,800));
    }
}

/* =====================================================
   HISTORICAL POOL INJECTION
===================================================== */
function injectHistoricalPool(oldPool){
    if(!Array.isArray(oldPool)) return;
    window.realism.POOL = window.realism.POOL || [];
    for(const item of oldPool){
        if(item.text && mark(item.text)){
            window.realism.POOL.push(item);
        }
    }
}

/* =====================================================
   PUBLIC API
===================================================== */
window.realism.loadHistoricalPool = replayHistoricalPool;
window.realism.injectHistoricalPool = injectHistoricalPool;

/* =====================================================
   AUTO LOAD HISTORICAL POOL
===================================================== */
(async function autoLoadHistoricalPool(){
    if(window.realism?.OLD_POOL){
        injectHistoricalPool(window.realism.OLD_POOL);
        await replayHistoricalPool(window.realism.OLD_POOL);
    }
})();
})();
