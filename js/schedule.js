/* =========================================================================
 * SIRIUS – program / "hvem spiller live når"
 * Data ligger lokalt (localStorage) i denne startversjonen. DJ-er som er
 * logget inn kan legge inn egne sendinger. Tider uten oppsatt DJ vises som
 * "AI Auto-DJ" (den 24/7-roterende strømmen).
 * ========================================================================= */
window.Schedule = (function () {
  const KEY = 'sirius_schedule';
  const DAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || seed(); }
    catch (_) { return seed(); }
  }
  function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }

  function seed() {
    const s = [];
    save(s);
    return s;
  }

  function add(slot) {
    const list = load();
    list.push(slot);
    list.sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.time.localeCompare(b.time));
    save(list);
    render();
  }

  function render() {
    const el = document.getElementById('schedule');
    if (!el) return;
    const list = load();
    el.innerHTML = '';

    // Vis en "AI 24/7"-rad først
    el.appendChild(row({ day: 'Man–Fre', time: '24/7', name: 'Sirius Auto-DJ', genre: 'AI-rotasjon', ai: true }));

    list.forEach(s => el.appendChild(row(s)));
  }

  function row(s) {
    const div = document.createElement('div');
    div.className = 'slot';
    const initials = (s.name || '?').slice(0, 1).toUpperCase();
    const avatar = s.avatar
      ? `<img src="${s.avatar}" alt="">`
      : `<span class="who-init" style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--panel-2);font-weight:700">${initials}</span>`;
    const nameHtml = s.ai ? esc(s.name)
      : `<a class="dj-link" href="#/dj/${encodeURIComponent(s.name)}">${esc(s.name)}</a>`;
    div.innerHTML = `
      <div class="when">${s.day}<small>${s.time}</small></div>
      <div class="who">${avatar}<div><div class="name">${nameHtml}</div><div class="genre">${esc(s.genre || '')}</div></div></div>
      <span class="badge ${s.ai ? 'ai' : 'live'}">${s.ai ? '✦ AI' : 'Live DJ'}</span>`;
    return div;
  }

  function esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function init() { render(); }
  return { init, add, render, all: load, DAYS };
})();
