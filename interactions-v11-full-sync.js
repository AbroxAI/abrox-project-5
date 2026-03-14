// interactions-v14.4-realtime.js — reactions + joiners + header typing + timestamps
(function(){

'use strict';

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

        const opts = { parentText, parentId, timestamp: new Date() };

        // HEADER TYPING
        await headerTyping(persona, text);

        // APPEND MESSAGE
        const msgId = window.TGRenderer?.appendMessage?.(persona, text, opts);
        interaction._msgId = msgId;

        // Render reactions if any
        if(interaction.reactions) renderReactions(msgId, interaction.reactions);

        // Append timestamp inside bubble
        const bubble = window.TGRenderer?.MESSAGE_MAP?.get(msgId)?.el;
        if(bubble){
            let timeEl = bubble.querySelector('.tg-bubble-timestamp');
            if(!timeEl){
                timeEl = document.createElement('span');
                timeEl.className = 'tg-bubble-timestamp';
                timeEl.style.fontSize = '10px';
                timeEl.style.opacity = 0.5;
                timeEl.style.marginLeft = '6px';
                bubble.querySelector('.tg-bubble-content')?.appendChild(timeEl);
            }
            timeEl.textContent = new Date().toLocaleTimeString();
        }
    }

    processingQueue = false;
}

// ===================== HEADER TYPING =====================
async function headerTyping(persona, text){
    if(!persona?.name) return;
    const evt = new CustomEvent('headerTyping', { detail: { name: persona.name } });
    document.dispatchEvent(evt);
    const duration = window.TGRenderer?.calculateTypingDuration?.(text) || 1200;
    await new Promise(res => setTimeout(res, duration));
    document.dispatchEvent(new CustomEvent('headerTypingDone', { detail: { name: persona.name } }));
}

// ===================== REACTIONS =====================
function renderReactions(msgId, reactions){
    const bubbleEntry = window.TGRenderer?.MESSAGE_MAP?.get(msgId);
    if(!bubbleEntry || !bubbleEntry.el) return;

    let pill = bubbleEntry.el.querySelector('.tg-bubble-reactions');
    if(pill) pill.remove();
    pill = document.createElement('div');
    pill.className = 'tg-bubble-reactions';

    reactions.forEach(r=>{
        const span = document.createElement('span');
        span.className = 'reaction';
        span.textContent = `${r.emoji} ${r.count}`;
        span.style.cursor = 'pointer';
        span.addEventListener('click', ()=>{
            r.count++;
            span.textContent = `${r.emoji} ${r.count}`;
        });
        pill.appendChild(span);
    });

    bubbleEntry.el.querySelector('.tg-bubble-content')?.appendChild(pill);
}

// ===================== AUTO-REACTION =====================
function autoReactToMessage(message){
    if(!message) return;
    if(!message.reactions) message.reactions=[];
    const emojiPool = ["🔥","💯","👍","🚀","✨","👏"];
    if(Math.random()<0.25){
        message.reactions.push({ emoji: emojiPool[Math.floor(Math.random()*emojiPool.length)], count: Math.floor(Math.random()*5)+1 });
    }
    renderReactions(message._msgId || message.id, message.reactions);
}

// ===================== JOINER =====================
function simulateJoiner(persona){
    const text = `${persona.name} joined the chat 👋`;
    const joinMsg = { persona, text, reactions: [] };
    enqueueInteraction(joinMsg);

    // Also trigger join sticker
    if(window.TGRenderer?.appendJoinSticker) window.TGRenderer.appendJoinSticker([persona.name]);
}

// ===================== AUTO-REPLIES =====================
const REPLY_TEMPLATES = [
    "Yes, I agree!","Exactly 💯","Nice point 👍","I’ve been thinking the same",
    "Can you elaborate?","Interesting 🤔","😂 That’s funny!","Absolutely 🚀",
    "Good catch!","Thanks for sharing 💡","Welcome aboard! 👋","Glad to be here",
    "Excited to join the discussion!"
];
function getRandomReply(){ return REPLY_TEMPLATES[Math.floor(Math.random()*REPLY_TEMPLATES.length)]; }

// ===================== PUBLIC API =====================
window.interactions = {
    enqueue: enqueueInteraction,
    simulateReply: (persona, parentMessage)=>{
        const text = getRandomReply();
        const interaction = { persona, text, parentText: parentMessage?.text, parentId: parentMessage?.id, reactions: [] };
        enqueueInteraction(interaction);
        if(parentMessage) autoReactToMessage(parentMessage);
    },
    react: autoReactToMessage,
    join: simulateJoiner
};

// ===================== AUTO SIMULATION =====================
function autoSimulate(){
    if(!window.realismEngineV12Pool || window.realismEngineV12Pool.length===0) return;
    const persona = window.identity?.getRandomPersona();
    if(!persona) return;
    const randomComment = window.realismEngineV12Pool[Math.floor(Math.random()*window.realismEngineV12Pool.length)];
    if(!randomComment) return;

    window.interactions.simulateReply(persona, randomComment);

    if(Math.random()<0.08){ 
        const joiner = window.identity?.getRandomPersona();
        if(joiner) window.interactions.join(joiner);
    }

    setTimeout(autoSimulate, 800 + Math.random()*2500);
}

setTimeout(autoSimulate, 1200);

console.log("✅ Interactions V14.4 — header typing, reactions, joiners, and timestamps enabled.");

})();
