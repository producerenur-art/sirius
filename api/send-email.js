/* =========================================================================
 * SIRIUS – e-post-backend (serverless, f.eks. Vercel)
 * -------------------------------------------------------------------------
 * Sender ekte aktiverings-/bekreftelses-e-post via Resend.
 * Frontend (js/auth.js) kaller POST /api/send-email med { type, to, name, link }.
 *
 * KREVER miljøvariabel RESEND_API_KEY på serveren. Uten den svarer funksjonen
 * 503 notProvisioned, og js/auth.js faller tilbake til demo-modus (viser
 * aktiveringslenken i konsollen). RESEND_FROM_EMAIL er valgfri avsender
 * (krever verifisert domene i Resend for å sende til vilkårlige adresser;
 * uten verifisert domene leverer Resend kun til kontoeierens egen e-post).
 * Node 18+ (global fetch) – ingen npm-avhengigheter.
 * ========================================================================= */

const FROM = process.env.RESEND_FROM_EMAIL || 'Sirius Web Radio <onboarding@resend.dev>';

function activationHtml(name, link) {
  const safeName = (name || 'der').replace(/[<>]/g, '');
  return `<!doctype html><html><body style="margin:0;background:#04060f;font-family:Inter,Arial,sans-serif;color:#eaf2ff">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px">
    <div style="font-size:22px;font-weight:800;letter-spacing:3px;color:#6fd3ff">✦ SIRIUS <span style="font-size:12px;color:#93a4c7;letter-spacing:1px">WEB RADIO</span></div>
    <h1 style="font-size:24px;margin:24px 0 8px">Bekreft kontoen din</h1>
    <p style="color:#93a4c7;font-size:15px;line-height:1.6">Hei ${safeName}! Trykk på knappen for å bekrefte e-posten din og aktivere Sirius-kontoen.</p>
    <p style="margin:28px 0"><a href="${link}" style="display:inline-block;background:linear-gradient(90deg,#6fd3ff,#a98bff);color:#06121f;font-weight:700;text-decoration:none;padding:14px 28px;border-radius:999px">Bekreft e-post ✦</a></p>
    <p style="color:#93a4c7;font-size:13px;line-height:1.6">Virker ikke knappen? Lim inn denne lenken i nettleseren:<br><a href="${link}" style="color:#6fd3ff;word-break:break-all">${link}</a></p>
    <p style="color:#5b6b8c;font-size:12px;margin-top:32px">Fikk du ikke bedt om dette? Da kan du se bort fra e-posten.</p>
  </div></body></html>`;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method' }); return; }
  const key = process.env.RESEND_API_KEY;
  if (!key) { res.status(503).json({ error: 'notProvisioned' }); return; }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const to = (body.to || '').toString().trim();
    const name = (body.name || '').toString().slice(0, 80);
    const link = (body.link || '').toString().slice(0, 500);
    if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) { res.status(400).json({ error: 'badEmail' }); return; }
    if (!/^https?:\/\//.test(link)) { res.status(400).json({ error: 'badLink' }); return; }

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to,
        subject: 'Bekreft kontoen din på Sirius Web Radio ✦',
        html: activationHtml(name, link),
      }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      res.status(502).json({ error: 'resend', status: r.status, detail: detail.slice(0, 400) });
      return;
    }
    const d = await r.json().catch(() => ({}));
    res.status(200).json({ ok: true, id: d.id });
  } catch (err) {
    res.status(500).json({ error: 'serverError', detail: String(err && err.message || err).slice(0, 300) });
  }
};
