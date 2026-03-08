// full-history-live-loader-virtual.js — Virtual scroll historic + live backfill
(function(){
"use strict";

/* =====================================================
   CONFIG & UTILS
===================================================== */
const START_DATE = new Date(2025,7,14,10,0,0);
const END_DATE = new Date();
const HISTORIC_COUNT = 5000;
const VISIBLE_BATCH = 100; // DOM messages visible at once
const BATCH_APPEND = 250; // batch append for faster DOM

function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function maybe(p){ return Math.random()<p; }
function rand(min,max){ return Math.floor(Math.random()*(max-min)+min); }
function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }

const GENERATED = new Set();
function mark(text){
    const h = [...text].reduce((a,c)=>((a<<5)+a)+c.charCodeAt(0),5381) >>>0;
    const fp = h.toString(36);
    if(GENERATED.has(fp)) return false;
    GENERATED.add(fp);
    if(GENERATED.size>150000) GENERATED.delete(GENERATED.values().next().value);
    return true;
}

/* =====================================================
   TIMESTAMP GENERATOR
===================================================== */
function timestampForDay(day){
    const blocks=[
        {start:6,end:10,weight:0.3},{start:11,end:14,weight:0.25},
        {start:15,end:20,weight:0.35},{start:21,end:23,weight:0.05},{start:0,end:5,weight:0.05}
    ];
    let r=Math.random(), sum=0, block;
    for(const b of blocks){ sum+=b.weight; if(r<=sum){ block=b; break; } }
    if(!block) block=blocks[0];
    return new Date(
        day.getFullYear(),
        day.getMonth(),
        day.getDate(),
        rand(block.start,block.end+1),
        rand(0,60),
        rand(0,60)
    );
}

/* =====================================================
   MESSAGE GENERATORS
===================================================== */
function generateCommentForDay(day){
    const templates=[
        ()=>`Guys, ${random(TESTIMONIALS)}`,
        ()=>`Anyone trading ${random(ASSETS)} on ${random(BROKERS)}?`,
        ()=>`Signal for ${random(ASSETS)} ${random(TIMEFRAMES)} is ${random(RESULT_WORDS)}`,
        ()=>`Closed ${random(ASSETS)} on ${random(TIMEFRAMES)} — ${random(RESULT_WORDS)}`,
        ()=>`Scalped ${random(ASSETS)} on ${random(BROKERS)}, result ${random(RESULT_WORDS)}`
    ];
    let text=random(templates)();
    if(maybe(0.35)) text+=" — "+random(["good execution","tight stop","wide stop","no slippage","perfect timing"]);
    for(let i=0;i<rand(1,4);i++) text+=" "+random(EMOJIS);
    let tries=0; while(!mark(text)&&tries<60){text+=" "+rand(999); tries++; }
    return {text, timestamp: timestampForDay(day)};
}

function generateJoinerForDay(day){
    const persona={ name:"User"+rand(1000,9999) };
    const text=random(JOINER_WELCOMES).replace("{user}",persona.name);
    return { persona, text, timestamp: timestampForDay(day), type:"joiner" };
}

/* =====================================================
   MESSAGE POOL (HISTORIC + LIVE)
===================================================== */
window.realism.POOL = window.realism.POOL||[];
window.realism.VISIBLE_POOL = []; // messages currently in DOM

function appendToPool(item){ window.realism.POOL.push(item); }

/* =====================================================
   VIRTUAL SCROLL RENDERER
===================================================== */
async function renderVisibleMessages(container){
    if(!container) return;
    const scrollTop = container.scrollTop;
    const clientHeight = container.clientHeight;

    // compute first/last visible index
    const total = window.realism.POOL.length;
    const startIdx = Math.max(0, Math.floor(scrollTop/60) - 10); // buffer
    const endIdx = Math.min(total, startIdx + VISIBLE_BATCH + 20);

    // remove messages not in viewport
    window.realism.VISIBLE_POOL.forEach(msg=>{
        if(msg.idx<startIdx || msg.idx>=endIdx){
            const el = document.getElementById(msg.id);
            if(el) el.remove();
        }
    });
    window.realism.VISIBLE_POOL = window.realism.VISIBLE_POOL.filter(msg=>msg.idx>=startIdx && msg.idx<endIdx);

    // append new visible messages
    const batch = [];
    for(let i=startIdx;i<endIdx;i++){
        if(window.realism.VISIBLE_POOL.find(m=>m.idx===i)) continue;
        const item = window.realism.POOL[i];
        if(!item) continue;
        const persona = item.persona || window.identity.getRandomPersona();
        if(!persona) continue;
        batch.push({...item, persona, idx:i});
    }

    if(batch.length>0){
        await batchAppendMessages(batch, container);
    }
}

/* =====================================================
   BATCH APPEND
===================================================== */
async function batchAppendMessages(batch, container){
    for(const item of batch){
        const live = item.live || false;
        const persona = item.persona;
        if(!persona) continue;

        if(live) await window.queuedTyping(persona,item.text);

        const msgId = `realism_${item.type||"msg"}_${Date.now()}_${rand(9999)}`;
        window.TGRenderer.appendMessage(persona,item.text,{
            timestamp:item.timestamp,
            type:item.type || (live?"incoming":"historic"),
            id:msgId,
            bubblePreview:true
        });
        item.id = msgId;
        if(container) document.getElementById(msgId)?.scrollIntoView({block:"nearest"});

        window.realism.VISIBLE_POOL.push({...item, id:msgId});
        if(window.realism.simulateReactions && maybe(0.3)){
            await window.realism.simulateReactions({id:msgId},rand(1,3));
        }
    }
}

/* =====================================================
   THREAD REPLIES
===================================================== */
async function generateThreadedJoinerReplies(joinItem){
    const replyCount = rand(2,5);
    for(let i=0;i<replyCount;i++){
        const persona=window.identity.getRandomPersona();
        if(!persona) continue;
        const replyText = random(JOINER_REPLIES).replace("{user}",joinItem.persona.name);
        const msgId=`realism_reply_${Date.now()}_${rand(9999)}`;
        window.TGRenderer.appendMessage(persona,replyText,{
            timestamp:joinItem.timestamp,
            type:"historic",
            id:msgId,
            parentId:joinItem.id,
            bubblePreview:true
        });
        if(window.realism.simulateInlineReactions && maybe(0.5)) 
            await window.realism.simulateInlineReactions(msgId,rand(1,3));
    }
}

/* =====================================================
   HISTORIC BACKFILL
===================================================== */
async function loadHistoricMessages(container){
    let day = new Date(START_DATE);
    let messagesLoaded = 0;
    const batch = [];
    while(day<=END_DATE && messagesLoaded<HISTORIC_COUNT){
        const messageCount = rand(3,10);
        for(let i=0;i<messageCount;i++){
            let item;
            if(maybe(0.15)){
                item = generateJoinerForDay(day);
                await generateThreadedJoinerReplies(item);
            } else {
                item = generateCommentForDay(day);
            }
            appendToPool(item);
            batch.push(item);
            messagesLoaded++;
            if(batch.length>=BATCH_APPEND){
                await batchAppendMessages(batch, container);
                batch.length = 0;
            }
            if(messagesLoaded>=HISTORIC_COUNT) break;
        }
        day.setDate(day.getDate()+1);
    }
    if(batch.length>0) await batchAppendMessages(batch, container);
}

/* =====================================================
   LIVE MESSAGE
===================================================== */
async function simulateLiveMessage(text=null){
    const item = text ? { text, timestamp:new Date(), live:true } :
                 maybe(0.15) ? generateJoinerForDay(new Date()) :
                 generateCommentForDay(new Date());
    appendToPool(item);
    await batchAppendMessages([item], document.querySelector(".tg-comments-container"));
}

/* =====================================================
   POOL MANAGEMENT
===================================================== */
function ensurePool(min=10000){
    window.realism.POOL = window.realism.POOL||[];
    while(window.realism.POOL.length<min){
        window.realism.POOL.push(generateCommentForDay(new Date()));
        if(window.realism.POOL.length>50000) break;
    }
}

/* =====================================================
   HISTORICAL POOL INJECTION
===================================================== */
function injectHistoricalPool(oldPool){
    if(!Array.isArray(oldPool)) return;
    for(const item of oldPool){
        if(item.text && mark(item.text)) window.realism.POOL.push(item);
    }
}

/* =====================================================
   SCROLL HANDLER
===================================================== */
function attachVirtualScroll(container){
    container.addEventListener("scroll",()=>renderVisibleMessages(container));
    renderVisibleMessages(container);
}

/* =====================================================
   INIT
===================================================== */
async function initHistoryLiveVirtual(){
    await waitForReady();

    const container = document.querySelector(".tg-comments-container");
    if(!container) return;

    if(window.realism?.OLD_POOL) injectHistoricalPool(window.realism.OLD_POOL);
    ensurePool(5000);

    await loadHistoricMessages(container);
    attachVirtualScroll(container);

    console.log("✅ Virtual historic backfill complete. Ready for live messages.");
}

/* =====================================================
   WAIT FOR SYSTEM
===================================================== */
async function waitForReady(timeout=30000){
    let waited=0;
    while((!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage || !window.queuedTyping) && waited<timeout){
        await delay(50);
        waited+=50;
    }
    return true;
}

/* =====================================================
   EXPORTS
===================================================== */
window.realism.injectHistoricalPool = injectHistoricalPool;
window.realism.postMessage = batchAppendMessages;
window.realism.generateThreadedJoinerReplies = generateThreadedJoinerReplies;
window.realism.simulateLiveMessage = simulateLiveMessage;

/* =====================================================
   START
===================================================== */
initHistoryLiveVirtual();
})();
