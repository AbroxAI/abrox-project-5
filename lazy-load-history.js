(async function(){
"use strict";

const START_DATE = new Date(2025,7,14);
const END_DATE = new Date(Date.now()-86400000);
const TOTAL_HISTORICAL = 50000;
const BATCH_SIZE = 500;

let container = document.getElementById('tg-comments-container');
let jumpIndicator = document.getElementById('tg-jump-indicator');
let jumpText = document.getElementById('tg-jump-text');
let unseenCount = 0;

function rand(a,b){return Math.floor(Math.random()*(b-a)+a);}
function maybe(p){return Math.random()<p;}
function random(arr){return arr[Math.floor(Math.random()*arr.length)];}

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
container.addEventListener('scroll', handleScroll);

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
                items.push({type:"join", persona:window.identity.getRandomPersona(), timestamp:time});
            } else {
                items.push({type:"chat", timestamp:time});
            }
            if(items.length >= total) break;
        }
        day.setDate(day.getDate()+1);
    }
    return items.sort((a,b)=>a.timestamp-b.timestamp);
}

// --- fully synced post via realism engine
async function postHistoric(item){
    const persona = item.persona || window.identity.getRandomPersona();
    const text = item.type === "join" ? `${persona.name} joined the group` :
        window.realism.generateConversation?.()?.text || "Historic message";

    // send through realism engine to ensure reactions & threaded replies
    await window.realism.postMessage({
        persona,
        text,
        timestamp: item.timestamp,
        type: item.type==="join"?"joiner":"historic"
    });
}

async function preloadHistory(){
    const timeline = generateTimeline(TOTAL_HISTORICAL);
    for(let i=0; i<timeline.length; i+=BATCH_SIZE){
        const batch = timeline.slice(i,i+BATCH_SIZE);
        for(const item of batch){
            await postHistoric(item);
        }
        // small delay to allow TGRenderer and realism engine to catch up
        await new Promise(r=>setTimeout(r,50));
    }
    container.scrollTop = 0;
    console.log(`✅ Full historical chat fully rendered and synced with realism pool`);
}

// --- live chat
async function liveMessage(){
    const convo = window.realism.generateConversation?.() || {text:"", persona:window.identity.getRandomPersona()};
    await window.queuedTyping(convo.persona, convo.text);
    const scrollAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 80;
    window.TGRenderer?.appendMessage?.(
        convo.persona, convo.text, {timestamp:new Date(), type:"incoming", bubblePreview:true}
    );
    if(scrollAtBottom){ container.scrollTop = container.scrollHeight; }
    else { unseenCount++; updateJump(); showJump(); }
}

// --- ensure realism pool
function ensurePool(min=10000){
    window.realism.POOL = window.realism.POOL || [];
    while(window.realism.POOL.length<min){
        window.realism.POOL.push(window.realism.generateComment());
        if(window.realism.POOL.length>50000) break;
    }
}

// --- burst crowd
async function simulateCrowdBurst(total=150){
    ensurePool(total);
    while(total>0 && window.realism.POOL.length>0){
        const burstCount = rand(3,8);
        const burst = window.realism.POOL.splice(0,burstCount);
        await Promise.all(burst.map(item=>window.realism.postMessage(item)));
        await new Promise(r=>setTimeout(r,rand(100,500)));
    }
}

// --- wait for everything ready
async function waitForReady(){
    while(!window.identity?.SyntheticPool?.length || !window.TGRenderer?.appendMessage || !window.queuedTyping || !window.realism?.simulate || !window.realism?.postMessage){
        await new Promise(r=>setTimeout(r,50));
    }
}

// --- init
async function init(){
    await waitForReady();
    if(window.realism?.OLD_POOL) window.realism.injectHistoricalPool(window.realism.OLD_POOL);

    // fully preload historical messages through realism engine
    await preloadHistory();

    ensurePool(20000);
    simulateCrowdBurst(200);
    setInterval(liveMessage, rand(12000,40000));
    window.realism.simulate();
    window.realism.simulateJoiner(45000,120000);

    console.log("✅ Full historical + realism pool + live chat + burst + threaded replies active");
}

init();
})();
