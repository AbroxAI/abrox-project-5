// abrox-bundle.js — Full polished live chat

// ==========================
// IDENTITY & PERSONA POOL
// ==========================
window.identity = (function(){
  const SyntheticPool = [];
  const emojis = ["🔥","💎","🚀","⚡","🤑","💰","🎯","📈"];
  const colors = [...Array(15).keys()].map(n=>n+1);

  function buildUniqueName(){
    const names = ["CryptoKing","MoonHunter","ProfitSeeker","TraderX","AlphaWolf","BlockMaster"];
    return names[Math.floor(Math.random()*names.length)] + Math.floor(Math.random()*9999);
  }

  function buildUniqueAvatar(name){
    return `https://avatars.dicebear.com/api/bottts/${encodeURIComponent(name)}.png`;
  }

  function generateSyntheticPersona(){
    const name = buildUniqueName();
    const avatar = buildUniqueAvatar(name);
    const color = colors[Math.floor(Math.random()*colors.length)];
    const emoji = emojis[Math.floor(Math.random()*emojis.length)];
    const persona = {name:`${emoji} ${name}`, avatar, color};
    SyntheticPool.push(persona);
    return persona;
  }

  function getRandomPersona(){
    if(!SyntheticPool.length) for(let i=0;i<50;i++) generateSyntheticPersona();
    const idx = Math.floor(Math.random()*SyntheticPool.length);
    return SyntheticPool[idx];
  }

  const Admin = {name:"Admin", avatar:"assets/admin.jpg", isAdmin:true, color:1};
  const ready = new Promise(r=>setTimeout(r,50));
  return {SyntheticPool, generateSyntheticPersona, getRandomPersona, Admin, ready};
})();

// ==========================
// BUBBLE RENDERER
// ==========================
window.TGRenderer = (function(){
  const container = document.getElementById("tg-comments-container");

  function appendMessage(persona, text, opts={}){
    if(!container) return null;
    const bubble = document.createElement("div");
    bubble.className = `tg-bubble ${opts.type==='outgoing'?'outgoing':'incoming'}`;
    const messageId = opts.id || 'msg_' + Date.now() + '_' + Math.floor(Math.random()*9999);
    bubble.dataset.id = messageId;

    const avatar = document.createElement("img");
    avatar.className = "tg-bubble-avatar";
    avatar.src = persona.avatar || "assets/default-avatar.jpg";
    avatar.alt = persona.name || "User";
    bubble.appendChild(avatar);

    const content = document.createElement("div");
    content.className = "tg-bubble-content";

    if(opts.image){
      const img = document.createElement("img");
      img.className = "tg-bubble-image";
      img.src = opts.image;
      img.style.maxWidth = "100%";
      img.style.borderRadius = "14px";
      content.appendChild(img);
    }

    if(opts.caption){
      const cap = document.createElement("div");
      cap.className = "tg-bubble-caption";
      cap.textContent = opts.caption;
      cap.style.marginTop = "4px";
      content.appendChild(cap);
    }

    const sender = document.createElement("div");
    sender.className = "tg-bubble-sender";
    sender.dataset.color = persona.color || 1;
    sender.textContent = persona.name || "User";
    content.appendChild(sender);

    const msg = document.createElement("div");
    msg.className = "tg-bubble-text";
    msg.textContent = text;
    content.appendChild(msg);

    const meta = document.createElement("div");
    meta.className = "tg-bubble-meta";
    meta.textContent = (opts.timestamp||new Date()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    content.appendChild(meta);

    if(opts.reactions){
      const pill = document.createElement("div");
      pill.className = "tg-reaction-pill";
      opts.reactions.forEach(r=>{
        const rEl = document.createElement("span");
        rEl.className = "tg-reaction-item";
        rEl.textContent = r;
        rEl.onclick=()=>{alert(`${r} clicked on message!`);};
        pill.appendChild(rEl);
      });
      content.appendChild(pill);
    }

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

    bubble.appendChild(content);
    container.appendChild(bubble);

    if(opts.scroll!==false){
      if(container.scrollTop + container.clientHeight >= container.scrollHeight - 20){
        requestAnimationFrame(()=>{ container.scrollTop = container.scrollHeight; });
      } else {
        const jump = document.getElementById("tg-jump-indicator");
        if(jump) jump.classList.remove("hidden");
      }
    }

    return messageId;
  }

  function calculateTypingDuration(message){
    const words = message.split(/\s+/).length;
    return Math.min(Math.max(words*200,800),4000);
  }

  function jumpToMessage(id){
    const el = container.querySelector(`[data-id="${id}"]`);
    if(!el) return;
    el.scrollIntoView({behavior:"smooth", block:"center"});
    el.classList.add("tg-highlight");
    setTimeout(()=>el.classList.remove("tg-highlight"),2600);
  }

  function clearAll(){
    if(container) container.innerHTML="";
  }

  return {appendMessage, calculateTypingDuration, jumpToMessage, clearAll};
})();

// ==========================
// REALISM ENGINE
// ==========================
window.realism = (function(){
  let started = false;
  let typingQueue = Promise.resolve();
  const typingPersons = new Map();

  function updateHeaderTyping(){
    const header = document.getElementById("tg-meta-line");
    if(!header) return;
    const names = Array.from(typingPersons.keys());
    if(names.length===0){
      header.textContent = `${window.MEMBER_COUNT?.toLocaleString()||0} members, ${window.ONLINE_COUNT?.toLocaleString()||0} online`;
    } else if(names.length===1){
      header.textContent = `${names[0]} is typing…`;
    } else if(names.length===2){
      header.textContent = `${names[0]} & ${names[1]} are typing…`;
    } else {
      header.textContent = `${names[0]}, ${names[1]} +${names.length-2} are typing…`;
    }
  }

  function queuedTyping(persona,message){
    if(!persona?.name) return Promise.resolve();
    typingQueue = typingQueue.then(async ()=>{
      typingPersons.set(persona.name,setTimeout(()=>{
        typingPersons.delete(persona.name);
        updateHeaderTyping();
      },5000));
      updateHeaderTyping();
      const duration = window.TGRenderer.calculateTypingDuration(message);
      await new Promise(r=>setTimeout(r,duration));
    }).catch(()=>{});
    return typingQueue;
  }

  async function simulateMessage(){
    const persona = window.identity.getRandomPersona();
    const texts = ["🚀 To the moon!","💎 HODL tight!","Profit is coming…","Check this chart 📈","🔥 Major trend spike!"];
    const text = texts[Math.floor(Math.random()*texts.length)];
    await queuedTyping(persona,text);
    window.TGRenderer.appendMessage(persona,text);
  }

  async function simulate(){
    if(started) return;
    started=true;
    setInterval(simulateMessage, Math.random()*(window.REALISM_CONFIG.MAX_INTERVAL_MS-window.REALISM_CONFIG.MIN_INTERVAL_MS)+window.REALISM_CONFIG.MIN_INTERVAL_MS);
  }

  async function postAdminBroadcast(){
    const admin = window.identity.Admin;
    const caption = `📌 Group Rules

1️⃣ New members are read-only until verified.
2️⃣ Admins do NOT DM directly.
3️⃣ 🚫 No screenshots in chat.
4️⃣ ⚠️ Ignore unsolicited messages.

✅ To verify or contact admin, use the Contact Admin button below.`;
    const image = "assets/broadcast.jpg";
    const timestamp = new Date();
    const id = window.TGRenderer.appendMessage(admin,"",{timestamp,type:"incoming",image,caption});
    return {id,image};
  }

  function postPinNotice(){
    window.TGRenderer.appendMessage({name:"System",avatar:"assets/admin.jpg"},"Admin pinned a message",{timestamp:new Date(),type:"incoming"});
  }

  function showPinBanner(image,id){
    const pinBanner = document.getElementById("tg-pin-banner");
    if(!pinBanner) return;
    pinBanner.innerHTML="";
    const img = document.createElement("img"); img.src=image; img.onerror=()=>img.src="assets/admin.jpg";
    const text = document.createElement("div"); text.className="tg-pin-text"; text.textContent="📌 Group Rules";
    const blueBtn = document.createElement("button"); blueBtn.className="pin-btn"; blueBtn.textContent="View Pinned"; blueBtn.onclick=()=>window.TGRenderer.jumpToMessage(id);
    const adminBtn = document.createElement("a"); adminBtn.className="glass-btn"; adminBtn.href=window.CONTACT_ADMIN_LINK; adminBtn.target="_blank"; adminBtn.rel="noopener"; adminBtn.textContent="Contact Admin";
    const btnContainer = document.createElement("div"); btnContainer.className="pin-btn-container"; btnContainer.appendChild(blueBtn); btnContainer.appendChild(adminBtn);
    pinBanner.appendChild(img); pinBanner.appendChild(text); pinBanner.appendChild(btnContainer);
    pinBanner.classList.remove("hidden");
    requestAnimationFrame(()=>pinBanner.classList.add("show"));
  }

  return {started,simulate,queuedTyping,postAdminBroadcast,postPinNotice,showPinBanner};
})();

// ==========================
// JOINER SIMULATOR
// ==========================
window.joiner = (function(){
  async function simulateJoins(count){
    for(let i=0;i<count;i++){
      const persona = window.identity.getRandomPersona();
      const msg = window.JOINER_CONFIG.welcomeMessage || "Welcome!";
      await window.realism.queuedTyping(persona,msg);
      window.TGRenderer.appendMessage(persona,msg);
    }
  }
  return {simulateJoins};
})();

// ==========================
// HISTORY LOADER & INTERACTIONS
// ==========================
window.historyLoader = {async loadHistory(){/* stub history */}};
window.interactions = {ready:false};
