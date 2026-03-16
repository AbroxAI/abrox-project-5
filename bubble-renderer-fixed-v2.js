// bubble-renderer-fixed-v2.js — FINAL CLEAN + JOIN STICKERS + REACTION PILLS + AUTO SCROLL + MERGED JOINERS
(function () {
'use strict';

function init() {

  const container = document.getElementById('tg-comments-container');
  const jumpIndicator = document.getElementById('tg-jump-indicator');
  const jumpText = document.getElementById('tg-jump-text');

  if (!container) {
    console.error('bubble-renderer: container missing');
    return;
  }

  let unseenCount = 0;
  let lastDateKey = null;
  const MESSAGE_MAP = new Map();
  let PINNED_MESSAGE_ID = null;

  // Track join stickers in progress to merge names
  let pendingJoiners = [];

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
  const personaColors = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15"];

  function getPersonaColor(name) {
    if (!name) return "1";
    if (!personaColorMap.has(name)) {
      const assigned = personaColors[personaColorMap.size % personaColors.length];
      personaColorMap.set(name, assigned);
    }
    return personaColorMap.get(name);
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
    avatar.src = persona?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(persona?.name || 'U')}`;
    avatar.onerror = () => avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(persona?.name || 'U')}`;

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
      replyPreview.textContent = replyToText
        ? (replyToText.length > 120 ? replyToText.slice(0,117)+'...' : replyToText)
        : 'Reply';
      replyPreview.addEventListener('click', () => {
        if (!replyToId) return;
        const target = MESSAGE_MAP.get(replyToId);
        if (!target) return;
        target.el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.el.classList.add('tg-highlight');
        setTimeout(() => target.el.classList.remove('tg-highlight'), 2600);
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

    // Text / caption
    const finalText = caption || text;
    if (finalText) {
      const textEl = document.createElement('div');
      textEl.className = 'tg-bubble-text';
      textEl.style.whiteSpace = 'pre-line';
      textEl.textContent = finalText;
      content.appendChild(textEl);
      if (caption) PINNED_MESSAGE_ID = id;
    }

    // Reactions (FIXED — attached to wrapper so it floats outside bubble)
    if (reactions.length) {
      const pill = document.createElement('div');
      pill.className = 'tg-bubble-reactions';
      reactions.forEach(r => {
        const span = document.createElement('span');
        span.className = 'reaction';
        span.textContent = `${r.emoji} ${r.count}`;
        pill.appendChild(span);
      });
      wrapper.appendChild(pill);
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

    // Timestamp
    const meta = document.createElement('div');
    meta.className = 'tg-bubble-meta';
    meta.textContent = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    content.appendChild(meta);

    if (type === 'incoming') {
      wrapper.appendChild(avatar);
      wrapper.appendChild(content);
    } else {
      wrapper.style.flexDirection = 'row-reverse';
      wrapper.appendChild(avatar);
      wrapper.appendChild(content);
    }

    MESSAGE_MAP.set(id, { el: wrapper, text: finalText, persona, timestamp });
    return { el: wrapper, id };
  }

  /* =====================================================
     JOIN STICKER (MERGED NAMES ONLY)
  ===================================================== */
  function appendJoinSticker(names) {
    if (!names || !names.length) return;

    pendingJoiners.push(...names);

    const lastSticker = container.querySelector('.tg-join-sticker:last-of-type');
    if (lastSticker) lastSticker.remove();

    const wrapper = document.createElement('div');
    wrapper.className = 'tg-join-sticker';

    const textEl = document.createElement('div');
    textEl.className = 'tg-join-text';
    textEl.textContent = pendingJoiners.length > 3
      ? `${pendingJoiners.slice(0,3).join(', ')} & ${pendingJoiners.length-3} others joined the chat`
      : `${pendingJoiners.join(', ')} joined the chat`;

    wrapper.appendChild(textEl);
    container.appendChild(wrapper);

    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 80;
    if (atBottom) container.scrollTop = container.scrollHeight;

    pendingJoiners = [];
  }

  /* =====================================================
     APPEND MESSAGE
  ===================================================== */
  function appendMessage(persona, text, opts = {}) {
    const result = createBubble(persona, text, opts);
    container.appendChild(result.el);

    const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 80;
    if (atBottom) container.scrollTop = container.scrollHeight;
    else { unseenCount++; updateJump(); showJump(); }

    return result.id;
  }

  /* =====================================================
     JUMP INDICATOR
  ===================================================== */
  function updateJump() {
    if (!jumpText) return;
    jumpText.textContent = unseenCount > 1 ? `New messages · ${unseenCount}` : 'New messages';
  }
  function showJump() { jumpIndicator?.classList.remove('hidden'); }
  function hideJump() { unseenCount = 0; updateJump(); jumpIndicator?.classList.add('hidden'); }

  jumpIndicator?.addEventListener('click', () => { container.scrollTop = container.scrollHeight; hideJump(); });
  container.addEventListener('scroll', () => {
    const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distance < 80) hideJump();
  });

  /* =====================================================
     TYPING DURATION
  ===================================================== */
  function calculateTypingDuration(message) {
    if (!message) return 1200;
    let duration = message.length * 45 + Math.random() * 800;
    return Math.min(Math.max(duration, 1000), 6000);
  }

  /* =====================================================
     PUBLIC API
  ===================================================== */
  window.TGRenderer = {
    appendMessage,
    appendJoinSticker,
    getPinnedMessageId: () => PINNED_MESSAGE_ID,
    calculateTypingDuration
  };

  console.log('✅ bubble-renderer FINAL V2 — JOIN STICKERS + REACTIONS + MERGE FIX integrated.');
}

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();

})();
