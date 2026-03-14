// interactions-v14.4-real-full-sync.js — Crowd reactions + joiners + typing + timestamps + pills
(function(){

'use strict';

/* =====================================================
   INTERACTION QUEUE
===================================================== */
const interactionQueue = [];
let processingQueue = false;

// enqueue messages for sequential sending
function enqueueInteraction(interaction){
    if(!interaction || !interaction.persona || !interaction.text) return;
    interactionQueue.push(interaction);
    processQueue();
}

async function processQueue(){
    if(processingQueue || interactionQueue.length===0) return;
    processingQueue = true;

    while(interactionQueue.length > 0){
        const interaction = interactionQueue.shift();
        const { persona, text, parentText, parentId } = interaction;

        if(!persona || !text) continue;

        const opts = {};
        if(parentText || parentId){
            opts.replyToId = parentId;
            opts.replyToText = parentText;
        }

        // Header typing simulation
        if(persona?.name){
            document.dispatchEvent(new CustomEvent("headerTyping", { detail: { name: persona.name } }));
        }

        const typingDuration = window.TGRenderer?.calculateTypingDuration?.(text) || 1200;
        await new Promise(res => setTimeout(res, typingDuration + 200));

        // Append message
        if(window.TGRenderer?.appendMessage){
            const msgId = window.TGRenderer.appendMessage(persona, text, { 
                timestamp: new Date(), 
                type: "incoming",
                ...opts 
            });
            interaction._msgId = msgId;

            // auto reactions for this message
            window.interactions.react({ id: msgId, reactions: interaction.reactions || [] });
        }
    }

    processingQueue = false;
}

/* =====================================================
   REPLY TEMPLATES
===================================================== */
const REPLY_TEMPLATES = [
    "Yes, I agree!",
    "Exactly 💯",
    "Nice point 👍",
    "I’ve been thinking the same.",
    "Can you elaborate?",
    "Interesting 🤔",
    "😂 That’s funny!",
    "Absolutely 🚀",
    "Good catch!",
    "Thanks for sharing 💡",
    "Welcome aboard! 👋",
    "Glad to be here!",
    "Excited to join the discussion!",
    "Looking forward to trading today!",
    "Market seems volatile 🔥",
    "Any signals on EUR/USD?",
    "Watching BTC closely today",
    "Hoping for green trades 🌿"
];

function getRandomReply(){
    return REPLY_TEMPLATES[Math.floor(Math.random()*REPLY_TEMPLATES.length)];
}

/* =====================================================
   REACTION PILL HANDLER
===================================================== */
function renderReactions(bubbleEntry, reactions){
    if(!bubbleEntry || !bubbleEntry.el) return;

    // remove old pill
    let pill = bubbleEntry.el.querySelector('.tg-bubble-reactions');
    if(pill) pill.remove();

    pill = document.createElement('div');
    pill.className = 'tg-bubble-reactions';

    reactions.forEach(r => {
        const span = document.createElement('span');
        span.className = 'reaction';
        span.textContent = `${r.emoji} ${r.count}`;
        span.style.cursor = 'pointer';

        // hover effect
        span.addEventListener('mouseenter', ()=>span.style.backgroundColor='#eee');
        span.addEventListener('mouseleave', ()=>span.style.backgroundColor='');

        // click increments count
        span.addEventListener('click', ()=>{
            r.count += 1;
            span.textContent = `${r.emoji} ${r.count}`;
        });

        pill.appendChild(span);
    });

    bubbleEntry.el.querySelector('.tg-bubble-content')?.appendChild(pill);
}

/* =====================================================
   AUTO-REACTION + CROWD SIMULATION
===================================================== */
function autoReactToMessage(message){
    if(!message || !window.TGRenderer?.MESSAGE_MAP) return;

    if(!message.reactions) message.reactions = [];

    // 25% random reaction
    if(Math.random()<0.25){
        const emojiPool = ["🔥","💯","👍","💹","🚀","✨","👏"];
        const reaction = emojiPool[Math.floor(Math.random()*emojiPool.length)];
        message.reactions.push({ emoji: reaction, count: Math.floor(Math.random()*5)+1 });
    }

    // Crowd clicks
    if(Math.random()<0.4 && window.identity){
        const crowdClicks = Math.floor(Math.random()*3)+1;
        for(let i=0;i<crowdClicks;i++){
            if(message.reactions.length===0) break;
            const r = message.reactions[Math.floor(Math.random()*message.reactions.length)];
            r.count += 1;
        }
    }

    const bubbleEntry = window.TGRenderer.MESSAGE_MAP.get(message.id);
    renderReactions(bubbleEntry, message.reactions);
}

/* =====================================================
   JOINER REPLIES
===================================================== */
function simulateJoinerReply(joinerPersona){
    const text = getRandomReply();
    const randomComment = window.realismEngineV12Pool[Math.floor(Math.random()*window.realismEngineV12Pool.length)];
    enqueueInteraction({ persona: joinerPersona, text, parentText: randomComment?.text, parentId: randomComment?.id });
    autoReactToMessage(randomComment);
}

/* =====================================================
   POOL INIT
===================================================== */
if(!window.realismEngineV12Pool) window.realismEngineV12Pool = [];

if(window.realismEngineV12Pool.length === 0){
    const fillerComments = [
        { text: "Hello everyone! 👋", timestamp: new Date() },
        { text: "Watching the market today 🚀", timestamp: new Date() },
        { text: "Any updates on BTC?", timestamp: new Date() },
        { text: "Good morning all!", timestamp: new Date() }
    ];
    window.realismEngineV12Pool.push(...fillerComments);
}

/* =====================================================
   PUBLIC API
===================================================== */
window.interactions = {
    enqueue: enqueueInteraction,
    simulateReply: function(persona, parentMessage){
        const text = getRandomReply();
        enqueueInteraction({ persona, text, parentText: parentMessage?.text, parentId: parentMessage?.id });
        autoReactToMessage(parentMessage);
    },
    react: autoReactToMessage,
    joinReply: simulateJoinerReply
};

/* =====================================================
   AUTO SIMULATION LOOP
===================================================== */
function autoSimulate(){
    if(!window.realismEngineV12Pool || window.realismEngineV12Pool.length===0) return;
    if(!window.identity?.getRandomPersona) return;

    const persona = window.identity.getRandomPersona();
    const randomComment = window.realismEngineV12Pool[Math.floor(Math.random()*window.realismEngineV12Pool.length)];
    if(!randomComment) return;

    window.interactions.simulateReply(persona, randomComment);

    // Occasionally simulate a joiner reply
    if(Math.random()<0.08){
        const joiner = window.identity.getRandomPersona();
        if(joiner) window.interactions.joinReply(joiner);
    }

    const nextInterval = 800 + Math.random()*2500;
    setTimeout(autoSimulate, nextInterval);
}

// start simulation when pool is ready
function startSimulation(){
    if(!window.realismEngineV12Pool || window.realismEngineV12Pool.length === 0 || !window.identity?.getRandomPersona){
        return setTimeout(startSimulation, 500);
    }
    autoSimulate();
}

setTimeout(startSimulation, 1200);

console.log("✅ Interactions V14.4 — fully synced crowd reactions + joiners + typing + pills + timestamps.");
})();
