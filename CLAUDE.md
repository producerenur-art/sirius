# CLAUDE.md

Retningslinjer for arbeid i dette repoet (Sirius – nettradio/streaming-side).

## Arbeidsflyt

- **Auto-push til `main`:** Når det gjøres endringer på siden eller i koden, skal
  endringene committes og pushes til `origin/main` automatisk – uten å spørre først.
- Remote: `git@github.com:producerenur-art/sirius.git` (SSH).
- Bruk korte, beskrivende commit-meldinger på norsk.

## Prosjektstruktur

- `index.html` – hovedside (single-page, hash-basert routing `#/...`).
- `css/styles.css` – all styling.
- `js/` – frontend-moduler (hver fil eksponerer et globalt objekt, f.eks.
  `window.Schedule`). Sentrale filer: `app.js` (oppstart/routing),
  `schedule.js` (program/DJ-tider), `player.js`, `stations.js`, `auth.js`,
  `ai.js`, `podcast.js`, `djprofile.js`.
- `api/` – Vercel serverless-funksjoner (`chat.js`, `send-email.js`).
- Data lagres foreløpig i nettleserens `localStorage` (f.eks. nøkkelen
  `sirius_schedule`).
- Deploy: Vercel (`.vercel/`).
