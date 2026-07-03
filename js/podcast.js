/* =========================================================================
 * SIRIUS – Podcast/opptak
 * Episoder lagres lokalt (localStorage). Innloggede DJ-er kan legge til
 * episoder (tittel, beskrivelse, lyd-URL). Alle kan lytte.
 * ========================================================================= */
window.Podcast = (function () {
  const KEY = 'sirius_podcasts';

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || seed(); } catch (_) { return seed(); } }
  function save(l) { localStorage.setItem(KEY, JSON.stringify(l)); }
  function seed() {
    const s = [];
    save(s); return s;
  }
  function id() { return Math.random().toString(36).slice(2, 9); }

  function add(ep) {
    const l = load();
    l.unshift({ id: id(), ts: Date.now(), ...ep });
    save(l); render();
  }
  function byDJ(name) { return load().filter(e => (e.dj || '').toLowerCase() === (name || '').toLowerCase()); }
  function esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function card(ep) {
    const div = document.createElement('div');
    div.className = 'card pod-card';
    const player = ep.audioUrl
      ? `<audio controls preload="none" src="${esc(ep.audioUrl)}"></audio>`
      : `<div class="pod-noaudio">🎙️ Lyd ikke lastet opp ennå</div>`;
    div.innerHTML = `
      <div class="pod-top">
        <div class="pod-cover">🎙️</div>
        <div>
          <h3>${esc(ep.title)}</h3>
          <div class="pod-by">av <a class="dj-link" href="#/dj/${encodeURIComponent(ep.dj || '')}">${esc(ep.dj || 'Sirius')}</a></div>
        </div>
      </div>
      <p class="pod-desc">${esc(ep.desc || '')}</p>
      ${player}`;
    return div;
  }

  function render() {
    const el = document.getElementById('podcast-list');
    if (!el) return;
    el.innerHTML = '';
    load().forEach(ep => el.appendChild(card(ep)));
    // Skjema kun for DJ-er
    const form = document.getElementById('pod-add');
    if (form) form.style.display = (window.Auth && Auth.isDJ()) ? 'block' : 'none';
  }

  function init() {
    render();
    const btn = document.getElementById('pod-add-btn');
    if (btn) btn.addEventListener('click', () => {
      const user = Auth.current(); if (!user) return;
      const title = document.getElementById('pod-title').value.trim();
      if (!title) { window.UI && UI.toast('Gi episoden en tittel.'); return; }
      add({
        title,
        dj: document.getElementById('pod-dj').value.trim() || user.name,
        desc: document.getElementById('pod-desc').value.trim(),
        audioUrl: document.getElementById('pod-url').value.trim(),
      });
      document.getElementById('pod-title').value = '';
      document.getElementById('pod-desc').value = '';
      document.getElementById('pod-url').value = '';
      window.UI && UI.toast('Episode lagt til ✦');
    });
    if (window.Auth) Auth.subscribe(() => render());
  }

  return { init, add, byDJ, render };
})();
