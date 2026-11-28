import { describe, it, expect } from "vitest";
import { planRefuel, type PathPoint } from "./refuel";

// права линия: държави с дължини в km, точки на всеки 2 km
function path(parts: [string, number][], leg: 0 | 1 = 0, startKm = 0): PathPoint[] {
  const out: PathPoint[] = []; let km = startKm;
  parts.forEach(([iso, len], idx) => {
    const steps = Math.round(len / 2);
    for (let s = idx === 0 ? 0 : 1; s <= steps; s++) out.push({ km: km + s * 2, iso, leg });
    km += steps * 2;
  });
  return out;
}
const price: Record<string, number> = { DE: 1.6, CZ: 1.8, AT: 1.7, PL: 1.5 };
const P = (iso: string) => price[iso] ?? null;
const opts = { tank: 50, l100: 7, startFuel: 50, reserve: 5 };

describe("оптимално зареждане", () => {
  it("Германия по-евтина от Чехия → в Германия преди границата, в Чехия само колкото трябва", () => {
    // 500 km Германия с пълен резервоар, после 400 km Чехия: зарежда точно колкото да стигне
    const r = planRefuel(path([["DE", 500], ["CZ", 400]]), P, opts);
    expect(r.stops).toHaveLength(1);
    expect(r.stops[0]).toMatchObject({ iso: "DE", nextIso: "CZ" });
    expect(r.stops[0].liters).toBeCloseTo(18, 0); // 400 km × 7 л + 5 л резерва − 15 л в резервоара
  });
  it("дълга Чехия → догоре в Германия преди границата, после минимум в Чехия", () => {
    const r = planRefuel(path([["DE", 500], ["CZ", 1000]]), P, opts);
    expect(r.stops[0]).toMatchObject({ iso: "DE", nextIso: "CZ", full: true });
    expect(r.stops.filter(s => s.iso === "CZ").length).toBeGreaterThan(0);
    expect(r.cost).toBeLessThan(r.naiveCost);
  });
  it("Чехия по-скъпа, Полша по-евтина → в Чехия само до Полша", () => {
    const r = planRefuel(path([["CZ", 300], ["PL", 400]]), P, { ...opts, startFuel: 20 });
    const cz = r.stops.filter(s => s.iso === "CZ").reduce((a, s) => a + s.liters, 0);
    expect(cz).toBeCloseTo(300 * 0.07 + 5 - 20, 0);
    expect(r.stops.some(s => s.iso === "PL")).toBe(true);
  });
  it("с пълен резервоар и кратък път — няма зареждане", () => {
    expect(planRefuel(path([["DE", 300]]), P, opts).stops).toHaveLength(0);
  });
  it("непозната цена (извън ЕС) — догоре преди нея, там само при нужда", () => {
    const r = planRefuel(path([["DE", 100], ["RS", 900], ["CZ", 100]]), P, opts);
    expect(r.stops[0]).toMatchObject({ iso: "DE", full: true, nextIso: "RS" });
    expect(r.stops.some(s => s.iso === "RS")).toBe(true);
    expect(r.unknownPrice).toBe(true);
  });
});

describe("една спирка на държава", () => {
  it("дълга евтина държава → едно зареждане пред границата, не по-голямо от резервоара", () => {
    // 1200 km в евтината Полша, после скъпата Германия
    const r = planRefuel(path([["PL", 1200], ["DE", 300]]), P, { ...opts, startFuel: 50 });
    for (const s of r.stops) expect(s.liters).toBeLessThanOrEqual(50 + 1e-6);
    const pl = r.stops.filter(s => s.iso === "PL");
    expect(pl[pl.length - 1].nextIso).toBe("DE");
  });
});
