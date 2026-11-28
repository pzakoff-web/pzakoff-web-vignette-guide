// Оптимално зареждане по маршрута („задачата за бензиностанциите“).
// Горивото може да се зареди навсякъде; цената зависи от държавата.
// Алчният алгоритъм е оптимален за път: от текущата точка, ако в обсега на резервоара има
// по-евтино място — зареди колкото да стигнеш до него; иначе зареди догоре и продължи
// до най-евтиното място в обсега.

export interface PathPoint { km: number; iso: string; leg: 0 | 1 } // leg 0 = отиване, 1 = връщане
export interface RefuelStop {
  iso: string; leg: 0 | 1; liters: number; price: number | null;
  nextIso?: string;      // зареждането е преди границата с тази държава
  full: boolean;         // догоре
  km: number;            // км от тръгването на съответния курс
}
export interface RefuelPlan { stops: RefuelStop[]; cost: number; naiveCost: number; unknownPrice: boolean; liters: number }

export interface RefuelOpts { tank: number; l100: number; startFuel: number; reserve: number }

export function planRefuel(pts: PathPoint[], priceOf: (iso: string) => number | null, o: RefuelOpts): RefuelPlan {
  const n = pts.length - 1;
  if (n < 1) return { stops: [], cost: 0, naiveCost: 0, unknownPrice: false, liters: 0 };
  const k = o.l100 / 100;
  const R = Math.min(o.reserve, o.tank * 0.5);
  const usable = o.tank - R;
  const known = [...new Set(pts.map(p => priceOf(p.iso)).filter((x): x is number => x != null))];
  const avg = known.length ? known.reduce((a, b) => a + b, 0) / known.length : 0;
  const P = (i: number) => priceOf(pts[i].iso) ?? Infinity;   // непозната цена — „последен избор“
  const cost = (i: number, l: number) => l * (priceOf(pts[i].iso) ?? avg);
  const x = (i: number) => pts[i].km;
  const xEnd = x(n);

  const buys: { i: number; l: number; full: boolean }[] = [];
  let fuel = Math.min(o.startFuel, o.tank), i = 0, total = 0, unknown = false;
  const buy = (at: number, l: number, full: boolean) => {
    if (l <= 0.05) return;
    buys.push({ i: at, l, full }); total += cost(at, l);
    if (priceOf(pts[at].iso) == null) unknown = true;
  };

  let guard = 0;
  while (i < n && guard++ < 100000) {
    const needEnd = (xEnd - x(i)) * k + R;
    if (fuel >= needEnd - 1e-9) break;
    let cheaper = -1, best = -1, j = i + 1;
    for (; j <= n && (x(j) - x(i)) * k <= usable + 1e-9; j++) {
      if (cheaper < 0 && P(j) < P(i)) cheaper = j;
      if (best < 0 || P(j) <= P(best)) best = j;   // при равна цена — по-далечната
    }
    if (best < 0) best = i + 1;                     // отсечка по-дълга от обсега (не би трябвало)
    if (cheaper >= 0) {
      const need = (x(cheaper) - x(i)) * k + R - fuel;
      if (need > 0) { buy(i, need, false); fuel += need; }
      fuel -= (x(cheaper) - x(i)) * k; i = cheaper; continue;
    }
    if (needEnd <= o.tank + 1e-9 && P(best) > P(i)) { buy(i, needEnd - fuel, false); fuel = needEnd; break; }
    if (P(best) === P(i) && best > i) {
      // Същата цена и по-нататък (обикновено пред границата) — отлагаме: купуваме само колкото да стигнем дотам.
      // Цената е еднаква, а спирката е една и на удобно място.
      const need = (x(best) - x(i)) * k + R - fuel;
      if (need > 0) { buy(i, need, false); fuel += need; }
      fuel -= (x(best) - x(i)) * k; i = best; continue;
    }
    if (needEnd <= o.tank + 1e-9) { buy(i, needEnd - fuel, false); fuel = needEnd; break; }
    buy(i, o.tank - fuel, true); fuel = o.tank;
    fuel -= (x(best) - x(i)) * k; i = best;
  }

  // Сравнение: зареждате догоре там, където ви остане само резервата
  // (неизползваното гориво накрая не се брои — иначе сравнението е нечестно)
  let naive = 0, f = Math.min(o.startFuel, o.tank), lastPrice = avg;
  for (let m = 1; m <= n; m++) {
    const d = (x(m) - x(m - 1)) * k;
    if (f - d < R) { lastPrice = priceOf(pts[m - 1].iso) ?? avg; naive += (o.tank - f) * lastPrice; f = o.tank; }
    f -= d;
  }
  if (naive > 0 && f > R) naive -= (f - R) * lastPrice;

  // Обединяваме покупките в една спирка за всяко преминаване през държава
  const visit: number[] = [];
  for (let m = 0; m <= n; m++) visit[m] = m === 0 ? 0 : visit[m - 1] + (pts[m].iso !== pts[m - 1].iso || pts[m].leg !== pts[m - 1].leg ? 1 : 0);
  const legStartKm = (leg: number) => pts.find(q => q.leg === leg)!.km;
  const stops: RefuelStop[] = [];
  let lastVisit = -1;
  for (const b of buys) {
    const p = pts[b.i];
    let e = b.i; while (e < n && visit[e + 1] === visit[b.i]) e++;   // последната точка от това преминаване
    const nextIso = e < n && pts[e + 1].leg === p.leg && x(e) - p.km < 25 ? pts[e + 1].iso : undefined;
    const km = p.km - legStartKm(p.leg);
    if (visit[b.i] === lastVisit && !(stops[stops.length - 1].liters + b.l <= o.tank + 0.5)) lastVisit = -1;
    // в една държава слепваме покупките, докато се побират в резервоара; иначе е ново зареждане
    if (visit[b.i] === lastVisit && stops[stops.length - 1].liters + b.l <= o.tank + 0.5) {
      const last = stops[stops.length - 1];
      last.liters += b.l; last.full = b.full || last.full; last.km = km; last.nextIso = nextIso ?? last.nextIso;
    } else {
      stops.push({ iso: p.iso, leg: p.leg, liters: b.l, price: priceOf(p.iso), nextIso, full: b.full, km });
      lastVisit = visit[b.i];
    }
  }
  return { stops, cost: total, naiveCost: naive, unknownPrice: unknown, liters: buys.reduce((a, b) => a + b.l, 0) };
}
