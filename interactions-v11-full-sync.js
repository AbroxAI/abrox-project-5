// interactions-v14.2-crowd-join-replies.js — Full self-contained crowd + joiners + reactions
(function(){

'use strict';

/* =====================================================
   MOCK PERSONAS
===================================================== */
if (!window.identity) window.identity = {};
if (!window.identity.getRandomPersona) {
    const personas = [
        { name: "Alice" }, { name: "Bob" }, { name: "Charlie" }, { name: "Dave" },
        { name: "Eve" }, { name: "Frank" }, { name: "Grace" }, { name: "Hannah" }
    ];
    window.identity.getRandomPersona = () => personas[Math.floor(Math.random()*personas.length)];
}
if (!window.identity.Admin) window.identity.Admin = { name: "Admin" };

/* =====================================================
   MOCK TGRenderer
===================================================== */
if (!window.TGRenderer) {
    window.TGRenderer = {
        MESSAGE_MAP: new Map(),
        appendMessage: (persona, text, opts={}) => {
            const id = opts.id || `msg_${Date.now()}_${Math.floor(Math.random()*9999)}`;
            console.log(`[MSG] ${persona.name}: ${text}`);
            window.TGRenderer.MESSAGE_MAP.set(id, { el: document.body, id });
            return id;
        },
        appendJoinSticker: (joiners) => console.log(`👥 Joiners: ${joiners.join(", ")}`),
        calculateTypingDuration: text => Math.min(text.length * 50, 1500)
    };
}

/* =====================================================
   DATA POOLS
===================================================== */
const ASSETS = ["EUR/USD","USD/JPY","GBP/USD","AUD/USD","BTC/USD","ETH/USD","USD/CHF","EUR/JPY","NZD/USD"];
const BROKERS = ["IQ Option","Binomo","Pocket Option","Deriv","Olymp Trade"];
const TIMEFRAMES = ["M1","M5","M15","M30","H1"];
const RESULT_WORDS = ["profit","loss","win","missed entry","recovered","scalped nicely"];
const TESTIMONIALS = ["Made $450 in 2 hours","Closed 3 trades all green","Recovered a losing trade","7 days straight of profit"];
const EMOJIS = ["💸","🔥","💯","🚀","✨","👍","💹","👏"];

const POOL = [];
window.realismEngineV12Pool = POOL;

/* =====================================================
   UTILITIES
===================================================== */
function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function maybe(p){ return Math.random() < p; }
function rand(max=9999){ return Math.floor(Math.random()*max); }

function generateTimestamp(days=120){
    return new Date(Date.now() - Math.random()*days*86400000);
}

function generateComment(){
    const templates = [
        ()=>`Guys, ${random(TESTIMONIALS)}`,
        ()=>`Anyone trading ${random(ASSETS)} on ${random(BROKERS)}?`,
        ()=>`Signal for ${random(ASSETS)} ${random(TIMEFRAMES)} is ${random(RESULT_WORDS)}`,
        ()=>`Closed ${random(ASSETS)} on ${random(TIMEFRAMES)} — ${random(RESULT_WORDS)}`,
        ()=>`Just entered ${random(ASSETS)} ${random(TIMEFRAMES)}, let's see`,
        ()=>`Watching ${random(ASSETS)} closely today`
    ];
    let text = random(templates)();
    if(maybe(0.35)) text += " — " + random(["good execution","tight stop","no slippage"]);
    if(maybe(0.45)) text += " " + random(EMOJIS);
    return { text, timestamp: generateTimestamp() };
}

function ensurePool(min=5000){
    while(POOL.length < min){
        POOL.push(generateComment());
        if(POOL.length > 20000) break;
    }
}

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

        const opts = {};
        if(parentText || parentId){
            opts.replyToId = parentId;
            opts.replyToText = parentText;
        }

        const msgId = window.TGRenderer.appendMessage(persona, text, opts);
        interaction._msgId = msgId;

        await new Promise(res => setTimeout(res, window.TGRenderer.calculateTypingDuration(text)+200));
    }

    processingQueue = false;
}

/* =====================================================
   AUTO-REPLIES
===================================================== */
const REPLY_TEMPLATES = [
    "Yes, I agree!","Exactly 💯","Nice point 👍","I’ve been thinking the same",
    "Can you elaborate?","Interesting 🤔","😂 That’s funny!","Absolutely 🚀",
    "Good catch!","Thanks for sharing 💡","Welcome aboard! 👋","Glad to be here!","Excited to join the discussion!"
];

function getRandomReply(){
    return REPLY_TEMPLATES[Math.floor(Math.random()*REPLY_TEMPLATES.length)];
}

/* =====================================================
   REACTIONS
===================================================== */
function renderReactions(bubbleEntry, reactions){
    if(!bubbleEntry || !bubbleEntry.el) return;
    let pill = bubbleEntry.el.querySelector('.tg-bubble-reactions');
    if(pill) pill.remove();
    pill = document.createElement('div');
    pill.className = 'tg-bubble-reactions';

    reactions.forEach(r=>{
        const span = document.createElement('span');
        span.className='reaction';
        span.textContent = `${r.emoji} ${r.count}`;
        span.style.cursor='pointer';
        span.addEventListener('click', ()=>{ r.count+=1; span.textContent=`${r.emoji} ${r.count}` });
        pill.appendChild(span);
    });

    bubbleEntry.el.querySelector('.tg-bubble-content')?.appendChild(pill);
}

function autoReactToMessage(message){
    if(!message || !window.TGRenderer?.MESSAGE_MAP) return;
    if(!message.reactions) message.reactions=[];
    if(Math.random()<0.25){
        const emojiPool = ["🔥","💯","👍","💹","🚀","✨","👏"];
        message.reactions.push({ emoji: random(emojiPool), count: rand(5)+1 });
    }
    if(Math.random()<0.4){
        const crowdClicks = Math.floor(Math.random()*3)+1;
        for(let i=0;i<crowdClicks;i++){
            if(message.reactions.length===0) break;
            const r = message.reactions[Math.floor(Math.random()*message.reactions.length)];
            r.count+=1;
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
    const persona = window.identity.getRandomPersona();
    const randomComment = window.realismEngineV12Pool[Math.floor(Math.random()*window.realismEngineV12Pool.length)];
    window.interactions.simulateReply(persona, randomComment);

    // Joiner reply occasionally
    if(Math.random()<0.08){
        const joiner = window.identity.getRandomPersona();
        window.interactions.joinReply(joiner);
    }

    const nextInterval = 800 + Math.random()*2500;
    setTimeout(autoSimulate, nextInterval);
}

/* =====================================================
   INIT
===================================================== */
setTimeout(()=>{
    ensurePool(5000);
    autoSimulate();
    console.log("✅ Interactions V14.2 — fully real crowd + joiners + reactions running!");
}, 900);

})();
