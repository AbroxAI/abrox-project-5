// interactions-v14.2-crowd-join-replies.js — Crowd-reacting pills + joiner replies with extended replies
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

        const typingDuration = window.TGRenderer?.calculateTypingDuration?.(text) || 1200;
        await new Promise(res => setTimeout(res, typingDuration + 200));
    }

    processingQueue = false;
}

/* =====================================================
   RANDOM AUTO-REPLIES (EXTENDED)
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
    "Count me in!",
    "Looking forward to this!",
    "Great insight!",
    "Love this perspective!",
    "Couldn’t agree more 😎",
    "This is really helpful!",
    "I’ve noticed the same",
    "Following closely 👀",
    "Interesting take!",
    "I’ll try that approach",
    "Haha, that’s hilarious 😂",
    "Well spotted!",
    "Thanks for pointing that out 💡",
    "Perfect timing!",
    "Exactly what I was thinking",
    "Appreciate the clarification 👍",
    "That’s a solid observation 👏",
    "I can relate to this",
    "Definitely worth considering",
    "Adding this to my notes 📝",
    "Glad to learn this!",
    "I was wondering the same thing",
    "Super insightful 🚀",
    "Love the energy here 🔥",
    "This explains a lot",
    "So true! 💯",
    "I need to remember this",
    "Noted, thanks!",
    "This makes sense",
    "Interesting approach",
    "I’ll keep an eye on that 👀",
    "Valuable contribution 💎",
    "Amazing point!",
    "Thanks for sharing your experience",
    "This is next-level stuff",
    "I like this perspective 👍",
    "Very well explained",
    "Totally resonates with me",
    "Good to know!",
    "That’s quite useful",
    "Wow, didn’t think of that",
    "Agree completely",
    "Appreciate the insight",
    "Excellent example",
    "Brilliant explanation 💡",
    "I’ve learned something new today"
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

    if(Math.random()<0.25){
        const emojiPool = ["🔥","💯","👍","💹","🚀","✨","👏"];
        const reaction = emojiPool[Math.floor(Math.random()*emojiPool.length)];
        message.reactions.push({ emoji: reaction, count: Math.floor(Math.random()*5)+1 });
    }

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

    if(Math.random()<0.08){
        const joiner = window.identity?.getRandomPersona();
        if(joiner) window.interactions.joinReply(joiner);
    }

    const nextInterval = 800 + Math.random()*2500;
    setTimeout(autoSimulate, nextInterval);
}

setTimeout(autoSimulate, 1200);

console.log("✅ Interactions V14.2 — crowd reactions + joiner replies with extended reply pool fully integrated.");

})();
