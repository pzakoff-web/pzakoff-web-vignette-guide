import { describe, it, expect } from "vitest";
import { cheapestCover, windowFor } from "./cover";
import { COUNTRIES } from "@/data/countries";
import { dateAt } from "./trip";
import type { Vehicle } from "@/data/types";

const car: Vehicle = { kind: "car", powertrain: "standard", euroClass: "euro4_5" };
const c = (code: string) => COUNTRIES.find(x => x.code === code)!;
const TODAY = "2026-11-26";

describe("windowFor", () => {
  it("месеци: до деня преди същата дата", () => {
    expect(windowFor({ type: "months", months: 1 }, "2027-01-31")).toEqual({ start: "2027-01-31", end: "2027-02-27" });
    expect(windowFor({ type: "months", months: 2 }, "2026-12-15")).toEqual({ start: "2026-12-15", end: "2027-02-14" });
  });
  it("швейцарска година", () => {
    expect(windowFor({ type: "swissYear" }, "2026-12-20")).toEqual({ start: "2026-12-01", end: "2028-01-31" });
    expect(windowFor({ type: "swissYear" }, "2027-01-10")).toEqual({ start: "2026-12-01", end: "2028-01-31" });
  });
  it("уикенд: само събота/неделя", () => {
    expect(windowFor({ type: "weekend" }, "2026-11-28")).toEqual({ start: "2026-11-27", end: "2026-11-29" }); // събота
    expect(windowFor({ type: "weekend" }, "2026-11-27")).toBeNull(); // петък
  });
});

describe("cheapestCover", () => {
  it("Австрия: два транзита с 12 дни разлика → 2 × 1-дневна (19,20) е по-евтино от 2 месеца (32)", () => {
    const r = cheapestCover(["2026-12-20", "2027-01-01"], c("AT").products!, car, TODAY)!;
    expect(r.total).toBeCloseTo(19.2);
    expect(r.purchases.map(p => p.product.id)).toEqual(["1d", "1d"]);
  });
  it("Австрия: транзит с 5 дни разлика → една 10-дневна (12,80)", () => {
    const r = cheapestCover(["2026-12-20", "2026-12-24"], c("AT").products!, car, TODAY)!;
    expect(r.purchases.map(p => p.product.id)).toEqual(["10d"]);
  });
  it("Австрия: 40 поредни дни от 3.12 → 2-месечна, но с флаг за 18-те дни (купена днес онлайн)", async () => {
    const { range } = await import("./dates");
    const r = cheapestCover(range("2026-12-03", "2027-01-11"), c("AT").products!, car, TODAY)!;
    expect(r.purchases.map(p => p.product.id)).toEqual(["2m"]);
    expect(r.purchases[0].delayed).toBe(true);
    const later = cheapestCover(range("2027-01-03", "2027-02-11"), c("AT").products!, car, TODAY)!;
    expect(later.purchases[0].delayed).toBe(false);
  });
  it("България: събота и неделя → уикенд (6,60)", () => {
    const r = cheapestCover(["2026-11-28", "2026-11-29"], c("BG").products!, car, TODAY)!;
    expect(r.purchases.map(p => p.product.id)).toEqual(["we"]);
  });
  it("Швейцария: една винетка за декември и януари", () => {
    const r = cheapestCover(["2026-12-20", "2027-01-05"], c("CH").products!, car, TODAY)!;
    expect(r.total).toBe(40);
    expect(r.purchases).toHaveLength(1);
  });
  it("Чехия: мотор → няма продукт", () => {
    expect(cheapestCover(["2026-12-20"], c("CZ").products!, { ...car, kind: "moto" }, TODAY)).toBeNull();
  });
  it("Румъния: цена по екокласа", () => {
    expect(cheapestCover(["2026-12-20"], c("RO").products!, { ...car, euroClass: "euro0_3" }, TODAY)!.total).toBe(29);
    expect(cheapestCover(["2026-12-20"], c("RO").products!, { ...car, powertrain: "electric" }, TODAY)!.total).toBe(20);
  });
});

describe("dateAt", () => {
  it("12 ч шофиране от 6:00 → нощувка, вторият ден", () => {
    expect(dateAt("2026-12-20", 6, 3 * 3600)).toBe("2026-12-20");
    expect(dateAt("2026-12-20", 6, 11 * 3600)).toBe("2026-12-21");
  });
  it("тръгване в 20:00, 5 ч → след полунощ", () => {
    expect(dateAt("2026-12-20", 20, 5 * 3600)).toBe("2026-12-21");
  });
});

describe("английски текстове", () => {
  it("всяка държава има превод и масивите са със същата дължина", async () => {
    const { EN } = await import("@/data/countries.en");
    for (const c of COUNTRIES) {
      const e = EN[c.code];
      expect(e, c.code).toBeDefined();
      expect(e.traps.length, c.code + " traps").toBe(c.traps.length);
      expect(e.facts.length, c.code + " facts").toBe(c.facts.length);
      expect(e.official.length, c.code + " official").toBe(c.official.length);
      expect((e.tollInfo || []).length, c.code + " tollInfo").toBe((c.tollInfo || []).length);
      for (const p of c.products || []) expect(e.products?.[p.id]?.label, c.code + " " + p.id).toBeTruthy();
      for (const t of c.sectionTolls || []) expect(e.sectionTolls?.[t.id]?.name, c.code + " " + t.id).toBeTruthy();
      if (c.statusNote) expect(e.statusNote, c.code + " statusNote").toBeTruthy();
      if (c.pricesValidFor) expect(e.pricesValidFor, c.code + " pricesValidFor").toBeTruthy();
      if (c.distanceToll) expect(e.distanceBasis, c.code + " distanceBasis").toBeTruthy();
      for (const p of c.products || []) if (p.note) expect(e.products?.[p.id]?.note, c.code + " note " + p.id).toBeTruthy();
    }
  });
});

describe("такси по километър", () => {
  it("брои само номерата на магистралите, по държави", async () => {
    const { loadBorders } = await import("./geo");
    const { tollKmByCountry } = await import("./trip");
    await loadBorders();
    // всяка стъпка: отсечка ~0,1° (≈ 8–11 km) около дадена точка
    const seg = (lon: number, lat: number, ref: string) => ({ ref, coords: [[lon, lat], [lon + 0.1, lat]] as [number, number][] });
    const r = { coords: [], cumSec: [], cumKm: [], distanceKm: 0, durationH: 0, steps: [
      seg(15.9, 45.8, "A3; E 70"),   // Хърватия
      seg(15.9, 45.5, "D1"),         // Хърватия, не е магистрала
      seg(20.4, 44.0, "A1; E 75"),   // Сърбия
      seg(26.5, 41.68, "O-3"),       // Турция
      seg(22.9, 40.6, "Α1"),         // Гърция — гръцко Α
      seg(21.5, 41.9, "А1"),         // С. Македония — кирилско А
      seg(11.5, 48.1, "A9"),         // Германия — няма такса
    ] };
    const m = tollKmByCountry(r as never);
    for (const iso of ["191", "688", "792", "300", "807"]) expect(m.get(iso), iso).toBeGreaterThan(7);
    expect(m.has("276")).toBe(false);
    expect(m.get("191")!).toBeLessThan(10);
  });
});

describe("линкове за покупка", () => {
  it("Чехия: вид винетка, държава и номер в адреса", async () => {
    const { buyLink } = await import("./buy");
    const cz = c("CZ"), p = cz.products!.find(x => x.id === "10d")!;
    const l = buyLink(cz, p, car, { plate: "CB 1234 AB", plateCountry: "BG" });
    expect(l.level).toBe("prefilled");
    expect(l.url).toContain("chargeTypeId=9e5b7da5-b131-4bca-8d85-11c2b672948b");
    expect(l.url).toContain("countryId=15a65497-4577-4918-bf38-24dadb2b0fa0");
    expect(l.url).toContain("licensePlate=CB1234AB");
    // кирилските букви от българските номера се превръщат в латиница
    expect(buyLink(cz, p, car, { plate: "СВ 1234 АВ", plateCountry: "BG" }).url).toContain("licensePlate=CB1234AB");
    expect(buyLink(cz, p, car, { plate: "Ж 12", plateCountry: "BG" }).level).toBe("product");
  });
  it("България: директно до вида винетка", async () => {
    const { buyLink } = await import("./buy");
    const bg = c("BG");
    expect(buyLink(bg, bg.products!.find(x => x.id === "we")!, car).url).toBe("https://web.bgtoll.bg/Evignette/Create?vignetteTypeID=5");
  });
});

describe("18-те дни в Австрия (официален банер: купена на 26.11 → важи от 14.12)", () => {
  it("начало 14.12 при покупка на 26.11 не е забавено, 13.12 е", async () => {
    const { range } = await import("./dates");
    const from = (s: string) => cheapestCover(range(s, "2027-01-20"), c("AT").products!, car, "2026-11-26")!.purchases[0];
    expect(from("2026-12-14").delayed).toBe(false);
    expect(from("2026-12-13").delayed).toBe(true);
  });
});

describe("еднопосочни такси (Дунав мост Русе)", () => {
  it("плаща се само България → Румъния", async () => {
    const { tollPasses } = await import("./trip");
    const ruse = c("BG").sectionTolls!.find(t => t.id === "ruse")!;
    expect(tollPasses(ruse, ["100", "642", "348"], 1)).toBe(1);   // Варна → Унгария
    expect(tollPasses(ruse, ["348", "642", "100"], 1)).toBe(0);   // Будапеща → Варна
    expect(tollPasses(ruse, ["100", "642"], 2)).toBe(1);          // отиване и връщане
    const vidin = c("BG").sectionTolls!.find(t => t.id === "vidin")!;
    expect(tollPasses(vidin, ["100", "642"], 2)).toBe(2);
  });
});
