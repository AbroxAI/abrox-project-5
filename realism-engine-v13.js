// realism-engine-v15-fixed.js — full simulation engine with randomness
window.realism = (function(){
"use strict";

// references
const container = document.getElementById("tg-comments-container");

// -----------------------------
// CONFIGURATION (from window.REALISM_CONFIG)
const cfg = window.REALISM_CONFIG || {
  TOTAL_PERSONAS: 1200,
  INITIAL_POOL: 400,
  POOL_MIN: 300,
  POOL_MAX: 3000,
  DEDUP_LIMIT: 200000,
  MIN_INTERVAL_MS: 20000,
  MAX_INTERVAL_MS: 60000,
  REACTION_TICK_MS: 30000,
  TREND_SPIKE_PROB: 0.02
};

// state
const state = {
  started: false,
  active: [],
  messageCount: 0,
  trendSpikes: []
};

// -----------------------------
// HELPER RANDOM
function randomInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function randomChoice(arr){ return arr[randomInt(0,arr.length-1)]; }

// -----------------------------
// QUEUED TYPING
async function queuedTyping(persona, message){
  if(!persona?.name) return;
  document.dispatchEvent(new CustomEvent("headerTyping",{detail:{name:persona.name}}));
  const duration = window.TGRenderer?.calculateTypingDuration?.(message) || 1200;
  await new Promise(r=>setTimeout(r,duration));
}

// -----------------------------
// MESSAGE GENERATION
function generateMessage(persona){
  const phrases = [
    "Hello everyone!","Check this out!","What do you think?","Amazing!","🚀💰","LOL","Can anyone help?","🔥🔥🔥"
  ];
  const emojis = ["😎","😂","👍","💡","🤖","💰","🚀","✅"];
  let text = randomChoice(phrases);
  if(Math.random()<0.4) text += " " + randomChoice(emojis);
  return text;
}

// -----------------------------
// SIMULATE RANDOM ACTIVITY
async function simulate(){
  if(state.started) return;
  state.started = true;

  while(true){
    // pick random persona
    const persona = window.identity.getRandomPersona();
    if(!persona) break;

    const msg = generateMessage(persona);
    await queuedTyping(persona, msg);

    // append message
    window.TGRenderer.appendMessage(persona, msg, {type:'incoming'});
    state.messageCount++;

    // randomly add reactions
    if(Math.random()<0.3){
      const reaction = randomChoice(["👍","❤️","😂","🔥","🚀"]);
      window.TGRenderer.addReaction('msg_' + (Date.now()-randomInt(1,50)), reaction);
    }

    // trend spike
    if(Math.random()<cfg.TREND_SPIKE_PROB){
      const spikeCount = randomInt(2,5);
      for(let i=0;i<spikeCount;i++){
        const p = window.identity.getRandomPersona();
        const t = generateMessage(p);
        await queuedTyping(p,t);
        window.TGRenderer.appendMessage(p,t,{type:'incoming'});
      }
    }

    // wait random interval before next
    const wait = randomInt(cfg.MIN_INTERVAL_MS,cfg.MAX_INTERVAL_MS);
    await new Promise(r=>setTimeout(r,wait));
  }
}

// -----------------------------
// ADMIN BROADCAST & PIN
// -----------------------------
async function postAdminBroadcast(){
  const admin = window.identity.Admin || { name:"Admin", avatar:"assets/admin.jpg", isAdmin:true };
  const caption = `📌 Group Rules

1️⃣ New members are read-only until verified.
2️⃣ Admins do NOT DM directly.
3️⃣ 🚫 No screenshots in chat.
4️⃣ ⚠️ Ignore unsolicited messages.

✅ To verify or contact admin, use the Contact Admin button below.`;

  const image = "assets/broadcast.jpg";
  const timestamp = new Date(2025,2,14,10,0,0);

  const id = await window.TGRenderer.appendMessage(admin,"",{timestamp,type:"incoming",image,caption});
  return {id,image};
}

function showPinBanner(image,pinnedMessageId){
  const pinBanner = document.getElementById("tg-pin-banner");
  if(!pinBanner) return;
  pinBanner.innerHTML = "";

  const img = document.createElement("img");
  img.src = image;
  img.onerror = ()=>img.src="assets/admin.jpg";

  const text = document.createElement("div");
  text.className="tg-pin-text";
  text.textContent="📌 Group Rules";

  const blueBtn = document.createElement("button");
  blueBtn.className="pin-btn";
  blueBtn.textContent="View Pinned";
  blueBtn.onclick=()=>pinnedMessageId && window.TGRenderer.jumpToMessage(pinnedMessageId);

  const adminBtn = document.createElement("a");
  adminBtn.className="glass-btn";
  adminBtn.href=window.CONTACT_ADMIN_LINK || "https://t.me/";
  adminBtn.target="_blank";
  adminBtn.rel="noopener";
  adminBtn.textContent="Contact Admin";

  const btnContainer = document.createElement("div");
  btnContainer.className="pin-btn-container";
  btnContainer.appendChild(blueBtn);
  btnContainer.appendChild(adminBtn);

  pinBanner.appendChild(img);
  pinBanner.appendChild(text);
  pinBanner.appendChild(btnContainer);

  pinBanner.classList.remove("hidden");
  requestAnimationFrame(()=>pinBanner.classList.add("show"));
}

function postPinNotice(){
  const sysPersona = {name:"System",avatar:"assets/admin.jpg"};
  window.TGRenderer.appendMessage(sysPersona,"Admin pinned a message",{type:"incoming",timestamp:new Date()});
}

// -----------------------------
// EXPOSE
// -----------------------------
return {
  simulate,
  queuedTyping,
  postAdminBroadcast,
  showPinBanner,
  postPinNotice,
  started:false
};

})();
