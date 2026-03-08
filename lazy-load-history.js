// realism-history-replay.js — Super real-time historical replay for v25 Ultra Live
(function(){
"use strict";

/* =====================================================
   SETTINGS
===================================================== */
const HISTORY_SPEED_MIN = 30; // min delay between messages in ms
const HISTORY_SPEED_MAX = 120; // max delay between messages in ms
const MAX_HISTORY = 50000;
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
    const fp=hash(text.toLowerCase());
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
    const poolCopy = oldPool.slice(0, MAX_HISTORY).sort((a,b)=> new Date(a.timestamp)-new Date(b.timestamp));
    console.log(`[Realism] Starting historical replay: ${poolCopy.length} messages`);

    let lastTime = Date.now();
    for(const item of poolCopy){
        if(!item.text || !mark(item.text)) continue;

        // Calculate delay based on historical timestamp or random
        const itemTime = USE_REAL_TIMESTAMPS ? new Date(item.timestamp).getTime() : Date.now();
        let delayMs = Math.max(HISTORY_SPEED_MIN, Math.min(HISTORY_SPEED_MAX, itemTime - lastTime));
        await delay(delayMs);
        lastTime = itemTime;

        await postHistoricalMessage(item);
    }
    console.log("[Realism] Historical replay finished");
}

/* =====================================================
   POST MESSAGE
===================================================== */
async function postHistoricalMessage(item){
    if(!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage) return;

    const persona = item.persona || window.identity.getRandomPersona();
    const text = item.text;
    const timestamp = USE_REAL_TIMESTAMPS ? (item.timestamp || new Date()) : new Date();
    const msgId = `history_${Date.now()}_${rand(9999)}`;

    await window.queuedTyping(persona,text);
    window.TGRenderer.appendMessage(persona,text,{
        timestamp: timestamp,
        type: item.type || "incoming",
        id: msgId
    });

    item.id = msgId;

    // Inline reactions
    if(maybe(0.4)) simulateReactions(msgId, rand(1,3));

    // Threaded joiner replies if joiner
    if(item.type==="joiner" && window.realism?.generateThreadedJoinerReplies){
        window.realism.generateThreadedJoinerReplies({id: msgId, persona: persona});
    }
}

/* =====================================================
   REACTIONS
===================================================== */
async function simulateReactions(messageId,count=1){
    if(!window.TGRenderer?.appendReaction) return;
    for(let i=0;i<count;i++){
        const reaction = random(window.realism?.REACTIONS || ["👍","❤️","😂","😮"]);
        window.TGRenderer.appendReaction(messageId,reaction);
        await delay(rand(150,800));
    }
}

/* =====================================================
   PUBLIC API
===================================================== */
window.realism.replayHistoricalPool = replayHistoricalPool;
window.realism.HISTORY_SPEED_MIN = HISTORY_SPEED_MIN;
window.realism.HISTORY_SPEED_MAX = HISTORY_SPEED_MAX;
window.realism.MAX_HISTORY = MAX_HISTORY;
window.realism.USE_REAL_TIMESTAMPS = USE_REAL_TIMESTAMPS;

/* =====================================================
   AUTO-REPLAY (optional)
===================================================== */
if(window.realism?.OLD_POOL){
    replayHistoricalPool(window.realism.OLD_POOL).then(()=>console.log("[Realism] Super real-time replay finished"));
}

})();
