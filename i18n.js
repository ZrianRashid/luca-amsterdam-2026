// LUCA — i18n
// Single source of strings for Dutch (default) + English.
// Used by both the static marketing page (via data-i18n attrs) and the React booking flow.

(function () {
  const DICT = {
    // ─────────── NAV ───────────
    'nav.facilities': { nl: 'Voorzieningen',         en: 'Facilities' },
    'nav.prices':     { nl: 'Prijzen',               en: 'Prices' },
    'nav.about':      { nl: 'Over LUCA',             en: 'About' },
    'nav.visit':      { nl: 'Bezoek',                en: 'Visit' },
    'nav.book':       { nl: 'Boek nu',               en: 'Book now' },

    // ─────────── HERO ───────────
    'hero.eyebrow':   { nl: 'Sauna · IJsbaden · Massages — Amsterdam-Oost',
                        en: 'Sauna · Ice baths · Massages — Amsterdam East' },
    'hero.cta':       { nl: 'Reserveer een sessie',
                        en: 'Reserve a session' },
    'hero.cta.aux':   { nl: 'Tot 24u gratis annuleren · Spontaan ook welkom',
                        en: 'Free cancellation up to 24h · Walk-ins welcome too' },
    'fab.book':       { nl: 'Boek nu',
                        en: 'Book now' },
    'hero.t1':        { nl: 'Boutique',     en: 'Boutique' },
    'hero.t2':        { nl: 'wellness',     en: 'wellness' },
    'hero.t3':        { nl: 'aan het',      en: 'on the' },
    'hero.t4':        { nl: 'water.',       en: 'water.' },
    'hero.sub':       { nl: 'Sauna, ijsbad, massage en een warme huiskamer — op het Cruquiuseiland in Amsterdam-Oost.',
                        en: 'Sauna, ice bath, massage and a warm living room — on Cruquiuseiland in Amsterdam-East.' },
    'hero.address':   { nl: 'LUCA Amsterdam — Zeeburgerkade',
                        en: 'LUCA Amsterdam — Zeeburgerkade' },
    'hero.coord':     { nl: '52.3735° N · 4.9486° E', en: '52.3735° N · 4.9486° E' },
    'hero.est':       { nl: 'Sinds 2024',             en: 'Since 2024' },
    'hero.spontaan':  { nl: 'Spontaan welkom',        en: 'Walk-ins welcome' },
    'hero.scroll':    { nl: 'Scroll',                 en: 'Scroll' },

    // ─────────── EXPERIENCES SECTION ───────────
    'exp.kicker':     { nl: 'Voorzieningen',          en: 'Facilities' },
    'exp.title.a':    { nl: 'Opwarmen,',              en: 'Warm up,' },
    'exp.title.em':   { nl: 'afkoelen,',              en: 'cool down,' },
    'exp.title.b':    { nl: 'opladen.',               en: 'reset.' },
    'exp.lede':       { nl: 'Drie ruimtes, één ritueel. Geniet van onze sauna en ijsbaden, kies een massage, of gewoon een sapje aan de bar. Badkleding verplicht.',
                        en: 'Three rooms, one ritual. Enjoy our sauna and ice baths, choose a massage, or just grab a juice at the bar. Swimwear required.' },

    'card.sauna.num':      { nl: '01 / Sauna & IJsbad', en: '01 / Sauna & Ice bath' },
    'card.sauna.name1':    { nl: 'Sauna',               en: 'Sauna' },
    'card.sauna.name2':    { nl: '& IJsbad',            en: '& ice bath' },
    'card.sauna.meta':     { nl: '30 · 60 · 90 min · vanaf €19',
                             en: '30 · 60 · 90 min · from €19' },

    'card.massage.num':    { nl: '02 / Massages',       en: '02 / Massages' },
    'card.massage.name1':  { nl: 'Massa-',              en: 'Mas-' },
    'card.massage.name2':  { nl: 'ges',                 en: 'sages' },
    'card.massage.meta':   { nl: '30 · 60 · 90 min · vanaf €50',
                             en: '30 · 60 · 90 min · from €50' },

    'card.prive.num':      { nl: '03 / LUCA Privé',     en: '03 / LUCA Private' },
    'card.prive.name1':    { nl: 'LUCA',                en: 'LUCA' },
    'card.prive.name2':    { nl: 'Privé',               en: 'Private' },
    'card.prive.meta':     { nl: '2-6 personen · vanaf €89,95',
                             en: '2-6 guests · from €89.95' },

    'card.cta':            { nl: 'Boeken',              en: 'Book' },

    // ─────────── RITUAL SECTION ───────────
    'rit.kicker':     { nl: 'Het ritueel',              en: 'The ritual' },
    'rit.title.a':    { nl: 'Warm.',                    en: 'Warm.' },
    'rit.title.em':   { nl: 'Koud.',                    en: 'Cold.' },
    'rit.title.b':    { nl: 'Rust. Herhaal.',           en: 'Rest. Repeat.' },

    'rit.1.name':     { nl: 'Warmte',                   en: 'Warmth' },
    'rit.1.desc':     { nl: 'Twaalf minuten in de sauna. Laat je adem zakken, laat je schouders los.',
                        en: 'Twelve minutes in the sauna. Let your breath drop, let your shoulders soften.' },
    'rit.2.name':     { nl: 'Koud',                     en: 'Cold' },
    'rit.2.desc':     { nl: 'Drie minuten in het ijsbad. Scherper dan taal. Schoner dan gedachte.',
                        en: 'Three minutes in the ice bath. Sharper than language. Cleaner than thought.' },
    'rit.3.name':     { nl: 'Rust',                     en: 'Rest' },
    'rit.3.desc':     { nl: 'Twintig minuten in de huiskamer. Een sapje aan de bar, het raam open naar het water.',
                        en: 'Twenty minutes in the living room. A juice at the bar, the window open onto the water.' },
    'rit.4.name':     { nl: 'Herhaal',                  en: 'Repeat' },
    'rit.4.desc':     { nl: 'Drie rondes is de praktijk. De vierde is helemaal van jou.',
                        en: 'Three rounds is the practice. The fourth is yours alone.' },

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
    'visit.lede':     { nl: 'Aan het water op het Cruquiuseiland in Amsterdam-Oost. Boek vooraf, of kom gewoon langs — spontane sessies zijn ook welkom.',
                        en: 'On the water on Cruquiuseiland in Amsterdam East. Book ahead, or just drop by — spontaneous sessions are welcome too.' },
    'visit.addr.lbl': { nl: 'Adres',                    en: 'Address' },
    'visit.addr':     { nl: 'Zeeburgerkade 1314-1316\n1019 VK Amsterdam', en: 'Zeeburgerkade 1314-1316\n1019 VK Amsterdam' },
    'visit.hrs.lbl':  { nl: 'Openingstijden',           en: 'Hours' },
    'visit.hrs.a':    { nl: 'Ma — Vr · 09:00 — 21:00',  en: 'Mon — Fri · 09:00 — 21:00' },
    'visit.hrs.b':    { nl: 'Za — Zo · 10:00 — 19:00',  en: 'Sat — Sun · 10:00 — 19:00' },
    'visit.tel.lbl':  { nl: 'Reserveren',               en: 'Reservations' },
    'visit.tel':      { nl: '020 362 1278',             en: '020 362 1278' },
    'visit.mail':     { nl: 'info@luca-amsterdam.nl',   en: 'info@luca-amsterdam.nl' },
    'visit.cta':      { nl: 'Reserveer een sessie',     en: 'Reserve a session' },

    // ─────────── FOOTER ───────────
    'foot.tag':       { nl: 'Boutique wellness aan het water. Amsterdam, sinds 2024.',
                        en: 'Boutique wellness on the water. Amsterdam, since 2024.' },
    'foot.h.exp':     { nl: 'Beleving',                 en: 'Experience' },
    'foot.h.house':   { nl: 'Huis',                     en: 'House' },
    'foot.h.reach':   { nl: 'Contact',                  en: 'Contact' },

    'foot.exp.1':     { nl: 'Sauna & IJsbad',           en: 'Sauna & ice bath' },
    'foot.exp.2':     { nl: 'Massages',                 en: 'Massages' },
    'foot.exp.3':     { nl: 'LUCA Privé',               en: 'LUCA Private' },
    'foot.exp.4':     { nl: 'Memberships',              en: 'Memberships' },

    'foot.house.1':   { nl: 'Over LUCA',                en: 'About LUCA' },
    'foot.house.2':   { nl: 'Locatie & openingstijden', en: 'Location & hours' },
    'foot.house.3':   { nl: 'Veelgestelde vragen',      en: 'FAQ' },
    'foot.house.4':   { nl: 'Huisregels',               en: 'House rules' },

    'foot.reach.1':   { nl: 'info@luca-amsterdam.nl',   en: 'info@luca-amsterdam.nl' },
    'foot.reach.2':   { nl: '020 362 1278',             en: '020 362 1278' },
    'foot.reach.3':   { nl: 'Instagram',                en: 'Instagram' },
    'foot.reach.4':   { nl: 'Nieuwsbrief',              en: 'Newsletter' },

    'foot.copy':      { nl: '© MMXXVI · LUCA Amsterdam', en: '© MMXXVI · LUCA Amsterdam' },
    'foot.place':     { nl: 'Aan het Cruquiuseiland',   en: 'On Cruquiuseiland' },

    // ─────────── RESERVE FLOW ───────────
    'r.logo':         { nl: 'LUCA',                     en: 'LUCA' },
    'r.close':        { nl: 'Sluiten ×',                en: 'Close ×' },
    'r.step.1':       { nl: 'Kies',                     en: 'Choose' },
    'r.step.2':       { nl: 'Wanneer',                  en: 'When' },
    'r.step.3':       { nl: 'Tijd',                     en: 'Time' },
    'r.step.4':       { nl: 'Gasten',                   en: 'Party' },
    'r.step.5':       { nl: 'Gegevens',                 en: 'Details' },
    'r.of':           { nl: 'van',                      en: 'of' },

    'r.back':         { nl: '← Terug',                  en: '← Back' },
    'r.continue':     { nl: 'Doorgaan →',               en: 'Continue →' },
    'r.confirm':      { nl: 'Reservering bevestigen →', en: 'Confirm reservation →' },

    // Step 1: service
    'r.s1.kicker':    { nl: 'Stap 01 van 05',           en: 'Step 01 of 05' },
    'r.s1.title.a':   { nl: 'Wat wil je',               en: 'What would you' },
    'r.s1.title.em':  { nl: 'vandaag',                  en: 'like' },
    'r.s1.title.b':   { nl: 'boeken?',                  en: 'today?' },
    'r.s1.sub':       { nl: 'Kies een sessie. Duur en (voor massages) type kun je hieronder selecteren.',
                        en: 'Choose a session. Pick duration and (for massage) type below.' },

    'r.svc.sauna.name': { nl: 'Sauna & IJsbad',         en: 'Sauna & Ice bath' },
    'r.svc.sauna.desc': { nl: 'Van warm naar koud, voor een echte kick. Inclusief gebruik van kleedkamers en faciliteiten.',
                          en: 'From warm to cold for a real kick. Includes use of changing rooms and facilities.' },
    'r.svc.massage.name': { nl: 'Massage',              en: 'Massage' },
    'r.svc.massage.desc': { nl: 'Ontspanning, Meridiaan, Cupping, Maderotherapie of Deep Tissue. Combineerbaar met sauna en ijsbad.',
                            en: 'Relaxation, Meridian, Cupping, Maderotherapy or Deep Tissue. Combinable with sauna and ice bath.' },
    'r.svc.prive.name': { nl: 'LUCA Privé',             en: 'LUCA Private' },
    'r.svc.prive.desc': { nl: 'De ruimte voor jou alleen, of met vrienden/collega\'s. Tot 7 personen.',
                          en: 'The space to yourself or with friends/colleagues. Up to 7 guests.' },
    'r.svc.buccal.name': { nl: 'Buccale massage',       en: 'Buccal massage' },
    'r.svc.buccal.desc': { nl: 'Gezichtsmassage van binnenuit de mond — kalmerend voor het zenuwstelsel, natuurlijk liftend resultaat.',
                           en: 'Facial massage from inside the mouth — calming for the nervous system, naturally lifting.' },

    'r.duration': { nl: 'Duur', en: 'Duration' },
    'r.type':     { nl: 'Type', en: 'Type' },
    'r.from':     { nl: 'vanaf', en: 'from' },
    'r.deeptissue': { nl: '+€10 voor Deep Tissue', en: '+€10 for Deep Tissue' },

    'r.type.ontspanning': { nl: 'Ontspanning',          en: 'Relaxation' },
    'r.type.meridiaan':   { nl: 'Meridiaan therapie',   en: 'Meridian therapy' },
    'r.type.cupping':     { nl: 'Cupping',              en: 'Cupping' },
    'r.type.madero':      { nl: 'Maderotherapie',       en: 'Maderotherapy' },
    'r.type.deep':        { nl: 'Deep Tissue (+€10)',   en: 'Deep Tissue (+€10)' },

    // Step 2: date
    'r.s2.kicker':    { nl: 'Stap 02 van 05',           en: 'Step 02 of 05' },
    'r.s2.title.a':   { nl: 'Wanneer',                  en: 'When would' },
    'r.s2.title.em':  { nl: 'kom je',                   en: 'you like' },
    'r.s2.title.b':   { nl: 'langs?',                   en: 'to come?' },
    'r.s2.sub':       { nl: 'Open ma t/m vr 09:00 – 21:00, za en zo 10:00 – 19:00. De stip onder elke datum laat zien hoe vol de dag is.',
                        en: 'Open Mon–Fri 09:00 – 21:00, Sat & Sun 10:00 – 19:00. The dot under each date shows how busy the day is.' },
    'r.cal.quiet':    { nl: 'Rustig',                   en: 'Quiet' },
    'r.cal.half':     { nl: 'Halfvol',                  en: 'Half full' },
    'r.cal.filling':  { nl: 'Vult op',                  en: 'Filling' },
    'r.cal.closed':   { nl: 'Gesloten',                 en: 'Closed' },

    // Step 3: time
    'r.s3.kicker.pre': { nl: 'Stap 03 van 05 · ',       en: 'Step 03 of 05 · ' },
    'r.s3.title.a':   { nl: 'Kies een',                 en: 'Pick your' },
    'r.s3.title.em':  { nl: 'moment.',                  en: 'moment.' },
    'r.s3.title.b':   { nl: '',                         en: '' },
    'r.s3.sub':       { nl: "'s Ochtends is het rustig, 's avonds drukker. We laten nooit meer dan zeven gasten tegelijk toe.",
                        en: 'Mornings are quiet, evenings busier. We never let more than seven guests in at once.' },
    'r.band.morning':   { nl: 'Ochtend',                en: 'Morning' },
    'r.band.midday':    { nl: 'Middag',                 en: 'Midday' },
    'r.band.afternoon': { nl: 'Namiddag',               en: 'Afternoon' },
    'r.band.evening':   { nl: 'Avond',                  en: 'Evening' },
    'r.band.sessions':  { nl: 'sessies',                en: 'sessions' },
    'r.mood.intimate':  { nl: 'Rustig',                 en: 'Intimate' },
    'r.mood.shared':    { nl: 'Gezellig',               en: 'Shared' },
    'r.mood.lively':    { nl: 'Druk',                   en: 'Lively' },
    'r.mood.booked':    { nl: 'Vol',                    en: 'Booked' },

    // Step 4: guests + add-ons
    'r.s4.kicker':    { nl: 'Stap 04 van 05',           en: 'Step 04 of 05' },
    'r.s4.title.a':   { nl: 'Met',                      en: 'How' },
    'r.s4.title.em':  { nl: 'hoeveel,',                 en: 'many,' },
    'r.s4.title.b':   { nl: 'en wat erbij?',            en: 'and what else?' },
    'r.s4.sub':       { nl: 'Tot zeven gasten per sessie. Extra opties zijn optioneel en kunnen ook op de dag zelf.',
                        en: 'Up to seven guests per session. Add-ons are optional and can also be arranged on the day.' },
    'r.guests':       { nl: 'Gasten',                   en: 'Guests' },
    'r.guests.max':   { nl: 'Max 7',                    en: 'Max 7' },
    'r.addons':       { nl: 'Extra\'s',                 en: 'Add-ons' },
    'r.addons.opt':   { nl: 'Optioneel',                en: 'Optional' },

    'r.addon.combo.name': { nl: 'Combineer met sauna & ijsbad', en: 'Combine with sauna & ice bath' },
    'r.addon.combo.desc': { nl: '60 minuten sauna en ijsbad voor of na je behandeling.', en: '60 min sauna & ice bath before or after your treatment.' },
    'r.addon.robe.name':  { nl: 'Badjas & slippers',    en: 'Robe & slippers' },
    'r.addon.robe.desc':  { nl: 'Linnen badjas, mee naar huis.', en: 'Linen robe, take home.' },
    'r.addon.tea.name':   { nl: 'Theeplankje',          en: 'Tea board' },
    'r.addon.tea.desc':   { nl: 'Huismelange met honing in de huiskamer.', en: 'House blend with honey in the living room.' },
    'r.addon.juice.name': { nl: 'Verse sapjes',         en: 'Fresh juice' },
    'r.addon.juice.desc': { nl: 'Twee verse sapjes uit de bar.', en: 'Two fresh juices from the bar.' },

    // Step 5: details
    'r.s5.kicker':    { nl: 'Stap 05 van 05',           en: 'Step 05 of 05' },
    'r.s5.title.a':   { nl: 'Nog een paar',             en: 'A few' },
    'r.s5.title.em':  { nl: 'gegevens.',                en: 'quick details.' },
    'r.s5.title.b':   { nl: '',                         en: '' },
    'r.s5.sub':       { nl: 'Je ontvangt één bevestigingsmail. Geen nieuwsbrieven, geen follow-ups — alleen wat nodig is.',
                        en: 'You\'ll get a single confirmation email. No newsletters, no follow-ups — only what\'s needed.' },

    'r.f.first':      { nl: 'Voornaam',                 en: 'First name' },
    'r.f.last':       { nl: 'Achternaam',               en: 'Last name' },
    'r.f.email':      { nl: 'E-mailadres',              en: 'Email' },
    'r.f.phone':      { nl: 'Telefoon',                 en: 'Phone' },
    'r.f.notes':      { nl: 'Opmerkingen voor de host', en: 'Notes for the host' },

    'r.consent':      { nl: 'Ik heb de huisregels gelezen en weet dat sessies stipt op tijd beginnen. Tot 24 uur vooraf gratis annuleren.',
                        en: 'I\'ve read the house rules and understand sessions begin precisely. Free cancellation up to 24 hours in advance.' },
    'r.consent.tos':  { nl: 'Huisregels',               en: 'House rules' },

    // Summary
    'r.sum.title':    { nl: 'Jouw ritueel',             en: 'Your ritual' },
    'r.sum.empty':    { nl: 'Nog niet gekozen',         en: 'Not yet chosen' },
    'r.sum.date':     { nl: 'Datum',                    en: 'Date' },
    'r.sum.time':     { nl: 'Tijd',                     en: 'Time' },
    'r.sum.guests':   { nl: 'Gasten',                   en: 'Guests' },
    'r.sum.addons':   { nl: 'Extra\'s',                 en: 'Add-ons' },
    'r.sum.total':    { nl: 'Totaal',                   en: 'Total' },
    'r.sum.note':     { nl: 'Onder voorbehoud. We rekenen pas na je bezoek af — of volledig bij annulering binnen 24 uur.',
                        en: 'Held on reservation. Charged only after your visit — or fully if cancelled within 24 hours.' },

    // Confirmation
    'r.ok.kicker':    { nl: 'Reservering',              en: 'Reservation' },
    'r.ok.title.a':   { nl: 'Je plek',                  en: 'Your seat' },
    'r.ok.title.em':  { nl: 'is bewaard.',              en: 'is kept.' },
    'r.ok.title.b':   { nl: '',                         en: '' },
    'r.ok.day.pre':   { nl: 'Tot ',                     en: 'See you on ' },
    'r.ok.detail.practice': { nl: 'Sessie',             en: 'Session' },
    'r.ok.detail.date':     { nl: 'Datum',              en: 'Date' },
    'r.ok.detail.time':     { nl: 'Tijd',               en: 'Time' },
    'r.ok.detail.guests':   { nl: 'Gasten',             en: 'Guests' },
    'r.ok.detail.address':  { nl: 'Adres',              en: 'Address' },
    'r.ok.sub':       { nl: 'Een bevestiging staat in je inbox. Kom een kwartier eerder — er is thee, en de host loopt de volgorde met je door. Eerder of later mag natuurlijk ook.',
                        en: 'A confirmation is in your inbox. Come fifteen minutes early — there\'s tea, and the host will walk you through. Earlier or later is welcome too.' },
    'r.ok.home':      { nl: 'Terug naar home',          en: 'Back home' },
    'r.ok.save':      { nl: 'Bewaar reservering',       en: 'Save reservation' },

    // ─────────── FUNNEL (smart hints, welcome back, trust, upsells) ───────────
    'r.welcome.h':       { nl: 'Welkom terug.',                     en: 'Welcome back.' },
    'r.welcome.b':       { nl: 'We hebben je vorige keuze nog onthouden — ga je verder waar je gebleven was?',
                           en: 'Your previous choice is saved — pick up where you left off?' },
    'r.welcome.cta':     { nl: 'Doorgaan',                          en: 'Resume' },
    'r.welcome.start':   { nl: 'Opnieuw beginnen',                  en: 'Start over' },

    'r.tip':             { nl: 'Slim idee',                         en: 'Smart tip' },
    'r.tip.dismiss':     { nl: 'Sluiten',                           en: 'Dismiss' },

    'r.hint.firstvisit.h':  { nl: 'Eerste keer bij LUCA?',          en: 'First time at LUCA?' },
    'r.hint.firstvisit.b':  { nl: 'De 60-minuten huisfavoriet is een mooie start: tijd voor drie rondes en thee tussendoor.',
                              en: 'The 60-min house favorite is a nice start: time for three rounds and tea between.' },

    'r.hint.rittenkaart.h': { nl: 'Een 5-rittenkaart bespaart je €14',
                              en: 'A 5-visit card saves you €14' },
    'r.hint.rittenkaart.b': { nl: 'Vijf sessies van 60 min voor €121 — €24,20 per keer i.p.v. €27. Een jaar geldig.',
                              en: 'Five 60-min sessions for €121 — €24.20 each instead of €27. Valid for a year.' },
    'r.hint.rittenkaart.cta': { nl: 'Bekijk rittenkaart',           en: 'See pass card' },

    'r.hint.daluren.h':     { nl: 'Op dit moment is het rustig — daluren',
                              en: 'Off-peak hours: quieter, cheaper' },
    'r.hint.daluren.b':     { nl: 'Met een 10-daluren-rittenkaart betaal je €17,90 per 60-min sessie i.p.v. €27.',
                              en: 'With a 10-visit off-peak card you pay €17.90 per 60-min session instead of €27.' },
    'r.hint.daluren.cta':   { nl: 'Naar daluren-pas',               en: 'See off-peak pass' },

    'r.hint.privesmall.h':  { nl: 'Privé voor 2 of 6 — dezelfde prijs',
                              en: 'Private for 2 or 6 — same price' },
    'r.hint.privesmall.b':  { nl: 'LUCA Privé kost €89,95 per sessie, ongeacht groepsgrootte tot 7.',
                              en: 'LUCA Private is €89.95 per session, regardless of group size up to 7.' },

    'r.hint.upgradeprive.h':{ nl: 'Met 4+ personen is Privé voordeliger',
                              en: 'With 4+ guests, Private is better value' },
    'r.hint.upgradeprive.b':{ nl: 'Boek de hele ruimte voor €89,95 i.p.v. €108 of meer aan losse plekken.',
                              en: 'Book the whole room for €89.95 instead of €108+ in separate slots.' },
    'r.hint.upgradeprive.cta': { nl: 'Wissel naar Privé',           en: 'Switch to Private' },

    'r.hint.massagecombo.h':{ nl: 'Combineer met sauna & ijsbad',   en: 'Combine with sauna & ice' },
    'r.hint.massagecombo.b':{ nl: 'Voor of na je massage — een opwarming maakt de behandeling effectiever.',
                              en: 'Before or after — warming up makes the massage more effective.' },

    'r.hint.short.h':       { nl: 'Iets meer tijd geeft veel meer ruimte',
                              en: 'A bit longer feels much more spacious' },
    'r.hint.short.b':       { nl: '30 min is genoeg voor één ronde. 60 min geeft tijd voor drie rondes — onze sweet spot.',
                              en: '30 min is one round. 60 min gives time for three — our sweet spot.' },

    'r.hint.weekend.h':     { nl: 'Weekend is vol gezelligheid',    en: 'Weekends are lively' },
    'r.hint.weekend.b':     { nl: 'Liever stiller? Doordeweekse ochtenden zijn rustig en voelen privé.',
                              en: 'Want it quieter? Weekday mornings are calm and feel private.' },

    'r.trust.cancel':       { nl: 'Tot 24u gratis annuleren',       en: 'Free cancellation up to 24h' },
    'r.trust.charge':       { nl: 'Pas na bezoek afrekenen',         en: 'Charged only after your visit' },
    'r.trust.spontaan':     { nl: 'Spontaan ook welkom',             en: 'Walk-ins welcome too' },

    'r.ok.giftcard.h':      { nl: 'Geef LUCA cadeau',                en: 'Gift LUCA' },
    'r.ok.giftcard.b':      { nl: 'Voor iedereen die wel een momentje voor zichzelf kan gebruiken.',
                              en: 'For anyone who could use a moment for themselves.' },
    'r.ok.giftcard.cta':    { nl: 'Bekijk giftcards',                en: 'See gift cards' },

    'r.ok.member.h':        { nl: 'Wordt dit jouw ritueel?',         en: 'Making this a habit?' },
    'r.ok.member.b':        { nl: 'De Gouden IJsvogel geeft je 600 daluren + 360 piekuren-minuten per maand vanaf €114,95.',
                              en: 'The Gold Kingfisher: 600 off-peak + 360 peak minutes per month from €114.95.' },
    'r.ok.member.cta':      { nl: 'Bekijk abonnementen',             en: 'See memberships' },

    'r.ok.cal':             { nl: 'Aan agenda toevoegen',            en: 'Add to calendar' },
    'r.ok.share':           { nl: 'Delen',                           en: 'Share' },
  };

  // Locale-aware date helpers
  const LOCALE = { nl: 'nl-NL', en: 'en-US' };
  function fmtDate(d, lang) {
    return d.toLocaleDateString(LOCALE[lang], { weekday: 'long', month: 'long', day: 'numeric' });
  }
  function fmtDateShort(d, lang) {
    return d.toLocaleDateString(LOCALE[lang], { weekday: 'short', month: 'short', day: 'numeric' });
  }
  function fmtWeekday(d, lang) {
    return d.toLocaleDateString(LOCALE[lang], { weekday: 'long' });
  }
  function fmtMonth(d, lang) {
    return d.toLocaleDateString(LOCALE[lang], { month: 'long' });
  }

  const NL_WEEKDAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
  const EN_WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
      const v = t(key, lang);
      if (el.dataset.i18nHtml === '1') {
        el.innerHTML = v;
      } else {
        el.textContent = v;
      }
    });
    // Inline-EN swap mode: elements with both NL content and data-en="..." attr
    document.querySelectorAll('[data-en]').forEach((el) => {
      if (!el.dataset.nl) el.dataset.nl = el.innerHTML;
      el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.nl;
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria, lang));
    });
    document.querySelectorAll('.lang-toggle button').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.lang === lang);
    });
    document.dispatchEvent(new CustomEvent('luca:lang-changed', { detail: { lang } }));
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

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.LucaI18n = { t, setLang, getLang, fmtDate, fmtDateShort, fmtWeekday, fmtMonth, weekdays: { nl: NL_WEEKDAYS, en: EN_WEEKDAYS } };
})();
