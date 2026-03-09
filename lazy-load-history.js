(async function(){
"use strict";

/* =====================================================
CONFIG
===================================================== */
const START_DATE = new Date(2025,7,14); // Aug 14, 2025
const END_DATE = new Date(Date.now()-86400000); // yesterday
const TOTAL_HISTORICAL = 50000; // full history
const BATCH_SIZE = 500;          // incremental load batch
let container = document.getElementById('tg-comments-container');
let jumpIndicator = document.getElementById('tg-jump-indicator');
let jumpText = document.getElementById('tg-jump-text');
let unseenCount = 0;

/* =====================================================
UTILS
===================================================== */
function rand(a,b){return Math.floor(Math.random()*(b-a)+a);}
function maybe(p){return Math.random()<p;}
function random(arr){return arr[Math.floor(Math.random()*arr.length)];}

/* =====================================================
SCROLL / JUMP HANDLING
===================================================== */
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

/* =====================================================
TIMESTAMP & ACTIVITY
===================================================== */
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

/* =====================================================
HISTORICAL TIMELINE GENERATION
===================================================== */
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

/* =====================================================
PRELOAD HISTORICAL (INCREMENTAL)
===================================================== */
async function preloadHistory(){
    const timeline = generateTimeline(TOTAL_HISTORICAL);
    let i = 0;
    while(i < timeline.length){
        const batch = timeline.slice(i, i+BATCH_SIZE);
        for(const item of batch){
            if(item.type==="join"){
                window.TGRenderer?.prependMessage?.(
                    item.persona,
                    `${item.persona.name} joined the group`,
                    {timestamp:item.timestamp, type:"system", event:"join"}
                );
                if(window.realism?.generateThreadedJoinerReplies){
                    await window.realism.generateThreadedJoinerReplies({persona:item.persona, id:`join_${Date.now()}`});
                }
            } else {
                const convo = window.realism.generateConversation?.() || {text:"", persona:window.identity.getRandomPersona()};
                window.TGRenderer?.prependMessage?.(
                    convo.persona,
                    convo.text,
                    {timestamp:item.timestamp, type:"historic", bubblePreview:true}
                );
            }
        }
        i += BATCH_SIZE;
        await new Promise(r=>setTimeout(r,20));
    }
    container.scrollTop = 0;
    console.log(`✅ Loaded full historical chat (${timeline.length} messages) from Aug 14, 2025 → yesterday`);
}

/* =====================================================
LIVE CHAT
===================================================== */
async function liveMessage(){
    const convo = window.realism.generateConversation?.() || {text:"", persona:window.identity.getRandomPersona()};
    await window.queuedTyping(convo.persona, convo.text);
    const scrollAtBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 80;
    window.TGRenderer?.appendMessage?.(
        convo.persona,
        convo.text,
        {timestamp:new Date(), type:"incoming", bubblePreview:true}
    );
    if(scrollAtBottom){ container.scrollTop = container.scrollHeight; }
    else { unseenCount++; updateJump(); showJump(); }
}

/* =====================================================
FULL REALISM POOL SYNC
===================================================== */
function ensureRealismPool(min=10000){
    window.realism.POOL = window.realism.POOL || [];
    while(window.realism.POOL.length < min){
        window.realism.POOL.push(window.realism.generateComment());
        if(window.realism.POOL.length > 50000) break;
    }
}

/* =====================================================
BURST CROWD
===================================================== */
async function simulateCrowdBurst(total=150,minBurst=3,maxBurst=8,minDelay=100,maxDelay=500){
    ensureRealismPool(total);
    while(total>0 && window.realism.POOL.length>0){
        const burstCount = rand(minBurst,Math.min(maxBurst,window.realism.POOL.length));
        const burst = window.realism.POOL.splice(0,burstCount);
        await Promise.all(burst.map(item=>window.realism.postMessage(item)));
        await new Promise(r=>setTimeout(r,rand(minDelay,maxDelay)));
    }
}

/* =====================================================
INITIALIZATION
===================================================== */
async function init(){
    // Wait for core systems
    while(!window.identity?.SyntheticPool?.length || !window.TGRenderer?.appendMessage || !window.queuedTyping || !window.realism?.simulate) {
        await new Promise(r=>setTimeout(r,50));
    }

    // Merge old pool if available
    if(window.realism?.OLD_POOL) window.realism.injectHistoricalPool(window.realism.OLD_POOL);

    // Preload historical messages fully synced with pool
    await preloadHistory();

    // Ensure realism pool fully synced
    ensureRealismPool(20000);

    // Initial burst crowd
    simulateCrowdBurst(200);

    // Start live messages
    setInterval(liveMessage, rand(12000,40000));

    // Start background realism engine
    window.realism.simulate();

    // Start joiners
    window.realism.simulateJoiner(45000,120000);

    console.log("✅ Fully synced: Historical + Full realism pool + Live chat + Burst + Threaded replies");
}

/* =====================================================
START
===================================================== */
init();

})();
