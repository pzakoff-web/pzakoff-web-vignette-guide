// Цените на горивата от седмичния бюлетин на Еврокомисията (Weekly Oil Bulletin), при всеки build.
// При грешка остава последният записан файл.
import { writeFileSync } from "node:fs";
import readXlsxFile from "read-excel-file/node";

const SRC = "https://energy.ec.europa.eu/document/download/264c2d0f-f161-4ea3-a777-78faae59bea0_en";
const PAGE = "https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en";
// име в бюлетина → ISO numeric (както в world-atlas)
const ISO = {
  Austria: "040", Belgium: "056", Bulgaria: "100", Croatia: "191", Cyprus: "196", Czechia: "203", Denmark: "208",
  Estonia: "233", Finland: "246", France: "250", Germany: "276", Greece: "300", Hungary: "348", Ireland: "372",
  Italy: "380", Latvia: "428", Lithuania: "440", Luxembourg: "442", Malta: "470", Netherlands: "528", Poland: "616",
  Portugal: "620", Romania: "642", Slovakia: "703", Slovenia: "705", Spain: "724", Sweden: "752",
};
const out = new URL("../src/data/fuel.json", import.meta.url);
try {
  const r = await fetch(SRC, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const rows = await readXlsxFile(Buffer.from(await r.arrayBuffer()));
  const date = rows[1][0] instanceof Date ? rows[1][0].toISOString().slice(0, 10) : null;
  if (!date) throw new Error("няма дата");
  const prices = {};
  for (const row of rows.slice(2)) {
    const iso = ISO[String(row[0] || "").trim()];
    if (!iso) continue;
    const l = v => (typeof v === "number" && v > 0 ? Math.round(v) / 1000 : null); // €/1000 l → €/l
    prices[iso] = { petrol: l(row[1]), diesel: l(row[2]), lpg: l(row[6]) };
  }
  if (Object.keys(prices).length < 20) throw new Error("твърде малко държави");
  writeFileSync(out, JSON.stringify({ date, source: PAGE, prices }, null, 2) + "\n");
  console.log("Цени на горивата от", date, "—", Object.keys(prices).length, "държави");
} catch (e) {
  console.warn("Цените на горивата не са обновени:", e.message);
}
