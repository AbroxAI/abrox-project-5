// interactions-fixed.js — user interaction + typing system (Telegram 2026 style)
(function(){
"use strict";

/* =====================================================
   UTIL
===================================================== */
function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }
function rand(min,max){ return Math.floor(Math.random()*(max-min)+min); }
function chance(p){ return Math.random() < p; }

/* =====================================================
   WAIT FOR SYSTEM
===================================================== */
async function waitForReady(timeout=30000){
  let waited=0;
  while((!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage) && waited<timeout){
    await delay(50);
    waited+=50;
  }
  return true;
}

/* =====================================================
   HEADER TYPING INDICATOR + Animated Bubble
===================================================== */
const metaLine=document.getElementById("tg-meta-line");
let typingActive=false;
const activeTypingBubbles = new Map();

function showTypingBubble(persona){
  if(!metaLine || !persona?.name) return;

  // create animated bubble if not exist
  if(!activeTypingBubbles.has(persona.name)){
    const bubble = document.createElement('div');
    bubble.className = 'tg-typing-bubble';
    bubble.innerHTML = `
      <span class="tg-avatar-dot" style="background-image:url(${persona.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name)}`}"></span>
      <span class="tg-dot-animation"><span></span><span></span><span></span></span>
    `;
    metaLine.parentNode.appendChild(bubble);
    activeTypingBubbles.set(persona.name, bubble);
  }
  typingActive = true;
}

function hideTypingBubble(persona){
  const bubble = activeTypingBubbles.get(persona.name);
  if(bubble){
    bubble.remove();
    activeTypingBubbles.delete(persona.name);
  }
  if(activeTypingBubbles.size === 0) typingActive=false;
}

/* =====================================================
   QUEUED TYPING (GLOBAL)
===================================================== */
let typingQueue=Promise.resolve();

window.queuedTyping=function(persona,text,isHistory=false){
  typingQueue=typingQueue.then(async()=>{
    if(!persona?.name) return;

    // Skip typing for old historical messages
    if(isHistory) return;

    showTypingBubble(persona);

    // Variable typing speed
    const minSpeed=30, maxSpeed=70; // ms per character
    let typingTime = Math.min(text.length*rand(minSpeed,maxSpeed), 6000);

    // occasional pauses for realism
    let elapsed=0;
    while(elapsed < typingTime){
      let chunk=rand(300,800);
      await delay(chunk);
      if(chance(0.1)) await delay(rand(200,600));
      elapsed += chunk;
    }

    hideTypingBubble(persona);
  });
  return typingQueue;
};

/* =====================================================
   USER SEND MESSAGE
===================================================== */
const input=document.getElementById("tg-input");
const sendBtn=document.getElementById("tg-send");

async function sendUserMessage(){
  if(!input) return;
  const text=input.value.trim();
  if(!text) return;
  if(!await waitForReady()) return;

  const userPersona={ name:"You", avatar:null };

  // append outgoing message
  window.TGRenderer.appendMessage(userPersona,text,{timestamp:new Date(),type:"outgoing"});
  input.value="";

  scrollToBottom();
  simulateReply(text);
}

/* =====================================================
   BOT REPLY
===================================================== */
async function simulateReply(userText){
  await delay(rand(1200,3500));

  try{
    const persona=window.identity.getRandomPersona();
    if(!persona) return;

    let reply=null;

    if(window.realism?.generateReply){
      reply=window.realism.generateReply(userText,persona);
    }

    if(!reply && window.realism?.postFallbackReply){
      return window.realism.postFallbackReply(userText);
    }

    // simulate queued typing (recent messages only)
    await window.queuedTyping(persona,reply,false);

    window.TGRenderer.appendMessage(persona,reply,{timestamp:new Date(),type:"incoming"});
    scrollToBottom();

  }catch(e){
    console.warn("simulateReply failed",e);
  }
}

/* =====================================================
   SCROLL
===================================================== */
function scrollToBottom(){
  const container=document.querySelector(".tg-comments-container");
  if(!container) return;
  setTimeout(()=>{ container.scrollTop = container.scrollHeight; },50);
}

/* =====================================================
   ENTER KEY SEND
===================================================== */
if(input){
  input.addEventListener("keydown",function(e){
    if(e.key==="Enter"){ e.preventDefault(); sendUserMessage(); }
  });
}
if(sendBtn){
  sendBtn.addEventListener("click",sendUserMessage);
}

/* =====================================================
   INIT
===================================================== */
(async function init(){
  await waitForReady();
  console.log("✅ interactions ready — typing, Telegram-style animation, and realistic speed enabled");
})();
})();
