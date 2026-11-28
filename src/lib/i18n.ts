// Двуезичност: български на „/“, английски на „/en/“.
import type { Country } from "@/data/types";
import { EN } from "@/data/countries.en";

export type Lang = "bg" | "en";

export const home = (l: Lang) => (l === "bg" ? "/" : "/en/");
export const countryPath = (c: Country, l: Lang) => (l === "bg" ? `/${c.slug}/` : `/en/${EN[c.code].slug}/`);
export const privacyPath = (l: Lang) => (l === "bg" ? "/poveritelnost/" : "/en/privacy/");

export function fmtDate(s: string, l: Lang): string {
  const [y, m, d] = s.split("-");
  if (l === "bg") return `${d}.${m}.${y}`;
  return new Date(Date.UTC(+y, +m - 1, +d)).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

const SYMBOL: Record<string, string> = { CHF: "CHF", CZK: "Kč", HUF: "Ft", RON: "lei", DKK: "kr.", NOK: "kr", MKD: "den." };
const num = (n: number, l: Lang, dec?: number) => {
  const d = dec ?? (Number.isInteger(n) ? 0 : 2);
  return n.toLocaleString(l === "bg" ? "bg-BG" : "en-GB", { minimumFractionDigits: d, maximumFractionDigits: 2 });
};
export function money(n: number, cur: string, l: Lang): string {
  if (cur === "EUR") return l === "bg" ? `${num(n, l)} €` : `€${num(n, l)}`;
  return `${num(n, l)} ${SYMBOL[cur] || cur}`;
}
export const eurApprox = (eur: number | null, l: Lang) => (eur == null ? "" : `≈ ${l === "bg" ? `${num(eur, l, 2)} €` : `€${num(eur, l, 2)}`}`);
/** Диапазон в евро, закръглен до цяло: „140–155 €“ / „€140–155“. */
export function eurRange(lo: number, hi: number, l: Lang): string {
  const a = num(Math.floor(lo), l, 0), b = num(Math.ceil(hi), l, 0);
  return l === "bg" ? `${a}–${b} €` : `€${a}–${b}`;
}
export const eurTotal = (eur: number, l: Lang) => (l === "bg" ? `${num(eur, l, 2)} €` : `€${num(eur, l, 2)}`);

export const T = {
  bg: {
    siteTag: "Независим справочник за винетки и пътни такси в Европа",
    nav: { countries: "Държави", scams: "Измами" },
    switchTo: "English", switchLabel: "Switch to English",
    footer1: "е независим справочник. Не продаваме винетки и не взимаме комисиона — препращаме само към официалните държавни сайтове.",
    footer2: "Цените са проверени на посочената дата от официалните източници, но могат да се променят. Винаги потвърждавайте на официалния сайт преди плащане.",
    privacy: "Поверителност",
    metaTitle: "Винетки и пътни такси в Европа — само официални сайтове",
    metaDesc: "Въведете маршрута и датите — вижте кои винетки ви трябват, за какъв срок, колко струват и директни линкове към официалните държавни сайтове. Без посредници и надценки.",
    eyebrow: (n: number) => `${n} държави с винетки · само официални източници`,
    h1: "Кои винетки ми трябват?",
    lead: ["Въведете маршрута и датите. Ще ви кажем кои винетки и такси ви трябват, за какъв срок е най-евтино и къде да ги купите — ", "само от официалните държавни сайтове", ", без посредници и надценки."],
    countriesH: "Винетки по държави", tollsH: "Тол такси и мостове",
    checked: "проверено", toVerify: "за проверка", noCarToll: "без такса за коли", bridges: "платени мостове", bySection: "такса по участъци",
    scamH: "Как да не платите повече за винетка",
    faq: [
      { q: "Как да разпозная фалшив сайт за винетки?", a: "Официалните сайтове са на държавни домейни или на държавния пътен оператор: shop.asfinag.at (Австрия), via.admin.ch (Швейцария), edalnice.gov.cz (Чехия), eznamka.sk (Словакия), ematrica.nemzetiutdij.hu (Унгария), etoll.ro (Румъния), web.bgtoll.bg (България). Сайтове с имена като „official-vignette“, „e-vinjeta“ или „vignette-online“ обикновено са посредници, които добавят такси." },
      { q: "Незаконни ли са посредниците?", a: "Не винаги — в Швейцария например посредниците имат право на надценка, ако ясно се представят като независими. Но плащате повече за същото. Унгарският оператор официално предупреждава (22.09.2026) за сайтове, които купуват винетката от свое име, препродават я с неизгоден курс и понякога с грешен срок." },
      { q: "Купих от посредник. Валидна ли е винетката ми?", a: "Проверете по регистрационния номер на официалния сайт — например Унгария и Чехия имат безплатна проверка. Ако я няма, свържете се с банката си за оспорване на плащането." },
      { q: "Защо австрийската ми годишна винетка не важи?", a: "Купени онлайн от физическо лице, двумесечната и годишната винетка в Австрия важат чак от 18-ия ден след покупката. Еднодневната и 10-дневната важат веднага, а стикерът от пункт за продажба — също веднага." },
    ],
    // планер
    from: "Откъде", to: "Докъде", via: (i: number) => `През (${i})`,
    fromPh: "напр. София", toPh: "напр. Мюнхен", viaPh: "град по пътя, напр. Будапеща",
    removeStop: "Махни тази точка", addVia: "+ Добави град по пътя", swap: "⇅ Размени посоката",
    viaHint: "За да минете през определена държава, добавете град в нея — например Будапеща за Унгария или Белград за Сърбия.",
    depart: "Тръгване", hour: "Час", ret: "Връщане", roundTrip: "Отиване и връщане",
    vehicle: "Превозно средство", car: "Лек автомобил (до 3,5 t)", carTrailer: "Автомобил с ремарке/каравана", moto: "Мотоциклет",
    power: "Задвижване", std: "Бензин / дизел / LPG", phev: "Plug-in хибрид", cng: "Метан (CNG/LNG)", ev: "Електрически",
    euro: "Екокласа", e6: "Евро 6", e45: "Евро 4–5", e03: "Евро 3 и по-ниска",
    stay: (dest: string | null) => `Ще ползвам магистралите и през престоя${dest ? ` в ${dest}` : " на крайната точка"}`,
    stayTitle: "Ако по време на престоя ще пътувате по магистралите (напр. до пистите), винетката трябва да покрива всички дни, не само пристигането и тръгването.",
    submit: "Покажи кои винетки ми трябват", busy: "Изчисляване…",
    errReturn: "Датата на връщане е преди тръгването.", errFrom: "Въведете откъде тръгвате.", errTo: "Въведете докъде пътувате.",
    errNotFound: (q: string) => `Не намерихме „${q}“. Опитайте с по-точно име.`, errGeneric: "Нещо се обърка. Опитайте отново.",
    errRoute: "Маршрутът не може да бъде изчислен в момента. Опитайте след малко.", errNoRoute: "Не намерихме маршрут между тези места",
    drive: (km: number, h: number, m: number) => `${km} km · около ${h} ч ${m} мин път`, inclFerry: " (вкл. ферибот)", back: (d: string) => ` · обратно на ${d}`,
    totalLabel: "Винетки и такси", totalPartial: " (без тол таксите по км)",
    share: "Сподели пътуването ↗", shareTitle: "Винетки за пътуването", copied: "Линкът е копиран.", edit: "Промени маршрута ↑",
    mapLabel: "Карта на маршрута",
    note: "Сумите в чужда валута са превърнати в евро по курса на ЕЦБ. Плащате в местна валута на официалния сайт. Приемаме, че шофирате до 10 часа на ден и минавате по магистралите. Проверете датите преди покупка.",
    noData: "Нямаме данни за тази държава. Проверете дали има такси за пътища.", noToll: "Без винетка и без такса за леки автомобили.",
    noneNeeded: "Не е нужна винетка за тези дни.", notRequired: "За този вид превозно средство не се изисква винетка.",
    unknownPrice: ["Не потвърдихме цена за този вид превозно средство. Проверете на ", "официалния сайт", "."],
    delayed: "Купена онлайн днес, тази винетка важи чак от 18-ия ден. Купете стикер от пункт за продажба или изберете по-кратки винетки.",
    buy: "Купи от официалния сайт ↗", buyShort: "купи ↗", perPass: "на преминаване", times2: " (× 2 за връщане)", oneWay: " (само в едната посока)",
    tollPrefix: "Такса по участъци — плаща се на място.", officialCalc: "Официален калкулатор/цени ↗",
    watch: (n: number) => `Внимавайте (${n})`, allAbout: (name: string) => `Всичко за ${name} →`, otherCountry: "Друга държава",
    // страница на държава
    vignette: "Винетка", tolls: "Пътни такси", allCountries: "← Всички държави",
    countryMetaTitle: (what: string, name: string) => `${what} ${name} 2026 — цени, срокове и официален сайт`,
    countryMetaDesc: (what: string, name: string, d: string) => `${what} за ${name}: актуални цени, видове и срокове, капани и директен линк към официалния държавен сайт. Проверено на ${d}.`,
    officialSites: "Официални сайтове", officialWarn: (name: string) => `Всичко друго, което Google показва за „винетка ${name}“, вероятно е посредник с надценка.`,
    prices: "Цени", thType: "Вид", thCar: "Лек автомобил", thMoto: "Мотоциклет", thTrailer: "С ремарке", onlineFrom: (n: number) => `онлайн: важи от ${n}-ия ден`,
    roNote: "Цените в таблицата са за Евро 6. Електромобили и по-старите коли плащат различно — изберете екокласата в калкулатора.",
    czNote: "Цените в таблицата са за бензин/дизел. За CNG, plug-in хибриди и електромобили — вижте капаните по-долу.",
    sections: "Участъци с отделна такса", forCar: "за кола", howToPay: "Как се плаща", traps: "Внимавайте", useful: "Полезно",
    calcCta: "Изчисли винетките за моя маршрут", sources: "Източници", checkedOn: (d: string) => `Проверено на ${d}.`,
    // такси по километър
    distLine: (km: number) => `≈ ${km} km по платени магистрали`,
    distEstimate: "ориентировъчно", distBoth: " · × 2 за отиване и връщане",
    distHow: "Как е сметнато", distNoEstimate: "Платени магистрали — нямаме надеждна цена на километър. Ползвайте официалния калкулатор.",
    totalWithTolls: "Общо с тол таксите", fixedPart: (a: string) => `винетки и фиксирани такси ${a}`, tollPart: (a: string) => `тол по км ${a}`,
    q: { official: "официална тарифа", derived: "изведено от официални цени", secondary: "по вторични източници" } as Record<string, string>,
    rateLabel: "Ориентировъчна цена на километър", perKm: "/km",
    // гориво
    fuel: "Гориво за сметката", fuelNone: "Без гориво", petrol: "Бензин 95", diesel: "Дизел", lpg: "LPG (газ)", l100: "Разход л/100 km",
    plate: "Рег. номер (по желание)", platePh: "напр. СВ 1234 АВ", plateCountry: "Държава на номера",
    plateHint: "Попълваме го в официалните форми, където е възможно (засега Чехия). Пази се само на това устройство.",
    fuelLine: (l: number, price: string) => `Гориво: ≈ ${l} л × ${price}/л`, fuelNoPrice: "Гориво: няма официални цени (извън ЕС) — смятаме по средната за маршрута",
    tripTotal: "Пътуването общо", partVign: (a: string) => `винетки и такси ${a}`, partToll: (a: string) => `тол по км ${a}`, partFuel: (a: string) => `гориво ${a}`,
    refuel: (cheap: string, cp: string, pricey: string, pp: string, save: string) => `Най-евтино гориво по пътя: ${cheap} (${cp}/л). Най-скъпо: ${pricey} (${pp}/л) — пълен резервоар от 50 л там струва с ${save} повече.`,
    fuelSource: (d: string) => `Цени на горивата: седмичен бюлетин на Европейската комисия от ${d}`,
    buyPrefilled: "Купи — формата е попълнена ↗", buyProduct: "Купи — избран вид ↗",
    remind: "Напомняния в календара 📅", remindBuy: (c: string, p: string, d: string) => `Купете винетка: ${c} — ${p} (от ${d})`,
    remindDelay: (d: string, n: number) => `Онлайн купена, тази винетка важи чак от ${n}-ия ден — купете я най-късно на ${d}.`,
    remindOfficial: "Официален сайт", remindExpire: (c: string, d: string) => `Изтича винетката за ${c} на ${d}`,
    remindDepart: (r: string) => `Пътуване ${r}: проверете винетките`, remindDepartBody: "Проверете, че всички винетки са купени и важат за днешната дата.",
    tank: "Резервоар (л)", startFuel: "Тръгвам с", full: "пълен резервоар", f34: "¾ резервоар", f12: "½ резервоар", f14: "¼ резервоар",
    refuelH: "Къде да заредите", legOut: "Отиване", legBack: "Връщане",
    refuelStop: (l: number, full: boolean) => full ? `догоре (≈ ${l} л)` : `≈ ${l} л`, beforeBorder: (c: string) => `преди границата с ${c}`, atKm: (km: number) => `около ${km}-ия km`,
    refuelJust: (l: number, c: string) => `само ≈ ${l} л — колкото да стигнете до ${c}`,
    ferriesH: "Фериботи по маршрута", ferryDur: (m: number) => m >= 90 ? `≈ ${Math.round(m / 6) / 10} ч` : `≈ ${Math.round(m)} мин`,
    ferryTicket: "Билетът е отделно — цената зависи от датата и сезона:", ferryExtra: " + ферибот",
    ferryAltH: "Вариант с ферибот", ferryAlt: (from: string, to: string) => `${from} → ${to}`,
    ferryAltLine: (km: number, savedKm: number, h: string, savedH: string) => `${km} km шофиране (с ${savedKm} km по-малко) · общо ${h}${savedH}`,
    ferryFaster: (h: string) => ` — с ${h} по-бързо`, ferrySlower: (h: string) => ` — с ${h} по-бавно, но с много по-малко шофиране`,
    hours: (h: number) => `${Math.floor(h)} ч ${Math.round((h % 1) * 60)} мин`,
    useFerry: "Покажи с ферибот", noFerry: "Само по суша", ferrySource: "Продължителност:",
    refuelNone: "Не е нужно да зареждате — горивото в резервоара стига (с резерва).",
    refuelSave: (a: string) => `Така спестявате ≈ ${a} спрямо зареждане догоре там, където ви свърши горивото.`,
    refuelUnknown: "В държавите извън ЕС цената не е известна — там планът зарежда само колкото е необходимо.",
    refuelHow: "Резервата е 12% от резервоара (поне 5 л). Цените са средни за държавата; на магистралата обикновено са по-високи.",
  },
  en: {
    siteTag: "Independent guide to European road vignettes and tolls",
    nav: { countries: "Countries", scams: "Scams" },
    switchTo: "Български", switchLabel: "Превключи на български",
    footer1: "is an independent guide. We don't sell vignettes or take commission — we only link to the official government sites.",
    footer2: "Prices were checked on the stated date against official sources but can change. Always confirm on the official site before paying.",
    privacy: "Privacy",
    metaTitle: "Road vignettes and tolls in Europe — official sites only",
    metaDesc: "Enter your route and dates to see which vignettes you need, for how long, what they cost and direct links to the official government sites. No resellers, no mark-ups.",
    eyebrow: (n: number) => `${n} vignette countries · official sources only`,
    h1: "Which vignettes do I need?",
    lead: ["Enter your route and dates. We'll tell you which vignettes and tolls you need, the cheapest validity and where to buy — ", "only from the official government sites", ", with no resellers or mark-ups."],
    countriesH: "Vignettes by country", tollsH: "Tolls and bridges",
    checked: "checked", toVerify: "to be verified", noCarToll: "no toll for cars", bridges: "tolled bridges", bySection: "toll by section",
    scamH: "How not to overpay for a vignette",
    faq: [
      { q: "How do I spot a fake vignette site?", a: "Official sites are on government domains or the state road operator's: shop.asfinag.at (Austria), via.admin.ch (Switzerland), edalnice.gov.cz (Czechia), eznamka.sk (Slovakia), ematrica.nemzetiutdij.hu (Hungary), etoll.ro (Romania), web.bgtoll.bg (Bulgaria). Sites with names like “official-vignette”, “e-vinjeta” or “vignette-online” are usually resellers that add fees." },
      { q: "Are resellers illegal?", a: "Not always — in Switzerland, for example, resellers may charge a mark-up if they clearly present themselves as independent. But you pay more for the same thing. Hungary's operator officially warned (22 Sep 2026) about sites that buy the vignette in their own name and resell it at a poor exchange rate, sometimes with the wrong validity." },
      { q: "I bought from a reseller. Is my vignette valid?", a: "Check by licence plate on the official site — Hungary and Czechia, for example, offer a free check. If it isn't there, contact your bank to dispute the payment." },
      { q: "Why isn't my Austrian annual vignette valid?", a: "Bought online by a consumer, the Austrian 2-month and annual vignettes are valid only from the 18th day after purchase. The 1-day and 10-day vignettes are valid immediately, and so is a sticker bought at a sales point." },
    ],
    from: "From", to: "To", via: (i: number) => `Via (${i})`,
    fromPh: "e.g. Sofia", toPh: "e.g. Munich", viaPh: "a city on the way, e.g. Budapest",
    removeStop: "Remove this stop", addVia: "+ Add a city on the way", swap: "⇅ Reverse direction",
    viaHint: "To pass through a particular country, add a city in it — e.g. Budapest for Hungary or Belgrade for Serbia.",
    depart: "Departure", hour: "Time", ret: "Return", roundTrip: "Return trip",
    vehicle: "Vehicle", car: "Car (up to 3.5 t)", carTrailer: "Car with trailer/caravan", moto: "Motorcycle",
    power: "Powertrain", std: "Petrol / diesel / LPG", phev: "Plug-in hybrid", cng: "CNG/LNG", ev: "Electric",
    euro: "Emission class", e6: "Euro 6", e45: "Euro 4–5", e03: "Euro 3 or lower",
    stay: (dest: string | null) => `I'll also use motorways during my stay${dest ? ` in ${dest}` : " at the destination"}`,
    stayTitle: "If you'll drive on motorways during your stay (e.g. to the slopes), the vignette must cover every day, not just arrival and departure.",
    submit: "Show which vignettes I need", busy: "Calculating…",
    errReturn: "The return date is before departure.", errFrom: "Enter where you start.", errTo: "Enter where you're going.",
    errNotFound: (q: string) => `We couldn't find “${q}”. Try a more precise name.`, errGeneric: "Something went wrong. Please try again.",
    errRoute: "The route can't be calculated right now. Please try again shortly.", errNoRoute: "We couldn't find a route between these places",
    drive: (km: number, h: number, m: number) => `${km} km · about ${h} h ${m} min travel`, inclFerry: " (incl. ferry)", back: (d: string) => ` · back on ${d}`,
    totalLabel: "Vignettes and tolls", totalPartial: " (excl. distance-based tolls)",
    share: "Share this trip ↗", shareTitle: "Vignettes for the trip", copied: "Link copied.", edit: "Edit route ↑",
    mapLabel: "Route map",
    note: "Foreign-currency amounts are converted to euros at the ECB rate. You pay in local currency on the official site. We assume up to 10 hours of driving a day on motorways. Check the dates before buying.",
    noData: "We have no data for this country. Check whether road tolls apply.", noToll: "No vignette and no toll for cars.",
    noneNeeded: "No vignette needed for these days.", notRequired: "No vignette is required for this vehicle type.",
    unknownPrice: ["We haven't confirmed a price for this vehicle type. Check on the ", "official site", "."],
    delayed: "Bought online today, this vignette is valid only from the 18th day. Buy a sticker at a sales point or choose shorter vignettes.",
    buy: "Buy on the official site ↗", buyShort: "buy ↗", perPass: "per passage", times2: " (× 2 for the return)", oneWay: " (one direction only)",
    tollPrefix: "Toll by section — paid on the spot.", officialCalc: "Official calculator/prices ↗",
    watch: (n: number) => `Watch out (${n})`, allAbout: (name: string) => `All about ${name} →`, otherCountry: "Other country",
    vignette: "Vignette", tolls: "Road tolls", allCountries: "← All countries",
    countryMetaTitle: (what: string, name: string) => `${name} ${what.toLowerCase()} 2026 — prices, validity and official site`,
    countryMetaDesc: (what: string, name: string, d: string) => `${what} for ${name}: current prices, types and validity, pitfalls and a direct link to the official government site. Checked on ${d}.`,
    officialSites: "Official sites", officialWarn: (name: string) => `Anything else Google shows for “${name} vignette” is probably a reseller with a mark-up.`,
    prices: "Prices", thType: "Type", thCar: "Car", thMoto: "Motorcycle", thTrailer: "With trailer", onlineFrom: (n: number) => `online: valid from day ${n}`,
    roNote: "Table prices are for Euro 6. Electric and older cars pay differently — choose the emission class in the calculator.",
    czNote: "Table prices are for petrol/diesel. For CNG, plug-in hybrids and electric cars, see the pitfalls below.",
    sections: "Sections with a separate toll", forCar: "for a car", howToPay: "How to pay", traps: "Watch out", useful: "Good to know",
    calcCta: "Calculate vignettes for my route", sources: "Sources", checkedOn: (d: string) => `Checked on ${d}.`,
    distLine: (km: number) => `≈ ${km} km on tolled motorways`,
    distEstimate: "estimate", distBoth: " · × 2 for both ways",
    distHow: "How it's calculated", distNoEstimate: "Tolled motorways — we have no reliable per-km price. Use the official calculator.",
    totalWithTolls: "Total incl. tolls", fixedPart: (a: string) => `vignettes and fixed tolls ${a}`, tollPart: (a: string) => `distance tolls ${a}`,
    q: { official: "official tariff", derived: "derived from official prices", secondary: "from secondary sources" } as Record<string, string>,
    rateLabel: "Estimated price per km", perKm: "/km",
    fuel: "Fuel for the estimate", fuelNone: "No fuel", petrol: "Petrol 95", diesel: "Diesel", lpg: "LPG", l100: "Consumption l/100 km",
    plate: "Licence plate (optional)", platePh: "e.g. CB 1234 AB", plateCountry: "Plate country",
    plateHint: "We prefill it on official forms where possible (Czechia for now). It's stored only on this device.",
    fuelLine: (l: number, price: string) => `Fuel: ≈ ${l} l × ${price}/l`, fuelNoPrice: "Fuel: no official prices (outside the EU) — using the route average",
    tripTotal: "Trip total", partVign: (a: string) => `vignettes and tolls ${a}`, partToll: (a: string) => `distance tolls ${a}`, partFuel: (a: string) => `fuel ${a}`,
    refuel: (cheap: string, cp: string, pricey: string, pp: string, save: string) => `Cheapest fuel on the route: ${cheap} (${cp}/l). Most expensive: ${pricey} (${pp}/l) — a full 50 l tank there costs ${save} more.`,
    fuelSource: (d: string) => `Fuel prices: European Commission Weekly Oil Bulletin of ${d}`,
    buyPrefilled: "Buy — form prefilled ↗", buyProduct: "Buy — type selected ↗",
    remind: "Calendar reminders 📅", remindBuy: (c: string, p: string, d: string) => `Buy vignette: ${c} — ${p} (from ${d})`,
    remindDelay: (d: string, n: number) => `Bought online, this vignette is valid only from day ${n} — buy it by ${d} at the latest.`,
    remindOfficial: "Official site", remindExpire: (c: string, d: string) => `${c} vignette expires on ${d}`,
    remindDepart: (r: string) => `Trip ${r}: check your vignettes`, remindDepartBody: "Make sure all vignettes are bought and valid for today.",
    tank: "Tank (l)", startFuel: "Starting with", full: "full tank", f34: "¾ tank", f12: "½ tank", f14: "¼ tank",
    refuelH: "Where to refuel", legOut: "Outbound", legBack: "Return",
    refuelStop: (l: number, full: boolean) => full ? `fill up (≈ ${l} l)` : `≈ ${l} l`, beforeBorder: (c: string) => `before the border with ${c}`, atKm: (km: number) => `around km ${km}`,
    refuelJust: (l: number, c: string) => `only ≈ ${l} l — just enough to reach ${c}`,
    ferriesH: "Ferries on the route", ferryDur: (m: number) => m >= 90 ? `≈ ${Math.round(m / 6) / 10} h` : `≈ ${Math.round(m)} min`,
    ferryTicket: "The ticket is extra — the price depends on the date and season:", ferryExtra: " + ferry",
    ferryAltH: "Ferry option", ferryAlt: (from: string, to: string) => `${from} → ${to}`,
    ferryAltLine: (km: number, savedKm: number, h: string, savedH: string) => `${km} km of driving (${savedKm} km less) · total ${h}${savedH}`,
    ferryFaster: (h: string) => ` — ${h} faster`, ferrySlower: (h: string) => ` — ${h} slower, but with far less driving`,
    hours: (h: number) => `${Math.floor(h)} h ${Math.round((h % 1) * 60)} min`,
    useFerry: "Show with ferry", noFerry: "Overland only", ferrySource: "Duration:",
    refuelNone: "No need to refuel — the fuel in your tank is enough (with a reserve).",
    refuelSave: (a: string) => `This saves ≈ ${a} compared with filling up wherever you run low.`,
    refuelUnknown: "Outside the EU prices are unknown — there the plan buys only what's necessary.",
    refuelHow: "The reserve is 12% of the tank (at least 5 l). Prices are national averages; motorway stations are usually more expensive.",
  },
};
export type Dict = typeof T.bg;
