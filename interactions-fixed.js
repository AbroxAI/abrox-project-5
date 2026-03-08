// interactions-fixed.js — user interaction + typing system (fixed)
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

function showTyping(name){
  if(!metaLine) return;
  metaLine.dataset.prev=metaLine.textContent;
  metaLine.textContent=`${name} is typing...`;
  typingActive=true;
}

function hideTyping(){
  if(!metaLine) return;
  if(metaLine.dataset.prev) metaLine.textContent=metaLine.dataset.prev;
  typingActive=false;
}

/* =====================================================
   QUEUED TYPING (GLOBAL)
===================================================== */
let typingQueue=Promise.resolve();

window.queuedTyping=function(persona,text){
  typingQueue=typingQueue.then(async()=>{
    if(!persona?.name) return;
    showTyping(persona.name);
    const typingTime=Math.min(3000, Math.max(600, text.length*40));
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
      return window.realism.postFallbackReply(userText);
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
   INIT
===================================================== */
(async function init(){
  await waitForReady();
  console.log("✅ interactions ready");
})();
})();
