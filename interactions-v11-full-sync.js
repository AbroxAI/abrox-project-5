// interactions-v11-full-sync.js — Full interaction manager (auto-replies, reactions, queued typing)
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

        if(parentText || parentId){
            document.dispatchEvent(new CustomEvent('autoReply', {
                detail: { persona, text, parentText, parentId }
            }));
        } else {
            document.dispatchEvent(new CustomEvent('autoReply', {
                detail: { persona, text }
            }));
        }

        const typingDuration = window.TGRenderer?.calculateTypingDuration?.(text) || 1200;
        await new Promise(res => setTimeout(res, typingDuration + 200));
    }

    processingQueue = false;
}

/* =====================================================
   RANDOM AUTO-REPLIES
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
    "Thanks for sharing 💡"
];

function getRandomReply(){
    return REPLY_TEMPLATES[Math.floor(Math.random()*REPLY_TEMPLATES.length)];
}

/* =====================================================
   AUTO-TRIGGER SIMULATION
===================================================== */
function simulateInteraction(persona, parentMessage){
    const text = getRandomReply();
    enqueueInteraction({ persona, text, parentText: parentMessage?.text, parentId: parentMessage?.id });
}

/* =====================================================
   AUTO-REACTION TRIGGERS
===================================================== */
function autoReactToMessage(message){
    if(!message || !window.TGRenderer?.appendMessage) return;
    if(Math.random()<0.25){ // 25% chance to add reaction
        const emojiPool = ["🔥","💯","👍","💹","🚀","✨","👏"];
        const reaction = emojiPool[Math.floor(Math.random()*emojiPool.length)];
        if(!message.reactions) message.reactions=[];
        message.reactions.push({ emoji: reaction, count: Math.floor(Math.random()*5)+1 });
    }
}

/* =====================================================
   PUBLIC API
===================================================== */
window.interactions = {
    enqueue: enqueueInteraction,
    simulateReply: simulateInteraction,
    react: autoReactToMessage
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

    simulateInteraction(persona, randomComment);

    const nextInterval = 800 + Math.random()*2500;
    setTimeout(autoSimulate, nextInterval);
}

setTimeout(autoSimulate, 1200);

console.log("✅ Interactions V11 Full Sync — auto-replies, reactions, and queue enabled.");

})();
