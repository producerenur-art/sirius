# 🎛️ Sirius Web Radio – live lyd med AzuraCast + Traktor

Denne guiden loser deg gjennom **hele oppsettet** for å få ekte lyd på Sirius:
en server som spiller AI-rotert musikk 24/7, og som live DJ-er (du/andre)
kan koble Traktor til og «overta» sendingen fra.

> Du må gjøre server-stegene selv (jeg kan ikke leie en server for deg), men
> her er hvert klikk. Sett av ca. **30–45 min** første gang. Alt er gratis
> programvare; eneste kostnad er en liten server (~50–100 kr/mnd).

---

## Del 1 – Skaff en server (VPS)

En VPS er en liten Linux-maskin i skyen som er på 24/7.

1. Lag konto hos en tilbyder – **Hetzner Cloud** (billigst) eller **DigitalOcean**.
2. Opprett en server:
   - **OS:** Ubuntu 22.04 (eller nyere)
   - **Størrelse:** minst **2 GB RAM** (AzuraCast anbefaler det). Hetzner «CX22» eller DO «2 GB / 1 CPU» holder til et par hundre lyttere.
   - Velg datasenter nær lytterne dine (f.eks. Tyskland/Nederland for Norge).
3. Noter serverens **IP-adresse** (f.eks. `203.0.113.10`).
4. Logg på via SSH fra Mac-terminalen:
   ```bash
   ssh root@DIN_SERVER_IP
   ```

---

## Del 2 – Installer AzuraCast

AzuraCast er hele radiostasjonen i én pakke (auto-DJ + live-innlogging + statistikk + web-panel).

Kjør på serveren (lim inn linje for linje):

```bash
mkdir -p /var/azuracast
cd /var/azuracast
curl -fsSL https://raw.githubusercontent.com/AzuraCast/AzuraCast/main/docker.sh > docker.sh
chmod a+x docker.sh
./docker.sh install
```

Følg oppsettet på skjermen (svar «Y» på standardvalg). Når det er ferdig:

- Åpne `http://DIN_SERVER_IP` i nettleseren.
- Lag admin-konto (e-post + passord).
- **Sett opp HTTPS:** i AzuraCast → *Administration → Settings → Services* kan du slå på Let's Encrypt hvis du har et domenenavn pekt mot IP-en. (Anbefalt – nettleseren krever ofte HTTPS for lyd.)

---

## Del 3 – Lag stasjonen «Sirius»

1. I panelet: **Stations → Add Station**.
2. Navn: `Sirius`. Kortnavn/URL: `sirius`.
3. Slå på **AutoDJ** og **Allow Streamers / DJs** (viktig – dette gir live-innlogging).
4. Velg en mount/format, f.eks. **MP3 128 kbps**.
5. Lagre.

### Last opp musikk + lag rotasjon (AI-en spiller 24/7)

1. **Media → Upload** – last opp musikkfilene dine (psychill, psytrance osv.).
2. **Playlists → Add Playlist**: lag f.eks. én spilleliste per sjanger, sett dem til **General Rotation** og **Shuffle**.
3. Dette er «AI-rotasjonen» som spiller mandag–fredag, døgnet rundt, når ingen DJ er live.
4. (Valgfritt) **Schedule** på en spilleliste hvis en sjanger bare skal spilles til bestemte tider.

---

## Del 4 – Koble nettsiden til strømmen

1. I AzuraCast: **Stations → Sirius → Profile**. Der finner du:
   - **Stream URL** (lyd), f.eks. `https://din-server.no/listen/sirius/radio.mp3`
   - **API «Now Playing»**, f.eks. `https://din-server.no/api/nowplaying/1`
2. Åpne `js/config.js` i Sirius-prosjektet og lim inn:
   ```js
   streamUrl:     'https://din-server.no/listen/sirius/radio.mp3',
   nowPlayingUrl: 'https://din-server.no/api/nowplaying/1',
   ```
3. Last siden på nytt og trykk ▶ – nå spiller Sirius ekte lyd, og «Live nå»-boksen viser låt/DJ/lyttertall automatisk. ✅

> **HTTPS-tips:** hvis nettsiden din kjører på `https://` må streamUrl også være `https://`, ellers blokkerer nettleseren lyden («mixed content»). Derfor anbefales Let's Encrypt i Del 2.

---

## Del 5 – Gå live fra Traktor (Native Instruments)

Slik overtar en DJ sendingen fra AI-en:

1. **Lag en DJ-konto i AzuraCast:** Stations → Sirius → **Streamers/DJs → Add Streamer**. Sett brukernavn + passord (dette er DJ-ens live-passord).
2. I **Traktor → Preferences → Broadcasting**:
   | Felt | Verdi |
   |---|---|
   | **Address** | din-server.no (uten `https://`) |
   | **Port** | AzuraCast sin DJ/streamer-port (står under stasjonens *Profile → Connection Info*, typisk `8005`) |
   | **Mount** | `/` (eller det AzuraCast oppgir) |
   | **Password** | streamer-passordet fra steg 1 |
   | **Format** | MP3, 128 kbps, 44100 Hz |
   | **Server Type** | Icecast |
3. Fyll inn metadata (artistnavn) om ønskelig.
4. Trykk **Broadcast**-knappen (antenne-ikonet) øverst i Traktor. Når den lyser: **du er live**, og AutoDJ-en trekker seg automatisk. Stopp broadcast → AI-en tar over igjen.

På nettsiden vises da «LIVE NÅ» med DJ-navnet i stedet for «AI spiller nå».

---

## Del 6 – Koble til DJ-fanen på profilen

I Sirius-profilen (`#/edit` → «Gå live»-panelet) legger DJ-en inn navn, bilde og
sendetid. Selve lyden går via Traktor → AzuraCast (Del 5). «Program»-fanen og
DJ-profilsiden på nettstedet viser hvem som spiller når.

> Vil du at «Gå live»-knappen skal starte Traktor-veiviseren automatisk, eller
> vise DJ-ens personlige Icecast-detaljer rett i panelet? Si fra, så wirer jeg det.

---

## Feilsøking

| Symptom | Sjekk |
|---|---|
| Ingen lyd på ▶ | Er `streamUrl` riktig og `https`? Spiller stasjonen i AzuraCast selv? |
| «Live nå» oppdateres ikke | Er `nowPlayingUrl` riktig? Åpne den i nettleseren – får du JSON? |
| Traktor kobler ikke | Riktig port + streamer-passord? Er «Allow Streamers» på? |
| Blokkert lyd i nettleser | Blanding av http/https – gjør begge til https (Let's Encrypt). |

Når dette står, er Sirius Web Radio en ekte, live internettradio. 🚀
Jeg finpusser frontend videre (favoritter for lyttere, DJ-profil-sider, egen «Podcast»-fane, mobiltilpasning, PWA/app-installasjon).
Jeg kobler AI-assistenten til ekte Claude (serverless /api/chat) i stedet for den lokale kunnskapsbasen.
Jeg skriver deg en steg-for-steg-guide til AzuraCast + Traktor så du får lyden live (dette steget krever at du setter opp VPS-en – jeg kan ikke gjøre det for deg, men jeg loser deg gjennom hvert klikk).nowPlayingUrldeploy
