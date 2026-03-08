// bubble-renderer-fixed.js — FINAL FIXED + REACTIONS + JOIN STICKER + INPUT LOCK + NEW MESSAGE PILL + AUTO-SCROLL
(function () {
'use strict';

function init() {

  const container = document.getElementById('tg-comments-container');
  const jumpIndicator = document.getElementById('tg-jump-indicator');
  const jumpText = document.getElementById('tg-jump-text');
  const inputBar =
    document.getElementById('tg-input-bar') ||
    document.querySelector('.tg-input-bar');

  if (!container) {
    console.error('bubble-renderer: container missing');
    return;
  }

  let unseenCount = 0;
  let lastDateKey = null;
  const MESSAGE_MAP = new Map();
  let PINNED_MESSAGE_ID = null;
  let INITIAL_LOAD = true;

  /* =====================================================
     DATE STICKERS
  ===================================================== */
  function formatDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  function insertDateSticker(date) {
    const key = formatDateKey(date);
    if (key === lastDateKey) return;
    lastDateKey = key;

    const sticker = document.createElement('div');
    sticker.className = 'tg-date-sticker';
    sticker.textContent = new Date(date).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    container.appendChild(sticker);
  }

  /* =====================================================
     PERSONA COLORS
  ===================================================== */
  const personaColorMap = new Map();
  const personaColors = Array.from({length:15}, (_,i) => (i+1).toString());

  function getPersonaColor(name) {
    if (!name) return "1";
    if (!personaColorMap.has(name)) {
      const assigned = personaColors[personaColorMap.size % personaColors.length];
      personaColorMap.set(name, assigned);
    }
    return personaColorMap.get(name);
  }

  /* =====================================================
     REACTION PILL
  ===================================================== */
  function createReactionPill(reactions = []) {
    if (!reactions.length) return null;

    const pill = document.createElement('div');
    pill.className = 'tg-reaction-pill';

    reactions.forEach(r => {
      const item = document.createElement('div');
      item.className = 'tg-reaction-item';
      item.textContent = `${r.emoji} ${r.count}`;
      pill.appendChild(item);
    });

    return pill;
  }

  /* =====================================================
     CREATE BUBBLE
  ===================================================== */
  function createBubble(persona, text, opts = {}) {

    const id = opts.id || ('m_' + Date.now() + '_' + Math.floor(Math.random() * 9999));
    const type = opts.type === 'outgoing' ? 'outgoing' : 'incoming';
    const timestamp = opts.timestamp || new Date();
    const replyToId = opts.replyToId || null;
    const replyToText = opts.replyToText || null;
    const image = opts.image || null;
    const caption = opts.caption || null;
    const reactions = opts.reactions || [];

    insertDateSticker(timestamp);

    const wrapper = document.createElement('div');
    wrapper.className = `tg-bubble ${type}`;
    wrapper.dataset.id = id;
    wrapper.dataset.persona = persona?.name || 'User';

    const avatar = document.createElement('img');
    avatar.className = 'tg-bubble-avatar';
    avatar.alt = persona?.name || 'User';
    avatar.src = persona?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(persona?.name||'U')}`;
    avatar.onerror = () => avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(persona?.name||'U')}`;

    const content = document.createElement('div');
    content.className = 'tg-bubble-content';

    // Sender
    const sender = document.createElement('div');
    sender.className = 'tg-bubble-sender';
    sender.textContent = persona?.name || 'User';
    sender.dataset.color = getPersonaColor(persona?.name || 'User');
    content.appendChild(sender);

    // Reply preview
    if (replyToText || replyToId) {
      const replyPreview = document.createElement('div');
      replyPreview.className = 'tg-reply-preview';
      replyPreview.textContent = replyToText ? (replyToText.length>120? replyToText.slice(0,117)+'...':replyToText) : 'Reply';
      replyPreview.addEventListener('click', () => {
        if (!replyToId) return;
        const target = MESSAGE_MAP.get(replyToId);
        if (!target) return;
        target.el.scrollIntoView({behavior:'smooth', block:'center'});
        target.el.classList.add('tg-highlight');
        setTimeout(()=>target.el.classList.remove('tg-highlight'), 2600);
      });
      content.appendChild(replyPreview);
    }

    // Image
    if (image) {
      const img = document.createElement('img');
      img.className = 'tg-bubble-image';
      img.src = image;
      img.style.width = '100%';
      img.style.borderRadius = '12px';
      img.onerror = () => img.remove();
      content.appendChild(img);
    }

    // Text
    const finalText = caption || text;
    if (finalText) {
      const textEl = document.createElement('div');
      textEl.className = 'tg-bubble-text';
      textEl.style.whiteSpace = 'pre-line';
      textEl.textContent = finalText;
      content.appendChild(textEl);
      if (caption) PINNED_MESSAGE_ID = id;
    }

    // Admin button
    if (persona?.isAdmin) {
      const adminBtn = document.createElement('a');
      adminBtn.className = 'glass-btn';
      adminBtn.href = window.CONTACT_ADMIN_LINK || 'https://t.me/';
      adminBtn.target = '_blank';
      adminBtn.textContent = 'Contact Admin';
      adminBtn.style.marginTop = '8px';
      content.appendChild(adminBtn);
    }

    // Time
    const meta = document.createElement('div');
    meta.className = 'tg-bubble-meta';
    meta.textContent = new Date(timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    content.appendChild(meta);

    // Assemble bubble
    if (type==='incoming') {
      wrapper.appendChild(avatar);
      wrapper.appendChild(content);
    } else {
      wrapper.style.flexDirection = 'row-reverse';
      wrapper.appendChild(avatar);
      wrapper.appendChild(content);
    }

    // Reactions
    const reactionPill = createReactionPill(reactions);
    if (reactionPill) wrapper.appendChild(reactionPill);

    MESSAGE_MAP.set(id,{el:wrapper,text:finalText,persona,timestamp});
    return {el:wrapper,id};
  }

  /* =====================================================
     JOIN STICKER
  ===================================================== */
  function appendJoinSticker(newMembers = []) {
    if (!newMembers.length) return;
    let text = '';
    if (newMembers.length===1) text = `${newMembers[0].name} joined the group`;
    else if (newMembers.length===2) text = `${newMembers[0].name} and ${newMembers[1].name} joined the group`;
    else {
      const extra = newMembers.length - 2;
      text = `${newMembers[0].name}, ${newMembers[1].name} and ${extra} others joined the group`;
    }

    const sticker = document.createElement('div');
    sticker.className = 'tg-join-float';
    sticker.textContent = text;

    const messages = Array.from(container.children).filter(el=>el.classList.contains('tg-bubble')||el.classList.contains('tg-date-sticker'));
    const randomIndex = messages.length ? Math.floor(Math.random()*messages.length) : container.children.length;
    container.insertBefore(sticker,messages[randomIndex] || null);

    sticker.style.marginLeft = Math.random()*60 + 'px';
    setTimeout(()=>sticker.classList.add('show'),50);
    setTimeout(()=>sticker.remove(),3000);
  }

  /* =====================================================
     INPUT LOCK CONTROL
  ===================================================== */
  function lockInput() { INPUT_LOCKED = true; if(inputBar) inputBar.classList.add('locked'); }
  function unlockInput() { INPUT_LOCKED = false; if(inputBar) inputBar.classList.remove('locked'); }

  /* =====================================================
     APPEND MESSAGE + AUTO-SCROLL
  ===================================================== */
  function appendMessage(persona,text,opts={}) {
    const result = createBubble(persona,text,opts);
    container.appendChild(result.el);

    // Scroll behavior
    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 80;
    if (INITIAL_LOAD || atBottom) {
      container.scrollTop = container.scrollHeight;
    } else {
      unseenCount++;
      updateJump();
      showJump();
    }

    return result.id;
  }

  /* =====================================================
     NEW MESSAGE PILL
  ===================================================== */
  function updateJump() {
    if (!jumpText) return;
    jumpText.textContent = unseenCount>1 ? `New messages · ${unseenCount}` : 'New messages';
  }
  function showJump(){ jumpIndicator?.classList.remove('hidden'); }
  function hideJump(){ unseenCount=0; updateJump(); jumpIndicator?.classList.add('hidden'); }

  jumpIndicator?.addEventListener('click',()=>{
    container.scrollTop = container.scrollHeight;
    hideJump();
  });

  container.addEventListener('scroll',()=>{
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    if(distance < 80) hideJump();
  });

  /* =====================================================
     PUBLIC API
  ===================================================== */
  window.TGRenderer = { appendMessage, appendJoinSticker, lockInput, unlockInput, getPinnedMessageId:()=>PINNED_MESSAGE_ID };

  console.log('✅ bubble-renderer FIXED: reactions + join sticker + input lock + auto-scroll');

  INITIAL_LOAD = false; // mark initial load done
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();

})();
