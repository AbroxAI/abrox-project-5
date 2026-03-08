// full-history-loader-async-flood.js — async daily backfill with flood days, bubble previews, threaded replies, reactions
(function(){
"use strict";

const START_DATE = new Date(2025,7,14,10,0,0);
const END_DATE = new Date();

function random(arr){return arr[Math.floor(Math.random()*arr.length)];}
function maybe(p){return Math.random()<p;}
function rand(min,max){return Math.floor(Math.random()*(max-min)+min);}
function hash(str){let h=5381; for(let i=0;i<str.length;i++){h=((h<<5)+h)+str.charCodeAt(i);} return (h>>>0).toString(36);}
const GENERATED=new Set();
const QUEUE=[];

function mark(text){
    const fp=hash(text.toLowerCase());
    if(GENERATED.has(fp)) return false;
    GENERATED.add(fp);
    QUEUE.push(fp);
    while(QUEUE.length>150000) GENERATED.delete(QUEUE.shift());
    return true;
}

function timestampForDay(day){
    const blocks=[
        {start:6,end:10,weight:0.3},{start:11,end:14,weight:0.25},
        {start:15,end:20,weight:0.35},{start:21,end:23,weight:0.05},{start:0,end:5,weight:0.05}
    ];
    let r=Math.random(), sum=0, block;
    for(const b of blocks){sum+=b.weight; if(r<=sum){block=b; break;}}
    if(!block) block=blocks[0];
    const hour=rand(block.start,block.end+1), minute=rand(0,60), second=rand(0,60);
    return new Date(day.getFullYear(),day.getMonth(),day.getDate(),hour,minute,second);
}

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
    let tries=0; while(!mark(text)&&tries<60){text+=" "+rand(999); tries++;}
    return {text, timestamp: timestampForDay(day)};
}

function generateJoinerForDay(day){
    const persona={name:"User"+rand(1000,9999)};
    const text=random(JOINER_WELCOMES).replace("{user}",persona.name);
    return {persona,text,timestamp:timestampForDay(day),type:"joiner"};
}

async function postMessage(item){
    if(!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage) return;
    const persona=item.persona||window.identity.getRandomPersona();
    if(!persona) return;

    let text=item.type==="joiner"?item.text:(Math.random()<0.45?generateRoleMessage(persona):item.text);
    await window.queuedTyping(persona,text);

    const msgId=`realism_${item.type||"msg"}_${Date.now()}_${rand(9999)}`;
    window.TGRenderer.appendMessage(persona,text,{
        timestamp:item.timestamp,
        type:item.type||"incoming",
        id:msgId,
        bubblePreview:true
    });
    item.id=msgId;
    if(maybe(0.3)) await window.realism.simulateReactions?.({id:msgId},rand(1,3));
}

async function generateThreadedJoinerReplies(joinItem){
    const replyCount=rand(2,5);
    for(let i=0;i<replyCount;i++){
        const persona=window.identity.getRandomPersona();
        if(!persona) continue;
        const replyText=random(JOINER_REPLIES).replace("{user}",joinItem.persona.name);
        await window.queuedTyping(persona,replyText);
        const msgId=`realism_reply_${Date.now()}_${rand(9999)}`;
        window.TGRenderer.appendMessage(persona,replyText,{
            timestamp:joinItem.timestamp,
            type:"incoming",
            id:msgId,
            parentId:joinItem.id,
            bubblePreview:true
        });
        if(maybe(0.5)) await window.realism.simulateInlineReactions?.(msgId,rand(1,3));
        await new Promise(r=>setTimeout(r,rand(400,1200)));
    }
}

/* =====================================================
   ASYNC TIMELINE SIMULATION WITH FLOOD DAYS
===================================================== */
async function simulateTimelineAsync(batchSize=5, delay=50){
    let day=new Date(START_DATE);
    while(day<=END_DATE){
        let messageCount;
        if(Math.random()<0.05){ // 5% of days are flood/viral days
            messageCount=rand(150,300);
        } else {
            const busyFactor=Math.random();
            messageCount=busyFactor<0.3? rand(2,10) : busyFactor<0.7? rand(10,30) : rand(30,80);
        }

        for(let i=0;i<messageCount;i++){
            if(maybe(0.15)){
                const joiner=generateJoinerForDay(day);
                await postMessage(joiner);
                await generateThreadedJoinerReplies(joiner);
            } else {
                const comment=generateCommentForDay(day);
                await postMessage(comment);
            }
            if(i%batchSize===0) await new Promise(r=>setTimeout(r,delay));
        }
        day.setDate(day.getDate()+1);
        await new Promise(r=>setTimeout(r,delay*5));
    }
}

/* =====================================================
   POOL MANAGEMENT
===================================================== */
function ensurePool(min=10000){
    window.realism.POOL=window.realism.POOL||[];
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
   INIT LOADER
===================================================== */
async function initHistoryLoaderAsync(){
    await waitForReady();
    if(window.realism?.OLD_POOL) injectHistoricalPool(window.realism.OLD_POOL);
    ensurePool(5000);
    await simulateTimelineAsync(); // fully async timeline with flood days
}

/* =====================================================
   WAIT FOR RENDERER & IDENTITY
===================================================== */
async function waitForReady(timeout=30000){
    let waited=0;
    while((!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage || !window.queuedTyping) && waited<timeout){
        await new Promise(r=>setTimeout(r,50));
        waited+=50;
    }
    return true;
}

/* =====================================================
   EXPORTS
===================================================== */
window.realism.injectHistoricalPool=injectHistoricalPool;
window.realism.postMessage=postMessage;
window.realism.generateThreadedJoinerReplies=generateThreadedJoinerReplies;

/* =====================================================
   START LOADER
===================================================== */
initHistoryLoaderAsync();
})();
