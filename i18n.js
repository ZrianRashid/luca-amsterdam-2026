// LUCA — i18n
// Dutch (primary) + English. Used by all pages via data-i18n attributes.

(function () {
  const DICT = {
    // ─────────── NAV ───────────
    'nav.facilities': { nl: 'Voorzieningen',         en: 'Facilities' },
    'nav.prices':     { nl: 'Prijzen',               en: 'Prices' },
    'nav.about':      { nl: 'Over LUCA',             en: 'About' },
    'nav.visit':      { nl: 'Bezoek',                en: 'Visit' },
    'nav.book':       { nl: 'Boek nu',               en: 'Book now' },

    // ─────────── HERO ───────────
    'hero.eyebrow':   { nl: 'Sauna · IJsbaden · Massages — Amsterdam-Oost', en: 'Sauna · Ice baths · Massages — Amsterdam East' },
    'hero.cta':       { nl: 'Reserveer een sessie',  en: 'Reserve a session' },
    'hero.cta.aux':   { nl: 'Tot 24u gratis annuleren · Spontaan ook welkom', en: 'Free cancellation up to 24h · Walk-ins welcome too' },
    'fab.book':       { nl: 'Boek nu',               en: 'Book now' },
    'hero.t1':        { nl: 'Boutique',               en: 'Boutique' },
    'hero.t2':        { nl: 'wellness',               en: 'wellness' },
    'hero.t3':        { nl: 'aan het',                en: 'on the' },
    'hero.t4':        { nl: 'water.',                 en: 'water.' },
    'hero.sub':       { nl: 'Sauna, ijsbad, massage en een warme huiskamer — op het Cruquiuseiland in Amsterdam-Oost.', en: 'Sauna, ice bath, massage and a warm living room — on Cruquiuseiland in Amsterdam-East.' },
    'hero.address':   { nl: 'LUCA Amsterdam — Zeeburgerkade', en: 'LUCA Amsterdam — Zeeburgerkade' },
    'hero.coord':     { nl: '52.3735° N · 4.9486° E', en: '52.3735° N · 4.9486° E' },
    'hero.est':       { nl: 'Sinds 2024',             en: 'Since 2024' },
    'hero.spontaan':  { nl: 'Spontaan welkom',        en: 'Walk-ins welcome' },
    'hero.scroll':    { nl: 'Scroll',                 en: 'Scroll' },

    // ─────────── EXPERIENCES ───────────
    'exp.kicker':     { nl: 'Voorzieningen',          en: 'Facilities' },
    'exp.title.a':    { nl: 'Opwarmen,',              en: 'Warm up,' },
    'exp.title.em':   { nl: 'afkoelen,',              en: 'cool down,' },
    'exp.title.b':    { nl: 'opladen.',               en: 'reset.' },
    'exp.lede':       { nl: 'Drie ruimtes, één ritueel. Geniet van onze sauna en ijsbaden, kies een massage, of gewoon een sapje aan de bar. Badkleding verplicht.', en: 'Three rooms, one ritual. Enjoy our sauna and ice baths, choose a massage, or just grab a juice at the bar. Swimwear required.' },

    'card.sauna.num':      { nl: '01 / Sauna & IJsbad', en: '01 / Sauna & Ice bath' },
    'card.sauna.name1':    { nl: 'Sauna',               en: 'Sauna' },
    'card.sauna.name2':    { nl: '& IJsbad',            en: '& ice bath' },
    'card.sauna.meta':     { nl: '30 · 60 · 90 min · vanaf €19', en: '30 · 60 · 90 min · from €19' },

    'card.massage.num':    { nl: '02 / Massages',       en: '02 / Massages' },
    'card.massage.name1':  { nl: 'Massa-',              en: 'Massage' },
    'card.massage.name2':  { nl: 'ges',                 en: '' },
    'card.massage.meta':   { nl: '30 · 60 · 90 min · vanaf €50', en: '30 · 60 · 90 min · from €50' },

    'card.prive.num':      { nl: '03 / LUCA Privé',     en: '03 / LUCA Private' },
    'card.prive.name1':    { nl: 'LUCA',                en: 'LUCA' },
    'card.prive.name2':    { nl: 'Privé',              en: 'Private' },
    'card.prive.meta':     { nl: '2-6 personen · vanaf €89,95', en: '2-6 guests · from €89.95' },

    'card.cta':            { nl: 'Boeken',              en: 'Book' },

    // ─────────── RITUAL ───────────
    'rit.kicker':     { nl: 'Het ritueel',              en: 'The ritual' },
    'rit.title.a':    { nl: 'Warm.',                    en: 'Warm.' },
    'rit.title.em':   { nl: 'Koud.',                    en: 'Cold.' },
    'rit.title.b':    { nl: 'Rust. Herhaal.',           en: 'Rest. Repeat.' },
    'rit.1.name':     { nl: 'Warmte',                   en: 'Warmth' },
    'rit.1.desc':     { nl: 'Twaalf minuten in de sauna. Laat je adem zakken, laat je schouders los.', en: 'Twelve minutes in the sauna. Let your breath drop, let your shoulders soften.' },
    'rit.2.name':     { nl: 'Koud',                     en: 'Cold' },
    'rit.2.desc':     { nl: 'Drie minuten in het ijsbad. Scherper dan taal. Schoner dan gedachte.', en: 'Three minutes in the ice bath. Sharper than language. Cleaner than thought.' },
    'rit.3.name':     { nl: 'Rust',                     en: 'Rest' },
    'rit.3.desc':     { nl: 'Twintig minuten in de huiskamer. Een sapje aan de bar, het raam open naar het water.', en: 'Twenty minutes in the living room. A juice at the bar, the window open onto the water.' },
    'rit.4.name':     { nl: 'Herhaal',                  en: 'Repeat' },
    'rit.4.desc':     { nl: 'Drie rondes is de praktijk. De vierde is helemaal van jou.', en: 'Three rounds is the practice. The fourth is yours alone.' },

    // ─────────── PHILOSOPHY ───────────
    'phil.q1': { nl: '"Wie zijn hoofd koel houdt,',     en: '"Whoever keeps a cool head' },
    'phil.q2': { nl: 'zit waarschijnlijk',              en: 'is probably' },
    'phil.q3': { nl: 'bij LUCA."',                      en: 'at LUCA."' },
    'phil.attr': { nl: '— Huisspreuk · LUCA Amsterdam', en: '— House saying · LUCA Amsterdam' },

    // ─────────── VISIT ───────────
    'visit.kicker':   { nl: 'Bezoek',                   en: 'Visit' },
    'visit.title.a':  { nl: 'Zeeburgerkade',            en: 'Zeeburgerkade' },
    'visit.title.em': { nl: '1314',                     en: '1314' },
    'visit.title.b':  { nl: ', Cruquiuseiland.',        en: ', Cruquiuseiland.' },
    'visit.lede':     { nl: 'Aan het water op het Cruquiuseiland in Amsterdam-Oost. Boek vooraf, of kom gewoon langs — spontane sessies zijn ook welkom.', en: 'On the water on Cruquiuseiland in Amsterdam East. Book ahead, or just drop by — spontaneous sessions are welcome too.' },
    'visit.addr.lbl': { nl: 'Adres',                   en: 'Address' },
    'visit.hrs.lbl':  { nl: 'Openingstijden',           en: 'Hours' },
    'visit.hrs.a':    { nl: 'Ma — Vr · 09:00 — 21:00',  en: 'Mon — Fri · 09:00 — 21:00' },
    'visit.hrs.b':    { nl: 'Za — Zo · 10:00 — 19:00',  en: 'Sat — Sun · 10:00 — 19:00' },
    'visit.tel.lbl':  { nl: 'Reserveren',              en: 'Book' },
    'visit.tel':      { nl: '020 362 1278',             en: '020 362 1278' },
    'visit.mail':     { nl: 'info@luca-amsterdam.nl',   en: 'info@luca-amsterdam.nl' },
    'visit.cta':      { nl: 'Reserveer een sessie',      en: 'Reserve a session' },

    // ─────────── FOOTER ───────────
    'foot.tag':       { nl: 'Boutique wellness aan het water. Amsterdam, sinds 2024.', en: 'Boutique wellness on the water. Amsterdam, since 2024.' },
    'foot.h.exp':     { nl: 'Beleving',                 en: 'Experience' },
    'foot.exp.1':     { nl: 'Sauna & IJsbad',           en: 'Sauna & Ice bath' },
    'foot.exp.2':     { nl: 'Massages',                 en: 'Massages' },
    'foot.exp.3':     { nl: 'LUCA Privé',               en: 'LUCA Private' },
    'foot.exp.4':     { nl: 'Memberships',              en: 'Memberships' },
    'foot.h.house':   { nl: 'Huis',                     en: 'House' },
    'foot.house.1':   { nl: 'Over LUCA',                en: 'About LUCA' },
    'foot.house.2':   { nl: 'Locatie & openingstijden', en: 'Location & hours' },
    'foot.house.3':   { nl: 'Veelgestelde vragen',     en: 'FAQ' },
    'foot.house.4':   { nl: 'Huisregels',              en: 'House rules' },
    'foot.h.reach':   { nl: 'Contact',                   en: 'Contact' },
    'foot.reach.1':   { nl: 'info@luca-amsterdam.nl',   en: 'info@luca-amsterdam.nl' },
    'foot.reach.2':   { nl: '020 362 1278',             en: '020 362 1278' },
    'foot.reach.3':   { nl: 'Instagram',                en: 'Instagram' },
    'foot.reach.4':   { nl: 'Nieuwsbrief',              en: 'Newsletter' },
    'foot.copy':      { nl: '© MMXXVI · LUCA Amsterdam', en: '© MMXXVI · LUCA Amsterdam' },
    'foot.place':     { nl: 'Aan het Cruquiuseiland',   en: 'On Cruquiuseiland' },
  };

  function getLang() {
    try {
      const saved = localStorage.getItem('luca-lang');
      if (saved === 'nl' || saved === 'en') return saved;
    } catch {}
    return document.documentElement.lang === 'en' ? 'en' : 'nl';
  }

  function t(key, lang) {
    const l = lang || getLang();
    const entry = DICT[key];
    if (!entry) return `[${key}]`;
    return entry[l] || entry.nl || '';
  }

  function applyToDOM(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      el.textContent = t(key, lang);
    });
    document.querySelectorAll('.lang-toggle button').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });
  }

  function setLang(lang) {
    try { localStorage.setItem('luca-lang', lang); } catch {}
    applyToDOM(lang);
  }

  function init() {
    const lang = getLang();
    applyToDOM(lang);
    document.querySelectorAll('.lang-toggle button').forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.LucaI18n = { t, setLang, getLang };
})();