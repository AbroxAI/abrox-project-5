// interactions-v14.2-full-realtime.js — Crowd + joiners + live reactions
(function(){

'use strict';

/* =====================================================
   INTERACTION QUEUE
===================================================== */
const interactionQueue = [];
let processingQueue = false;

function enqueueInteraction(interaction){
    if(!interaction || !interaction.persona || !interaction.text) return;
    interactionQueue.push(interaction);
    processQueue();
}

async function processQueue(){
    if(processingQueue || interactionQueue.length===0) return;
    processingQueue = true;

    while(interactionQueue.length>0){
        const interaction = interactionQueue.shift();
        const { persona, text, parentText, parentId } = interaction;

        if(!persona || !text) continue;

        const opts = {};
        if(parentText || parentId){
            opts.replyToId = parentId;
            opts.replyToText = parentText;
        }

        if(window.TGRenderer?.appendMessage){
            const msgId = window.TGRenderer.appendMessage(persona, text, opts);
            interaction._msgId = msgId;
        }

        // Simulate typing duration
        const duration = window.TGRenderer?.calculateTypingDuration?.(text) || 1200;
        await new Promise(res => setTimeout(res, duration + 200));
    }

    processingQueue = false;
}

/* =====================================================
   RANDOM AUTO-REPLIES / JOINER MESSAGES
===================================================== */
const REPLY_TEMPLATES = [
    "Yes, I agree!", "Exactly 💯", "Nice point 👍", "I’ve been thinking the same.",
    "Can you elaborate?", "Interesting 🤔", "😂 That’s funny!", "Absolutely 🚀",
    "Good catch!", "Thanks for sharing 💡", "Welcome aboard! 👋",
    "Glad to be here!", "Excited to join the discussion!", "Looking forward to more updates!",
    "This is interesting!", "Agreed with the last point", "Haha, spot on!", "Totally makes sense",
    "I was just thinking the same", "Nice analysis!", "Good strategy insight!", "Well explained!",
    "Excited to see the results!", "Following along 👀", "Great discussion so far!"
];

function getRandomReply(){
    return REPLY_TEMPLATES[Math.floor(Math.random()*REPLY_TEMPLATES.length)];
}

/* =====================================================
   REACTION PILL HANDLER
===================================================== */
function renderReactions(bubbleEntry, reactions){
    if(!bubbleEntry || !bubbleEntry.el) return;

    let pill = bubbleEntry.el.querySelector('.tg-bubble-reactions');
    if(pill) pill.remove();

    pill = document.createElement('div');
    pill.className = 'tg-bubble-reactions';

    reactions.forEach(r => {
        const span = document.createElement('span');
        span.className = 'reaction';
        span.textContent = `${r.emoji} ${r.count}`;
        span.style.cursor = 'pointer';

        span.addEventListener('mouseenter', () => span.style.backgroundColor = '#eee');
        span.addEventListener('mouseleave', () => span.style.backgroundColor = '');
        span.addEventListener('click', () => {
            r.count += 1;
            span.textContent = `${r.emoji} ${r.count}`;
        });

        pill.appendChild(span);
    });

    bubbleEntry.el.querySelector('.tg-bubble-content')?.appendChild(pill);
}

/* =====================================================
   AUTO-REACTION TRIGGERS + CROWD SIMULATION
===================================================== */
function autoReactToMessage(message){
    if(!message || !window.TGRenderer?.MESSAGE_MAP) return;

    if(!message.reactions) message.reactions = [];

    // Base 25% chance for random reaction
    if(Math.random() < 0.25){
        const emojis = ["🔥","💯","👍","💹","🚀","✨","👏"];
        message.reactions.push({ emoji: emojis[Math.floor(Math.random()*emojis.length)], count: Math.floor(Math.random()*5)+1 });
    }

    // Crowd simulation
    if(Math.random() < 0.5 && window.identity){
        const extraClicks = Math.floor(Math.random()*3)+1;
        for(let i=0;i<extraClicks;i++){
            if(message.reactions.length === 0) break;
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
    // Get a random existing comment to reply to
    let randomComment = null;
    if(window.realismEngineV12Pool?.length > 0){
        randomComment = window.realismEngineV12Pool[Math.floor(Math.random()*window.realismEngineV12Pool.length)];
    }
    enqueueInteraction({ persona: joinerPersona, text, parentText: randomComment?.text, parentId: randomComment?.id });
    if(randomComment) autoReactToMessage(randomComment);
}

/* =====================================================
   PUBLIC API
===================================================== */
window.interactions = {
    enqueue: enqueueInteraction,
    simulateReply: function(persona, parentMessage){
        const text = getRandomReply();
        enqueueInteraction({ persona, text, parentText: parentMessage?.text, parentId: parentMessage?.id });
        if(parentMessage) autoReactToMessage(parentMessage);
    },
    react: autoReactToMessage,
    joinReply: simulateJoinerReply
};

/* =====================================================
   POOL MANAGEMENT
===================================================== */
function ensurePoolFull(min=100){
    if(!window.realismEngineV12Pool) window.realismEngineV12Pool = [];
    while(window.realismEngineV12Pool.length < min){
        const comment = { text: getRandomReply(), id: `pool_${Date.now()}_${Math.floor(Math.random()*9999)}` };
        window.realismEngineV12Pool.push(comment);
    }
}

/* =====================================================
   AUTO SIMULATION LOOP
===================================================== */
function autoSimulate(){
    ensurePoolFull(100);

    const persona = window.identity?.getRandomPersona();
    if(!persona) return;

    const randomComment = window.realismEngineV12Pool[Math.floor(Math.random()*window.realismEngineV12Pool.length)];
    if(!randomComment) return;

    window.interactions.simulateReply(persona, randomComment);

    // Occasionally simulate a joiner reply
    if(Math.random() < 0.1){
        const joiner = window.identity?.getRandomPersona();
        if(joiner) window.interactions.joinReply(joiner);
    }

    const nextInterval = 800 + Math.random()*2000;
    setTimeout(autoSimulate, nextInterval);
}

setTimeout(autoSimulate, 1200);

console.log("✅ Interactions V14.2 — continuous crowd + joiners + live reactions fully synced.");

})();
