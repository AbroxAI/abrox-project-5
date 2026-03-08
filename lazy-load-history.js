// lazy-load-history.js — Efficient chat history loader for 10k+ messages
(function(){
"use strict";

/* ================= UTIL ================= */
function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }
function rand(min,max){ return Math.floor(Math.random()*(max-min)+min); }

/* ================= CONFIG ================= */
const BATCH_SIZE = 50;        // messages loaded per batch
const MAX_HISTORY = 10000;    // max messages to simulate
let historyLoaded = 0;
let loadingHistory = false;

/* ================= SAFE MESSAGE APPEND ================= */
async function appendHistoryMessage(persona,text,timestamp){
  if(!window.TGRenderer?.appendMessage) return;
  return window.TGRenderer.appendMessage(persona,text,{
    timestamp: timestamp || new Date(Date.now() - Math.random()*30*86400000),
    type: "incoming"
  });
}

/* ================= GENERATE HISTORY MESSAGE ================= */
function generateHistoryItem(){
  const persona = window.identity?.getRandomPersona?.();
  if(!persona) return null;
  const text = window.realism?.generateReply?.("History context",persona) ||
               "Earlier message " + (historyLoaded+1);
  const timestamp = new Date(Date.now() - Math.random()*30*86400000);
  return { persona, text, timestamp };
}

/* ================= LOAD BATCH ================= */
async function loadHistoryBatch(){
  if(loadingHistory) return;
  loadingHistory = true;
  const container = document.getElementById("tg-comments-container");
  if(!container) return;

  for(let i=0;i<BATCH_SIZE && historyLoaded<MAX_HISTORY;i++){
    const item = generateHistoryItem();
    if(!item) continue;
    await appendHistoryMessage(item.persona,item.text,item.timestamp);
    historyLoaded++;
  }

  loadingHistory = false;
}

/* ================= SCROLL DETECTION ================= */
function setupLazyScroll(){
  const container = document.getElementById("tg-comments-container");
  if(!container) return;

  container.addEventListener("scroll", async ()=>{
    if(container.scrollTop < 150 && historyLoaded < MAX_HISTORY){
      await loadHistoryBatch();
    }
  });
}

/* ================= INITIAL LOAD ================= */
async function initLazyLoad(){
  await delay(100); // wait for TGRenderer ready
  await loadHistoryBatch();
  setupLazyScroll();
}

document.readyState==="loading" ? document.addEventListener("DOMContentLoaded",initLazyLoad) : initLazyLoad();

})();
