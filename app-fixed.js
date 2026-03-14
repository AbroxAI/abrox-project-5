// app-full-realism-bubble-sync-v1.js — Telegram 2026 FULL: Bubble Renderer + Realism + Interactions + Header Typing
document.addEventListener("DOMContentLoaded", () => {

'use strict';

// =======================
// SAFE APPEND WRAPPER
// =======================
function appendSafe(persona, text, opts = {}) {
  if (!window.TGRenderer?.appendMessage) return null;
  const resultId = window.TGRenderer.appendMessage(persona, text, opts);
  document.dispatchEvent(new CustomEvent("messageAppended", { detail: { persona, id: resultId } }));
  return resultId;
}

// =======================
// HEADER TYPING QUEUE
// =======================
const typingPersons = new Map();
function updateHeaderTyping() {
  const headerMeta = document.getElementById("tg-meta-line");
  if (!headerMeta) return;
  const names = Array.from(typingPersons.keys());
  if (!names.length) {
    headerMeta.textContent = `${window.MEMBER_COUNT?.toLocaleString()||0} members, ${window.ONLINE_COUNT?.toLocaleString()||0} online`;
  } else if (names.length===1) headerMeta.textContent = `${names[0]} is typing…`;
  else if (names.length===2) headerMeta.textContent = `${names[0]} & ${names[1]} are typing…`;
  else headerMeta.textContent = `${names[0]}, ${names[1]} +${names.length-2} are typing…`;
}

document.addEventListener("headerTyping", ev => {
  const name = ev.detail?.name;
  if (!name) return;
  if (typingPersons.has(name)) clearTimeout(typingPersons.get(name));
  const timeout = setTimeout(() => { typingPersons.delete(name); updateHeaderTyping(); }, 5000);
  typingPersons.set(name, timeout);
  updateHeaderTyping();
});

document.addEventListener("messageAppended", ev => {
  const persona = ev.detail?.persona;
  if (!persona?.name) return;
  if (typingPersons.has(persona.name)) {
    clearTimeout(typingPersons.get(persona.name));
    typingPersons.delete(persona.name);
    updateHeaderTyping();
  }
});

// =======================
// QUEUED TYPING FOR PERSONAS
// =======================
let typingQueue = Promise.resolve();
function queuedTyping(persona, message) {
  if (!persona?.name) return Promise.resolve();
  typingQueue = typingQueue.then(async () => {
    document.dispatchEvent(new CustomEvent("headerTyping", { detail: { name: persona.name } }));
    const duration = window.TGRenderer?.calculateTypingDuration?.(message) || 1200;
    await new Promise(res => setTimeout(res, duration));
  }).catch(console.error);
  return typingQueue;
}

// =======================
// ADMIN BROADCAST + PIN
// =======================
function postAdminBroadcast() {
  const admin = window.identity?.Admin || { name:"Admin", avatar:"assets/admin.jpg", isAdmin:true };
  const caption = `📌 Group Rules
1️⃣ New members are read-only until verified.
2️⃣ Admins do NOT DM directly.
3️⃣ 🚫 No screenshots in chat.
4️⃣ ⚠️ Ignore unsolicited messages.
✅ To verify or contact admin, use the Contact Admin button below.`;
  const image = "assets/broadcast.jpg";
  const id = appendSafe(admin, "", { timestamp:new Date(), type:"incoming", image, caption });
  return { id, image };
}

function showPinBanner(image, pinnedMessageId) {
  const pinBanner = document.getElementById("tg-pin-banner");
  if (!pinBanner) return;
  pinBanner.innerHTML="";
  const img = document.createElement("img"); img.src=image;
  const text = document.createElement("div"); text.className="tg-pin-text"; text.textContent="📌 Group Rules";
  const blueBtn = document.createElement("button"); blueBtn.className="pin-btn"; blueBtn.textContent="View Pinned"; 
  blueBtn.onclick = () => pinnedMessageId && document.querySelector(`[data-id="${pinnedMessageId}"]`)?.scrollIntoView({behavior:"smooth", block:"center"});
  const adminBtn = document.createElement("a"); adminBtn.className="glass-btn"; adminBtn.href=window.CONTACT_ADMIN_LINK||"https://t.me/"; adminBtn.target="_blank"; adminBtn.textContent="Contact Admin";
  const btnContainer = document.createElement("div"); btnContainer.className="pin-btn-container"; btnContainer.appendChild(blueBtn); btnContainer.appendChild(adminBtn);
  pinBanner.appendChild(img); pinBanner.appendChild(text); pinBanner.appendChild(btnContainer);
  pinBanner.classList.remove("hidden"); requestAnimationFrame(()=>pinBanner.classList.add("show"));
}

const broadcast = postAdminBroadcast();
setTimeout(()=>{ showPinBanner(broadcast.image, broadcast.id); },1200);

// =======================
// ADMIN AUTO RESPONSE
// =======================
document.addEventListener("sendMessage", async ev=>{
  const text = ev.detail?.text || "";
  const admin = window.identity?.Admin || {name:"Admin", avatar:"assets/admin.jpg"};
  await queuedTyping(admin, text);
  appendSafe(admin, "Please use the Contact Admin button in the pinned banner above.", {timestamp:new Date(), type:"incoming"});
});

// =======================
// AUTO REPLY HANDLER
// =======================
document.addEventListener("autoReply", async ev=>{
  const { parentText, persona, text } = ev.detail || {};
  if(!persona || !text) return;
  await queuedTyping(persona, text);
  appendSafe(persona, text, {timestamp:new Date(), type:"incoming", replyToText:parentText});
});

// =======================
// START REALISM ENGINE
// =======================
if(window.realism?.simulate){ setTimeout(()=>window.realism.simulate(),800); }

// =======================
// START INTERACTIONS ENGINE
// =======================
if(window.interactions?.autoSimulate){ setTimeout(()=>window.interactions.autoSimulate(),1200); }

console.log("✅ App Full Realism + Bubble Sync — fully integrated with TGRenderer, join stickers, reactions, pinned messages, header typing.");
});
