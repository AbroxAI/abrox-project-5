// app-fixed.js — FINAL Telegram 2026 Integration (Header typing fully fixed, multiple typers, inline dots)
document.addEventListener("DOMContentLoaded", () => {
  const pinBanner = document.getElementById("tg-pin-banner");
  const container = document.getElementById("tg-comments-container");
  const headerMeta = document.getElementById("tg-meta-line");
  const headerTyping = document.getElementById("tg-header-typing");

  if (!container) { console.error("tg-comments-container missing in DOM"); return; }

  /* =====================================================
     TELEGRAM HIGHLIGHT PULSE
  ===================================================== */
  const style = document.createElement('style');
  style.textContent = `
  .tg-highlight { 
    background-color: rgba(255, 229, 100, 0.3); 
    border-radius: 14px; 
    animation: tgFadePulse 2.6s ease-out forwards; 
  } 
  @keyframes tgFadePulse { 
    0% { opacity: 1; transform: scale(1.02); } 
    20% { opacity: 1; transform: scale(1); } 
    100% { opacity: 0; transform: scale(1); } 
  }
  `;
  document.head.appendChild(style);

  /* =====================================================
     SAFE APPEND WRAPPER
  ===================================================== */
  function appendSafe(persona, text, opts = {}) {
    if (!window.TGRenderer?.appendMessage) { console.warn("TGRenderer not ready"); return null; }
    const result = window.TGRenderer.appendMessage(persona, text, opts);
    document.dispatchEvent(new CustomEvent("messageAppended", { detail: { persona } }));
    return result;
  }

  /* =====================================================
     HEADER TYPING MANAGER (inline dots, multiple typers)
  ===================================================== */
  const activeTypers = new Map();
  const TYPING_TIMEOUT = 5000; // ms before auto-stop
  const MAX_DISPLAY_NAMES = 3;

  function formatNames(names){
    if(names.length <= MAX_DISPLAY_NAMES){
      if(names.length === 1) return names[0];
      if(names.length === 2) return names.join(' & ');
      return names.slice(0, -1).join(', ') + ' & ' + names[names.length-1];
    } else {
      const remaining = names.length - MAX_DISPLAY_NAMES;
      return names.slice(0, MAX_DISPLAY_NAMES).join(', ') + ` & ${remaining} other${remaining>1?'s':''}`;
    }
  }

  function updateHeaderTyping(){
    if(!headerTyping) return;
    const names = Array.from(activeTypers.keys());
    headerTyping.innerHTML = '';

    if(names.length === 0){
      headerTyping.classList.add('hidden');
      if(headerMeta) headerMeta.textContent =
        `${window.MEMBER_COUNT?.toLocaleString?.() || "0"} members, ` +
        `${window.ONLINE_COUNT?.toLocaleString?.() || "0"} online`;
      return;
    }

    headerTyping.classList.remove('hidden');

    // Single inline wrapper for all names + "is/are typing" + dots
    const wrapper = document.createElement('span');
    wrapper.className = 'tg-header-typing-inline';

    const textSpan = document.createElement('span');
    textSpan.textContent = `${formatNames(names)} ${names.length === 1 ? 'is typing' : 'are typing'} `;
    wrapper.appendChild(textSpan);

    const dots = document.createElement('span');
    dots.className = 'typing-dots';
    for(let i=0;i<3;i++) dots.appendChild(document.createElement('span'));
    wrapper.appendChild(dots);

    headerTyping.appendChild(wrapper);
  }

  window.headerTypingStart = function(name){
    if(!name) return;
    if(activeTypers.has(name)) clearTimeout(activeTypers.get(name));
    activeTypers.set(name, setTimeout(()=>{ window.headerTypingStop(name); }, TYPING_TIMEOUT));
    updateHeaderTyping();
  }

  window.headerTypingStop = function(name){
    if(activeTypers.has(name)){
      clearTimeout(activeTypers.get(name));
      activeTypers.delete(name);
      updateHeaderTyping();
    }
  }

  // Stop typing when message is appended
  document.addEventListener("messageAppended", (ev)=>{
    const persona = ev.detail?.persona;
    if(!persona?.name) return;
    window.headerTypingStop(persona.name);
  });

  /* =====================================================
     PIN SYSTEM & BROADCAST
  ===================================================== */
  function jumpToMessage(el){
    if(!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("tg-highlight");
    setTimeout(() => el.classList.remove("tg-highlight"), 2600);
  }

  function safeJumpById(id, retries = 6){
    const el = document.querySelector(`[data-id="${id}"]`);
    if(el) jumpToMessage(el);
    else if(retries>0) setTimeout(()=>safeJumpById(id, retries-1), 200);
  }

  function postAdminBroadcast(){
    const admin = window.identity?.Admin || { name: "Admin", avatar: "assets/admin.jpg", isAdmin:true };
    const caption = `📌 Group Rules

1️⃣ New members are read-only until verified.
2️⃣ Admins do NOT DM directly.
3️⃣ 🚫 No screenshots in chat.
4️⃣ ⚠️ Ignore unsolicited messages.

✅ To verify or contact admin, use the Contact Admin button below.`;
    const image = "assets/broadcast.jpg";
    const timestamp = new Date();
    const id = appendSafe(admin, "", { timestamp, type:"incoming", image, caption });
    return { id, image };
  }

  function showPinBanner(image, pinnedMessageId){
    if(!pinBanner) return;
    pinBanner.innerHTML = "";
    const img = document.createElement("img");
    img.src = image;
    img.onerror = () => img.src="assets/admin.jpg";

    const text = document.createElement("div");
    text.className = "tg-pin-text";
    text.textContent = "📌 Group Rules";

    const blueBtn = document.createElement("button");
    blueBtn.className = "pin-btn";
    blueBtn.textContent = "View Pinned";
    blueBtn.onclick = () => pinnedMessageId && safeJumpById(pinnedMessageId);

    const adminBtn = document.createElement("a");
    adminBtn.className = "glass-btn";
    adminBtn.href = window.CONTACT_ADMIN_LINK || "https://t.me/";
    adminBtn.target = "_blank";
    adminBtn.rel = "noopener";
    adminBtn.textContent = "Contact Admin";

    const btnContainer = document.createElement("div");
    btnContainer.className = "pin-btn-container";
    btnContainer.appendChild(blueBtn);
    btnContainer.appendChild(adminBtn);

    pinBanner.appendChild(img);
    pinBanner.appendChild(text);
    pinBanner.appendChild(btnContainer);

    pinBanner.classList.remove("hidden");
    requestAnimationFrame(()=>pinBanner.classList.add("show"));
  }

  function postPinNotice(){
    appendSafe({ name:"System", avatar:"assets/admin.jpg" }, "Admin pinned a message", { timestamp: new Date(), type:"incoming" });
  }

  const broadcast = postAdminBroadcast();
  setTimeout(()=>{ postPinNotice(); showPinBanner(broadcast.image, broadcast.id); }, 1200);

  /* =====================================================
     GLOBAL TYPING QUEUE
  ===================================================== */
  let typingQueue = Promise.resolve();

  function queuedTyping(persona, message){
    if(!persona?.name) return Promise.resolve();
    typingQueue = typingQueue.then(async ()=>{
      window.headerTypingStart(persona.name);
      const duration = window.TGRenderer?.calculateTypingDuration?.(message) || 1200;
      await new Promise(r=>setTimeout(r,duration));
    }).catch(console.error);
    return typingQueue;
  }

  /* =====================================================
     ADMIN AUTO RESPONSE & AUTO REPLY
  ===================================================== */
  document.addEventListener("sendMessage", async (ev)=>{
    const text = ev.detail?.text || "";
    const admin = window.identity?.Admin || { name:"Admin", avatar:"assets/admin.jpg" };
    await queuedTyping(admin, text);
    appendSafe(admin, "Please use the Contact Admin button in the pinned banner above.", { timestamp:new Date(), type:"incoming" });
  });

  document.addEventListener("autoReply", async (ev)=>{
    const { parentText, persona, text } = ev.detail || {};
    if(!persona || !text) return;
    await queuedTyping(persona, text);
    appendSafe(persona, text, { timestamp:new Date(), type:"incoming", replyToText:parentText });
  });

  /* =====================================================
     REALISM ENGINE (Join Sticker fix)
  ===================================================== */
  if(window.realism?.simulate){
    setTimeout(()=>{
      window.realism.simulate();
      if(window.TGRenderer){
        window.TGRenderer.appendJoinSticker = function(names){
          if(!names?.length) return;
          const container = document.getElementById("tg-comments-container");
          const lastSticker = container?.querySelector(".tg-join-sticker:last-of-type");
          if(lastSticker) lastSticker.remove();
          const wrapper = document.createElement("div");
          wrapper.className = "tg-join-sticker";
          const textEl = document.createElement("div");
          textEl.className = "tg-join-text";
          textEl.textContent = names.length>3
            ? `${names.slice(0,3).join(", ")} & ${names.length-3} others joined the chat`
            : `${names.join(", ")} joined the chat`;
          wrapper.appendChild(textEl);
          container?.appendChild(wrapper);
          if(container.scrollTop + container.clientHeight >= container.scrollHeight - 80)
            container.scrollTop = container.scrollHeight;
        };
      }
    }, 800);
  }

  console.log("✅ app.js FINAL — header typing fully working, multiple typers, inline dots, join stickers fixed.");
});
