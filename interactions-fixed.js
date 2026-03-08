// interactions-fixed.js — Telegram-style typing + variable speed + horizontal reactions
(function(){
"use strict";

/* =====================================================
   UTIL
===================================================== */
function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }
function rand(min,max){ return Math.floor(Math.random()*(max-min)+min); }

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
   HEADER TYPING INDICATOR
===================================================== */
const metaLine=document.getElementById("tg-meta-line");
let typingActive=false;
let typingDotsInterval=null;

function showTyping(name){
  if(!metaLine) return;
  metaLine.dataset.prev=metaLine.textContent;
  metaLine.textContent=`${name} is typing`;
  let dots=0;
  typingActive=true;
  clearInterval(typingDotsInterval);
  typingDotsInterval=setInterval(()=>{
    dots=(dots+1)%4;
    metaLine.textContent=`${name} is typing${'.'.repeat(dots)}`;
  },400);
}

function hideTyping(){
  if(!metaLine) return;
  clearInterval(typingDotsInterval);
  metaLine.textContent=metaLine.dataset.prev || '';
  typingActive=false;
}

/* =====================================================
   QUEUED TYPING (GLOBAL)
===================================================== */
let typingQueue=Promise.resolve();

window.queuedTyping=function(persona,text){
  typingQueue=typingQueue.then(async()=>{
    if(!persona?.name || !text) return;
    showTyping(persona.name);
    // variable typing speed per persona
    const typingTime=Math.min(4000, Math.max(600, text.length * rand(30,50)));
    await delay(typingTime);
    hideTyping();
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
      reply=window.realism.postFallbackReply(userText) || "…";
    }

    await window.queuedTyping(persona,reply);

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
  setTimeout(()=>{ container.scrollTop=container.scrollHeight; },50);
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
   REACTIONS PILL FIX — HORIZONTAL
===================================================== */
function createHorizontalReactionPill(bubbleEl,reactions){
  if(!bubbleEl || !reactions?.length) return;
  const pill = document.createElement('div');
  pill.className = 'tg-reaction-pill';
  pill.style.flexDirection='row'; // enforce horizontal
  reactions.forEach(r=>{
    const item=document.createElement('div');
    item.className='tg-reaction-item';
    item.textContent=`${r.emoji} ${r.count}`;
    pill.appendChild(item);
  });
  bubbleEl.appendChild(pill);
}

/* =====================================================
   INIT
===================================================== */
(async function init(){
  await waitForReady();
  console.log("✅ interactions-fixed ready: typing indicator + variable speed + horizontal reactions");
})();
})();
