// English texts for countries.ts. Same order as the Bulgarian arrays — a test checks they stay in sync.
// Numbers and URLs live only in countries.ts.

export interface CountryText {
  slug: string;
  scope: string;
  official: string[];             // labels, same order as Country.official
  products?: Record<string, { label: string; note?: string }>;
  sectionTolls?: Record<string, { name: string; note?: string }>;
  tollInfo?: string[];
  traps: string[];
  facts: string[];
  statusNote?: string;
  pricesValidFor?: string;
  distanceBasis?: string;
}

export const EN: Record<string, CountryText> = {
  AT: {
    slug: "austria",
    scope: "All motorways (A) and expressways (S). Six sections charge a separate toll instead of the vignette.",
    official: ["ASFINAG — official online shop"],
    products: {
      "1d": { label: "1 day", note: "Not sold as a sticker." },
      "10d": { label: "10 days" },
      "2m": { label: "2 months" },
      "1y": { label: "Annual", note: "We model it as a calendar year; the official validity of the annual vignette may be longer." },
    },
    sectionTolls: {
      a10: { name: "Tauern (A10)", note: "Green lane — without trailer only." },
      a13: { name: "Brenner (A13)", note: "The whole A13 is section-tolled and needs no vignette; the A12 Inntal needs a vignette." },
      s16: { name: "Arlberg (S16)", note: "Only if you take the tunnel, not the pass road." },
      a11: { name: "Karawanks (A11), southbound", note: "Northbound the toll is paid in Slovenia (DARS)." },
      a9: { name: "Pyhrn (A9) — Bosruck and Gleinalm", note: "Separately: Bosruck €7, Gleinalm €12. Not detected automatically on the route." },
    },
    traps: [
      "The 2-month and annual vignettes bought online by a consumer are valid only from the 18th day after purchase (14-day right of withdrawal + 3 days for post). The 1-day and 10-day vignettes are valid immediately.",
      "Leaving soon and need a 2-month or annual vignette? Buy a sticker at a sales point (petrol station, border crossing) — it is valid immediately.",
      "The A13 Brenner is not covered by the vignette — it is paid separately.",
      "With a trailer or caravan: check in the official shop — we have not confirmed whether a separate vignette is needed.",
    ],
    facts: ["The digital vignette is linked to the licence plate. With an interchangeable plate one vignette covers up to three vehicles."],
  },
  CH: {
    slug: "switzerland",
    scope: "All national motorways and expressways.",
    official: ["Via — official BAZG webshop (e-vignette)"],
    products: { y: { label: "Annual (the only option)", note: "Trailers and caravans need their own vignette (except trailers towed by a motorcycle)." } },
    traps: [
      "There is only an annual vignette — CHF 40, even for a one-day transit.",
      "A vignette for a given year is valid from 1 December of the previous year to 31 January of the following year (14 months).",
      "The official price is exactly CHF 40 with no fees. Resellers may add fees but must clearly state that they are independent.",
    ],
    facts: [
      "An e-vignette from the official shop is valid immediately — Switzerland has no right of withdrawal for online purchases.",
      "Stickers are sold at post offices, petrol stations and at the border.",
      "Motorhomes over 3.5 t pay the PSVA, not the vignette.",
    ],
  },
  CZ: {
    slug: "czechia",
    scope: "Signposted tolled motorways and expressways. Required for four-wheel vehicles up to 3.5 t.",
    official: ["eDálnice — official state e-shop"],
    products: { "1d": { label: "1 day" }, "10d": { label: "10 days" }, "30d": { label: "30 days" }, "1y": { label: "1 year" } },
    traps: [
      "Motorcycles and trailers do not need a vignette.",
      "Electric cars are exempt, but foreign-registered ones must apply for the exemption on eDálnice — it is not automatic.",
      "50% discount for biomethane and CNG/LNG (not LPG) and 75% for plug-in hybrids with up to 50 g CO₂/km.",
    ],
    facts: ["The vignette is electronic and checked by licence plate."],
    pricesValidFor: "from 1 Jan 2026",
  },
  SK: {
    slug: "slovakia",
    scope: "Signposted sections of motorways and expressways.",
    official: ["eZnamka — Národná diaľničná spoločnosť"],
    products: {
      "1d": { label: "1 day", note: "Valid until 24:00 on the chosen day." },
      "10d": { label: "10 days" }, "30d": { label: "30 days" }, "365d": { label: "365 days" },
    },
    traps: [
      "A trailer needs its own vignette only if the combination exceeds 3.5 t — then the price doubles.",
      "Check the start date before paying — it cannot be changed afterwards.",
    ],
    facts: [
      "A 10- or 30-day vignette bought in December stays valid into January until it expires.",
      "Motorcycles: check on eznamka.sk — we have not confirmed the rules.",
    ],
  },
  HU: {
    slug: "hungary",
    scope: "Tolled motorways and expressways (national or county e-vignette).",
    official: ["E-vignette — official shop", "Magyar Közút — Toll Division (information)"],
    products: {
      "1d": { label: "Daily" }, "10d": { label: "Weekly (10 days)" }, "1m": { label: "Monthly" }, "1y": { label: "Annual national" },
    },
    traps: [
      "Official warning of 22 Sep 2026: some websites only “order” the vignette in their own name and resell it at an unfavourable exchange rate, sometimes with the wrong validity and a monthly subscription. Buy only from an official seller.",
      "The Hungarian “weekly” vignette actually lasts 10 days.",
      "Category D1 is only for cars with up to 7 seats (M1/M1G). N1 vans and cars with 8+ seats are D2 — more expensive.",
    ],
    facts: [
      "D1 also covers the car's trailer.",
      "Annual county vignette: HUF 7,190 per county (2026).",
      "From 1 Jan 2027 prices rise by 1.3% (D1: daily 5,630, 10 days 6,990, monthly 11,320, annual 62,560 HUF).",
    ],
    pricesValidFor: "1 Jan – 31 Dec 2026",
  },
  SI: {
    slug: "slovenia",
    scope: "Motorways and expressways. The Karawanks tunnel is tolled separately.",
    official: ["DARS — e-vignette"],
    products: { "7d": { label: "7 days" }, "1m": { label: "1 month" }, "1y": { label: "1 year" } },
    traps: [
      "The Karawanks tunnel (to Austria) is not included in the vignette.",
      "Search engines show many sites with names like “e-vinjeta” that sell at a mark-up. The official one is evinjeta.dars.si.",
    ],
    facts: [],
    statusNote: "The official DARS site was unavailable when we checked. Prices come from several secondary sources and must be confirmed on evinjeta.dars.si.",
  },
  RO: {
    slug: "romania",
    scope: "The entire national road network (motorways, expressways, European and national roads) outside cities.",
    official: ["eToll — CNAIR (official)"],
    products: { "1d": { label: "1 day" }, "10d": { label: "10 days" }, "30d": { label: "30 days" }, "60d": { label: "60 days" }, "12m": { label: "12 months" } },
    traps: [
      "Since 1 Oct 2026 the price depends on the car's Euro emission class — older cars pay more.",
      "The site Google often shows first (roviniete.ro) is an authorised private distributor, not the state. CNAIR's official channel is etoll.ro (and the TollRo app).",
      "The Fetești–Cernavodă bridge (A2) has a separate toll — the vignette does not cover it.",
    ],
    facts: ["A trailer does not need a separate vignette.", "Can be bought up to 30 days in advance."],
    statusNote: "The tariff comes from an authorised distributor citing the official order; the CNAIR site did not show the table.",
    pricesValidFor: "from 1 Oct 2026 (MTI Order 888/2026)",
  },
  BG: {
    slug: "bulgaria",
    scope: "The national road network (motorways and class I, II and III roads) outside built-up areas.",
    official: ["BGTOLL — official shop"],
    products: {
      "1d": { label: "Daily", note: "With a selectable start time." },
      we: { label: "Weekend", note: "Can only start on a Friday." },
      "7d": { label: "Weekly" }, "1m": { label: "Monthly" }, "3m": { label: "Quarterly" }, "1y": { label: "Annual" },
    },
    traps: [
      "The weekend vignette starts only on a Friday; the exact end time is shown at purchase.",
      "A car with a trailer weighing over 3.5 t in total also needs a separate trailer vignette.",
      "Buy on web.bgtoll.bg — resellers add fees.",
    ],
    facts: ["Can be bought up to 30 days in advance."],
  },
  MD: {
    slug: "moldova",
    scope: "For foreign-registered vehicles on national roads.",
    official: ["e-Vinieta — National Roads Administration"],
    products: { "7d": { label: "7 days" }, "15d": { label: "15 days" }, "30d": { label: "30 days" }, "90d": { label: "90 days" }, "180d": { label: "180 days" } },
    traps: [],
    facts: ["There is also an option for over 180 days — €180."],
    statusNote: "Prices are from the official site; check there exactly who must pay and on which roads.",
  },
  HR: {
    distanceBasis: "Derived from HAC's official prices: A1 Zagreb–Split €26.40 (~380 km), Zagreb–Rijeka €10.10.",
    slug: "croatia",
    scope: "Motorways — toll by section driven, paid at toll plazas.",
    official: ["HAC — toll rates", "HAC — map and calculator"],
    tollInfo: ["Cars are category I. Pay in cash, by card or with an ENC device (€15).", "Example: A1 Zagreb–Split €26.40; Zagreb–Rijeka €10.10."],
    traps: [], facts: [],
  },
  RS: {
    distanceBasis: "From secondary sources: Belgrade–Preševo RSD 2,060 (~€18, ~400 km). The official tariff is published only as an image.",
    slug: "serbia",
    scope: "Motorways — toll by section, at plazas or with an ENP tag.",
    official: ["Putevi Srbije — tariffs and calculator"],
    tollInfo: ["Cars are category I. Tariff in force since 1 Jul 2026.", "The official calculator shows the price between two plazas in RSD and EUR."],
    traps: [], facts: [],
  },
  MK: {
    distanceBasis: "Derived from official per-plaza prices (€0.50–2.00 per plaza); the split by section is approximate.",
    slug: "north-macedonia",
    scope: "Individual toll plazas on the motorways.",
    official: ["Public Enterprise for State Roads — prices by plaza"],
    tollInfo: ["Cars are category IB. Pay in denars, euros or by card.", "Plazas (car, €): Romanovce 1.00 · Petrovec 1.00 · Miladinovci 1.00 · Tetovo 0.50 · Sopot 1.50 · Demir Kapija 1.50 · Gevgelija 2.00."],
    traps: [], facts: [],
  },
  GR: {
    distanceBasis: "Derived from official Olympia Odos and Nea Odos prices (Athens–Patras, Athens–Lamia, ~€0.05–0.06/km). We have no prices for Egnatia Odos.",
    slug: "greece",
    scope: "Motorways — toll plazas run by different concessionaires.",
    official: ["Olympia Odos — prices", "Nea Odos — prices", "Egnatia Odos"],
    tollInfo: [
      "Olympia Odos (Athens–Patras), car, from 1 Jan 2026: Elefsina 2.50 · Isthmos 2.10 · Kiato 2.70 · Elaionas 3.80 · Rio 2.70 · Patras 3.60 €.",
      "Nea Odos (Athens–Lamia): Afidnes 3.90 · Thiva 4.55 · Tragana 4.55 €.",
      "Egnatia Odos has been run by a new concessionaire since 31 Dec 2025.",
    ],
    traps: [], facts: [],
  },
  TR: {
    distanceBasis: "Official KGM tariff from 1 Jan 2026: Edirne–Mahmutbey (211.9 km) 168 TL for a car. The Istanbul bridges are extra (59 TL).",
    slug: "turkey",
    scope: "Motorways (O-) and bridges — electronic only (HGS), no cash booths.",
    official: ["KGM — highways agency", "KGM — calculator"],
    tollInfo: [
      "You need an HGS account with credit. Open it at the border crossing, at PTT or at a bank.",
      "Unpaid passage — 15 days to pay, otherwise you may be turned back at the border on exit.",
    ],
    traps: ["Without HGS you cannot pay on the spot — get it when entering the country."],
    facts: [],
  },
  IT: {
    distanceBasis: "From secondary sources: €0.05–0.12/km depending on the section; prices up 1.5% from 1 Jan 2026.",
    slug: "italy",
    scope: "Most motorways — ticket on entry, pay on exit.",
    official: ["Autostrade per l'Italia"],
    tollInfo: ["White lanes — cash; blue — cards/Viacard; yellow — Telepass and other devices."],
    traps: ["Don't enter the yellow “Telepass” lane without a device."],
    facts: [],
  },
  FR: {
    slug: "france",
    scope: "Most motorways — toll by section.",
    official: ["Autoroutes.fr"],
    tollInfo: ["Some sections are barrier-free (“flux libre”) — pay online within a few days after passing."],
    traps: [], facts: [],
    statusNote: "The official site was unavailable when we checked.",
  },
  PT: {
    distanceBasis: "Derived from 2026 prices: A1 Lisbon–Porto €25.05 (~300 km), A2 Lisbon–Algarve €23.80 (~240 km). Plus EasyToll fees on electronic-only sections.",
    slug: "portugal",
    scope: "Motorways with barriers and electronic-only sections.",
    official: ["Infraestruturas de Portugal — tolls for foreign cars", "Calculator"],
    tollInfo: ["On electronic-only sections foreign cars must register a payment method: EasyToll (€1 + €0.32 per trip, 30 days), Tollcard or Via Verde."],
    traps: [], facts: [],
  },
  DE: {
    slug: "germany",
    scope: "No vignette and no motorway toll for cars.",
    official: [],
    tollInfo: ["Only lorries over 3.5 t pay a road toll (Toll Collect)."],
    traps: [], facts: [],
  },
  DK: {
    slug: "denmark",
    scope: "No vignette. The Storebælt and Øresund bridges are tolled.",
    official: ["Øresundsbron", "Storebælt"],
    sectionTolls: {
      oresund: { name: "Øresund Bridge (Copenhagen–Malmö)", note: "Car up to 6 m, online ticket; DKK 470 at the toll station. From 1 Jan 2027: 428 / 480 DKK." },
      storebaelt: { name: "Storebælt Bridge", note: "Car 3–6 m, card/cash; DKK 205 with automatic payment." },
    },
    traps: [], facts: [],
  },
  NO: {
    slug: "norway",
    scope: "Automatic toll points (AutoPASS) on many roads and in cities.",
    official: ["AutoPASS — foreign vehicles"],
    tollInfo: ["Register with Epass24 or sign up with a tag issuer (20% discount); otherwise you also pay a register lookup fee."],
    traps: [], facts: [],
  },
};

/** Names of other countries a route may cross. */
export const OTHER_COUNTRY_NAMES_EN: Record<string, string> = {
  "528": "Netherlands", "056": "Belgium", "442": "Luxembourg", "616": "Poland", "040": "Austria", "724": "Spain",
  "752": "Sweden", "070": "Bosnia and Herzegovina", "499": "Montenegro", "008": "Albania", "804": "Ukraine", "438": "Liechtenstein",
  "826": "United Kingdom", "372": "Ireland", "246": "Finland", "233": "Estonia", "428": "Latvia", "440": "Lithuania", "112": "Belarus",
};
