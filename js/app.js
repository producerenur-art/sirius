/* =========================================================================
 * SIRIUS – app-glue: UI, meny, modal, oppstart
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
  Stations.init();
  Search.init();
  Chat.init();

  /* ---- Auth-knapp i topbar ---- */
  const authBtn = document.getElementById('auth-btn');
  Auth.subscribe(user => {
    if (user) { authBtn.removeAttribute('data-i18n'); authBtn.textContent = `${user.name} ▾`; }
    else { authBtn.setAttribute('data-i18n', 'nav.authbtn'); authBtn.textContent = window.t ? t('nav.authbtn') : 'Logg inn'; }
  });
  authBtn.addEventListener('click', () => {
    if (Auth.current()) {
      if (confirm('Logg ut?')) Auth.logout();
    } else openModal();
  });

  /* ---- Modal (logg inn / registrer, lytter vs DJ) ---- */
  const overlay = document.getElementById('modal-overlay');
  const form = document.getElementById('auth-form');
  let mode = 'register';

  function openModal() { overlay.classList.add('open'); }
  function closeModal() { overlay.classList.remove('open'); }
  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  // Modus: registrer / logg inn
  function updateSubmitLabel() {
    const el = document.getElementById('auth-submit');
    if (el) el.textContent = mode === 'register' ? t('modal.submit') : t('modal.login');
  }
  document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
    mode = b.dataset.mode;
    document.querySelectorAll('[data-mode]').forEach(x => x.classList.toggle('active', x === b));
    document.getElementById('field-name').style.display = mode === 'register' ? 'block' : 'none';
    // «Glemt passord?» gir bare mening når man logger inn
    const forgot = document.getElementById('forgot-pass');
    if (forgot) forgot.style.display = mode === 'login' ? 'block' : 'none';
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
        Auth.register({ name, email, password });
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

  // Glemt passord → send nullstillingslenke til e-posten i skjemaet
  const forgotBtn = document.getElementById('forgot-pass');
  if (forgotBtn) forgotBtn.addEventListener('click', () =>
    Auth.requestPasswordReset(document.getElementById('f-email').value));

  /* ---- Hash-ruter: aktivering + nullstilling av passord ---- */
  function handleHash() {
    const a = location.hash.match(/^#\/aktiver\/([^/]+)\/([^/]+)/);
    if (a) {
      try {
        Auth.activate(decodeURIComponent(a[1]), a[2]);
        UI.toast('E-posten er bekreftet! Du kan nå logge inn. ✦', 6000);
      } catch (err) { UI.toast(err.message, 6000); }
      history.replaceState(null, '', location.pathname);
      return;
    }
    const r = location.hash.match(/^#\/nullstill\/([^/]+)\/([^/]+)/);
    if (r) {
      const email = decodeURIComponent(r[1]);
      const pass = prompt(`Sett nytt passord for ${email}:`);
      history.replaceState(null, '', location.pathname);
      if (pass == null) return;   // brukeren avbrøt
      try {
        Auth.resetPassword(email, r[2], pass);
        UI.toast('Passordet er oppdatert! Du kan nå logge inn. ✦', 6000);
        openModal();
        document.querySelector('[data-mode="login"]').click();
        document.getElementById('f-email').value = email;
      } catch (err) { UI.toast(err.message, 6000); }
    }
  }
  addEventListener('hashchange', handleHash);
  handleHash();

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

