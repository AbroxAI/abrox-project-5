(async function(){
"use strict";

const START_DATE = new Date(2025,7,14);
const END_DATE = new Date(Date.now()-86400000);
const TOTAL_HISTORICAL = 50000;
const CHUNK_SIZE = 200;
const CHUNK_DELAY = 50;

let container = document.getElementById('tg-comments-container');
let jumpIndicator = document.getElementById('tg-jump-indicator');
let jumpText = document.getElementById('tg-jump-text');
let unseenCount = 0;

function rand(a,b){ return Math.floor(Math.random()*(b-a)+a); }
function maybe(p){ return Math.random()<p; }
function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

let lastTime = 0;
function timestamp(day){
    let t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), rand(7,22), rand(0,60), rand(0,60));
    if(t.getTime() <= lastTime) t = new Date(lastTime + rand(15000,90000));
    lastTime = t.getTime();
    return t;
}

function activity(){ 
    const r=Math.random(); 
    if(r<0.45) return rand(3,8); 
    if(r<0.75) return rand(10,25); 
    if(r<0.95) return rand(60,120); 
    return rand(150,220); 
}

function generateTimeline(total){
    const items=[];
    let day = new Date(START_DATE);

    while(day <= END_DATE && items.length < total){
        const count = activity();

        for(let i=0;i<count;i++){

            const time = timestamp(day);

            if(maybe(0.12) && window.identity?.getRandomPersona){

                items.push({
                    type:"join",
                    persona:window.identity.getRandomPersona(),
                    timestamp:time
                });

            }else{

                items.push({
                    type:"chat",
                    timestamp:time
                });

            }

            if(items.length >= total) break;
        }

        day.setDate(day.getDate()+1);
    }

    return items.sort((a,b)=>a.timestamp-b.timestamp);
}

function getRealismMessage(){

    window.realism.POOL = window.realism.POOL || [];

    let msg = null;

    if(window.realism.POOL.length){
        msg = window.realism.POOL.shift();
    }

    if(!msg && window.realism.generateComment){
        msg = window.realism.generateComment();
    }

    if(!msg && window.realism.generateConversation){
        const convo = window.realism.generateConversation();
        msg = convo?.text;
    }

    if(!msg) return null;

    return msg.text || msg.message || msg;
}

let headerInserted = false;
let firstHistoricMsgId = null;

async function postHistoric(item){

    const persona = item.persona || window.identity.getRandomPersona();

    let text;

    if(item.type === "join"){
        text = `${persona.name} joined the group`;
    }else{
        while(!text){
            text = getRealismMessage();
        }
    }

    window.realism.HISTORIC_POOL = window.realism.HISTORIC_POOL || [];
    window.realism.HISTORIC_POOL.push({ text, timestamp: item.timestamp, persona });

    if(!headerInserted){

        const headerId = `hist_header_${Date.now()}`;

        window.TGRenderer.prependMessage(
            {name:"System"},
            "📜 Historical Messages",
            {
                timestamp:item.timestamp,
                type:"system-header",
                id:headerId
            }
        );

        headerInserted = true;
    }

    const msgId = `hist_${Date.now()}_${rand(9999)}`;

    window.TGRenderer.prependMessage(
        persona,
        text,
        {
            timestamp:item.timestamp,
            type:"historic",
            id:msgId
        }
    );

    item.id = msgId;

    if(!firstHistoricMsgId) firstHistoricMsgId = msgId;

    if(item.type==="join" && window.realism.generateThreadedJoinerReplies){

        await window.realism.generateThreadedJoinerReplies({
            persona,
            id:msgId
        });

    }

}

async function loadHistoryInChunks(){

    const timeline = generateTimeline(TOTAL_HISTORICAL);

    for(let i=0; i<timeline.length; i+=CHUNK_SIZE){

        const chunk = timeline.slice(i, i+CHUNK_SIZE);

        await Promise.all(chunk.map(postHistoric));

        await new Promise(r=>setTimeout(r, CHUNK_DELAY));

    }

    const firstMsgElem = document.getElementById(firstHistoricMsgId);

    if(firstMsgElem){
        firstMsgElem.scrollIntoView({
            behavior:"smooth",
            block:"start"
        });
    }else{
        container.scrollTop = 0;
    }

    console.log(`✅ Full historical chat loaded (${timeline.length} messages)`);

}

/* ---------------------------------------------------
REALISTIC LIVE CHAT + CONVERSATION BURSTS
--------------------------------------------------- */

async function simulateConversationBurst(basePersona){

    const replies = rand(2,4);

    for(let i=0;i<replies;i++){

        const convo = window.realism.generateConversation?.();

        if(!convo) continue;

        const text = convo.text || "";

        const thinkingDelay = rand(2000,5000);
        const typingDuration = Math.min(text.length * rand(140,220), 9000);

        await new Promise(r=>setTimeout(r,thinkingDelay));

        await window.queuedTyping(convo.persona,text);

        await new Promise(r=>setTimeout(r,typingDuration));

        window.TGRenderer.appendMessage(
            convo.persona,
            text,
            {
                timestamp:new Date(),
                type:"incoming",
                bubblePreview:true
            }
        );

    }

}

async function postLive(){

    const convo = window.realism.generateConversation?.() || {
        text:"",
        persona:window.identity.getRandomPersona()
    };

    const text = convo.text || "";
    const now = new Date();

    const thinkingDelay = rand(2500,6000);
    const typingDuration = Math.min(text.length * rand(160,260), 12000);

    await new Promise(r=>setTimeout(r,thinkingDelay));

    await window.queuedTyping(convo.persona,text);

    await new Promise(r=>setTimeout(r,typingDuration));

    const scrollAtBottom =
        container.scrollTop + container.clientHeight
        >= container.scrollHeight - 80;

    window.realism.POOL = window.realism.POOL || [];

    const liveItem = { ...convo, timestamp: now };

    window.realism.POOL.push(liveItem);

    window.TGRenderer.appendMessage(
        convo.persona,
        text,
        {
            timestamp:now,
            type:"incoming",
            bubblePreview:true
        }
    );

    if(scrollAtBottom){
        container.scrollTop = container.scrollHeight;
    }else{
        unseenCount++;
        updateJump();
        showJump();
    }

    /* chance to trigger conversation cluster */

    if(Math.random() < 0.35){
        simulateConversationBurst(convo.persona);
    }

}

function ensureLivePool(min=10000){

    window.realism.POOL = window.realism.POOL || [];

    while(window.realism.POOL.length < min){

        const msg = window.realism.generateComment();

        msg.timestamp = new Date();

        window.realism.POOL.push(msg);

        if(window.realism.POOL.length > 50000) break;

    }

}

async function simulateCrowdBurst(total=150){

    ensureLivePool(total);

    while(total>0 && window.realism.POOL.length>0){

        const burstCount = rand(3,8);

        const burst = window.realism.POOL.splice(0,burstCount);

        await Promise.all(
            burst.map(item=>window.realism.postMessage(item))
        );

        await new Promise(r=>setTimeout(r, rand(200,700)));

    }

}

async function init(){

    while(
        !window.identity?.SyntheticPool?.length ||
        !window.TGRenderer?.prependMessage ||
        !window.TGRenderer?.appendMessage ||
        !window.queuedTyping ||
        !window.realism?.simulate
    ){
        await new Promise(r=>setTimeout(r,50));
    }

    if(window.realism?.OLD_POOL)
        window.realism.injectHistoricalPool(window.realism.OLD_POOL);

    await loadHistoryInChunks();

    ensureLivePool(20000);

    simulateCrowdBurst(200);

    setInterval(postLive, rand(15000,45000));

    window.realism.simulate();

    window.realism.simulateJoiner(45000,120000);

    console.log("✅ Fully synced: historical + live + realistic typing + conversation bursts");

}

init();

})();
