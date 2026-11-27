// Български имена на чужди градове (на кирилица и както ги пишем на латиница) → име, което търсачката разбира.
// Photon не индексира българските имена: „Атина“ намира квартал „Алтина“ в Белград.
const A: Record<string, string[]> = {
  "Athens": ["атина", "atina"], "Thessaloniki": ["солун", "solun"], "Kavala": ["кавала"], "Xanthi": ["ксанти"],
  "Drama": ["драма"], "Serres": ["серес", "сяр"], "Alexandroupoli": ["александруполис"], "Komotini": ["комотини", "гюмюрджина"],
  "Katerini": ["катерини"], "Igoumenitsa": ["игуменица"], "Patras": ["патра"], "Larissa": ["лариса"], "Ioannina": ["янина"],
  "Istanbul": ["истанбул", "цариград", "tsarigrad", "carigrad"], "Edirne": ["одрин", "odrin"], "Ankara": ["анкара"],
  "Izmir": ["измир"], "Antalya": ["анталия"], "Bursa": ["бурса"], "Çanakkale": ["чанаккале"],
  "Bucharest": ["букурещ", "bukuresht", "bukuresti"], "Constanța": ["констанца", "konstantsa"], "Craiova": ["крайова"],
  "Timișoara": ["тимишоара"], "Brașov": ["брашов"], "Cluj-Napoca": ["клуж", "клуж-напока"], "Sibiu": ["сибиу"], "Iași": ["яш", "яси"],
  "Belgrade": ["белград", "belgrad"], "Niš": ["ниш"], "Novi Sad": ["нови сад"], "Subotica": ["суботица"],
  "Skopje": ["скопие", "skopie"], "Ohrid": ["охрид"], "Bitola": ["битоля"], "Struga": ["струга"],
  "Tirana": ["тирана"], "Durrës": ["дуръс", "драч"], "Podgorica": ["подгорица"], "Budva": ["будва"], "Kotor": ["котор"],
  "Sarajevo": ["сараево"], "Mostar": ["мостар"], "Zagreb": ["загреб"], "Split": ["сплит"], "Dubrovnik": ["дубровник"],
  "Rijeka": ["риека"], "Pula": ["пула"], "Zadar": ["задар"], "Ljubljana": ["любляна", "lyublyana", "lyubliana", "ljubliana"],
  "Budapest": ["будапеща", "budapeshta"], "Szeged": ["сегед"], "Debrecen": ["дебрецен"],
  "Vienna": ["виена", "viena"], "Salzburg": ["залцбург"], "Innsbruck": ["инсбрук"], "Graz": ["грац"], "Linz": ["линц"], "Villach": ["филах"],
  "Prague": ["прага", "praga"], "Brno": ["бърно"], "Bratislava": ["братислава"], "Košice": ["кошице"],
  "Munich": ["мюнхен", "myunhen", "mjunhen", "miunhen"], "Berlin": ["берлин"], "Frankfurt am Main": ["франкфурт"],
  "Hamburg": ["хамбург"], "Cologne": ["кьолн"], "Stuttgart": ["щутгарт"], "Nuremberg": ["нюрнберг"], "Düsseldorf": ["дюселдорф"],
  "Dresden": ["дрезден"], "Leipzig": ["лайпциг"], "Hannover": ["хановер"], "Regensburg": ["регенсбург"], "Passau": ["пасау"],
  "Zurich": ["цюрих"], "Geneva": ["женева"], "Bern": ["берн"], "Basel": ["базел"], "Lugano": ["лугано"],
  "Milan": ["милано"], "Rome": ["рим", "rim"], "Venice": ["венеция", "venetsia", "venetsiya"], "Florence": ["флоренция"],
  "Naples": ["неапол"], "Trieste": ["триест"], "Verona": ["верона"], "Bologna": ["болоня"], "Turin": ["торино"], "Genoa": ["генуа"], "Bari": ["бари"],
  "Paris": ["париж", "parij", "pariz"], "Lyon": ["лион"], "Nice": ["ница"], "Marseille": ["марсилия"], "Strasbourg": ["страсбург"],
  "Madrid": ["мадрид"], "Barcelona": ["барселона"], "Valencia": ["валенсия"], "Lisbon": ["лисабон"], "Porto": ["порто"],
  "Amsterdam": ["амстердам"], "Brussels": ["брюксел"], "Luxembourg": ["люксембург"], "London": ["лондон"],
  "Copenhagen": ["копенхаген"], "Malmö": ["малмьо"], "Stockholm": ["стокхолм"], "Oslo": ["осло"],
  "Warsaw": ["варшава", "varshava"], "Kraków": ["краков"], "Wrocław": ["вроцлав"], "Chișinău": ["кишинев", "kishinev"], "Odesa": ["одеса"],
};

const LOOKUP = new Map<string, string>();
for (const [target, names] of Object.entries(A)) for (const n of names) LOOKUP.set(n, target);

/** Българското име на града за показване (първото от списъка): „atina“ → „Атина“. */
export function bgName(target: string): string | null {
  const n = A[target]?.[0];
  return n ? n.replace(/(^|[\s-])(\S)/g, (_, a: string, b: string) => a + b.toUpperCase()) : null;
}

/** Ако написаното е известно българско име, връща името за търсене (напр. „Атина“ → „Athens“). */
export function aliasQuery(q: string): string | null {
  return LOOKUP.get(q.trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ")) ?? null;
}

/** Имена на държавите по ISO код — за етикетите на местата. */
export const COUNTRY_NAMES: Record<string, { bg: string; en: string }> = {
  BG: { bg: "България", en: "Bulgaria" }, GR: { bg: "Гърция", en: "Greece" }, TR: { bg: "Турция", en: "Turkey" },
  RO: { bg: "Румъния", en: "Romania" }, RS: { bg: "Сърбия", en: "Serbia" }, MK: { bg: "Северна Македония", en: "North Macedonia" },
  AL: { bg: "Албания", en: "Albania" }, ME: { bg: "Черна гора", en: "Montenegro" }, BA: { bg: "Босна и Херцеговина", en: "Bosnia and Herzegovina" },
  HR: { bg: "Хърватия", en: "Croatia" }, SI: { bg: "Словения", en: "Slovenia" }, HU: { bg: "Унгария", en: "Hungary" },
  AT: { bg: "Австрия", en: "Austria" }, CH: { bg: "Швейцария", en: "Switzerland" }, DE: { bg: "Германия", en: "Germany" },
  CZ: { bg: "Чехия", en: "Czechia" }, SK: { bg: "Словакия", en: "Slovakia" }, PL: { bg: "Полша", en: "Poland" },
  IT: { bg: "Италия", en: "Italy" }, FR: { bg: "Франция", en: "France" }, ES: { bg: "Испания", en: "Spain" }, PT: { bg: "Португалия", en: "Portugal" },
  NL: { bg: "Нидерландия", en: "Netherlands" }, BE: { bg: "Белгия", en: "Belgium" }, LU: { bg: "Люксембург", en: "Luxembourg" },
  DK: { bg: "Дания", en: "Denmark" }, SE: { bg: "Швеция", en: "Sweden" }, NO: { bg: "Норвегия", en: "Norway" },
  GB: { bg: "Великобритания", en: "United Kingdom" }, IE: { bg: "Ирландия", en: "Ireland" }, MD: { bg: "Молдова", en: "Moldova" },
  UA: { bg: "Украйна", en: "Ukraine" }, LI: { bg: "Лихтенщайн", en: "Liechtenstein" }, XK: { bg: "Косово", en: "Kosovo" },
};
