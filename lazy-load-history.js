// realism-history-live-v10.js
(function(){
"use strict";

/* =====================================================
CONFIG
===================================================== */
const START_DATE = new Date(2025,7,14);
const END_DATE = new Date();
const TARGET_MESSAGES = 5000;
const CHUNK_SIZE = 80; // messages loaded per scroll batch

/* =====================================================
UTILS
===================================================== */
function rand(a,b){ return Math.floor(Math.random()*(b-a)+a); }
function maybe(p){ return Math.random()<p; }
function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

/* =====================================================
DOM
===================================================== */
let container;
let jumpIndicator;
let jumpText;
let unseenCount = 0;

/* =====================================================
SCROLL
===================================================== */
function updateJump(){
 if(!jumpText) return;
 jumpText.textContent = unseenCount>1 ? `New messages · ${unseenCount}` : "New messages";
}

function showJump(){ jumpIndicator?.classList.remove("hidden"); }
function hideJump(){ unseenCount=0; updateJump(); jumpIndicator?.classList.add("hidden"); }

function handleScroll(){
 if(!container) return;

 const distance = container.scrollHeight - container.scrollTop - container.clientHeight;

 if(distance < 80) hideJump();

 // LOAD OLDER MESSAGES WHEN SCROLL NEAR TOP
 if(container.scrollTop < 120){
  loadOlderMessages();
 }
}

/* =====================================================
TIMESTAMP ENGINE
===================================================== */
let lastTime = 0;

function timestamp(day){
 let t = new Date(day.getFullYear(), day.getMonth(), day.getDate(),
 rand(7,22), rand(0,60), rand(0,60));

 if(t.getTime() <= lastTime){
  t = new Date(lastTime + rand(15000,90000));
 }

 lastTime = t.getTime();
 return t;
}

/* =====================================================
ACTIVITY DISTRIBUTION
===================================================== */
function activity(){
 const r=Math.random();
 if(r<0.45) return rand(3,8);
 if(r<0.75) return rand(10,25);
 if(r<0.95) return rand(60,120);
 return rand(150,220);
}

/* =====================================================
TIMELINE
===================================================== */
let timeline = [];
let currentIndex = 0;

function generateTimeline(){

 const items=[];
 let day=new Date(START_DATE);

 while(day<=END_DATE && items.length<TARGET_MESSAGES){

  const count = activity();

  for(let i=0;i<count;i++){

   const time = timestamp(day);

   if(maybe(0.12) && window.identity?.getRandomPersona){
    items.push({
     type:"join",
     persona:window.identity.getRandomPersona(),
     timestamp:time
    });
   } else {
    items.push({
     type:"chat",
     timestamp:time
    });
   }

   if(items.length>=TARGET_MESSAGES) break;

  }

  day.setDate(day.getDate()+1);
 }

 timeline = items.sort((a,b)=>a.timestamp-b.timestamp);

 currentIndex = timeline.length;

}

/* =====================================================
LOAD OLDER MESSAGES
===================================================== */
async function loadOlderMessages(){

 if(currentIndex<=0) return;

 const previousHeight = container.scrollHeight;

 const start = Math.max(0,currentIndex-CHUNK_SIZE);
 const chunk = timeline.slice(start,currentIndex);

 for(const item of chunk){

  if(item.type==="join"){

   window.TGRenderer?.prependMessage?.(
    item.persona,
    `${item.persona.name} joined the group`,
    {
     timestamp:item.timestamp,
     type:"system",
     event:"join"
    }
   );

  } else {

   const convo = window.realism.generateConversation?.() || {};
   const persona = convo.persona || window.identity?.getRandomPersona();

   window.TGRenderer?.prependMessage?.(
    persona,
    convo.text || "Historic message",
    {
     timestamp:item.timestamp,
     type:"historic",
     bubblePreview:true
    }
   );

  }

 }

 currentIndex = start;

 // maintain scroll position
 const newHeight = container.scrollHeight;
 container.scrollTop += (newHeight-previousHeight);

}

/* =====================================================
INITIAL HISTORY LOAD
===================================================== */
async function preloadRecentHistory(){

 const start = Math.max(0,timeline.length-CHUNK_SIZE);
 const chunk = timeline.slice(start,timeline.length);

 for(const item of chunk){

  if(item.type==="join"){

   window.TGRenderer?.appendMessage?.(
    item.persona,
    `${item.persona.name} joined the group`,
    {
     timestamp:item.timestamp,
     type:"system",
     event:"join"
    }
   );

  } else {

   const convo = window.realism.generateConversation?.() || {};
   const persona = convo.persona || window.identity?.getRandomPersona();

   window.TGRenderer?.appendMessage?.(
    persona,
    convo.text || "Historic message",
    {
     timestamp:item.timestamp,
     type:"historic",
     bubblePreview:true
    }
   );

  }

 }

 currentIndex = start;

 container.scrollTop = container.scrollHeight;

}

/* =====================================================
LIVE CHAT
===================================================== */
async function liveMessage(){

 const convo = window.realism.generateConversation?.();
 if(!convo) return;

 const persona = convo.persona || window.identity?.getRandomPersona();

 await window.queuedTyping(persona,convo.text);

 const atBottom =
 container.scrollTop + container.clientHeight >=
 container.scrollHeight - 80;

 window.TGRenderer?.appendMessage?.(
  persona,
  convo.text,
  {
   timestamp:new Date(),
   type:"incoming",
   bubblePreview:true
  }
 );

 if(atBottom){
  container.scrollTop = container.scrollHeight;
 }else{
  unseenCount++;
  updateJump();
  showJump();
 }

}

/* =====================================================
JOINER SIMULATION
===================================================== */
async function simulateJoiner(){

 while(true){

  const persona = window.identity.getRandomPersona();

  const welcome = random(JOINER_WELCOMES)
  .replace("{user}",persona.name);

  await liveMessage({
   persona,
   text:welcome
  });

  await new Promise(r=>setTimeout(r,rand(2000,6000)));

 }

}

/* =====================================================
INIT
===================================================== */
async function init(){

 while(!window.TGRenderer?.appendMessage ||
       !window.identity?.getRandomPersona ||
       !window.queuedTyping){
  await new Promise(r=>setTimeout(r,50));
 }

 container = document.getElementById("tg-comments-container");
 jumpIndicator = document.getElementById("tg-jump-indicator");
 jumpText = document.getElementById("tg-jump-text");

 container?.addEventListener("scroll",handleScroll);

 generateTimeline();

 await preloadRecentHistory();

 simulateJoiner();

 console.log("✅ Realism v10 loaded — full history + bubbles + join stickers + lazy loading");

}

/* =====================================================
API
===================================================== */
window.realism = window.realism || {};
window.realism.liveMessage = liveMessage;
window.realism.init = init;

init();

})();
