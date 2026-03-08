// history-loader-realistic-dayflow-typing.js — Realistic day flow + persona typing variation
(function(){
"use strict";

/* =====================================================
   CONFIGURATION
===================================================== */
const CHUNK_SIZE = 30;        
const LOAD_DELAY = 120;       
const MESSAGE_POOL = window.HISTORY_POOL || [];
const MIN_MESSAGES_QUIET = 1;
const MAX_MESSAGES_QUIET = 5;
const MIN_MESSAGES_BUSY = 40;
const MAX_MESSAGES_BUSY = 100;
const TYPING_SPEED = { slow: 350, normal: 220, fast: 140 };

/* =====================================================
   UTIL
===================================================== */
function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }
function rand(min,max){ return Math.floor(Math.random()*(max-min)+min); }

/* =====================================================
   GROUP BY DATE
===================================================== */
function groupByDate(messages){
  const grouped = {};
  messages.forEach(msg=>{
    const d = new Date(msg.timestamp);
    const dateKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if(!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(msg);
  });
  return grouped;
}

/* =====================================================
   SPLIT DAY INTO PERIODS
===================================================== */
function splitDayPeriods(messages){
  const periods = { morning:[], afternoon:[], evening:[] };
  messages.forEach(msg=>{
    const hour = new Date(msg.timestamp).getHours();
    if(hour<12) periods.morning.push(msg);
    else if(hour<18) periods.afternoon.push(msg);
    else periods.evening.push(msg);
  });
  return periods;
}

/* =====================================================
   PICK MESSAGES PER PERIOD
===================================================== */
function pickPeriodMessages(periodMsgs){
  const count = periodMsgs.length > 10
    ? rand(MIN_MESSAGES_BUSY, Math.min(MAX_MESSAGES_BUSY, periodMsgs.length))
    : rand(MIN_MESSAGES_QUIET, Math.min(MAX_MESSAGES_QUIET, periodMsgs.length));
  return periodMsgs.slice(0,count);
}

/* =====================================================
   ASSIGN PERSONA TYPING SPEED
===================================================== */
function assignTypingSpeed(persona){
  if(persona.typingSpeed) return; // already assigned
  const type = ["slow","normal","fast"][rand(0,3)];
  persona.typingSpeed = TYPING_SPEED[type] + rand(-20,20); // add small randomness
}

/* =====================================================
   LOAD MESSAGE CHUNK
===================================================== */
async function loadChunk(messages){
  for(const msg of messages){
    const persona = msg.persona || { name: msg.name || 'User', avatar: msg.avatar || null };
    const text = msg.text || '';
    const opts = {
      type: msg.type || 'incoming',
      timestamp: new Date(msg.timestamp),
      replyToId: msg.replyToId || null,
      replyToText: msg.replyToText || null,
      image: msg.image || null,
      caption: msg.caption || null,
      reactions: msg.reactions || []
    };

    if(opts.type === 'incoming'){
      assignTypingSpeed(persona);
      await window.queuedTyping(persona,text);
    }

    window.TGRenderer.appendMessage(persona,text,opts);
    await delay(LOAD_DELAY);
  }
}

/* =====================================================
   LOAD FULL HISTORY
===================================================== */
async function loadHistory(pool){
  if(!window.TGRenderer) return console.warn("TGRenderer not ready");

  const sorted = pool.slice().sort((a,b)=>new Date(a.timestamp) - new Date(b.timestamp));
  const grouped = groupByDate(sorted);
  const dateKeys = Object.keys(grouped).sort((a,b)=>new Date(a) - new Date(b));

  for(const key of dateKeys){
    const dayMessages = grouped[key];
    const periods = splitDayPeriods(dayMessages);

    for(const period of ["morning","afternoon","evening"]){
      const msgs = pickPeriodMessages(periods[period]);
      for(let i=0;i<msgs.length;i+=CHUNK_SIZE){
        const chunk = msgs.slice(i,i+CHUNK_SIZE);
        await loadChunk(chunk);
      }
    }
  }

  console.log("✅ Full realistic history loaded with persona typing variation");
}

/* =====================================================
   INIT
===================================================== */
(async function init(){
  if(!window.TGRenderer){
    await new Promise(resolve=>{
      const check = setInterval(()=>{
        if(window.TGRenderer){ clearInterval(check); resolve(); }
      },50);
    });
  }

  if(MESSAGE_POOL.length){
    await loadHistory(MESSAGE_POOL);
  } else {
    console.warn("No MESSAGE_POOL found for history loader");
  }
})();
})();
