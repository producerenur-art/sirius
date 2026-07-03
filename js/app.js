/* =========================================================================
 * SIRIUS – app-glue: UI, meny, modal, DJ «gå live»-panel, oppstart
 * ========================================================================= */
window.UI = (function () {
  let toastEl, toastTimer;
  function toast(msg, ms) {
    if (!toastEl) { toastEl = document.getElementById('toast'); }
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms || 4000);
  }
  return { toast };
})();

document.addEventListener('DOMContentLoaded', () => {
  const cfg = window.SIRIUS_CONFIG;

  /* ---- Språk (i18n) ---- */
  if (window.I18n) I18n.init();

  /* ---- Modulene ---- */
  Player.init();
  AI.init();
  Schedule.init();
  Favorites.init();
  Podcast.init();
  DJProfile.init();
  Stations.init();
  Search.init();

  /* ---- Auth-knapp i topbar ---- */
  const authBtn = document.getElementById('auth-btn');
  Auth.subscribe(user => {
    const isDJ = user && user.role === 'dj';
    if (user) { authBtn.removeAttribute('data-i18n'); authBtn.textContent = `${user.name} ▾`; }
    else { authBtn.setAttribute('data-i18n', 'nav.authbtn'); authBtn.textContent = window.t ? t('nav.authbtn') : 'Bli DJ / logg inn'; }
    document.getElementById('dj-locked').style.display = isDJ ? 'none' : 'block';
    document.getElementById('dj-panel').style.display = isDJ ? 'grid' : 'none';
    const djLive = document.getElementById('dj-live');
    if (djLive) djLive.style.display = isDJ ? 'block' : 'none';
  });
  authBtn.addEventListener('click', () => {
    if (Auth.current()) {
      if (confirm('Logg ut?')) Auth.logout();
    } else openModal();
  });

  /* ---- Modal (logg inn / registrer, lytter vs DJ) ---- */
  const overlay = document.getElementById('modal-overlay');
  const form = document.getElementById('auth-form');
  let mode = 'register', role = 'listener';

  function openModal() { overlay.classList.add('open'); }
  function closeModal() { overlay.classList.remove('open'); }
  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  // Fanevalg: rolle (lytter/DJ) og modus (registrer/logg inn)
  document.querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => {
    role = b.dataset.role;
    document.querySelectorAll('[data-role]').forEach(x => x.classList.toggle('active', x === b));
  }));
  function updateSubmitLabel() {
    const el = document.getElementById('auth-submit');
    if (el) el.textContent = mode === 'register' ? t('modal.submit') : t('modal.login');
  }
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.mode;
    document.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('active', x === b));
    document.getElementById('field-name').style.display = mode === 'register' ? 'block' : 'none';
    updateSubmitLabel();
  }));
  updateSubmitLabel();
  window.I18n && I18n.onChange(updateSubmitLabel);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('f-name').value;
    const email = document.getElementById('f-email').value;
    const password = document.getElementById('f-pass').value;
    try {
      if (mode === 'register') {
        Auth.register({ name, email, password, role });
        UI.toast('Konto opprettet! Bekreft via aktiverings-e-posten for å logge inn.', 6000);
      } else {
        Auth.login({ email, password });
        UI.toast('Velkommen tilbake ✦');
        closeModal();
      }
    } catch (err) { UI.toast(err.message); }
  });

  // Send aktiverings-e-post på nytt (bruker e-posten i skjemaet)
  const resendBtn = document.getElementById('resend-activation');
  if (resendBtn) resendBtn.addEventListener('click', () =>
    Auth.resendActivation(document.getElementById('f-email').value));

  /* ---- Hash-rute for aktivering: #/aktiver/:email/:token ---- */
  function handleHash() {
    const m = location.hash.match(/^#\/aktiver\/([^/]+)\/([^/]+)/);
    if (m) {
      try {
        Auth.activate(decodeURIComponent(m[1]), m[2]);
        UI.toast('E-posten er bekreftet! Du kan nå logge inn. ✦', 6000);
      } catch (err) { UI.toast(err.message, 6000); }
      history.replaceState(null, '', location.pathname);
    }
  }
  addEventListener('hashchange', handleHash);
  handleHash();

  /* ---- DJ «Gå live»-panel: bilde/kamera + sending + program ---- */
  initDJPanel();

  /* ---- Mobilmeny (hamburger) ---- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  if (navToggle) navToggle.addEventListener('click', () => nav.classList.toggle('open'));

  /* ---- Myk scrolling for nav-lenker (og lukk mobilmeny) ---- */
  document.querySelectorAll('.nav a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    nav && nav.classList.remove('open');
    const href = a.getAttribute('href');
    if (href.indexOf('#/') === 0) return; // rute-lenke, ikke seksjon
    const t = document.querySelector(href);
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }));
});

/* ---- PWA: registrer service worker (installerbar) ---- */
if ('serviceWorker' in navigator) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => { /* stille */ });
  });
}

/* ========================================================================= */
function initDJPanel() {
  const drop = document.getElementById('dj-photo');
  const fileInput = document.getElementById('dj-file');
  let stream = null, photoData = null;

  document.getElementById('dj-upload').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { photoData = rd.result; drop.innerHTML = `<img src="${photoData}" alt="DJ-bilde">`; };
    rd.readAsDataURL(f);
  });

  document.getElementById('dj-camera').addEventListener('click', async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      drop.innerHTML = '';
      const v = document.createElement('video'); v.autoplay = true; v.playsInline = true; v.srcObject = stream;
      drop.appendChild(v);
      document.getElementById('dj-snap').style.display = 'inline-flex';
    } catch (_) { UI.toast('Fikk ikke tilgang til kamera.'); }
  });

  document.getElementById('dj-snap').addEventListener('click', () => {
    const v = drop.querySelector('video');
    if (!v) return;
    const c = document.createElement('canvas');
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext('2d').drawImage(v, 0, 0);
    photoData = c.toDataURL('image/jpeg', 0.85);
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    drop.innerHTML = `<img src="${photoData}" alt="DJ-bilde">`;
    document.getElementById('dj-snap').style.display = 'none';
  });

  // Legg til i programmet (hvem spiller live når)
  const daySel = document.getElementById('dj-day');
  Schedule.DAYS.forEach(d => { const o = document.createElement('option'); o.value = d; o.textContent = d; daySel.appendChild(o); });

  document.getElementById('dj-add').addEventListener('click', () => {
    const user = Auth.current();
    if (!user) return;
    const slot = {
      day: daySel.value,
      time: document.getElementById('dj-time').value || '20:00',
      name: document.getElementById('dj-name').value || user.name,
      genre: 'Live set',
      avatar: photoData || '',
    };
    Schedule.add(slot);
    UI.toast(`Sending lagt til: ${slot.name} – ${slot.day} ${slot.time} ✦`);
  });

  document.getElementById('dj-golive').addEventListener('click', () => {
    UI.toast('For å gå live: koble Traktor til Icecast-serveren (Preferences → Broadcasting). Se README → «Live fra Traktor».', 7000);
  });

  // Min live-sending: sett/avslutt DJ-ens egen Traktor-strøm
  const djGo = document.getElementById('dj-live-go');
  if (djGo) djGo.addEventListener('click', () => {
    const user = Auth.current(); if (!user) return;
    const url = document.getElementById('dj-live-url').value.trim();
    if (!url) { UI.toast('Lim inn din stream-URL først.'); return; }
    Player.setLocalLive({
      url,
      name: document.getElementById('dj-name').value.trim() || user.name,
      genre: 'Live fra Traktor',
    });
    window.Stations && Stations.render();
    UI.toast('Du er LIVE ✦ Sirius spiller nå din Traktor-sending.', 6000);
    const live = document.getElementById('live'); if (live) live.scrollIntoView({ behavior: 'smooth' });
  });
  const djStop = document.getElementById('dj-live-stop');
  if (djStop) djStop.addEventListener('click', () => {
    Player.setLocalLive(null);
    window.Stations && Stations.render();
    UI.toast('Live avsluttet – tilbake til stasjon / AI-rotasjon.');
  });
}
