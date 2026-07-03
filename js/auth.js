/* =========================================================================
 * SIRIUS – innlogging (lyttere + DJ-er) med aktiverings-e-post
 * -------------------------------------------------------------------------
 * MERK: Dette er startversjonen som lagrer LOKALT (localStorage) og
 * *simulerer* aktiverings-e-post, slik at hele flyten kan testes uten server.
 * For ekte kontoer + ekte e-post kobles dette mot en backend (Supabase/
 * serverless + en mailer som Resend). Se README.md → «Kontoer & e-post».
 *
 * Roller: 'listener' (lytter) og 'dj'. DJ-rollen låser opp «Gå live»-fanen.
 * Man trenger IKKE konto for å lytte eller bruke AI-assistenten.
 * ========================================================================= */
window.Auth = (function () {
  const UKEY = 'sirius_users';
  const SKEY = 'sirius_session';

  function users() { try { return JSON.parse(localStorage.getItem(UKEY)) || {}; } catch (_) { return {}; } }
  function saveUsers(u) { localStorage.setItem(UKEY, JSON.stringify(u)); }
  function current() { try { return JSON.parse(localStorage.getItem(SKEY)); } catch (_) { return null; } }
  function setSession(u) { u ? localStorage.setItem(SKEY, JSON.stringify(u)) : localStorage.removeItem(SKEY); onChange(); }

  const listeners = [];
  function onChange() { listeners.forEach(fn => fn(current())); }
  function subscribe(fn) { listeners.push(fn); fn(current()); }

  function token() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

  function register({ name, email, password, role }) {
    email = (email || '').trim().toLowerCase();
    if (!email || !password || !name) throw new Error('Fyll ut navn, e-post og passord.');
    const all = users();
    if (all[email]) throw new Error('Denne e-posten er allerede registrert.');
    const user = { name, email, password, role: role || 'listener', activated: false, activationToken: token(), createdAt: Date.now() };
    all[email] = user;
    saveUsers(all);
    sendActivationEmail(user);
    return user;
  }

  async function sendActivationEmail(user) {
    const link = `${location.origin}${location.pathname}#/aktiver/${encodeURIComponent(user.email)}/${user.activationToken}`;
    // Prøv ekte e-post via serverless (Resend). Faller tilbake til demo-modus.
    try {
      const r = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'activation', to: user.email, name: user.name, link }),
      });
      if (r.ok) {
        window.UI && UI.toast(`Aktiverings-e-post sendt til ${user.email} ✦ Sjekk innboksen (og spam).`, 7000);
        return { sent: true, link };
      }
    } catch (_) { /* nettverksfeil → demo-modus */ }
    // E-post ikke satt opp (mangler RESEND_API_KEY) → demo: vis lenken i konsollen
    console.log('[Sirius] Aktiveringslenke (demo – ekte e-post ikke satt opp):', link);
    window.UI && UI.toast('E-post ikke satt opp ennå – aktiveringslenken ligger i konsollen (demo-modus).', 7000);
    return { sent: false, link };
  }

  async function resendActivation(email) {
    email = (email || '').trim().toLowerCase();
    if (!email) { window.UI && UI.toast('Skriv inn e-posten din først.'); return; }
    const all = users();
    const u = all[email];
    if (!u) { window.UI && UI.toast('Fant ingen konto for denne e-posten – registrer deg først.'); return; }
    if (u.activated) { window.UI && UI.toast('Kontoen er allerede aktivert – du kan logge inn.'); return; }
    u.activationToken = token(); saveUsers(all);   // frisk token for sikkerhets skyld
    await sendActivationEmail(u);
  }

  function activate(email, tok) {
    email = (email || '').toLowerCase();
    const all = users();
    const u = all[email];
    if (!u) throw new Error('Fant ingen konto for denne e-posten.');
    if (u.activated) return u;
    if (u.activationToken !== tok) throw new Error('Ugyldig aktiveringslenke.');
    u.activated = true;
    saveUsers(all);
    return u;
  }

  function login({ email, password }) {
    email = (email || '').trim().toLowerCase();
    const u = users()[email];
    if (!u || u.password !== password) throw new Error('Feil e-post eller passord.');
    if (!u.activated) throw new Error('Kontoen er ikke aktivert ennå – sjekk aktiverings-e-posten din.');
    const safe = { name: u.name, email: u.email, role: u.role };
    setSession(safe);
    return safe;
  }

  function logout() { setSession(null); }
  function isDJ() { const c = current(); return c && c.role === 'dj'; }

  return { register, login, logout, activate, current, subscribe, isDJ, sendActivationEmail, resendActivation };
})();
