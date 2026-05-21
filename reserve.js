/* global React, ReactDOM */
const {
  useState,
  useEffect,
  useMemo
} = React;

// ─────────────────────────────  i18n bridge  ─────────────────────────────

function useLang() {
  const [lang, setLang] = useState(() => window.LucaI18n ? window.LucaI18n.getLang() : 'nl');
  useEffect(() => {
    const handler = e => setLang(e.detail.lang);
    document.addEventListener('luca:lang-changed', handler);
    return () => document.removeEventListener('luca:lang-changed', handler);
  }, []);
  return lang;
}
const t = (key, lang) => window.LucaI18n ? window.LucaI18n.t(key, lang) : key;

// ─────────────────────────────  DATA  ─────────────────────────────

// ── Real LUCA Amsterdam services from OnlineAfspraken ────────────────────────
const SERVICES = [
// SAUNA & IJSBADEN
{
  id: 'sauna30',
  nameKey: 'r.svc.sauna30.name',
  descKey: 'r.svc.sauna30.desc',
  durations: [{
    min: 30,
    price: 19
  }],
  requiresGuests: false
}, {
  id: 'sauna60',
  nameKey: 'r.svc.sauna60.name',
  descKey: 'r.svc.sauna60.desc',
  durations: [{
    min: 60,
    price: 27
  }],
  requiresGuests: false
}, {
  id: 'sauna90',
  nameKey: 'r.svc.sauna90.name',
  descKey: 'r.svc.sauna90.desc',
  durations: [{
    min: 90,
    price: 35
  }],
  requiresGuests: false
},
// LUCA PRIVÉ
{
  id: 'privedate2',
  nameKey: 'r.svc.privedate2.name',
  descKey: 'r.svc.privedate2.desc',
  durations: [{
    min: 60,
    price: 89.95
  }],
  requiresGuests: true,
  maxGuests: 2,
  noteKey: 'r.svc.privedate2.note'
}, {
  id: 'privedate46',
  nameKey: 'r.svc.privedate46.name',
  descKey: 'r.svc.privedate46.desc',
  durations: [{
    min: 60,
    price: 89.95
  }],
  requiresGuests: true,
  maxGuests: 6,
  noteKey: 'r.svc.privedate46.note'
},
// MASSAGES
{
  id: 'buccal',
  nameKey: 'r.svc.buccal.name',
  descKey: 'r.svc.buccal.desc',
  durations: [{
    min: 30,
    price: 50
  }],
  requiresGuests: false
}, {
  id: 'relax30',
  nameKey: 'r.svc.relax30.name',
  descKey: 'r.svc.relax30.desc',
  durations: [{
    min: 30,
    price: 50
  }],
  requiresGuests: false
}, {
  id: 'deep30',
  nameKey: 'r.svc.deep30.name',
  descKey: 'r.svc.deep30.desc',
  durations: [{
    min: 30,
    price: 50
  }],
  requiresGuests: false
}, {
  id: 'relax60',
  nameKey: 'r.svc.relax60.name',
  descKey: 'r.svc.relax60.desc',
  durations: [{
    min: 60,
    price: 85
  }],
  requiresGuests: false
}, {
  id: 'deep60',
  nameKey: 'r.svc.deep60.name',
  descKey: 'r.svc.deep60.desc',
  durations: [{
    min: 60,
    price: 85
  }],
  requiresGuests: false
}, {
  id: 'relax90',
  nameKey: 'r.svc.relax90.name',
  descKey: 'r.svc.relax90.desc',
  durations: [{
    min: 90,
    price: 110
  }],
  requiresGuests: false
}, {
  id: 'deep90',
  nameKey: 'r.svc.deep90.name',
  descKey: 'r.svc.deep90.desc',
  durations: [{
    min: 90,
    price: 110
  }],
  requiresGuests: false
}, {
  id: 'cupping',
  nameKey: 'r.svc.cupping.name',
  descKey: 'r.svc.cupping.desc',
  durations: [{
    min: 30,
    price: 50
  }],
  requiresGuests: false
},
// COMBI
{
  id: 'combi30relax',
  nameKey: 'r.svc.combi30relax.name',
  descKey: 'r.svc.combi30relax.desc',
  durations: [{
    min: 60,
    price: 69
  }],
  requiresGuests: false,
  comboParts: ['30min wellness', '30min relax massage']
}, {
  id: 'combi30deep',
  nameKey: 'r.svc.combi30deep.name',
  descKey: 'r.svc.combi30deep.desc',
  durations: [{
    min: 60,
    price: 69
  }],
  requiresGuests: false,
  comboParts: ['30min wellness', '30min deep tissue massage']
}, {
  id: 'combi60relax',
  nameKey: 'r.svc.combi60relax.name',
  descKey: 'r.svc.combi60relax.desc',
  durations: [{
    min: 120,
    price: 104
  }],
  requiresGuests: false,
  comboParts: ['60min wellness', '60min relax massage']
}, {
  id: 'combi60deep',
  nameKey: 'r.svc.combi60deep.name',
  descKey: 'r.svc.combi60deep.desc',
  durations: [{
    min: 120,
    price: 104
  }],
  requiresGuests: false,
  comboParts: ['60min wellness', '60min deep tissue massage']
}, {
  id: 'combi30relax60',
  nameKey: 'r.svc.combi30relax60.name',
  descKey: 'r.svc.combi30relax60.desc',
  durations: [{
    min: 90,
    price: 89
  }],
  requiresGuests: false,
  comboParts: ['30min wellness', '60min relax massage']
}, {
  id: 'combi30deep60',
  nameKey: 'r.svc.combi30deep60.name',
  descKey: 'r.svc.combi30deep60.desc',
  durations: [{
    min: 90,
    price: 89
  }],
  requiresGuests: false,
  comboParts: ['30min wellness', '60min deep tissue massage']
}, {
  id: 'combi60relax30',
  nameKey: 'r.svc.combi60relax30.name',
  descKey: 'r.svc.combi60relax30.desc',
  durations: [{
    min: 90,
    price: 89
  }],
  requiresGuests: false,
  comboParts: ['60min wellness', '30min relax massage']
}, {
  id: 'combi60deep30',
  nameKey: 'r.svc.combi60deep30.name',
  descKey: 'r.svc.combi60deep30.desc',
  durations: [{
    min: 90,
    price: 89
  }],
  requiresGuests: false,
  comboParts: ['60min wellness', '30min deep tissue massage']
}, {
  id: 'combi30buccal',
  nameKey: 'r.svc.combi30buccal.name',
  descKey: 'r.svc.combi30buccal.desc',
  durations: [{
    min: 60,
    price: 69
  }],
  requiresGuests: false,
  comboParts: ['30min wellness', '30min buccal massage']
},
// IJSBAD ONLY
{
  id: 'ijsbad',
  nameKey: 'r.svc.ijsbad.name',
  descKey: 'r.svc.ijsbad.desc',
  durations: [{
    min: 10,
    price: 12
  }],
  requiresGuests: false
},
// MEN
{
  id: 'menbeard',
  nameKey: 'r.svc.menbeard.name',
  descKey: 'r.svc.menbeard.desc',
  durations: [{
    min: 35,
    price: 75
  }],
  requiresGuests: false
}, {
  id: 'menhair',
  nameKey: 'r.svc.menhair.name',
  descKey: 'r.svc.menhair.desc',
  durations: [{
    min: 45,
    price: 85
  }],
  requiresGuests: false
}, {
  id: 'menfull',
  nameKey: 'r.svc.menfull.name',
  descKey: 'r.svc.menfull.desc',
  durations: [{
    min: 60,
    price: 110
  }],
  requiresGuests: false
},
// STUDIO
{
  id: 'studio1',
  nameKey: 'r.svc.studio1.name',
  descKey: 'r.svc.studio1.desc',
  durations: [{
    min: 60,
    price: 95
  }],
  requiresGuests: true,
  maxGuests: 10
}, {
  id: 'studio2',
  nameKey: 'r.svc.studio2.name',
  descKey: 'r.svc.studio2.desc',
  durations: [{
    min: 120,
    price: 175
  }],
  requiresGuests: true,
  maxGuests: 10
}, {
  id: 'studio3',
  nameKey: 'r.svc.studio3.name',
  descKey: 'r.svc.studio3.desc',
  durations: [{
    min: 180,
    price: 245
  }],
  requiresGuests: true,
  maxGuests: 10
}, {
  id: 'studio4',
  nameKey: 'r.svc.studio4.name',
  descKey: 'r.svc.studio4.desc',
  durations: [{
    min: 240,
    price: 310
  }],
  requiresGuests: true,
  maxGuests: 10
}, {
  id: 'studio5',
  nameKey: 'r.svc.studio5.name',
  descKey: 'r.svc.studio5.desc',
  durations: [{
    min: 480,
    price: 550
  }],
  requiresGuests: true,
  maxGuests: 10
}];
const ADDONS = [{
  id: 'tea',
  nameKey: 'r.addon.tea.name',
  descKey: 'r.addon.tea.desc',
  price: 12,
  services: ['sauna30', 'sauna60', 'sauna90', 'privedate2', 'privedate46', 'relax30', 'deep30', 'relax60', 'deep60', 'relax90', 'deep90', 'cupping', 'buccal', 'combi30relax', 'combi30deep', 'combi60relax', 'combi60deep', 'combi30relax60', 'combi30deep60', 'combi60relax30', 'combi60deep30', 'combi30buccal', 'ijsbad', 'menbeard', 'menhair', 'menfull']
}, {
  id: 'juice',
  nameKey: 'r.addon.juice.name',
  descKey: 'r.addon.juice.desc',
  price: 14,
  services: ['sauna30', 'sauna60', 'sauna90', 'privedate2', 'privedate46', 'relax30', 'deep30', 'relax60', 'deep60', 'relax90', 'deep90', 'cupping', 'buccal', 'combi30relax', 'combi30deep', 'combi60relax', 'combi60deep', 'combi30relax60', 'combi30deep60', 'combi60relax30', 'combi60deep30', 'combi30buccal', 'ijsbad', 'menbeard', 'menhair', 'menfull']
}, {
  id: 'robe',
  nameKey: 'r.addon.robe.name',
  descKey: 'r.addon.robe.desc',
  price: 18,
  services: ['sauna30', 'sauna60', 'sauna90', 'privedate2', 'privedate46', 'relax30', 'deep30', 'relax60', 'deep60', 'relax90', 'deep90', 'cupping', 'buccal', 'combi30relax', 'combi30deep', 'combi60relax', 'combi60deep', 'combi30relax60', 'combi30deep60', 'combi60relax30', 'combi60deep30', 'combi30buccal', 'ijsbad', 'menbeard', 'menhair', 'menfull']
}];
const SERVICE_CATEGORIES = [{
  id: 'sauna',
  labelKey: 'r.cat.sauna',
  services: ['sauna30', 'sauna60', 'sauna90', 'ijsbad']
}, {
  id: 'prive',
  labelKey: 'r.cat.prive',
  services: ['privedate2', 'privedate46']
}, {
  id: 'massage',
  labelKey: 'r.cat.massage',
  services: ['buccal', 'relax30', 'deep30', 'relax60', 'deep60', 'relax90', 'deep90', 'cupping']
}, {
  id: 'combi',
  labelKey: 'r.cat.combi',
  services: ['combi30relax', 'combi30deep', 'combi60relax', 'combi60deep', 'combi30relax60', 'combi30deep60', 'combi60relax30', 'combi60deep30', 'combi30buccal']
}, {
  id: 'men',
  labelKey: 'r.cat.men',
  services: ['menbeard', 'menhair', 'menfull']
}, {
  id: 'studio',
  labelKey: 'r.cat.studio',
  services: ['studio1', 'studio2', 'studio3', 'studio4', 'studio5']
}];
const STEPS = ['r.step.1', 'r.step.2', 'r.step.3', 'r.step.4', 'r.step.5'];
const TODAY = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();

// ─────────────────────────────  HELPERS  ─────────────────────────────

const isoDate = d => d.toISOString().slice(0, 10);
const sameDay = (a, b) => a && b && a.getTime() === b.getTime();
const addMonths = (d, n) => {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
};
const startOfMonth = d => new Date(d.getFullYear(), d.getMonth(), 1);
function hash(s) {
  let h = 0;
  for (const c of s) h = h * 31 + c.charCodeAt(0) | 0;
  return Math.abs(h);
}

// LUCA hours: Mon-Fri 09-21, Sat-Sun 10-19. No closed days per the website.
function availabilityFor(date) {
  if (date < TODAY) return 'past';
  const h = hash(isoDate(date));
  const lvl = h % 3;
  return ['low', 'med', 'high'][lvl];
}
function timeSlotsFor(date, lang) {
  if (!date) return [];
  const dow = date.getDay(); // 0=Sun, 6=Sat
  const isWeekend = dow === 0 || dow === 6;
  const start = isWeekend ? 10 : 9;
  const end = isWeekend ? 19 : 21;
  const out = [];
  for (let h = start; h < end; h++) {
    for (const m of [0, 30]) {
      if (h === end - 1 && m === 30) continue; // last hour: only on the hour
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      let band;
      if (h < 12) band = 'r.band.morning';else if (h < 14) band = 'r.band.midday';else if (h < 17) band = 'r.band.afternoon';else band = 'r.band.evening';
      out.push({
        time,
        band
      });
    }
  }
  const hsh = hash(isoDate(date));
  return out.map((s, i) => {
    const r = (hsh + i * 7) % 10;
    let mood;
    if (r < 2) mood = 'disabled';else if (r < 5) mood = 'intimate';else if (r < 8) mood = 'shared';else mood = 'lively';
    return {
      ...s,
      mood
    };
  });
}
function priceFor(svc, dur, addons, guests, massageType) {
  if (!svc || !dur) return 0;
  let base = dur.price;
  if (svc.id.startsWith('deep') && massageType === 'deep') base += 10;
  let total = svc.requiresGuests ? base : base * guests;
  for (const a of addons) {
    const def = ADDONS.find(x => x.id === a);
    if (def) total += def.price * (svc.requiresGuests ? 1 : guests);
  }
  return total;
}
function fmtPrice(value, lang) {
  if (value == null) return '';
  if (Number.isInteger(value)) return `€${value}`;
  const fixed = Math.round(value * 100) / 100;
  if (Number.isInteger(fixed)) return `€${fixed}`;
  const s = fixed.toFixed(2);
  return (lang || 'nl') === 'nl' ? `€${s.replace('.', ',')}` : `€${s}`;
}

// ─────────────────────────────  COMPONENTS  ─────────────────────────────

function TopBar({
  stepIdx
}) {
  const lang = useLang();
  return /*#__PURE__*/React.createElement("header", {
    className: "topbar"
  }, /*#__PURE__*/React.createElement("a", {
    href: "LUCA Amsterdam.html",
    className: "topbar__logo"
  }, "LUCA"), /*#__PURE__*/React.createElement("div", {
    className: "topbar__progress"
  }, STEPS.map((key, i) => /*#__PURE__*/React.createElement("div", {
    key: key,
    className: `topbar__progress-step ${i === stepIdx ? 'is-active' : ''} ${i < stepIdx ? 'is-done' : ''}`
  }, /*#__PURE__*/React.createElement("span", null, String(i + 1).padStart(2, '0'), " \xB7 ", t(key, lang))))), /*#__PURE__*/React.createElement("div", {
    className: "topbar__right"
  }, /*#__PURE__*/React.createElement(LangToggle, null), /*#__PURE__*/React.createElement("a", {
    href: "LUCA Amsterdam.html",
    className: "topbar__close"
  }, t('r.close', lang))));
}
function LangToggle() {
  const lang = useLang();
  return /*#__PURE__*/React.createElement("div", {
    className: "lang-toggle"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: lang === 'nl' ? 'is-active' : '',
    "aria-label": "Nederlands",
    onClick: () => window.LucaI18n.setLang('nl')
  }, "\uD83C\uDDF3\uD83C\uDDF1"), /*#__PURE__*/React.createElement("span", {
    className: "lang-toggle__divider"
  }, "\xB7"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: lang === 'en' ? 'is-active' : '',
    "aria-label": "English",
    onClick: () => window.LucaI18n.setLang('en')
  }, "\uD83C\uDDEC\uD83C\uDDE7"));
}
function StageBg() {
  return /*#__PURE__*/React.createElement("div", {
    className: "stage",
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement("div", {
    className: "stage__layer stage__layer--a"
  }), /*#__PURE__*/React.createElement("div", {
    className: "stage__layer stage__layer--b"
  }), /*#__PURE__*/React.createElement("div", {
    className: "stage__veil"
  }), /*#__PURE__*/React.createElement("div", {
    className: "stage__grain"
  }));
}

// ─────────────────────────────  FUNNEL: smart hint logic  ─────────────────────────────

function isOffPeak(date, time) {
  if (!date || !time) return false;
  const dow = date.getDay(); // 0=Sun, 6=Sat
  if (dow === 0 || dow === 6) return false; // weekends not off-peak
  const h = parseInt(time.split(':')[0], 10);
  return h >= 9 && h < 17;
}
function getSmartHint({
  stepIdx,
  service,
  duration,
  date,
  time,
  guests,
  isReturning,
  dismissedHints
}) {
  const fired = id => dismissedHints.includes(id);

  // STEP 0 — Service step
  if (stepIdx === 0) {
    // First-time user picks 30-min sauna — nudge to 60-min sweet spot
    if (!isReturning && service && service.startsWith('sauna') && duration?.min === 30 && !fired('hint-short')) {
      return {
        id: 'hint-short',
        headlineKey: 'r.hint.short.h',
        bodyKey: 'r.hint.short.b'
      };
    }
    // Single-person 60-min sauna — suggest 5-pass card
    if (service && service.startsWith('sauna') && duration?.min === 60 && !fired('hint-rittenkaart')) {
      return {
        id: 'hint-rittenkaart',
        headlineKey: 'r.hint.rittenkaart.h',
        bodyKey: 'r.hint.rittenkaart.b',
        ctaKey: 'r.hint.rittenkaart.cta',
        ctaHref: 'Prijzen.html#rittenkaarten'
      };
    }
    // Massage selected — offer combo
    if (service && (service.startsWith('relax') || service.startsWith('deep') || service === 'buccal' || service === 'cupping') && !fired('hint-massagecombo')) {
      return {
        id: 'hint-massagecombo',
        headlineKey: 'r.hint.massagecombo.h',
        bodyKey: 'r.hint.massagecombo.b'
      };
    }
  }

  // STEP 1 — Date step
  if (stepIdx === 1 && date) {
    const dow = date.getDay();
    if ((dow === 0 || dow === 6) && !fired('hint-weekend')) {
      return {
        id: 'hint-weekend',
        headlineKey: 'r.hint.weekend.h',
        bodyKey: 'r.hint.weekend.b'
      };
    }
  }

  // STEP 2 — Time step
  if (stepIdx === 2 && time && isOffPeak(date, time) && service && service.startsWith('sauna') && !fired('hint-daluren')) {
    return {
      id: 'hint-daluren',
      headlineKey: 'r.hint.daluren.h',
      bodyKey: 'r.hint.daluren.b',
      ctaKey: 'r.hint.daluren.cta',
      ctaHref: 'Prijzen.html#rittenkaarten'
    };
  }

  // STEP 3 — Guest step
  if (stepIdx === 3 && service) {
    if (service.startsWith('prive') && guests <= 2 && !fired('hint-privesmall')) {
      return {
        id: 'hint-privesmall',
        headlineKey: 'r.hint.privesmall.h',
        bodyKey: 'r.hint.privesmall.b'
      };
    }
    if (service.startsWith('sauna') && guests >= 4 && !fired('hint-upgradeprive')) {
      return {
        id: 'hint-upgradeprive',
        headlineKey: 'r.hint.upgradeprive.h',
        bodyKey: 'r.hint.upgradeprive.b',
        ctaKey: 'r.hint.upgradeprive.cta',
        action: 'upgrade-to-prive'
      };
    }
  }
  return null;
}
function SmartHint({
  hint,
  onDismiss,
  onAction
}) {
  const lang = useLang();
  if (!hint) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "smart-hint"
  }, /*#__PURE__*/React.createElement("div", {
    className: "smart-hint__icon"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "smart-hint__body"
  }, /*#__PURE__*/React.createElement("span", {
    className: "smart-hint__label"
  }, t('r.tip', lang)), /*#__PURE__*/React.createElement("span", {
    className: "smart-hint__h"
  }, t(hint.headlineKey, lang)), /*#__PURE__*/React.createElement("span", {
    className: "smart-hint__b"
  }, t(hint.bodyKey, lang)), hint.ctaKey && hint.ctaHref && /*#__PURE__*/React.createElement("a", {
    className: "smart-hint__cta",
    href: hint.ctaHref
  }, t(hint.ctaKey, lang)), hint.ctaKey && hint.action && /*#__PURE__*/React.createElement("button", {
    className: "smart-hint__cta",
    type: "button",
    onClick: () => onAction(hint.action)
  }, t(hint.ctaKey, lang))), /*#__PURE__*/React.createElement("button", {
    className: "smart-hint__close",
    type: "button",
    onClick: () => onDismiss(hint.id),
    "aria-label": "Dismiss"
  }, "\xD7"));
}
function ReturningWelcome({
  booking,
  onResume,
  onReset
}) {
  const lang = useLang();
  const svc = SERVICES.find(s => s.id === booking.service);
  return /*#__PURE__*/React.createElement("div", {
    className: "welcome-banner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "welcome-banner__icon"
  }, "\u21BA"), /*#__PURE__*/React.createElement("div", {
    className: "welcome-banner__text"
  }, /*#__PURE__*/React.createElement("span", {
    className: "welcome-banner__h"
  }, t('r.welcome.h', lang)), /*#__PURE__*/React.createElement("span", {
    className: "welcome-banner__b"
  }, t('r.welcome.b', lang), svc && booking.duration && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--gold)'
    }
  }, " \xB7 ", t(svc.nameKey, lang), " ", booking.duration.min, " min"))), /*#__PURE__*/React.createElement("div", {
    className: "welcome-banner__actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "welcome-banner__btn welcome-banner__btn--ghost",
    type: "button",
    onClick: onReset
  }, t('r.welcome.start', lang)), /*#__PURE__*/React.createElement("button", {
    className: "welcome-banner__btn welcome-banner__btn--primary",
    type: "button",
    onClick: onResume
  }, t('r.welcome.cta', lang))));
}
function TrustStrip() {
  const lang = useLang();
  return /*#__PURE__*/React.createElement("div", {
    className: "trust-strip"
  }, /*#__PURE__*/React.createElement("span", {
    className: "trust-strip__item"
  }, t('r.trust.cancel', lang)), /*#__PURE__*/React.createElement("span", {
    className: "trust-strip__item"
  }, t('r.trust.charge', lang)), /*#__PURE__*/React.createElement("span", {
    className: "trust-strip__item"
  }, t('r.trust.spontaan', lang)));
}

// ── Step 1: Service ──
function StepService({
  service,
  duration,
  massageType,
  onService,
  onDuration,
  onMassageType
}) {
  const lang = useLang();
  const selectedSvc = SERVICES.find(s => s.id === service);
  return /*#__PURE__*/React.createElement("div", {
    className: "step__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step__kicker"
  }, t('r.s1.kicker', lang)), /*#__PURE__*/React.createElement("h1", {
    className: "step__title"
  }, t('r.s1.title.a', lang), " ", /*#__PURE__*/React.createElement("em", null, t('r.s1.title.em', lang)), " ", t('r.s1.title.b', lang)), /*#__PURE__*/React.createElement("p", {
    className: "step__sub"
  }, t('r.s1.sub', lang))), /*#__PURE__*/React.createElement("div", {
    className: "svc-list"
  }, SERVICE_CATEGORIES.map(cat => {
    const catServices = SERVICES.filter(s => cat.services.includes(s.id));
    const catSelected = catServices.some(s => s.id === service);
    return /*#__PURE__*/React.createElement("div", {
      key: cat.id,
      className: `svc-cat ${catSelected ? 'is-open' : ''}`
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "svc-cat__header",
      onClick: () => {
        console.log('Category clicked:', cat.id, 'catSelected:', catSelected, 'current service:', service);
        if (!catSelected) {
          console.log('Selecting service:', catServices[0].id);
          onService(catServices[0].id);
          onDuration(catServices[0].durations[0]);
        }
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "svc-cat__mark"
    }), /*#__PURE__*/React.createElement("span", {
      className: "svc-cat__name"
    }, t(cat.labelKey, lang)), /*#__PURE__*/React.createElement("span", {
      className: "svc-cat__count"
    }, catServices.length, " opties")), catSelected && /*#__PURE__*/React.createElement("div", {
      className: "svc-cat__body"
    }, catServices.map(s => {
      const selected = service === s.id;
      const dur = s.durations[0];
      return /*#__PURE__*/React.createElement("button", {
        key: s.id,
        type: "button",
        className: `svc-row ${selected ? 'is-selected' : ''}`,
        onClick: () => {
          onService(s.id);
          onDuration(dur);
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "svc-row__body"
      }, /*#__PURE__*/React.createElement("span", {
        className: "svc-row__name"
      }, t(s.nameKey, lang), s.noteKey && /*#__PURE__*/React.createElement("span", {
        className: "svc-row__note"
      }, " \xB7 ", t(s.noteKey, lang))), /*#__PURE__*/React.createElement("span", {
        className: "svc-row__desc"
      }, t(s.descKey, lang))), /*#__PURE__*/React.createElement("div", {
        className: "svc-row__meta"
      }, /*#__PURE__*/React.createElement("span", {
        className: "svc-row__dur"
      }, dur.min, " min"), /*#__PURE__*/React.createElement("span", {
        className: "svc-row__price"
      }, "\u20AC", Number.isInteger(dur.price) ? dur.price : dur.price.toFixed(2).replace('.', ','))));
    })));
  })), selectedSvc && /*#__PURE__*/React.createElement("div", {
    className: "svc-selected-detail"
  }, /*#__PURE__*/React.createElement("div", {
    className: "svc-selected-detail__name"
  }, t(selectedSvc.nameKey, lang)), selectedSvc.descKey && /*#__PURE__*/React.createElement("div", {
    className: "svc-selected-detail__desc"
  }, t(selectedSvc.descKey, lang)), /*#__PURE__*/React.createElement("div", {
    className: "svc-selected-detail__dur"
  }, duration?.min, " min \xB7 \u20AC", Number.isInteger(duration?.price) ? duration?.price : duration?.price?.toFixed(2).replace('.', ','))));
}

// ── Step 2: Date ──
function StepDate({
  value,
  onChange
}) {
  const lang = useLang();
  const [viewMonth, setViewMonth] = useState(startOfMonth(value || TODAY));
  const cells = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const firstDow = (first.getDay() + 6) % 7; // Mon-start
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < firstDow; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d);
      arr.push({
        date,
        avail: availabilityFor(date)
      });
    }
    return arr;
  }, [viewMonth]);
  const canBack = viewMonth > startOfMonth(TODAY);
  const monthName = window.LucaI18n.fmtMonth(viewMonth, lang);
  const monthCap = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  const weekdays = window.LucaI18n.weekdays[lang];
  return /*#__PURE__*/React.createElement("div", {
    className: "step__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step__kicker"
  }, t('r.s2.kicker', lang)), /*#__PURE__*/React.createElement("h1", {
    className: "step__title"
  }, t('r.s2.title.a', lang), " ", /*#__PURE__*/React.createElement("em", null, t('r.s2.title.em', lang)), " ", t('r.s2.title.b', lang)), /*#__PURE__*/React.createElement("p", {
    className: "step__sub"
  }, t('r.s2.sub', lang))), /*#__PURE__*/React.createElement("div", {
    className: "calendar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "calendar__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "calendar__month"
  }, monthCap, " ", /*#__PURE__*/React.createElement("em", {
    style: {
      color: 'var(--gold)'
    }
  }, viewMonth.getFullYear())), /*#__PURE__*/React.createElement("div", {
    className: "calendar__nav"
  }, /*#__PURE__*/React.createElement("button", {
    className: "calendar__nav-btn",
    disabled: !canBack,
    onClick: () => setViewMonth(addMonths(viewMonth, -1)),
    "aria-label": "Previous month"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8 2L4 6l4 4",
    stroke: "currentColor",
    strokeWidth: "1.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("button", {
    className: "calendar__nav-btn",
    onClick: () => setViewMonth(addMonths(viewMonth, 1)),
    "aria-label": "Next month"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M4 2l4 4-4 4",
    stroke: "currentColor",
    strokeWidth: "1.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))))), /*#__PURE__*/React.createElement("div", {
    className: "calendar__weekdays"
  }, weekdays.map(d => /*#__PURE__*/React.createElement("div", {
    key: d
  }, d))), /*#__PURE__*/React.createElement("div", {
    className: "calendar__grid"
  }, cells.map((c, i) => {
    if (!c) return /*#__PURE__*/React.createElement("div", {
      key: i,
      className: "cal-cell cal-cell--blank"
    });
    const {
      date,
      avail
    } = c;
    const sel = sameDay(value, date);
    const today = sameDay(TODAY, date);
    const cls = ['cal-cell'];
    if (avail === 'past') cls.push('cal-cell--past');else cls.push('cal-cell--avail');
    if (today) cls.push('cal-cell--today');
    if (sel) cls.push('is-selected');
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      type: "button",
      className: cls.join(' '),
      onClick: () => avail !== 'past' && onChange(date),
      disabled: avail === 'past'
    }, /*#__PURE__*/React.createElement("span", null, date.getDate()), (avail === 'low' || avail === 'med' || avail === 'high') && /*#__PURE__*/React.createElement("span", {
      className: `cal-cell__dot cal-cell__dot--${avail}`
    }));
  })), /*#__PURE__*/React.createElement("div", {
    className: "calendar__legend"
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'rgba(201,168,108,0.4)'
    }
  }), t('r.cal.quiet', lang)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'rgba(201,168,108,0.7)'
    }
  }), t('r.cal.half', lang)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
    style: {
      background: 'var(--gold)'
    }
  }), t('r.cal.filling', lang)))));
}

// ── Step 3: Time ──
function StepTime({
  date,
  value,
  onChange
}) {
  const lang = useLang();
  const slots = useMemo(() => timeSlotsFor(date, lang), [date, lang]);
  const bands = ['r.band.morning', 'r.band.midday', 'r.band.afternoon', 'r.band.evening'];
  const moodLabels = {
    intimate: 'r.mood.intimate',
    shared: 'r.mood.shared',
    lively: 'r.mood.lively'
  };
  const dateLabel = date ? window.LucaI18n.fmtDate(date, lang) : '';
  return /*#__PURE__*/React.createElement("div", {
    className: "step__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step__kicker"
  }, t('r.s3.kicker.pre', lang), dateLabel), /*#__PURE__*/React.createElement("h1", {
    className: "step__title"
  }, t('r.s3.title.a', lang), " ", /*#__PURE__*/React.createElement("em", null, t('r.s3.title.em', lang)), " ", t('r.s3.title.b', lang)), /*#__PURE__*/React.createElement("p", {
    className: "step__sub"
  }, t('r.s3.sub', lang))), /*#__PURE__*/React.createElement("div", {
    className: "time-section"
  }, bands.map(band => {
    const items = slots.filter(s => s.band === band);
    if (!items.length) return null;
    return /*#__PURE__*/React.createElement("div", {
      className: "time-band",
      key: band
    }, /*#__PURE__*/React.createElement("div", {
      className: "time-band__head"
    }, /*#__PURE__*/React.createElement("div", {
      className: "time-band__title"
    }, t(band, lang)), /*#__PURE__*/React.createElement("div", {
      className: "time-band__hint"
    }, items.length, " ", t('r.band.sessions', lang))), /*#__PURE__*/React.createElement("div", {
      className: "time-grid"
    }, items.map(s => {
      const sel = value === s.time;
      const disabled = s.mood === 'disabled';
      return /*#__PURE__*/React.createElement("button", {
        key: s.time,
        type: "button",
        className: `time-slot ${sel ? 'is-selected' : ''}`,
        disabled: disabled,
        onClick: () => !disabled && onChange(s.time)
      }, /*#__PURE__*/React.createElement("span", {
        className: "time-slot__time"
      }, s.time), /*#__PURE__*/React.createElement("span", {
        className: `time-slot__mood ${disabled ? '' : `time-slot__mood--${s.mood}`}`
      }, /*#__PURE__*/React.createElement("i", null), disabled ? t('r.mood.booked', lang) : t(moodLabels[s.mood], lang)));
    })));
  })));
}

// ── Step 4: Party + add-ons ──
function StepParty({
  service,
  guests,
  onGuests,
  addons,
  onAddons
}) {
  const lang = useLang();
  const svc = SERVICES.find(s => s.id === service);
  const maxG = svc?.maxGuests || 7;
  const showGuests = true; // always — minimum 1
  const availableAddons = ADDONS.filter(a => a.services.includes(service));
  return /*#__PURE__*/React.createElement("div", {
    className: "step__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step__kicker"
  }, t('r.s4.kicker', lang)), /*#__PURE__*/React.createElement("h1", {
    className: "step__title"
  }, t('r.s4.title.a', lang), " ", /*#__PURE__*/React.createElement("em", null, t('r.s4.title.em', lang)), " ", t('r.s4.title.b', lang)), /*#__PURE__*/React.createElement("p", {
    className: "step__sub"
  }, t('r.s4.sub', lang))), /*#__PURE__*/React.createElement("div", {
    className: "field-stack"
  }, showGuests && /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field__label"
  }, t('r.guests', lang)), /*#__PURE__*/React.createElement("div", {
    className: "field__aux"
  }, t('r.guests.max', lang))), /*#__PURE__*/React.createElement("div", {
    className: "stepper"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onGuests(Math.max(1, guests - 1)),
    disabled: guests <= 1
  }, "\u2212"), /*#__PURE__*/React.createElement("div", {
    className: "stepper__value"
  }, guests), /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onGuests(Math.min(maxG, guests + 1)),
    disabled: guests >= maxG
  }, "+"))), availableAddons.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "field"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "field__label"
  }, t('r.addons', lang)), /*#__PURE__*/React.createElement("div", {
    className: "field__aux"
  }, t('r.addons.opt', lang))), /*#__PURE__*/React.createElement("div", {
    className: "addons"
  }, availableAddons.map(a => {
    const on = addons.includes(a.id);
    return /*#__PURE__*/React.createElement("button", {
      key: a.id,
      type: "button",
      className: `addon ${on ? 'is-on' : ''}`,
      onClick: () => onAddons(on ? addons.filter(x => x !== a.id) : [...addons, a.id])
    }, /*#__PURE__*/React.createElement("span", {
      className: "addon__check"
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      className: "addon__name",
      style: {
        display: 'block'
      }
    }, t(a.nameKey, lang)), /*#__PURE__*/React.createElement("span", {
      className: "addon__desc",
      style: {
        display: 'block'
      }
    }, t(a.descKey, lang))), /*#__PURE__*/React.createElement("span", {
      className: "addon__price"
    }, "+ \u20AC", a.price));
  })))));
}

// ── Step 5: Details ──
function StepDetails({
  details,
  onChange,
  consent,
  onConsent
}) {
  const lang = useLang();
  const [focus, setFocus] = useState(null);
  const cells = [{
    key: 'firstName',
    labelKey: 'r.f.first',
    type: 'text',
    full: false,
    required: true
  }, {
    key: 'lastName',
    labelKey: 'r.f.last',
    type: 'text',
    full: false,
    required: true
  }, {
    key: 'email',
    labelKey: 'r.f.email',
    type: 'email',
    full: true,
    required: true
  }, {
    key: 'phone',
    labelKey: 'r.f.phone',
    type: 'tel',
    full: true,
    required: false
  }, {
    key: 'notes',
    labelKey: 'r.f.notes',
    type: 'textarea',
    full: true,
    required: false
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "step__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "step__kicker"
  }, t('r.s5.kicker', lang)), /*#__PURE__*/React.createElement("h1", {
    className: "step__title"
  }, t('r.s5.title.a', lang), " ", /*#__PURE__*/React.createElement("em", null, t('r.s5.title.em', lang))), /*#__PURE__*/React.createElement("p", {
    className: "step__sub"
  }, t('r.s5.sub', lang))), /*#__PURE__*/React.createElement("div", {
    className: "form-grid"
  }, cells.map(c => {
    const v = details[c.key] || '';
    const isFocus = focus === c.key;
    const isFilled = v.length > 0;
    return /*#__PURE__*/React.createElement("div", {
      key: c.key,
      className: `input-cell ${c.full ? 'input-cell--full' : ''} ${isFocus ? 'is-focus' : ''} ${isFilled ? 'is-filled' : ''}`
    }, /*#__PURE__*/React.createElement("label", null, t(c.labelKey, lang), c.required && ' *'), c.type === 'textarea' ? /*#__PURE__*/React.createElement("textarea", {
      rows: "3",
      value: v,
      onFocus: () => setFocus(c.key),
      onBlur: () => setFocus(null),
      onChange: e => onChange(c.key, e.target.value)
    }) : /*#__PURE__*/React.createElement("input", {
      type: c.type,
      value: v,
      onFocus: () => setFocus(c.key),
      onBlur: () => setFocus(null),
      onChange: e => onChange(c.key, e.target.value)
    }), /*#__PURE__*/React.createElement("span", {
      className: "input-cell__line"
    }));
  })), /*#__PURE__*/React.createElement("label", {
    className: "consent"
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: consent,
    onChange: e => onConsent(e.target.checked)
  }), /*#__PURE__*/React.createElement("span", {
    className: "consent__box"
  }), /*#__PURE__*/React.createElement("span", null, t('r.consent', lang), " ", /*#__PURE__*/React.createElement("a", {
    href: "Huisregels.html",
    target: "_blank"
  }, t('r.consent.tos', lang)), ".")));
}

// ── Summary ──
function Summary({
  service,
  duration,
  massageType,
  date,
  time,
  guests,
  addons
}) {
  const lang = useLang();
  const svc = SERVICES.find(s => s.id === service);
  const massageLbl = svc?.types?.find(t => t.id === massageType);
  const total = priceFor(svc, duration, addons, guests, massageType);
  const addonObjs = ADDONS.filter(a => addons.includes(a.id));
  return /*#__PURE__*/React.createElement("aside", {
    className: "summary"
  }, /*#__PURE__*/React.createElement("div", {
    className: "summary__title"
  }, t('r.sum.title', lang)), /*#__PURE__*/React.createElement("div", null, svc ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "summary__exp-name"
  }, t(svc.nameKey, lang)), /*#__PURE__*/React.createElement("div", {
    className: "summary__exp-meta"
  }, duration ? `${duration.min} min` : '—', massageLbl && ` · ${t(massageLbl.labelKey, lang)}`)) : /*#__PURE__*/React.createElement("div", {
    className: "summary__exp-name summary__exp-name--empty"
  }, t('r.sum.empty', lang))), /*#__PURE__*/React.createElement("div", {
    className: "summary__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "summary__row-label"
  }, t('r.sum.date', lang)), /*#__PURE__*/React.createElement("span", {
    className: `summary__row-value ${!date ? 'summary__row-value--placeholder' : ''}`
  }, date ? window.LucaI18n.fmtDateShort(date, lang) : '—')), /*#__PURE__*/React.createElement("div", {
    className: "summary__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "summary__row-label"
  }, t('r.sum.time', lang)), /*#__PURE__*/React.createElement("span", {
    className: `summary__row-value ${!time ? 'summary__row-value--placeholder' : ''}`
  }, time || '—')), /*#__PURE__*/React.createElement("div", {
    className: "summary__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "summary__row-label"
  }, t('r.sum.guests', lang)), /*#__PURE__*/React.createElement("span", {
    className: "summary__row-value"
  }, guests)), addonObjs.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "summary__row",
    style: {
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "summary__row-label"
  }, t('r.sum.addons', lang)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, addonObjs.map(a => /*#__PURE__*/React.createElement("span", {
    key: a.id,
    className: "summary__row-value",
    style: {
      textAlign: 'left',
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--mute)'
    }
  }, t(a.nameKey, lang)), /*#__PURE__*/React.createElement("span", null, "\u20AC", a.price))))), /*#__PURE__*/React.createElement("div", {
    className: "summary__total"
  }, /*#__PURE__*/React.createElement("span", {
    className: "summary__total-label"
  }, t('r.sum.total', lang)), /*#__PURE__*/React.createElement("span", {
    className: "summary__total-value"
  }, fmtPrice(total || 0, lang))), /*#__PURE__*/React.createElement("p", {
    className: "summary__note"
  }, t('r.sum.note', lang)));
}

// ── Confirmed ──
function Confirmed({
  booking,
  refCode,
  cancelUrl
}) {
  const lang = useLang();
  const svc = SERVICES.find(s => s.id === booking.service);
  const dayName = booking.date ? window.LucaI18n.fmtWeekday(booking.date, lang) : '';
  return /*#__PURE__*/React.createElement("div", {
    className: "confirm"
  }, /*#__PURE__*/React.createElement("div", {
    className: "confirm__seal"
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.3"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M5 12l4 4 10-10",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "confirm__kicker"
  }, t('r.ok.kicker', lang), " ", refCode), /*#__PURE__*/React.createElement("h1", {
    className: "confirm__title"
  }, t('r.ok.title.a', lang), " ", /*#__PURE__*/React.createElement("em", null, t('r.ok.title.em', lang)), /*#__PURE__*/React.createElement("br", null), t('r.ok.day.pre', lang), dayName, "."), /*#__PURE__*/React.createElement("div", {
    className: "confirm__details"
  }, /*#__PURE__*/React.createElement("div", {
    className: "confirm__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "confirm__detail-label"
  }, t('r.ok.detail.practice', lang)), /*#__PURE__*/React.createElement("span", {
    className: "confirm__detail-value"
  }, svc ? t(svc.nameKey, lang) : '—', booking.duration && ` · ${booking.duration.min} min`)), /*#__PURE__*/React.createElement("div", {
    className: "confirm__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "confirm__detail-label"
  }, t('r.ok.detail.date', lang)), /*#__PURE__*/React.createElement("span", {
    className: "confirm__detail-value"
  }, booking.date && window.LucaI18n.fmtDateShort(booking.date, lang))), /*#__PURE__*/React.createElement("div", {
    className: "confirm__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "confirm__detail-label"
  }, t('r.ok.detail.time', lang)), /*#__PURE__*/React.createElement("span", {
    className: "confirm__detail-value"
  }, booking.time)), /*#__PURE__*/React.createElement("div", {
    className: "confirm__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "confirm__detail-label"
  }, t('r.ok.detail.guests', lang)), /*#__PURE__*/React.createElement("span", {
    className: "confirm__detail-value"
  }, booking.guests)), /*#__PURE__*/React.createElement("div", {
    className: "confirm__detail"
  }, /*#__PURE__*/React.createElement("span", {
    className: "confirm__detail-label"
  }, t('r.ok.detail.address', lang)), /*#__PURE__*/React.createElement("span", {
    className: "confirm__detail-value"
  }, "Zeeburgerkade 1314-1316", /*#__PURE__*/React.createElement("br", null), "1019 VK Amsterdam"))), /*#__PURE__*/React.createElement("p", {
    className: "confirm__sub"
  }, t('r.ok.sub', lang)), /*#__PURE__*/React.createElement("div", {
    className: "confirm__actions"
  }, /*#__PURE__*/React.createElement("a", {
    href: "index.html",
    className: "btn btn--ghost"
  }, /*#__PURE__*/React.createElement("span", null, t('r.ok.home', lang))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn--primary",
    onClick: () => window.print()
  }, /*#__PURE__*/React.createElement("span", null, t('r.ok.save', lang)))), cancelUrl && /*#__PURE__*/React.createElement("p", {
    className: "confirm__cancel-line"
  }, /*#__PURE__*/React.createElement("span", null, t('r.ok.cancel.line', lang), " "), /*#__PURE__*/React.createElement("a", {
    href: cancelUrl
  }, t('r.ok.cancel.cta', lang))), /*#__PURE__*/React.createElement("div", {
    className: "confirm__upsells"
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "upsell-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "upsell-card__h"
  }, t('r.ok.giftcard.h', lang)), /*#__PURE__*/React.createElement("span", {
    className: "upsell-card__b"
  }, t('r.ok.giftcard.b', lang)), /*#__PURE__*/React.createElement("span", {
    className: "upsell-card__cta"
  }, t('r.ok.giftcard.cta', lang))), /*#__PURE__*/React.createElement("a", {
    href: "Prijzen.html#abonnementen",
    className: "upsell-card"
  }, /*#__PURE__*/React.createElement("span", {
    className: "upsell-card__h"
  }, t('r.ok.member.h', lang)), /*#__PURE__*/React.createElement("span", {
    className: "upsell-card__b"
  }, t('r.ok.member.b', lang)), /*#__PURE__*/React.createElement("span", {
    className: "upsell-card__cta"
  }, t('r.ok.member.cta', lang)))));
}

// ─────────────────────────────  ROOT  ─────────────────────────────

const initialBooking = (() => {
  const defaults = {
    service: 'sauna60',
    duration: SERVICES.find(s => s.id === 'sauna60').durations[0],
    // 60 min default
    massageType: 'ontspanning',
    date: null,
    time: null,
    guests: 2,
    addons: [],
    details: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      notes: ''
    }
  };
  try {
    const saved = localStorage.getItem('luca-booking-v2');
    if (saved) {
      const p = JSON.parse(saved);
      if (p.date) p.date = new Date(p.date);
      // Refresh duration object from SERVICES (prices may have changed since last save)
      if (p.service && p.duration) {
        const svc = SERVICES.find(s => s.id === p.service);
        if (svc) {
          const matching = svc.durations.find(d => d.min === p.duration.min);
          if (matching) p.duration = matching;else p.duration = svc.durations[0];
        }
      }
      return {
        ...defaults,
        ...p
      };
    }
  } catch {}
  return defaults;
})();

// URL param prefill: ?service=sauna30|sauna60|sauna90|privedate2|privedate46|etc
(function applyUrlPrefill() {
  try {
    const params = new URLSearchParams(window.location.search);
    const svc = params.get('service');
    if (svc && SERVICES.find(s => s.id === svc)) {
      const s = SERVICES.find(x => x.id === svc);
      initialBooking.service = svc;
      initialBooking.duration = s.durations[0];
    }
  } catch {}
})();
function ReserveApp() {
  const lang = useLang();
  const [stepIdx, setStepIdx] = useState(0);
  const [booking, setBooking] = useState(initialBooking);
  const [consent, setConsent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [refCode, setRefCode] = useState('');
  const [cancelUrl, setCancelUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [layout, setLayout] = useState('split');
  const [dismissedHints, setDismissedHints] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('luca-dismissed-hints') || '[]');
    } catch {
      return [];
    }
  });
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      // Show welcome if there's any prior interaction (a saved booking with non-default state)
      const saved = localStorage.getItem('luca-booking-v2');
      const hasPriorConfirm = localStorage.getItem('luca-prev-confirmed');
      if (!saved) return false;
      const p = JSON.parse(saved);
      return Boolean(hasPriorConfirm) || Boolean(p.date) || Boolean(p.time);
    } catch {
      return false;
    }
  });
  const isReturning = useMemo(() => {
    try {
      return Boolean(localStorage.getItem('luca-prev-confirmed'));
    } catch {
      return false;
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('luca-booking-v2', JSON.stringify(booking));
    } catch {}
  }, [booking]);
  useEffect(() => {
    try {
      localStorage.setItem('luca-dismissed-hints', JSON.stringify(dismissedHints));
    } catch {}
  }, [dismissedHints]);
  useEffect(() => {
    window.__lucaSetReserveLayout = setLayout;
  }, []);
  const canAdvance = useMemo(() => {
    const svc = SERVICES.find(s => s.id === booking.service);
    switch (stepIdx) {
      case 0:
        if (!svc || !booking.duration) return false;
        if (svc.types && !booking.massageType) return false;
        return true;
      case 1:
        return !!booking.date;
      case 2:
        return !!booking.time;
      case 3:
        return booking.guests > 0;
      case 4:
        return booking.details.firstName && booking.details.lastName && /.+@.+\..+/.test(booking.details.email) && consent;
      default:
        return false;
    }
  }, [stepIdx, booking, consent]);
  const submitBooking = async () => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const svcDef = SERVICES.find(s => s.id === booking.service);
      const startAt = composeStartAt(booking.date, booking.time);
      const totalEuros = priceFor(svcDef, booking.duration, booking.addons, booking.guests, booking.massageType);
      const payload = {
        serviceId: booking.service,
        startAt,
        guests: booking.guests,
        addonIds: booking.addons,
        totalCents: Math.round(totalEuros * 100),
        notes: booking.details.notes || null,
        customer: {
          email: booking.details.email,
          fullName: [booking.details.firstName, booking.details.lastName].filter(Boolean).join(' ').trim() || null,
          phone: booking.details.phone || null,
          language: lang,
          marketingConsent: false
        }
      };
      const res = await fetch('/.netlify/functions/create-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'HTTP ' + res.status);
      setRefCode(data.reference);
      setCancelUrl(data.cancelUrl || '');
      try {
        localStorage.setItem('luca-prev-confirmed', '1');
      } catch {}
      try {
        localStorage.removeItem('luca-booking-v2');
      } catch {}
      setConfirmed(true);
    } catch (e) {
      console.error('booking submit failed', e);
      setSubmitError(e.message || 'submit-failed');
    } finally {
      setSubmitting(false);
    }
  };
  const next = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);else if (!submitting) submitBooking();
  };
  const back = () => setStepIdx(Math.max(0, stepIdx - 1));

  // Smart hint for current state
  const currentHint = useMemo(() => getSmartHint({
    stepIdx,
    service: booking.service,
    duration: booking.duration,
    date: booking.date,
    time: booking.time,
    guests: booking.guests,
    isReturning,
    dismissedHints
  }), [stepIdx, booking, isReturning, dismissedHints]);
  const dismissHint = id => setDismissedHints(h => [...h, id]);
  const handleHintAction = action => {
    if (action === 'upgrade-to-prive') {
      const prive = SERVICES.find(s => s.id === 'privedate2');
      setBooking({
        ...booking,
        service: 'privedate2',
        duration: prive.durations[0]
      });
      setStepIdx(0);
      dismissHint('hint-upgradeprive');
    }
  };
  const resetBooking = () => {
    try {
      localStorage.removeItem('luca-booking-v2');
    } catch {}
    setBooking({
      service: 'sauna60',
      duration: SERVICES.find(s => s.id === 'sauna60').durations[0],
      massageType: 'ontspanning',
      date: null,
      time: null,
      guests: 2,
      addons: [],
      details: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: ''
      }
    });
    setStepIdx(0);
    setShowWelcome(false);
  };
  const resumeBooking = () => {
    // Pick up where they left off
    let step = 0;
    if (booking.service && booking.duration) step = 1;
    if (booking.date) step = 2;
    if (booking.time) step = 3;
    if (booking.guests) step = 4;
    setStepIdx(step);
    setShowWelcome(false);
  };
  if (confirmed) {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(StageBg, null), /*#__PURE__*/React.createElement(TopBar, {
      stepIdx: STEPS.length
    }), /*#__PURE__*/React.createElement(Confirmed, {
      booking: booking,
      refCode: refCode,
      cancelUrl: cancelUrl
    }));
  }
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(StageBg, null), /*#__PURE__*/React.createElement(TopBar, {
    stepIdx: stepIdx
  }), showWelcome && /*#__PURE__*/React.createElement(ReturningWelcome, {
    booking: booking,
    onResume: resumeBooking,
    onReset: resetBooking
  }), /*#__PURE__*/React.createElement("main", {
    className: "flow",
    "data-layout": layout
  }, /*#__PURE__*/React.createElement("div", {
    className: "steps"
  }, /*#__PURE__*/React.createElement("div", {
    className: `step ${stepIdx === 0 ? 'is-active' : ''} ${stepIdx > 0 ? 'is-past' : ''}`
  }, /*#__PURE__*/React.createElement(StepService, {
    service: booking.service,
    duration: booking.duration,
    massageType: booking.massageType,
    onService: id => {
      const s = SERVICES.find(x => x.id === id);
      // Default to middle-tier duration (60-min for sauna/massage, 90-min for privé) to anchor higher value
      setBooking({
        ...booking,
        service: id,
        duration: s.durations[1] || s.durations[0]
      });
    },
    onDuration: d => setBooking({
      ...booking,
      duration: d
    }),
    onMassageType: mt => setBooking({
      ...booking,
      massageType: mt
    })
  }), stepIdx === 0 && /*#__PURE__*/React.createElement(SmartHint, {
    hint: currentHint,
    onDismiss: dismissHint,
    onAction: handleHintAction
  })), /*#__PURE__*/React.createElement("div", {
    className: `step ${stepIdx === 1 ? 'is-active' : ''} ${stepIdx > 1 ? 'is-past' : ''}`
  }, /*#__PURE__*/React.createElement(StepDate, {
    value: booking.date,
    onChange: v => setBooking({
      ...booking,
      date: v
    })
  }), stepIdx === 1 && /*#__PURE__*/React.createElement(SmartHint, {
    hint: currentHint,
    onDismiss: dismissHint,
    onAction: handleHintAction
  })), /*#__PURE__*/React.createElement("div", {
    className: `step ${stepIdx === 2 ? 'is-active' : ''} ${stepIdx > 2 ? 'is-past' : ''}`
  }, /*#__PURE__*/React.createElement(StepTime, {
    date: booking.date,
    value: booking.time,
    onChange: v => setBooking({
      ...booking,
      time: v
    })
  }), stepIdx === 2 && /*#__PURE__*/React.createElement(SmartHint, {
    hint: currentHint,
    onDismiss: dismissHint,
    onAction: handleHintAction
  })), /*#__PURE__*/React.createElement("div", {
    className: `step ${stepIdx === 3 ? 'is-active' : ''} ${stepIdx > 3 ? 'is-past' : ''}`
  }, /*#__PURE__*/React.createElement(StepParty, {
    service: booking.service,
    guests: booking.guests,
    onGuests: v => setBooking({
      ...booking,
      guests: v
    }),
    addons: booking.addons,
    onAddons: v => setBooking({
      ...booking,
      addons: v
    })
  }), stepIdx === 3 && /*#__PURE__*/React.createElement(SmartHint, {
    hint: currentHint,
    onDismiss: dismissHint,
    onAction: handleHintAction
  })), /*#__PURE__*/React.createElement("div", {
    className: `step ${stepIdx === 4 ? 'is-active' : ''}`
  }, /*#__PURE__*/React.createElement(StepDetails, {
    details: booking.details,
    onChange: (k, v) => setBooking({
      ...booking,
      details: {
        ...booking.details,
        [k]: v
      }
    }),
    consent: consent,
    onConsent: setConsent
  }))), /*#__PURE__*/React.createElement(Summary, {
    service: booking.service,
    duration: booking.duration,
    massageType: booking.massageType,
    date: booking.date,
    time: booking.time,
    guests: booking.guests,
    addons: booking.addons
  })), /*#__PURE__*/React.createElement(TrustStrip, null), submitError && /*#__PURE__*/React.createElement("div", {
    className: "submit-error",
    role: "alert"
  }, t('r.err.submit', lang), " ", /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "submit-error__dismiss",
    onClick: () => setSubmitError(null),
    "aria-label": "Dismiss"
  }, "\xD7")), /*#__PURE__*/React.createElement("footer", {
    className: "flow-footer"
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn--ghost",
    onClick: back,
    disabled: stepIdx === 0 || submitting
  }, /*#__PURE__*/React.createElement("span", null, t('r.back', lang))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn--primary",
    onClick: next,
    disabled: !canAdvance || submitting
  }, /*#__PURE__*/React.createElement("span", null, submitting ? t('r.submitting', lang) : stepIdx === STEPS.length - 1 ? t('r.confirm', lang) : t('r.continue', lang)))));
}

// Compose a UTC ISO timestamp from a local Date + "HH:MM" time string.
function composeStartAt(date, time) {
  if (!date || !time) return null;
  const [h, m] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}
window.__ReserveApp = ReserveApp;
