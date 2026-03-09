(async function() {
    "use strict";

    /* ===================================================== CONFIG ===================================================== */
    const START_DATE = new Date(2025, 7, 14); // August 14, 2025
    const END_DATE = new Date();
    const TARGET_MESSAGES = 50000; // 50k messages
    const BATCH_SIZE = 500; // Render in batches for performance

    let container, jumpIndicator, jumpText;
    let unseenCount = 0;

    /* ===================================================== UTILS ===================================================== */
    function rand(a,b){ return Math.floor(Math.random()*(b-a)+a); }
    function maybe(p){ return Math.random()<p; }
    function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

    /* ===================================================== SCROLL / JUMP ===================================================== */
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

    /* ===================================================== TIMESTAMP ===================================================== */
    let lastTime=0;
    function timestamp(day){
        let t = new Date(day.getFullYear(), day.getMonth(), day.getDate(), rand(7,22), rand(0,60), rand(0,60));
        if(t.getTime() <= lastTime) t = new Date(lastTime + rand(15000,90000));
        lastTime = t.getTime();
        return t;
    }

    /* ===================================================== ACTIVITY ===================================================== */
    function activity(){ 
        const r=Math.random(); 
        if(r<0.45) return rand(3,8); 
        if(r<0.75) return rand(10,25); 
        if(r<0.95) return rand(60,120); 
        return rand(150,220); 
    }

    /* ===================================================== HISTORY GENERATION ===================================================== */
    function generateTimeline50k(target){
        const items=[];
        let day = new Date(START_DATE);
        while(day <= END_DATE && items.length < target){
            const count = activity();
            for(let i=0;i<count;i++){
                const time = timestamp(day);
                if(maybe(0.12) && window.identity?.getRandomPersona){
                    items.push({type:"join", persona:window.identity.getRandomPersona(), timestamp:time});
                } else {
                    items.push({type:"chat", timestamp:time});
                }
                if(items.length >= target) break;
            }
            day.setDate(day.getDate()+1);
        }
        return items.sort((a,b)=>b.timestamp-a.timestamp); // newest first
    }

    /* ===================================================== COMMENT GENERATOR ===================================================== */
    function generateComment(){
        const templates=[
            ()=>`Guys, ${random(TESTIMONIALS)}`,
            ()=>`Anyone trading ${random(ASSETS)} on ${random(BROKERS)}?`,
            ()=>`Signal for ${random(ASSETS)} ${random(TIMEFRAMES)} is ${random(RESULT_WORDS)}`,
            ()=>`Closed ${random(ASSETS)} on ${random(TIMEFRAMES)} — ${random(RESULT_WORDS)}`,
            ()=>`Scalped ${random(ASSETS)} on ${random(BROKERS)}, result ${random(RESULT_WORDS)}`
        ];
        let text = random(templates)();
        if(maybe(0.35)) text += " — " + random(["good execution","tight stop","wide stop","no slippage","perfect timing"]);
        if(maybe(0.60)) text += " " + random(EMOJIS);
        return {text, timestamp: new Date()};
    }

    /* ===================================================== POOL & BURST ===================================================== */
    function ensurePool(min=10000){
        window.realism.POOL = window.realism.POOL || [];
        const POOL = window.realism.POOL;
        while(POOL.length < min){
            POOL.push(generateComment());
            if(POOL.length > 50000) break;
        }
    }

    async function simulateCrowdBurst(total=500, minBurst=3, maxBurst=8, minDelay=50, maxDelay=150){
        ensurePool(total);
        while(total>0 && window.realism.POOL.length>0){
            const burstCount = rand(minBurst, Math.min(maxBurst, window.realism.POOL.length));
            const burst = window.realism.POOL.splice(0, burstCount);
            await Promise.all(burst.map(item => postMessage(item)));
            await new Promise(r => setTimeout(r, rand(minDelay, maxDelay)));
        }
    }

    /* ===================================================== POST MESSAGE ===================================================== */
    async function postMessage(item){
        if(!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage) return;
        const persona = item.persona || window.identity.getRandomPersona();
        if(!persona) return;

        const msgId = `realism_${item.type||"msg"}_${Date.now()}_${rand(9999)}`;
        await window.queuedTyping(persona, item.text);
        window.TGRenderer?.appendMessage?.(
            persona,
            item.text,
            {timestamp:item.timestamp||new Date(), type:item.type||"incoming", id:msgId, bubblePreview:true}
        );
        item.id = msgId;

        if(maybe(0.3)) await simulateReactions(item, rand(1,3));
    }

    /* ===================================================== PRELOAD HISTORY OPTIMIZED ===================================================== */
    async function preloadHistoryOptimized(target=TARGET_MESSAGES, batchSize=BATCH_SIZE){
        console.log(`⏳ Preloading ${target} historical messages in batches of ${batchSize}...`);
        const timeline = generateTimeline50k(target);
        const joinerThreads = [];

        for(let i = 0; i < timeline.length; i += batchSize){
            const batch = timeline.slice(i, i + batchSize);
            const fragment = document.createDocumentFragment();

            batch.forEach(item => {
                let msgElement;
                if(item.type === "join"){
                    msgElement = window.TGRenderer?.createMessageElement?.(
                        item.persona,
                        `${item.persona.name} joined the group`,
                        {timestamp:item.timestamp, type:"system", event:"join"}
                    );
                    joinerThreads.push({persona:item.persona, timestamp:item.timestamp});
                } else {
                    const convo = window.realism.generateConversation?.() || {text:"", persona:window.identity?.getRandomPersona()};
                    msgElement = window.TGRenderer?.createMessageElement?.(
                        convo.persona,
                        convo.text,
                        {timestamp:item.timestamp, type:"historic", bubblePreview:true}
                    );
                }
                if(msgElement) fragment.appendChild(msgElement);
            });

            container.appendChild(fragment);

            // Yield control to browser to keep UI responsive
            await new Promise(r => setTimeout(r, 10));
        }

        // Run joiner threads simultaneously
        await Promise.all(joinerThreads.map(j => window.realism.generateThreadedJoinerReplies(j)));

        // Add burst messages as part of history
        await simulateCrowdBurst(500, 3, 8, 50, 150);

        // Scroll to top
        container.scrollTop = 0;

        console.log(`✅ Optimized full historical chat loaded: ${timeline.length} messages`);
    }

    /* ===================================================== INIT ===================================================== */
    async function init(){
        while(!window.TGRenderer?.prependMessage || !window.identity?.getRandomPersona || !window.queuedTyping){
            await new Promise(r=>setTimeout(r,50));
        }

        container = document.getElementById('tg-comments-container');
        jumpIndicator = document.getElementById('tg-jump-indicator');
        jumpText = document.getElementById('tg-jump-text');
        container?.addEventListener('scroll', handleScroll);

        window.realism.POOL = window.realism.POOL || [];
        ensurePool(50000);

        // preload full optimized history
        await preloadHistoryOptimized();

        // start live joiners
        simulateJoiner();

        console.log("✅ Realism v7 fully preloaded + 50k history + burst crowd + live messages + reactions");
    }

    /* ===================================================== PUBLIC API ===================================================== */
    window.realism = window.realism || {};
    window.realism.postMessage = postMessage;
    window.realism.simulateCrowdBurst = simulateCrowdBurst;
    window.realism.simulateJoiner = simulateJoiner;
    window.realism.simulateReactions = simulateReactions;
    window.realism.generateThreadedJoinerReplies = generateThreadedJoinerReplies;
    window.realism.simulateInlineReactions = simulateInlineReactions;
    window.realism.liveMessage = liveMessage;
    window.realism.init = init;

    // Start everything
    init();
})();
