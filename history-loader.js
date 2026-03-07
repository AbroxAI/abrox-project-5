// history-loader.js
// Optimized persistent chat history loader
// Compatible with TGRenderer.appendMessage()

(function(){

"use strict";

/* =========================
   CONFIG
========================= */

const STORAGE_KEY = "abrox_chat_history_v1";

const HISTORY_START_DATE = new Date("2025-08-14T08:00:00").getTime();

const MAX_HISTORY_MESSAGES = 10000;

const CHUNK_SIZE = 120; // smaller chunks = smoother UI

const CHUNK_DELAY = 25; // ms delay between chunks

/* =========================
   STATE
========================= */

let history = [];

/* =========================
   STORAGE HELPERS
========================= */

function loadStorage(){

  try{

    const raw = localStorage.getItem(STORAGE_KEY);

    if(raw){

      const parsed = JSON.parse(raw);

      if(Array.isArray(parsed)){

        history = parsed;

      }

    }

  }catch(err){

    console.warn("History load failed",err);

    history = [];

  }

}

function saveStorage(){

  try{

    localStorage.setItem(STORAGE_KEY,JSON.stringify(history));

  }catch(err){

    console.warn("History save failed",err);

  }

}

/* =========================
   TIME DISTRIBUTION
========================= */

function generateTimestamp(index,total){

  const end = Date.now();

  const span = end - HISTORY_START_DATE;

  const step = span / total;

  const base = HISTORY_START_DATE + (index * step);

  return new Date(base + Math.random()*3600000);

}

/* =========================
   MESSAGE GENERATION
========================= */

function generateMessage(index,total){

  const persona = window.identity?.getRandomPersona?.();

  if(!persona) return null;

  let text = "Interesting.";

  if(window.realism?.generateReply){

    try{

      text = window.realism.generateReply("",persona);

    }catch(e){}

  }

  return {

    id:"hist_"+index,

    persona:persona,

    text:text,

    timestamp:generateTimestamp(index,total),

    reactions:[]

  };

}

/* =========================
   DOM RENDER
========================= */

async function renderChunk(start,end){

  for(let i=start;i<end;i++){

    const msg = history[i];

    if(!msg) continue;

    window.TGRenderer.appendMessage(

      msg.persona,

      msg.text,

      {

        id:msg.id,

        timestamp:msg.timestamp,

        reactions:msg.reactions || []

      }

    );

  }

}

/* =========================
   TYPING SIMULATION
========================= */

async function simulateTyping(){

  if(!window.identity || !window.queuedTyping) return;

  const persona = window.identity.getRandomPersona();

  if(!persona) return;

  try{

    await window.queuedTyping(persona,"...");

  }catch(e){}

}

/* =========================
   HISTORY GENERATION
========================= */

function generateHistory(){

  history = [];

  for(let i=0;i<MAX_HISTORY_MESSAGES;i++){

    const msg = generateMessage(i,MAX_HISTORY_MESSAGES);

    if(msg){

      history.push(msg);

    }

  }

}

/* =========================
   MAIN LOADER
========================= */

async function loadHistory(){

  loadStorage();

  if(history.length === 0){

    console.log("Generating new chat history...");

    generateHistory();

    saveStorage();

  }

  const total = history.length;

  console.log("Loading history:",total,"messages");

  for(let i=0;i<total;i+=CHUNK_SIZE){

    const end = Math.min(i+CHUNK_SIZE,total);

    await renderChunk(i,end);

    await simulateTyping();

    await new Promise(r=>setTimeout(r,CHUNK_DELAY));

  }

  console.log("History rendering complete");

}

/* =========================
   PUBLIC API
========================= */

window.historyLoader = {

  loadHistory

};

})();
