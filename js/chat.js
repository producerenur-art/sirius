/* =========================================================================
 * SIRIUS – Fellesskaps-chat
 * Åpen for ALLE på siden – med eller uten konto. Er du innlogget brukes
 * navnet ditt; ellers får du et redigerbart gjestenavn. Boksen kan flyttes
 * fritt i alle retninger (dra i toppen) og kan åpnes/lukkes.
 *
 * Meldinger lagres lokalt (localStorage) og synces live mellom faner i samme
 * nettleser via 'storage'-hendelsen. For chat på tvers av ulike besøkende
 * trengs en backend (WebSocket/database) – se README.
 * ========================================================================= */
window.Chat = (function () {
  const MKEY = 'sirius_chat';        // meldinger
  const NKEY = 'sirius_chat_name';   // gjestenavn
  const MAX = 200;                   // behold siste N meldinger
  let els = {}, myName = '';

  function load() { try { return JSON.parse(localStorage.getItem(MKEY)) || []; } catch (_) { return []; } }
  function save(list) { localStorage.setItem(MKEY, JSON.stringify(list.slice(-MAX))); }

  function guestName() {
    let n = localStorage.getItem(NKEY);
    if (!n) { n = 'Gjest-' + Math.random().toString(36).slice(2, 6); localStorage.setItem(NKEY, n); }
    return n;
  }

  // Innlogget navn hvis man har konto, ellers (lagret) gjestenavn
  function resolveName() {
    const u = window.Auth && Auth.current();
    return u && u.name ? u.name : guestName();
  }

  function fmtTime(ts) {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch (_) { return ''; }
  }

  function render() {
    const list = load();
    els.log.innerHTML = '';
    if (!list.length) {
      const e = document.createElement('div');
      e.className = 'chat-empty';
      e.textContent = window.t ? t('chat.empty') : 'Ingen meldinger ennå – si hei! ✦';
      els.log.appendChild(e);
      return;
    }
    list.forEach(m => {
      const wrap = document.createElement('div');
      wrap.className = 'chat-msg' + (m.name === myName ? ' me' : '');
      const who = document.createElement('div'); who.className = 'who'; who.textContent = m.name;
      const body = document.createElement('div'); body.className = 'body'; body.textContent = m.text;
      const time = document.createElement('div'); time.className = 'time'; time.textContent = fmtTime(m.ts);
      wrap.appendChild(who); wrap.appendChild(body); wrap.appendChild(time);
      els.log.appendChild(wrap);
    });
    els.log.scrollTop = els.log.scrollHeight;
  }

  function send() {
    const text = els.text.value.trim();
    if (!text) return;
    myName = els.name.value.trim() || resolveName();
    localStorage.setItem(NKEY, myName);
    const list = load();
    list.push({ id: Date.now() + '-' + Math.random().toString(36).slice(2, 6), name: myName, text, ts: Date.now() });
    save(list);
    els.text.value = '';
    render();
  }

  // ---- Åpne / lukke ----
  function open() { els.panel.classList.add('open'); els.fab.style.display = 'none'; render(); els.text.focus(); }
  function close() { els.panel.classList.remove('open'); els.fab.style.display = 'flex'; }

  // ---- Flyttbar: dra i toppen (peker = mus + touch) ----
  function initDrag() {
    let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;

    els.head.addEventListener('pointerdown', e => {
      if (e.target.closest('.x')) return;         // ikke start drag på lukk-knappen
      dragging = true;
      const r = els.panel.getBoundingClientRect();
      // Bytt fra bottom/right til left/top slik at panelet kan flyttes fritt
      els.panel.style.left = r.left + 'px';
      els.panel.style.top = r.top + 'px';
      els.panel.style.right = 'auto';
      els.panel.style.bottom = 'auto';
      sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top;
      els.panel.classList.add('dragging');
      els.head.setPointerCapture(e.pointerId);
    });

    els.head.addEventListener('pointermove', e => {
      if (!dragging) return;
      const w = els.panel.offsetWidth, h = els.panel.offsetHeight;
      let nx = ox + (e.clientX - sx);
      let ny = oy + (e.clientY - sy);
      // Hold panelet innenfor skjermen
      nx = Math.max(0, Math.min(nx, window.innerWidth - w));
      ny = Math.max(0, Math.min(ny, window.innerHeight - h));
      els.panel.style.left = nx + 'px';
      els.panel.style.top = ny + 'px';
    });

    function end(e) {
      if (!dragging) return;
      dragging = false;
      els.panel.classList.remove('dragging');
      try { els.head.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    els.head.addEventListener('pointerup', end);
    els.head.addEventListener('pointercancel', end);
  }

  function init() {
    els.fab = document.getElementById('chat-fab');
    els.panel = document.getElementById('chat-panel');
    els.head = document.getElementById('chat-head');
    els.log = document.getElementById('chat-log');
    els.text = document.getElementById('chat-text');
    els.name = document.getElementById('chat-name');
    if (!els.fab || !els.panel) return;

    myName = resolveName();
    els.name.value = myName;

    els.fab.addEventListener('click', open);
    document.getElementById('chat-close').addEventListener('click', close);
    document.getElementById('chat-send').addEventListener('click', send);
    els.text.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
    els.name.addEventListener('change', () => {
      const v = els.name.value.trim();
      if (v) { myName = v; localStorage.setItem(NKEY, v); render(); }
    });

    // Bruk kontonavnet automatisk når man logger inn (og ved oppstart hvis innlogget)
    window.Auth && Auth.subscribe(user => {
      if (user && user.name) { myName = user.name; els.name.value = user.name; render(); }
    });

    // Live-sync mellom faner i samme nettleser
    window.addEventListener('storage', e => { if (e.key === MKEY) render(); });

    initDrag();
    render();
  }

  return { init, open, close };
})();
