/* =========================================================================
 * SIRIUS – radiospiller
 * Kobler <audio> mot Icecast/AzuraCast-strømmen fra config. Henter "now
 * playing" (låt / live DJ / lyttertall) om det er satt opp. Faller pent
 * tilbake til en "offline / demo"-tilstand hvis serveren ikke er oppe ennå.
 * ========================================================================= */
window.Player = (function () {
  const cfg = window.SIRIUS_CONFIG;
  const audio = new Audio();
  audio.preload = 'none';
  // NB: ikke sett crossOrigin – da krever nettleseren CORS-headere fra
  // strøm-serveren, og offentlige radiostrømmer (SomaFM m.fl.) blokkeres.

  let playing = false;
  let wantPlaying = false;      // brukeren VIL lytte → hold sendingen i gang
  let reconnectTimer = null;
  let backoff = 1000;          // økende venting mellom gjenkoblingsforsøk
  let connecting = false;      // forsøker å koble til akkurat nå
  let failCount = 0;           // mislykkede forsøk på rad
  let notifiedFail = false;    // har vi allerede varslet om at strømmen svikter
  let state = { live: false, title: 'Sirius Radio', by: 'Rotasjon', listeners: 0, cover: '✦' };

  const els = {};
  function bind() {
    els.play = document.getElementById('pb-play');
    els.now = document.getElementById('pb-now');
    els.by = document.getElementById('pb-by');
    els.vol = document.getElementById('pb-vol');
    els.heroPlay = document.getElementById('hero-play');
    // Live nå-boksen i innholdet
    els.liveKicker = document.getElementById('live-kicker');
    els.liveTitle = document.getElementById('live-title');
    els.liveSub = document.getElementById('live-sub');
    els.liveListeners = document.getElementById('live-listeners');
    els.liveCover = document.getElementById('live-cover');

    els.play && els.play.addEventListener('click', toggle);
    els.heroPlay && els.heroPlay.addEventListener('click', toggle);
    if (els.vol) {
      audio.volume = 0.85;
      els.vol.value = 85;
      els.vol.addEventListener('input', () => { audio.volume = els.vol.value / 100; });
    }
    audio.addEventListener('playing', () => { playing = true; connecting = false; failCount = 0; notifiedFail = false; backoff = 1000; clearTimeout(reconnectTimer); render(); });
    audio.addEventListener('pause', () => { playing = false; render(); if (wantPlaying) scheduleReconnect(); });
    audio.addEventListener('error', () => { playing = false; render(); scheduleReconnect(); });
    audio.addEventListener('ended', () => scheduleReconnect());
  }

  // Aktiv strøm: 1) live DJ-overstyring, 2) valgt stasjon, 3) standard fra config
  function readLS(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (_) { return null; } }
  function currentStreamUrl() {
    const live = readLS('sirius_live_stream'); if (live && live.url) return live.url;
    const st = readLS('sirius_station'); if (st && st.url) return st.url;
    return cfg.streamUrl;
  }

  // SomaFM-strømmene har en åpen "now playing"-API vi kan hente ekte låt fra.
  // f.eks. https://ice2.somafm.com/suburbsofgoa-128-mp3 → kanal "suburbsofgoa"
  function somaFmChannel(url) {
    try {
      const u = new URL(url);
      if (!/(^|\.)somafm\.com$/i.test(u.hostname)) return null;
      const m = u.pathname.match(/\/([a-z0-9]+)-/i);
      return m ? m[1] : null;
    } catch (_) { return null; }
  }

  function toggle() {
    if (!currentStreamUrl()) {
      window.UI && UI.toast('Streamen er ikke koblet opp ennå – sett streamUrl i js/config.js (se README).');
      return;
    }
    if (wantPlaying) { wantPlaying = false; clearTimeout(reconnectTimer); audio.pause(); }
    else { wantPlaying = true; connect(); }
    render();
  }

  // Koble til (eller på nytt) den aktive strømmen
  function connect() {
    clearTimeout(reconnectTimer);
    const url = currentStreamUrl();
    if (audio.src !== url) audio.src = url;
    connecting = true; render();
    audio.play().catch(() => scheduleReconnect());
  }

  // Bytt strøm live (stasjon / DJ-sending) uten å stoppe musikken
  function retune() { backoff = 1000; if (wantPlaying) connect(); render(); poll(); }

  // Velg en radiostasjon (fra config.stations)
  function selectStation(station) {
    if (station && station.url) {
      localStorage.setItem('sirius_station', JSON.stringify(station));
      state = { live: false, title: station.name || 'Sirius', by: station.genre || 'Rotasjon', listeners: state.listeners || 0, cover: '✦' };
    }
    retune();
  }

  // Sett/avslutt en live DJ-sending (Traktor-strøm) lokalt
  function setLocalLive(info) {
    if (info && info.url) {
      localStorage.setItem('sirius_live_stream', JSON.stringify(info));
      state = { live: true, title: info.name || 'Live DJ', by: info.genre || 'Live fra Traktor', listeners: state.listeners || 0, cover: '🎧' };
      wantPlaying = true;
    } else {
      localStorage.removeItem('sirius_live_stream');
      const st = readLS('sirius_station');
      state = { live: false, title: (st && st.name) || 'Sirius Radio', by: (st && st.genre) || 'Rotasjon', listeners: state.listeners || 0, cover: '✦' };
    }
    retune();
  }

  // Hold sendingen i gang «hele tiden»: faller strømmen og brukeren fortsatt
  // vil lytte, koble til på nytt med økende venting (maks 15 s).
  function scheduleReconnect() {
    if (!wantPlaying) return;
    connecting = true;
    failCount++;
    // Etter noen mislykkede forsøk: si fra én gang at strømmen ikke svarer,
    // så en ny bruker ikke sitter foran «pause»-ikon og stillhet uten beskjed.
    if (failCount >= 3 && !notifiedFail) {
      notifiedFail = true;
      window.UI && UI.toast('Får ikke kontakt med radiostrømmen – prøver igjen automatisk.', 6000);
    }
    render();
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      if (!wantPlaying) return;
      try { audio.load(); } catch (_) {}
      audio.src = currentStreamUrl();
      audio.play().catch(() => scheduleReconnect());
    }, backoff);
    backoff = Math.min(backoff * 2, 15000);
  }

  async function poll() {
    // Egen live DJ-sending (Traktor): ikke overskriv navnet med låt-metadata
    if (readLS('sirius_live_stream')) { render(); return; }

    // 1) AzuraCast "now playing" (om satt opp i config) – gir låt/DJ/lyttertall
    if (cfg.nowPlayingUrl) {
      try {
        const r = await fetch(cfg.nowPlayingUrl, { cache: 'no-store' });
        const d = await r.json();
        const np = d.now_playing || {};
        const live = d.live && d.live.is_live;
        state = {
          live: !!live,
          title: (np.song && (np.song.title || np.song.text)) || 'Sirius Radio',
          by: live ? (d.live.streamer_name || 'Live DJ') : ((np.song && np.song.artist) || 'Rotasjon'),
          listeners: (d.listeners && d.listeners.current) || 0,
          cover: '✦',
        };
      } catch (_) { /* behold forrige tilstand */ }
      render();
      return;
    }

    // 2) SomaFM: hent ekte "now playing" for standard-/SomaFM-stasjonene
    const ch = somaFmChannel(currentStreamUrl());
    if (ch) {
      try {
        const r = await fetch(`https://somafm.com/songs/${ch}.json`, { cache: 'no-store' });
        const d = await r.json();
        const song = (d.songs && d.songs[0]) || {};
        if (song.title) {
          state = {
            live: false,
            title: song.title,
            by: song.artist || 'Rotasjon',
            listeners: state.listeners || 0,
            cover: '✦',
          };
        }
      } catch (_) { /* behold forrige tilstand */ }
    }
    render();
  }

  function render() {
    // Vil lytte, men lyden er ikke i gang → vis tydelig status i stedet for
    // «pause»-ikon og stillhet uten forklaring.
    const trying = wantPlaying && !playing;
    const statusMsg = trying
      ? (failCount >= 3 ? 'Får ikke kontakt – prøver igjen…' : 'Kobler til…')
      : null;
    // Player-bar
    if (els.play) els.play.textContent = wantPlaying ? '⏸' : '▶';
    if (els.now) els.now.textContent = state.title;
    if (els.by) {
      if (statusMsg) {
        els.by.innerHTML = `<span class="pb-ai">✦</span> ${escapeHtml(statusMsg)}`;
      } else {
        els.by.innerHTML = state.live
          ? `<span class="pb-live"><span class="dot"></span>LIVE</span> ${escapeHtml(state.by)}`
          : `<span class="pb-ai">✦</span> ${escapeHtml(state.by)}`;
      }
    }
    // Live nå-boks
    const hasSong = !state.live && state.title && state.title !== 'Sirius Radio';
    if (els.liveKicker) els.liveKicker.textContent = state.live ? 'LIVE NÅ' : 'SPILLER NÅ';
    if (els.liveTitle) els.liveTitle.textContent = state.live ? state.by : 'Sirius Radio';
    if (els.liveSub) els.liveSub.textContent = statusMsg
      ? statusMsg
      : (state.live
        ? state.title
        : (hasSong
            ? (state.by && state.by !== 'Rotasjon' ? `${state.by} – ${state.title}` : state.title)
            : 'Roterer musikk døgnet rundt'));
    if (els.liveListeners) els.liveListeners.textContent = state.listeners;
    if (els.liveCover) els.liveCover.textContent = state.live ? '🎧' : '✦';
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function init() {
    bind();
    render();
    poll();
    setInterval(poll, cfg.nowPlayingInterval || 15000);
    // Vaktbikkje: skal vi spille, men strømmen har stoppet → koble til igjen
    setInterval(() => { if (wantPlaying && audio.paused) scheduleReconnect(); }, 20000);
  }
  return { init, retune, selectStation, setLocalLive, currentStreamUrl };
})();
