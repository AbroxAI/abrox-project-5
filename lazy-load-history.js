(async function(){
"use strict";

const START_DATE = new Date(2025,7,14);
const END_DATE = new Date(Date.now()-86400000);
const TOTAL_HISTORICAL = 50000;
const CHUNK_SIZE = 200;
const CHUNK_DELAY = 50;

let container = document.getElementById('tg-comments-container');
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

// --- Generate historical timeline
function generateTimeline(total){
    const items=[];
    let day = new Date(START_DATE);

    while(day <= END_DATE && items.length < total){
        const count = activity();
        for(let i=0;i<count;i++){
            const time = timestamp(day);
            if(maybe(0.12) && window.identity?.getRandomPersona){
                items.push({ type:"join", persona:window.identity.getRandomPersona(), timestamp:time });
            }else{
                items.push({ type:"chat", timestamp:time });
            }
            if(items.length >= total) break;
        }
        day.setDate(day.getDate()+1);
    }

    return items.sort((a,b)=>a.timestamp-b.timestamp);
}

// --- GUARANTEED REALISM MESSAGE
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

// --- Post historic messages
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

    if(!headerInserted){
        const headerId = `hist_header_${Date.now()}`;
        window.TGRenderer.prependMessage(
            {name:"System"},
            "📜 Historical Messages",
            { timestamp:item.timestamp, type:"system-header", id:headerId }
        );
        headerInserted = true;
    }

    const msgId = `hist_${Date.now()}_${rand(9999)}`;
    window.TGRenderer.prependMessage(
        persona,
        text,
        { timestamp:item.timestamp, type:"historic", id:msgId }
    );

    item.id = msgId;
    if(!firstHistoricMsgId) firstHistoricMsgId = msgId;
}

// --- Load history in **background chunks**
async function loadHistoryInBackground(){
    const timeline = generateTimeline(TOTAL_HISTORICAL);

    for(let i=0; i<timeline.length; i+=CHUNK_SIZE){
        const chunk = timeline.slice(i, i+CHUNK_SIZE);
        // Post each chunk without blocking live messages
        chunk.forEach(postHistoric);
        await new Promise(r=>setTimeout(r, CHUNK_DELAY));
    }

    console.log(`✅ Historical messages loading completed (${timeline.length})`);
}

// --- Live message poster (unchanged)
async function postLive(){
    const convo = window.realism.generateConversation?.() || {
        text:"",
        persona:window.identity.getRandomPersona()
    };

    await window.queuedTyping(convo.persona, convo.text);

    const now = new Date();
    const scrollAtBottom =
        container.scrollTop + container.clientHeight
        >= container.scrollHeight - 80;

    window.realism.POOL = window.realism.POOL || [];
    const liveItem = { ...convo, timestamp: now };
    window.realism.POOL.push(liveItem);

    window.TGRenderer.appendMessage(
        convo.persona,
        convo.text,
        { timestamp:now, type:"incoming", bubblePreview:true }
    );

    if(scrollAtBottom){
        container.scrollTop = container.scrollHeight;
    }else{
        unseenCount++;
        // update jump indicator if needed
    }
}

// --- Init
async function init(){
    // wait for identity & renderer
    while(!window.identity?.SyntheticPool?.length ||
          !window.TGRenderer?.prependMessage ||
          !window.TGRenderer?.appendMessage ||
          !window.queuedTyping ||
          !window.realism?.simulate){
        await new Promise(r=>setTimeout(r,50));
    }

    // Load historical messages **in background**, don't await
    loadHistoryInBackground();

    // Ensure live pool and start live feed
    window.realism.simulate();
    window.realism.simulateJoiner(45000,120000);

    // Live messages interval
    setInterval(postLive, rand(12000,40000));

    console.log("✅ Live chat running while historical messages load in background");
}

init();
})();
