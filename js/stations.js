/* =========================================================================
 * SIRIUS – stasjonsvelger
 * Lar lytteren bytte mellom stasjonene i config.stations (hentet fra
 * SoundCore-radioen). Bytter strøm live uten å stoppe avspillingen.
 * ========================================================================= */
window.Stations = (function () {
  const cfg = window.SIRIUS_CONFIG;

  function esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function activeUrl() {
    // Live DJ overstyrer; ellers valgt stasjon; ellers default
    try {
      const live = JSON.parse(localStorage.getItem('sirius_live_stream') || 'null');
      if (live && live.url) return live.url;
      const st = JSON.parse(localStorage.getItem('sirius_station') || 'null');
      if (st && st.url) return st.url;
    } catch (_) {}
    return cfg.streamUrl;
  }

  function render() {
    const el = document.getElementById('stations');
    if (!el) return;
    const list = cfg.stations || [];
    const active = activeUrl();
    el.innerHTML = '';
    list.forEach(s => {
      const b = document.createElement('button');
      b.className = 'station' + (s.url === active ? ' on' : '');
      b.innerHTML = `<span class="st-name">${esc(s.name)}</span><span class="st-genre">${esc(s.genre)}</span>`;
      b.addEventListener('click', () => {
        window.Player && Player.selectStation(s);
        render();
        window.UI && UI.toast('Bytter til ' + s.name + ' ✦');
      });
      el.appendChild(b);
    });
  }

  function init() { render(); }
  return { init, render };
})();
