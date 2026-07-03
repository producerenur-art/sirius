/* =========================================================================
 * SIRIUS – site-wide søk
 * 🔍-knapp i toppen åpner et søkefelt. Søker i sider/seksjoner, stasjoner,
 * sjangre og DJ-er. Aksent-uavhengig. Klikk = naviger.
 * ========================================================================= */
window.Search = (function () {
  const cfg = window.SIRIUS_CONFIG;
  let overlay, input, results;

  function norm(s) { return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function scrollTo(sel) { close(); const el = document.querySelector(sel); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  function sources() {
    const items = [];
    [['Live', 'live nå now playing', '#live'],
     ['Program', 'schedule hvem spiller når who plays', '#program'],
     ['Bli DJ', 'dj live traktor broadcast gå live', '#dj'],
    ].forEach(([label, kw, sel]) => items.push({ group: 'Sider', label, kw, act: () => scrollTo(sel) }));

    (cfg.stations || []).forEach(s => items.push({
      group: 'Stasjoner', label: s.name, kw: s.genre,
      act: () => { window.Player && Player.selectStation(s); window.Stations && Stations.render(); scrollTo('#live'); },
    }));

    try {
      const seen = {};
      (window.Schedule ? Schedule.all() : []).forEach(sl => {
        const key = (sl.name || '').toLowerCase();
        if (sl.name && !seen[key]) { seen[key] = 1; items.push({ group: 'DJ-er', label: sl.name, kw: sl.genre || 'dj', act: () => { location.hash = '#/dj/' + encodeURIComponent(sl.name); close(); } }); }
      });
    } catch (_) {}

    return items;
  }

  function renderResults(q) {
    const nq = norm(q).trim();
    const all = sources();
    const hits = !nq ? all : all.filter(it => norm(it.label + ' ' + (it.kw || '')).includes(nq));
    results.innerHTML = '';
    if (!hits.length) { results.innerHTML = '<div class="sr-empty">Ingen treff.</div>'; return; }
    const groups = {};
    hits.forEach(h => { (groups[h.group] = groups[h.group] || []).push(h); });
    Object.keys(groups).forEach(g => {
      const gd = document.createElement('div'); gd.className = 'sr-group';
      gd.innerHTML = `<div class="sr-gh">${esc(g)}</div>`;
      groups[g].slice(0, 8).forEach(h => {
        const b = document.createElement('button'); b.className = 'sr-item';
        b.innerHTML = `<span>${esc(h.label)}</span><span class="sr-kw">${esc(h.kw || '')}</span>`;
        b.addEventListener('click', h.act);
        gd.appendChild(b);
      });
      results.appendChild(gd);
    });
  }

  function open() { overlay.classList.add('open'); input.value = ''; renderResults(''); setTimeout(() => input.focus(), 30); }
  function close() { overlay.classList.remove('open'); }

  function build() {
    overlay = document.createElement('div');
    overlay.className = 'modal-overlay search-overlay';
    overlay.id = 'search-overlay';
    overlay.innerHTML = `<div class="search-panel">
      <input class="input search-input" id="search-input" type="search" data-i18n-ph="search.ph" placeholder="Søk etter DJ, sjanger, stasjon, episode…" autocomplete="off">
      <div class="search-results" id="search-results"></div>
    </div>`;
    document.body.appendChild(overlay);
    input = overlay.querySelector('#search-input');
    results = overlay.querySelector('#search-results');
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    input.addEventListener('input', () => renderResults(input.value));
    input.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Enter') { const first = results.querySelector('.sr-item'); if (first) first.click(); }
    });
    window.I18n && I18n.apply();
  }

  function init() {
    build();
    const btn = document.getElementById('search-btn');
    if (btn) btn.addEventListener('click', open);
    addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  return { init, open };
})();
