/* =========================================================================
 * SIRIUS – flerspråk (i18n)
 * Bytter UI-tekst mellom norsk (standard), engelsk, spansk og tysk. Elementer
 * merkes med data-i18n (tekst), data-i18n-html (tillater HTML) eller
 * data-i18n-ph (placeholder). Valget huskes i localStorage.
 * ========================================================================= */
window.I18n = (function () {
  const KEY = 'sirius_lang';
  const cbs = [];

  const dict = {
    no: {
      'nav.live': 'Radio',
      'nav.authbtn': 'Logg inn',
      'hero.title': 'Kosmisk radio,<br><span class="glow">døgnet rundt.</span>',
      'hero.lead': 'Gratis internettradio – psychill, progressive, EDM og psytrance, døgnet rundt. Du trenger ikke konto for å lytte.',
      'hero.play': 'Hør Sirius live',
      'live.h': 'Live nå', 'live.hint': 'Spiller døgnet rundt',
      'stations.head': 'Velg stasjon <span>· bytt sjanger når som helst</span>',
      'ai.fab': '✦ Spør Sirius', 'ai.title': '✦ Sirius-assistent', 'ai.ph': 'Spør om alt på siden…', 'ai.send': 'Send',
      'chat.fab': '💬 Chat', 'chat.title': '💬 Sirius-chat', 'chat.hint': 'dra for å flytte', 'chat.ph': 'Skriv en melding…', 'chat.send': 'Send', 'chat.you': 'Du:', 'chat.name': 'Ditt navn', 'chat.empty': 'Ingen meldinger ennå – si hei! ✦',
      'modal.title': 'Bli med på Sirius', 'modal.sub': 'Du trenger ikke konto for å lytte – opprett en for å bli med i fellesskapet.',
      'modal.register': 'Registrer', 'modal.login': 'Logg inn',
      'modal.name': 'Navn', 'modal.email': 'E-post', 'modal.pass': 'Passord',
      'modal.submit': 'Opprett konto', 'modal.resend': '✉ Send aktiverings-e-post på nytt', 'modal.forgot': 'Glemt passord?',
      'search.ph': 'Søk etter sjanger, stasjon…',
      'footer': '✦ SIRIUS — gratis internettradio · psychill · progressive · EDM · psytrance',
    },
    en: {
      'nav.live': 'Radio',
      'nav.authbtn': 'Log in',
      'hero.title': 'Cosmic radio,<br><span class="glow">around the clock.</span>',
      'hero.lead': "Free internet radio – psychill, progressive, EDM and psytrance, around the clock. You don't need an account to listen.",
      'hero.play': 'Listen to Sirius live',
      'live.h': 'Live now', 'live.hint': 'Playing around the clock',
      'stations.head': 'Choose station <span>· switch genre anytime</span>',
      'ai.fab': '✦ Ask Sirius', 'ai.title': '✦ Sirius assistant', 'ai.ph': 'Ask anything about the site…', 'ai.send': 'Send',
      'chat.fab': '💬 Chat', 'chat.title': '💬 Sirius chat', 'chat.hint': 'drag to move', 'chat.ph': 'Write a message…', 'chat.send': 'Send', 'chat.you': 'You:', 'chat.name': 'Your name', 'chat.empty': 'No messages yet — say hi! ✦',
      'modal.title': 'Join Sirius', 'modal.sub': "You don't need an account to listen — create one to join the community.",
      'modal.register': 'Sign up', 'modal.login': 'Log in',
      'modal.name': 'Name', 'modal.email': 'Email', 'modal.pass': 'Password',
      'modal.submit': 'Create account', 'modal.resend': '✉ Resend activation email', 'modal.forgot': 'Forgot password?',
      'search.ph': 'Search for genre, station…',
      'footer': '✦ SIRIUS — free internet radio · psychill · progressive · EDM · psytrance',
    },
    es: {
      'nav.live': 'Radio',
      'nav.authbtn': 'Entrar',
      'hero.title': 'Radio cósmica,<br><span class="glow">las 24 horas.</span>',
      'hero.lead': 'Radio por internet gratis – psychill, progressive, EDM y psytrance, las 24 horas. No necesitas cuenta para escuchar.',
      'hero.play': 'Escucha Sirius en vivo',
      'live.h': 'En directo', 'live.hint': 'Sonando las 24 horas',
      'stations.head': 'Elige emisora <span>· cambia de género cuando quieras</span>',
      'ai.fab': '✦ Pregunta a Sirius', 'ai.title': '✦ Asistente Sirius', 'ai.ph': 'Pregunta lo que sea sobre el sitio…', 'ai.send': 'Enviar',
      'chat.fab': '💬 Chat', 'chat.title': '💬 Chat de Sirius', 'chat.hint': 'arrastra para mover', 'chat.ph': 'Escribe un mensaje…', 'chat.send': 'Enviar', 'chat.you': 'Tú:', 'chat.name': 'Tu nombre', 'chat.empty': 'Aún no hay mensajes: ¡saluda! ✦',
      'modal.title': 'Únete a Sirius', 'modal.sub': 'No necesitas cuenta para escuchar; crea una para unirte a la comunidad.',
      'modal.register': 'Registrarse', 'modal.login': 'Entrar',
      'modal.name': 'Nombre', 'modal.email': 'Correo', 'modal.pass': 'Contraseña',
      'modal.submit': 'Crear cuenta', 'modal.resend': '✉ Reenviar correo de activación', 'modal.forgot': '¿Olvidaste tu contraseña?',
      'search.ph': 'Busca género, emisora…',
      'footer': '✦ SIRIUS — radio por internet gratis · psychill · progressive · EDM · psytrance',
    },
    de: {
      'nav.live': 'Radio',
      'nav.authbtn': 'Anmelden',
      'hero.title': 'Kosmisches Radio,<br><span class="glow">rund um die Uhr.</span>',
      'hero.lead': 'Kostenloses Internetradio – psychill, progressive, EDM und psytrance, rund um die Uhr. Zum Hören brauchst du kein Konto.',
      'hero.play': 'Sirius live hören',
      'live.h': 'Jetzt live', 'live.hint': 'Läuft rund um die Uhr',
      'stations.head': 'Sender wählen <span>· Genre jederzeit wechseln</span>',
      'ai.fab': '✦ Frag Sirius', 'ai.title': '✦ Sirius-Assistent', 'ai.ph': 'Frag alles über die Seite…', 'ai.send': 'Senden',
      'chat.fab': '💬 Chat', 'chat.title': '💬 Sirius-Chat', 'chat.hint': 'zum Verschieben ziehen', 'chat.ph': 'Nachricht schreiben…', 'chat.send': 'Senden', 'chat.you': 'Du:', 'chat.name': 'Dein Name', 'chat.empty': 'Noch keine Nachrichten – sag Hallo! ✦',
      'modal.title': 'Mach mit bei Sirius', 'modal.sub': 'Zum Hören brauchst du kein Konto – erstelle eins, um der Community beizutreten.',
      'modal.register': 'Registrieren', 'modal.login': 'Anmelden',
      'modal.name': 'Name', 'modal.email': 'E-Mail', 'modal.pass': 'Passwort',
      'modal.submit': 'Konto erstellen', 'modal.resend': '✉ Aktivierungs-E-Mail erneut senden', 'modal.forgot': 'Passwort vergessen?',
      'search.ph': 'Suche nach Genre, Sender…',
      'footer': '✦ SIRIUS — kostenloses Internetradio · psychill · progressive · EDM · psytrance',
    },
  };

  let lang = localStorage.getItem(KEY) || 'no';
  if (!dict[lang]) lang = 'no';

  function t(k) { return (dict[lang] && dict[lang][k] != null) ? dict[lang][k] : (dict.no[k] != null ? dict.no[k] : k); }

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); if (dict.no[k] != null) el.textContent = t(k); });
    document.querySelectorAll('[data-i18n-html]').forEach(el => { const k = el.getAttribute('data-i18n-html'); if (dict.no[k] != null) el.innerHTML = t(k); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { const k = el.getAttribute('data-i18n-ph'); if (dict.no[k] != null) el.setAttribute('placeholder', t(k)); });
    cbs.forEach(cb => { try { cb(lang); } catch (_) {} });
  }

  function setLang(l) { if (!dict[l]) return; lang = l; localStorage.setItem(KEY, l); apply(); }
  function onChange(cb) { cbs.push(cb); }

  function init() {
    const sel = document.getElementById('lang-select');
    if (sel) { sel.value = lang; sel.addEventListener('change', () => setLang(sel.value)); }
    apply();
  }

  return { t, apply, setLang, onChange, init, get lang() { return lang; } };
})();
window.t = function (k) { return window.I18n.t(k); };
