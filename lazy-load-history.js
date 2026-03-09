// realism-history-live-virtual-v9.js — Virtual scroll + full history + live chat + bursts + reactions
(function(){
"use strict";

/* =====================================================
CONFIG
===================================================== */
const START_DATE = new Date(2025,7,14);
const END_DATE = new Date();
const TARGET_MESSAGES = 5000;
const VISIBLE_BUFFER = 50; // virtual scroll buffer

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

function updateJump(){ if(!jumpText) return; jumpText.textContent = unseenCount>1 ? `New messages · ${unseenCount}` : 'New messages'; }
function showJump(){ jumpIndicator?.classList.remove('hidden'); }
function hideJump(){ unseenCount=0; updateJump(); jumpIndicator?.classList.add('hidden'); }

function handleScroll(){
    if(!container) return;
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    if(distance < 80) hideJump();
    virtualRender();
}

jumpIndicator?.addEventListener('click', ()=>{
    container.scrollTop = container.scrollHeight;
    hideJump();
});

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
function activity(){ const r=Math.random(); if(r<0.45) return rand(3,8); if(r<0.75) return rand(10,25); if(r<0.95) return rand(60,120); return rand(150,220); }

/* =====================================================
HISTORY GENERATION
===================================================== */
let fullTimeline = [];
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
    fullTimeline = items.sort((a,b)=>a.timestamp - b.timestamp);
    return fullTimeline;
}

/* =====================================================
VIRTUAL SCROLL RENDERING
===================================================== */
let renderedMessages = new Map();
function virtualRender(){
    if(!container) return;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const averageHeight = 60;
    const startIndex = Math.max(0, Math.floor(scrollTop/averageHeight)-VISIBLE_BUFFER);
    const endIndex = Math.min(fullTimeline.length, Math.ceil((scrollTop+containerHeight)/averageHeight)+VISIBLE_BUFFER);

    const fragment = document.createDocumentFragment();
    for(let i=startIndex;i<endIndex;i++){
        if(renderedMessages.has(i)) continue;
        const item = fullTimeline[i];
        const div = document.createElement('div');
        div.className = 'virtual-message';
        div.dataset.index = i;
        if(item.type==='join') div.textContent = `${item.persona.name} joined the group`;
        else div.textContent = item.text || (item.type==='chat' ? 'Historic chat message' : '');
        fragment.appendChild(div);
        renderedMessages.set(i, div);
    }

    container.appendChild(fragment);

    for(let [index, elem] of renderedMessages){
        if(index<startIndex || index>endIndex){
            elem.remove();
            renderedMessages.delete(index);
        }
    }
}

/* =====================================================
REACTIONS
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
COMMENT / POST MESSAGE GENERATOR
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

async function postMessage(item){
    if(!window.identity?.getRandomPersona) return;
    const persona = item.persona || window.identity?.getRandomPersona();
    if(!persona) return;

    let text = item.text || (item.type==="joiner" ? item.text : "Message");
    await window.queuedTyping(persona, text);

    fullTimeline.push({type:item.type||'incoming', persona, text, timestamp:item.timestamp||new Date()});
    virtualRender();
    if(maybe(0.3)) await simulateReactions({id:`realism_${Date.now()}_${rand(9999)}`}, rand(1,3));
}

/* =====================================================
JOINERS / THREADS
===================================================== */
async function generateThreadedJoinerReplies(joinItem){
    const replyCount = rand(2,5);
    const replies = Array.from({length:replyCount}).map(async ()=>{
        const persona = window.identity.getRandomPersona();
        const replyText = random(JOINER_REPLIES).replace("{user}", joinItem.persona.name);
        const msgId = `realism_reply_${Date.now()}_${rand(9999)}`;
        fullTimeline.push({type:'incoming', persona, text:replyText, timestamp:new Date()});
        virtualRender();
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
        await new Promise(r => setTimeout(r, rand(1000,5000)));
    }
}

/* =====================================================
BURST CROWD
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
        total -= burstCount;
    }
}

/* =====================================================
LIVE MESSAGE
===================================================== */
async function liveMessage(){
    const convo = window.realism.generateConversation?.();
    if(!convo) return;
    const persona = convo.persona || window.identity?.getRandomPersona();
    await window.queuedTyping(persona, convo.text);
    fullTimeline.push({type:'incoming', persona, text:convo.text, timestamp:new Date()});
    virtualRender();
    const scrollAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 80;
    if(scrollAtBottom) container.scrollTop = container.scrollHeight;
    else { unseenCount++; updateJump(); showJump(); }
}

/* =====================================================
INIT
===================================================== */
async function init(){
    while(!window.identity?.getRandomPersona || !window.queuedTyping){
        await new Promise(r=>setTimeout(r,50));
    }

    container = document.getElementById('tg-comments-container');  
    jumpIndicator = document.getElementById('tg-jump-indicator');  
    jumpText = document.getElementById('tg-jump-text');  
    container?.addEventListener('scroll', handleScroll);  

    generateTimeline();
    virtualRender();

    simulateJoiner();
    simulateCrowdBurst(120);

    console.log("✅ Realism v9 virtualized fully loaded: scrollable history + live chat + bursts + threads + reactions");
}

/* =====================================================
PUBLIC API
===================================================== */
window.realism = window.realism || {};
window.realism.liveMessage = liveMessage;
window.realism.postMessage = postMessage;
window.realism.simulateJoiner = simulateJoiner;
window.realism.simulateCrowdBurst = simulateCrowdBurst;
window.realism.init = init;

init();
})();
