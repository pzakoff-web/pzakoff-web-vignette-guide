// От маршрут + дати → кои държави, в кои дни, коя винетка и колко струва.
import { COUNTRIES, OTHER_COUNTRY_NAMES, byNumeric } from "@/data/countries";
import type { Country, SectionToll, Vehicle } from "@/data/types";
import rates from "@/data/rates.json";
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
  eur: (amount: number) => number | null;
}

export function toEur(amount: number, currency: string): number | null {
  if (currency === "EUR") return amount;
  const r = (rates.rates as Record<string, number>)[currency];
  return r ? amount / r : null;
}

export function planTrip(r: RouteResult, input: TripInput): { plans: CountryPlan[]; totalEur: number; partial: boolean; segments: Segment[] } {
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

  let totalEur = 0, partial = false;
  const plans: CountryPlan[] = order.map(iso => {
    const c = byNumeric.get(iso);
    const km = segs.filter(s => s.iso === iso).reduce((a, s) => a + s.km, 0);
    const dates = [...(dateMap.get(iso) || [])].sort();
    const eur = (amount: number) => toEur(amount, c?.currency || "EUR");
    let cover: Cover | null = null, unknownPrice = false;
    if (c?.products?.length) {
      cover = cheapestCover(dates, c.products, input.vehicle, input.today);
      if (!cover) unknownPrice = c.products.every(p => p.price(input.vehicle) == null) && !(c.code === "CZ" && input.vehicle.kind === "moto");
      if (cover) { const e = eur(cover.total); if (e == null) partial = true; else totalEur += e; }
      else if (unknownPrice) partial = true;
    } else if (!c || c.system === "toll") partial = partial || c?.system === "toll";
    const myTolls = tolls.filter(t => c?.sectionTolls?.includes(t));
    for (const t of myTolls) {
      const p = input.vehicle.kind === "moto" ? t.priceMoto ?? t.priceCar : t.priceCar;
      const e = p == null ? null : eur(p * trips);
      if (e == null) partial = true; else totalEur += e;
    }
    return { iso, country: c, name: c?.name || OTHER_COUNTRY_NAMES[iso] || "Друга държава", km, dates, cover, unknownPrice, tolls: myTolls, eur };
  });
  return { plans, totalEur, partial, segments: segs };
}

export { COUNTRIES };
