// realism-history-loader-v12.js — advanced realistic history + reactions + reply threads

(function(){
"use strict";

/* =====================================================
CONFIG
===================================================== */

const START_DATE = new Date(2025,7,14)
const END_DATE   = new Date()
const TARGET_MESSAGES = 4500


/* =====================================================
UTILS
===================================================== */

function rand(a,b){ return Math.floor(Math.random()*(b-a)+a) }
function maybe(p){ return Math.random()<p }
function random(arr){ return arr[Math.floor(Math.random()*arr.length)] }


/* =====================================================
TIMESTAMP ENGINE
===================================================== */

let lastTime = START_DATE.getTime()

function nextTimestamp(day){

let t = new Date(
day.getFullYear(),
day.getMonth(),
day.getDate(),
rand(7,22),
rand(0,59),
rand(0,59)
)

if(t.getTime() <= lastTime){
t = new Date(lastTime + rand(20000,80000))
}

lastTime = t.getTime()

return t

}


/* =====================================================
ACTIVITY DISTRIBUTION
===================================================== */

function activity(){

const r = Math.random()

if(r < .45) return rand(3,8)
if(r < .75) return rand(10,25)
if(r < .95) return rand(60,120)

return rand(150,220)

}


/* =====================================================
TIMELINE
===================================================== */

function generateTimeline(){

const items=[]
let day=new Date(START_DATE)

while(day<=END_DATE && items.length<TARGET_MESSAGES){

const count=activity()

for(let i=0;i<count;i++){

const time=nextTimestamp(day)

if(maybe(.06)){
items.push({
type:"join",
persona:window.identity.getRandomPersona(),
timestamp:time
})
}
else{
items.push({
type:"chat",
timestamp:time
})
}

if(items.length>=TARGET_MESSAGES) break
}

day.setDate(day.getDate()+1)

}

return items.sort((a,b)=>a.timestamp-b.timestamp)

}


/* =====================================================
REACTION SIMULATOR
===================================================== */

async function simulateReactions(messageId){

if(!window.TGRenderer?.appendReaction) return

const count = rand(1,3)

for(let i=0;i<count;i++){

const reaction = random(REACTIONS)

window.TGRenderer.appendReaction(messageId,reaction)

await new Promise(r=>setTimeout(r,rand(200,700)))

}

}


/* =====================================================
HISTORY ENGINE
===================================================== */

async function preloadHistory(){

const timeline = generateTimeline()
const messageIds = []

for(const item of timeline){

/* JOIN EVENT */

if(item.type==="join"){

const id="join_"+Date.now()+"_"+rand(9999)

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

)

continue
}


/* CHAT MESSAGE */

const convo = window.realism.generateConversation()
if(!convo || !convo.text) continue

if(convo.text.includes("joined the group")) continue

const persona = convo.persona || window.identity.getRandomPersona()

const id="m_"+Math.random().toString(36).slice(2)

let parentId=null

/* simulate reply threads */

if(messageIds.length>5 && maybe(.25)){
parentId=random(messageIds)
}

window.TGRenderer.prependMessage(

persona,
convo.text,

{
id,
timestamp:item.timestamp,
type:"incoming",

parentId,

bubblePreview:true,

replyPreview: parentId?true:maybe(.25),

reactionPill: maybe(.30)

}

)

messageIds.push(id)

/* simulate reactions */

if(maybe(.35)){
await simulateReactions(id)
}

/* yield occasionally */

if(Math.random()<0.01){
await new Promise(r=>setTimeout(r,0))
}

}

/* scroll */

const container=document.getElementById("tg-comments-container")
if(container) container.scrollTop=container.scrollHeight

console.log("✓ advanced history loaded")

}


/* =====================================================
LIVE MESSAGE ENGINE
===================================================== */

async function liveMessage(){

const convo = window.realism.generateConversation()
if(!convo) return

const persona = convo.persona || window.identity.getRandomPersona()

await window.queuedTyping(persona,convo.text)

const id="live_"+Date.now()+"_"+rand(9999)

window.TGRenderer.appendMessage(

persona,
convo.text,

{
id,
timestamp:new Date(),

type:"incoming",

bubblePreview:true,

replyPreview: maybe(.40),

reactionPill: maybe(.35)

}

)

/* other members react */

if(maybe(.40)){
await simulateReactions(id)
}

}


/* =====================================================
INIT
===================================================== */

async function init(){

while(
!window.identity?.getRandomPersona ||
!window.realism?.generateConversation ||
!window.TGRenderer?.prependMessage
){
await new Promise(r=>setTimeout(r,50))
}

await preloadHistory()

console.log("✓ realism v12 ready")

}


/* =====================================================
EXPORT
===================================================== */

if(!window.realism) window.realism={}

window.realism.liveMessage=liveMessage
window.realism.init=init

init()

})();
