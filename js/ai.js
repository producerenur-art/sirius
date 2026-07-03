/* =========================================================================
 * SIRIUS – AI-assistent
 * Krever INGEN innlogging. Fungerer gratis rett ut av boksen via en lokal
 * kunnskapsbase om siden. Hvis du senere setter cfg.aiEndpoint til en
 * serverless-funksjon (Claude), sender den spørsmål dit for smartere svar.
 * ========================================================================= */
window.AI = (function () {
  const cfg = window.SIRIUS_CONFIG;

  // Lokal kunnskapsbase (intent → svar). Utvid fritt.
  const KB = [
    { k: ['lytt', 'høre', 'spille av', 'hvordan hør', 'start radio'],
      a: 'Trykk på den store ▶-knappen (i hero eller i spilleren nederst) for å høre Sirius live. Du trenger ingen konto for å lytte – det er helt gratis.' },
    { k: ['gratis', 'koster', 'pris', 'betale'],
      a: 'Sirius er 100 % gratis. Du trenger heller ikke konto for å lytte eller bruke chatten/AI-assistenten.' },
    { k: ['sjanger', 'musikk', 'hva spiller', 'genre', 'stil'],
      a: 'Sirius spiller psychill, progressive, EDM og psytrance – kosmisk elektronika døgnet rundt.' },
    { k: ['dj', 'spille live', 'bli dj', 'streame', 'traktor', 'native instruments'],
      a: 'Vil du spille live? Lag en DJ-konto (knappen «Bli DJ / logg inn»), bekreft e-posten din, og du får en «Gå live»-fane på profilen. Der kobler du Traktor til via Icecast og overtar sendingen automatisk. Se «Bli DJ»-seksjonen for oppsett.' },
    { k: ['når spiller', 'program', 'timeplan', 'hvem spiller', 'sending'],
      a: 'Se «Program»-seksjonen – der står det hvem som spiller live når. Utenom oppsatte tider roterer AI-en musikk 24/7, mandag til fredag.' },
    { k: ['ai', 'assistent', 'hvem er du', 'sirius ai'],
      a: 'Jeg er Sirius-assistenten. Jeg kan alt om siden – spør meg om hvordan du lytter, sjangre, hvordan du blir DJ, programmet eller kontoen din.' },
    { k: ['konto', 'registrer', 'logg inn', 'bruker', 'aktiver'],
      a: 'Du kan lytte helt uten konto. Vil du spille som DJ, lager du en konto og bekrefter via aktiverings-e-posten vi sender deg.' },
    { k: ['univers', 'design', 'bakgrunn', 'stjerne'],
      a: 'Sirius er oppkalt etter himmelens klareste stjerne – derfor den svarte universe-bakgrunnen og den blå-hvite gløden. ✦' },
  ];

  function answerLocally(q) {
    const s = q.toLowerCase();
    let best = null, bestScore = 0;
    for (const item of KB) {
      let score = 0;
      for (const k of item.k) if (s.includes(k)) score += k.length;
      if (score > bestScore) { bestScore = score; best = item; }
    }
    if (best) return best.a;
    return 'Godt spørsmål! Jeg vet mest om hvordan du lytter, sjangrene våre, hvordan du blir DJ og programmet. Prøv å spørre om noe av det – eller trykk ▶ for å bare høre Sirius. ✦';
  }

  async function ask(q) {
    if (cfg.aiEndpoint) {
      try {
        const r = await fetch(cfg.aiEndpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: q, context: 'sirius-radio' }),
        });
        const d = await r.json();
        if (d && d.reply) return d.reply;
      } catch (_) { /* faller tilbake til lokal KB */ }
    }
    return answerLocally(q);
  }

  // ---- UI ----
  const suggestions = ['Hvordan lytter jeg?', 'Hvilken musikk spiller dere?', 'Hvordan blir jeg DJ?', 'Er det gratis?'];
  let els = {};

  function push(text, who) {
    const m = document.createElement('div');
    m.className = 'msg ' + who;
    m.textContent = text;
    els.log.appendChild(m);
    els.log.scrollTop = els.log.scrollHeight;
    return m;
  }

  async function send(text) {
    text = (text || els.input.value).trim();
    if (!text) return;
    els.input.value = '';
    push(text, 'me');
    const typing = push('…', 'bot');
    const reply = await ask(text);
    typing.textContent = reply;
    els.log.scrollTop = els.log.scrollHeight;
  }

  function open() { els.panel.classList.add('open'); els.fab.style.display = 'none'; els.input.focus(); }
  function close() { els.panel.classList.remove('open'); els.fab.style.display = 'flex'; }

  function init() {
    els.fab = document.getElementById('ai-fab');
    els.panel = document.getElementById('ai-panel');
    els.log = document.getElementById('ai-log');
    els.input = document.getElementById('ai-input');
    els.suggest = document.getElementById('ai-suggest');

    els.fab.addEventListener('click', open);
    document.getElementById('ai-close').addEventListener('click', close);
    document.getElementById('ai-send').addEventListener('click', () => send());
    els.input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });

    suggestions.forEach(s => {
      const b = document.createElement('button');
      b.textContent = s;
      b.addEventListener('click', () => send(s));
      els.suggest.appendChild(b);
    });

    push('Hei! Jeg er Sirius-assistenten ✦ Spør meg om alt på siden – hvordan du lytter, sjangre, DJ-ing eller programmet.', 'bot');
  }
  return { init, ask };
})();
