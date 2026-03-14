// interactions-v14.1-crowd-join-replies-typing-auto-hide.js
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

        // **Header typing event**
        if(persona?.name){
            const typingEvent = new CustomEvent("headerTyping", { detail: { name: persona.name } });
            document.dispatchEvent(typingEvent);

            // Auto-hide typing after duration
            const duration = window.TGRenderer?.calculateTypingDuration?.(text) || 1200;
            setTimeout(() => {
                const stopEvent = new CustomEvent("headerTypingStop", { detail: { name: persona.name } });
                document.dispatchEvent(stopEvent);
            }, duration);
        }

        const typingDuration = window.TGRenderer?.calculateTypingDuration?.(text) || 1200;
        await new Promise(res => setTimeout(res, typingDuration + 200));

        const opts = {};
        if(parentText || parentId){
            opts.replyToId = parentId;
            opts.replyToText = parentText;
        }

        // Append message via TGRenderer
        if(window.TGRenderer?.appendMessage){
            const msgId = window.TGRenderer.appendMessage(persona, text, opts);
            interaction._msgId = msgId;
        }
    }

    processingQueue = false;
}

/* =====================================================
   RANDOM AUTO-REPLIES
===================================================== */
const REPLY_TEMPLATES = [
    "Yes, I agree!","Exactly 💯","Nice point 👍","I’ve been thinking the same.",
    "Can you elaborate?","Interesting 🤔","😂 That’s funny!","Absolutely 🚀",
    "Good catch!","Thanks for sharing 💡","Welcome aboard! 👋","Glad to be here!",
    "Excited to join the discussion!","I second that!","Love this insight!",
    "True that!","Well explained 💯","Interesting perspective","Couldn't agree more 👍"
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
   AUTO-REACTION TRIGGERS
===================================================== */
function autoReactToMessage(message){
    if(!message || !window.TGRenderer?.MESSAGE_MAP) return;
    if(!message.reactions) message.reactions = [];

    if(Math.random() < 0.25){
        const emojiPool = ["🔥","💯","👍","💹","🚀","✨","👏"];
        const reaction = emojiPool[Math.floor(Math.random()*emojiPool.length)];
        message.reactions.push({ emoji: reaction, count: Math.floor(Math.random()*5)+1 });
    }

    if(Math.random() < 0.4 && window.identity){
        const crowdClicks = Math.floor(Math.random()*3)+1;
        for(let i=0; i<crowdClicks; i++){
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
    const randomComment = window.realismEngineV12Pool[Math.floor(Math.random()*window.realismEngineV12Pool.length)];
    enqueueInteraction({ persona: joinerPersona, text, parentText: randomComment?.text, parentId: randomComment?.id });
    autoReactToMessage(randomComment);

    if(window.TGRenderer?.appendJoinSticker){
        window.TGRenderer.appendJoinSticker([joinerPersona.name]);
    }
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

    const nextInterval = 800 + Math.random()*2500;
    setTimeout(autoSimulate, nextInterval);
}

setTimeout(autoSimulate, 1200);

console.log("✅ Interactions V14.1 — crowd reactions + joiner replies + header typing auto-hide integrated.");

})();
