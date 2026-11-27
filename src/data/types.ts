// Модел на данните. Всяка цена и правило имат източник и дата на проверка.

export type Currency = "EUR" | "CZK" | "HUF" | "RON" | "CHF" | "DKK" | "NOK" | "MKD" | "TRY";

export type VehicleKind = "car" | "moto" | "carTrailer";
/** Задвижване / екокласа — влияе на цената в CZ и RO. */
export type Powertrain = "standard" | "phev" | "cng" | "electric";
export type EuroClass = "euro6" | "euro4_5" | "euro0_3";

export interface Vehicle {
  kind: VehicleKind;
  powertrain: Powertrain;
  euroClass: EuroClass;
}

/**
 * Как се смята валидността. Когато официалното правило не е потвърдено,
 * моделираме го консервативно (по-кратко), за да не препоръчаме невалидна винетка.
 */
export type Validity =
  | { type: "days"; days: number }          // N поредни календарни дни, вкл. началния
  | { type: "months"; months: number }      // до деня преди същата дата N месеца по-късно
  | { type: "weekend" }                     // BG: започва в петък; броим събота и неделя (+ петък с уговорка)
  | { type: "calendarYear" }                // 1 януари – 31 декември
  | { type: "swissYear" };                  // 1 декември предходната – 31 януари следващата година

export interface Product {
  id: string;
  label: string;
  validity: Validity;
  /** Цена в местната валута; null = не се продава за този вид МПС. */
  price: (v: Vehicle) => number | null;
  /** Онлайн покупка от физическо лице важи чак от N-ия ден (AT: 18). */
  onlineConsumerDelayDays?: number;
  note?: string;
}

export interface SectionToll {
  id: string;
  name: string;
  road: string;
  /** Цена за 1 преминаване с кола, местна валута. */
  priceCar: number | null;
  priceMoto?: number | null;
  /** Приблизителна точка на участъка (тунел/пункт) за разпознаване по маршрута; без нея — само се изброява. */
  point?: [number, number]; // [lat, lon]
  radiusKm?: number;
  note?: string;
  buyUrl: string;
}

/**
 * Ориентировъчна такса по километър за платените магистрали.
 * ratePerKm е изведена от официални цени за конкретни отсечки (basis); low/high — множители за диапазона,
 * защото тарифите варират по участъци.
 */
export interface DistanceToll {
  /** Регулярен израз за номера на пътя (ref в маршрута), напр. "^A\\d" за A1, A3… */
  refPattern: string;
  ratePerKm: number;
  currency: Currency;
  low: number;
  high: number;
  quality: "official" | "derived" | "secondary";
  basis: string;      // откъде е цената (bg)
  sources: string[];
}

export interface Link { label: string; url: string }

export type Status = "verified" | "partial" | "unverified";

export interface Country {
  code: string;          // ISO 3166-1 alpha-2
  isoNumeric: string;    // за границите от world-atlas
  slug: string;
  name: string;          // на български
  nameEn: string;
  flag: string;
  system: "vignette" | "toll" | "mixed" | "none";
  currency: Currency;
  /** Къде важи изискването. */
  scope: string;
  official: Link[];      // само официални сайтове
  products?: Product[];
  sectionTolls?: SectionToll[];
  tollInfo?: string[];   // за държави с такса на километър
  distanceToll?: DistanceToll;
  traps: string[];       // капани и чести грешки
  facts: string[];       // други полезни факти
  sources: string[];
  checkedAt: string;     // ISO дата на последна проверка
  status: Status;
  statusNote?: string;
  pricesValidFor?: string;
}
