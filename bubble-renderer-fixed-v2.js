// bubble-renderer-fixed-v2.js — FULL bubble & chat rendering + all logics
window.TGRenderer = (function(){
"use strict";

const container = document.getElementById("tg-comments-container");
if(!container) console.warn("TGRenderer: container not found.");

// emoji regex for optional use
const emojiRe = /[\u{1F300}-\u{1FAFF}]/u;

// -----------------------------
// MESSAGE APPENDER
// -----------------------------
function appendMessage(persona, text, opts={}){
  if(!container) return null;

  const bubble = document.createElement("div");
  bubble.className = `tg-bubble ${opts.type==='outgoing'?'outgoing':'incoming'}`;
  const messageId = opts.id || 'msg_' + Date.now() + '_' + Math.floor(Math.random()*9999);
  bubble.dataset.id = messageId;

  // ---------- AVATAR ----------
  const avatar = document.createElement("img");
  avatar.className = "tg-bubble-avatar";
  avatar.src = persona.avatar || "assets/default-avatar.jpg";
  avatar.alt = persona.name || "User";
  bubble.appendChild(avatar);

  // ---------- CONTENT ----------
  const content = document.createElement("div");
  content.className = "tg-bubble-content";

  // optional image
  if(opts.image){
    const img = document.createElement("img");
    img.className = "tg-bubble-image";
    img.src = opts.image;
    img.style.maxWidth = "100%";
    img.style.borderRadius = "14px";
    content.appendChild(img);
  }

  // optional caption
  if(opts.caption){
    const cap = document.createElement("div");
    cap.className = "tg-bubble-caption";
    cap.textContent = opts.caption;
    cap.style.marginTop = "4px";
    content.appendChild(cap);
  }

  // sender name
  const sender = document.createElement("div");
  sender.className = "tg-bubble-sender";
  sender.dataset.color = persona.color || 1;
  sender.textContent = persona.name || "User";
  content.appendChild(sender);

  // message text
  const msg = document.createElement("div");
  msg.className = "tg-bubble-text";
  msg.textContent = text;
  content.appendChild(msg);

  // meta timestamp
  const meta = document.createElement("div");
  meta.className = "tg-bubble-meta";
  meta.textContent = (opts.timestamp || new Date()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  content.appendChild(meta);

  // reactions
  if(opts.reactions){
    const pill = document.createElement("div");
    pill.className = "tg-reaction-pill";
    opts.reactions.forEach(r=>{
      const rEl = document.createElement("span");
      rEl.className = "tg-reaction-item";
      rEl.textContent = r;
      pill.appendChild(rEl);
    });
    content.appendChild(pill);
  }

  // reply preview
  if(opts.reply){
    const reply = document.createElement("div");
    reply.className = "tg-reply-preview";
    reply.textContent = opts.reply;
    reply.onclick = ()=>{
      const target = container.querySelector(`[data-id="${opts.replyToId}"]`);
      if(target) target.scrollIntoView({behavior:"smooth", block:"center"});
    };
    content.appendChild(reply);
  }

  // append content to bubble
  bubble.appendChild(content);
  container.appendChild(bubble);

  // auto scroll unless disabled
  if(opts.scroll !== false){
    requestAnimationFrame(()=>{ container.scrollTop = container.scrollHeight; });
  }

  return messageId;
}

// -----------------------------
// TYPING DURATION CALCULATOR
// -----------------------------
function calculateTypingDuration(message){
  const words = message.split(/\s+/).length;
  // realistic typing timing with min 800ms, max 4000ms
  return Math.min(Math.max(words*200, 800), 4000);
}

// -----------------------------
// JUMP TO MESSAGE
// -----------------------------
function jumpToMessage(id){
  const el = container.querySelector(`[data-id="${id}"]`);
  if(!el) return;
  el.scrollIntoView({behavior:"smooth", block:"center"});
  el.classList.add("tg-highlight");
  setTimeout(()=>el.classList.remove("tg-highlight"), 2600);
}

// -----------------------------
// CLEAR ALL
// -----------------------------
function clearAll(){
  if(container) container.innerHTML = "";
}

// -----------------------------
// REACTION ADD/REMOVE LOGIC (Optional for realism engine)
// -----------------------------
function addReaction(messageId, reaction){
  const bubble = container.querySelector(`[data-id="${messageId}"]`);
  if(!bubble) return;
  let pill = bubble.querySelector(".tg-reaction-pill");
  if(!pill){
    pill = document.createElement("div");
    pill.className = "tg-reaction-pill";
    bubble.querySelector(".tg-bubble-content").appendChild(pill);
  }
  const rEl = document.createElement("span");
  rEl.className = "tg-reaction-item";
  rEl.textContent = reaction;
  pill.appendChild(rEl);
}

// -----------------------------
// EXPOSE API
// -----------------------------
return {
  appendMessage,
  calculateTypingDuration,
  jumpToMessage,
  clearAll,
  addReaction
};

})();
