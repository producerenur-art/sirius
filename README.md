# ✦ SIRIUS Web Radio

Gratis internettradio med **live DJ-sett fra Traktor** og **AI-rotert musikk 24/7**.
Sjangre: psychill, progressive, EDM, psytrance.
Inspirert av diceradio.gr og radioq37.gr.

Dette repoet er **nettsiden** (frontend) + en liten **serverless AI-funksjon**.
Selve lyd-streamen kjører på en egen server – se «Live-radio-serveren» under, og
den detaljerte oppskriften i [docs/AZURACAST-TRAKTOR.md](docs/AZURACAST-TRAKTOR.md).

---

## Kjør nettsiden lokalt

```bash
cd ~/Desktop/sirius
python3 -m http.server 5173
# åpne http://localhost:5173
```

Alt virker med én gang: universe-bakgrunn, spiller (viser «offline» til
streamen er koblet på), AI-assistent (gratis, uten innlogging), program,
sjangre og DJ-innlogging med simulert aktiverings-e-post.

---

## Hva som er ferdig i denne startversjonen

| Funksjon | Status |
|---|---|
| Svart univers-bakgrunn + Sirius-logo øverst i hjørnet | ✅ Ferdig |
| Spiller-boks på hver side (kobler mot Traktor-strømmen) | ✅ Ferdig (mangler bare stream-URL) |
| «Live nå» + lyttertall (fra AzuraCast now-playing) | ✅ Ferdig |
| AI-assistent uten innlogging (lokal KB **+ ekte Claude** via `/api/chat`) | ✅ Ferdig |
| Lytter-innlogging + DJ-innlogging med aktiverings-e-post | ✅ Flyt ferdig (lokal; ekte e-post = backend) |
| Program: hvem spiller live når | ✅ Ferdig |
| DJ «Gå live»-fane: bildeopplasting + kamera (PC) | ✅ Ferdig |
| **Favoritter** for lyttere (♡ låter + DJ-er) | ✅ Ferdig |
| **DJ-profilsider** (#/dj/:navn) | ✅ Ferdig |
| **Podcast/opptak-fane** | ✅ Ferdig |
| **Mobiltilpasning + installerbar PWA/app** | ✅ Ferdig |
| Sjangre (6 stk) | ✅ Ferdig |
| **Selve 24/7-lyden + live fra Traktor** | ⬜ Krever server ([guide](docs/AZURACAST-TRAKTOR.md)) |
| Ekte kontoer + ekte aktiverings-e-post | ⬜ Krever backend |

---

## Live-radio-serveren (Traktor → lyttere, 24/7 AI-rotasjon)

Nettsiden spiller bare av en lyd-URL. Den URL-en lages av en radioserver.
Den enkleste, gratis, ferdige løsningen er **AzuraCast** (åpen kildekode).
Den gir deg alt du beskrev:

- **AutoDJ** som roterer musikk døgnet rundt (mandag–fredag, hele året)
- **Live DJ-innlogging**: når en DJ kobler seg på, tar live-sendingen automatisk
  over AutoDJ-en, og gir den tilbake når DJ-en slutter
- **Planlegging** av sendinger
- **Now-playing-API** (låt, DJ-navn, lyttertall) – som denne siden allerede leser

### Oppsett (kort)
1. Skaff en liten VPS (f.eks. Hetzner/DigitalOcean, ~50–100 kr/mnd).
2. Installer AzuraCast (én kommando, se azuracast.com).
3. Opprett stasjonen «Sirius», last opp musikk til AutoDJ, sett rotasjon.
4. Kopiér stream-URL og now-playing-URL inn i `js/config.js`:
   ```js
   streamUrl:     'https://din-server.no/listen/sirius/radio.mp3',
   nowPlayingUrl: 'https://din-server.no/api/nowplaying/1',
   ```

### Live fra Traktor (Native Instruments)
Traktor har innebygd kringkasting (Icecast):
1. AzuraCast: opprett en «Streamer/DJ»-konto for artisten.
2. Traktor → **Preferences → Broadcasting**: fyll inn server (AzuraCast-
   adressen), port, mount og passord fra DJ-kontoen.
3. Trykk **broadcast**-knappen i Traktor – du er live, og AutoDJ trekker seg.

---

## AI-assistent → ekte Claude

Den lokale kunnskapsbasen (`js/ai.js`) svarer gratis uten API. For smartere svar
ligger `api/chat.js` klar – en serverless-funksjon som kaller Claude
(`claude-opus-4-8`) og svarer `{ "reply": "..." }`.

Slik slår du den på:
1. Deploy prosjektet til Vercel (eller lignende) – `api/chat.js` blir da `/api/chat`.
2. Sett miljøvariabelen **`ANTHROPIC_API_KEY`** i Vercel (Settings → Environment Variables). Nøkkelen ligger kun på serveren, aldri i frontend.
3. Sett `aiEndpoint: '/api/chat'` i `js/config.js`.

Uten nøkkel svarer funksjonen `503 notProvisioned`, og frontend faller
automatisk tilbake til den lokale (gratis) kunnskapsbasen.

---

## Ekte kontoer + aktiverings-e-post (valgfritt neste steg)

Startversjonen lagrer brukere lokalt og *simulerer* e-posten (lenken logges i
konsollen). For ekte kontoer på tvers av enheter: koble `js/auth.js` mot en
backend (Supabase for kontoer + Resend for e-post), på samme måte som
SoundCore-prosjektet.

---

## Filstruktur

```
sirius/
  index.html          – hele siden
  manifest.json       – PWA (installerbar app)
  sw.js               – service worker (offline-cache)
  css/styles.css      – univers-tema
  assets/logo.svg     – Sirius-stjernelogo
  api/
    chat.js           – serverless AI (Claude) → { reply }
  docs/
    AZURACAST-TRAKTOR.md – full server-/live-oppskrift
  js/
    config.js         – ← ALT du kobler til serveren settes her
    starfield.js      – universe-bakgrunn
    player.js         – radiospiller + now-playing
    ai.js             – AI-assistent (lokal KB + valgfri Claude)
    schedule.js       – program / hvem spiller når
    auth.js           – lytter/DJ-innlogging + aktivering
    favorites.js      – favoritter for lyttere
    podcast.js        – podcast/opptak
    djprofile.js      – DJ-profilsider (#/dj/:navn)
    app.js            – UI-glue, modal, DJ «gå live»-panel, mobilmeny, PWA
```
