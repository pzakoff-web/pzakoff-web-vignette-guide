// От маршрут + дати → кои държави, в кои дни, коя винетка и колко струва.
import { COUNTRIES, OTHER_COUNTRY_NAMES, byNumeric } from "@/data/countries";
import { OTHER_COUNTRY_NAMES_EN } from "@/data/countries.en";
import { localize } from "@/data/localize";
import type { Country, SectionToll, Vehicle } from "@/data/types";
import rates from "@/data/rates.json";
import fuelData from "@/data/fuel.json";
import type { FuelInput } from "@/data/types";
import { cheapestCover, type Cover } from "./cover";
import { countryAt, distanceKm } from "./geo";
import { addDays, range } from "./dates";
import type { RouteResult } from "./route";

export interface Segment { iso: string; startSec: number; endSec: number; km: number }

/** Последователните държави по маршрута (точки на ~1 km). */
export function segmentsOf(r: RouteResult): Segment[] {
  const segs: Segment[] = [];
  let lastKm = -Infinity, cur: Segment | null = null;
  for (let i = 0; i < r.coords.length; i++) {
    if (r.cumKm[i] - lastKm < 1 && i !== r.coords.length - 1) continue;
    lastKm = r.cumKm[i];
    const [lon, lat] = r.coords[i];
    const iso = countryAt(lon, lat, cur?.iso);
    if (!iso) continue; // море/граница — пропускаме
    if (cur && cur.iso === iso) { cur.endSec = r.cumSec[i]; cur.km = r.cumKm[i] - (cur as Segment & { startKm: number }).startKm; continue; }
    cur = Object.assign({ iso, startSec: r.cumSec[i], endSec: r.cumSec[i], km: 0 }, { startKm: r.cumKm[i] });
    segs.push(cur);
  }
  // кратки „скокове“ под 2 km (неточни граници) се сливат със съседите
  return segs.filter((s, i) => s.km >= 2 || i === 0 || i === segs.length - 1 || segs.length < 3);
}

export function sectionTollsOn(r: RouteResult, countries: Country[]): SectionToll[] {
  const found: SectionToll[] = [];
  for (const c of countries) for (const t of c.sectionTolls || []) {
    if (!t.point || !t.radiusKm) continue;
    const hit = r.coords.some(([lon, lat], i) => i % 3 === 0 && distanceKm(lat, lon, t.point![0], t.point![1]) <= t.radiusKm!);
    if (hit) found.push(t);
  }
  return found;
}

/** Часът на тръгване + шофиране до 10 ч на ден, после нощувка до същия час на следващия ден. */
export function dateAt(startDate: string, startHour: number, drivingSec: number, maxDriveH = 10): string {
  const h = drivingSec / 3600;
  const days = Math.floor(h / maxDriveH);
  const within = h - days * maxDriveH;
  const extra = Math.floor((startHour + within) / 24);
  return addDays(startDate, days + extra);
}

export interface TripInput {
  vehicle: Vehicle;
  departDate: string;
  departHour: number;
  returnDate?: string;
  stayDriving: boolean; // кара по платени пътища и в държавата на престоя
  today: string;
  lang?: "bg" | "en";
  fuel?: FuelInput;
}

/** Цена на горивото (€/л) в държавата по седмичния бюлетин на ЕК; null извън ЕС. */
export function fuelPrice(iso: string, type: FuelInput["type"]): number | null {
  const p = (fuelData.prices as Record<string, Record<string, number | null>>)[iso];
  return p?.[type] ?? null;
}
export const FUEL_DATE = fuelData.date;
export const FUEL_SOURCE = fuelData.source;

export interface DistancePlan { km: number; lowEur: number; highEur: number; low: number; high: number; currency: string; trips: number }

/**
 * Километри по платени магистрали във всяка държава. Броим точка по точка по линията
 * на всяка стъпка — една стъпка може да започва в една държава и да свършва в друга.
 */
export function tollKmByCountry(r: RouteResult): Map<string, number> {
  const out = new Map<string, number>();
  const res = new Map<string, RegExp>();
  let hint: string | null = null;
  for (const st of r.steps || []) {
    const refs = st.ref.split(/;\s*/).map(x => x.trim());
    for (let i = 1; i < st.coords.length; i++) {
      const [lon1, lat1] = st.coords[i - 1], [lon2, lat2] = st.coords[i];
      const iso = countryAt((lon1 + lon2) / 2, (lat1 + lat2) / 2, hint);
      if (!iso) continue;
      hint = iso;
      const dt = byNumeric.get(iso)?.distanceToll;
      if (!dt) continue;
      let re = res.get(iso);
      if (!re) { re = new RegExp(dt.refPattern); res.set(iso, re); }
      if (refs.some(x => re!.test(x))) out.set(iso, (out.get(iso) || 0) + distanceKm(lat1, lon1, lat2, lon2));
    }
  }
  return out;
}

export interface CountryPlan {
  iso: string;
  country?: Country;
  name: string;
  km: number;
  dates: string[];
  cover: Cover | null;          // най-евтината комбинация
  unknownPrice: boolean;        // има винетка, но не знаем цената за този вид МПС
  tolls: SectionToll[];
  distance?: DistancePlan;      // ориентировъчна такса по километър
  fuel?: { liters: number; price: number | null; eur: number | null };
  eur: (amount: number) => number | null;
}

export function toEur(amount: number, currency: string): number | null {
  if (currency === "EUR") return amount;
  const r = (rates.rates as Record<string, number>)[currency];
  return r ? amount / r : null;
}

export interface FuelSummary { eur: number; liters: number; missing: string[]; cheapest?: { iso: string; price: number }; priciest?: { iso: string; price: number } }

export function planTrip(r: RouteResult, input: TripInput): { plans: CountryPlan[]; totalEur: number; tollLowEur: number; tollHighEur: number; partial: boolean; segments: Segment[]; fuel?: FuelSummary } {
  const segs = segmentsOf(r);
  const totalSec = r.cumSec[r.cumSec.length - 1];
  const dateMap = new Map<string, Set<string>>();
  const add = (iso: string, d: string) => { if (!dateMap.has(iso)) dateMap.set(iso, new Set()); dateMap.get(iso)!.add(d); };

  for (const s of segs) {
    for (const d of range(dateAt(input.departDate, input.departHour, s.startSec), dateAt(input.departDate, input.departHour, s.endSec))) add(s.iso, d);
    if (input.returnDate) {
      // обратно по същия маршрут: времето се брои от другия край
      const a = dateAt(input.returnDate, input.departHour, totalSec - s.endSec);
      const b = dateAt(input.returnDate, input.departHour, totalSec - s.startSec);
      for (const d of range(a, b)) add(s.iso, d);
    }
  }
  if (input.returnDate && input.stayDriving && segs.length) {
    const dest = segs[segs.length - 1].iso;
    const arrive = dateAt(input.departDate, input.departHour, totalSec);
    if (arrive <= input.returnDate) for (const d of range(arrive, input.returnDate)) add(dest, d);
  }

  const seen = new Set<string>();
  const order = segs.map(s => s.iso).filter(i => !seen.has(i) && (seen.add(i), true));
  const countries = order.map(i => byNumeric.get(i)).filter(Boolean) as Country[];
  const tolls = sectionTollsOn(r, countries);
  const trips = input.returnDate ? 2 : 1;

  let totalEur = 0, partial = false, tollLowEur = 0, tollHighEur = 0;
  const tollKm = tollKmByCountry(r);
  const plans: CountryPlan[] = order.map(iso => {
    const c0 = byNumeric.get(iso);
    const c = c0 ? localize(c0, input.lang || "bg") : undefined;
    const km = segs.filter(s => s.iso === iso).reduce((a, s) => a + s.km, 0);
    const dates = [...(dateMap.get(iso) || [])].sort();
    const eur = (amount: number) => toEur(amount, c?.currency || "EUR");
    let cover: Cover | null = null, unknownPrice = false;
    if (c?.products?.length) {
      cover = cheapestCover(dates, c.products, input.vehicle, input.today);
      if (!cover) unknownPrice = c.products.every(p => p.price(input.vehicle) == null) && !(c.code === "CZ" && input.vehicle.kind === "moto");
      if (cover) { const e = eur(cover.total); if (e == null) partial = true; else totalEur += e; }
      else if (unknownPrice) partial = true;
    }
    const myTolls = tolls.filter(t => c0?.sectionTolls?.includes(t));
    for (const t of myTolls) {
      const p = input.vehicle.kind === "moto" ? t.priceMoto ?? t.priceCar : t.priceCar;
      const e = p == null ? null : eur(p * trips);
      if (e == null) partial = true; else totalEur += e;
    }
    // такса по километър
    let distance: DistancePlan | undefined;
    const dt = c0?.distanceToll, km0 = tollKm.get(iso) || 0;
    if (dt && km0 >= 1) {
      const base = km0 * dt.ratePerKm * trips;
      const lo = base * dt.low, hi = base * dt.high;
      const loE = toEur(lo, dt.currency), hiE = toEur(hi, dt.currency);
      if (loE != null && hiE != null) { tollLowEur += loE; tollHighEur += hiE; }
      distance = { km: km0, low: lo, high: hi, lowEur: loE ?? 0, highEur: hiE ?? 0, currency: dt.currency, trips };
    } else if (c0?.system === "toll" && !dt) {
      partial = true; // платени пътища без наша оценка (напр. Франция)
    }
    const name = c?.name || ((input.lang || "bg") === "en" ? OTHER_COUNTRY_NAMES_EN[iso] : OTHER_COUNTRY_NAMES[iso]) || "";
    // секционните такси — със същите id, но с преведени имена
    const lTolls = myTolls.map(t => c?.sectionTolls?.find(x => x.id === t.id) || t);
    // гориво: км в държавата × разход × цена там (приемаме, че зареждате там, където карате)
    let fuel: CountryPlan["fuel"];
    if (input.fuel) {
      const liters = km * trips * input.fuel.l100 / 100;
      const price = fuelPrice(iso, input.fuel.type);
      fuel = { liters, price, eur: price == null ? null : liters * price };
    }
    return { iso, country: c, name, km, dates, cover, unknownPrice, tolls: lTolls, distance, fuel, eur };
  });
  let fuel: FuelSummary | undefined;
  if (input.fuel) {
    const priced = plans.filter(p => p.fuel?.price != null);
    const missing = plans.filter(p => p.fuel && p.fuel.price == null && p.km >= 5).map(p => p.name);
    // за държавите без цена (извън ЕС) — средната цена по маршрута, за да не изчезват литрите
    const avg = priced.length ? priced.reduce((a, p) => a + p.fuel!.price!, 0) / priced.length : null;
    const eur = plans.reduce((a, p) => a + (p.fuel ? (p.fuel.eur ?? (avg != null ? p.fuel.liters * avg : 0)) : 0), 0);
    const liters = plans.reduce((a, p) => a + (p.fuel?.liters || 0), 0);
    const sorted = [...priced].sort((a, b) => a.fuel!.price! - b.fuel!.price!);
    fuel = {
      eur, liters, missing,
      cheapest: sorted[0] && { iso: sorted[0].iso, price: sorted[0].fuel!.price! },
      priciest: sorted.length > 1 ? { iso: sorted[sorted.length - 1].iso, price: sorted[sorted.length - 1].fuel!.price! } : undefined,
    };
  }
  return { plans, totalEur, tollLowEur, tollHighEur, partial, segments: segs, fuel };
}

export { COUNTRIES };
