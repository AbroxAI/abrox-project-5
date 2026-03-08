// joiner-simulator-fixed.js — ULTRA REALISM ENGINE V4
(function () {
"use strict";

/* ================= UTIL ================= */
function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }
function chance(p){ return Math.random() < p; }
function debug(msg){ if(window.logDebug) window.logDebug(msg); else console.log(msg); }

/* ================= WAIT FOR SYSTEM ================= */
async function waitForSystem(){
  let waited=0;
  while((!window.identity?.getRandomPersona || !window.TGRenderer?.appendMessage) && waited<10000){
    await delay(50);
    waited+=50;
  }
  return true;
}

/* ================= PERSONA ================= */
function getPersona(){
  if(window.identity?.SyntheticPool?.length){
    return window.identity.SyntheticPool.splice(
      Math.floor(Math.random()*window.identity.SyntheticPool.length),
      1
    )[0];
  }
  return window.identity?.getRandomPersona?.();
}

/* ================= CONFIG ================= */
const JOIN_MESSAGES=[
  "Hello everyone 👋","Glad to be here","Nice community","Happy to join",
  "Hey traders","What's up everyone","Excited to learn","Hi guys!"
];
const GENERIC_REPLIES=[
  "True actually","Exactly","Good point","Agreed","Interesting take",
  "Facts 🔥","That makes sense","100%"
];
const EMOJIS=["🔥","💯","🚀","👍","😂","👏","❤️","🎯","🙌","😎"];
const FRIEND_GROUPS=[
  ["Alex","Maya","Chris"],
  ["Daniel","Sophia","Leo","Zara","Ivan"]
];
const messageMemory=[];

/* ================= MEMORY ================= */
function remember(msg){
  messageMemory.push(msg);
  if(messageMemory.length>40) messageMemory.shift();
}

/* ================= HEADER ================= */
let onlineCount=window.ONLINE_COUNT || 100;
const BASE_MEMBERS=window.MEMBER_COUNT || 1000;
const headerMeta=document.getElementById("tg-meta-line");
function updateHeader(){
  if(!headerMeta) return;
  headerMeta.textContent=
    `${BASE_MEMBERS.toLocaleString()} members, ${onlineCount.toLocaleString()} online`;
}
updateHeader();

/* ================= POST MESSAGE ================= */
async function postMessage(persona,text,options={}){
  if(window.queuedTyping) await window.queuedTyping(persona,text);
  const msg = window.TGRenderer.appendMessage(
    persona,
    text,
    {
      timestamp:new Date(),
      ...options
    }
  );
  remember({text,author:persona.name,time:Date.now()});
  return msg;
}

/* ================= REALISM ================= */
function generateReply(baseText,persona){
  try{
    if(window.realism?.generateReply) return window.realism.generateReply(baseText,persona);
  }catch(e){}
  return rand(GENERIC_REPLIES);
}

/* ================= JOIN SIM ================= */
async function simulateJoin(batch=1){
  const newMembers=[];
  for(let i=0;i<batch;i++){
    const persona=getPersona();
    if(!persona) return;
    newMembers.push(persona);
    const text=rand(JOIN_MESSAGES);
    await postMessage(persona,text);
    onlineCount++;
    updateHeader();
    await delay(300+Math.random()*500);
  }
  setTimeout(()=>{
    window.TGRenderer?.appendJoinSticker?.(newMembers);
  },200);
}

/* ================= BASIC REPLY ================= */
async function simulateReply(){
  const messages=Array.from(document.querySelectorAll(".tg-bubble"));
  if(!messages.length) return;
  const target=rand(messages);
  const persona=getPersona();
  if(!persona) return;
  const baseText=target.querySelector(".tg-bubble-text")?.textContent || "";
  const reply=generateReply(baseText,persona);
  await postMessage(persona,reply,{replyToId:target.dataset.id,replyToText:baseText});
}

/* ================= FRIEND GROUP CHAT ================= */
async function simulateFriendConversation(){
  const group=rand(FRIEND_GROUPS);
  const rootPersona=getPersona();
  if(!rootPersona) return;
  const topic="That's interesting actually";
  await postMessage(rootPersona,topic);
  let lastText=topic;
  for(let name of group){
    const persona=getPersona();
    if(!persona) continue;
    const reply=generateReply(lastText,persona);
    await postMessage(persona,reply);
    lastText=reply;
    await delay(900+Math.random()*1200);
  }
}

/* ================= VIRAL MOMENT ================= */
async function simulateViralMoment(){
  const persona=getPersona();
  if(!persona) return;
  const text="🔥 This message is blowing up";
  await postMessage(persona,text);
  await delay(1000);
  simulateReactionBurst();
  await delay(800);
  simulateReactionBurst();
}

/* ================= REACTION BURST ================= */
function simulateReactionBurst(){
  const messages=Array.from(document.querySelectorAll(".tg-bubble"));
  if(!messages.length) return;
  const target=rand(messages);
  const count=2+Math.floor(Math.random()*4);
  for(let i=0;i<count;i++){
    const emoji=rand(EMOJIS);
    const pill=window.TGRenderer?.createReactionPill?.([{emoji:emoji,count:1}]);
    if(pill) target.appendChild(pill);
  }
}

/* ================= PIN REPLY ================= */
async function simulatePinnedReply(){
  const pinnedId=window.TGRenderer?.getPinnedMessageId?.();
  if(!pinnedId) return;
  const bubble=document.querySelector(`.tg-bubble[data-id="${pinnedId}"]`);
  if(!bubble) return;
  const persona=getPersona();
  if(!persona) return;
  const baseText=bubble.querySelector(".tg-bubble-text")?.textContent || "";
  const reply=generateReply(baseText,persona);
  await postMessage(persona,reply,{replyToId:pinnedId,replyToText:baseText});
}

/* ================= ONLINE DRIFT ================= */
function driftOnline(){
  const drift=Math.floor(Math.random()*5)-2;
  onlineCount+=drift;
  if(onlineCount<5) onlineCount=5;
  updateHeader();
}

/* ================= ACTIVITY ENGINE ================= */
async function activityLoop(){
  while(true){
    driftOnline();
    const r=Math.random();
    if(r<0.20) await simulateJoin(1+Math.floor(Math.random()*3));
    else if(r<0.45) await simulateReply();
    else if(r<0.65) await simulateFriendConversation();
    else if(r<0.80) simulateReactionBurst();
    else if(r<0.92) await simulatePinnedReply();
    else await simulateViralMoment();
    await delay(2000+Math.random()*5000);
  }
}

/* ================= START ================= */
async function start(){
  await waitForSystem();
  debug("Joiner Simulator V4 started");
  const initialJoins=window.JOINER_CONFIG?.initialJoins || 5;
  await simulateJoin(initialJoins);
  activityLoop();
}

document.readyState==="loading" ? document.addEventListener("DOMContentLoaded",start) : start();

})();
