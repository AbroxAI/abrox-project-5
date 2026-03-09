// realism-history-loader-v2-advanced.js
(function(){
"use strict";

/* =====================================================
CONFIG
===================================================== */
const START_DATE = new Date(2025,7,14);
const END_DATE = new Date();

const TARGET_MESSAGES = 8000;
const CHUNK_SIZE = 90;

/* =====================================================
UTILS
===================================================== */
function rand(min,max){ return Math.floor(Math.random()*(max-min)+min); }
function maybe(p){ return Math.random()<p; }
function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

/* =====================================================
DOM
===================================================== */
let container;

/* =====================================================
TIMESTAMP ENGINE
===================================================== */
let lastTime = 0;

function timestamp(day){

 let t = new Date(
  day.getFullYear(),
  day.getMonth(),
  day.getDate(),
  rand(6,23),
  rand(0,60),
  rand(0,60)
 );

 if(t.getTime() <= lastTime){
  t = new Date(lastTime + rand(12000,90000));
 }

 lastTime = t.getTime();
 return t;
}

/* =====================================================
ACTIVITY MODEL
===================================================== */
function activity(hour){

 if(hour < 7) return rand(0,3);
 if(hour < 12) return rand(10,25);
 if(hour < 18) return rand(30,80);
 if(hour < 22) return rand(40,120);

 return rand(5,20);
}

/* =====================================================
VIRAL BURST
===================================================== */
function maybeBurst(){

 if(!maybe(0.06)) return 0;

 return rand(8,20);
}

/* =====================================================
TIMELINE
===================================================== */
let timeline=[];
let currentIndex=0;

function generateTimeline(){

 const items=[];
 let day=new Date(START_DATE);

 while(day<=END_DATE && items.length<TARGET_MESSAGES){

  const hour = rand(6,22);
  const baseActivity = activity(hour);
  const burst = maybeBurst();

  const count = baseActivity + burst;

  for(let i=0;i<count;i++){

   const time = timestamp(day);

   if(maybe(0.08)){

    const persona = window.identity.getRandomPersona();

    items.push({
     type:"join",
     persona,
     timestamp:time,
     id:"join_"+time.getTime()+"_"+i
    });

   }else{

    const convo = window.realism.generateConversation
      ? window.realism.generateConversation()
      : {text:"Historic message"};

    const persona = convo.persona || window.identity.getRandomPersona();

    items.push({
     type:"chat",
     persona,
     text:convo.text,
     timestamp:time,
     id:"msg_"+time.getTime()+"_"+i
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
MESSAGE MEMORY
===================================================== */
let lastMessages=[];

function rememberMessage(msg){
 lastMessages.push(msg);
 if(lastMessages.length>40) lastMessages.shift();
}

function randomPrevious(){
 if(!lastMessages.length) return null;
 return random(lastMessages);
}

/* =====================================================
IMAGE GENERATOR
===================================================== */
function maybeImage(){

 if(!maybe(0.05)) return null;

 return "https://picsum.photos/seed/"+rand(1,9999)+"/300/200";
}

/* =====================================================
REACTIONS
===================================================== */
const REACTIONS=["👍","🔥","💯","👏","❤️","😂","🚀"];

function applyReactions(id){

 if(!maybe(0.28)) return;

 const count = rand(1,4);

 for(let i=0;i<count;i++){
  window.TGRenderer.appendReaction(id,random(REACTIONS));
 }
}

/* =====================================================
LOAD OLDER
===================================================== */
async function loadOlder(){

 if(currentIndex<=0) return;

 const previousHeight = container.scrollHeight;

 const start=Math.max(0,currentIndex-CHUNK_SIZE);
 const chunk=timeline.slice(start,currentIndex);

 for(const item of chunk){

  if(item.type==="join"){

   window.TGRenderer.appendJoinSticker([item.persona]);

   continue;

  }

  const opts={
   id:item.id,
   timestamp:item.timestamp,
   type:"incoming"
  };

  const prev=randomPrevious();

  if(prev && maybe(0.18)){
   opts.replyToId = prev.id;
   opts.replyToText = prev.text;
  }

  const image = maybeImage();

  if(image){
   opts.image=image;
   opts.caption=item.text;
  }

  const id = window.TGRenderer.prependMessage(
   item.persona,
   item.text,
   opts
  );

  applyReactions(id);

  rememberMessage({id,text:item.text});

 }

 currentIndex=start;

 const newHeight=container.scrollHeight;
 container.scrollTop += (newHeight-previousHeight);
}

/* =====================================================
INITIAL HISTORY
===================================================== */
async function preload(){

 const start=Math.max(0,timeline.length-CHUNK_SIZE);
 const chunk=timeline.slice(start);

 for(const item of chunk){

  if(item.type==="join"){

   window.TGRenderer.appendJoinSticker([item.persona]);
   continue;

  }

  const opts={
   id:item.id,
   timestamp:item.timestamp,
   type:"incoming"
  };

  const prev=randomPrevious();

  if(prev && maybe(0.18)){
   opts.replyToId=prev.id;
   opts.replyToText=prev.text;
  }

  const image = maybeImage();

  if(image){
   opts.image=image;
   opts.caption=item.text;
  }

  const id = window.TGRenderer.appendMessage(
   item.persona,
   item.text,
   opts
  );

  applyReactions(id);

  rememberMessage({id,text:item.text});

 }

 currentIndex=start;

 container.scrollTop = container.scrollHeight;
}

/* =====================================================
SCROLL
===================================================== */
function handleScroll(){

 if(container.scrollTop < 120){
  loadOlder();
 }

}

/* =====================================================
INIT
===================================================== */
async function init(){

 while(
  !window.TGRenderer?.appendMessage ||
  !window.identity?.getRandomPersona ||
  !window.realism
 ){
  await new Promise(r=>setTimeout(r,50));
 }

 container=document.getElementById("tg-comments-container");

 container?.addEventListener("scroll",handleScroll);

 generateTimeline();

 await preload();

 console.log("🚀 Advanced History Loader v2 ready");

}

init();

})();
