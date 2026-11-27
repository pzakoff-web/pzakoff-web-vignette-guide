import type { Country, Product, Vehicle, VehicleKind } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Всички цени са от официалните сайтове, проверени на checkedAt.
// Подробни бележки и цитати: ../../RESEARCH.md
// ─────────────────────────────────────────────────────────────────────────────

/** Една цена за кола, мотор и кола с ремарке (null = не се продава / непотвърдено). */
const by = (prices: Partial<Record<VehicleKind, number | null>>) => (v: Vehicle) => prices[v.kind] ?? null;

const d = (days: number) => ({ type: "days" as const, days });
const m = (months: number) => ({ type: "months" as const, months });

// ── Австрия ──
const AT_STRECKENMAUT = "https://shop.asfinag.at/de/maut-produkte/digitale-streckenmaut/";
const at: Country = {
  code: "AT", isoNumeric: "040", slug: "avstriya", name: "Австрия", nameEn: "Austria", flag: "🇦🇹",
  system: "mixed", currency: "EUR",
  scope: "Всички магистрали (A) и скоростни пътища (S). Шест участъка имат отделна такса вместо винетка.",
  official: [
    { label: "ASFINAG — официален онлайн магазин", url: "https://shop.asfinag.at" },
  ],
  products: [
    { id: "1d", label: "1 ден", validity: d(1), price: by({ car: 9.6, moto: 3.8, carTrailer: null }), note: "Не се продава като стикер." },
    { id: "10d", label: "10 дни", validity: d(10), price: by({ car: 12.8, moto: 5.1, carTrailer: null }) },
    { id: "2m", label: "2 месеца", validity: m(2), price: by({ car: 32, moto: 12.8, carTrailer: null }), onlineConsumerDelayDays: 18 },
    { id: "1y", label: "Годишна", validity: { type: "calendarYear" }, price: by({ car: 106.8, moto: 42.7, carTrailer: null }), onlineConsumerDelayDays: 18,
      note: "Моделираме я като календарна година; официалният период на годишната винетка може да е по-дълъг." },
  ],
  sectionTolls: [
    { id: "a10", name: "Тауерн (A10)", road: "A10", priceCar: 15, point: [47.097, 13.635], radiusKm: 6, buyUrl: AT_STRECKENMAUT, note: "Зелената лента — само без ремарке." },
    { id: "a13", name: "Бренер (A13)", road: "A13", priceCar: 12.5, point: [47.188, 11.405], radiusKm: 4, buyUrl: AT_STRECKENMAUT, note: "Цялата A13 е с отделна такса и без винетка; A12 Инталер изисква винетка." },
    { id: "s16", name: "Арлберг (S16)", road: "S16", priceCar: 13, point: [47.13, 10.19], radiusKm: 5, buyUrl: AT_STRECKENMAUT, note: "Само ако минавате през тунела, не през прохода." },
    { id: "a11", name: "Караванке (A11), посока юг", road: "A11", priceCar: 9, point: [46.5, 14.03], radiusKm: 5, buyUrl: AT_STRECKENMAUT, note: "В посока север таксата се плаща в Словения (DARS)." },
    { id: "a9", name: "Пирн (A9) — Bosruck и Gleinalm", road: "A9", priceCar: 19, buyUrl: AT_STRECKENMAUT, note: "Поотделно: Bosruck 7 €, Gleinalm 12 €. Не се разпознава автоматично по маршрута." },
  ],
  traps: [
    "Двумесечната и годишната винетка, купени онлайн от физическо лице, важат чак от 18-ия ден след покупката (14 дни право на отказ + 3 дни поща). 1- и 10-дневната важат веднага.",
    "Ако тръгвате скоро и ви трябва 2-месечна или годишна — купете стикер от пункт за продажба (бензиностанция, граничен пункт); той важи веднага.",
    "A13 Бренер не се покрива от винетката — плаща се отделно.",
    "С ремарке или каравана: проверете в официалния магазин — не потвърдихме дали е нужна отделна винетка.",
  ],
  facts: [
    "Дигиталната винетка е към регистрационния номер. При сменяем номер една винетка важи за до три МПС.",
  ],
  sources: [
    "https://shop.asfinag.at/de/produkte/digitale-vignette/",
    "https://shop.asfinag.at/de/maut-produkte/digitale-vignette/jahres-vignette-pkw",
    "https://shop.asfinag.at/de/maut-produkte/digitale-vignette/?type=Motorbike",
    AT_STRECKENMAUT,
  ],
  checkedAt: "2026-11-26", status: "verified",
};

// ── Швейцария ──
const ch: Country = {
  code: "CH", isoNumeric: "756", slug: "shveytsariya", name: "Швейцария", nameEn: "Switzerland", flag: "🇨🇭",
  system: "vignette", currency: "CHF",
  scope: "Всички национални магистрали и скоростни пътища.",
  official: [{ label: "Via — официален уебшоп на BAZG (е-винетка)", url: "https://via.admin.ch/shop/dashboard" }],
  products: [
    { id: "y", label: "Годишна (единствен вариант)", validity: { type: "swissYear" },
      price: by({ car: 40, moto: 40, carTrailer: 80 }),
      note: "Ремаркетата и караваните плащат своя винетка (освен ремарке към мотор)." },
  ],
  traps: [
    "Има само годишна винетка — 40 CHF, дори за един ден транзит.",
    "Винетката за дадена година важи от 1 декември на предходната до 31 януари на следващата година (14 месеца).",
    "Официалната цена е точно 40 CHF без такси. Посредниците имат право да добавят такси, но трябва ясно да заявят, че са независими.",
  ],
  facts: [
    "Е-винетката от официалния магазин важи веднага — в Швейцария няма право на отказ при онлайн покупка.",
    "Стикер се продава в пощите, бензиностанциите и на границата.",
    "Кемпери над 3,5 t плащат PSVA, а не винетка.",
  ],
  sources: ["https://www.bazg.admin.ch/en/faq-vignette-and-e-vignette-purchase"],
  checkedAt: "2026-11-26", status: "verified",
};

// ── Чехия ──
const czPrice = (std: number, cng: number, phev: number) => (v: Vehicle) => {
  if (v.kind === "moto") return null;
  if (v.powertrain === "electric") return 0;
  return v.powertrain === "cng" ? cng : v.powertrain === "phev" ? phev : std;
};
const cz: Country = {
  code: "CZ", isoNumeric: "203", slug: "chehiya", name: "Чехия", nameEn: "Czechia", flag: "🇨🇿",
  system: "vignette", currency: "CZK",
  scope: "Обозначените платени магистрали и скоростни пътища. Задължение за 4-колесни МПС до 3,5 t.",
  official: [{ label: "eDálnice — държавен онлайн магазин", url: "https://edalnice.gov.cz/en/" }],
  products: [
    { id: "1d", label: "1 ден", validity: d(1), price: czPrice(230, 110, 50) },
    { id: "10d", label: "10 дни", validity: d(10), price: czPrice(300, 150, 70) },
    { id: "30d", label: "30 дни", validity: d(30), price: czPrice(480, 240, 120) },
    { id: "1y", label: "1 година", validity: d(365), price: czPrice(2570, 1280, 640) },
  ],
  traps: [
    "Мотоциклетите и ремаркетата не плащат винетка.",
    "Електромобилите са освободени, но при чужда регистрация трябва да подадете заявление за освобождаване на eDálnice — не става автоматично.",
    "Отстъпка 50% за биометан и CNG/LNG (не LPG) и 75% за plug-in хибриди с до 50 g CO₂/km.",
  ],
  facts: ["Винетката е електронна, проверява се по регистрационния номер."],
  sources: ["https://edalnice.gov.cz/en/price-list", "https://edalnice.gov.cz/en/"],
  checkedAt: "2026-11-26", status: "verified", pricesValidFor: "от 1.1.2026",
};

// ── Словакия ──
const sk: Country = {
  code: "SK", isoNumeric: "703", slug: "slovakiya", name: "Словакия", nameEn: "Slovakia", flag: "🇸🇰",
  system: "vignette", currency: "EUR",
  scope: "Обозначените участъци от магистрали и скоростни пътища.",
  official: [{ label: "eZnamka — Národná diaľničná spoločnosť", url: "https://eznamka.sk/en" }],
  products: [
    { id: "1d", label: "1 ден", validity: d(1), price: by({ car: 8.1, carTrailer: 16.2 }), note: "Важи до 24:00 на избрания ден." },
    { id: "10d", label: "10 дни", validity: d(10), price: by({ car: 10.8, carTrailer: 21.6 }) },
    { id: "30d", label: "30 дни", validity: d(30), price: by({ car: 17.1, carTrailer: 34.2 }) },
    { id: "365d", label: "365 дни", validity: d(365), price: by({ car: 90, carTrailer: 180 }) },
  ],
  traps: [
    "Ремаркето плаща отделна винетка само ако композицията е над 3,5 t — тогава цената е двойна.",
    "Проверете началната дата преди плащане — после не се сменя.",
  ],
  facts: [
    "Купена през декември 10- или 30-дневна винетка продължава да важи и през януари до изтичането си.",
    "За мотоциклети: проверете на eznamka.sk — не потвърдихме правилата.",
  ],
  sources: ["https://eznamka.sk/en/evignettes/types-and-prices", "https://eznamka.sk/en"],
  checkedAt: "2026-11-26", status: "verified",
};

// ── Унгария ──
const hu: Country = {
  code: "HU", isoNumeric: "348", slug: "ungariya", name: "Унгария", nameEn: "Hungary", flag: "🇭🇺",
  system: "vignette", currency: "HUF",
  scope: "Платените магистрали и скоростни пътища (национална или окръжна е-матрица).",
  official: [
    { label: "Е-матрица — официален магазин", url: "https://ematrica.nemzetiutdij.hu/en/vignette-purchase" },
    { label: "Magyar Közút — Útdíj (информация)", url: "https://nemzetiutdij.hu/en" },
  ],
  products: [
    { id: "1d", label: "Дневна", validity: d(1), price: by({ car: 5550, moto: 2770, carTrailer: 5550 }) },
    { id: "10d", label: "Седмична (10 дни)", validity: d(10), price: by({ car: 6900, moto: 3450, carTrailer: 6900 }) },
    { id: "1m", label: "Месечна", validity: m(1), price: by({ car: 11170, moto: 5590, carTrailer: 11170 }) },
    { id: "1y", label: "Годишна национална", validity: { type: "calendarYear" }, price: by({ car: 61760, moto: 61760, carTrailer: 61760 }) },
  ],
  traps: [
    "Официално предупреждение от 22.09.2026: сайтове само „поръчват“ винетката от свое име, препродават я с неизгоден курс, понякога с грешен срок и с месечен абонамент. Купувайте само от официален продавач.",
    "„Седмичната“ винетка в Унгария всъщност е за 10 дни.",
    "Категория D1 е само за коли с до 7 места (M1/M1G). Бусовете N1 и колите с 8+ места са D2 — по-скъпи.",
  ],
  facts: [
    "D1 покрива и ремаркето на колата.",
    "Окръжна годишна винетка: 7 190 HUF за окръг (2026).",
    "От 1.1.2027 цените се вдигат с 1,3% (D1: дневна 5 630, 10 дни 6 990, месечна 11 320, годишна 62 560 HUF).",
  ],
  sources: [
    "https://nemzetiutdij.hu/api/uploads/e_matrica_arak_2026_pdf_611db0ecc1.pdf",
    "https://nemzetiutdij.hu/hu/e-matrica/dijak/e-matrica-dij-es-jarmukategoriak",
    "https://nemzetiutdij.hu/en/news/attention-please-purchase-your-e-vignette-only-from-an-authorised-retailer",
    "https://nemzetiutdij.hu/en/news/the-2027-e-vignette-prices-are-now-available",
  ],
  checkedAt: "2026-11-26", status: "verified", pricesValidFor: "1.1.–31.12.2026",
};

// ── Словения (официалният сайт беше недостъпен) ──
const si: Country = {
  code: "SI", isoNumeric: "705", slug: "sloveniya", name: "Словения", nameEn: "Slovenia", flag: "🇸🇮",
  system: "vignette", currency: "EUR",
  scope: "Магистрали и скоростни пътища. Тунел Караванке — отделна такса.",
  official: [{ label: "DARS — е-винетка", url: "https://evinjeta.dars.si/en" }],
  products: [
    { id: "7d", label: "7 дни", validity: d(7), price: by({ car: 16 }) },
    { id: "1m", label: "1 месец", validity: m(1), price: by({ car: 32 }) },
    { id: "1y", label: "1 година", validity: d(365), price: by({ car: 117.5 }) },
  ],
  traps: [
    "Тунелът Караванке (към Австрия) не е включен във винетката.",
    "В търсачките има много сайтове с имена като „e-vinjeta“, които продават с надценка. Официалният е evinjeta.dars.si.",
  ],
  facts: [],
  sources: [],
  checkedAt: "2026-11-26", status: "unverified",
  statusNote: "Официалният сайт на DARS беше недостъпен при проверката. Цените са от няколко вторични източника и трябва да се сверят на evinjeta.dars.si.",
};

// ── Румъния ──
const roPrice = (el: number, e6: number, e45: number, e03: number) => (v: Vehicle) => {
  if (v.kind === "moto") return null;
  if (v.powertrain === "electric") return el;
  return v.euroClass === "euro6" ? e6 : v.euroClass === "euro4_5" ? e45 : e03;
};
const ro: Country = {
  code: "RO", isoNumeric: "642", slug: "rumaniya", name: "Румъния", nameEn: "Romania", flag: "🇷🇴",
  system: "vignette", currency: "RON",
  scope: "Цялата национална пътна мрежа (магистрали, скоростни, европейски и национални пътища) извън градовете.",
  official: [
    { label: "eToll — CNAIR (официален)", url: "https://www.etoll.ro" },
  ],
  products: [
    { id: "1d", label: "1 ден", validity: d(1), price: roPrice(20, 22, 26, 29) },
    { id: "10d", label: "10 дни", validity: d(10), price: roPrice(27, 30, 35, 39) },
    { id: "30d", label: "30 дни", validity: d(30), price: roPrice(43, 48, 55, 62) },
    { id: "60d", label: "60 дни", validity: d(60), price: roPrice(68, 76, 87, 99) },
    { id: "12m", label: "12 месеца", validity: m(12), price: roPrice(228, 254, 292, 330) },
  ],
  traps: [
    "От 1.10.2026 цената зависи от екокласата (Евро) на колата — по-старите плащат повече.",
    "Сайтът, който Google често показва първи (roviniete.ro), е упълномощен частен дистрибутор, не държавата. Официалният канал на CNAIR е etoll.ro (и приложението TollRo).",
    "Отделна такса за моста Фетещ–Черна вода (A2) — винетката не я покрива.",
  ],
  facts: ["Ремаркето не изисква отделна винетка.", "Може да се купи до 30 дни предварително."],
  sources: ["https://www.etoll.ro", "https://www.roviniete.ro/ro/info/rovinieta-pret", "https://www.roviniete.ro/ro/intrebari-frecvente/rovinieta"],
  checkedAt: "2026-11-26", status: "partial", pricesValidFor: "от 1.10.2026 (Заповед МТИ 888/2026)",
  statusNote: "Тарифата е от упълномощен дистрибутор с позоваване на официалната заповед; сайтът на CNAIR не показа таблицата.",
};

// ── България ──
const bgPrice = (car: number) => by({ car, carTrailer: car * 2 });
const bg: Country = {
  code: "BG", isoNumeric: "100", slug: "balgariya", name: "България", nameEn: "Bulgaria", flag: "🇧🇬",
  system: "vignette", currency: "EUR",
  scope: "Републиканската пътна мрежа (магистрали и пътища от I, II и III клас) извън населените места.",
  official: [{ label: "BGTOLL — официален магазин", url: "https://web.bgtoll.bg" }],
  products: [
    { id: "1d", label: "Дневна", validity: d(1), price: bgPrice(5.3), note: "С избираем начален час." },
    { id: "we", label: "Уикенд", validity: { type: "weekend" }, price: bgPrice(6.6), note: "Може да започне само в петък." },
    { id: "7d", label: "Седмична", validity: d(7), price: bgPrice(10) },
    { id: "1m", label: "Месечна", validity: m(1), price: bgPrice(19.9) },
    { id: "3m", label: "Тримесечна", validity: m(3), price: bgPrice(35.9) },
    { id: "1y", label: "Годишна", validity: m(12), price: bgPrice(64.5) },
  ],
  traps: [
    "Уикенд винетката започва само в петък; точния краен час виждате при покупката.",
    "Кола с ремарке с общо тегло над 3,5 t плаща и отделна винетка за ремаркето.",
    "Купувайте от web.bgtoll.bg — посредниците добавят такси.",
  ],
  facts: ["Може да се купи до 30 дни предварително."],
  sources: ["https://web.bgtoll.bg/Evignette/ValidityPeriod?vignetteVehicleTypeID=1", "https://web.bgtoll.bg/Evignette/ValidityPeriod?vignetteVehicleTypeID=2"],
  checkedAt: "2026-11-26", status: "verified",
};

// ── Молдова ──
const md: Country = {
  code: "MD", isoNumeric: "498", slug: "moldova", name: "Молдова", nameEn: "Moldova", flag: "🇲🇩",
  system: "vignette", currency: "EUR",
  scope: "За МПС с чужда регистрация по националните пътища.",
  official: [{ label: "e-Vinieta — Администрация на пътищата", url: "https://vinieta.gov.md" }],
  products: [
    { id: "7d", label: "7 дни", validity: d(7), price: by({ car: 4, carTrailer: 4 }) },
    { id: "15d", label: "15 дни", validity: d(15), price: by({ car: 8, carTrailer: 8 }) },
    { id: "30d", label: "30 дни", validity: d(30), price: by({ car: 16, carTrailer: 16 }) },
    { id: "90d", label: "90 дни", validity: d(90), price: by({ car: 45, carTrailer: 45 }) },
    { id: "180d", label: "180 дни", validity: d(180), price: by({ car: 85, carTrailer: 85 }) },
  ],
  traps: [],
  facts: ["Има и вариант над 180 дни — 180 €."],
  sources: ["https://vinieta.gov.md/Vignette/TariffPositions?vehicleTypeId=4"],
  checkedAt: "2026-11-26", status: "partial",
  statusNote: "Цените са от официалния сайт; кой точно плаща и по кои пътища — проверете там.",
};

// ── Държави с такса на километър / мостове ──
const toll = (c: Omit<Country, "system"> & { system?: Country["system"] }): Country => ({ system: "toll", ...c });

const hr = toll({
  code: "HR", isoNumeric: "191", slug: "harvatiya", name: "Хърватия", nameEn: "Croatia", flag: "🇭🇷", currency: "EUR",
  scope: "Магистралите — такса според изминатия участък, плаща се на пункт.",
  official: [{ label: "HAC — тарифи", url: "https://www.hac.hr/en/toll/toll-rates" }, { label: "HAC — карта и калкулатор", url: "https://karta.hac.hr" }],
  tollInfo: ["Колата е категория I. Плащане в брой, с карта или с ENC устройство (15 €).", "Пример: A1 Загреб–Сплит 26,40 €; Загреб–Риека 10,10 €."],
  distanceToll: { refPattern: "^[AАΑ]\\d", ratePerKm: 0.07, currency: "EUR", low: 0.85, high: 1.15, quality: "derived",
    basis: "Изведено от официалните цени на HAC: A1 Загреб–Сплит 26,40 € (~380 km), Загреб–Риека 10,10 €.",
    sources: ["https://www.hac.hr/en/toll/toll-rates/a1"] },
  traps: [], facts: [], sources: ["https://www.hac.hr/en/toll/toll-rates/a1", "https://www.hac.hr/en/toll/faq"],
  checkedAt: "2026-11-26", status: "partial",
});
const rs = toll({
  code: "RS", isoNumeric: "688", slug: "sarbiya", name: "Сърбия", nameEn: "Serbia", flag: "🇷🇸", currency: "EUR",
  scope: "Магистралите — такса според участъка, на пункт или с ENP таг.",
  official: [{ label: "Putevi Srbije — ценоразпис и калкулатор", url: "https://www.putevi-srbije.rs/index.php/категоризација-возила-ценовник-путарине" }],
  tollInfo: ["Колата е категория I. Ценоразписът е в сила от 1.7.2026.", "Калкулаторът на официалния сайт показва цената между два пункта в RSD и EUR."],
  distanceToll: { refPattern: "^[AАΑ]\\d", ratePerKm: 0.045, currency: "EUR", low: 0.65, high: 1.25, quality: "secondary",
    basis: "По вторични източници: Белград–Прешево 2 060 RSD (~18 €, ~400 km). Официалният ценоразпис е само като изображение.",
    sources: ["https://www.putevi-srbije.rs/index.php/en/kategorizacija-vozila-cenovnik-putarine-2"] },
  traps: [], facts: [], sources: ["https://www.putevi-srbije.rs"], checkedAt: "2026-11-26", status: "partial",
});
const mk = toll({
  code: "MK", isoNumeric: "807", slug: "severna-makedoniya", name: "Северна Македония", nameEn: "North Macedonia", flag: "🇲🇰", currency: "EUR",
  scope: "Отделни пунктове по магистралите.",
  official: [{ label: "Държавни пътища — цени по пунктове", url: "https://roads.org.mk/patarini/cenovnik-po-delnici/" }],
  tollInfo: ["Колата е категория IB. Плащане в денари, евро или с карта.", "Пунктове (кола, €): Романовци 1,00 · Петровец 1,00 · Миладиновци 1,00 · Тетово 0,50 · Сопот 1,50 · Демир Капия 1,50 · Гевгелия 2,00."],
  distanceToll: { refPattern: "^[AАΑ]\\d", ratePerKm: 0.04, currency: "EUR", low: 0.7, high: 1.3, quality: "derived",
    basis: "Изведено от официалните цени по пунктове (0,50–2,00 € на пункт); разпределението по отсечки е приблизително.",
    sources: ["https://roads.org.mk/patarini/cenovnik-po-delnici/"] },
  traps: [], facts: [], sources: ["https://roads.org.mk/patarini/cenovnik-po-delnici/", "https://roads.org.mk/patarini/nachin-na-plakjanje/"],
  checkedAt: "2026-11-26", status: "partial",
});
const gr = toll({
  code: "GR", isoNumeric: "300", slug: "gartsiya", name: "Гърция", nameEn: "Greece", flag: "🇬🇷", currency: "EUR",
  scope: "Магистралите — пунктове на различни концесионери.",
  official: [
    { label: "Olympia Odos — цени", url: "https://www.olympiaodos.gr/Diodia-OLYMPIA-PASS/Times-diodion/" },
    { label: "Nea Odos — цени", url: "https://www.neaodos.gr/highways/tolls/" },
    { label: "Егнатия Одос", url: "https://egnatia.eu" },
  ],
  tollInfo: [
    "Olympia Odos (Атина–Патра), кола, от 1.1.2026: Елевсина 2,50 · Истмос 2,10 · Киато 2,70 · Елеонас 3,80 · Рио 2,70 · Патра 3,60 €.",
    "Nea Odos (Атина–Ламия): Афидне 3,90 · Тива 4,55 · Трагана 4,55 €.",
    "Егнатия Одос се управлява от нов концесионер от 31.12.2025.",
  ],
  distanceToll: { refPattern: "^[AАΑ]\\d", ratePerKm: 0.058, currency: "EUR", low: 0.7, high: 1.2, quality: "derived",
    basis: "Изведено от официалните цени на Olympia Odos и Nea Odos (Атина–Патра, Атина–Ламия, ~0,05–0,06 €/km). За Егнатия Одос нямаме цени.",
    sources: ["https://www.olympiaodos.gr/Diodia-OLYMPIA-PASS/Times-diodion/", "https://www.neaodos.gr/highways/tolls/"] },
  traps: [], facts: [], sources: ["https://www.olympiaodos.gr/Diodia-OLYMPIA-PASS/Times-diodion/", "https://www.neaodos.gr/highways/tolls/", "https://egnatia.eu"],
  checkedAt: "2026-11-26", status: "partial",
});
const tr = toll({
  code: "TR", isoNumeric: "792", slug: "turtsiya", name: "Турция", nameEn: "Turkey", flag: "🇹🇷", currency: "TRY",
  scope: "Магистрали (O-) и мостове — само електронно (HGS), без каси.",
  official: [{ label: "KGM — пътна агенция", url: "https://www.kgm.gov.tr" }, { label: "KGM — калкулатор", url: "https://vatandas.kgm.gov.tr/Toll" }],
  tollInfo: [
    "Нужна е HGS сметка с баланс. Открива се на граничния пункт, в PTT или в банка.",
    "Неплатено преминаване — 15 дни за плащане, иначе може да ви върнат на границата при излизане.",
  ],
  distanceToll: { refPattern: "^O-?\\d", ratePerKm: 0.79, currency: "TRY", low: 0.8, high: 1.3, quality: "official",
    basis: "Официална тарифа на KGM от 1.1.2026: Одрин–Махмутбей (211,9 km) 168 TL за кола. Мостовете в Истанбул — отделно (59 TL).",
    sources: ["https://www.kgm.gov.tr/Sayfalar/KGM/SiteTr/Otoyollar/UcretlerYeni.aspx"] },
  traps: ["Без HGS не можете да платите на място — купете я на влизане в страната."],
  facts: [], sources: ["https://www.kgm.gov.tr"], checkedAt: "2026-11-26", status: "partial",
});
const it = toll({
  code: "IT", isoNumeric: "380", slug: "italiya", name: "Италия", nameEn: "Italy", flag: "🇮🇹", currency: "EUR",
  scope: "Повечето магистрали — талон на входа, плащане на изхода.",
  official: [{ label: "Autostrade per l'Italia", url: "https://www.autostrade.it" }],
  tollInfo: ["Бели ленти — в брой; сини — карта/Viacard; жълти — Telepass и други устройства."],
  distanceToll: { refPattern: "^[AАΑ]\\d", ratePerKm: 0.075, currency: "EUR", low: 0.8, high: 1.35, quality: "secondary",
    basis: "По вторични източници: 0,05–0,12 €/km според участъка; поскъпване от 1,5% от 1.1.2026.",
    sources: ["https://www.ayvens.com/it-it/blog/conducenti/costo-autostrada/"] },
  traps: ["Не влизайте в жълтата лента „Telepass“ без устройство."],
  facts: [], sources: ["https://www.autostrade.it/it/servizi-al-cliente/pedaggio/metodi-di-pagamento/telepedaggio"], checkedAt: "2026-11-26", status: "partial",
});
const fr = toll({
  code: "FR", isoNumeric: "250", slug: "frantsiya", name: "Франция", nameEn: "France", flag: "🇫🇷", currency: "EUR",
  scope: "Повечето магистрали — такса по участъци.", official: [{ label: "Autoroutes.fr", url: "https://www.autoroutes.fr" }],
  tollInfo: ["Някои участъци са без бариери („flux libre“) — плаща се онлайн до няколко дни след преминаването."],
  traps: [], facts: [], sources: [], checkedAt: "2026-11-26", status: "unverified", statusNote: "Официалният сайт беше недостъпен при проверката.",
});
const pt = toll({
  code: "PT", isoNumeric: "620", slug: "portugaliya", name: "Португалия", nameEn: "Portugal", flag: "🇵🇹", currency: "EUR",
  scope: "Магистрали с бариери и участъци само с електронно плащане.",
  official: [{ label: "Infraestruturas de Portugal — тол за чужди коли", url: "https://www.pttolls.com/" }, { label: "Калкулатор", url: "https://portagens.infraestruturasdeportugal.pt/" }],
  tollInfo: ["За електронните участъци чуждите коли трябва да регистрират начин на плащане: EasyToll (1 € + 0,32 €/пътуване, 30 дни), Tollcard или Via Verde."],
  distanceToll: { refPattern: "^[AАΑ]\\d", ratePerKm: 0.09, currency: "EUR", low: 0.85, high: 1.15, quality: "derived",
    basis: "Изведено от цените за 2026: A1 Лисабон–Порто 25,05 € (~300 km), A2 Лисабон–Алгарве 23,80 € (~240 km). Плюс таксите на EasyToll при електронните участъци.",
    sources: ["https://www.rtp.pt/noticias/economia/portagens-sobem-45-centimos-entre-lisboa-e-porto-e-50-centimos-entre-lisboa-e-algarve_n1707053", "https://www.imt-ip.pt/rodoviario/infraestruturas-rodoviarias/rede-rodoviaria/taxas-de-portagem/"] },
  traps: [], facts: [], sources: ["https://www.pttolls.com/"], checkedAt: "2026-11-26", status: "partial",
});
const de = toll({
  code: "DE", isoNumeric: "276", slug: "germaniya", name: "Германия", nameEn: "Germany", flag: "🇩🇪", currency: "EUR", system: "none",
  scope: "Няма винетка или такса за леки коли по магистралите.",
  official: [], tollInfo: ["Пътна такса плащат само камионите над 3,5 t (Toll Collect)."],
  traps: [], facts: [], sources: ["https://www.toll-collect.de/"], checkedAt: "2026-11-26", status: "partial",
});
const dk = toll({
  code: "DK", isoNumeric: "208", slug: "daniya", name: "Дания", nameEn: "Denmark", flag: "🇩🇰", currency: "DKK",
  scope: "Без винетка. Платени са мостовете Storebælt и Øresund.",
  official: [{ label: "Øresundsbron", url: "https://www.oresundsbron.com/en/prices" }, { label: "Storebælt", url: "https://www.storebaelt.dk/priser-rabatter/" }],
  sectionTolls: [
    { id: "oresund", name: "Мост Øresund (Копенхаген–Малмьо)", road: "E20", priceCar: 420, point: [55.575, 12.83], radiusKm: 4, buyUrl: "https://www.oresundsbron.com/en/prices", note: "Кола до 6 m, онлайн билет; на касата 470 DKK. От 1.1.2027: 428 / 480 DKK." },
    { id: "storebaelt", name: "Мост Storebælt", road: "E20", priceCar: 235, point: [55.34, 11.03], radiusKm: 4, buyUrl: "https://www.storebaelt.dk/priser-rabatter/", note: "Кола 3–6 m, карта/в брой; с автоматично плащане 205 DKK." },
  ],
  traps: [], facts: [], sources: ["https://www.oresundsbron.com/en/prices", "https://www.storebaelt.dk/priser-rabatter/"], checkedAt: "2026-11-26", status: "verified", system: "mixed",
});
const no = toll({
  code: "NO", isoNumeric: "578", slug: "norvegiya", name: "Норвегия", nameEn: "Norway", flag: "🇳🇴", currency: "NOK",
  scope: "Автоматични пунктове (AutoPASS) по много пътища и в градовете.",
  official: [{ label: "AutoPASS — чужди МПС", url: "https://www.autopass.no/en/user/foreign-vehicles-2/" }],
  tollInfo: ["Регистрирайте се в Epass24 или сключете договор с издател на таг (20% отстъпка), иначе плащате и такса за справка в регистъра."],
  traps: [], facts: [], sources: ["https://www.autopass.no/en/user/foreign-vehicles-2/"], checkedAt: "2026-11-26", status: "partial",
});

export const COUNTRIES: Country[] = [bg, ro, hu, at, sk, cz, si, ch, md, hr, rs, mk, gr, tr, it, fr, pt, de, dk, no];

export const bySlug = (slug: string) => COUNTRIES.find(c => c.slug === slug);
export const byNumeric = new Map(COUNTRIES.map(c => [c.isoNumeric, c]));

/** Държави без винетка/такса за коли, които маршрутът може да пресича (за показване на имената). */
export const OTHER_COUNTRY_NAMES: Record<string, string> = {
  "528": "Нидерландия", "056": "Белгия", "442": "Люксембург", "616": "Полша", "040": "Австрия", "724": "Испания",
  "752": "Швеция", "070": "Босна и Херцеговина", "499": "Черна гора", "008": "Албания", "804": "Украйна", "438": "Лихтенщайн",
  "826": "Великобритания", "372": "Ирландия", "246": "Финландия", "233": "Естония", "428": "Латвия", "440": "Литва", "112": "Беларус",
};
