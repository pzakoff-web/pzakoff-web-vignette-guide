// Фериботни линии, които предлагаме като вариант, когато спестяват много шофиране.
// Продължителност — по разписанията на превозвачите. Цената на билета зависи от датата — не я смятаме.
export interface Port { name: string; nameEn: string; lat: number; lon: number }
export interface FerryLine { id: string; a: Port; b: Port; hours: number; operators: { label: string; url: string }[]; source: string }

export const FERRY_LINES: FerryLine[] = [
  {
    id: "igoumenitsa-bari",
    a: { name: "Игуменица", nameEn: "Igoumenitsa", lat: 39.506, lon: 20.258 },
    b: { name: "Бари", nameEn: "Bari", lat: 41.135, lon: 16.858 },
    hours: 9,
    operators: [{ label: "Superfast Ferries", url: "https://www.superfast.com" }, { label: "Anek Lines", url: "https://www.anek.gr" }],
    source: "Разписание Anek-Superfast: 8 ч 15 мин – 9 ч",
  },
  {
    id: "rostock-gedser",
    a: { name: "Росток", nameEn: "Rostock", lat: 54.153, lon: 12.098 },
    b: { name: "Гедсер", nameEn: "Gedser", lat: 54.574, lon: 11.927 },
    hours: 2,
    operators: [{ label: "Scandlines", url: "https://www.scandlines.com" }],
    source: "Scandlines: около 2 ч",
  },
  {
    id: "puttgarden-rodby",
    a: { name: "Путгарден", nameEn: "Puttgarden", lat: 54.499, lon: 11.226 },
    b: { name: "Рьодби", nameEn: "Rødby", lat: 54.652, lon: 11.351 },
    hours: 0.75,
    operators: [{ label: "Scandlines", url: "https://www.scandlines.com" }],
    source: "Scandlines: 45 мин",
  },
];

/** Превозвачи за фериботи, които маршрутизаторът сам избира (по името на линията). */
export const FERRY_OPERATORS: { match: RegExp; operators: { label: string; url: string }[] }[] = [
  { match: /Rødby|Puttgarden|Gedser|Rostock/i, operators: [{ label: "Scandlines", url: "https://www.scandlines.com" }] },
  { match: /Helsingør|Helsingborg/i, operators: [{ label: "Scandlines", url: "https://www.scandlines.com" }, { label: "ForSea", url: "https://www.forsea.se" }] },
  { match: /Igoumenitsa|Bari|Brindisi|Ancona|Patra|Venezia|Venice/i, operators: [{ label: "Superfast Ferries", url: "https://www.superfast.com" }, { label: "Anek Lines", url: "https://www.anek.gr" }, { label: "Minoan Lines", url: "https://www.minoan.gr" }, { label: "Grimaldi Lines", url: "https://www.grimaldi-lines.com" }] },
];
