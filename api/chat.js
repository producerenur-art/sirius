/* =========================================================================
 * SIRIUS – AI-assistent backend (serverless, f.eks. Vercel/Netlify)
 * -------------------------------------------------------------------------
 * Kaller Claude (Messages API) og svarer med { reply }. Frontend (js/ai.js)
 * bruker denne kun hvis cfg.aiEndpoint er satt til '/api/chat'; ellers kjører
 * den innebygde gratis kunnskapsbasen.
 *
 * KREVER miljøvariabel ANTHROPIC_API_KEY på serveren. Nøkkelen ligger ALDRI
 * i frontend. Node 18+ (global fetch) – ingen npm-avhengigheter.
 * ========================================================================= */

const MODEL = 'claude-opus-4-8';

const SYSTEM_PROMPT = `Du er «Sirius-assistenten», den innebygde AI-en på nettradioen SIRIUS.
Svar alltid på norsk bokmål, kort og vennlig, med maks 4–5 setninger.

Om Sirius:
- Gratis internettradio med live DJ-sett rett fra Traktor (Native Instruments) og AI-rotert musikk 24/7, mandag til fredag, hele året.
- Sjangre: psychill, progressive, EDM og psytrance.
- Man trenger INGEN konto for å lytte eller for å bruke deg (AI-assistenten). Konto trengs bare for å spille som DJ.
- Lytt: trykk den store ▶-knappen (hero eller spilleren nederst).
- Bli DJ: lag DJ-konto, bekreft aktiverings-e-post, få «Gå live»-fane på profilen, koble Traktor via Icecast (Preferences → Broadcasting) – live-sendingen overtar automatisk for AI-en.
- «Program»-fanen viser hvem som spiller live når.
- Design: svart univers-bakgrunn (oppkalt etter stjernen Sirius) med blå-hvit glød.

Hvis du blir spurt om noe du ikke vet om siden, si det ærlig og foreslå hva brukeren kan gjøre i stedet. Ikke finn på funksjoner som ikke finnes.`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Ikke provisjonert – frontend faller pent tilbake til lokal KB.
    res.status(503).json({ error: 'notProvisioned' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const message = (body.message || '').toString().slice(0, 2000);
    if (!message.trim()) {
      res.status(400).json({ error: 'emptyMessage' });
      return;
    }

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      res.status(502).json({ error: 'upstream', status: r.status, detail: detail.slice(0, 500) });
      return;
    }

    const data = await r.json();
    const reply = Array.isArray(data.content)
      ? data.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
      : '';

    res.status(200).json({ reply: reply || 'Beklager, jeg fant ikke noe godt svar akkurat nå.' });
  } catch (err) {
    res.status(500).json({ error: 'serverError', detail: String(err && err.message || err).slice(0, 300) });
  }
};
