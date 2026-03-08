// history-loader-fixed.js — lazy history loader + chunked + correct dates + recent-first typing
(function(){
"use strict";

const HISTORY_CHUNK_SIZE = 50; // number of messages to load per batch
const LOAD_DELAY = 120; // ms between message render to simulate typing

let historyQueue = []; // full 10k messages
let historyIndex = 0; // next message to load

function sortByTimestamp(messages){
  return messages.sort((a,b)=>new Date(a.timestamp) - new Date(b.timestamp));
}

// initialize the history queue
window.initHistoryLoader = function(messages){
  if(!Array.isArray(messages)) return;
  historyQueue = sortByTimestamp(messages); // oldest -> newest
  historyIndex = historyQueue.length; // start loading from the end
  console.log(`🗂 History loader initialized: ${historyQueue.length} messages`);
}

// load next chunk from history
async function loadNextChunk(){
  if(historyIndex <= 0) return;

  const chunkStart = Math.max(0, historyIndex - HISTORY_CHUNK_SIZE);
  const chunk = historyQueue.slice(chunkStart, historyIndex);
  historyIndex = chunkStart;

  // render each message with delay to simulate typing
  for(const msg of chunk){
    if(!msg.persona) msg.persona = {name:"User", avatar:null};
    window.TGRenderer.appendMessage(msg.persona,msg.text,{
      id: msg.id,
      timestamp: new Date(msg.timestamp),
      type: msg.type || "incoming",
      reactions: msg.reactions || [],
      replyToId: msg.replyToId || null,
      replyToText: msg.replyToText || null,
      caption: msg.caption || null,
      image: msg.image || null
    });
    await delay(LOAD_DELAY);
  }
}

// start loading history in background
window.startHistoryLoader = async function(){
  while(historyIndex > 0){
    await loadNextChunk();
    await delay(200); // small delay between chunks
  }
  console.log("✅ History fully loaded");
}

// simulate typing indicator for recent messages
window.simulateRecentTyping = async function(recentMessages){
  if(!Array.isArray(recentMessages)) return;

  for(const msg of recentMessages){
    if(!msg.persona) msg.persona = {name:"User", avatar:null};
    await window.queuedTyping(msg.persona,msg.text);
    window.TGRenderer.appendMessage(msg.persona,msg.text,{
      id: msg.id,
      timestamp: new Date(msg.timestamp),
      type: msg.type || "incoming",
      reactions: msg.reactions || [],
      replyToId: msg.replyToId || null,
      replyToText: msg.replyToText || null
    });
  }
}

// main loader entry point
window.loadHistory = async function(allMessages){
  if(!Array.isArray(allMessages) || !allMessages.length) return;

  // split recent messages for typing simulation
  const RECENT_COUNT = 5;
  const recentMessages = allMessages.slice(-RECENT_COUNT);
  const olderMessages = allMessages.slice(0,-RECENT_COUNT);

  window.initHistoryLoader(olderMessages);
  window.startHistoryLoader(); // load older messages in background

  // show recent messages with typing simulation
  window.simulateRecentTyping(recentMessages);
}
})();
