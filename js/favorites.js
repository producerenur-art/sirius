/* =========================================================================
 * SIRIUS – favoritter for lyttere
 * Lagres lokalt (localStorage) per bruker (eller «anon» uten konto). Man kan
 * favorittmerke låten som spilles nå (hjerte i spilleren) og DJ-er.
 * ========================================================================= */
window.Favorites = (function () {
  const KEY = 'sirius_favorites';
  let current = null; // siste now-playing state

  function uid() { const c = window.Auth && Auth.current(); return c ? c.email : 'anon'; }
  function all() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) { return {}; } }
  function save(o) { localStorage.setItem(KEY, JSON.stringify(o)); }
  function list() { return all()[uid()] || []; }
  function setList(arr) { const o = all(); o[uid()] = arr; save(o); }
  function has(id) { return list().some(x => x.id === id); }

  function toggle(item) {
    let arr = list();
    if (has(item.id)) arr = arr.filter(x => x.id !== item.id);
    else arr = [{ ...item, ts: Date.now() }, ...arr];
    setList(arr);
    render(); updateHeart();
  }
  function remove(id) { setList(list().filter(x => x.id !== id)); render(); updateHeart(); }

  function trackId(s) { return 'track:' + (s.title || '') + '|' + (s.by || ''); }

  function onNowPlaying(state) { current = state; updateHeart(); }

  function updateHeart() {
    const btn = document.getElementById('pb-fav');
    if (!btn || !current) return;
    const on = has(trackId(current));
    btn.textContent = on ? '♥' : '♡';
    btn.classList.toggle('on', on);
    btn.title = on ? 'Fjern fra favoritter' : 'Legg i favoritter';
  }

  function esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function render() {
    const el = document.getElementById('favorites-list');
    if (!el) return;
    const arr = list();
    if (!arr.length) {
      el.innerHTML = '<div class="empty">Ingen favoritter ennå. Trykk ♡ i spilleren for å lagre en låt, eller ♡ på en DJ.</div>';
      return;
    }
    el.innerHTML = '';
    arr.forEach(it => {
      const div = document.createElement('div');
      div.className = 'fav-row';
      const icon = it.type === 'dj' ? '🎧' : '♪';
      const main = it.type === 'dj'
        ? `<a class="dj-link" href="#/dj/${encodeURIComponent(it.title)}">${esc(it.title)}</a><span class="sub">${esc(it.genre || 'DJ')}</span>`
        : `<span class="ttl">${esc(it.title)}</span><span class="sub">${esc(it.by || '')}</span>`;
      div.innerHTML = `<span class="fav-ic">${icon}</span><div class="fav-meta">${main}</div><button class="fav-x" title="Fjern">×</button>`;
      div.querySelector('.fav-x').addEventListener('click', () => remove(it.id));
      el.appendChild(div);
    });
  }

  function init() {
    const btn = document.getElementById('pb-fav');
    if (btn) btn.addEventListener('click', () => {
      if (!current) return;
      toggle({ type: 'track', id: trackId(current), title: current.title, by: current.by });
    });
    // Oppdater når man logger inn/ut (annen bruker → andre favoritter)
    if (window.Auth) Auth.subscribe(() => { render(); updateHeart(); });
    render();
  }

  return { init, toggle, has, list, onNowPlaying };
})();
