// lazy-load-history.js — PRO Telegram-style history loader
(function(){

"use strict";

/* =====================================================
CONFIG
===================================================== */

const CHUNK_SIZE = 250;       // how many messages render per frame
const FRAME_DELAY = 0;        // fastest loading
const MESSAGE_POOL = window.HISTORY_POOL || [];

/* =====================================================
UTIL
===================================================== */

function delay(ms){
  return new Promise(r=>setTimeout(r,ms));
}

/* =====================================================
SAFE DATE KEY
===================================================== */

function getDateKey(ts){

  const d = new Date(ts);

  return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();

}

/* =====================================================
GROUP MESSAGES BY DAY
===================================================== */

function groupMessages(messages){

  const map = new Map();

  for(const m of messages){

    const key = getDateKey(m.timestamp);

    if(!map.has(key)){
      map.set(key,[]);
    }

    map.get(key).push(m);

  }

  return map;

}

/* =====================================================
RENDER MESSAGE
===================================================== */

function renderMessage(msg){

  const persona = msg.persona || {
    name: msg.name || "User",
    avatar: msg.avatar || null
  };

  const opts = {

    type: msg.type || "incoming",

    timestamp: new Date(msg.timestamp),

    replyToId: msg.replyToId || null,

    replyToText: msg.replyToText || null,

    image: msg.image || null,

    caption: msg.caption || null,

    reactions: msg.reactions || []

  };

  window.TGRenderer.appendMessage(
    persona,
    msg.text || "",
    opts
  );

}

/* =====================================================
CHUNK RENDER
===================================================== */

async function renderChunk(chunk){

  for(const msg of chunk){

    renderMessage(msg);

  }

}

/* =====================================================
LOAD HISTORY
===================================================== */

async function loadHistory(pool){

  if(!window.TGRenderer){
    console.warn("TGRenderer missing");
    return;
  }

  /* ----- SORT MESSAGES ----- */

  const sorted = pool.slice().sort(
    (a,b)=> new Date(a.timestamp) - new Date(b.timestamp)
  );

  /* ----- GROUP BY DAY ----- */

  const grouped = groupMessages(sorted);

  const days = Array.from(grouped.keys())
  .sort((a,b)=> new Date(a) - new Date(b));

  /* ----- RENDER DAYS ----- */

  for(const day of days){

    const messages = grouped.get(day);

    for(let i=0;i<messages.length;i+=CHUNK_SIZE){

      const chunk = messages.slice(i,i+CHUNK_SIZE);

      await renderChunk(chunk);

      if(FRAME_DELAY){
        await delay(FRAME_DELAY);
      }

    }

  }

  console.log("✅ PRO history fully loaded");

}

/* =====================================================
INIT
===================================================== */

(async function(){

  while(!window.TGRenderer){
    await delay(10);
  }

  if(!MESSAGE_POOL.length){
    console.warn("No HISTORY_POOL found");
    return;
  }

  await loadHistory(MESSAGE_POOL);

})();

})();
