// interactions-enhanced.js — Telegram-style typing + horizontal reaction pill
(function(){
"use strict";

/* =====================================================
UTIL
===================================================== /
function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }
function rand(min,max){ return Math.floor(Math.random()(max-min)+min); }

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
HEADER TYPING INDICATOR — Telegram style
===================================================== */
const metaLine = document.getElementById("tg-meta-line");
let typingDots = null;
let typingActive = false;

function showTyping(persona){
if(!metaLine) return;
typingActive = true;
metaLine.dataset.prev = metaLine.textContent;
metaLine.textContent = ${persona.name} is typing ;

// Create bouncing dots if not exist
if(!typingDots){
typingDots = document.createElement('span');
typingDots.className = 'tg-typing-dots';
typingDots.innerHTML = '<span>.</span><span>.</span><span>.</span>';
metaLine.appendChild(typingDots);
}
}

function hideTyping(){
if(!metaLine) return;
typingActive = false;
if(metaLine.dataset.prev) metaLine.textContent = metaLine.dataset.prev;
if(typingDots){ typingDots.remove(); typingDots=null; }
}

/* =====================================================
QUEUED TYPING (GLOBAL) — variable speed per persona
===================================================== */
let typingQueue = Promise.resolve();

window.queuedTyping = function(persona,text){
typingQueue = typingQueue.then(async ()=>{
if(!persona?.name) return;
showTyping(persona);
const typingTime = Math.min(4000, Math.max(600, (text.length*rand(30,50))));
await delay(typingTime);
hideTyping();
});
return typingQueue;
};

/* =====================================================
HORIZONTAL REACTION PILL FIX
===================================================== */
const style = document.createElement('style');
style.textContent =   .tg-reaction-pill { display: flex !important; flex-wrap: wrap; gap: 6px; background: rgba(46,166,255,0.12); color: #2ea6ff; padding: 4px 10px; border-radius: 18px; font-size: 12px; font-weight: 500; margin-top: 6px; align-self: flex-start; }   .tg-reaction-item { cursor: pointer; user-select: none; padding: 2px 6px; border-radius: 12px; transition: background 0.2s ease; }   .tg-reaction-item:hover { background: rgba(46,166,255,0.25); }   .tg-typing-dots span { animation: bounce 1.4s infinite ease-in-out; display: inline-block; margin-right: 2px; font-weight: bold; }   .tg-typing-dots span:nth-child(1){ animation-delay: 0s; }   .tg-typing-dots span:nth-child(2){ animation-delay: 0.2s; }   .tg-typing-dots span:nth-child(3){ animation-delay: 0.4s; }   @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }  ;
document.head.appendChild(style);

/* =====================================================
USER SEND MESSAGE
===================================================== */
const input = document.getElementById("tg-input");
const sendBtn = document.getElementById("tg-send");

async function sendUserMessage(){
if(!input) return;
const text = input.value.trim();
if(!text) return;
if(!await waitForReady()) return;

const userPersona = { name:"You", avatar:null };
window.TGRenderer.appendMessage(userPersona,text,{timestamp:new Date(),type:"outgoing"});
input.value = "";

scrollToBottom();
simulateReply(text);
}

/* =====================================================
BOT REPLY
===================================================== */
async function simulateReply(userText){
await delay(rand(1200,3500));
try{
const persona = window.identity.getRandomPersona();
if(!persona) return;

let reply = null;  
if(window.realism?.generateReply){  
  reply = window.realism.generateReply(userText,persona);  
}  
if(!reply && window.realism?.postFallbackReply){  
  return window.realism.postFallbackReply(userText);  
}  

// assign realistic typing speed if not present  
if(!persona.typingSpeed) persona.typingSpeed = rand(180,280);  
await window.queuedTyping(persona,reply);  

window.TGRenderer.appendMessage(persona,reply,{timestamp:new Date(),type:"incoming"});  
scrollToBottom();

}catch(e){ console.warn("simulateReply failed",e); }
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
console.log("✅ interactions-enhanced ready: Telegram-style typing + horizontal reactions");
})();
})();
