# CLAUDE.md

Retningslinjer for arbeid i dette repoet (Sirius – nettradio/streaming-side).

## Arbeidsflyt

- **Auto-commit til `main`:** Når det gjøres endringer på siden eller i koden, skal
  endringene committes til `main` automatisk – uten å spørre først.
- Repoet har foreløpig ingen remote (kun lokal `main`). Når en remote settes opp,
  skal endringene også pushes automatisk.
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
