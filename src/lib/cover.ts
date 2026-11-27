// Най-евтината комбинация от винетки, която покрива всички дати, в които сте в държавата.
import type { Product, Validity, Vehicle } from "@/data/types";
import { addDays, addMonths, weekday } from "./dates";

export interface Purchase { product: Product; start: string; end: string; price: number; delayed: boolean }
export interface Cover { purchases: Purchase[]; total: number }

/** Период [start, end] на продукт, който трябва да покрие датата `date`; null ако не може. */
export function windowFor(v: Validity, date: string): { start: string; end: string } | null {
  switch (v.type) {
    case "days": return { start: date, end: addDays(date, v.days - 1) };
    case "months": return { start: date, end: addDays(addMonths(date, v.months), -1) };
    case "calendarYear": { const y = date.slice(0, 4); return { start: `${y}-01-01`, end: `${y}-12-31` }; }
    case "swissYear": {
      const y = Number(date.slice(0, 4)) + (date.slice(5, 7) === "12" ? 1 : 0);
      return { start: `${y - 1}-12-01`, end: `${y + 1}-01-31` };
    }
    case "weekend": {
      // Започва в петък; броим консервативно само събота и неделя.
      const wd = weekday(date);
      if (wd === 6) return { start: addDays(date, -1), end: addDays(date, 1) };
      if (wd === 0) return { start: addDays(date, -2), end: date };
      return null;
    }
  }
}

export function cheapestCover(dates: string[], products: Product[], vehicle: Vehicle, today: string): Cover | null {
  const ds = [...new Set(dates)].sort();
  if (!ds.length) return { purchases: [], total: 0 };
  const n = ds.length;
  const best: (Cover | null)[] = Array(n + 1).fill(null);
  best[n] = { purchases: [], total: 0 };
  for (let i = n - 1; i >= 0; i--) {
    for (const p of products) {
      const price = p.price(vehicle);
      if (price == null) continue;
      const w = windowFor(p.validity, ds[i]);
      if (!w) continue;
      let j = i;
      while (j < n && ds[j] <= w.end) j++;
      const rest = best[j];
      if (!rest) continue;
      const total = price + rest.total;
      // при равна цена предпочитаме по-малко покупки
      if (!best[i] || total < best[i]!.total - 1e-9 || (Math.abs(total - best[i]!.total) < 1e-9 && rest.purchases.length + 1 < best[i]!.purchases.length)) {
        const delayed = !!p.onlineConsumerDelayDays && w.start < addDays(today, p.onlineConsumerDelayDays);
        best[i] = { purchases: [{ product: p, start: w.start, end: w.end, price, delayed }, ...rest.purchases], total };
      }
    }
  }
  return best[0];
}
