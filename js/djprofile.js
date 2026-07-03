/* =========================================================================
 * SIRIUS – DJ-profilsider
 * Hash-rute #/dj/:navn viser en profil: bilde, sjanger og kommende sendinger
 * (fra programmet).
 * ========================================================================= */
window.DJProfile = (function () {
  let overlay;

  function esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'dj-profile-overlay';
    overlay.innerHTML = `<div class="card dj-profile" id="dj-profile-card"></div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    document.body.appendChild(overlay);
  }

  function close() {
    overlay.classList.remove('open');
    if (location.hash.indexOf('#/dj/') === 0) history.replaceState(null, '', location.pathname);
  }

  function render(name) {
    const slots = (window.Schedule ? Schedule.all() : []).filter(s => (s.name || '').toLowerCase() === name.toLowerCase());
    const avatar = (slots.find(s => s.avatar) || {}).avatar || '';
    const genre = (slots[0] || {}).genre || '';
    const initials = name.slice(0, 1).toUpperCase();

    const shows = slots.length
      ? slots.map(s => `<li><b>${esc(s.day)}</b> ${esc(s.time)} — ${esc(s.genre || 'Live set')}</li>`).join('')
      : '<li class="empty">Ingen oppsatte sendinger ennå.</li>';

    document.getElementById('dj-profile-card').innerHTML = `
      <button class="x" id="dj-profile-close">×</button>
      <div class="dj-hero">
        <div class="dj-avatar">${avatar ? `<img src="${esc(avatar)}" alt="">` : initials}</div>
        <div>
          <div class="kicker">DJ / ARTIST</div>
          <h2>${esc(name)}</h2>
          <div class="dj-genre">${esc(genre || 'Sirius-resident')}</div>
        </div>
      </div>
      <div class="dj-cols">
        <div><h4>Kommende sendinger</h4><ul class="dj-list">${shows}</ul></div>
      </div>`;

    document.getElementById('dj-profile-close').addEventListener('click', close);
    overlay.classList.add('open');
  }

  function handleHash() {
    const m = location.hash.match(/^#\/dj\/(.+)$/);
    if (m) render(decodeURIComponent(m[1]));
    else if (overlay) overlay.classList.remove('open');
  }

  function init() {
    build();
    addEventListener('hashchange', handleHash);
    handleHash();
  }

  return { init };
})();
