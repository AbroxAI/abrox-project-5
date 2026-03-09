// realism-history-live-recent-first-v7.js — Burst crowd + fully preloaded + simultaneous threads + instant reactions
(function(){
"use strict";

/* =====================================================
CONFIG
===================================================== */
const START_DATE = new Date(2025,7,14);
const END_DATE = new Date();
const TARGET_MESSAGES = 5000;

/* =====================================================
UTILS
===================================================== */
function rand(a,b){ return Math.floor(Math.random()*(b-a)+a); }
function maybe(p){ return Math.random()<p; }
function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

/* =====================================================
SCROLL / JUMP CONTROL
===================================================== */
let unseenCount = 0;
let jumpIndicator, jumpText, container;

function updateJump(){
    if(!jumpText) return;
    jumpText.textContent = unseenCount>1 ? `New messages · ${unseenCount}` : 'New messages';
}
function showJump(){ jumpIndicator?.classList.remove('hidden'); }
function hideJump(){ unseenCount=0; updateJump(); jumpIndicator?.classList.add('hidden'); }
function handleScroll(){
    if(!container) return;
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    if(distance < 80) hideJump();
}

/* =====================================================
TIMESTAMP ENGINE
===================================================== */
let lastTime=0;
function timestamp(day){
    let t = new Date(day.getFullYear(), day.getMonth(), day.getDate(),
                     rand(7,22), rand(0,60), rand(0,60));
    if(t.getTime() <= lastTime) t = new Date(lastTime + rand(15000,90000));
    lastTime = t.getTime();
    return t;
}

/* =====================================================
BUSY DAY DISTRIBUTION
===================================================== */
function activity(){
    const r=Math.random();
    if(r<0.45) return rand(3,8);
    if(r<0.75) return rand(10,25);
    if(r<0.95) return rand(60,120);
    return rand(150,220);
}

/* =====================================================
HISTORY GENERATION
===================================================== */
function generateTimeline(){
    const items=[];
    let day = new Date(START_DATE);
    while(day<=END_DATE && items.length<TARGET_MESSAGES){
        const count = activity();
        for(let i=0;i<count;i++){
            const time = timestamp(day);
            if(maybe(0.12) && window.identity?.getRandomPersona){
                items.push({type:"join", persona:window.identity.getRandomPersona(), timestamp:time});
            } else {
                items.push({type:"chat", timestamp:time});
            }
            if(items.length>=TARGET_MESSAGES) break;
        }
        day.setDate(day.getDate()+1);
    }
    return items.sort((a,b)=>b.timestamp-a.timestamp);
}

/* =====================================================
HISTORICAL PRELOAD
===================================================== */
async function preloadHistory(){
    const timeline = generateTimeline();
    const reactionQueue = [];
    const joinerThreads = [];
    const scrollAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 80;

    for(const item of timeline){
        if(item.type==="join"){
            window.TGRenderer?.prependMessage?.(
                item.persona,
                `${item.persona.name} joined the group`,
                {timestamp:item.timestamp, type:"system", event:"join"}
            );
            reactionQueue.push(item.persona.name+"-join");
            if(window.realism?.generateThreadedJoinerReplies){
                joinerThreads.push({persona:item.persona, timestamp:item.timestamp});
            }
        } else if(window.realism?.generateConversation){
            const convo = window.realism.generateConversation();
            const persona = convo.persona || window.identity?.getRandomPersona();
            const id = "m_"+Math.random().toString(36).slice(2);

            window.TGRenderer?.prependMessage?.(persona, convo.text,{
                id,
                timestamp:item.timestamp,
                type:"historic",
                bubblePreview:true
            });

            reactionQueue.push(id);
        }
    }

    // Instant reactions
    reactionQueue.forEach(id=>{
        if(window.realism?.simulateInlineReactions) window.realism.simulateInlineReactions(id, rand(1,4));
    });

    // Run all joiner threads simultaneously
    await Promise.all(joinerThreads.map(j => window.realism.generateThreadedJoinerReplies(j)));

    if(!scrollAtBottom){
        unseenCount = reactionQueue.length;
        updateJump();
        showJump();
    }

    console.log("✅ Realism historical chat fully preloaded with burst-ready threads and reactions");
}

/* =====================================================
LIVE MESSAGES
===================================================== */
async function liveMessage(){
    if(!window.realism?.generateConversation) return;
    const convo = window.realism.generateConversation();
    const persona = convo.persona || window.identity?.getRandomPersona();

    await window.queuedTyping(persona, convo.text);

    const scrollAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 80;

    window.TGRenderer?.appendMessage?.(persona, convo.text,{
        timestamp:new Date(),
        type:"incoming",
        bubblePreview:true
    });

    if(scrollAtBottom) container.scrollTop = container.scrollHeight;
    else { unseenCount++; updateJump(); showJump(); }
}

/* =====================================================
POST MESSAGE
===================================================== */
async function postMessage(item){
    if(!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage) return;
    const persona = item.persona || window.identity?.getRandomPersona();
    if(!persona) return;

    let text = item.type==="joiner" ? item.text : (Math.random()<0.45 ? generateRoleMessage?.(persona) || item.text : item.text);
    await window.queuedTyping(persona, text);

    const msgId=`realism_${item.type||"msg"}_${Date.now()}_${rand(9999)}`;
    window.TGRenderer?.appendMessage?.(persona,text,{
        timestamp:item.timestamp||new Date(),
        type:item.type||"incoming",
        id:msgId,
        bubblePreview:true
    });
    item.id=msgId;
    if(maybe(0.3)) await simulateReactions({id:msgId}, rand(1,3));
}

/* =====================================================
REACTIONS HELPERS
===================================================== */
async function simulateInlineReactions(messageId,count=1){
    for(let i=0;i<count;i++){
        const reaction=random(REACTIONS);
        window.TGRenderer?.appendReaction?.(messageId, reaction);
    }
}
async function simulateReactions(message,count=1){
    for(let i=0;i<count;i++){
        const reaction=random(REACTIONS);
        window.TGRenderer?.appendReaction?.(message.id || `realism_${Date.now()}_${rand(9999)}`, reaction);
    }
}

/* =====================================================
POOL MANAGEMENT + BURST CROWD
===================================================== */
function ensurePool(min=10000){
    window.realism.POOL = window.realism.POOL || [];
    const POOL = window.realism.POOL;
    while(POOL.length<min){
        POOL.push(generateComment());
        if(POOL.length>50000) break;
    }
}
async function simulateCrowdBurst(total=120, minBurst=3, maxBurst=8, minDelay=200, maxDelay=800){
    ensurePool(total);
    while(total>0 && window.realism.POOL.length>0){
        const burstCount = rand(minBurst, Math.min(maxBurst, window.realism.POOL.length));
        const burst = window.realism.POOL.splice(0, burstCount);
        await Promise.all(burst.map(item => postMessage(item)));
        await new Promise(r => setTimeout(r, rand(minDelay, maxDelay)));
    }
}

/* =====================================================
COMMENT GENERATOR
===================================================== */
function generateComment(){
    const templates=[
        ()=>`Guys, ${random(TESTIMONIALS)}`,
        ()=>`Anyone trading ${random(ASSETS)} on ${random(BROKERS)}?`,
        ()=>`Signal for ${random(ASSETS)} ${random(TIMEFRAMES)} is ${random(RESULT_WORDS)}`,
        ()=>`Closed ${random(ASSETS)} on ${random(TIMEFRAMES)} — ${random(RESULT_WORDS)}`,
        ()=>`Scalped ${random(ASSETS)} on ${random(BROKERS)}, result ${random(RESULT_WORDS)}`
    ];
    let text=random(templates)();
    if(maybe(0.35)) text+=" — "+random(["good execution","tight stop","wide stop","no slippage","perfect timing"]);
    if(maybe(0.60)) text+=" "+random(EMOJIS);
    return {text, timestamp: new Date()};
}

/* =====================================================
JOINERS + THREADS (simultaneous)
===================================================== */
async function generateThreadedJoinerReplies(joinItem){
    const replyCount = rand(2,5);
    const replies = Array.from({length:replyCount}).map(async ()=>{
        const persona = window.identity.getRandomPersona();
        const replyText = random(JOINER_REPLIES).replace("{user}", joinItem.persona.name);
        const msgId = `realism_reply_${Date.now()}_${rand(9999)}`;
        window.TGRenderer?.appendMessage?.(persona, replyText,{
            timestamp:new Date(),
            type:"incoming",
            id:msgId,
            parentId:joinItem.id
        });
        if(maybe(0.5)) await simulateInlineReactions(msgId, rand(1,3));
    });
    await Promise.all(replies);
}
async function simulateJoiner(){
    while(true){
        const persona = window.identity.getRandomPersona();
        const welcomeText = random(JOINER_WELCOMES).replace("{user}", persona.name);
        const joinItem = {persona, text:welcomeText, timestamp:new Date(), type:"joiner"};
        await postMessage(joinItem);
        await simulateReactions(joinItem, rand(1,3));
        await generateThreadedJoinerReplies(joinItem);
    }
}

/* =====================================================
INIT
===================================================== */
async function init(){
    while(!window.TGRenderer?.prependMessage || !window.identity?.getRandomPersona || !window.queuedTyping){
        await new Promise(r=>setTimeout(r,50));
    }

    container = document.getElementById('tg-comments-container');
    jumpIndicator = document.getElementById('tg-jump-indicator');
    jumpText = document.getElementById('tg-jump-text');
    container?.addEventListener('scroll', handleScroll);

    window.realism.POOL = window.realism.POOL || [];
    ensurePool(10000);

    await preloadHistory();

    simulateJoiner();
    simulateCrowdBurst(120);

    console.log("✅ Realism v7 fully preloaded + burst crowd + simultaneous threads + reactions");
}

/* =====================================================
PUBLIC API
===================================================== */
window.realism.simulateCrowdBurst = simulateCrowdBurst;
window.realism.postMessage = postMessage;
window.realism.simulateJoiner = simulateJoiner;
window.realism.simulateReactions = simulateReactions;
window.realism.generateThreadedJoinerReplies = generateThreadedJoinerReplies;
window.realism.simulateInlineReactions = simulateInlineReactions;
window.realism.liveMessage = liveMessage;
window.realism.init = init;

init();
})();
