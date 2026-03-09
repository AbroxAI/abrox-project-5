// realism-history-loader-final.js
(function(){
"use strict";

/* =====================================================
CONFIG
===================================================== */

const START_DATE = new Date(2025,7,14);
const END_DATE   = new Date();
const HISTORIC_TARGET = 5000;
const BATCH_SIZE = 300;

/* =====================================================
UTILS
===================================================== */

function rand(min,max){ return Math.floor(Math.random()*(max-min)+min); }
function random(a){ return a[Math.floor(Math.random()*a.length)]; }
function maybe(p){ return Math.random()<p; }

const GENERATED = new Set();

function mark(text){
 const h=[...text].reduce((a,c)=>((a<<5)+a)+c.charCodeAt(0),5381)>>>0;
 const k=h.toString(36);
 if(GENERATED.has(k)) return false;
 GENERATED.add(k);
 return true;
}

/* =====================================================
BUSY DAY SYSTEM
===================================================== */

function getDailyActivity(){

 const r=Math.random();

 if(r<0.45) return rand(3,8);
 if(r<0.75) return rand(10,25);
 if(r<0.95) return rand(60,150);
 return rand(180,260);
}

/* =====================================================
TIMESTAMP (collision-safe)
===================================================== */

let lastTime = 0;

function timeForDay(day){

 const hours=[7,9,11,13,15,17,19,21];

 let d = new Date(
  day.getFullYear(),
  day.getMonth(),
  day.getDate(),
  random(hours),
  rand(0,60),
  rand(0,60)
 );

 if(d.getTime() <= lastTime){
  d = new Date(lastTime + rand(15000,90000));
 }

 lastTime = d.getTime();

 return d;
}

/* =====================================================
MESSAGE GENERATORS
===================================================== */

function generateMessage(day){

 const templates=[
 ()=>`Guys ${random(TESTIMONIALS)}`,
 ()=>`Anyone trading ${random(ASSETS)} today?`,
 ()=>`Closed ${random(ASSETS)} ${random(TIMEFRAMES)} ${random(RESULT_WORDS)}`,
 ()=>`Signal ${random(ASSETS)} ${random(TIMEFRAMES)} ${random(RESULT_WORDS)}`,
 ()=>`Nice move on ${random(ASSETS)} today`
 ];

 let text=random(templates)();

 for(let i=0;i<rand(1,3);i++) text+=" "+random(EMOJIS);

 let tries=0;
 while(!mark(text)&&tries<20){
  text+=" "+rand(999);
  tries++;
 }

 return{
  text,
  timestamp:timeForDay(day)
 };
}

/* =====================================================
JOINERS (identity-safe)
===================================================== */

function generateJoiner(day){

 const persona = window.identity.getRandomPersona();

 const text=random(JOINER_WELCOMES)
 .replace("{user}",persona.name);

 return{
  persona,
  text,
  timestamp:timeForDay(day),
  type:"joiner"
 };
}

/* =====================================================
THREAD REPLIES
===================================================== */

async function generateReplies(parent){

 const count=rand(2,5);

 for(let i=0;i<count;i++){

  const persona=window.identity.getRandomPersona();

  const reply=random(JOINER_REPLIES)
  .replace("{user}",parent.persona.name);

  const id=`reply_${Date.now()}_${rand(9999)}`;

  window.TGRenderer.appendMessage(persona,reply,{
   timestamp:parent.timestamp,
   type:"historic",
   id,
   parentId:parent.id,
   bubblePreview:true
  });

  if(window.realism?.simulateInlineReactions)
   window.realism.simulateInlineReactions(id,rand(1,3));
 }
}

/* =====================================================
BATCH DOM APPEND
===================================================== */

async function appendBatch(batch){

 for(const item of batch){

  const persona=item.persona || window.identity.getRandomPersona();

  const id=`msg_${Date.now()}_${rand(9999)}`;

  window.TGRenderer.appendMessage(persona,item.text,{
   timestamp:item.timestamp,
   type:"historic",
   id,
   bubblePreview:true
  });

  item.id=id;

  if(item.type==="joiner")
   await generateReplies(item);

  if(window.realism?.simulateInlineReactions && maybe(0.3))
   window.realism.simulateInlineReactions(id,rand(1,4));
 }
}

/* =====================================================
HISTORIC GENERATOR
===================================================== */

async function loadHistory(){

 let day=new Date(START_DATE);
 let total=0;

 let batch=[];

 while(day<=END_DATE && total<HISTORIC_TARGET){

  const messages=getDailyActivity();

  for(let i=0;i<messages;i++){

   let item;

   if(maybe(0.15)){
    item=generateJoiner(day);
   }else{
    item=generateMessage(day);
   }

   batch.push(item);

   total++;

   if(batch.length>=BATCH_SIZE){

    await appendBatch(batch);
    batch=[];
   }

   if(total>=HISTORIC_TARGET) break;
  }

  day.setDate(day.getDate()+1);
 }

 if(batch.length) await appendBatch(batch);

 console.log("✅ Historic chat loaded:",total);
}

/* =====================================================
LIVE MESSAGE (typing allowed)
===================================================== */

async function simulateLive(){

 const persona=window.identity.getRandomPersona();

 const text=generateMessage(new Date()).text;

 await window.queuedTyping(persona,text);

 const id=`live_${Date.now()}`;

 window.TGRenderer.appendMessage(persona,text,{
  timestamp:new Date(),
  type:"incoming",
  id,
  bubblePreview:true
 });

 if(window.realism?.simulateInlineReactions)
  window.realism.simulateInlineReactions(id,rand(1,3));
}

/* =====================================================
WAIT SYSTEM
===================================================== */

async function waitReady(){

 while(
 !window.identity?.getRandomPersona ||
 !window.TGRenderer?.appendMessage ||
 !window.queuedTyping
 ){
  await new Promise(r=>setTimeout(r,50));
 }
}

/* =====================================================
INIT
===================================================== */

async function init(){

 await waitReady();

 await loadHistory();

 console.log("History ready. Live system active.");

}

init();

/* =====================================================
SAFE EXPORT
===================================================== */

window.realism = window.realism || {};
window.realism.simulateLiveMessage = simulateLive;

})();
