/* =========================================================================
 * SIRIUS – sentral konfigurasjon
 * -------------------------------------------------------------------------
 * Her setter du alt som peker mot serveren/streamen. Nettsiden fungerer
 * uten at noe av dette er satt (den viser da "offline"/demo-tilstand), men
 * for EKTE live-radio må du sette opp AzuraCast/Icecast og lime inn URL-ene
 * her. Se README.md for oppskrift.
 * ========================================================================= */
window.SIRIUS_CONFIG = {
  // Navnet og merkevaren
  brand: 'SIRIUS',
  subBrand: 'Web Radio',
  tagline: 'Sirius Web Radio – live fra rommet, døgnet rundt',

  // --- STREAM ---
  // Standard-strøm (spilles når ingen DJ er live). Hentet fra SoundCore-radioen
  // (soundcoredevelopment.com/#/radio). BYTT til din egen AzuraCast/Icecast når
  // serveren er oppe – se docs/AZURACAST-TRAKTOR.md.
  streamUrl: 'https://ice2.somafm.com/suburbsofgoa-128-mp3',

  // Stasjoner brukeren kan bytte mellom (samme kilder som SoundCore-radioen).
  // AI-rotasjonen bruker default; her kan lytteren velge sjanger selv.
  stations: [
    { name: 'Suburbs of Goa',     genre: 'Psychill / Goa',      url: 'https://ice2.somafm.com/suburbsofgoa-128-mp3' },
    { name: 'Space Station',      genre: 'Chill / ambient',     url: 'https://ice2.somafm.com/spacestation-128-mp3' },
    { name: 'Deep Space One',     genre: 'Deep ambient',        url: 'https://ice2.somafm.com/deepspaceone-128-mp3' },
    { name: 'The Trip',           genre: 'Prog / psy',          url: 'https://ice2.somafm.com/thetrip-128-mp3' },
    { name: 'Beat Blender',       genre: 'Deep house / EDM',    url: 'https://ice2.somafm.com/beatblender-128-mp3' },
    { name: 'Record Progressive', genre: 'Progressive / EDM',   url: 'https://radiorecord.hostingradio.ru/progr96.aacp' },
    { name: 'MagicStreams Psy',   genre: 'Psytrance (GR)',      url: 'https://cast.magicstreams.gr:9111/stream/1/' },
  ],

  // AzuraCast "Now Playing"-API (valgfritt, men gir automatisk låt/DJ/lyttertall):
  //   https://din-server.no/api/nowplaying/1
  nowPlayingUrl: '',

  // Hvor ofte vi henter "now playing" (ms)
  nowPlayingInterval: 15000,

  // --- AI-ASSISTENT ---
  // Tom = svarer umiddelbart fra den innebygde (gratis, lokale) kunnskapsbasen.
  // Vil du ha ekte Claude senere: legg ANTHROPIC_API_KEY i Vercel og sett
  // denne til '/api/chat' (serverless-funksjonen api/chat.js ligger klar).
  aiEndpoint: '',
};
