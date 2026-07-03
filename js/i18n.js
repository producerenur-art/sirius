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
      'nav.live': 'Live', 'nav.program': 'Program', 'nav.dj': 'Bli DJ',
      'nav.authbtn': 'Bli DJ / logg inn',
      'hero.title': 'Kosmisk radio,<br><span class="glow">døgnet rundt.</span>',
      'hero.lead': 'Er du lytter, trenger du ikke lage en konto. Er du DJ, ta kontakt med oss på producerenur@gmail.com for live stream på Sirius Radio.',
      'hero.play': 'Hør Sirius live',
      'live.h': 'Live nå', 'live.hint': 'Koblet mot Traktor-strømmen',
      'stations.head': 'Velg stasjon <span>· bytt sjanger når som helst</span>',
      'program.h': 'Program', 'program.hint': 'Hvem spiller live når',
      'dj.h': 'Bli DJ – spill live fra Traktor', 'dj.hint': 'Stream · live sett',
      'ai.fab': '✦ Spør Sirius', 'ai.title': '✦ Sirius-assistent', 'ai.ph': 'Spør om alt på siden…', 'ai.send': 'Send',
      'modal.title': 'Bli med på Sirius', 'modal.sub': 'Du trenger ikke konto for å lytte – bare for å spille som DJ.',
      'modal.listener': '🎧 Lytter', 'modal.dj': '🎛 DJ', 'modal.register': 'Registrer', 'modal.login': 'Logg inn',
      'modal.name': 'Navn / DJ-navn', 'modal.email': 'E-post', 'modal.pass': 'Passord',
      'modal.submit': 'Opprett konto', 'modal.resend': '✉ Send aktiverings-e-post på nytt', 'modal.forgot': 'Glemt passord?',
      'search.ph': 'Søk etter DJ, sjanger, stasjon…',
      'footer': '✦ SIRIUS — gratis internettradio · psychill · progressive · EDM · psytrance',
    },
    en: {
      'nav.live': 'Live', 'nav.program': 'Schedule', 'nav.dj': 'Become a DJ',
      'nav.authbtn': 'Become a DJ / log in',
      'hero.title': 'Cosmic radio,<br><span class="glow">around the clock.</span>',
      'hero.lead': "Are you a listener? You don't need to create an account. Are you a DJ? Contact us at producerenur@gmail.com to live stream on Sirius Radio.",
      'hero.play': 'Listen to Sirius live',
      'live.h': 'Live now', 'live.hint': 'Connected to the Traktor stream',
      'stations.head': 'Choose station <span>· switch genre anytime</span>',
      'program.h': 'Schedule', 'program.hint': 'Who plays live when',
      'dj.h': 'Become a DJ – broadcast live from Traktor', 'dj.hint': 'Stream · live set',
      'ai.fab': '✦ Ask Sirius', 'ai.title': '✦ Sirius assistant', 'ai.ph': 'Ask anything about the site…', 'ai.send': 'Send',
      'modal.title': 'Join Sirius', 'modal.sub': "You don't need an account to listen — only to play as a DJ.",
      'modal.listener': '🎧 Listener', 'modal.dj': '🎛 DJ', 'modal.register': 'Sign up', 'modal.login': 'Log in',
      'modal.name': 'Name / DJ name', 'modal.email': 'Email', 'modal.pass': 'Password',
      'modal.submit': 'Create account', 'modal.resend': '✉ Resend activation email', 'modal.forgot': 'Forgot password?',
      'search.ph': 'Search for DJ, genre, station…',
      'footer': '✦ SIRIUS — free internet radio · psychill · progressive · EDM · psytrance',
    },
    es: {
      'nav.live': 'En directo', 'nav.program': 'Programa', 'nav.dj': 'Hazte DJ',
      'nav.authbtn': 'Hazte DJ / entrar',
      'hero.title': 'Radio cósmica,<br><span class="glow">las 24 horas.</span>',
      'hero.lead': '¿Eres oyente? No necesitas crear una cuenta. ¿Eres DJ? Contáctanos en producerenur@gmail.com para emitir en directo en Sirius Radio.',
      'hero.play': 'Escucha Sirius en vivo',
      'live.h': 'En directo', 'live.hint': 'Conectado al stream de Traktor',
      'stations.head': 'Elige emisora <span>· cambia de género cuando quieras</span>',
      'program.h': 'Programa', 'program.hint': 'Quién toca en directo y cuándo',
      'dj.h': 'Hazte DJ – emite en directo desde Traktor', 'dj.hint': 'Stream · sesión en vivo',
      'ai.fab': '✦ Pregunta a Sirius', 'ai.title': '✦ Asistente Sirius', 'ai.ph': 'Pregunta lo que sea sobre el sitio…', 'ai.send': 'Enviar',
      'modal.title': 'Únete a Sirius', 'modal.sub': 'No necesitas cuenta para escuchar, solo para pinchar como DJ.',
      'modal.listener': '🎧 Oyente', 'modal.dj': '🎛 DJ', 'modal.register': 'Registrarse', 'modal.login': 'Entrar',
      'modal.name': 'Nombre / nombre de DJ', 'modal.email': 'Correo', 'modal.pass': 'Contraseña',
      'modal.submit': 'Crear cuenta', 'modal.resend': '✉ Reenviar correo de activación', 'modal.forgot': '¿Olvidaste tu contraseña?',
      'search.ph': 'Busca DJ, género, emisora…',
      'footer': '✦ SIRIUS — radio por internet gratis · psychill · progressive · EDM · psytrance',
    },
    de: {
      'nav.live': 'Live', 'nav.program': 'Programm', 'nav.dj': 'DJ werden',
      'nav.authbtn': 'DJ werden / anmelden',
      'hero.title': 'Kosmisches Radio,<br><span class="glow">rund um die Uhr.</span>',
      'hero.lead': 'Bist du Hörer? Du brauchst kein Konto. Bist du DJ? Kontaktiere uns unter producerenur@gmail.com, um live auf Sirius Radio zu streamen.',
      'hero.play': 'Sirius live hören',
      'live.h': 'Jetzt live', 'live.hint': 'Mit dem Traktor-Stream verbunden',
      'stations.head': 'Sender wählen <span>· Genre jederzeit wechseln</span>',
      'program.h': 'Programm', 'program.hint': 'Wer wann live spielt',
      'dj.h': 'DJ werden – live aus Traktor senden', 'dj.hint': 'Stream · Live-Set',
      'ai.fab': '✦ Frag Sirius', 'ai.title': '✦ Sirius-Assistent', 'ai.ph': 'Frag alles über die Seite…', 'ai.send': 'Senden',
      'modal.title': 'Mach mit bei Sirius', 'modal.sub': 'Zum Hören brauchst du kein Konto – nur als DJ.',
      'modal.listener': '🎧 Hörer', 'modal.dj': '🎛 DJ', 'modal.register': 'Registrieren', 'modal.login': 'Anmelden',
      'modal.name': 'Name / DJ-Name', 'modal.email': 'E-Mail', 'modal.pass': 'Passwort',
      'modal.submit': 'Konto erstellen', 'modal.resend': '✉ Aktivierungs-E-Mail erneut senden', 'modal.forgot': 'Passwort vergessen?',
      'search.ph': 'Suche nach DJ, Genre, Sender…',
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
