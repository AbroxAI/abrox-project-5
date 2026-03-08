// abrox-bundle.js — Full Abrox Chat Bundle (identity, renderer, realism, joiners, interactions)

// ==========================
// IDENTITY / PERSONAS
// ==========================
window.identity = (function(){
  const SyntheticPool = [];
  const colors = ["#2ea6ff","#ff6b6b","#ffb86c","#8be9fd","#50fa7b","#ff79c6","#bd93f9","#f1fa8c","#ff5555","#6272a4","#ff6e96","#8affff","#ffde6d","#5aff7a","#d16fff"];

  function buildUniqueName(){ 
    const adjectives = ["Crypto","Profit","Moon","Rocket","HODL","Diamond","Bull","Bear","Trend","Whale"];
    const nouns = ["Hunter","Trader","Miner","Shark","Investor","Guru","Analyst","Speculator"];
    return adjectives[Math.floor(Math.random()*adjectives.length)] + " " + nouns[Math.floor(Math.random()*nouns.length)];
  }

  function buildUniqueAvatar(name){
    const hash = name.split("").reduce((a,b)=>a+b.charCodeAt(0),0);
    return `https://avatars.dicebear.com/api/identicon/${hash}.svg`;
  }

  function generateSyntheticPersona(){
    const name = buildUniqueName();
    return {
      name,
      avatar: buildUniqueAvatar(name),
      color: Math.floor(Math.random()*colors.length)+1
    };
  }

  // Pre-fill pool
  for(let i=0;i<(window.REALISM_CONFIG?.INITIAL_POOL||400);i++){
    SyntheticPool.push(generateSyntheticPersona());
  }

  const Admin = {
    name: "Admin",
    avatar: "assets/admin.jpg",
    isAdmin: true,
    color: 1
  };

  async function ready(){
    while(SyntheticPool.length<1) await new Promise(r=>setTimeout(r,50));
  }

  function getRandomPersona(){
    return SyntheticPool[Math.floor(Math.random()*SyntheticPool.length)];
  }

  return {
    SyntheticPool,
    Admin,
    getRandomPersona,
    generateSyntheticPersona,
    ready
  };
})();

// ==========================
// BUBBLE RENDERER
// ==========================
window.TGRenderer = (function(){
  const container = document.getElementById("tg-comments-container");

  function appendMessage(persona,text,opts={}){
    if(!container) return null;

    const bubble = document.createElement("div");
    bubble.className = `tg-bubble ${opts.type==='outgoing'?'outgoing':'incoming'}`;
    const messageId = opts.id || 'msg_'+Date.now()+'_'+Math.floor(Math.random()*9999);
    bubble.dataset.id = messageId;

    // avatar
    const avatar = document.createElement("img");
    avatar.className="tg-bubble-avatar";
    avatar.src = persona.avatar || "assets/default-avatar.jpg";
    avatar.alt = persona.name || "User";
    bubble.appendChild(avatar);

    // content
    const content = document.createElement("div");
    content.className="tg-bubble-content";

    if(opts.image){
      const img = document.createElement("img");
      img.className="tg-bubble-image";
      img.src=opts.image;
      img.style.maxWidth="100%";
      img.style.borderRadius="14px";
      content.appendChild(img);
    }

    if(opts.caption){
      const cap = document.createElement("div");
      cap.className="tg-bubble-caption";
      cap.textContent=opts.caption;
      cap.style.marginTop="4px";
      content.appendChild(cap);
    }

    const sender = document.createElement("div");
    sender.className="tg-bubble-sender";
    sender.dataset.color=persona.color||1;
    sender.textContent=persona.name||"User";
    content.appendChild(sender);

    const msg = document.createElement("div");
    msg.className="tg-bubble-text";
    msg.textContent=text;
    content.appendChild(msg);

    const meta = document.createElement("div");
    meta.className="tg-bubble-meta";
    meta.textContent=(opts.timestamp||new Date()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    content.appendChild(meta);

    if(opts.reactions){
      const pill = document.createElement("div");
      pill.className="tg-reaction-pill";
      opts.reactions.forEach(r=>{
        const rEl=document.createElement("span");
        rEl.className="tg-reaction-item";
        rEl.textContent=r;
        pill.appendChild(rEl);
      });
      content.appendChild(pill);
    }

    if(opts.reply){
      const reply = document.createElement("div");
      reply.className="tg-reply-preview";
      reply.textContent=opts.reply;
      reply.onclick=()=>{
        const target = container.querySelector(`[data-id="${opts.replyToId}"]`);
        if(target) target.scrollIntoView({behavior:"smooth", block:"center"});
      };
      content.appendChild(reply);
    }

    bubble.appendChild(content);
    container.appendChild(bubble);

    if(opts.scroll!==false){
      requestAnimationFrame(()=>{ container.scrollTop=container.scrollHeight; });
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

  return { appendMessage, calculateTypingDuration, jumpToMessage, clearAll };
})();

// ==========================
// REALISM ENGINE
// ==========================
window.realism = (function(){
  let started=false;

  const typingQueue = [];

  async function queuedTyping(persona,message){
    return new Promise(res=>{
      typingQueue.push({persona,message,res});
      if(typingQueue.length===1) processQueue();
    });
  }

  async function processQueue(){
    if(typingQueue.length===0) return;
    const {persona,message,res}=typingQueue[0];
    document.dispatchEvent(new CustomEvent("headerTyping",{detail:{name:persona.name}}));
    const duration=window.TGRenderer.calculateTypingDuration(message);
    await new Promise(r=>setTimeout(r,duration));
    window.TGRenderer.appendMessage(persona,message);
    typingQueue.shift();
    res();
    if(typingQueue.length>0) processQueue();
  }

  function simulate(){
    if(started) return;
    started=true;
    const interval = () => {
      const persona=window.identity.getRandomPersona();
      const texts=["🚀 To the moon!","💎 HODL tight!","Profit is coming…","Check this chart 📈","🔥 Major trend spike!"];
      const text=texts[Math.floor(Math.random()*texts.length)];
      queuedTyping(persona,text);
      setTimeout(interval,window.REALISM_CONFIG?.MIN_INTERVAL_MS + Math.random()*(window.REALISM_CONFIG?.MAX_INTERVAL_MS-window.REALISM_CONFIG?.MIN_INTERVAL_MS));
    };
    interval();
  }

  async function postAdminBroadcast(){
    const admin = window.identity.Admin;
    const caption=`📌 Group Rules

1️⃣ New members are read-only until verified.
2️⃣ Admins do NOT DM directly.
3️⃣ 🚫 No screenshots in chat.
4️⃣ ⚠️ Ignore unsolicited messages.

✅ To verify or contact admin, use the Contact Admin button below.`;
    const image="assets/broadcast.jpg";
    const timestamp=new Date();
    const id = window.TGRenderer.appendMessage(admin,"",{timestamp,type:"incoming",image,caption});
    return {id,image};
  }

  function postPinNotice(){
    window.TGRenderer.appendMessage({name:"System",avatar:"assets/admin.jpg"},"Admin pinned a message",{timestamp:new Date(),type:"incoming"});
  }

  function showPinBanner(image,pinnedMessageId){
    const pinBanner=document.getElementById("tg-pin-banner");
    if(!pinBanner) return;
    pinBanner.innerHTML="";
    const img=document.createElement("img");
    img.src=image;
    img.onerror=()=>img.src="assets/admin.jpg";
    const text=document.createElement("div");
    text.className="tg-pin-text";
    text.textContent="📌 Group Rules";
    const blueBtn=document.createElement("button");
    blueBtn.className="pin-btn";
    blueBtn.textContent="View Pinned";
    blueBtn.onclick=()=>pinnedMessageId && window.TGRenderer.jumpToMessage(pinnedMessageId);
    const adminBtn=document.createElement("a");
    adminBtn.className="glass-btn";
    adminBtn.href=window.CONTACT_ADMIN_LINK || "https://t.me/";
    adminBtn.target="_blank";
    adminBtn.rel="noopener";
    adminBtn.textContent="Contact Admin";
    const btnContainer=document.createElement("div");
    btnContainer.className="pin-btn-container";
    btnContainer.appendChild(blueBtn);
    btnContainer.appendChild(adminBtn);
    pinBanner.appendChild(img);
    pinBanner.appendChild(text);
    pinBanner.appendChild(btnContainer);
    pinBanner.classList.remove("hidden");
    requestAnimationFrame(()=>pinBanner.classList.add("show"));
  }

  return { simulate, queuedTyping, postAdminBroadcast, postPinNotice, showPinBanner, started };
})();

// ==========================
// JOINER SIMULATOR
// ==========================
window.joiner = (function(){
  async function simulateJoins(count){
    for(let i=0;i<count;i++){
      const persona=window.identity.getRandomPersona();
      const welcome=window.JOINER_CONFIG?.welcomeMessage || "Welcome!";
      await window.realism.queuedTyping(persona,welcome);
    }
  }
  return { simulateJoins };
})();

// ==========================
// HISTORY LOADER
// ==========================
window.historyLoader = (function(){
  async function loadHistory(){
    const container=document.getElementById("tg-comments-container");
    const num=5;
    for(let i=0;i<num;i++){
      const persona=window.identity.getRandomPersona();
      const texts=["Initial chat message","Discussion on trend","Someone said HODL","Check this chart","Random tip"];
      const text=texts[Math.floor(Math.random()*texts.length)];
      window.TGRenderer.appendMessage(persona,text,{scroll:false});
    }
    container.scrollTop=container.scrollHeight;
  }
  return { loadHistory };
})();

// ==========================
// INTERACTIONS
// ==========================
window.interactions = { ready:false };

// ==========================
// INITIAL CHAT SEED
// ==========================
(async function initChatSeed(){
  const broadcast=await window.realism.postAdminBroadcast();
  window.realism.showPinBanner?.(broadcast.image,broadcast.id);
  window.realism.postPinNotice?.();
  if(window.JOINER_CONFIG?.initialJoins && !window.joinerDone){
    await window.joiner.simulateJoins(window.JOINER_CONFIG.initialJoins);
    window.joinerDone=true;
  }
  // seed random messages
  const seedCount=5;
  for(let i=0;i<seedCount;i++){
    const persona=window.identity.getRandomPersona();
    const texts=["🚀 To the moon!","💎 HODL tight!","Profit is coming…","Check this chart 📈","🔥 Major trend spike!"];
    const text=texts[Math.floor(Math.random()*texts.length)];
    await window.realism.queuedTyping(persona,text);
  }
  window.realism.simulate();
  window.interactions.ready=true;
})();
