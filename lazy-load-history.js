// realism-history-live-recent-first-v10.js
(function(){
"use strict";

/* =====================================================
CONFIG
===================================================== */

const START_DATE = new Date(2025,7,14);
const END_DATE   = new Date();
const TARGET_MESSAGES = 5000;

/* =====================================================
UTILS
===================================================== */

function rand(a,b){ return Math.floor(Math.random()*(b-a)+a); }
function maybe(p){ return Math.random()<p; }
function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

/* =====================================================
TIMESTAMP ENGINE
===================================================== */

let lastTime = START_DATE.getTime();

function timestamp(day){

let t = new Date(
day.getFullYear(),
day.getMonth(),
day.getDate(),
rand(7,22),
rand(0,59),
rand(0,59)
);

if(t.getTime() <= lastTime){
t = new Date(lastTime + rand(20000,90000));
}

lastTime = t.getTime();
return t;

}

/* =====================================================
ACTIVITY
===================================================== */

function activity(){

const r=Math.random();

if(r<0.45) return rand(3,8);
if(r<0.75) return rand(10,25);
if(r<0.95) return rand(60,120);

return rand(150,220);

}

/* =====================================================
COMMENT GENERATOR
===================================================== */

function generateComment(){

const templates=[

()=>`Anyone trading ${random(ASSETS)} today?`,
()=>`Just closed ${random(ASSETS)} nice profit`,
()=>`Signal for ${random(ASSETS)} ${random(TIMEFRAMES)} looks good`,
()=>`Entered ${random(ASSETS)} small position`,
()=>`Market moving fast today`,
()=>`Watching ${random(ASSETS)} closely`

];

let text=random(templates)();

if(maybe(.6)) text+=" "+random(EMOJIS);

return text;

}

/* =====================================================
TIMELINE
===================================================== */

function generateTimeline(){

const items=[];
let day = new Date(START_DATE);

while(day<=END_DATE && items.length<TARGET_MESSAGES){

const count = activity();

for(let i=0;i<count;i++){

const time = timestamp(day);

if(maybe(.10)){
items.push({
type:"join",
persona:window.identity.getRandomPersona(),
timestamp:time
});
}
else{
items.push({
type:"chat",
timestamp:time
});
}

if(items.length>=TARGET_MESSAGES) break;

}

day.setDate(day.getDate()+1);

}

return items.sort((a,b)=>a.timestamp-b.timestamp);

}

/* =====================================================
REACTIONS
===================================================== */

function simulateInlineReactions(messageId,count=1){

if(!window.TGRenderer?.appendReaction) return;

for(let i=0;i<count;i++){

const reaction=random(REACTIONS);

window.TGRenderer.appendReaction(messageId,{
emoji:reaction,
count:1
});

}

}

/* =====================================================
HISTORY PRELOAD (FAST)
===================================================== */

function preloadHistory(){

const timeline = generateTimeline();
const messageIds=[];

for(const item of timeline){

/* JOIN EVENT */

if(item.type==="join"){

const id="join_"+Date.now()+"_"+rand(9999);

window.TGRenderer.prependMessage(

item.persona,
"",
{
id,
timestamp:item.timestamp,
type:"system",
event:"join",
sticker:true
}

);

continue;

}

/* CHAT MESSAGE */

let text;

if(window.realism && typeof window.realism.generateConversation==="function"){

const convo = window.realism.generateConversation();

text = convo?.text;

}

if(!text){
text = generateComment();
}

let persona = window.identity.getRandomPersona();

const id="m_"+Math.random().toString(36).slice(2);

let parentId=null;

if(messageIds.length>10 && maybe(.30)){
parentId=random(messageIds);
}

window.TGRenderer.prependMessage(

persona,
text,
{
id,
timestamp:item.timestamp,
type:"historic",
bubblePreview:true,
replyPreview: parentId?true:maybe(.30),
parentId
}

);

messageIds.push(id);

/* reactions without blocking */

if(maybe(.35)){
simulateInlineReactions(id,rand(1,3));
}

}

const container=document.getElementById("tg-comments-container");

if(container){
container.scrollTop=container.scrollHeight;
}

console.log("✓ Historical chat loaded fast");

}

/* =====================================================
POOL ENGINE
===================================================== */

function ensurePool(min=10000){

if(!window.realism.POOL) window.realism.POOL=[];

while(window.realism.POOL.length<min){

window.realism.POOL.push({
text:generateComment(),
timestamp:new Date()
});

}

}

/* =====================================================
POST MESSAGE
===================================================== */

async function postMessage(item){

let persona=item.persona || window.identity.getRandomPersona();

await window.queuedTyping(persona,item.text);

const msgId=`realism_${Date.now()}_${rand(9999)}`;

window.TGRenderer.appendMessage(

persona,
item.text,
{
timestamp:item.timestamp||new Date(),
type:"incoming",
id:msgId,
bubblePreview:true,
replyPreview: maybe(.35)
}

);

if(maybe(.40)){
simulateInlineReactions(msgId,rand(1,3));
}

}

/* =====================================================
CROWD BURST
===================================================== */

async function simulateCrowdBurst(total=120,minBurst=3,maxBurst=8){

ensurePool(total);

while(total>0 && window.realism.POOL.length>0){

const burstCount=rand(minBurst,maxBurst);

const burst=window.realism.POOL.splice(0,burstCount);

await Promise.all(burst.map(item=>postMessage(item)));

total-=burstCount;

await new Promise(r=>setTimeout(r,rand(200,700)));

}

}

/* =====================================================
LIVE MESSAGE
===================================================== */

async function liveMessage(){

if(!window.realism?.generateConversation) return;

const convo=window.realism.generateConversation();

let persona=convo?.persona || window.identity.getRandomPersona();

let text=convo?.text || generateComment();

await window.queuedTyping(persona,text);

const id="live_"+Date.now()+"_"+rand(9999);

window.TGRenderer.appendMessage(

persona,
text,
{
id,
timestamp:new Date(),
type:"incoming",
bubblePreview:true,
replyPreview: maybe(.35)
}

);

if(maybe(.35)){
simulateInlineReactions(id,rand(1,3));
}

}

/* =====================================================
INIT
===================================================== */

async function init(){

while(
!window.identity?.getRandomPersona ||
!window.TGRenderer?.prependMessage ||
!window.queuedTyping
){
await new Promise(r=>setTimeout(r,50));
}

if(!window.realism) window.realism={};

ensurePool(10000);

preloadHistory();

simulateCrowdBurst(120);

console.log("✓ Realism engine ready");

}

/* =====================================================
EXPORTS
===================================================== */

if(!window.realism) window.realism={};

window.realism.simulateCrowdBurst = simulateCrowdBurst;
window.realism.postMessage = postMessage;
window.realism.simulateInlineReactions = simulateInlineReactions;
window.realism.liveMessage = liveMessage;
window.realism.init = init;

init();

})();
