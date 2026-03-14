// interactions-realism-full-v14.4.js — Unified interactions + realism engine with merged joiners & smooth scroll
(function(){
'use strict';

/* =====================================================
   SHARED JOINERS QUEUE
===================================================== */
let pendingJoiners = [];
let joinerTimeout;

function queueJoiner(joinerPersona){
    if(!joinerPersona?.name) return;
    pendingJoiners.push(joinerPersona.name);

    if(joinerTimeout) clearTimeout(joinerTimeout);

    joinerTimeout = setTimeout(()=>{
        if(window.TGRenderer?.appendJoinSticker){
            window.TGRenderer.appendJoinSticker(pendingJoiners);

            const container = document.getElementById('tg-comments-container');
            if(container){
                container.scrollTo({ top: container.scrollHeight, behavior:'smooth' });
            }
        }
        pendingJoiners=[];
    },1200);
}

/* =====================================================
   INTERACTION QUEUE
===================================================== */
const interactionQueue=[];
let processingQueue=false;

function enqueueInteraction(interaction){
    if(!interaction||!interaction.persona||!interaction.text) return;
    interactionQueue.push(interaction);
    processQueue();
}

async function processQueue(){
    if(processingQueue||interactionQueue.length===0) return;
    processingQueue=true;

    while(interactionQueue.length>0){
        const inter=interactionQueue.shift();
        const {persona,text,parentText,parentId,meta}=inter;
        if(!persona||!text) continue;

        // HEADER TYPING
        if(persona?.name){
            document.dispatchEvent(new CustomEvent("headerTyping",{detail:{name:persona.name}}));
            const duration = window.TGRenderer?.calculateTypingDuration?.(text)||1200;
            setTimeout(()=>document.dispatchEvent(new CustomEvent("headerTypingStop",{detail:{name:persona.name}})),duration);
        }

        const typingDuration = window.TGRenderer?.calculateTypingDuration?.(text)||1200;
        await new Promise(r=>setTimeout(r,typingDuration+200));

        const opts={};
        if(parentText||parentId){ opts.replyToId=parentId; opts.replyToText=parentText; }
        if(meta){
            if(meta.reaction) opts.reactions=[{emoji:meta.reaction,count:Math.floor(Math.random()*4)+1}];
            if(meta.pill) opts.pill=meta.pill;
            if(meta.jumper) opts.jumper=meta.jumper;
            if(meta.sticker) opts.sticker=meta.sticker;
        }

        if(window.TGRenderer?.appendMessage){
            const msgId=window.TGRenderer.appendMessage(persona,text,opts);
            inter._msgId=msgId;
        }
    }
    processingQueue=false;
}

/* =====================================================
   RANDOM REPLIES
===================================================== */
const REPLY_TEMPLATES=[
"Yes, I agree!","Exactly 💯","Nice point 👍","I’ve been thinking the same.",
"Can you elaborate?","Interesting 🤔","😂 That’s funny!","Absolutely 🚀",
"Good catch!","Thanks for sharing 💡","Welcome aboard! 👋","Glad to be here!",
"Excited to join the discussion!","I second that!","Love this insight!",
"True that!","Well explained 💯","Interesting perspective","Couldn't agree more 👍"
];

function getRandomReply(){ return REPLY_TEMPLATES[Math.floor(Math.random()*REPLY_TEMPLATES.length)]; }

/* =====================================================
   REACTIONS
===================================================== */
function renderReactions(bubbleEntry,reactions){
    if(!bubbleEntry||!bubbleEntry.el) return;
    let pill=bubbleEntry.el.querySelector('.tg-bubble-reactions');
    if(pill) pill.remove();
    pill=document.createElement('div');
    pill.className='tg-bubble-reactions';
    reactions.forEach(r=>{
        const span=document.createElement('span');
        span.className='reaction';
        span.textContent=`${r.emoji} ${r.count}`;
        span.style.cursor='pointer';
        span.addEventListener('mouseenter',()=>span.style.backgroundColor='#eee');
        span.addEventListener('mouseleave',()=>span.style.backgroundColor='');
        span.addEventListener('click',()=>{ r.count+=1; span.textContent=`${r.emoji} ${r.count}`; });
        pill.appendChild(span);
    });
    bubbleEntry.el.querySelector('.tg-bubble-content')?.appendChild(pill);
}

function autoReactToMessage(message){
    if(!message||!window.TGRenderer) return;
    if(!message.reactions) message.reactions=[];
    if(Math.random()<0.25){
        const emojiPool=["🔥","💯","👍","💹","🚀","✨","👏"];
        message.reactions.push({ emoji:emojiPool[Math.floor(Math.random()*emojiPool.length)], count:Math.floor(Math.random()*5)+1 });
    }
    if(Math.random()<0.4&&window.identity){
        const crowdClicks=Math.floor(Math.random()*3)+1;
        for(let i=0;i<crowdClicks;i++){
            if(message.reactions.length===0) break;
            const r=message.reactions[Math.floor(Math.random()*message.reactions.length)];
            r.count+=1;
        }
    }
    const bubbleEntry=window.TGRenderer.MESSAGE_MAP?.get(message.id);
    renderReactions(bubbleEntry,message.reactions);
}

/* =====================================================
   JOINER REPLIES
===================================================== */
function simulateJoinerReply(joinerPersona){
    const text=getRandomReply();
    const randomComment=window.realismEngineV12Pool?.[Math.floor(Math.random()*window.realismEngineV12Pool.length)];
    enqueueInteraction({ persona:joinerPersona, text, parentText:randomComment?.text, parentId:randomComment?.id });
    autoReactToMessage(randomComment);
    queueJoiner(joinerPersona);
}

/* =====================================================
   PUBLIC API
===================================================== */
window.interactions={
    enqueue:enqueueInteraction,
    simulateReply:function(persona,parentMessage){
        const text=getRandomReply();
        enqueueInteraction({ persona,text,parentText:parentMessage?.text,parentId:parentMessage?.id });
        autoReactToMessage(parentMessage);
    },
    react:autoReactToMessage,
    joinReply:simulateJoinerReply
};

/* =====================================================
   AUTO SIMULATION LOOP
===================================================== */
function autoSimulate(){
    if(!window.realismEngineV12Pool||window.realismEngineV12Pool.length===0) return;
    const persona=window.identity?.getRandomPersona();
    if(!persona) return;
    const randomComment=window.realismEngineV12Pool[Math.floor(Math.random()*window.realismEngineV12Pool.length)];
    if(!randomComment) return;
    window.interactions.simulateReply(persona,randomComment);

    // batch joiners with shared queue
    if(Math.random()<0.15){
        const joinerCount=1+Math.floor(Math.random()*3);
        for(let i=0;i<joinerCount;i++){
            const joiner=window.identity?.getRandomPersona();
            if(joiner) window.interactions.joinReply(joiner);
        }
    }

    const nextInterval=800+Math.random()*2500;
    setTimeout(autoSimulate,nextInterval);
}

setTimeout(autoSimulate,1200);
console.log("✅ Interactions + Realism Engine unified v14.4 — shared joiners queue, smooth scroll, batch joiners, reactions, header typing ready.");

})();
